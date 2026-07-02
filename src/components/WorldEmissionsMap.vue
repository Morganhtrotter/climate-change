<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as d3 from 'd3'

const chartRef = ref(null)
const tooltipEl = ref(null)
const selectedYear = ref(1880)
const isPlaying = ref(false)

const BREAKDOWN_ORDER = [
    ['co2', 'CO₂', 'Gt CO₂ / yr'],
    ['ch4', 'CH₄', 'Gt CH₄ / yr'],
    ['n2o', 'N₂O', 'Gt N₂O / yr'],
    ['hfcs', 'HFCs (AR5)', 'Gt CO₂-eq / yr'],
    ['pfcs', 'PFCs (AR5)', 'Gt CO₂-eq / yr'],
    ['sf6', 'SF₆', 'Gt SF₆ / yr'],
    ['nf3', 'NF₃', 'Gt NF₃ / yr'],
]

/** IPCC AR5 Table 8.A.1, 100-yr GWP (no climate-carbon feedback). */
const GWP_AR5_100 = {
    co2: 1,
    ch4: 28,
    n2o: 265,
    sf6: 22800,
    nf3: 16100,
    hfcs: 1,
    pfcs: 1,
}

/** PRIMAP rows that are regional/group aggregates, not single countries—counting them in sums would double-count members already listed separately (e.g. LDC). */
const EXCLUDED_AGGREGATE_AREAS = new Set(['LDC', 'ANT'])

let geoFeatures = []
/** Reactive so computeds refresh after async load (plain `let` would stay stale until `selectedYear` changes). */
const valuesByYear = ref({})
/** Official global total by year (Gg CO₂-eq / yr), same series as `GreenhouseGasChart`. */
const earthOfficialGgByYear = ref({})
let iso3ToContinent = {}
let iso3ToName = {}
const availableYears = ref([])
let resizeHandler = null
let countriesLayer = null
let colorScale = null
let zoomBehavior = null
let svgSelection = null
let playTimer = null

function ggToGt(gg) {
    return gg / 1e6
}

function fmtGt(v, digits = 2) {
    if (v == null || Number.isNaN(v)) return '—'
    const a = Math.abs(v)
    if (a > 0 && a < 0.0001) return v.toExponential(1)
    return v.toFixed(digits)
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

function breakdownGgToGgCo2e(key, gg) {
    const gwp = GWP_AR5_100[key]
    return gwp == null ? gg : gg * gwp
}

const yearLabel = computed(() => String(selectedYear.value))
const minYear = computed(() => (availableYears.value.length ? availableYears.value[0] : 1880))
const maxYear = computed(() =>
    availableYears.value.length ? availableYears.value[availableYears.value.length - 1] : 2023,
)
const currentYearValues = computed(() => valuesByYear.value[String(selectedYear.value)] ?? {})
const earthTotalGt = computed(() => {
    const official = earthOfficialGgByYear.value[selectedYear.value]
    if (official != null && Number.isFinite(official)) return ggToGt(official)
    return Object.entries(currentYearValues.value)
        .filter(([iso3]) => !EXCLUDED_AGGREGATE_AREAS.has(iso3))
        .reduce((sum, [, row]) => sum + ggToGt(row?.total ?? 0), 0)
})
const continentTotals = computed(() => {
    const totals = new Map([
        ['Africa', 0],
        ['Asia', 0],
        ['Europe', 0],
        ['North America', 0],
        ['South America', 0],
        ['Oceania', 0],
    ])
    for (const [iso3, row] of Object.entries(currentYearValues.value)) {
        if (EXCLUDED_AGGREGATE_AREAS.has(iso3)) continue
        const continent = iso3ToContinent[iso3] ?? 'Other'
        const prior = totals.get(continent) ?? 0
        totals.set(continent, prior + ggToGt(row?.total ?? 0))
    }
    return Array.from(totals.entries())
        .map(([name, totalGt]) => ({ name, totalGt }))
        .filter((row) => row.totalGt > 0)
})
const topCountries = computed(() =>
    Object.entries(currentYearValues.value)
        .filter(([iso3]) => !EXCLUDED_AGGREGATE_AREAS.has(iso3))
        .map(([iso3, row]) => ({
            iso3,
            name: iso3ToName[iso3] ?? iso3,
            totalGt: ggToGt(row?.total ?? 0),
        }))
        .filter((row) => row.totalGt > 0)
        .sort((a, b) => b.totalGt - a.totalGt)
        .slice(0, 5),
)

function getCountryRecord(feature) {
    const iso3 = feature?.id
    if (!iso3) return null
    return valuesByYear.value[String(selectedYear.value)]?.[iso3] ?? null
}

function updateFills() {
    if (!countriesLayer || !colorScale) return
    countriesLayer
        .selectAll('path.country')
        .attr('fill', (feature) => {
            const record = getCountryRecord(feature)
            const total = record?.total
            if (total == null || total <= 0) return 'var(--color-background-mute)'
            return colorScale(total)
        })
        .attr('opacity', (feature) => (getCountryRecord(feature) ? 1 : 0.55))
}

function positionTooltip(event) {
    const tooltip = tooltipEl.value
    if (!tooltip) return
    const offset = 12
    const vw = window.innerWidth
    const vh = window.innerHeight
    const rect = tooltip.getBoundingClientRect()
    let left = event.clientX + offset
    let top = event.clientY + offset
    if (left + rect.width > vw - 8) left = event.clientX - rect.width - offset
    if (top + rect.height > vh - 8) top = event.clientY - rect.height - offset
    tooltip.style.left = `${Math.max(8, left)}px`
    tooltip.style.top = `${Math.max(8, top)}px`
}

function updateTooltip(event, feature) {
    const tooltip = tooltipEl.value
    if (!tooltip) return

    const countryName = feature?.properties?.name || feature?.id || 'Unknown'
    const record = getCountryRecord(feature)
    if (!record) {
        tooltip.innerHTML = `
            <div class="tooltip-top-row">
                <div class="tooltip-ghg-main">
                    <span class="tooltip-map-area">${escapeHtml(countryName)}</span>
                    <span class="tooltip-total">No reported value for this year</span>
                </div>
                <span class="tooltip-year">${escapeHtml(String(selectedYear.value))}</span>
            </div>
        `
        positionTooltip(event)
        return
    }

    const totalGt = ggToGt(record.total)
    const rows = BREAKDOWN_ORDER.map(([key, sym]) => {
        const raw = record.breakdown?.[key]
        if (raw == null) return ''
        const gtCo2e = ggToGt(breakdownGgToGgCo2e(key, raw))
        return `<li><span class="tt-gas">${escapeHtml(sym)}</span> <span class="tt-co2e">${escapeHtml(fmtGt(gtCo2e))} Gt CO₂-eq / yr</span></li>`
    }).join('')

    tooltip.innerHTML = `
        <div class="tooltip-top-row">
            <div class="tooltip-ghg-main">
                <span class="tooltip-map-area">${escapeHtml(countryName)}</span>
                <span class="tooltip-total">${escapeHtml(fmtGt(totalGt))} Gt CO₂-eq / yr</span>
                <span class="tooltip-sub">By gas</span>
                <ul class="tooltip-breakdown">${rows}</ul>
            </div>
            <span class="tooltip-year">${escapeHtml(String(selectedYear.value))}</span>
        </div>
    `
    positionTooltip(event)
}

function renderMap() {
    if (!chartRef.value || !geoFeatures.length) return
    d3.select(chartRef.value).selectAll('*').remove()

    const width = Math.max(360, chartRef.value.clientWidth)
    const height = Math.max(320, Math.round(width * 0.52))

    const svg = d3
        .select(chartRef.value)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('width', '100%')
        .attr('height', '100%')
        .style('max-width', '100%')
        .style('height', 'auto')

    const projection = d3.geoNaturalEarth1()
    projection.fitExtent(
        [
            [8, 8],
            [width - 8, height - 8],
        ],
        { type: 'FeatureCollection', features: geoFeatures },
    )
    const path = d3.geoPath(projection)

    const zoomLayer = svg.append('g').attr('class', 'zoom-layer')
    countriesLayer = zoomLayer.append('g').attr('class', 'countries-layer')
    countriesLayer
        .selectAll('path')
        .data(geoFeatures)
        .join('path')
        .attr('class', 'country')
        .attr('d', (feature) => path(feature))
        .attr('stroke', 'var(--color-border)')
        .attr('stroke-width', 0.55)
        .attr('vector-effect', 'non-scaling-stroke')
        .on('mouseenter', (event, feature) => {
            countriesLayer.selectAll('path.country').attr('stroke-width', 0.55)
            d3.select(event.currentTarget)
                .attr('stroke', 'var(--color-border)')
                .attr('stroke-width', 1.8)
                .raise()
            tooltipEl.value?.classList.add('visible')
            updateTooltip(event, feature)
        })
        .on('mousemove', (event, feature) => updateTooltip(event, feature))
        .on('mouseleave', (event) => {
            d3.select(event.currentTarget).attr('stroke', 'var(--color-border)').attr('stroke-width', 0.55)
            tooltipEl.value?.classList.remove('visible')
        })

    svg.on('mouseleave', () => {
        countriesLayer.selectAll('path.country').attr('stroke-width', 0.55)
        tooltipEl.value?.classList.remove('visible')
    })

    updateFills()

    zoomBehavior = d3
        .zoom()
        .scaleExtent([1, 8])
        .translateExtent([
            [0, 0],
            [width, height],
        ])
        .on('zoom', (event) => {
            zoomLayer.attr('transform', event.transform)
        })

    svg.call(zoomBehavior)
    svgSelection = svg
}

function zoomIn() {
    if (!svgSelection || !zoomBehavior) return
    svgSelection.transition().duration(180).call(zoomBehavior.scaleBy, 1.3)
}

function zoomOut() {
    if (!svgSelection || !zoomBehavior) return
    svgSelection.transition().duration(180).call(zoomBehavior.scaleBy, 1 / 1.3)
}

function stopPlayback() {
    if (playTimer) {
        clearInterval(playTimer)
        playTimer = null
    }
    isPlaying.value = false
}

function startPlayback() {
    if (!availableYears.value.length || selectedYear.value >= maxYear.value) {
        selectedYear.value = maxYear.value
        return
    }
    stopPlayback()
    isPlaying.value = true
    playTimer = setInterval(() => {
        if (selectedYear.value >= maxYear.value) {
            selectedYear.value = maxYear.value
            stopPlayback()
            return
        }
        selectedYear.value += 1
    }, 700)
}

function togglePlayback() {
    if (isPlaying.value) {
        stopPlayback()
    } else {
        startPlayback()
    }
}

onMounted(async () => {
    const base = import.meta.env.BASE_URL
    const [worldData, emissionsData, earthPayload] = await Promise.all([
        fetch(`${base}data/world.geojson`).then((r) => r.json()),
        fetch(`${base}data/country-ghg-annual.json`).then((r) => r.json()),
        fetch(`${base}data/earth-ghg-annual.json`).then((r) => r.json()),
    ])

    geoFeatures = worldData?.features ?? []
    valuesByYear.value = emissionsData?.valuesByYear ?? {}
    earthOfficialGgByYear.value = Object.fromEntries(
        (earthPayload?.series ?? []).map((row) => [row.year, row.total]),
    )
    iso3ToContinent = emissionsData?.meta?.iso3ToContinent ?? {}
    iso3ToName = Object.fromEntries(
        geoFeatures.map((feature) => [feature?.id, feature?.properties?.name || feature?.id]),
    )
    availableYears.value = emissionsData?.years ?? []

    if (availableYears.value.length) {
        const years = availableYears.value
        const defaultYear = 1880
        const match = years.find((y) => Number(y) === defaultYear)
        selectedYear.value = match != null ? Number(match) : Number(years[0])
    }

    const totals = []
    for (const year of availableYears.value) {
        const byCountry = valuesByYear.value[String(year)] || {}
        for (const countryValue of Object.values(byCountry)) {
            const total = countryValue?.total
            if (total != null && total > 0) totals.push(total)
        }
    }
    const minPositive = d3.min(totals) ?? 1
    const maxTotal = d3.max(totals) ?? 1
    colorScale = d3.scaleSequentialLog(d3.interpolateYlOrRd).domain([Math.max(1, minPositive), maxTotal])

    const tooltip = document.createElement('div')
    tooltip.setAttribute('class', 'chart-tooltip chart-tooltip--ghg')
    tooltip.setAttribute('role', 'tooltip')
    document.body.appendChild(tooltip)
    tooltipEl.value = tooltip

    renderMap()
    resizeHandler = () => renderMap()
    window.addEventListener('resize', resizeHandler)
})

watch(selectedYear, () => {
    updateFills()
    if (selectedYear.value >= maxYear.value && isPlaying.value) {
        stopPlayback()
    }
})

onBeforeUnmount(() => {
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler)
    }
    if (tooltipEl.value && tooltipEl.value.parentNode) {
        tooltipEl.value.remove()
    }
    stopPlayback()
})
</script>

<template>
    <figure class="relative m-0 w-full newsprint-texture" aria-label="Country-level greenhouse gas emissions world map">
        <div class="flex items-stretch max-[720px]:flex-col">
            <aside
                class="panel-newsprint flex max-w-80 flex-[0_0_min(280px,34%)] flex-col self-stretch max-[720px]:w-full max-[720px]:max-w-none max-[720px]:flex-none max-[720px]:max-h-64 max-[720px]:overflow-y-auto"
            >
                <div class="mb-2.5 flex items-center justify-between gap-3">
                    <span class="year-label pl-1 font-mono text-3xl font-bold leading-none">{{ yearLabel }}</span>
                    <button
                        type="button"
                        class="btn-ghost shrink-0"
                        :aria-label="isPlaying ? 'Pause year playback' : 'Play year playback'"
                        @click="togglePlayback"
                    >
                        {{ isPlaying ? 'Pause' : 'Play' }}
                    </button>
                </div>
                <div class="newsprint-boxes-container flex min-h-0 flex-1 flex-col gap-2">
                    <div class="border border-newsprint-fg bg-newsprint-bg">
                        <span class="label-meta block border-b border-newsprint-fg px-2 py-1.5"
                            >EARTH total</span
                        >
                        <strong class="earth-total-value block px-2 py-2 font-mono text-lg">{{
                            fmtGt(earthTotalGt)
                        }}
                            Gt CO₂-eq/yr</strong>
                    </div>
                    <div class="border border-newsprint-fg bg-newsprint-bg">
                        <span class="label-meta block border-b border-newsprint-fg px-2 py-1.5"
                            >Continents</span
                        >
                        <ul class="m-0 list-none px-2 py-2">
                            <li
                                v-for="row in continentTotals"
                                :key="row.name"
                                class="flex items-baseline justify-between gap-2 text-sm leading-snug"
                            >
                                <span>{{ row.name }}</span>
                                <strong class="font-mono">{{ fmtGt(row.totalGt) }}</strong>
                            </li>
                        </ul>
                    </div>
                    <div class="border border-newsprint-fg bg-newsprint-bg">
                        <span class="label-meta block border-b border-newsprint-fg px-2 py-1.5"
                            >Top 5 countries</span
                        >
                        <ol class="m-0 list-decimal px-2 py-2 pl-5">
                            <li
                                v-for="row in topCountries"
                                :key="row.iso3"
                                class="mb-1 text-sm leading-snug last:mb-0"
                            >
                                <span class="mr-2">{{ row.name }}</span>
                                <strong class="float-right font-mono">{{ fmtGt(row.totalGt) }}</strong>
                            </li>
                        </ol>
                    </div>
                </div>
            </aside>
            <div class="map-outer flex min-w-0 flex-1 flex-col">
                <div class="mb-3.5 grid shrink-0 gap-1.5">
                    <label for="year-slider" class="sr-only">Year: {{ yearLabel }}</label>
                    <input
                        id="year-slider"
                        v-model.number="selectedYear"
                        type="range"
                        class="w-full cursor-pointer accent-newsprint-fg"
                        :min="minYear"
                        :max="maxYear"
                        step="1"
                    />
                </div>

                <div class="relative min-h-[320px] flex-1">
                    <div ref="chartRef" class="map-container relative w-full h-full min-h-[320px]"></div>
                    <div
                        class="zoom-controls absolute z-2 grid gap-1.5"
                        aria-label="Map zoom controls"
                    >
                        <button
                            type="button"
                            class="btn-ghost h-8 w-8 px-0 font-serif text-lg leading-none"
                            aria-label="Zoom in"
                            @click="zoomIn"
                        >
                            +
                        </button>
                        <button
                            type="button"
                            class="btn-ghost h-8 w-8 px-0 font-serif text-lg leading-none"
                            aria-label="Zoom out"
                            @click="zoomOut"
                        >
                            -
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <figcaption class="mt-3 font-mono text-xs leading-relaxed text-neutral-500">
            <strong class="text-newsprint-fg">Source:</strong>
            PRIMAP-hist v2.6.1 (HISTCR, category
            <code class="font-mono bg-newsprint-muted px-1">M.0.EL</code>, Kyoto basket
            <code class="font-mono bg-newsprint-muted px-1">KYOTOGHG (AR5GWP100)</code>), mapped to ISO3
            countries. Use the year slider to view annual changes in country totals (Gt CO₂-eq / yr).
        </figcaption>
    </figure>
</template>

<style scoped lang="scss">
.map-outer {
    border: 1px solid var(--color-border);
    border-left: none;
    padding: 24px;
}

@media (max-width: 720px) {
    .map-outer {
        border-left: 1px solid var(--color-border);
        border-top: none;
        padding: 16px;
    }
}

.zoom-controls {
    bottom: 0;
    left: 0;
}

.newsprint-boxes-container {
    justify-content: space-between;
}

.year-label, .earth-total-value {
    font-family: 'Roboto Mono', monospace;
}
</style>
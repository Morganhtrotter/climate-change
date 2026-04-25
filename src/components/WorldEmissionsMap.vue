<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as d3 from 'd3'

const chartRef = ref(null)
const tooltipEl = ref(null)
const selectedYear = ref(2023)
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
let valuesByYear = {}
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
const currentYearValues = computed(() => valuesByYear[String(selectedYear.value)] ?? {})
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
    return valuesByYear[String(selectedYear.value)]?.[iso3] ?? null
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
            <span class="tooltip-header">annual</span>
            <span class="tooltip-year">${escapeHtml(String(selectedYear.value))}</span>
            <span class="tooltip-area">Country: ${escapeHtml(countryName)}</span>
            <span class="tooltip-total">No reported value for this year</span>
        `
        positionTooltip(event)
        return
    }

    const totalGt = ggToGt(record.total)
    const rows = BREAKDOWN_ORDER.map(([key, sym, unit]) => {
        const raw = record.breakdown?.[key]
        if (raw == null) return ''
        const gtRaw = ggToGt(raw)
        const gtCo2e = ggToGt(breakdownGgToGgCo2e(key, raw))
        const co2eLabel = `(${fmtGt(gtCo2e)} Gt CO₂-eq/yr)`
        return `<li><span class="tt-gas">${escapeHtml(sym)}</span> <span class="tt-amt">${escapeHtml(fmtGt(gtRaw))}</span> <span class="tt-unit">${escapeHtml(unit)}</span> <span class="tt-co2e">${escapeHtml(co2eLabel)}</span></li>`
    }).join('')

    tooltip.innerHTML = `
        <span class="tooltip-header">annual</span>
        <span class="tooltip-year">${escapeHtml(String(selectedYear.value))}</span>
        <span class="tooltip-area">Country: ${escapeHtml(countryName)}</span>
        <span class="tooltip-total">Total (Kyoto, AR5): ${escapeHtml(fmtGt(totalGt))} Gt CO₂-eq / yr</span>
        <span class="tooltip-sub">By gas</span>
        <ul class="tooltip-breakdown">${rows}</ul>
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
        .attr('height', 'auto')
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
            d3.select(event.currentTarget)
                .attr('stroke', '#ffffff')
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
    valuesByYear = emissionsData?.valuesByYear ?? {}
    earthOfficialGgByYear.value = Object.fromEntries(
        (earthPayload?.series ?? []).map((row) => [row.year, row.total]),
    )
    iso3ToContinent = emissionsData?.meta?.iso3ToContinent ?? {}
    iso3ToName = Object.fromEntries(
        geoFeatures.map((feature) => [feature?.id, feature?.properties?.name || feature?.id]),
    )
    availableYears.value = emissionsData?.years ?? []

    if (availableYears.value.length) {
        selectedYear.value = availableYears.value[availableYears.value.length - 1]
    }

    const totals = []
    for (const year of availableYears.value) {
        const byCountry = valuesByYear[String(year)] || {}
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
    <figure class="world-map" aria-label="Country-level greenhouse gas emissions world map">
        <div class="stats-panel">
            <div class="panel-head">
                <span class="slider-label">Year: {{ yearLabel }}</span>
                <button type="button" class="play-button" :aria-label="isPlaying ? 'Pause year playback' : 'Play year playback'" @click="togglePlayback">
                    {{ isPlaying ? 'Pause' : 'Play' }}
                </button>
            </div>
            <div class="totals-grid">
                <div class="total-card">
                    <span class="total-label">EARTH total</span>
                    <strong class="total-value">{{ fmtGt(earthTotalGt) }} Gt CO₂-eq / yr</strong>
                </div>
                <div class="total-card">
                    <span class="total-label">Continents</span>
                    <ul class="mini-list">
                        <li v-for="row in continentTotals" :key="row.name">
                            <span>{{ row.name }}</span>
                            <strong>{{ fmtGt(row.totalGt) }}</strong>
                        </li>
                    </ul>
                </div>
                <div class="total-card">
                    <span class="total-label">Top 5 countries</span>
                    <ol class="mini-list ranked">
                        <li v-for="row in topCountries" :key="row.iso3">
                            <span>{{ row.name }}</span>
                            <strong>{{ fmtGt(row.totalGt) }}</strong>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
        <div class="map-controls">
            <label for="year-slider" class="slider-label sr-only">Year: {{ yearLabel }}</label>
            <input
                id="year-slider"
                v-model.number="selectedYear"
                type="range"
                class="year-slider"
                :min="minYear"
                :max="maxYear"
                step="1"
            />
        </div>

        <div ref="chartRef" class="map-container"></div>
        <div class="zoom-controls" aria-label="Map zoom controls">
            <button type="button" class="zoom-button" aria-label="Zoom in" @click="zoomIn">+</button>
            <button type="button" class="zoom-button" aria-label="Zoom out" @click="zoomOut">-</button>
        </div>
        <figcaption>
            <strong>Source:</strong>
            PRIMAP-hist v2.6.1 (HISTCR, category <code>M.0.EL</code>, Kyoto basket
            <code>KYOTOGHG (AR5GWP100)</code>), mapped to ISO3 countries. Use the year slider to view
            annual changes in country totals (Gt CO₂-eq / yr).
        </figcaption>
    </figure>
</template>

<style scoped>
.world-map {
    margin: 0;
    width: 100%;
    position: relative;
}

.map-controls {
    display: grid;
    gap: 0.35rem;
    margin-bottom: 0.9rem;
}

.stats-panel {
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 0.75rem;
    margin-bottom: 0.65rem;
    background: var(--color-background-soft);
}

.panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
}

.slider-label {
    font-size: 0.9rem;
    color: var(--color-text);
    font-weight: 600;
}

.play-button {
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 0.3rem 0.65rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text);
    background: var(--color-background);
    cursor: pointer;
}

.play-button:hover {
    border-color: var(--color-text);
}

.totals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
}

.total-card {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.5rem 0.55rem;
    background: var(--color-background);
}

.total-label {
    display: block;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-muted);
    margin-bottom: 0.2rem;
}

.total-value {
    font-size: 0.9rem;
}

.mini-list {
    margin: 0;
    padding: 0;
    list-style: none;
}

.mini-list li {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.45rem;
    font-size: 0.8rem;
    line-height: 1.45;
}

.mini-list.ranked {
    list-style: decimal inside;
    padding-left: 0;
}

.mini-list.ranked li {
    display: list-item;
}

.mini-list.ranked li > span {
    margin-left: 0.2rem;
}

.mini-list.ranked li > strong {
    float: right;
}

.year-slider {
    width: 100%;
    accent-color: var(--color-text);
    cursor: pointer;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.map-container {
    position: relative;
    width: 100%;
    min-height: 320px;
}

.zoom-controls {
    position: absolute;
    left: 0.75rem;
    bottom: 3.25rem;
    display: grid;
    gap: 0.35rem;
    z-index: 2;
}

.zoom-button {
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-background);
    color: var(--color-text);
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
}

.zoom-button:hover {
    border-color: var(--color-text);
}

figcaption {
    margin-top: 0.75rem;
    font-size: 0.8rem;
    color: var(--color-muted);
    line-height: 1.5;
}

figcaption code {
    font-size: 0.78em;
    padding: 0.1em 0.25em;
    border-radius: 4px;
    background: var(--color-background-mute);
}
</style>

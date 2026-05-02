<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as d3 from 'd3'

const chartRef = ref(null)
const tooltipEl = ref(null)

const X_DOMAIN = [1880, 2025]

const BREAKDOWN_ORDER = [
    ['co2', 'CO₂', 'Gt CO₂ / yr'],
    ['ch4', 'CH₄', 'Gt CH₄ / yr'],
    ['n2o', 'N₂O', 'Gt N₂O / yr'],
    ['hfcs', 'HFCs (AR5)', 'Gt CO₂-eq / yr'],
    ['pfcs', 'PFCs (AR5)', 'Gt CO₂-eq / yr'],
    ['sf6', 'SF₆', 'Gt SF₆ / yr'],
    ['nf3', 'NF₃', 'Gt NF₃ / yr'],
]

/** IPCC AR5 Table 8.A.1, 100-yr GWP (no climate–carbon feedback). HFC/PFC rows are already CO₂-eq in PRIMAP. */
const GWP_AR5_100 = {
    co2: 1,
    ch4: 28,
    n2o: 265,
    sf6: 22800,
    nf3: 16100,
    hfcs: 1,
    pfcs: 1,
}

function breakdownGgToGgCo2e(key, gg) {
    const gwp = GWP_AR5_100[key]
    return gwp == null ? gg : gg * gwp
}

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

function nearestByYear(data, year) {
    if (!data.length) return null
    if (year <= data[0].year) return data[0]
    const last = data[data.length - 1]
    if (year >= last.year) return last
    const i = d3.bisector((d) => d.year).right(data, year)
    const d1 = data[i]
    const d0 = data[i - 1]
    return year - d0.year <= d1.year - year ? d0 : d1
}

function renderChart(container, data, baselineGg) {
    if (!container || !data.length) return
    d3.select(container).selectAll('*').remove()

    const margin = { top: 32, right: 24, bottom: 48, left: 56 }
    const width = Math.max(320, container.clientWidth) - margin.left - margin.right
    const height = 360 - margin.top - margin.bottom

    const x = d3.scaleLinear().domain(X_DOMAIN).range([0, width])

    const totalsGt = data.map((d) => ggToGt(d.total))
    const baselineGt = ggToGt(baselineGg)
    const yMinRaw = Math.min(d3.min(totalsGt), baselineGt)
    const yMaxRaw = Math.max(d3.max(totalsGt), baselineGt)
    const pad = (yMaxRaw - yMinRaw) * 0.12 || yMaxRaw * 0.05 || 1
    const y = d3
        .scaleLinear()
        .domain([yMinRaw - pad, yMaxRaw + pad])
        .range([height, 0])

    const line = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(ggToGt(d.total)))
        .curve(d3.curveMonotoneX)

    const svg = d3
        .select(container)
        .append('svg')
        .attr(
            'viewBox',
            `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
        )
        .attr('width', '100%')
        .attr('height', 'auto')
        .style('max-width', '100%')
        .style('height', 'auto')

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const yAxis = d3.axisLeft(y).ticks(6).tickFormat((v) => `${v}`)
    const xAxis = d3.axisBottom(x).ticks(10).tickFormat(d3.format('d'))

    g.append('g').attr('class', 'axis axis-y').call(yAxis)
    g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

    g.append('text')
        .attr('class', 'axis-y-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -44)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Gt CO₂-eq / yr')

    const yBaseline = y(baselineGt)
    const BASELINE_HIT_PX = 10
    const baselineInView =
        baselineGg != null &&
        Number.isFinite(yBaseline) &&
        yBaseline >= 0 &&
        yBaseline <= height
    let baselineLine = null
    let baselineLabel = null
    let refLine1951 = null
    let refLine1980 = null
    let refYearLabel1951 = null
    let refYearLabel1980 = null
    if (baselineInView) {
        baselineLine = g
            .append('line')
            .attr('class', 'baseline-ref')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', yBaseline)
            .attr('y2', yBaseline)
            .attr('stroke-dasharray', '6 4')
    }

    g.append('path')
        .attr('class', 'line')
        .attr('d', line(data))
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-heading)')
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')

    if (baselineInView && baselineLine) {
        baselineLabel = g
            .append('text')
            .attr('class', 'baseline-label')
            .attr('x', width - 4)
            .attr('y', yBaseline - 6)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'auto')
            .attr('visibility', 'hidden')
            .text('1951–1980 average')
        const x1951 = x(1951)
        const x1980 = x(1980)
        refLine1951 = g
            .append('line')
            .attr('class', 'baseline-ref-year')
            .attr('y1', 0)
            .attr('y2', height)
            .attr('x1', x1951)
            .attr('x2', x1951)
            .attr('visibility', 'hidden')
        refLine1980 = g
            .append('line')
            .attr('class', 'baseline-ref-year')
            .attr('y1', 0)
            .attr('y2', height)
            .attr('x1', x1980)
            .attr('x2', x1980)
            .attr('visibility', 'hidden')
        const refYearLabelY = height - 8
        refYearLabel1951 = g
            .append('text')
            .attr('class', 'baseline-ref-year-label')
            .attr('x', x1951 + 4)
            .attr('y', refYearLabelY)
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'auto')
            .attr('visibility', 'hidden')
            .text('1951')
        refYearLabel1980 = g
            .append('text')
            .attr('class', 'baseline-ref-year-label')
            .attr('x', x1980 + 4)
            .attr('y', refYearLabelY)
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'auto')
            .attr('visibility', 'hidden')
            .text('1980')
    }

    const hoverLine = g
        .append('line')
        .attr('class', 'hover-line')
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke-dasharray', '4 4')
        .attr('stroke', 'var(--color-text)')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.7)
        .attr('visibility', 'hidden')

    const tooltip = tooltipEl.value
    if (!tooltip) return

    g.append('rect')
        .attr('class', 'chart-overlay')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseenter', () => tooltip.classList.add('visible'))
        .on('mousemove', function (event) {
            const [mx, my] = d3.pointer(event, this)
            const onBaseline =
                baselineLine && baselineLabel && Math.abs(my - yBaseline) <= BASELINE_HIT_PX
            if (onBaseline) {
                baselineLine.attr('stroke-dasharray', null)
                baselineLabel.attr('visibility', 'visible')
                refLine1951?.attr('visibility', 'visible')
                refLine1980?.attr('visibility', 'visible')
                refYearLabel1951?.attr('visibility', 'visible')
                refYearLabel1980?.attr('visibility', 'visible')
            } else if (baselineLine && baselineLabel) {
                baselineLine.attr('stroke-dasharray', '6 4')
                baselineLabel.attr('visibility', 'hidden')
                refLine1951?.attr('visibility', 'hidden')
                refLine1980?.attr('visibility', 'hidden')
                refYearLabel1951?.attr('visibility', 'hidden')
                refYearLabel1980?.attr('visibility', 'hidden')
            }
            const yearFloat = x.invert(mx)
            const point = nearestByYear(data, yearFloat)
            if (!point) return
            const xPos = x(point.year)
            hoverLine.attr('x1', xPos).attr('x2', xPos).attr('visibility', 'visible')

            const totalGt = ggToGt(point.total)
            const rows = BREAKDOWN_ORDER.map(([key, sym, unit]) => {
                const raw = point.breakdown?.[key]
                if (raw == null) return ''
                const gtRaw = ggToGt(raw)
                const gtCo2e = ggToGt(breakdownGgToGgCo2e(key, raw))
                const co2eLabel = `(${fmtGt(gtCo2e)} Gt CO₂-eq/yr)`
                return `<li><span class="tt-gas">${escapeHtml(sym)}</span> <span class="tt-amt">${escapeHtml(fmtGt(gtRaw))}</span> <span class="tt-unit">${escapeHtml(unit)}</span> <span class="tt-co2e">${escapeHtml(co2eLabel)}</span></li>`
            }).join('')

            tooltip.innerHTML = `
                <span class="tooltip-header">annual</span>
                <span class="tooltip-year">${escapeHtml(String(point.year))}</span>
                <span class="tooltip-area">Aggregate: ${escapeHtml('EARTH')}</span>
                <span class="tooltip-total">Total (Kyoto, AR5): ${escapeHtml(fmtGt(totalGt))} Gt CO₂-eq / yr</span>
                <span class="tooltip-sub">By gas</span>
                <ul class="tooltip-breakdown">${rows}</ul>
            `

            const offset = 12
            const svgRect = svg.node()?.getBoundingClientRect()
            const ttRect = tooltip.getBoundingClientRect()
            if (!svgRect) return
            const plotLeft = svgRect.left + margin.left
            const plotRight = plotLeft + width
            const lineX = plotLeft + xPos

            let left = lineX + offset
            if (left + ttRect.width > plotRight) {
                left = lineX - offset - ttRect.width
            }
            left = Math.max(plotLeft, left)

            const top = Math.max(8, svgRect.top + margin.top + 8)
            tooltip.style.left = `${left}px`
            tooltip.style.top = `${top}px`
        })
        .on('mouseleave', () => {
            hoverLine.attr('visibility', 'hidden')
            tooltip.classList.remove('visible')
            if (baselineLine && baselineLabel) {
                baselineLine.attr('stroke-dasharray', '6 4')
                baselineLabel.attr('visibility', 'hidden')
            }
            refLine1951?.attr('visibility', 'hidden')
            refLine1980?.attr('visibility', 'hidden')
            refYearLabel1951?.attr('visibility', 'hidden')
            refYearLabel1980?.attr('visibility', 'hidden')
        })
}

onMounted(async () => {
    const base = import.meta.env.BASE_URL
    const payload = await fetch(`${base}data/earth-ghg-annual.json`).then((r) => r.json())
    const series = payload.series || []
    const baselineGg = payload.meta?.baselineAverageGgCO2e ?? null

    if (!chartRef.value) return

    const tooltip = document.createElement('div')
    tooltip.setAttribute('class', 'chart-tooltip chart-tooltip--ghg')
    tooltip.setAttribute('role', 'tooltip')
    document.body.appendChild(tooltip)
    tooltipEl.value = tooltip

    renderChart(chartRef.value, series, baselineGg)
})

onBeforeUnmount(() => {
    if (tooltipEl.value && tooltipEl.value.parentNode) {
        tooltipEl.value.remove()
    }
})
</script>

<template>
    <figure
        class="ghg-chart"
        aria-label="Global greenhouse gas emissions for aggregate EARTH, 1880 to present"
    >
        <div ref="chartRef" class="chart-container"></div>
        <figcaption>
            <strong>Source:</strong>
            PRIMAP-hist v2.6.1 — Gütschow, Busch &amp; Pflüger (2025), Zenodo
            <a href="https://doi.org/10.5281/zenodo.15016289" rel="noopener noreferrer"
                >doi:10.5281/zenodo.15016289</a
            >. Scenario HISTCR; national total excluding LULUCF (M.0.EL). Total line is Kyoto basket
            <code>KYOTOGHG (AR5GWP100)</code> (CO₂ equivalent). Dashed horizontal line: 1951–1980
            average of that total. Axis shows gigagrams expressed as Gt (1 Gt = 10⁶ Gg). Annual
            values are available             through <strong>2023</strong> in this release; the x-axis runs to
            2025 for context. Tooltip parentheses convert CH₄, N₂O, SF₆, and NF₃
            masses to CO₂-eq using IPCC AR5 100-yr GWPs (28, 265, 22800, 16100);
            HFC and PFC rows are already CO₂-eq in PRIMAP.
        </figcaption>
    </figure>
</template>

<style scoped>
.ghg-chart {
    margin: 0;
    width: 100%;
}

.chart-container {
    position: relative;
    width: 100%;
    min-height: 360px;
}

.chart-container :deep(.hover-line) {
    pointer-events: none;
}

.chart-container :deep(.axis) {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.75rem;
    fill: var(--color-muted);
}

.chart-container :deep(.axis path),
.chart-container :deep(.axis line) {
    stroke: var(--color-border);
}

.chart-container :deep(.axis-y-label) {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.72rem;
    fill: var(--color-muted);
}

.chart-container :deep(.baseline-ref) {
    stroke: var(--color-muted);
    stroke-width: 1.5;
    stroke-opacity: 0.85;
}

.chart-container :deep(.baseline-label) {
    fill: var(--color-text);
    font-size: 0.68rem;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 500;
    pointer-events: none;
}

.chart-container :deep(.baseline-ref-year) {
    stroke: var(--color-muted);
    stroke-width: 1;
    stroke-opacity: 0.9;
    pointer-events: none;
}

.chart-container :deep(.baseline-ref-year-label) {
    fill: var(--color-muted);
    font-size: 0.68rem;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 600;
    pointer-events: none;
    opacity: 0.95;
}

.chart-container :deep(.line) {
    vector-effect: non-scaling-stroke;
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

figcaption a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
}
</style>

<style>
.chart-tooltip.chart-tooltip--ghg {
    white-space: normal;
    max-width: min(320px, calc(100vw - 24px));
}

.chart-tooltip.chart-tooltip--ghg .tooltip-header {
    display: block;
    font-size: 0.7rem;
    text-transform: lowercase;
    letter-spacing: 0.04em;
    opacity: 0.9;
    margin-bottom: 0.15rem;
}

.chart-tooltip.chart-tooltip--ghg .tooltip-year {
    display: block;
    font-weight: 600;
    margin-bottom: 0.2rem;
}

.chart-tooltip.chart-tooltip--ghg .tooltip-area {
    display: block;
    font-size: 0.75rem;
    margin-bottom: 0.35rem;
    opacity: 0.95;
}

.chart-tooltip.chart-tooltip--ghg .tooltip-total {
    display: block;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 0.35rem;
    line-height: 1.35;
}

.chart-tooltip.chart-tooltip--ghg .tooltip-sub {
    display: block;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.8;
    margin-bottom: 0.2rem;
}

.chart-tooltip.chart-tooltip--ghg .tooltip-breakdown {
    margin: 0;
    padding-left: 1.1rem;
    font-size: 0.75rem;
    line-height: 1.45;
}

.chart-tooltip.chart-tooltip--ghg .tt-unit {
    opacity: 0.75;
    font-size: 0.68rem;
}

.chart-tooltip.chart-tooltip--ghg .tt-co2e {
    opacity: 0.88;
    font-size: 0.72rem;
    white-space: nowrap;
}
</style>

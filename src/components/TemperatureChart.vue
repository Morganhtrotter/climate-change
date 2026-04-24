<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as d3 from 'd3'

const MONTH_COLS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const chartRef = ref(null)
const tooltipEl = ref(null)
const viewMode = ref('annual')
let annualData = []
let monthlyData = []
let renderChartFn = null

function renderChart(container, data, isMonthly) {
    if (!container || !data.length) return
    d3.select(container).selectAll('*').remove()

    const margin = { top: 32, right: 24, bottom: 48, left: 52 }
    const width = Math.max(320, container.clientWidth) - margin.left - margin.right
    const height = 360 - margin.top - margin.bottom

    const x = isMonthly
        ? d3.scaleTime().domain(d3.extent(data, (d) => d.date)).range([0, width])
        : d3.scaleLinear().domain(d3.extent(data, (d) => d.year)).range([0, width])
    const yExtent = d3.extent(data, (d) => d.anomaly)
    const yPadding = 0.15
    const yMin = Math.min(yExtent[0], 0) - yPadding
    const yMax = Math.max(yExtent[1], 0) + yPadding
    const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0])

    const line = d3
        .line()
        .x((d) => (isMonthly ? x(d.date) : x(d.year)))
        .y((d) => y(d.anomaly))
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

    const yAxis = d3.axisLeft(y).ticks(6).tickFormat((v) => `${v}°C`)
    const xAxis = isMonthly
        ? d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat('%Y'))
        : d3.axisBottom(x).ticks(10).tickFormat(d3.format('d'))

    g.append('g').attr('class', 'axis axis-y').call(yAxis)
    g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

    const zeroY = y(0)
    if (zeroY >= 0 && zeroY <= height) {
        g.append('line')
            .attr('class', 'baseline')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', zeroY)
            .attr('y2', zeroY)
    }

    const minAnomaly = d3.min(data, (d) => d.anomaly)
    const maxAnomaly = d3.max(data, (d) => d.anomaly)
    const gradientId = `temp-gradient-${isMonthly ? 'monthly' : 'annual'}`
    const defs = g.append('defs')
    const gradient = defs
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', y(maxAnomaly))
        .attr('x2', 0)
        .attr('y2', y(minAnomaly))
    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'var(--color-above)')
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'var(--color-below)')

    const area = d3
        .area()
        .x((d) => (isMonthly ? x(d.date) : x(d.year)))
        .y0(height)
        .y1((d) => y(d.anomaly))
        .curve(d3.curveMonotoneX)

    g.append('path')
        .attr('class', 'area')
        .attr('d', area(data))
        .attr('fill', `url(#${gradientId})`)
        .attr('opacity', 0.25)

    g.append('path')
        .attr('class', 'line')
        .attr('d', line(data))
        .attr('fill', 'none')
        .attr('stroke', `url(#${gradientId})`)
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')

    const bisect = isMonthly
        ? d3.bisector((d) => d.date).left
        : d3.bisector((d) => d.year).left
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
            const [mx] = d3.pointer(event, this)
            const xVal = x.invert(mx)
            const i = Math.max(0, Math.min(bisect(data, xVal), data.length - 1))
            const point = data[i]
            const xPos = isMonthly ? x(point.date) : x(point.year)
            hoverLine.attr('x1', xPos).attr('x2', xPos).attr('visibility', 'visible')
            const anomaly = point.anomaly
            const sign = anomaly >= 0 ? '+' : ''
            const period = isMonthly ? point.monthName : 'Annual'
            const yearLabel = isMonthly ? `${point.monthName} ${point.year}` : String(point.year)
            tooltip.innerHTML = `
                <span class="tooltip-period">${period}</span>
                <span class="tooltip-year">${yearLabel}</span>
                <span class="tooltip-value">${sign}${anomaly.toFixed(2)}°C</span>
                <span class="tooltip-label">Global mean temp. index</span>
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
        })
}

onMounted(async () => {
    const base = import.meta.env.BASE_URL
    const raw = await fetch(`${base}data/GLB.Ts+dSST.csv`).then((r) => r.text())
    const lines = raw.trim().split('\n')
    const csvContent = lines.slice(1).join('\n')
    const parsed = d3.csvParse(csvContent)

    annualData = parsed
        .filter((d) => d.Year && d['J-D'] && d['J-D'] !== '***')
        .map((d) => ({ year: +d.Year, anomaly: +d['J-D'] }))
        .sort((a, b) => a.year - b.year)

    monthlyData = []
    for (const row of parsed) {
        const year = row.Year ? +row.Year : null
        if (year == null) continue
        for (let m = 0; m < MONTH_COLS.length; m++) {
            const val = row[MONTH_COLS[m]]
            if (val != null && val !== '***') {
                monthlyData.push({
                    date: new Date(year, m, 1),
                    year,
                    month: m + 1,
                    monthName: MONTH_COLS[m],
                    anomaly: +val,
                })
            }
        }
    }
    monthlyData.sort((a, b) => a.date - b.date)

    if (!chartRef.value) return

    const tooltip = document.createElement('div')
    tooltip.setAttribute('class', 'chart-tooltip')
    tooltip.setAttribute('role', 'tooltip')
    document.body.appendChild(tooltip)
    tooltipEl.value = tooltip

    renderChartFn = () => {
        const data = viewMode.value === 'monthly' ? monthlyData : annualData
        renderChart(chartRef.value, data, viewMode.value === 'monthly')
    }
    renderChart(chartRef.value, annualData, false)
})

watch(viewMode, () => {
    if (renderChartFn && chartRef.value) renderChartFn()
})

onBeforeUnmount(() => {
    if (tooltipEl.value && tooltipEl.value.parentNode) {
        tooltipEl.value.remove()
    }
})
</script>

<template>
    <figure
        class="temperature-chart"
        aria-label="Global land-ocean temperature anomaly from 1880 to present"
    >
        <div class="chart-controls">
            <div class="pill-toggle" role="group" aria-label="Data view">
                <button
                    type="button"
                    class="pill-option"
                    :class="{ active: viewMode === 'annual' }"
                    @click="viewMode = 'annual'"
                >
                    Annual mean
                </button>
                <button
                    type="button"
                    class="pill-option"
                    :class="{ active: viewMode === 'monthly' }"
                    @click="viewMode = 'monthly'"
                >
                    Monthly mean
                </button>
            </div>
        </div>
        <div ref="chartRef" class="chart-container"></div>
        <figcaption>
            <strong>Source:</strong> NASA GISS — Land-Ocean Temperature Index. Anomalies relative to
            1951–1980 mean.
        </figcaption>
    </figure>
</template>

<style scoped>
.temperature-chart {
    margin: 0;
    width: 100%;
}

.chart-controls {
    margin-bottom: 1rem;
}

.pill-toggle {
    display: inline-flex;
    padding: 3px;
    background: var(--color-border);
    border-radius: 9999px;
    gap: 0;
}

.pill-option {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
    font-family: inherit;
    font-weight: 500;
    color: var(--color-muted);
    background: transparent;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;
}

.pill-option:hover {
    color: var(--color-text);
}

.pill-option.active {
    color: var(--color-bg);
    background: var(--color-text);
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

.chart-container :deep(.baseline) {
    stroke: var(--color-text);
    stroke-dasharray: 4 4;
    stroke-opacity: 0.5;
}

.chart-container :deep(.line) {
    vector-effect: non-scaling-stroke;
}

figcaption {
    margin-top: 0.75rem;
    font-size: 0.8rem;
    color: var(--color-muted);
    line-height: 1.4;
}
</style>

<style>
/* Unscoped: tooltip is appended to body so it needs global styles and position:fixed */
.chart-tooltip {
    position: fixed;
    z-index: 9999;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-border);
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    left: 0;
    top: 0;
}

.chart-tooltip.visible {
    opacity: 1;
    visibility: visible;
}

.chart-tooltip .tooltip-period {
    display: block;
    font-size: 0.7rem;
    opacity: 0.9;
    margin-bottom: 0.1rem;
}

.chart-tooltip .tooltip-year {
    display: block;
    font-weight: 600;
    margin-bottom: 0.15rem;
}

.chart-tooltip .tooltip-value {
    display: block;
    font-weight: 700;
    font-size: 1rem;
}

.chart-tooltip .tooltip-label {
    display: block;
    font-size: 0.7rem;
    opacity: 0.85;
    margin-top: 0.15rem;
}
</style>

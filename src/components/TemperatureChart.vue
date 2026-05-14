<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as d3 from 'd3'

const chartRef = ref(null)
const tooltipEl = ref(null)
const annualDataRef = ref([])
const extrapolate = ref(false)

const FIT_WINDOW_YEARS = 40
/** Anomaly (°C vs 1951–1980) at which forward extrapolation stops. */
const EXTRAP_TARGET_ANOMALY = 3.81
/** Safety cap on forward span (years) if slope is flat or target unreachable. */
const EXTRAP_MAX_FORWARD_YEARS = 800

function lastCalendarYearWindow(data, nYears) {
    if (!data.length) return []
    const lastY = data[data.length - 1].year
    const startY = lastY - (nYears - 1)
    return data.filter((d) => d.year >= startY && d.year <= lastY)
}

/** Ordinary least squares slope d(anomaly)/d(year). */
function regressionSlopeYearAnomaly(points) {
    const n = points.length
    if (n < 2) return 0
    const meanX = d3.mean(points, (d) => d.year)
    const meanY = d3.mean(points, (d) => d.anomaly)
    let num = 0
    let den = 0
    for (const p of points) {
        const dx = p.year - meanX
        num += dx * (p.anomaly - meanY)
        den += dx * dx
    }
    return den === 0 ? 0 : num / den
}

function extrapolationSeries(data, enabled) {
    if (!enabled || data.length < 2) return null
    const windowPts = lastCalendarYearWindow(data, FIT_WINDOW_YEARS)
    const fitPts = windowPts.length >= 2 ? windowPts : data.slice(-Math.min(FIT_WINDOW_YEARS, data.length))
    if (fitPts.length < 2) return null
    const slope = regressionSlopeYearAnomaly(fitPts)
    const last = data[data.length - 1]
    const target = EXTRAP_TARGET_ANOMALY

    let endYear
    let endAnomaly

    if (Math.abs(slope) < 1e-10) {
        endYear = last.year + EXTRAP_MAX_FORWARD_YEARS
        endAnomaly = last.anomaly
    } else if (slope > 0) {
        const yearsToTarget = (target - last.anomaly) / slope
        if (yearsToTarget <= 0) {
            endYear = last.year
            endAnomaly = last.anomaly
        } else if (yearsToTarget <= EXTRAP_MAX_FORWARD_YEARS) {
            endYear = last.year + yearsToTarget
            endAnomaly = target
        } else {
            endYear = last.year + EXTRAP_MAX_FORWARD_YEARS
            endAnomaly = last.anomaly + slope * EXTRAP_MAX_FORWARD_YEARS
        }
    } else {
        const yearsToTarget = (target - last.anomaly) / slope
        if (yearsToTarget > 0 && yearsToTarget <= EXTRAP_MAX_FORWARD_YEARS) {
            endYear = last.year + yearsToTarget
            endAnomaly = target
        } else {
            endYear = last.year + EXTRAP_MAX_FORWARD_YEARS
            endAnomaly = last.anomaly + slope * EXTRAP_MAX_FORWARD_YEARS
        }
    }

    if (endYear < last.year) {
        endYear = last.year
        endAnomaly = last.anomaly
    }

    return {
        slope,
        lastYear: last.year,
        lastAnomaly: last.anomaly,
        endYear,
        endAnomaly,
        segment: [
            { year: last.year, anomaly: last.anomaly },
            { year: endYear, anomaly: endAnomaly },
        ],
    }
}

function renderChart(container, data, extrapolateMode) {
    if (!container || !data.length) return
    d3.select(container).selectAll('*').remove()

    const margin = { top: 32, right: 24, bottom: 48, left: 52 }
    const width = Math.max(320, container.clientWidth) - margin.left - margin.right
    const height = 360 - margin.top - margin.bottom

    const extrap = extrapolationSeries(data, extrapolateMode)
    const lastDataYear = data[data.length - 1].year
    const xMax = extrap ? extrap.endYear : lastDataYear
    const xMin = d3.min(data, (d) => d.year)
    const x = d3.scaleLinear().domain([xMin, xMax]).range([0, width])

    const yExtent = d3.extent(data, (d) => d.anomaly)
    const yPadding = 0.15
    const PRE_INDUSTRIAL_ANOMALY = -0.19
    const yMaxExtrap = extrap
        ? Math.max(extrap.endAnomaly, EXTRAP_TARGET_ANOMALY)
        : yExtent[1]
    const yMin = Math.min(yExtent[0], 0, PRE_INDUSTRIAL_ANOMALY) - yPadding
    const yMax = Math.max(yExtent[1], yMaxExtrap, 0) + yPadding
    const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0])

    const line = d3
        .line()
        .x((d) => x(d.year))
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
    const xAxis = d3.axisBottom(x).ticks(10).tickFormat(d3.format('d'))

    g.append('g').attr('class', 'axis axis-y').call(yAxis)
    g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

    const zeroY = y(0)
    const preIndustrialY = y(PRE_INDUSTRIAL_ANOMALY)
    const baselineInView = zeroY >= 0 && zeroY <= height
    const preIndustrialInView = preIndustrialY >= 0 && preIndustrialY <= height
    const BASELINE_HIT_PX = 10
    let baselineLine = null
    let baselineLabel = null
    let preIndustrialLine = null
    let preIndustrialLabel = null
    let refLine1951 = null
    let refLine1980 = null
    let refYearLabel1951 = null
    let refYearLabel1980 = null
    if (baselineInView) {
        baselineLine = g
            .append('line')
            .attr('class', 'baseline')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', zeroY)
            .attr('y2', zeroY)
            .attr('stroke-dasharray', '4 4')
    }
    if (preIndustrialInView) {
        preIndustrialLine = g
            .append('line')
            .attr('class', 'baseline baseline-preindustrial')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', preIndustrialY)
            .attr('y2', preIndustrialY)
            .attr('stroke-dasharray', '4 4')
    }

    const minAnomaly = d3.min(data, (d) => d.anomaly)
    const maxAnomaly = d3.max(data, (d) => d.anomaly)
    const gradientId = 'temp-gradient-annual'
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
        .x((d) => x(d.year))
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

    if (extrap && extrap.endYear > extrap.lastYear + 1e-6) {
        const extrapLine = d3
            .line()
            .x((d) => x(d.year))
            .y((d) => y(d.anomaly))
        g.append('path')
            .attr('class', 'extrap-line')
            .attr('d', extrapLine(extrap.segment))
            .attr('fill', 'none')
            .attr('stroke', 'var(--color-heading)')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '6 5')
            .attr('stroke-linecap', 'round')
            .attr('opacity', 0.9)
    }

    if (baselineInView && baselineLine) {
        baselineLabel = g
            .append('text')
            .attr('class', 'baseline-label')
            .attr('x', width - 4)
            .attr('y', zeroY - 6)
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

    if (preIndustrialInView && preIndustrialLine) {
        preIndustrialLabel = g
            .append('text')
            .attr('class', 'baseline-label baseline-label-preindustrial')
            .attr('x', width - 4)
            .attr('y', preIndustrialY - 6)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'auto')
            .attr('visibility', 'hidden')
            .text('Pre-industrial average')
    }

    const bisect = d3.bisector((d) => d.year).left
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
            const distBaseline =
                baselineLine && baselineLabel ? Math.abs(my - zeroY) : Number.POSITIVE_INFINITY
            const distPre =
                preIndustrialLine && preIndustrialLabel
                    ? Math.abs(my - preIndustrialY)
                    : Number.POSITIVE_INFINITY
            const hitBaseline = distBaseline <= BASELINE_HIT_PX
            const hitPre = distPre <= BASELINE_HIT_PX
            let activeBaseline = false
            let activePre = false
            if (hitBaseline && hitPre) {
                if (distBaseline <= distPre) activeBaseline = true
                else activePre = true
            } else if (hitBaseline) {
                activeBaseline = true
            } else if (hitPre) {
                activePre = true
            }

            if (activeBaseline) {
                baselineLine?.attr('stroke-dasharray', null)
                baselineLabel?.attr('visibility', 'visible')
                refLine1951?.attr('visibility', 'visible')
                refLine1980?.attr('visibility', 'visible')
                refYearLabel1951?.attr('visibility', 'visible')
                refYearLabel1980?.attr('visibility', 'visible')
            } else {
                baselineLine?.attr('stroke-dasharray', '4 4')
                baselineLabel?.attr('visibility', 'hidden')
                refLine1951?.attr('visibility', 'hidden')
                refLine1980?.attr('visibility', 'hidden')
                refYearLabel1951?.attr('visibility', 'hidden')
                refYearLabel1980?.attr('visibility', 'hidden')
            }

            if (activePre) {
                preIndustrialLine?.attr('stroke-dasharray', null)
                preIndustrialLabel?.attr('visibility', 'visible')
            } else {
                preIndustrialLine?.attr('stroke-dasharray', '4 4')
                preIndustrialLabel?.attr('visibility', 'hidden')
            }
            const xVal = x.invert(mx)
            let point
            let xPos
            let tooltipLabel = 'Global mean temp. index'
            if (extrap && xVal > lastDataYear) {
                const xEx = Math.min(xVal, extrap.endYear)
                const yHat = extrap.lastAnomaly + extrap.slope * (xEx - extrap.lastYear)
                point = { year: Math.round(xEx), anomaly: yHat }
                xPos = x(xEx)
                tooltipLabel = 'Linear extrapolation (40-yr trend)'
            } else {
                const i = Math.max(0, Math.min(bisect(data, xVal), data.length - 1))
                point = data[i]
                xPos = x(point.year)
            }
            hoverLine.attr('x1', xPos).attr('x2', xPos).attr('visibility', 'visible')
            const anomaly = point.anomaly
            const sign = anomaly >= 0 ? '+' : ''
            const yearLabel = String(point.year)
            const valueStr = `${sign}${anomaly.toFixed(2)}°C`
            const topRow = `<div class="tooltip-top-row"><span class="tooltip-value">${valueStr}</span><span class="tooltip-year">${yearLabel}</span></div>`
            tooltip.innerHTML = `${topRow}<span class="tooltip-label">${tooltipLabel}</span>`
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
                baselineLine.attr('stroke-dasharray', '4 4')
                baselineLabel.attr('visibility', 'hidden')
            }
            if (preIndustrialLine && preIndustrialLabel) {
                preIndustrialLine.attr('stroke-dasharray', '4 4')
                preIndustrialLabel.attr('visibility', 'hidden')
            }
            refLine1951?.attr('visibility', 'hidden')
            refLine1980?.attr('visibility', 'hidden')
            refYearLabel1951?.attr('visibility', 'hidden')
            refYearLabel1980?.attr('visibility', 'hidden')
        })
}

onMounted(async () => {
    const base = import.meta.env.BASE_URL
    const raw = await fetch(`${base}data/GLB.Ts+dSST.csv`).then((r) => r.text())
    const lines = raw.trim().split('\n')
    const csvContent = lines.slice(1).join('\n')
    const parsed = d3.csvParse(csvContent)

    annualDataRef.value = parsed
        .filter((d) => d.Year && d['J-D'] && d['J-D'] !== '***')
        .map((d) => ({ year: +d.Year, anomaly: +d['J-D'] }))
        .sort((a, b) => a.year - b.year)

    const tooltip = document.createElement('div')
    tooltip.setAttribute('class', 'chart-tooltip')
    tooltip.setAttribute('role', 'tooltip')
    document.body.appendChild(tooltip)
    tooltipEl.value = tooltip

    await nextTick()
    if (chartRef.value && annualDataRef.value.length) {
        renderChart(chartRef.value, annualDataRef.value, extrapolate.value)
    }
})

watch(extrapolate, async () => {
    await nextTick()
    if (chartRef.value && annualDataRef.value.length) {
        renderChart(chartRef.value, annualDataRef.value, extrapolate.value)
    }
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
        <div class="chart-toolbar">
            <label class="extrap-toggle">
                <input v-model="extrapolate" type="checkbox" class="extrap-checkbox" />
                <span class="extrap-label">Extrapolate</span>
            </label>
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

.chart-toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 0.5rem;
}

.extrap-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-heading);
    user-select: none;
}

.extrap-checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: var(--color-heading);
    cursor: pointer;
}

.extrap-label {
    line-height: 1.2;
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
    stroke-opacity: 0.5;
}

.chart-container :deep(.baseline-preindustrial) {
    stroke-opacity: 0.42;
}

.chart-container :deep(.baseline-label) {
    fill: var(--color-text);
    font-size: 0.68rem;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 500;
    pointer-events: none;
}

.chart-container :deep(.baseline-ref-year) {
    stroke: var(--color-text);
    stroke-width: 1;
    stroke-opacity: 0.55;
    stroke-dasharray: 4 4;
    pointer-events: none;
}

.chart-container :deep(.baseline-ref-year-label) {
    fill: var(--color-text);
    font-size: 0.68rem;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 600;
    pointer-events: none;
    opacity: 0.85;
}

.chart-container :deep(.line) {
    vector-effect: non-scaling-stroke;
}

.chart-container :deep(.extrap-line) {
    vector-effect: non-scaling-stroke;
    pointer-events: none;
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

.chart-tooltip .tooltip-top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    width: 100%;
    margin-bottom: 0.15rem;
}

.chart-tooltip .tooltip-year {
    display: block;
    font-weight: 600;
    margin-bottom: 0.15rem;
}

.chart-tooltip .tooltip-top-row .tooltip-year {
    margin-bottom: 0;
    margin-left: auto;
    text-align: right;
    flex-shrink: 0;
}

.chart-tooltip .tooltip-top-row .tooltip-value {
    flex: 1;
    min-width: 0;
    margin-bottom: 0;
    text-align: left;
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

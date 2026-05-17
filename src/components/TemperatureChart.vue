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
const EXTRAP_TRANSITION_MS = 650

let chartInstance = null

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

const PRE_INDUSTRIAL_ANOMALY = -0.19

function yDomainForData(data, extrap) {
    const yExtent = d3.extent(data, (d) => d.anomaly)
    const yPadding = 0.15
    const yMaxExtrap = extrap
        ? Math.max(extrap.endAnomaly, EXTRAP_TARGET_ANOMALY)
        : yExtent[1]
    const yMin = Math.min(yExtent[0], 0, PRE_INDUSTRIAL_ANOMALY) - yPadding
    const yMax = Math.max(yExtent[1], yMaxExtrap, 0) + yPadding
    return [yMin, yMax]
}

function buildChart(container, data, extrapolateMode) {
    if (!container || !data.length) return
    d3.select(container).selectAll('*').remove()
    chartInstance = null

    const margin = { top: 32, right: 24, bottom: 48, left: 52 }
    const width = Math.max(320, container.clientWidth) - margin.left - margin.right
    const height = 360 - margin.top - margin.bottom

    const extrap = extrapolationSeries(data, extrapolateMode)
    const lastDataYear = data[data.length - 1].year
    const xMax = extrap ? extrap.endYear : lastDataYear
    const xMin = d3.min(data, (d) => d.year)
    const x = d3.scaleLinear().domain([xMin, xMax]).range([0, width])

    const [yMin, yMax] = yDomainForData(data, extrap)
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

    const extrapLineGen = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.anomaly))
    if (extrap && extrap.endYear > extrap.lastYear + 1e-6) {
        g.append('path')
            .attr('class', 'extrap-line')
            .attr('d', extrapLineGen(extrap.segment))
            .attr('fill', 'none')
            .attr('stroke', 'var(--color-heading)')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '6 5')
            .attr('stroke-linecap', 'round')
            .attr('opacity', extrapolateMode ? 0.9 : 0)
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
            const inst = chartInstance
            if (!inst) return
            const [mx, my] = d3.pointer(event, this)
            const distBaseline =
                inst.baselineLine && inst.baselineLabel
                    ? Math.abs(my - inst.zeroY)
                    : Number.POSITIVE_INFINITY
            const distPre =
                inst.preIndustrialLine && inst.preIndustrialLabel
                    ? Math.abs(my - inst.preIndustrialY)
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
                inst.baselineLine?.attr('stroke-dasharray', null)
                inst.baselineLabel?.attr('visibility', 'visible')
                inst.refLine1951?.attr('visibility', 'visible')
                inst.refLine1980?.attr('visibility', 'visible')
                inst.refYearLabel1951?.attr('visibility', 'visible')
                inst.refYearLabel1980?.attr('visibility', 'visible')
            } else {
                inst.baselineLine?.attr('stroke-dasharray', '4 4')
                inst.baselineLabel?.attr('visibility', 'hidden')
                inst.refLine1951?.attr('visibility', 'hidden')
                inst.refLine1980?.attr('visibility', 'hidden')
                inst.refYearLabel1951?.attr('visibility', 'hidden')
                inst.refYearLabel1980?.attr('visibility', 'hidden')
            }

            if (activePre) {
                inst.preIndustrialLine?.attr('stroke-dasharray', null)
                inst.preIndustrialLabel?.attr('visibility', 'visible')
            } else {
                inst.preIndustrialLine?.attr('stroke-dasharray', '4 4')
                inst.preIndustrialLabel?.attr('visibility', 'hidden')
            }
            const xVal = inst.x.invert(mx)
            let point
            let xPos
            let tooltipLabel = 'Global mean temp. index'
            const extrapActive = inst.extrapolateMode && inst.extrap
            if (extrapActive && xVal > inst.lastDataYear) {
                const xEx = Math.min(xVal, inst.extrap.endYear)
                const yHat =
                    inst.extrap.lastAnomaly + inst.extrap.slope * (xEx - inst.extrap.lastYear)
                point = { year: Math.round(xEx), anomaly: yHat }
                xPos = inst.x(xEx)
                tooltipLabel = 'Linear extrapolation (40-yr trend)'
            } else {
                const i = Math.max(0, Math.min(inst.bisect(inst.data, xVal), inst.data.length - 1))
                point = inst.data[i]
                xPos = inst.x(point.year)
            }
            inst.hoverLine.attr('x1', xPos).attr('x2', xPos).attr('visibility', 'visible')
            const anomaly = point.anomaly
            const sign = anomaly >= 0 ? '+' : ''
            const yearLabel = String(point.year)
            const valueStr = `${sign}${anomaly.toFixed(2)}°C`
            const topRow = `<div class="tooltip-top-row"><span class="tooltip-value">${valueStr}</span><span class="tooltip-year">${yearLabel}</span></div>`
            inst.tooltip.innerHTML = `${topRow}<span class="tooltip-label">${tooltipLabel}</span>`
            const offset = 12
            const svgRect = inst.svg.node()?.getBoundingClientRect()
            const ttRect = inst.tooltip.getBoundingClientRect()
            if (!svgRect) return
            const plotLeft = svgRect.left + inst.margin.left
            const plotRight = plotLeft + inst.width
            const lineX = plotLeft + xPos

            let left = lineX + offset
            if (left + ttRect.width > plotRight) {
                left = lineX - offset - ttRect.width
            }
            left = Math.max(plotLeft, left)

            const top = Math.max(8, svgRect.top + inst.margin.top + 8)
            inst.tooltip.style.left = `${left}px`
            inst.tooltip.style.top = `${top}px`
        })
        .on('mouseleave', () => {
            const inst = chartInstance
            if (!inst) return
            inst.hoverLine.attr('visibility', 'hidden')
            inst.tooltip.classList.remove('visible')
            if (inst.baselineLine && inst.baselineLabel) {
                inst.baselineLine.attr('stroke-dasharray', '4 4')
                inst.baselineLabel.attr('visibility', 'hidden')
            }
            if (inst.preIndustrialLine && inst.preIndustrialLabel) {
                inst.preIndustrialLine.attr('stroke-dasharray', '4 4')
                inst.preIndustrialLabel.attr('visibility', 'hidden')
            }
            inst.refLine1951?.attr('visibility', 'hidden')
            inst.refLine1980?.attr('visibility', 'hidden')
            inst.refYearLabel1951?.attr('visibility', 'hidden')
            inst.refYearLabel1980?.attr('visibility', 'hidden')
        })

    chartInstance = {
        container,
        data,
        margin,
        width,
        height,
        svg,
        g,
        x,
        y,
        xAxis,
        yAxis,
        line,
        area,
        gradient,
        minAnomaly,
        maxAnomaly,
        extrapolateMode,
        extrap,
        lastDataYear,
        extrapLineGen,
        baselineLine,
        baselineLabel,
        preIndustrialLine,
        preIndustrialLabel,
        refLine1951,
        refLine1980,
        refYearLabel1951,
        refYearLabel1980,
        zeroY,
        preIndustrialY,
        baselineInView,
        preIndustrialInView,
        BASELINE_HIT_PX,
        bisect,
        hoverLine,
        tooltip,
    }
}

function setExtrapolateMode(enabled, animate = true) {
    const inst = chartInstance
    if (!inst?.g || !inst.data?.length) return

    inst.hoverLine?.attr('visibility', 'hidden')
    inst.tooltip?.classList.remove('visible')

    const { data, g, height, line, area, gradient, minAnomaly, maxAnomaly } = inst
    const extrap = extrapolationSeries(data, enabled)
    const lastDataYear = data[data.length - 1].year
    const xMin = d3.min(data, (d) => d.year)
    const xMax = extrap ? extrap.endYear : lastDataYear
    const [yMin, yMax] = yDomainForData(data, extrap)

    inst.extrapolateMode = enabled
    inst.extrap = extrap
    inst.lastDataYear = lastDataYear

    const transition = animate
        ? d3.transition().duration(EXTRAP_TRANSITION_MS).ease(d3.easeCubicInOut)
        : null

    inst.x.domain([xMin, xMax])
    inst.y.domain([yMin, yMax])

    const zeroY = inst.y(0)
    const preIndustrialY = inst.y(PRE_INDUSTRIAL_ANOMALY)
    inst.zeroY = zeroY
    inst.preIndustrialY = preIndustrialY

    const axisX = g.select('.axis-x')
    const axisY = g.select('.axis-y')
    if (transition) {
        axisX.transition(transition).call(inst.xAxis)
        axisY.transition(transition).call(inst.yAxis)
    } else {
        axisX.call(inst.xAxis)
        axisY.call(inst.yAxis)
    }

    const gradSel = gradient
    if (transition) {
        gradSel
            .transition(transition)
            .attr('y1', inst.y(maxAnomaly))
            .attr('y2', inst.y(minAnomaly))
    } else {
        gradSel.attr('y1', inst.y(maxAnomaly)).attr('y2', inst.y(minAnomaly))
    }

    const linePath = line.x((d) => inst.x(d.year)).y((d) => inst.y(d.anomaly))
    const areaPath = area
        .x((d) => inst.x(d.year))
        .y0(height)
        .y1((d) => inst.y(d.anomaly))

    const mainLine = g.select('.line')
    const mainArea = g.select('.area')
    if (transition) {
        mainLine.transition(transition).attr('d', linePath(data))
        mainArea.transition(transition).attr('d', areaPath(data))
    } else {
        mainLine.attr('d', linePath(data))
        mainArea.attr('d', areaPath(data))
    }

    if (inst.baselineLine) {
        if (transition) {
            inst.baselineLine.transition(transition).attr('y1', zeroY).attr('y2', zeroY)
        } else {
            inst.baselineLine.attr('y1', zeroY).attr('y2', zeroY)
        }
    }
    if (inst.baselineLabel) {
        if (transition) inst.baselineLabel.transition(transition).attr('y', zeroY - 6)
        else inst.baselineLabel.attr('y', zeroY - 6)
    }
    if (inst.preIndustrialLine) {
        if (transition) {
            inst.preIndustrialLine.transition(transition).attr('y1', preIndustrialY).attr('y2', preIndustrialY)
        } else {
            inst.preIndustrialLine.attr('y1', preIndustrialY).attr('y2', preIndustrialY)
        }
    }
    if (inst.preIndustrialLabel) {
        if (transition) inst.preIndustrialLabel.transition(transition).attr('y', preIndustrialY - 6)
        else inst.preIndustrialLabel.attr('y', preIndustrialY - 6)
    }

    const x1951 = inst.x(1951)
    const x1980 = inst.x(1980)
    const moveX = (sel, xVal) => {
        if (!sel) return
        if (transition) sel.transition(transition).attr('x1', xVal).attr('x2', xVal)
        else sel.attr('x1', xVal).attr('x2', xVal)
    }
    moveX(inst.refLine1951, x1951)
    moveX(inst.refLine1980, x1980)
    if (inst.refYearLabel1951) {
        if (transition) inst.refYearLabel1951.transition(transition).attr('x', x1951 + 4)
        else inst.refYearLabel1951.attr('x', x1951 + 4)
    }
    if (inst.refYearLabel1980) {
        if (transition) inst.refYearLabel1980.transition(transition).attr('x', x1980 + 4)
        else inst.refYearLabel1980.attr('x', x1980 + 4)
    }

    const extrapLineGen = d3
        .line()
        .x((d) => inst.x(d.year))
        .y((d) => inst.y(d.anomaly))
    inst.extrapLineGen = extrapLineGen

    const hasSegment = extrap && extrap.endYear > extrap.lastYear + 1e-6
    const extrapData = hasSegment && enabled ? [extrap] : []

    const extrapSel = g.selectAll('.extrap-line').data(extrapData, () => 'extrap')

    const extrapEnter = extrapSel
        .enter()
        .append('path')
        .attr('class', 'extrap-line')
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-heading)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6 5')
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0)
        .attr('d', (d) => extrapLineGen(d.segment))

    if (enabled && hasSegment) {
        const pathNode = extrapEnter.node()
        if (pathNode && transition) {
            const len = pathNode.getTotalLength()
            extrapEnter
                .attr('stroke-dasharray', `${len} ${len}`)
                .attr('stroke-dashoffset', len)
        }
    }

    extrapSel
        .exit()
        .transition(transition)
        .attr('opacity', 0)
        .remove()

    const extrapMerged = extrapEnter.merge(extrapSel)

    if (transition) {
        extrapMerged
            .transition(transition)
            .attr('d', (d) => extrapLineGen(d.segment))
            .attr('opacity', enabled && hasSegment ? 0.9 : 0)
            .on('end', function () {
                if (enabled && hasSegment) {
                    d3.select(this).attr('stroke-dasharray', '6 5').attr('stroke-dashoffset', 0)
                }
            })
    } else if (enabled && hasSegment) {
        extrapMerged
            .attr('d', (d) => extrapLineGen(d.segment))
            .attr('opacity', 0.9)
            .attr('stroke-dasharray', '6 5')
            .attr('stroke-dashoffset', 0)
    } else {
        extrapMerged.attr('opacity', 0)
    }
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
        buildChart(chartRef.value, annualDataRef.value, extrapolate.value)
    }
})

watch(extrapolate, async (enabled) => {
    await nextTick()
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (chartInstance) {
        setExtrapolateMode(enabled, animate)
    } else if (chartRef.value && annualDataRef.value.length) {
        buildChart(chartRef.value, annualDataRef.value, enabled)
    }
})

onBeforeUnmount(() => {
    chartInstance = null
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

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as d3 from 'd3'

const chartRef = ref(null)
const tooltipEl = ref(null)
const annualDataRef = ref([])
const extrapolate = ref(false)
/** Anomaly (°C) of the clicked horizontal guide, or null for default instructions. */
const selectedRefAnomaly = ref(null)

const DEFAULT_GUIDE = {
    title: 'How to use this chart',
    paragraphs: [
        'This chart shows NASA GISS global land–ocean temperature anomalies in degrees Celsius (°C). Each value is how far the annual global mean temperature is above or below the 1951–1980 average—the baseline NASA uses for the Land-Ocean Temperature Index (LOTI).',
        'Move the cursor over the temperature line to see the anomaly for a given year.',
        'Enable Extrapolate to extend the recent 40-year warming trend forward (dashed segment).',
        'Click on a horizontal line to learn more about that temperature anomaly.',
    ],
}

const REFERENCE_LINE_DETAILS = {
    '0': {
        title: '1951–1980 average — 0 °C anomaly',
        paragraphs: [
            'Placeholder: The 1951–1980 average is NASA’s reference period for GISTEMP anomalies. Years at 0 °C align with the mean global temperature observed across those three decades.',
        ],
    },
    '-0.19': {
        title: 'Pre-industrial average — −0.19 °C anomaly',
        paragraphs: [
            'Placeholder: Relative to the 1951–1980 baseline, pre-industrial conditions sit about 0.19 °C cooler. This line helps compare modern warming to long-run climate before industrial emissions dominated.',
        ],
    },
    '1.31': {
        title: '1.5 °C above pre-industrial — +1.31 °C anomaly',
        paragraphs: [
        'What becomes likely here:',
        'Coral reef collapse accelerates',
        '70–90% of warm-water coral reefs may disappear',
        'repeated bleaching events prevent recovery',
        'reef ecosystems stop functioning normally',
        'Arctic summer sea ice becomes unstable',
        'nearly ice-free summers become increasingly possible',
        'Arctic warming accelerates due to albedo loss',
        'Major heatwaves become common',
        'What used to be “once per century” heat extremes become regular.',
        'Boreal forests begin large-scale stress',
        'Canada + Siberia see:',
        'mega-fires',
        'bark beetle outbreaks',
        'drought mortality',
        'Species migration accelerates',
        'Many ecosystems can still survive here — but they begin reorganizing geographically.',
        ],
    },
    '1.81': {
        title: '2 °C above pre-industrial — +1.81 °C anomaly',
        paragraphs: [
        'Major irreversible systems become threatened',
        'Greenland Ice Sheet may pass a tipping point',

        'The concern here is not immediate collapse — it’s committed collapse.',

        'Once enough ice is lost:',

        'elevation drops',
        'melting accelerates',
        'long-term disintegration continues for centuries',

        'Potential long-term sea level rise:',

        '~7 meters eventually',
        'Amazon rainforest dieback risk rises sharply',

        'The rainforest may begin partially converting into:',

        'dry forest',
        'savanna',

        'because rainfall recycling weakens.',

        'This creates a dangerous carbon feedback:',

        'dying forest releases CO₂',
        'warming accelerates further',
        'Coral reefs mostly disappear',

        'At ~2°C, scientists project the near-total loss of warm-water coral ecosystems.',

        'Water stress and crop instability expand',

        'Large regions experience:',

        'chronic drought',
        'stronger flood cycles',
        'heat stress on agriculture',
        'Extreme rainfall intensifies',

        'Flooding risk rises substantially in many regions.',
        ],
    },
    '2.81': {
        title: '3 °C above pre-industrial — +2.81 °C anomaly',
        paragraphs: [
        'Ecosystem-level restructuring',
        'Large portions of the Amazon may collapse',

        'Not just drought years —',
        'the biome itself changes state.',

        'Permafrost thaw becomes a major feedback source',

        'Large methane and CO₂ releases begin contributing significantly to warming.',

        'Boreal forests may transition ecosystems',

        'Some areas may fail to regrow as forest after fires.',

        'Instead:',

        'shrubland',
        'grassland',
        'sparse woodland',

        'replace them.',

        'Heat becomes physiologically dangerous in some regions',

        'Certain humid heat events may approach survivability limits for humans outdoors.',

        'Food systems destabilize more regularly',

        'Crop failures become more correlated globally:',

        'simultaneous droughts',
        'heatwaves across multiple breadbaskets',
        ],
    },
    '3.81': {
        title: '4 °C above pre-industrial — +3.81 °C anomaly',
        paragraphs: [
        'This is generally considered a profoundly destabilized Earth system.',

        'Not “human extinction,” but:',

        'massive adaptation pressure',
        'severe migration',
        'chronic food/water insecurity in many regions',
        'Possible outcomes here',
        'West Antarctic Ice Sheet instability becomes much more likely',

        'This could commit the world to multi-meter sea level rise over centuries.',

        'Entire climate zones shift',

        'Regions that historically supported:',

        'agriculture',
        'forests',
        'dense populations',

        'may no longer reliably do so.',

        'Extreme weather becomes the dominant climate experience',

        'What we currently call:',

        'heatwaves',
        'megafires',
        '“100-year floods”',

        'becomes routine in many places.',

        'Ecosystem simplification',

        'Biodiversity drops sharply because:',

        'migration speed cannot keep up',
        'ecosystems fragment',
        'food webs destabilize',
        ],
    },
}

const guidePanel = computed(() => {
    if (selectedRefAnomaly.value == null) return DEFAULT_GUIDE
    const key = String(selectedRefAnomaly.value)
    return REFERENCE_LINE_DETAILS[key] ?? DEFAULT_GUIDE
})

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

/** Horizontal guides (°C anomaly vs 1951–1980). Warming levels ≈ pre-industrial + 1.5 / 2 / 3 / 4 °C. */
const HORIZONTAL_REFERENCE_LINES = [
    { anomaly: 0, label: '1951–1980 average', showRefYears: true, lineClass: 'baseline' },
    {
        anomaly: PRE_INDUSTRIAL_ANOMALY,
        label: 'Pre-industrial average',
        lineClass: 'baseline baseline-preindustrial',
    },
    { anomaly: 1.31, label: '1.5 °C above pre-industrial', lineClass: 'baseline baseline-warming' },
    { anomaly: 1.81, label: '2 °C above pre-industrial', lineClass: 'baseline baseline-warming' },
    { anomaly: 2.81, label: '3 °C above pre-industrial', lineClass: 'baseline baseline-warming' },
    { anomaly: 3.81, label: '4 °C above pre-industrial', lineClass: 'baseline baseline-warming' },
]

const REFERENCE_ANOMALIES = HORIZONTAL_REFERENCE_LINES.map((spec) => spec.anomaly)

function yDomainForData(data, extrap, extrapolateMode) {
    const yExtent = d3.extent(data, (d) => d.anomaly)
    const yPadding = 0.15

    if (extrapolateMode) {
        const yMaxExtrap = extrap
            ? Math.max(extrap.endAnomaly, EXTRAP_TARGET_ANOMALY)
            : yExtent[1]
        const yMin = Math.min(yExtent[0], ...REFERENCE_ANOMALIES, 0, PRE_INDUSTRIAL_ANOMALY) - yPadding
        const yMax = Math.max(yExtent[1], yMaxExtrap, ...REFERENCE_ANOMALIES) + yPadding
        return [yMin, yMax]
    }

    const yMin = Math.min(yExtent[0], 0, PRE_INDUSTRIAL_ANOMALY) - yPadding
    const yMax = Math.max(yExtent[1], 0) + yPadding
    return [yMin, yMax]
}

function syncHorizontalRefVisibility(inst) {
    const [yMin, yMax] = inst.y.domain()
    for (const ref of inst.horizontalRefs) {
        const inDomain = ref.anomaly >= yMin && ref.anomaly <= yMax
        const yPx = inst.y(ref.anomaly)
        const inView = inDomain && yPx >= 0 && yPx <= inst.height
        ref.inView = inView
        ref.line?.attr('visibility', inView ? 'visible' : 'hidden')
        if (!inView) {
            ref.label?.attr('visibility', 'hidden')
            ref.line?.attr('stroke-dasharray', '4 4')
            ref.refLine1951?.attr('visibility', 'hidden')
            ref.refLine1980?.attr('visibility', 'hidden')
            ref.refYearLabel1951?.attr('visibility', 'hidden')
            ref.refYearLabel1980?.attr('visibility', 'hidden')
        }
    }
}

function createHorizontalReferences(g, y, x, width, height) {
    const refs = []
    for (const spec of HORIZONTAL_REFERENCE_LINES) {
        const yPx = y(spec.anomaly)

        const line = g
            .append('line')
            .attr('class', spec.lineClass)
            .attr('data-anomaly', spec.anomaly)
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', yPx)
            .attr('y2', yPx)
            .attr('stroke-dasharray', '4 4')

        const label = g
            .append('text')
            .attr('class', 'baseline-label')
            .attr('x', width - 4)
            .attr('y', yPx - 6)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'auto')
            .attr('visibility', 'hidden')
            .text(spec.label)

        const ref = { spec, anomaly: spec.anomaly, line, label, inView: false }

        if (spec.showRefYears) {
            const x1951 = x(1951)
            const x1980 = x(1980)
            const refYearLabelY = height - 8
            ref.refLine1951 = g
                .append('line')
                .attr('class', 'baseline-ref-year')
                .attr('y1', 0)
                .attr('y2', height)
                .attr('x1', x1951)
                .attr('x2', x1951)
                .attr('visibility', 'hidden')
            ref.refLine1980 = g
                .append('line')
                .attr('class', 'baseline-ref-year')
                .attr('y1', 0)
                .attr('y2', height)
                .attr('x1', x1980)
                .attr('x2', x1980)
                .attr('visibility', 'hidden')
            ref.refYearLabel1951 = g
                .append('text')
                .attr('class', 'baseline-ref-year-label')
                .attr('x', x1951 + 4)
                .attr('y', refYearLabelY)
                .attr('text-anchor', 'start')
                .attr('dominant-baseline', 'auto')
                .attr('visibility', 'hidden')
                .text('1951')
            ref.refYearLabel1980 = g
                .append('text')
                .attr('class', 'baseline-ref-year-label')
                .attr('x', x1980 + 4)
                .attr('y', refYearLabelY)
                .attr('text-anchor', 'start')
                .attr('dominant-baseline', 'auto')
                .attr('visibility', 'hidden')
                .text('1980')
        }

        refs.push(ref)
    }
    return refs
}

function applyHorizontalRefHighlight(inst, hoverRef) {
    const pinned =
        selectedRefAnomaly.value != null
            ? inst.horizontalRefs.find(
                  (r) => r.anomaly === selectedRefAnomaly.value && r.inView,
              )
            : null
    setActiveHorizontalRef(inst, hoverRef ?? pinned ?? null)
}

function setActiveHorizontalRef(inst, activeRef) {
    for (const ref of inst.horizontalRefs) {
        if (!ref.inView) continue
        const active = ref === activeRef
        ref.line?.attr('stroke-dasharray', active ? null : '4 4')
        ref.label?.attr('visibility', active ? 'visible' : 'hidden')
        ref.refLine1951?.attr('visibility', active && ref.spec.showRefYears ? 'visible' : 'hidden')
        ref.refLine1980?.attr('visibility', active && ref.spec.showRefYears ? 'visible' : 'hidden')
        ref.refYearLabel1951?.attr(
            'visibility',
            active && ref.spec.showRefYears ? 'visible' : 'hidden',
        )
        ref.refYearLabel1980?.attr(
            'visibility',
            active && ref.spec.showRefYears ? 'visible' : 'hidden',
        )
    }
}

function hitHorizontalRef(inst, pointerY) {
    let best = null
    let bestDist = inst.BASELINE_HIT_PX + 1
    for (const ref of inst.horizontalRefs) {
        if (!ref.inView) continue
        const yPx = inst.y(ref.anomaly)
        const dist = Math.abs(pointerY - yPx)
        if (dist <= inst.BASELINE_HIT_PX && dist < bestDist) {
            bestDist = dist
            best = ref
        }
    }
    return best
}

function updateHorizontalRefPositions(inst, transition) {
    for (const ref of inst.horizontalRefs) {
        const yPx = inst.y(ref.anomaly)
        if (ref.line) {
            if (transition) {
                ref.line.transition(transition).attr('y1', yPx).attr('y2', yPx)
            } else {
                ref.line.attr('y1', yPx).attr('y2', yPx)
            }
        }
        if (ref.label) {
            if (transition) ref.label.transition(transition).attr('y', yPx - 6)
            else ref.label.attr('y', yPx - 6)
        }
        if (ref.spec.showRefYears) {
            const x1951 = inst.x(1951)
            const x1980 = inst.x(1980)
            if (ref.refLine1951) {
                if (transition) {
                    ref.refLine1951.transition(transition).attr('x1', x1951).attr('x2', x1951)
                } else {
                    ref.refLine1951.attr('x1', x1951).attr('x2', x1951)
                }
            }
            if (ref.refLine1980) {
                if (transition) {
                    ref.refLine1980.transition(transition).attr('x1', x1980).attr('x2', x1980)
                } else {
                    ref.refLine1980.attr('x1', x1980).attr('x2', x1980)
                }
            }
            if (ref.refYearLabel1951) {
                if (transition) ref.refYearLabel1951.transition(transition).attr('x', x1951 + 4)
                else ref.refYearLabel1951.attr('x', x1951 + 4)
            }
            if (ref.refYearLabel1980) {
                if (transition) ref.refYearLabel1980.transition(transition).attr('x', x1980 + 4)
                else ref.refYearLabel1980.attr('x', x1980 + 4)
            }
        }
    }
    inst.zeroY = inst.y(0)
    inst.preIndustrialY = inst.y(PRE_INDUSTRIAL_ANOMALY)
    syncHorizontalRefVisibility(inst)
    applyHorizontalRefHighlight(inst, null)
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

    const [yMin, yMax] = yDomainForData(data, extrap, extrapolateMode)
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

    const BASELINE_HIT_PX = 10
    const horizontalRefs = createHorizontalReferences(g, y, x, width, height)

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
            const hoverRef = hitHorizontalRef(inst, my)
            applyHorizontalRefHighlight(inst, hoverRef)
            this.style.cursor = hoverRef ? 'pointer' : 'crosshair'
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
        .on('click', function (event) {
            const inst = chartInstance
            if (!inst) return
            const [, my] = d3.pointer(event, this)
            const hit = hitHorizontalRef(inst, my)
            selectedRefAnomaly.value = hit ? hit.anomaly : null
            applyHorizontalRefHighlight(inst, hit)
        })
        .on('mouseleave', () => {
            const inst = chartInstance
            if (!inst) return
            inst.hoverLine.attr('visibility', 'hidden')
            inst.tooltip.classList.remove('visible')
            applyHorizontalRefHighlight(inst, null)
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
        horizontalRefs,
        zeroY: y(0),
        preIndustrialY: y(PRE_INDUSTRIAL_ANOMALY),
        BASELINE_HIT_PX,
        bisect,
        hoverLine,
        tooltip,
    }

    syncHorizontalRefVisibility(chartInstance)
    applyHorizontalRefHighlight(chartInstance, null)
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
    const [yMin, yMax] = yDomainForData(data, extrap, enabled)

    inst.extrapolateMode = enabled
    inst.extrap = extrap
    inst.lastDataYear = lastDataYear

    const transition = animate
        ? d3.transition().duration(EXTRAP_TRANSITION_MS).ease(d3.easeCubicInOut)
        : null

    inst.x.domain([xMin, xMax])
    inst.y.domain([yMin, yMax])

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

    updateHorizontalRefPositions(inst, transition)

    if (selectedRefAnomaly.value != null) {
        const stillVisible = inst.horizontalRefs.some(
            (r) => r.anomaly === selectedRefAnomaly.value && r.inView,
        )
        if (!stillVisible) selectedRefAnomaly.value = null
    }
    applyHorizontalRefHighlight(inst, null)

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
        <div class="temperature-chart-layout">
            <aside class="guide-panel" aria-live="polite">
                <div class="panel-head">
                    <span class="panel-head-label">{{ guidePanel.title }}</span>
                    <button
                        type="button"
                        class="play-button"
                        :aria-pressed="extrapolate"
                        :aria-label="
                            extrapolate
                                ? 'Turn off temperature extrapolation'
                                : 'Turn on temperature extrapolation'
                        "
                        @click="extrapolate = !extrapolate"
                    >
                        {{ extrapolate ? 'Extrapolate on' : 'Extrapolate' }}
                    </button>
                </div>
                <p
                    v-for="(paragraph, index) in guidePanel.paragraphs"
                    :key="index"
                    class="guide-panel-text"
                >
                    {{ paragraph }}
                </p>
            </aside>
            <div class="chart-column">
                <div ref="chartRef" class="chart-container"></div>
            </div>
        </div>
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

.temperature-chart-layout {
    display: flex;
    align-items: stretch;
    gap: 1rem;
}

.guide-panel {
    flex: 0 0 min(280px, 34%);
    max-width: 320px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 0.75rem;
    background: var(--color-background-soft);
    display: flex;
    flex-direction: column;
    align-self: stretch;
    min-height: 500px;
    max-height: 500px;
    overflow-y: auto;
}

.panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
}

.panel-head-label {
    font-family: 'Cantarell', 'Roboto Condensed', sans-serif;
    font-size: 1rem;
    line-height: 1.3;
    font-weight: 600;
    color: var(--color-heading);
    flex: 1;
    min-width: 0;
}

.play-button {
    flex-shrink: 0;
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

.guide-panel-text {
    margin: 0 0 0.75rem;
    font-size: 0.88rem;
    line-height: 1.55;
    color: var(--color-text);
}

.guide-panel-text:last-child {
    margin-bottom: 0;
}

.chart-column {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.chart-container {
    position: relative;
    width: 100%;
    min-height: 360px;
}

.chart-container :deep(.chart-overlay) {
    cursor: crosshair;
}

.chart-container :deep(.baseline) {
    cursor: pointer;
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

.chart-container :deep(.baseline-warming) {
    stroke-opacity: 0.38;
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

@media (max-width: 720px) {
    .temperature-chart-layout {
        flex-direction: column;
        align-items: stretch;
    }

    .guide-panel {
        flex: none;
        max-width: none;
        width: 100%;
    }
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

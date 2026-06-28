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
    blocks: [
        {
            type: 'paragraph',
            text: 'This chart shows NASA GISS global land–ocean temperature anomalies in degrees Celsius (°C). Each value is how far the annual global mean temperature is above or below the 1951–1980 average—the baseline NASA uses for the Land-Ocean Temperature Index (LOTI).',
        },
        {
            type: 'paragraph',
            text: 'Move the cursor over the temperature line to see the anomaly for a given year.',
        },
        {
            type: 'paragraph',
            text: 'Enable Extrapolate to extend the recent 40-year warming trend forward (dashed segment).',
        },
        {
            type: 'paragraph',
            text: 'Click on a horizontal line to learn more about that temperature anomaly.',
        },
    ],
}

const REFERENCE_LINE_DETAILS = {
    '0': {
        title: '1951–1980 average — 0°C anomaly',
        blocks: [
            {
                type: 'paragraph',
                text: 'The 1951–1980 average is NASA’s reference period for GISTEMP anomalies. Years at 0 °C align with the mean global temperature observed across those three decades.',
            },
        ],
    },
    '-0.19': {
        title: 'Pre-industrial average — −0.19°C anomaly',
        blocks: [
            {
                type: 'paragraph',
                text: 'Relative to the 1951–1980 baseline, pre-industrial conditions sit about 0.19 °C cooler. This line helps compare modern warming to long-run climate before industrial emissions dominated. Often used as a reference point for comparing tipping points to pre-industrial conditions.',
            },
        ],
    },
    '1.31': {
        title: '1.5°C above pre-industrial / +1.31°C anomaly',
        blocks: [
            { type: 'paragraph', text: 'What becomes likely here:' },
            { type: 'heading', text: 'Coral reef collapse accelerates' },
            {
                type: 'list',
                items: [
                    '70–90% of warm-water coral reefs may disappear',
                    'Repeated bleaching events prevent recovery',
                    'Reef ecosystems stop functioning normally',
                ],
            },
            { type: 'heading', text: 'Arctic summer sea ice becomes unstable' },
            {
                type: 'list',
                items: [
                    'Nearly ice-free summers become increasingly possible',
                    'Arctic warming accelerates due to albedo loss',
                ],
            },
            { type: 'heading', text: 'Major heatwaves become common' },
            {
                type: 'paragraph',
                text: 'What used to be “once per century” heat extremes become regular.',
            },
            { type: 'heading', text: 'Boreal forests begin large-scale stress' },
            { type: 'paragraph', text: 'Canada + Siberia see:' },
            {
                type: 'list',
                items: ['Mega-fires', 'Bark beetle outbreaks', 'Drought mortality'],
            },
            { type: 'heading', text: 'Species migration accelerates' },
            {
                type: 'paragraph',
                text: 'Many ecosystems can still survive here — but they begin reorganizing geographically.',
            },
        ],
    },
    '1.81': {
        title: '2°C above pre-industrial / +1.81°C anomaly',
        blocks: [
            { type: 'paragraph', text: 'Major irreversible systems become threatened.' },
            { type: 'heading', text: 'Greenland Ice Sheet may pass a tipping point' },
            { type: 'paragraph', text: 'Once enough ice is lost:' },
            {
                type: 'list',
                items: [
                    'Elevation drops',
                    'Melting accelerates',
                    'Long-term disintegration continues for centuries',
                ],
            },
            { type: 'paragraph', text: 'Potential long-term sea level rise:' },
            { type: 'list', items: ['~7 meters eventually'] },
            { type: 'heading', text: 'Amazon rainforest dieback risk rises sharply' },
            { type: 'paragraph', text: 'The rainforest may begin partially converting into:' },
            { type: 'list', items: ['Dry forest', 'Savanna'] },
            { type: 'paragraph', text: '…because rainfall recycling weakens.' },
            { type: 'paragraph', text: 'This creates a dangerous carbon feedback:' },
            {
                type: 'list',
                items: ['Dying forest releases CO₂', 'Warming accelerates further'],
            },
            { type: 'heading', text: 'Coral reefs mostly disappear' },
            {
                type: 'paragraph',
                text: 'At ~2°C, scientists project the near-total loss of warm-water coral ecosystems.',
            },
            { type: 'heading', text: 'Water stress and crop instability expand' },
            { type: 'paragraph', text: 'Large regions experience:' },
            {
                type: 'list',
                items: [
                    'Chronic drought',
                    'Stronger flood cycles',
                    'Heat stress on agriculture',
                ],
            },
            { type: 'heading', text: 'Extreme rainfall intensifies' },
            { type: 'paragraph', text: 'Flooding risk rises substantially in many regions.' },
        ],
    },
    '2.81': {
        title: '3°C above pre-industrial / +2.81°C anomaly',
        blocks: [
            { type: 'paragraph', text: 'Ecosystem-level restructuring.' },
            { type: 'heading', text: 'Large portions of the Amazon may collapse' },
            {
                type: 'paragraph',
                text: 'Not just drought years — the biome itself changes state.',
            },
            { type: 'heading', text: 'Permafrost thaw becomes a major feedback source' },
            {
                type: 'paragraph',
                text: 'Large methane and CO₂ releases begin contributing significantly to warming.',
            },
            { type: 'heading', text: 'Boreal forests may transition ecosystems' },
            { type: 'paragraph', text: 'Some areas may fail to regrow as forest after fires.' },
            { type: 'paragraph', text: 'Instead:' },
            { type: 'list', items: ['Shrubland', 'Grassland', 'Sparse woodland'] },
            { type: 'paragraph', text: '…replace them.' },
            { type: 'heading', text: 'Heat becomes physiologically dangerous in some regions' },
            {
                type: 'paragraph',
                text: 'Certain humid heat events may approach survivability limits for humans outdoors.',
            },
            { type: 'heading', text: 'Food systems destabilize more regularly' },
            { type: 'paragraph', text: 'Crop failures become more correlated globally:' },
            {
                type: 'list',
                items: ['Simultaneous droughts', 'Heatwaves across multiple breadbaskets'],
            },
        ],
    },
    '3.81': {
        title: '4°C above pre-industrial / +3.81°C anomaly',
        blocks: [
            {
                type: 'paragraph',
                text: 'This is generally considered a profoundly destabilized Earth system.',
            },
            { type: 'paragraph', text: 'Not “human extinction,” but:' },
            {
                type: 'list',
                items: [
                    'Massive adaptation pressure',
                    'Severe migration',
                    'Chronic food/water insecurity in many regions',
                ],
            },
            { type: 'paragraph', text: 'Possible outcomes:' },
            { type: 'heading', text: 'West Antarctic Ice Sheet instability becomes much more likely' },
            {
                type: 'paragraph',
                text: 'This could commit the world to multi-meter sea level rise over centuries.',
            },
            { type: 'heading', text: 'Entire climate zones shift' },
            { type: 'paragraph', text: 'Regions that historically supported:' },
            { type: 'list', items: ['Agriculture', 'Forests', 'Dense populations'] },
            { type: 'paragraph', text: '…may no longer reliably do so.' },
            { type: 'heading', text: 'Extreme weather becomes the dominant climate experience' },
            { type: 'paragraph', text: 'What we currently call:' },
            { type: 'list', items: ['Heatwaves', 'Megafires', '“100-year floods”'] },
            { type: 'paragraph', text: '…becomes routine in many places.' },
            { type: 'heading', text: 'Ecosystem simplification' },
            { type: 'paragraph', text: 'Biodiversity drops sharply because:' },
            {
                type: 'list',
                items: [
                    'Migration speed cannot keep up',
                    'Ecosystems fragment',
                    'Food webs destabilize',
                ],
            },
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
/** Cap width (px) of the I-beam that visualizes anomaly vs the 1951–1980 baseline. */
const HOVER_IBEAM_CAP_WIDTH = 12

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

/** Anomalies for the four tipping-point threshold lines (1.5/2/3/4 °C above pre-industrial). */
const TIPPING_POINT_ANOMALIES = [1.31, 1.81, 2.81, 3.81]

/**
 * Right-side reference indicators shown when a tipping-point line is selected.
 * Each row is a beam comparing the latest year's anomaly against a baseline.
 */
const LATEST_REF_INDICATORS = [
    { key: 'baseline', refAnomaly: 0, label: 'vs 1951–80' },
    { key: 'preindustrial', refAnomaly: PRE_INDUSTRIAL_ANOMALY, label: 'vs pre-industrial' },
]

const LATEST_INDICATOR_CAP_WIDTH = 12
const LATEST_INDICATOR_LABEL_GAP = 6
/** Distance from the left edge of the plot area to the center of the leftmost beam. */
const LATEST_INDICATOR_LEFT_INSET = 14
/** Horizontal spacing (px) between the two beam centers. */
const LATEST_INDICATOR_BEAM_SPACING = 96

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

function createLatestRefIndicator(g) {
    const group = g
        .append('g')
        .attr('class', 'latest-ref-indicator')
        .attr('visibility', 'hidden')
        .style('pointer-events', 'none')
    const slots = LATEST_REF_INDICATORS.map((spec) => {
        const stem = group.append('line').attr('class', 'hover-ibeam-stem')
        const capTop = group.append('line').attr('class', 'hover-ibeam-cap')
        const capBottom = group.append('line').attr('class', 'hover-ibeam-cap')
        const valueText = group
            .append('text')
            .attr('class', 'latest-ref-indicator-value')
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'baseline')
        const refText = group
            .append('text')
            .attr('class', 'latest-ref-indicator-ref')
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'hanging')
        return { spec, stem, capTop, capBottom, valueText, refText }
    })
    return { group, slots }
}

function updateLatestRefIndicator(inst) {
    if (!inst?.latestRefIndicator) return
    const { latestRefIndicator, y, colorForAnomaly } = inst
    const selected = selectedRefAnomaly.value
    const isTippingPoint =
        selected != null && TIPPING_POINT_ANOMALIES.some((a) => Math.abs(a - selected) < 1e-6)
    if (!isTippingPoint) {
        latestRefIndicator.group.attr('visibility', 'hidden')
        return
    }

    const thresholdY = y(selected)
    const color = colorForAnomaly(selected)
    const capHalf = LATEST_INDICATOR_CAP_WIDTH / 2
    const leftBeamX = LATEST_INDICATOR_LEFT_INSET
    const rightBeamX = leftBeamX + LATEST_INDICATOR_BEAM_SPACING

    latestRefIndicator.slots.forEach((slot, i) => {
        const beamX = i === 0 ? leftBeamX : rightBeamX
        const refY = y(slot.spec.refAnomaly)
        const topY = Math.min(thresholdY, refY)
        const bottomY = Math.max(thresholdY, refY)
        const midY = (topY + bottomY) / 2
        const delta = selected - slot.spec.refAnomaly
        const sign = delta >= 0 ? '+' : ''
        const labelAnchorX = beamX + capHalf + LATEST_INDICATOR_LABEL_GAP

        slot.stem
            .attr('x1', beamX)
            .attr('x2', beamX)
            .attr('y1', topY)
            .attr('y2', bottomY)
            .attr('stroke', color)
        slot.capTop
            .attr('x1', beamX - capHalf)
            .attr('x2', beamX + capHalf)
            .attr('y1', topY)
            .attr('y2', topY)
            .attr('stroke', color)
        slot.capBottom
            .attr('x1', beamX - capHalf)
            .attr('x2', beamX + capHalf)
            .attr('y1', bottomY)
            .attr('y2', bottomY)
            .attr('stroke', color)
        slot.valueText
            .attr('x', labelAnchorX)
            .attr('y', midY - 2)
            .text(`${sign}${delta.toFixed(2)} °C`)
        slot.refText
            .attr('x', labelAnchorX)
            .attr('y', midY + 2)
            .text(slot.spec.label)
    })

    latestRefIndicator.group.attr('visibility', 'visible')
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

    const margin = { top: 32, right: 24, bottom: 48, left: 68 }
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

    g.append('text')
        .attr('class', 'axis-y-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -56)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Temperature Anomaly (°C)')

    g.append('text')
        .attr('class', 'axis-x-label')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .text('Year')

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

    const styles = getComputedStyle(container)
    const colorAbove = styles.getPropertyValue('--color-above').trim() || '#cc0000'
    const colorBelow = styles.getPropertyValue('--color-below').trim() || '#525252'
    const colorHeading = styles.getPropertyValue('--color-heading').trim() || '#111111'
    const gradientInterp = d3.interpolateRgb(colorAbove, colorBelow)
    const colorForAnomaly = (anomaly) => {
        if (maxAnomaly === minAnomaly) return colorAbove
        const t = (maxAnomaly - anomaly) / (maxAnomaly - minAnomaly)
        return gradientInterp(Math.max(0, Math.min(1, t)))
    }

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

    const latestRefIndicator = createLatestRefIndicator(g)

    const bisect = d3.bisector((d) => d.year).left
    const hoverIBeam = g
        .append('g')
        .attr('class', 'hover-ibeam')
        .attr('visibility', 'hidden')
    const hoverIBeamStem = hoverIBeam
        .append('line')
        .attr('class', 'hover-ibeam-stem')
        .attr('stroke-linecap', 'butt')
    const hoverIBeamCapTop = hoverIBeam
        .append('line')
        .attr('class', 'hover-ibeam-cap')
        .attr('stroke-linecap', 'butt')
    const hoverIBeamCapBottom = hoverIBeam
        .append('line')
        .attr('class', 'hover-ibeam-cap')
        .attr('stroke-linecap', 'butt')
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
            this.style.cursor = hoverRef ? 'pointer' : 'default'
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
            const yAnomalyPx = inst.y(anomaly)
            const yZeroPx = inst.zeroY
            const beamTop = Math.min(yAnomalyPx, yZeroPx)
            const beamBottom = Math.max(yAnomalyPx, yZeroPx)
            const isExtrapPoint = extrapActive && xVal > inst.lastDataYear
            const beamStroke = isExtrapPoint
                ? inst.colorHeading
                : inst.colorForAnomaly(anomaly)
            const capHalf = HOVER_IBEAM_CAP_WIDTH / 2
            inst.hoverIBeamStem
                .attr('x1', xPos)
                .attr('x2', xPos)
                .attr('y1', beamTop)
                .attr('y2', beamBottom)
                .attr('stroke', beamStroke)
            inst.hoverIBeamCapTop
                .attr('x1', xPos - capHalf)
                .attr('x2', xPos + capHalf)
                .attr('y1', beamTop)
                .attr('y2', beamTop)
                .attr('stroke', beamStroke)
            inst.hoverIBeamCapBottom
                .attr('x1', xPos - capHalf)
                .attr('x2', xPos + capHalf)
                .attr('y1', beamBottom)
                .attr('y2', beamBottom)
                .attr('stroke', beamStroke)
            inst.hoverIBeam.attr('visibility', 'visible')
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
            const alreadySelected =
                hit != null &&
                selectedRefAnomaly.value != null &&
                Math.abs(hit.anomaly - selectedRefAnomaly.value) < 1e-6
            const nextSelection = !hit || alreadySelected ? null : hit.anomaly
            selectedRefAnomaly.value = nextSelection
            applyHorizontalRefHighlight(inst, nextSelection != null ? hit : null)
            updateLatestRefIndicator(inst)
        })
        .on('mouseleave', () => {
            const inst = chartInstance
            if (!inst) return
            inst.hoverLine.attr('visibility', 'hidden')
            inst.hoverIBeam?.attr('visibility', 'hidden')
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
        hoverIBeam,
        hoverIBeamStem,
        hoverIBeamCapTop,
        hoverIBeamCapBottom,
        latestRefIndicator,
        colorForAnomaly,
        colorHeading,
        tooltip,
    }

    syncHorizontalRefVisibility(chartInstance)
    applyHorizontalRefHighlight(chartInstance, null)
    updateLatestRefIndicator(chartInstance)
}

function setExtrapolateMode(enabled, animate = true) {
    const inst = chartInstance
    if (!inst?.g || !inst.data?.length) return

    inst.hoverLine?.attr('visibility', 'hidden')
    inst.hoverIBeam?.attr('visibility', 'hidden')
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
    updateLatestRefIndicator(inst)

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

    extrapSel.exit().remove()

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
    selectedRefAnomaly.value = null
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
        class="m-0 w-full temperature-chart"
        aria-label="Global land-ocean temperature anomaly from 1880 to present"
    >
        <div class="flex items-stretch max-[720px]:flex-col">
            <aside
                class="panel-newsprint newsprint-texture flex max-h-[500px] min-h-[500px] flex-[0_0_min(280px,34%)] flex-col self-stretch overflow-y-auto max-[720px]:max-h-none max-[720px]:min-h-0 max-[720px]:w-full max-[720px]:max-w-none max-[720px]:flex-none"
                aria-live="polite"
            >
                <span class="mb-2.5 min-w-0 font-serif text-base font-semibold leading-snug">{{
                    guidePanel.title
                }}</span>
                <template v-for="(block, index) in guidePanel.blocks" :key="index">
                    <p
                        v-if="block.type === 'paragraph'"
                        class="mb-3 text-sm leading-relaxed last:mb-0"
                    >
                        {{ block.text }}
                    </p>
                    <h3
                        v-else-if="block.type === 'heading'"
                        class="mt-4 mb-2 font-serif text-sm font-bold leading-snug first:mt-0"
                    >
                        {{ block.text }}
                    </h3>
                    <ul
                        v-else-if="block.type === 'list'"
                        class="mb-3 list-disc text-sm leading-relaxed last:mb-0"
                    >
                        <li
                            v-for="(item, i) in block.items"
                            :key="i"
                            class="mb-1 last:mb-0"
                        >
                            {{ item }}
                        </li>
                    </ul>
                </template>
            </aside>
            <div class="temp-chart-container flex min-w-0 flex-1 flex-col">
                <div class="mb-2.5 flex items-center justify-start">
                    <button
                        type="button"
                        class="btn-ghost shrink-0"
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
                <div ref="chartRef" class="chart-container relative w-full min-h-[360px]"></div>
            </div>
        </div>
        <figcaption class="mt-3 font-mono text-xs leading-snug text-neutral-500">
            <strong class="text-newsprint-fg">Source:</strong> NASA GISS — Land-Ocean Temperature Index.
            Anomalies relative to 1951–1980 mean.
        </figcaption>
    </figure>
</template>

<style scoped>
.panel-newsprint {
    overscroll-behavior: none;
}

.chart-container :deep(.chart-overlay) {
    cursor: default;
}

.chart-container :deep(.baseline) {
    cursor: pointer;
}

.chart-container :deep(.hover-line) {
    pointer-events: none;
}

.chart-container :deep(.hover-ibeam) {
    pointer-events: none;
}

.chart-container :deep(.hover-ibeam-stem) {
    stroke-width: 2;
}

.chart-container :deep(.hover-ibeam-cap) {
    stroke-width: 2.5;
}

.chart-container :deep(.latest-ref-indicator) {
    pointer-events: none;
}

.chart-container :deep(.latest-ref-indicator-value) {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    fill: var(--color-text);
}

.chart-container :deep(.latest-ref-indicator-ref) {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.62rem;
    fill: var(--color-muted);
}

.chart-container :deep(.axis) {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.75rem;
    fill: var(--color-muted);
}

.chart-container :deep(.axis path),
.chart-container :deep(.axis line) {
    stroke: var(--color-border);
}

.chart-container :deep(.axis-y-label),
.chart-container :deep(.axis-x-label) {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.72rem;
    fill: var(--color-muted);
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
    font-family: 'Inter', system-ui, sans-serif;
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
    font-family: 'Inter', system-ui, sans-serif;
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

.temp-chart-container {
    border: 1px solid var(--color-border);
    border-left: none;
    padding: 24px;
}
</style>

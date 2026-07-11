<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as d3 from 'd3'
import { TIPPING_ELEMENTS as ALL_ELEMENTS } from '../data/tippingPoints.js'

const chartRef = ref(null)
const tooltipEl = ref(null)
const hoveredIndex = ref(null)
const isMobile = ref(false)

let resizeObserver = null
let resizeTimer = null

const X_MAX = 6.5
const REFERENCE_TEMPS = [1.5, 2, 3, 4]

/** Sorted ascending by best-estimate threshold for the chart's row order. */
const TIPPING_ELEMENTS = [...ALL_ELEMENTS].sort((a, b) => a.best - b.best)

const rowHeight = computed(() => (isMobile.value ? 52 : 38))
const margin = computed(() => ({
    top: 30,
    right: isMobile.value ? 16 : 28,
    bottom: 30,
    left: 8,
}))

const labelColumnStyle = computed(() => ({
    paddingTop: `${margin.value.top}px`,
    paddingBottom: `${margin.value.bottom}px`,
}))

function fmtRange(d) {
    return `${d.low.toFixed(1)}–${d.high.toFixed(1)}°C`
}

function buildChart(container) {
    if (!container) return
    d3.select(container).selectAll('*').remove()

    isMobile.value = container.clientWidth < 560
    const m = margin.value
    const rh = rowHeight.value
    const width = Math.max(240, container.clientWidth) - m.left - m.right
    const height = TIPPING_ELEMENTS.length * rh

    const svg = d3
        .select(container)
        .append('svg')
        .attr('width', container.clientWidth)
        .attr('height', height + m.top + m.bottom)

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const x = d3.scaleLinear().domain([0, X_MAX]).range([0, width])

    const styles = getComputedStyle(container)
    const colorLow = styles.getPropertyValue('--color-below').trim() || '#737373'
    const colorHigh = styles.getPropertyValue('--color-above').trim() || '#cc0000'
    const colorInterp = d3.interpolateRgb(colorLow, colorHigh)
    const bg = styles.getPropertyValue('--color-background').trim() || '#f9f9f7'
    const colorForBest = (best) => {
        const t = (best - 1) / (4.5 - 1)
        return colorInterp(Math.max(0, Math.min(1, t)))
    }

    const xAxis = d3
        .axisBottom(x)
        .ticks(isMobile.value ? 4 : 7)
        .tickFormat((v) => `${v}°C`)
    g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

    g.append('text')
        .attr('class', 'axis-x-label')
        .attr('x', width / 2)
        .attr('y', height + m.bottom - 4)
        .attr('text-anchor', 'middle')
        .text(isMobile.value ? 'Warming (°C)' : 'Warming above pre-industrial (°C)')

    for (const t of REFERENCE_TEMPS) {
        if (t > X_MAX) continue
        const xPx = x(t)
        g.append('line')
            .attr('class', 'ref-line')
            .attr('x1', xPx)
            .attr('x2', xPx)
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke-dasharray', '4 4')
        // Reference-line labels are dropped on mobile: the ~170px plot is too
        // narrow to fit four labels 0.5°C apart without overlap; the intro
        // paragraph above the chart already states what the lines mark.
        if (!isMobile.value) {
            g.append('text')
                .attr('class', 'ref-label')
                .attr('x', xPx)
                .attr('y', -12)
                .attr('text-anchor', 'middle')
                .text(`${t}°C`)
        }
    }

    const tooltip = tooltipEl.value

    const rows = g
        .selectAll('.tp-row')
        .data(TIPPING_ELEMENTS)
        .enter()
        .append('g')
        .attr('class', 'tp-row')
        .attr('transform', (d, i) => `translate(0,${i * rh})`)

    rows
        .append('rect')
        .attr('class', 'tp-row-bg')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', rh)
        .attr('fill', 'transparent')

    rows
        .append('line')
        .attr('class', 'tp-range')
        .attr('x1', (d) => x(d.low))
        .attr('x2', (d) => x(d.high))
        .attr('y1', rh / 2)
        .attr('y2', rh / 2)
        .attr('stroke', (d) => colorForBest(d.best))
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0.65)

    rows
        .append('circle')
        .attr('class', 'tp-best')
        .attr('cx', (d) => x(d.best))
        .attr('cy', rh / 2)
        .attr('r', 5.5)
        .attr('fill', (d) => colorForBest(d.best))
        .attr('stroke', bg)
        .attr('stroke-width', 2)

    rows
        .append('rect')
        .attr('class', 'tp-hit')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', rh)
        .attr('fill', 'transparent')
        .style('pointer-events', 'all')
        .on('mouseenter focus', function (event, d) {
            hoveredIndex.value = TIPPING_ELEMENTS.indexOf(d)
            d3.select(this.parentNode).select('.tp-row-bg').attr('fill', 'var(--color-background-mute)')
            tooltip?.classList.add('visible')
        })
        .on('mousemove', function (event, d) {
            if (!tooltip) return
            const xPos = x(d.best)
            tooltip.innerHTML = `
                <span class="tooltip-year">${d.name}</span>
                <span class="tooltip-value">Best estimate ${d.best.toFixed(1)}°C <span class="tooltip-label">(range ${fmtRange(d)})</span></span>
                <span class="tooltip-label" style="text-transform:none;font-size:0.72rem;display:block;margin-top:0.35rem;max-width:22rem;white-space:normal;">${d.blurb}</span>
                <span class="tooltip-label tooltip-label-baseline">Timescale: ${d.timescale}</span>
            `
            const svgRect = svg.node()?.getBoundingClientRect()
            if (!svgRect) return
            const ttRect = tooltip.getBoundingClientRect()
            const plotLeft = svgRect.left + m.left
            const plotRight = plotLeft + width
            const lineX = plotLeft + xPos
            let left = lineX + 14
            if (left + ttRect.width > plotRight) left = lineX - 14 - ttRect.width
            left = Math.max(8, left)
            const rawTop = svgRect.top + m.top + TIPPING_ELEMENTS.indexOf(d) * rh
            const top = Math.min(window.innerHeight - ttRect.height - 8, Math.max(8, rawTop))
            tooltip.style.left = `${left}px`
            tooltip.style.top = `${top}px`
        })
        .on('mouseleave blur', function () {
            hoveredIndex.value = null
            d3.select(this.parentNode).select('.tp-row-bg').attr('fill', 'transparent')
            tooltip?.classList.remove('visible')
        })
}

function scheduleBuild() {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        if (chartRef.value) buildChart(chartRef.value)
    }, 80)
}

onMounted(async () => {
    const tooltip = document.createElement('div')
    tooltip.setAttribute('class', 'chart-tooltip')
    tooltip.setAttribute('role', 'tooltip')
    document.body.appendChild(tooltip)
    tooltipEl.value = tooltip

    await nextTick()
    if (chartRef.value) buildChart(chartRef.value)

    resizeObserver = new ResizeObserver(scheduleBuild)
    if (chartRef.value) resizeObserver.observe(chartRef.value)
})

onBeforeUnmount(() => {
    clearTimeout(resizeTimer)
    resizeObserver?.disconnect()
    if (tooltipEl.value && tooltipEl.value.parentNode) tooltipEl.value.remove()
})
</script>

<template>
    <figure class="tipping-points-chart m-0 w-full" aria-label="Climate tipping element thresholds by warming level above pre-industrial">
        <div class="flex items-stretch border border-newsprint-fg">
            <div
                class="tp-labels shrink-0 border-r border-newsprint-fg"
                :style="labelColumnStyle"
            >
                <div
                    v-for="(d, i) in TIPPING_ELEMENTS"
                    :key="d.name"
                    class="tp-label-row flex items-center px-3 text-xs leading-snug font-sans"
                    :class="{ 'tp-label-row--active': hoveredIndex === i }"
                    :style="{ height: `${rowHeight}px` }"
                >
                    {{ d.name }}
                </div>
            </div>
            <div ref="chartRef" class="tp-plot min-w-0 flex-1 py-2"></div>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[0.68rem] uppercase tracking-widest text-neutral-500">
            <span class="inline-flex items-center gap-1.5"
                ><span class="inline-block h-2.5 w-2.5 rounded-full border border-newsprint-fg bg-newsprint-accent"></span>Best-estimate threshold</span
            >
            <span class="inline-flex items-center gap-1.5"
                ><span class="inline-block h-0.5 w-4 bg-neutral-500"></span>Assessed uncertainty range</span
            >
            <span>Colour deepens toward red as the best-estimate threshold rises</span>
        </div>
        <figcaption class="mt-3 font-mono text-xs leading-relaxed text-neutral-500">
            <strong class="text-newsprint-fg">Source:</strong> Armstrong McKay, D. I. et al. (2022),
            <em>Science</em> — doi:
            <a href="https://doi.org/10.1126/science.abn7950" rel="noopener noreferrer">10.1126/science.abn7950</a>.
            Thresholds are long-run equilibrium commitments, not necessarily abrupt within a human
            lifetime — see references below for full citations and per-element notes.
        </figcaption>
    </figure>
</template>

<style scoped lang="scss">
.tp-labels {
    width: 132px;
}

@media (min-width: 640px) {
    .tp-labels {
        width: 210px;
    }
}

.tp-label-row {
    color: var(--color-text);
    border-bottom: 1px solid transparent;
    transition: background-color 0.15s ease-out;
}

.tp-label-row--active {
    background-color: var(--color-background-mute);
}

.tp-plot :deep(.axis) {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.72rem;
    fill: var(--color-muted);
}

.tp-plot :deep(.axis path),
.tp-plot :deep(.axis line) {
    stroke: var(--color-border);
}

.tp-plot :deep(.axis-x-label) {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.68rem;
    fill: var(--color-muted);
}

.tp-plot :deep(.ref-line) {
    stroke: var(--color-text);
    stroke-opacity: 0.35;
    stroke-width: 1;
}

.tp-plot :deep(.ref-label) {
    fill: var(--color-text);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.64rem;
    font-weight: 600;
    opacity: 0.75;
}

.tp-plot :deep(.tp-hit) {
    cursor: pointer;
}
</style>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as d3 from 'd3'
import { SECTORS, SOLUTIONS } from '../data/whatCanWeDo.js'

const chartRef = ref(null)
const tooltipEl = ref(null)
const hoveredName = ref(null)
const isMobile = ref(false)

let resizeObserver = null
let resizeTimer = null

const X_MAX = 12

/** Grouped by sector (declared order), sorted descending by high estimate within each group. */
const ROWS = SECTORS.flatMap((sector) => {
    const items = SOLUTIONS.filter((s) => s.sectorId === sector.id).sort((a, b) => b.high - a.high)
    return [{ type: 'header', sector }, ...items.map((s) => ({ type: 'row', ...s }))]
})

const rowHeight = computed(() => (isMobile.value ? 46 : 32))
const headerHeight = computed(() => (isMobile.value ? 34 : 28))
const margin = computed(() => ({
    top: 26,
    right: isMobile.value ? 16 : 32,
    bottom: 34,
    left: 8,
}))

const labelColumnStyle = computed(() => ({
    paddingTop: `${margin.value.top}px`,
    paddingBottom: `${margin.value.bottom}px`,
}))

function fmtRange(d) {
    return d.low === d.high ? `${d.high.toFixed(2)} Gt/yr` : `${d.low.toFixed(1)}–${d.high.toFixed(1)} Gt/yr`
}

function buildChart(container) {
    if (!container) return
    d3.select(container).selectAll('*').remove()

    isMobile.value = container.clientWidth < 560
    const m = margin.value
    const rh = rowHeight.value
    const hh = headerHeight.value
    const totalHeight = ROWS.reduce((acc, r) => acc + (r.type === 'header' ? hh : rh), 0)
    const width = Math.max(240, container.clientWidth) - m.left - m.right

    const svg = d3
        .select(container)
        .append('svg')
        .attr('width', container.clientWidth)
        .attr('height', totalHeight + m.top + m.bottom)

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const x = d3.scaleLinear().domain([0, X_MAX]).range([0, width])

    const styles = getComputedStyle(container)
    const accent = styles.getPropertyValue('--color-newsprint-accent').trim() || '#cc0000'
    const border = styles.getPropertyValue('--color-border').trim() || '#111111'

    const xAxis = d3
        .axisBottom(x)
        .ticks(isMobile.value ? 4 : 7)
        .tickFormat((v) => `${v}`)
    g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0,${totalHeight})`)
        .call(xAxis)

    g.append('text')
        .attr('class', 'axis-x-label')
        .attr('x', width / 2)
        .attr('y', totalHeight + m.bottom - 4)
        .attr('text-anchor', 'middle')
        .text('Estimated Gt CO2-eq avoided or sequestered per year, at full deployment')

    const tooltip = tooltipEl.value

    let y = 0
    for (const r of ROWS) {
        if (r.type === 'header') {
            g.append('line')
                .attr('class', 'group-divider')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', y + hh - 6)
                .attr('y2', y + hh - 6)
            y += hh
            continue
        }

        const row = g.append('g').attr('class', 'wcwd-row').attr('transform', `translate(0,${y})`)

        row
            .append('rect')
            .attr('class', 'wcwd-row-bg')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', rh)
            .attr('fill', 'transparent')

        const barTop = rh * 0.28
        const barHeight = rh * 0.44

        row
            .append('rect')
            .attr('class', 'wcwd-bar-high')
            .attr('x', 0)
            .attr('y', barTop)
            .attr('width', x(r.high))
            .attr('height', barHeight)
            .attr('fill', accent)
            .attr('opacity', 0.28)

        row
            .append('rect')
            .attr('class', 'wcwd-bar-low')
            .attr('x', 0)
            .attr('y', barTop)
            .attr('width', x(r.low))
            .attr('height', barHeight)
            .attr('fill', accent)

        row
            .append('rect')
            .attr('class', 'wcwd-hit')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', rh)
            .attr('fill', 'transparent')
            .style('pointer-events', 'all')
            .on('mouseenter focus', function () {
                hoveredName.value = r.name
                d3.select(this.parentNode).select('.wcwd-row-bg').attr('fill', 'var(--color-background-mute)')
                tooltip?.classList.add('visible')
            })
            .on('mousemove', function () {
                if (!tooltip) return
                tooltip.innerHTML = `
                    <span class="tooltip-year">${r.name}</span>
                    <span class="tooltip-value">${fmtRange(r)}</span>
                    <span class="tooltip-label" style="text-transform:none;font-size:0.72rem;display:block;margin-top:0.35rem;max-width:22rem;white-space:normal;">${r.blurb}</span>
                `
                const svgRect = svg.node()?.getBoundingClientRect()
                if (!svgRect) return
                const ttRect = tooltip.getBoundingClientRect()
                const plotLeft = svgRect.left + m.left
                const plotRight = plotLeft + width
                const barEndX = plotLeft + x(r.high)
                let left = barEndX + 14
                if (left + ttRect.width > plotRight) left = barEndX - 14 - ttRect.width
                left = Math.max(8, left)
                const rawTop = svgRect.top + m.top + y
                const top = Math.min(window.innerHeight - ttRect.height - 8, Math.max(8, rawTop))
                tooltip.style.left = `${left}px`
                tooltip.style.top = `${top}px`
            })
            .on('mouseleave blur', function () {
                hoveredName.value = null
                d3.select(this.parentNode).select('.wcwd-row-bg').attr('fill', 'transparent')
                tooltip?.classList.remove('visible')
            })

        y += rh
    }
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
    <figure class="wcwd-chart m-0 w-full" aria-label="Estimated global mitigation potential by climate solution, in gigatons of CO2 equivalent per year">
        <div class="flex items-stretch border border-newsprint-fg">
            <div class="wcwd-labels shrink-0 border-r border-newsprint-fg" :style="labelColumnStyle">
                <template v-for="(r, i) in ROWS" :key="i">
                    <div
                        v-if="r.type === 'header'"
                        class="wcwd-group-label flex items-end px-3 pb-1.5 font-mono text-[0.62rem] font-semibold tracking-widest text-neutral-500 uppercase"
                        :style="{ height: `${headerHeight}px` }"
                    >
                        {{ r.sector.tag }}
                    </div>
                    <div
                        v-else
                        class="wcwd-label-row flex items-center px-3 text-xs leading-snug font-sans"
                        :class="{ 'wcwd-label-row--active': hoveredName === r.name }"
                        :style="{ height: `${rowHeight}px` }"
                    >
                        {{ r.name }}
                    </div>
                </template>
            </div>
            <div ref="chartRef" class="wcwd-plot min-w-0 flex-1 py-2"></div>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[0.68rem] uppercase tracking-widest text-neutral-500">
            <span class="inline-flex items-center gap-1.5"
                ><span class="inline-block h-2.5 w-4 bg-newsprint-accent"></span>Lower-bound estimate</span
            >
            <span class="inline-flex items-center gap-1.5"
                ><span class="inline-block h-2.5 w-4 bg-newsprint-accent opacity-30"></span>Range extends to upper-bound estimate</span
            >
        </div>
        <figcaption class="mt-3 font-mono text-xs leading-relaxed text-neutral-500">
            <strong class="text-newsprint-fg">Source:</strong> Project Drawdown, Drawdown Explorer / Table of
            Solutions (drawdown.org, accessed 2026). Figures are estimated Gt CO2-eq avoided or sequestered per
            year at full projected deployment — technical/economic potentials, not forecasts. Full citations on
            the Sources page.
        </figcaption>
    </figure>
</template>

<style scoped lang="scss">
.wcwd-labels {
    width: 158px;
}

@media (min-width: 640px) {
    .wcwd-labels {
        width: 236px;
    }
}

.wcwd-label-row {
    color: var(--color-text);
    border-bottom: 1px solid transparent;
    transition: background-color 0.15s ease-out;
}

.wcwd-label-row--active {
    background-color: var(--color-background-mute);
}

.wcwd-group-label {
    border-bottom: 1px dashed var(--color-border);
}

.wcwd-plot :deep(.axis) {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.72rem;
    fill: var(--color-muted);
}

.wcwd-plot :deep(.axis path),
.wcwd-plot :deep(.axis line) {
    stroke: var(--color-border);
}

.wcwd-plot :deep(.axis-x-label) {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.68rem;
    fill: var(--color-muted);
}

.wcwd-plot :deep(.group-divider) {
    stroke: var(--color-border);
    stroke-opacity: 0.35;
    stroke-dasharray: 4 4;
    stroke-width: 1;
}

.wcwd-plot :deep(.wcwd-hit) {
    cursor: pointer;
}
</style>

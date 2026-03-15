<script setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'

const chartRef = ref(null)

onMounted(async () => {
  const base = import.meta.env.BASE_URL
  const raw = await fetch(`${base}data/GLB.Ts+dSST.csv`).then((r) => r.text())
  const lines = raw.trim().split('\n')
  const csvContent = lines.slice(1).join('\n')
  const parsed = d3.csvParse(csvContent)

  const data = parsed
    .filter((d) => d.Year && d['J-D'] && d['J-D'] !== '***')
    .map((d) => ({
      year: +d.Year,
      anomaly: +d['J-D'],
    }))
    .sort((a, b) => a.year - b.year)

  if (!data.length || !chartRef.value) return

  const margin = { top: 32, right: 24, bottom: 48, left: 52 }
  const width = Math.max(320, chartRef.value.clientWidth) - margin.left - margin.right
  const height = 360 - margin.top - margin.bottom

  const x = d3.scaleLinear().domain(d3.extent(data, (d) => d.year)).range([0, width])
  const yExtent = d3.extent(data, (d) => d.anomaly)
  const yPadding = 0.15
  const yMin = Math.min(yExtent[0], 0) - yPadding
  const yMax = Math.max(yExtent[1], 0) + yPadding
  const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0])

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.anomaly))
    .curve(d3.curveMonotoneX)

  const svg = d3
    .select(chartRef.value)
    .append('svg')
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
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
  const defs = g.append('defs')
  const gradient = defs
    .append('linearGradient')
    .attr('id', 'temp-gradient')
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

  g.append('path').attr('class', 'area').attr('d', area(data)).attr('fill', 'url(#temp-gradient)').attr('opacity', 0.25)

  g.append('path')
    .attr('class', 'line')
    .attr('d', line(data))
    .attr('fill', 'none')
    .attr('stroke', 'url(#temp-gradient)')
    .attr('stroke-width', 2.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
})
</script>

<template>
  <figure class="temperature-chart" aria-label="Global land-ocean temperature anomaly from 1880 to present">
    <div ref="chartRef" class="chart-container"></div>
    <figcaption>
      <strong>Source:</strong> NASA GISS — Land-Ocean Temperature Index. Anomalies relative to 1951–1980 mean.
    </figcaption>
  </figure>
</template>

<style scoped>
.temperature-chart {
  margin: 0;
  width: 100%;
}

.chart-container {
  width: 100%;
  min-height: 360px;
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

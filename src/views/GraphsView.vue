<script setup>
import { RouterLink } from 'vue-router'
import TemperatureChart from '../components/TemperatureChart.vue'
import GreenhouseGasChart from '../components/GreenhouseGasChart.vue'
import WorldEmissionsMap from '../components/WorldEmissionsMap.vue'
</script>

<template>
    <Transition name="carousel-fade" appear>
        <article class="page-container max-w-[1440px] newsprint-texture">
            <header class="border-newsprint-fg pb-6">
                <RouterLink class="link-back mb-4 inline-block" to="/">← Climate data</RouterLink>
                <h1 class="mb-10 font-serif text-3xl font-black leading-tight lg:text-4xl">Graphs</h1>
                <p class="m-0 leading-relaxed inverted-section text-neutral-400">
                    Three questions, answered with data: how much has the world warmed, what's
                    causing it, and who's emitting the most. Scroll through each chart in turn, or
                    jump straight to the one you need.
                </p>
            </header>

            <section class="mb-12 last:mb-0" aria-labelledby="temperature-heading">
                <h2 id="temperature-heading" class="section-heading mb-4 text-xl md:text-2xl">
                    How Much Has the World Warmed?
                </h2>
                <p class="mb-6 text-sm leading-relaxed text-neutral-600">
                    Each point shows how much warmer or cooler that year was compared with the
                    mid-20th-century average (1951–1980), in °C. Zero is "normal" for that baseline —
                    everything above it is extra warming, and the trend over the last few decades is
                    unmistakable.
                </p>
                <TemperatureChart />
            </section>

            <section class="mb-12 last:mb-0" aria-labelledby="ghg-heading">
                <h2 id="ghg-heading" class="section-heading mb-4 text-xl md:text-2xl">
                    What's Driving the Warming: Greenhouse Gases
                </h2>
                <p class="mb-6 text-sm leading-relaxed text-neutral-600">
                    The total greenhouse gases released worldwide each year, converted into one
                    common unit (CO₂-equivalent) so gases like methane and CO₂ can be added together
                    and compared. The dashed line marks the mid-20th-century average, so you can see
                    how far — and how fast — emissions have climbed past it.
                </p>
                <GreenhouseGasChart />
            </section>

            <section class="mb-0" aria-labelledby="map-heading">
                <h2 id="map-heading" class="section-heading mb-4 text-xl md:text-2xl">
                    World Map: Who's Emitting the Most?
                </h2>
                <p class="mb-6 text-sm leading-relaxed text-neutral-600">
                    Every country's greenhouse gas emissions, year by year — darker shading means
                    more emissions. Drag the year slider to watch the picture shift over time, then
                    hover or tap a country to see its breakdown by gas.
                </p>
                <WorldEmissionsMap />
            </section>
        </article>
    </Transition>
</template>

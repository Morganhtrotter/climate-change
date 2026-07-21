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
                    The three core datasets behind this site, gathered on one page: global
                    temperature, world greenhouse gas emissions, and country-level emissions. Scroll
                    through each in turn, or jump straight to the one you need.
                </p>
            </header>

            <section class="mb-12 last:mb-0" aria-labelledby="temperature-heading">
                <h2 id="temperature-heading" class="section-heading mb-4 text-xl md:text-2xl">
                    Global Land-Ocean Temperature Anomaly
                </h2>
                <p class="mb-6 text-sm leading-relaxed text-neutral-600">
                    Annual mean temperature anomaly in °C relative to the 1951–1980 average. Values
                    above zero indicate a warmer world; the trend over the last decades is clear.
                </p>
                <TemperatureChart />
            </section>

            <section class="mb-12 last:mb-0" aria-labelledby="ghg-heading">
                <h2 id="ghg-heading" class="section-heading mb-4 text-xl md:text-2xl">
                    Global Greenhouse Gas Emissions (EARTH)
                </h2>
                <p class="mb-6 text-sm leading-relaxed text-neutral-600">
                    Annual emissions for the PRIMAP-hist aggregate <strong>EARTH</strong> (world
                    total), shown as the Kyoto basket in CO₂ equivalent using AR5 GWP100. The dashed
                    line marks the 1951-1980 average of that series so you can see how quickly totals
                    have risen past the mid-century baseline.
                </p>
                <GreenhouseGasChart />
            </section>

            <section class="mb-0" aria-labelledby="map-heading">
                <h2 id="map-heading" class="section-heading mb-4 text-xl md:text-2xl">
                    Country Greenhouse Gas Emissions World Map
                </h2>
                <p class="mb-6 text-sm leading-relaxed text-neutral-600">
                    Annual country-level greenhouse gas totals from PRIMAP-hist (Kyoto basket, AR5
                    GWP100). Use the year slider to see how national emissions patterns shift over
                    time, then hover a country for gas-level details in the tooltip.
                </p>
                <WorldEmissionsMap />
            </section>
        </article>
    </Transition>
</template>

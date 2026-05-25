<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import TemperatureChart from '../components/TemperatureChart.vue'
import GreenhouseGasChart from '../components/GreenhouseGasChart.vue'
import WorldEmissionsMap from '../components/WorldEmissionsMap.vue'

const entered = ref(false)
const activeSlide = ref(0)
const slideCount = 3
/** After the user has opened slide 3 once, Explore appears above the pagination dots. */
const thirdSlideReached = ref(false)

const canGoPrev = computed(() => activeSlide.value > 0)
const canGoNext = computed(() => activeSlide.value < slideCount - 1)

function enter() {
    entered.value = true
}

function goPrev() {
    if (canGoPrev.value) activeSlide.value -= 1
}

function goNext() {
    if (canGoNext.value) activeSlide.value += 1
}

function goToSlide(index) {
    if (index >= 0 && index < slideCount) activeSlide.value = index
}

function onKeydown(e) {
    if (!entered.value) return
    if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
    } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
    }
}

watch(entered, (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
})

watch(activeSlide, (s) => {
    if (s === 2) thirdSlideReached.value = true
})

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
})
</script>

<template>
    <div v-if="!entered" class="flex min-h-screen flex-col newsprint-texture">
        <div class="flex flex-1 items-center justify-center px-6 py-10 md:px-10">
            <header class="max-w-xl text-center">
                <p class="label-meta mb-4 text-newsprint-accent">Editorial data brief</p>
                <h1 class="font-serif text-4xl font-black leading-[1.1] tracking-tight text-balance md:text-5xl">
                    Climate Change in Data
                </h1>
                <p class="mt-4 font-body text-base leading-relaxed text-neutral-600">
                    Understanding the real impacts of climate change through data. Global temperature
                    anomalies show how far we’ve moved from the 1951–1980 baseline—and why it matters.
                </p>
            </header>
        </div>
        <footer class="flex justify-center px-6 pb-10">
            <button type="button" class="btn-primary hard-shadow-hover" @click="enter">Enter</button>
        </footer>
    </div>

    <Transition name="carousel-fade">
        <div
            v-if="entered"
            class="carousel-shell fixed inset-0 z-10 bg-newsprint-bg"
            role="region"
            aria-roledescription="carousel"
            aria-label="Data sections"
        >
            <div class="h-full w-full overflow-hidden">
                <div
                    class="carousel-track flex h-full"
                    :style="{ transform: `translateX(-${activeSlide * 100}vw)` }"
                >
                    <div
                        class="carousel-slide flex h-full w-screen shrink-0 items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-16 md:px-8 md:py-20"
                        :aria-hidden="activeSlide !== 0"
                    >
                        <div class="slide-inner flex min-h-0 w-full max-w-[1200px] flex-1 flex-col">
                            <section>
                                <h2 class="section-heading mb-4 text-xl md:text-2xl">
                                    Global Land-Ocean Temperature Anomaly
                                </h2>
                                <p class="mb-6 max-w-3xl text-sm leading-relaxed text-neutral-600">
                                    Annual mean temperature anomaly in °C relative to the 1951–1980 average.
                                    Values above zero indicate a warmer world; the trend over the last decades
                                    is clear.
                                </p>
                                <TemperatureChart />
                            </section>
                        </div>
                    </div>

                    <div
                        class="carousel-slide flex h-full w-screen shrink-0 items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-16 md:px-8 md:py-20"
                        :aria-hidden="activeSlide !== 1"
                    >
                        <div class="slide-inner mx-auto w-full max-w-[900px]">
                            <section>
                                <h2 class="section-heading mb-4 text-xl md:text-2xl">
                                    Global Greenhouse Gas Emissions (EARTH)
                                </h2>
                                <p class="mb-6 max-w-3xl text-sm leading-relaxed text-neutral-600">
                                    Annual emissions for the PRIMAP-hist aggregate <strong>EARTH</strong> (world
                                    total), shown as the Kyoto basket in CO₂ equivalent using AR5 GWP100. The
                                    dashed line marks the 1951-1980 average of that series so you can see how
                                    quickly totals have risen past the mid-century baseline.
                                </p>
                                <GreenhouseGasChart />
                            </section>
                        </div>
                    </div>

                    <div
                        class="carousel-slide flex h-full w-screen shrink-0 flex-col items-center justify-start overflow-x-hidden overflow-y-auto px-4 py-16 md:px-8 md:py-20"
                        :aria-hidden="activeSlide !== 2"
                    >
                        <div
                            class="slide-inner flex min-h-0 w-full max-w-[1200px] flex-1 flex-col"
                        >
                            <div class="min-h-0 flex-1 overflow-y-auto">
                                <section>
                                    <h2 class="section-heading mb-4 text-xl md:text-2xl">
                                        Country Greenhouse Gas Emissions World Map
                                    </h2>
                                    <p class="mb-6 max-w-3xl text-sm leading-relaxed text-neutral-600">
                                        Annual country-level greenhouse gas totals from PRIMAP-hist (Kyoto basket,
                                        AR5 GWP100). Use the year slider to see how national emissions patterns shift
                                        over time, then hover a country for gas-level details in the tooltip.
                                    </p>
                                    <WorldEmissionsMap />
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                class="carousel-nav btn-outline hard-shadow-hover fixed top-1/2 left-2 z-20 -translate-y-1/2 px-0 pb-4 font-serif text-3xl disabled:cursor-not-allowed disabled:opacity-35 md:left-4"
                :disabled="!canGoPrev"
                aria-label="Previous slide"
                @click="goPrev"
            >
                ‹
            </button>
            <button
                type="button"
                class="carousel-nav btn-outline hard-shadow-hover fixed top-1/2 right-2 z-20 -translate-y-1/2 px-0 pb-4 font-serif text-3xl disabled:cursor-not-allowed disabled:opacity-35 md:right-4"
                :disabled="!canGoNext"
                aria-label="Next slide"
                @click="goNext"
            >
                ›
            </button>

            <div
                v-if="thirdSlideReached"
                class="fixed bottom-[calc(1.25rem+0.5rem+0.65rem)] left-1/2 z-20 -translate-x-1/2"
            >
                <RouterLink class="btn-primary hard-shadow-hover no-underline" to="/explore"
                    >Explore</RouterLink
                >
            </div>

            <div
                class="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
                role="tablist"
                aria-label="Slide"
            >
                <button
                    v-for="n in slideCount"
                    :key="n"
                    type="button"
                    class="sharp-corners h-2 w-2 border border-newsprint-fg p-0 transition-all duration-200 ease-out"
                    :class="
                        activeSlide === n - 1
                            ? 'bg-newsprint-fg'
                            : 'bg-transparent hover:bg-newsprint-muted'
                    "
                    role="tab"
                    :aria-selected="activeSlide === n - 1"
                    :aria-label="`Go to slide ${n}`"
                    @click="goToSlide(n - 1)"
                />
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.carousel-track {
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
}

.carousel-nav {
    width: 2.75rem;
    height: 3.5rem;
    line-height: 1;
}
</style>

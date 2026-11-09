<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import TemperatureChart from '../components/TemperatureChart.vue'
import GreenhouseGasChart from '../components/GreenhouseGasChart.vue'
import WorldEmissionsMap from '../components/WorldEmissionsMap.vue'
import GuidedTour from '../components/GuidedTour.vue'
import {
    buildTemperatureTourSteps,
    buildGhgTourSteps,
    buildMapTourSteps,
} from '../data/chartTutorials.js'

const entered = ref(false)
const activeSlide = ref(0)
const slideCount = 3
/** After the user has opened slide 3 once, Explore appears above the pagination dots. */
const thirdSlideReached = ref(false)

const canGoPrev = computed(() => activeSlide.value > 0)
const canGoNext = computed(() => activeSlide.value < slideCount - 1)

const tempChartRef = ref(null)
const ghgChartRef = ref(null)
const mapChartRef = ref(null)

const tempTourActive = ref(false)
const ghgTourActive = ref(false)
const mapTourActive = ref(false)
const anyTourActive = computed(
    () => tempTourActive.value || ghgTourActive.value || mapTourActive.value,
)

const tempTourSteps = buildTemperatureTourSteps(tempChartRef)
const ghgTourSteps = buildGhgTourSteps(ghgChartRef)
const mapTourSteps = buildMapTourSteps()

const AUTO_TOUR_SLIDES = [
    { key: 'climate-tour-seen-temperature', active: tempTourActive },
    { key: 'climate-tour-seen-ghg', active: ghgTourActive },
    { key: 'climate-tour-seen-map', active: mapTourActive },
]

function maybeAutoStartTour(index) {
    const entry = AUTO_TOUR_SLIDES[index]
    if (!entry || anyTourActive.value) return
    let seen = true
    try {
        seen = localStorage.getItem(entry.key) === '1'
    } catch {
        seen = true
    }
    if (seen) return
    try {
        localStorage.setItem(entry.key, '1')
    } catch {
        /* private browsing or storage disabled — tour just won't auto-start next time either */
    }
    setTimeout(() => {
        if (activeSlide.value === index) entry.active.value = true
    }, 900)
}

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
    if (!entered.value || anyTourActive.value) return
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
    if (v) maybeAutoStartTour(activeSlide.value)
})

watch(activeSlide, (s) => {
    if (s === 2) thirdSlideReached.value = true
    if (entered.value) maybeAutoStartTour(s)
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
                        class="carousel-slide flex h-full w-screen shrink-0 items-start justify-center overflow-x-hidden overflow-y-auto px-4 pt-8 pb-4 md:items-center md:px-20 md:py-20"
                        :aria-hidden="activeSlide !== 0"
                    >
                        <div class="slide-inner flex min-h-0 w-full max-w-[1200px] flex-1 flex-col">
                            <section>
                                <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <h2 class="section-heading !mb-0 text-xl md:text-2xl">
                                        How Much Has the World Warmed?
                                    </h2>
                                    <button
                                        type="button"
                                        class="btn-ghost shrink-0"
                                        @click="tempTourActive = true"
                                    >
                                        Take the Tour
                                    </button>
                                </div>
                                <p class="mb-6 text-sm leading-relaxed text-neutral-600">
                                    Each point shows how much warmer or cooler that year was compared with
                                    the mid-20th-century average (1951–1980), in °C. Zero is "normal" for
                                    that baseline — everything above it is extra warming, and the trend over
                                    the last few decades is unmistakable.
                                </p>
                                <TemperatureChart ref="tempChartRef" />
                            </section>
                        </div>
                    </div>

                    <div
                        class="carousel-slide flex h-full w-screen shrink-0 items-start justify-center overflow-x-hidden overflow-y-auto px-4 pt-8 pb-4 md:items-center md:px-20 md:py-20"
                        :aria-hidden="activeSlide !== 1"
                    >
                        <div class="slide-inner mx-auto w-full max-w-[1200px]">
                            <section>
                                <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <h2 class="section-heading !mb-0 text-xl md:text-2xl">
                                        What's Driving the Warming: Greenhouse Gases
                                    </h2>
                                    <button
                                        type="button"
                                        class="btn-ghost shrink-0"
                                        @click="ghgTourActive = true"
                                    >
                                        Take the Tour
                                    </button>
                                </div>
                                <p class="mb-6 text-sm leading-relaxed text-neutral-600">
                                    The total greenhouse gases released worldwide each year, converted into
                                    one common unit (CO₂-equivalent) so gases like methane and CO₂ can be
                                    added together and compared. The dashed line marks the mid-20th-century
                                    average, so you can see how far — and how fast — emissions have climbed
                                    past it.
                                </p>
                                <GreenhouseGasChart ref="ghgChartRef" />
                            </section>
                        </div>
                    </div>

                    <div
                        class="carousel-slide flex h-full w-screen shrink-0 flex-col items-center justify-start overflow-x-hidden overflow-y-auto px-4 pt-8 pb-4 md:px-20 md:py-20"
                        :aria-hidden="activeSlide !== 2"
                    >
                        <div
                            class="slide-inner flex min-h-0 w-full max-w-[1200px] flex-1 flex-col"
                        >
                            <div class="min-h-0 flex-1 overflow-y-auto">
                                <section>
                                    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <h2 class="section-heading !mb-0 text-xl md:text-2xl">
                                            World Map: Who's Emitting the Most?
                                        </h2>
                                        <button
                                            type="button"
                                            class="btn-ghost shrink-0"
                                            @click="mapTourActive = true"
                                        >
                                            Take the Tour
                                        </button>
                                    </div>
                                    <p class="mb-6 max-w-3xl text-sm leading-relaxed text-neutral-600">
                                        Every country's greenhouse gas emissions, year by year — darker
                                        shading means more emissions. Drag the year slider to watch the
                                        picture shift over time, then hover or tap a country to see its
                                        breakdown by gas.
                                    </p>
                                    <WorldEmissionsMap ref="mapChartRef" />
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                class="carousel-nav btn-primary hard-shadow-hover fixed bottom-5 left-2 z-20 px-0 pb-4 font-serif text-3xl disabled:cursor-not-allowed disabled:opacity-35 md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:left-4"
                :disabled="!canGoPrev"
                aria-label="Previous slide"
                @click="goPrev"
            >
                ‹
            </button>
            <button
                type="button"
                class="carousel-nav btn-primary hard-shadow-hover fixed bottom-5 right-2 z-20 px-0 pb-4 font-serif text-3xl disabled:cursor-not-allowed disabled:opacity-35 md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:right-4"
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

            <GuidedTour v-model:active="tempTourActive" :steps="tempTourSteps" />
            <GuidedTour v-model:active="ghgTourActive" :steps="ghgTourSteps" />
            <GuidedTour v-model:active="mapTourActive" :steps="mapTourSteps" />
        </div>
    </Transition>
</template>

<style scoped lang="scss">
.carousel-track {
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
}

.carousel-nav {
    width: 2.75rem;
    height: 3.5rem;
    line-height: 1;
}

.carousel-nav:disabled:hover {
    border-color: transparent;
    background-color: #111111;
    color: #f9f9f7;
    box-shadow: none;
    transform: none;
    cursor: not-allowed;
}

@media screen and (max-width: $mobile-max-width) {
    .carousel-slide {
        padding-bottom: 0;
        margin-bottom: 90px;
        border-bottom: 1px solid var(--color-border);
        height: auto;
        box-shadow: inset 0px -4px 8px rgba(0, 0, 0, 0.1);
    }

    .carousel-track {
        height: -webkit-fill-available;
    }
}
</style>

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
    <!-- Landing: header centered, Enter at bottom -->
    <div v-if="!entered" class="landing">
        <div class="landing-center">
            <header class="hero">
                <h1 class="hero-title">Climate Change in Data</h1>
                <p class="hero-subtitle">
                    Understanding the real impacts of climate change through data. Global temperature
                    anomalies show how far we’ve moved from the 1951–1980 baseline—and why it matters.
                </p>
            </header>
        </div>
        <div class="landing-footer">
            <button type="button" class="btn-primary" @click="enter">Enter</button>
        </div>
    </div>

    <!-- Full-viewport carousel -->
    <Transition name="carousel-fade">
        <div
            v-if="entered"
            class="carousel-shell"
            role="region"
            aria-roledescription="carousel"
            aria-label="Data sections"
        >
        <div class="carousel-viewport">
            <div
                class="carousel-track"
                :style="{ transform: `translateX(-${activeSlide * 100}vw)` }"
            >
                <div class="carousel-slide" :aria-hidden="activeSlide !== 0">
                    <div class="slide-inner">
                        <section class="section">
                            <h2 class="section-title">Global land–ocean temperature anomaly</h2>
                            <p class="section-description">
                                Annual mean temperature anomaly in °C relative to the 1951–1980 average.
                                Values above zero indicate a warmer world; the trend over the last decades
                                is clear.
                            </p>
                            <TemperatureChart />
                        </section>
                    </div>
                </div>

                <div class="carousel-slide" :aria-hidden="activeSlide !== 1">
                    <div class="slide-inner">
                        <section class="section">
                            <h2 class="section-title">Global greenhouse gas emissions (EARTH)</h2>
                            <p class="section-description">
                                Annual emissions for the PRIMAP-hist aggregate <strong>EARTH</strong> (world
                                total), shown as the Kyoto basket in CO₂ equivalent using AR5 GWP100. The
                                dashed line marks the 1951–1980 average of that series so you can see how
                                quickly totals have risen past the mid‑century baseline.
                            </p>
                            <GreenhouseGasChart />
                        </section>
                    </div>
                </div>

                <div
                    class="carousel-slide carousel-slide--last"
                    :aria-hidden="activeSlide !== 2"
                >
                    <div class="slide-inner slide-inner--last">
                        <div class="slide-scroll">
                            <section class="section">
                                <h2 class="section-title">Country greenhouse gas emissions world map</h2>
                                <p class="section-description">
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
            class="carousel-nav carousel-nav--prev"
            :disabled="!canGoPrev"
            aria-label="Previous slide"
            @click="goPrev"
        >
            ‹
        </button>
        <button
            type="button"
            class="carousel-nav carousel-nav--next"
            :disabled="!canGoNext"
            aria-label="Next slide"
            @click="goNext"
        >
            ›
        </button>

        <div v-if="thirdSlideReached" class="carousel-explore">
            <RouterLink class="btn-primary btn-explore" to="/explore">Explore</RouterLink>
        </div>

        <div class="carousel-dots" role="tablist" aria-label="Slide">
            <button
                v-for="n in slideCount"
                :key="n"
                type="button"
                class="dot"
                :class="{ 'dot--active': activeSlide === n - 1 }"
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
.landing {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.landing-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1.5rem, 4vw, 2rem);
}

.hero {
    text-align: center;
    max-width: 42rem;
}

.hero-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: clamp(2rem, 5vw, 3rem);
    letter-spacing: -0.02em;
    color: var(--color-heading);
    margin: 0 0 0.75rem;
    line-height: 1.15;
}

.hero-subtitle {
    font-size: clamp(1rem, 2vw, 1.15rem);
    color: var(--color-muted);
    margin: 0;
    line-height: 1.6;
}

.landing-footer {
    padding: clamp(1.25rem, 4vw, 2rem);
    display: flex;
    justify-content: center;
}

.btn-primary {
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.65rem 1.75rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-background-soft);
    color: var(--color-heading);
    cursor: pointer;
    transition:
        background 0.2s,
        border-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: var(--color-background-mute);
    border-color: var(--color-border-hover);
}

.btn-explore {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* Carousel */
.carousel-shell {
    position: fixed;
    inset: 0;
    z-index: 10;
    background: var(--color-background);
}

.carousel-viewport {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.carousel-track {
    display: flex;
    height: 100%;
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
}

.carousel-slide {
    flex: 0 0 100vw;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(3.5rem, 8vh, 5rem) clamp(1rem, 4vw, 2rem) clamp(5rem, 12vh, 7rem);
    box-sizing: border-box;
}

.carousel-slide--last {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
}

.slide-inner {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
}

.slide-inner--last {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    max-height: 100%;
}

.slide-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}

.section-title {
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: clamp(1.25rem, 2.5vw, 1.5rem);
    color: var(--color-heading);
    margin: 0 0 0.5rem;
}

.section-description {
    font-size: 0.95rem;
    color: var(--color-muted);
    margin: 0 0 1.5rem;
    line-height: 1.55;
}

.carousel-explore {
    position: fixed;
    bottom: calc(clamp(1rem, 3vh, 1.5rem) + 0.5rem + 0.65rem);
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
}

.carousel-nav {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    width: 2.75rem;
    height: 3.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
    background: var(--color-background-soft);
    color: var(--color-heading);
    font-size: 1.75rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
        background 0.2s,
        opacity 0.2s;
}

.carousel-nav:hover:not(:disabled) {
    background: var(--color-background-mute);
}

.carousel-nav:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.carousel-nav--prev {
    left: clamp(0.5rem, 2vw, 1rem);
}

.carousel-nav--next {
    right: clamp(0.5rem, 2vw, 1rem);
}

.carousel-dots {
    position: fixed;
    bottom: clamp(1rem, 3vh, 1.5rem);
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.dot {
    width: 0.5rem;
    height: 0.5rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--color-border);
    cursor: pointer;
    transition:
        background 0.2s,
        transform 0.2s;
}

.dot:hover {
    background: var(--color-muted);
}

.dot--active {
    background: var(--color-heading);
    transform: scale(1.15);
}
</style>

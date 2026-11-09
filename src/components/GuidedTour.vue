<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
    steps: { type: Array, required: true },
    active: { type: Boolean, default: false },
    /** DOM element to scope target lookups to. Defaults to `document` (fine as long as each
     *  data-tour/data-anomaly selector is unique on the page, which holds since every chart
     *  component is mounted at most once per route). */
    root: { type: Object, default: null },
})
const emit = defineEmits(['update:active', 'finish', 'step-change'])

const PAD = 10
const CARD_MARGIN = 16
const CARD_MAX_WIDTH = 328

const stepIndex = ref(0)
const rect = ref(null)
const cardEl = ref(null)
const nextBtnEl = ref(null)
const viewportW = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const viewportH = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

let measureRaf = null
let scrollSettleTimers = []

const currentStep = computed(() => props.steps[stepIndex.value] ?? null)
const bodyLines = computed(() => {
    const body = currentStep.value?.body
    if (!body) return []
    return Array.isArray(body) ? body : [body]
})

function queryTarget(step) {
    if (!step?.target) return null
    const base = props.root || document
    return base.querySelector(step.target)
}

function measureNow() {
    const el = queryTarget(currentStep.value)
    if (!el) {
        rect.value = null
        return
    }
    const r = el.getBoundingClientRect()
    rect.value = {
        top: r.top,
        left: r.left,
        width: Math.max(r.width, 6),
        height: Math.max(r.height, 6),
    }
}

function scheduleMeasure() {
    if (measureRaf) cancelAnimationFrame(measureRaf)
    measureRaf = requestAnimationFrame(measureNow)
}

function clearScrollSettleTimers() {
    scrollSettleTimers.forEach((t) => clearTimeout(t))
    scrollSettleTimers = []
}

/** Re-measures a few times after a step change to track scroll settling and chart transitions
 *  (e.g. the temperature chart's ~650ms extrapolate animation) without a full rAF loop. */
function burstRemeasure() {
    clearScrollSettleTimers()
    ;[0, 80, 250, 450, 700, 1000].forEach((ms) => {
        scrollSettleTimers.push(setTimeout(measureNow, ms))
    })
}

function onResize() {
    viewportW.value = window.innerWidth
    viewportH.value = window.innerHeight
    scheduleMeasure()
}

function enterStep(i) {
    stepIndex.value = i
    const step = currentStep.value
    step?.onEnter?.()
    emit('step-change', { index: i, step })
    nextTick(() => {
        const el = queryTarget(step)
        if (el) {
            const r0 = el.getBoundingClientRect()
            if (r0.top < 72 || r0.bottom > viewportH.value - 180) {
                el.scrollIntoView({ block: 'center', behavior: 'smooth' })
            }
        }
        burstRemeasure()
        requestAnimationFrame(() => nextBtnEl.value?.focus({ preventScroll: true }))
    })
}

function goToStep(i) {
    if (i < 0 || i >= props.steps.length) return
    currentStep.value?.onExit?.()
    enterStep(i)
}

function next() {
    if (stepIndex.value >= props.steps.length - 1) finish()
    else goToStep(stepIndex.value + 1)
}

function prev() {
    goToStep(stepIndex.value - 1)
}

function finish() {
    currentStep.value?.onExit?.()
    emit('update:active', false)
    emit('finish')
}

function skip() {
    finish()
}

function onKeydown(e) {
    if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
    } else if (e.key === 'Escape') {
        e.preventDefault()
        skip()
    }
}

function teardownListeners() {
    window.removeEventListener('resize', onResize)
    window.removeEventListener('scroll', scheduleMeasure, true)
    window.removeEventListener('keydown', onKeydown)
    clearScrollSettleTimers()
    if (measureRaf) cancelAnimationFrame(measureRaf)
}

watch(
    () => props.active,
    (isActive) => {
        if (isActive) {
            viewportW.value = window.innerWidth
            viewportH.value = window.innerHeight
            window.addEventListener('resize', onResize)
            window.addEventListener('scroll', scheduleMeasure, true)
            window.addEventListener('keydown', onKeydown)
            enterStep(0)
        } else {
            teardownListeners()
            rect.value = null
        }
    },
)

onBeforeUnmount(teardownListeners)

const dimRects = computed(() => {
    if (!rect.value) return null
    const r = rect.value
    const top = Math.max(r.top - PAD, 0)
    const left = Math.max(r.left - PAD, 0)
    const right = Math.max(r.left + r.width + PAD, 0)
    const bottom = Math.max(r.top + r.height + PAD, 0)
    return {
        top: { top: '0', left: '0', width: '100vw', height: `${top}px` },
        bottom: { top: `${bottom}px`, left: '0', width: '100vw', height: `calc(100vh - ${bottom}px)` },
        left: { top: `${top}px`, left: '0', width: `${left}px`, height: `${bottom - top}px` },
        right: {
            top: `${top}px`,
            left: `${right}px`,
            width: `calc(100vw - ${right}px)`,
            height: `${bottom - top}px`,
        },
    }
})

const spotlightStyle = computed(() => {
    if (!rect.value) return null
    const r = rect.value
    return {
        top: `${r.top - PAD}px`,
        left: `${r.left - PAD}px`,
        width: `${r.width + PAD * 2}px`,
        height: `${r.height + PAD * 2}px`,
    }
})

/** Rough content-height estimate so we can tell whether either side of the target has enough
 *  room for the card — if not, we center it instead of cramming it (and clipping/scrolling it). */
const CENTER_FALLBACK_SPACE = 220

const cardStyle = computed(() => {
    const w = Math.min(CARD_MAX_WIDTH, viewportW.value - CARD_MARGIN * 2)
    const centered = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${w}px`,
    }
    if (!rect.value) return centered

    const r = rect.value
    const spaceBelow = viewportH.value - (r.top + r.height)
    const spaceAbove = r.top
    if (spaceBelow < CENTER_FALLBACK_SPACE && spaceAbove < CENTER_FALLBACK_SPACE) return centered

    const style = { width: `${w}px` }
    if (spaceBelow >= spaceAbove) {
        style.top = `${r.top + r.height + CARD_MARGIN}px`
    } else {
        style.bottom = `${viewportH.value - r.top + CARD_MARGIN}px`
    }
    let left = r.left + r.width / 2 - w / 2
    left = Math.max(CARD_MARGIN, Math.min(left, viewportW.value - w - CARD_MARGIN))
    style.left = `${left}px`
    return style
})

function pxStyle(obj) {
    if (!obj) return {}
    const out = {}
    for (const [k, v] of Object.entries(obj)) out[k] = typeof v === 'number' ? `${v}px` : v
    return out
}
</script>

<template>
    <Teleport to="body">
        <div
            v-if="active"
            class="tour-root"
            role="dialog"
            aria-modal="true"
            :aria-label="currentStep?.title"
        >
            <template v-if="dimRects">
                <div class="tour-dim" :style="pxStyle(dimRects.top)" @click="skip" />
                <div class="tour-dim" :style="pxStyle(dimRects.bottom)" @click="skip" />
                <div class="tour-dim" :style="pxStyle(dimRects.left)" @click="skip" />
                <div class="tour-dim" :style="pxStyle(dimRects.right)" @click="skip" />
                <div class="tour-spotlight sharp-corners" :style="pxStyle(spotlightStyle)" />
            </template>
            <div v-else class="tour-dim tour-dim-full" @click="skip" />

            <div
                ref="cardEl"
                class="tour-card panel-newsprint sharp-corners newsprint-texture"
                :style="pxStyle(cardStyle)"
            >
                <div class="tour-card-top">
                    <span class="label-meta">Step {{ stepIndex + 1 }} / {{ steps.length }}</span>
                    <button type="button" class="tour-close" aria-label="Close tutorial" @click="skip">
                        ×
                    </button>
                </div>
                <div class="tour-progress" aria-hidden="true">
                    <span
                        v-for="(s, i) in steps"
                        :key="i"
                        class="tour-tick"
                        :class="{ 'tour-tick-active': i === stepIndex, 'tour-tick-done': i < stepIndex }"
                    />
                </div>
                <h3 class="tour-title font-serif text-base font-bold leading-snug">
                    {{ currentStep?.title }}
                </h3>
                <p v-for="(line, i) in bodyLines" :key="i" class="tour-body text-sm leading-relaxed">
                    {{ line }}
                </p>
                <div class="tour-actions">
                    <button type="button" class="btn-ghost" @click="skip">Skip tour</button>
                    <div class="tour-nav">
                        <button v-if="stepIndex > 0" type="button" class="btn-outline" @click="prev">
                            Back
                        </button>
                        <button ref="nextBtnEl" type="button" class="btn-primary" @click="next">
                            {{ stepIndex === steps.length - 1 ? 'Done' : 'Next' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped lang="scss">
.tour-root {
    position: fixed;
    inset: 0;
    z-index: 100;
}

.tour-dim {
    position: fixed;
    background: rgba(17, 17, 17, 0.6);
    pointer-events: auto;
}

.tour-dim-full {
    inset: 0;
}

.tour-spotlight {
    position: fixed;
    border: 2px solid var(--color-newsprint-accent, #cc0000);
    pointer-events: none;
    transition:
        top 0.25s ease,
        left 0.25s ease,
        width 0.25s ease,
        height 0.25s ease;
    animation: tour-pulse 1.6s ease-in-out infinite;
}

@keyframes tour-pulse {
    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(204, 0, 0, 0.45);
    }
    50% {
        box-shadow: 0 0 0 6px rgba(204, 0, 0, 0);
    }
}

.tour-card {
    position: fixed;
    z-index: 101;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition:
        top 0.25s ease,
        left 0.25s ease,
        bottom 0.25s ease;
}

.tour-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.tour-close {
    border: 0;
    background: transparent;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    color: var(--color-newsprint-fg, #111111);
    padding: 2px 6px;
}

.tour-close:hover {
    color: var(--color-newsprint-accent, #cc0000);
}

.tour-progress {
    display: flex;
    gap: 4px;
}

.tour-tick {
    height: 3px;
    flex: 1;
    background: var(--color-newsprint-muted, #e5e5e0);
}

.tour-tick-active,
.tour-tick-done {
    background: var(--color-newsprint-fg, #111111);
}

.tour-title {
    margin: 0;
}

.tour-body {
    margin: 0;
    color: var(--color-neutral-600, #525252);
}

.tour-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
}

.tour-nav {
    display: flex;
    gap: 8px;
}
</style>

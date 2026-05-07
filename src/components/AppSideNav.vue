<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const open = ref(false)

const navItems = [
    { label: 'Explore', name: 'explore' },
    { label: 'Graphs', name: 'graphs' },
    { label: 'Predictive Data', name: 'predictive-data' },
    { label: 'Why It Matters', name: 'why-it-matters' },
    { label: 'Points of No Return', name: 'points-of-no-return' },
    { label: 'What Can We Do', name: 'what-can-we-do' },
    { label: 'Sources', name: 'sources' },
]

function toggle() {
    open.value = !open.value
}

function close() {
    open.value = false
}

function onKeydown(e) {
    if (e.key === 'Escape') close()
}

watch(
    () => route.fullPath,
    () => close(),
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
    <div class="side-nav-root">
        <button
            type="button"
            class="backdrop"
            :class="{ 'backdrop--visible': open }"
            aria-hidden="true"
            tabindex="-1"
            @click="close"
        />
        <aside
            class="side-nav"
            :class="{ 'side-nav--open': open }"
            aria-label="Site navigation"
        >
            <button
                type="button"
                class="burger"
                :aria-expanded="open"
                aria-controls="side-nav-panel"
                @click="toggle"
            >
                <span class="burger-lines" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </span>
                <span class="sr-only">{{ open ? 'Close menu' : 'Open menu' }}</span>
            </button>

            <div id="side-nav-panel" class="side-nav-panel">
                <nav class="side-nav-links" aria-label="Pages">
                    <RouterLink
                        v-for="item in navItems"
                        :key="item.name"
                        :to="{ name: item.name }"
                        class="nav-link"
                        active-class="nav-link--active"
                    >
                        {{ item.label }}
                    </RouterLink>
                </nav>
            </div>
        </aside>
    </div>
</template>

<style scoped>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.side-nav-root {
    position: relative;
}

.backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(0, 0, 0, 0.35);
    border: none;
    padding: 0;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
        opacity 0.22s ease,
        visibility 0.22s ease;
}

@media (prefers-color-scheme: dark) {
    .backdrop {
        background: rgba(0, 0, 0, 0.5);
    }
}

.backdrop--visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}

.side-nav {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    width: 3.375rem;
    height: 100vh;
    background: var(--color-background-soft);
    border-right: 1px solid var(--color-border);
    transition: width 0.26s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.06);
}

@media (prefers-color-scheme: dark) {
    .side-nav {
        box-shadow: 2px 0 16px rgba(0, 0, 0, 0.35);
    }
}

.side-nav--open {
    width: min(16.5rem, 88vw);
}

.burger {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 3.375rem;
    padding: 0;
    margin: 0;
    border: none;
    border-bottom: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-heading);
    cursor: pointer;
    transition:
        background 0.18s ease,
        color 0.18s ease;
}

.burger:hover {
    background: var(--color-background-mute);
}

.burger-lines {
    position: relative;
    width: 1.35rem;
    height: 14px;
    flex-shrink: 0;
}

.burger-lines span {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 1px;
    background: currentColor;
    transform-origin: center;
    transition:
        transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
        opacity 0.18s ease,
        top 0.22s cubic-bezier(0.22, 1, 0.36, 1),
        bottom 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.burger-lines span:nth-child(1) {
    top: 0;
}

.burger-lines span:nth-child(2) {
    top: 50%;
    transform: translateY(-50%);
}

.burger-lines span:nth-child(3) {
    bottom: 0;
}

.side-nav--open .burger-lines span:nth-child(1) {
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
}

.side-nav--open .burger-lines span:nth-child(2) {
    opacity: 0;
}

.side-nav--open .burger-lines span:nth-child(3) {
    top: 50%;
    bottom: auto;
    transform: translateY(-50%) rotate(-45deg);
}

.side-nav-panel {
    flex: 1;
    min-height: 0;
    opacity: 0;
    visibility: hidden;
    overflow: hidden;
    transition:
        opacity 0.18s ease 0.04s,
        visibility 0.18s ease 0.04s;
}

.side-nav--open .side-nav-panel {
    opacity: 1;
    visibility: visible;
}

.side-nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.65rem 0.65rem 1rem;
    overflow-y: auto;
}

.nav-link {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text);
    text-decoration: none;
    padding: 0.55rem 0.65rem;
    border-radius: 0.375rem;
    transition:
        background 0.18s ease,
        color 0.18s ease;
}

@media (hover: hover) {
    .nav-link:hover {
        background: var(--color-background-mute);
    }
}

.nav-link.router-link-active,
.nav-link.nav-link--active {
    background: var(--color-background-mute);
    color: var(--color-heading);
    font-weight: 600;
}
</style>

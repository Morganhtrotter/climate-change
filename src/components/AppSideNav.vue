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
    { label: 'Tipping Points', name: 'tipping-points' },
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
    <div>
        <button
            type="button"
            class="fixed inset-0 z-40 border-0 bg-newsprint-fg/35 p-0 transition-opacity duration-200 ease-out"
            :class="
                open
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0'
            "
            aria-hidden="true"
            tabindex="-1"
            @click="close"
        />
        <aside
            class="fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-newsprint-fg bg-newsprint-bg transition-[width] duration-200 ease-out"
            :class="open ? 'w-[min(16.5rem,88vw)]' : 'w-[3.375rem]'"
            aria-label="Site navigation"
        >
            <button
                type="button"
                class="flex min-h-[3.375rem] w-full shrink-0 items-center justify-center border-0 border-b border-newsprint-fg bg-transparent text-newsprint-fg transition-colors duration-200 ease-out hover:bg-newsprint-muted"
                :aria-expanded="open"
                aria-controls="side-nav-panel"
                @click="toggle"
            >
                <span class="relative h-3.5 w-[1.35rem]" aria-hidden="true">
                    <span
                        class="absolute right-0 left-0 h-0.5 bg-current transition-all duration-200 ease-out"
                        :class="
                            open
                                ? 'top-1/2 -translate-y-1/2 rotate-45'
                                : 'top-0'
                        "
                    />
                    <span
                        class="absolute right-0 left-0 h-0.5 bg-current transition-all duration-200 ease-out"
                        :class="
                            open
                                ? 'opacity-0'
                                : 'top-1/2 -translate-y-1/2'
                        "
                    />
                    <span
                        class="absolute right-0 left-0 h-0.5 bg-current transition-all duration-200 ease-out"
                        :class="
                            open
                                ? 'top-1/2 -translate-y-1/2 -rotate-45'
                                : 'bottom-0'
                        "
                    />
                </span>
                <span class="sr-only">{{ open ? 'Close menu' : 'Open menu' }}</span>
            </button>

            <div
                id="side-nav-panel"
                class="min-h-0 flex-1 overflow-hidden transition-[opacity,visibility] duration-200 ease-out"
                :class="
                    open
                        ? 'visible opacity-100'
                        : 'invisible opacity-0'
                "
            >
                <nav
                    class="flex flex-col gap-0.5 overflow-y-auto px-2.5 pt-2.5 pb-4"
                    aria-label="Pages"
                >
                    <RouterLink
                        v-for="item in navItems"
                        :key="item.name"
                        :to="{ name: item.name }"
                        class="sharp-corners border border-transparent px-2.5 py-2 font-sans text-xs font-semibold uppercase tracking-widest text-newsprint-fg no-underline transition-colors duration-200 ease-out hover:border-newsprint-fg hover:bg-newsprint-muted hover:text-newsprint-accent"
                        active-class="!border-newsprint-fg !bg-newsprint-muted !text-newsprint-accent"
                    >
                        {{ item.label }}
                    </RouterLink>
                </nav>
            </div>
        </aside>
    </div>
</template>

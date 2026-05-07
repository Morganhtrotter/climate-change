<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title || 'Page')
</script>

<template>
    <div class="section-page">
        <header class="section-header">
            <h1 class="section-title">{{ title }}</h1>
        </header>
        <p class="section-lead">
            Content for this section is coming soon.
        </p>
    </div>
</template>

<style scoped>
.section-page {
    min-height: 100vh;
    max-width: 1440px;
    margin: 0 auto;
    padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem);
}

.section-header {
    margin-bottom: 1.25rem;
}

.section-title {
    font-family: 'Cantarell', 'Roboto Condensed', sans-serif;
    font-weight: 700;
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    color: var(--color-heading);
    margin: 0;
    line-height: 1.2;
}

.section-lead {
    margin: 0;
    line-height: 1.65;
    color: var(--color-muted);
}
</style>

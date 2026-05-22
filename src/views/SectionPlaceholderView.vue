<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title || 'Page')
</script>

<template>
    <div class="page-container max-w-[1440px] newsprint-texture">
        <header class="mb-5 border-b-4 border-newsprint-fg pb-4">
            <h1 class="font-serif text-3xl font-black leading-tight lg:text-4xl">{{ title }}</h1>
        </header>
        <p class="label-meta text-neutral-600">
            Content for this section is coming soon.
        </p>
    </div>
</template>

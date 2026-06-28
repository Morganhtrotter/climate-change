<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSideNav from './components/AppSideNav.vue'

const route = useRoute()
const showSideNav = computed(() => route.name !== 'home')
</script>

<template>
    <div
        class="min-h-screen bg-newsprint-bg"
        :class="showSideNav ? 'pl-[3.375rem]' : ''"
    >
        <AppSideNav v-if="showSideNav" />
        <main class="min-h-screen">
            <RouterView />
        </main>
    </div>
</template>

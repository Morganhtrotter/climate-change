<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSideNav from './components/AppSideNav.vue'

const route = useRoute()
const showSideNav = computed(() => route.name !== 'home')
</script>

<template>
    <div class="app-root" :class="{ 'app-root--nav': showSideNav }">
        <AppSideNav v-if="showSideNav" />
        <main class="app-main">
            <RouterView />
        </main>
    </div>
</template>

<style scoped>
.app-root {
    min-height: 100vh;
}

.app-root--nav .app-main {
    padding-left: 3.375rem;
}

.app-main {
    min-height: 100vh;
}
</style>

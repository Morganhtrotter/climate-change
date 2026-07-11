import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ExploreView from '../views/ExploreView.vue'
import SectionPlaceholderView from '../views/SectionPlaceholderView.vue'
import SourcesView from '../views/SourcesView.vue'
import TippingPointsView from '../views/TippingPointsView.vue'
import GraphsView from '../views/GraphsView.vue'
import WhatCanWeDoView from '../views/WhatCanWeDoView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/explore',
            name: 'explore',
            component: ExploreView,
        },
        {
            path: '/graphs',
            name: 'graphs',
            component: GraphsView,
        },
        {
            path: '/predictive-data',
            name: 'predictive-data',
            component: SectionPlaceholderView,
            meta: { title: 'Predictive Data' },
        },
        {
            path: '/why-it-matters',
            name: 'why-it-matters',
            component: SectionPlaceholderView,
            meta: { title: 'Why It Matters' },
        },
        {
            path: '/tipping-points',
            name: 'tipping-points',
            component: TippingPointsView,
        },
        {
            path: '/what-can-we-do',
            name: 'what-can-we-do',
            component: WhatCanWeDoView,
        },
        {
            path: '/sources',
            name: 'sources',
            component: SourcesView,
        },
    ],
})

export default router

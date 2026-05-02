<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <Transition name="carousel-fade" appear>
        <div class="explore">
            <header class="explore-header">
                <RouterLink class="back-link" to="/">← Climate data</RouterLink>
                <h1 class="explore-title">Explore</h1>
            </header>

            <article class="explore-body">
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                    nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                    officia deserunt mollit anim id est laborum.
                </p>
                <p>
                    Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et
                    commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.
                    Integer mauris lacus, rhoncus neque eget, dignissim pretium nulla.
                </p>
            </article>
        </div>
    </Transition>
</template>

<style scoped>
.explore {
    min-height: 100vh;
    max-width: 42rem;
    margin: 0 auto;
    padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem);
}

.explore-header {
    margin-bottom: 2rem;
}

.back-link {
    display: inline-block;
    font-size: 0.9rem;
    color: var(--color-muted);
    margin-bottom: 1rem;
}

.explore-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    color: var(--color-heading);
    margin: 0;
    line-height: 1.2;
}

.explore-body p {
    margin: 0 0 1.25rem;
    line-height: 1.65;
    color: var(--color-text);
}

.explore-body p:last-child {
    margin-bottom: 0;
}
</style>

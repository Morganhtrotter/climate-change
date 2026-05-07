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
                    Climate change is not an abstract future risk; it is already reshaping weather,
                    coastlines, agriculture, and health. Warmer air and oceans fuel more intense
                    heat waves, storms, and shifting rainfall patterns. Understanding what is
                    changing—and how fast—helps communities plan, holds decisions accountable to
                    evidence, and makes the tradeoffs of action versus inaction easier to see.
                </p>
                <p>
                    For more than a century, human activities have added greenhouse gases such as
                    carbon dioxide and methane to the atmosphere. Those gases trap outgoing heat, so
                    more emissions mean more energy retained near the surface. Over decades, that
                    relationship shows up clearly in the data: as cumulative emissions rise, global
                    average temperature rises with them. Year-to-year weather still varies, but the
                    long-term warming trend tracks the growth in greenhouse gases far more closely
                    than it does natural cycles alone—one reason scientists treat fossil-fuel burning
                    and land-use change as the main drivers of recent warming.
                </p>
                <p>
                    This site collects charts and maps so you can explore those trends yourself—country
                    by country, gas by gas, and year by year. The goal is straightforward: replace
                    headlines with numbers you can inspect, compare, and reason about.
                </p>
            </article>
        </div>
    </Transition>
</template>

<style scoped>
.explore {
    min-height: 100vh;
    max-width: 1440px;
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
    font-family: 'Cantarell', 'Roboto Condensed', sans-serif;
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

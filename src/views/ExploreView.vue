<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <Transition name="carousel-fade" appear>
        <div class="page-container max-w-[1440px] newsprint-texture">
            <header class="mb-8 border-b-4 border-newsprint-fg pb-6">
                <RouterLink class="link-back mb-4 inline-block" to="/">← Climate data</RouterLink>
                <h1 class="font-serif text-3xl font-black leading-tight lg:text-4xl">Explore</h1>
            </header>

            <article class="max-w-3xl">
                <p class="drop-cap mb-5 leading-relaxed">
                    Climate change is not an abstract future risk; it is already reshaping weather,
                    coastlines, agriculture, and health. Warmer air and oceans fuel more intense
                    heat waves, storms, and shifting rainfall patterns. Understanding what is
                    changing—and how fast—helps communities plan, holds decisions accountable to
                    evidence, and makes the tradeoffs of action versus inaction easier to see.
                </p>
                <p class="mb-5 leading-relaxed">
                    For more than a century, human activities have added greenhouse gases such as
                    carbon dioxide and methane to the atmosphere. Those gases trap outgoing heat, so
                    more emissions mean more energy retained near the surface. Over decades, that
                    relationship shows up clearly in the data: as cumulative emissions rise, global
                    average temperature rises with them. Year-to-year weather still varies, but the
                    long-term warming trend tracks the growth in greenhouse gases far more closely
                    than it does natural cycles alone—one reason scientists treat fossil-fuel burning
                    and land-use change as the main drivers of recent warming.
                </p>
                <p class="mb-10 leading-relaxed">
                    This site collects charts and maps so you can explore those trends yourself—country
                    by country, gas by gas, and year by year. The goal is straightforward: replace
                    headlines with numbers you can inspect, compare, and reason about.
                </p>
            </article>

            <section class="inverted-section newsprint-texture max-w-3xl" aria-labelledby="explore-callout">
                <p class="label-meta mb-3 text-neutral-400">Why the numbers matter</p>
                <h2 id="explore-callout" class="mb-4 font-serif text-2xl font-black leading-tight">
                    Inspect the evidence yourself
                </h2>
                <p class="mb-0 leading-relaxed">
                    Use the sections in the menu to move from global temperature and emissions trends
                    to country-level maps, tipping-point thresholds, and the datasets behind every
                    figure. Each chart keeps its scientific color scale; the interface is editorial
                    print so the data stays in focus.
                </p>
            </section>
        </div>
    </Transition>
</template>

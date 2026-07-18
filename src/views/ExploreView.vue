<script setup>
import { RouterLink } from 'vue-router'

const PRINCIPLES = [
    {
        title: 'Primary data, not press releases',
        body: 'Every chart traces back to a maintained scientific dataset or peer-reviewed study — NASA GISS surface temperature records, the PRIMAP-hist national emissions series, IPCC assessment reports — rather than a secondhand summary of one.',
    },
    {
        title: 'Uncertainty shown, not hidden',
        body: 'Where the underlying science reports a range instead of a single number — a tipping-point threshold, a mitigation potential — that range is drawn on the chart, not collapsed into one falsely precise figure.',
    },
    {
        title: 'Every figure traceable',
        body: 'The Sources page links each interactive element back to its dataset, build script, and citation, so any number on this site can be checked against the literature it came from.',
    },
    {
        title: 'Built to be explored, not skimmed',
        body: 'Charts respond to hover, year sliders, and toggles instead of freezing one moment in time — the same dataset behind a headline also supports checking the years around it.',
    },
]

const GUIDE = [
    {
        name: 'graphs',
        label: 'Graphs',
        blurb: 'The three core datasets — global temperature, world emissions, and a country-level map — gathered on one scrollable page.',
    },
    {
        name: 'tipping-points',
        label: 'Tipping Points',
        blurb: 'Eleven thresholds where the climate system could shift into a new, self-perpetuating state, ranked by best-estimate warming level.',
    },
    {
        name: 'what-can-we-do',
        label: 'What Can We Do',
        blurb: 'Twenty mitigation solutions quantified in Gt CO2-eq per year, plus what individual choices are actually worth next to them.',
    },
    {
        name: 'sources',
        label: 'Sources',
        blurb: 'Every dataset, script, and citation behind the figures on this site, with notes on why each one was chosen.',
    },
]
</script>

<template>
    <Transition name="carousel-fade" appear>
        <article class="page-container max-w-[1440px] newsprint-texture">
            <header class="mb-8 border-b-4 border-newsprint-fg pb-6">
                <RouterLink class="link-back mb-4 inline-block" to="/">← Climate data</RouterLink>
                <h1 class="mb-3 font-serif text-3xl font-black leading-tight lg:text-4xl">Explore</h1>
                <p class="drop-cap m-0 max-w-3xl leading-relaxed">
                    Climate change is not an abstract future risk; it is already reshaping weather,
                    coastlines, agriculture, and health. Most people encounter it as headlines and
                    disaster footage — vivid, but hard to reason about. This site exists to close that
                    gap: to take the same primary datasets that scientists and policymakers use and make
                    them directly explorable, so the trends speak for themselves instead of being
                    summarized for you.
                </p>
            </header>

            <section class="mb-12" aria-labelledby="why-heading">
                <h2 id="why-heading" class="section-heading mb-3">Why this site exists</h2>
                <p class="mb-4 max-w-3xl leading-relaxed">
                    For more than a century, human activities have added greenhouse gases such as
                    carbon dioxide and methane to the atmosphere. Those gases trap outgoing heat, so
                    more emissions mean more energy retained near the surface. Over decades, that
                    relationship shows up clearly in the data: as cumulative emissions rise, global
                    average temperature rises with them. Year-to-year weather still varies, but the
                    long-term warming trend tracks the growth in greenhouse gases far more closely than
                    it does natural cycles alone.
                </p>
                <p class="mb-0 max-w-3xl leading-relaxed">
                    That evidence lives in datasets that are public, well-documented, and updated on a
                    known schedule — but they are built for researchers, not browsers. Reading them
                    usually means opening a CSV, a Zenodo record, or a 3,000-page IPCC report. This site
                    does that reading once, keeps the sourcing intact, and turns the result into charts
                    and maps you can inspect yourself: country by country, gas by gas, and year by year.
                </p>
            </section>

            <section class="mb-12" aria-labelledby="approach-heading">
                <h2 id="approach-heading" class="section-heading mb-3">How this site is built</h2>
                <p class="mb-6 max-w-3xl leading-relaxed text-neutral-600">
                    Four rules shape every page on this site, from the temperature chart on the home
                    page to the citation list on the Sources page.
                </p>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div
                        v-for="p in PRINCIPLES"
                        :key="p.title"
                        class="panel-newsprint hard-shadow-hover"
                    >
                        <h3 class="mb-1.5 font-serif text-lg font-bold leading-snug">{{ p.title }}</h3>
                        <p class="m-0 text-sm leading-relaxed">{{ p.body }}</p>
                    </div>
                </div>
            </section>

            <section class="mb-12" aria-labelledby="guide-heading">
                <h2 id="guide-heading" class="section-heading mb-3">Where to go next</h2>
                <p class="mb-6 max-w-3xl leading-relaxed text-neutral-600">
                    Use the menu at any time, or jump straight to a section from here.
                </p>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <RouterLink
                        v-for="g in GUIDE"
                        :key="g.name"
                        :to="{ name: g.name }"
                        class="panel-newsprint hard-shadow-hover block no-underline"
                    >
                        <h3 class="mb-1.5 font-serif text-lg font-bold leading-snug text-newsprint-fg">
                            {{ g.label }} →
                        </h3>
                        <p class="m-0 text-sm leading-relaxed text-newsprint-fg">{{ g.blurb }}</p>
                    </RouterLink>
                </div>
            </section>

            <section class="inverted-section newsprint-texture" aria-labelledby="explore-callout">
                <p class="label-meta mb-3 text-neutral-400">Why the numbers matter</p>
                <h2 id="explore-callout" class="mb-4 font-serif text-2xl font-black leading-tight">
                    Inspect the evidence yourself
                </h2>
                <p class="mb-4 leading-relaxed">
                    This site makes no claim you can't trace: every chart keeps its scientific color
                    scale and units, every figure links back to the dataset or study it came from, and
                    every range is shown as a range. The interface is editorial print — serif type,
                    hard shadows, a fixed newsprint palette — so that the design stays out of the way of
                    what the data is actually saying.
                </p>
                <p class="mb-0 leading-relaxed">
                    Start with the <RouterLink :to="{ name: 'graphs' }">Graphs</RouterLink> page for
                    the core trends, or go straight to
                    <RouterLink :to="{ name: 'sources' }">Sources</RouterLink> to see exactly where
                    every number on this site comes from.
                </p>
            </section>
        </article>
    </Transition>
</template>

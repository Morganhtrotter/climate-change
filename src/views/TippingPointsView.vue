<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import TippingPointsChart from '../components/TippingPointsChart.vue'
import { TIERS, TIPPING_ELEMENTS, QUALITATIVE_RISKS } from '../data/tippingPoints.js'

const tierSections = computed(() =>
    TIERS.map((tier) => ({
        ...tier,
        items: TIPPING_ELEMENTS.filter((el) => el.tierId === tier.id),
        qualitative: QUALITATIVE_RISKS.filter((el) => el.tierId === tier.id),
    })),
)

function fmtRange(el) {
    return `${el.low.toFixed(1)}–${el.high.toFixed(1)}°C`
}
</script>

<template>
    <Transition name="carousel-fade" appear>
        <article class="page-container max-w-[1440px] newsprint-texture">
            <header class="border-newsprint-fg pb-6">
                <RouterLink class="link-back mb-4 inline-block" to="/">← Climate data</RouterLink>
                <h1 class="mb-10 font-serif text-3xl font-black leading-tight lg:text-4xl">
                    Tipping Points
                </h1>
                <p class="m-0 leading-relaxed inverted-section text-neutral-400">
                    A climate tipping point is a threshold beyond which a part of the climate system
                    changes state — often abruptly, and in ways that become self-perpetuating even
                    without further warming. Once triggered, these shifts continue on their own
                    momentum, which is what makes them different from ordinary, reversible climate
                    impacts.
                </p>
                <p class="mt-4 leading-relaxed">
                    The estimates below come from Armstrong McKay et al. (2022) in
                    <em>Science</em> — the most comprehensive peer-reviewed reassessment of tipping-point
                    thresholds, synthesizing over 200 papers. Each element has a
                    <strong>best-estimate</strong> threshold and an assessed
                    <strong>range</strong>, because the underlying uncertainty is real: a tipping point
                    listed as “1.5°C (0.8–3.0°C)” has a central estimate of 1.5°C but could plausibly
                    tip anywhere in that window.
                </p>
            </header>

            <section class="mb-10" aria-labelledby="chart-heading">
                <h2 id="chart-heading" class="section-heading mb-3">
                    Where the evidence points
                </h2>
                <p class="mb-6 text-sm leading-relaxed text-neutral-600">
                    Eleven tipping elements with quantified thresholds, ordered by best estimate.
                    Hover or focus a row for the full range and a short description. Dashed lines mark
                    1.5°C, 2°C, 3°C, and 4°C of warming above pre-industrial — the same reference levels
                    used elsewhere on this site.
                </p>
                <TippingPointsChart />
            </section>

            <section
                v-for="tier in tierSections"
                :key="tier.id"
                class="mb-12 last:mb-0"
                :aria-labelledby="`${tier.id}-heading`"
            >
                <p class="label-meta mb-2 text-newsprint-accent">{{ tier.tag }}</p>
                <h2 :id="`${tier.id}-heading`" class="section-heading mb-3">
                    {{ tier.title }}
                </h2>
                <p class="mb-6 leading-relaxed text-neutral-600">
                    {{ tier.intro }}
                </p>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div
                        v-for="el in tier.items"
                        :key="el.name"
                        class="panel-newsprint"
                    >
                        <h3 class="mb-1.5 font-serif text-lg font-bold leading-snug">
                            {{ el.name }}
                        </h3>
                        <p class="label-meta mb-3">
                            Best estimate {{ el.best.toFixed(1) }}°C
                            <span class="text-neutral-500">(range {{ fmtRange(el) }})</span>
                            · {{ el.timescale }}
                        </p>
                        <p class="m-0 text-sm leading-relaxed">{{ el.blurb }}</p>
                    </div>
                </div>

                <div v-if="tier.qualitative.length" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div
                        v-for="el in tier.qualitative"
                        :key="el.name"
                        class="panel-newsprint border-dashed"
                    >
                        <h3 class="mb-1.5 font-serif text-lg font-bold leading-snug">
                            {{ el.name }}
                        </h3>
                        <p class="label-meta mb-3">Discussed, not quantitatively assessed</p>
                        <p class="m-0 text-sm leading-relaxed">{{ el.note }}</p>
                    </div>
                </div>
            </section>

            <section class="inverted-section newsprint-texture mb-12" aria-labelledby="caveat-heading">
                <p class="label-meta mb-3 text-neutral-400">How to read these thresholds</p>
                <h2 id="caveat-heading" class="mb-4 font-serif text-2xl font-black leading-tight">
                    Equilibrium commitment, not an overnight switch
                </h2>
                <p class="mb-4 leading-relaxed">
                    Most of the thresholds above are long-run <strong>equilibrium</strong> thresholds,
                    not necessarily points at which change happens overnight. The Greenland Ice Sheet
                    could be “committed” to eventual collapse at 1.5°C even though the full collapse
                    plays out over thousands of years. Permafrost thaw and coral die-off, by contrast,
                    operate on much shorter timescales — years to decades — so crossing their thresholds
                    is felt far sooner.
                </p>
                <p class="mb-0 leading-relaxed">
                    The thresholds are also assessed largely one element at a time. Interactions between
                    tipping elements can lower the critical temperature at which each one destabilizes,
                    which means this list likely understates overall risk once cascading effects are
                    considered. One Earth-system model of these interactions finds that current policies
                    this century would commit the planet to roughly a
                    <strong>45% cumulative tipping risk by the year 2300</strong>, with risk accelerating
                    sharply for any peak warming above 2.0°C.
                </p>
            </section>

            <section class="mb-0" aria-labelledby="tp-refs-heading">
                <h2 id="tp-refs-heading" class="section-heading mb-3">References</h2>
                <ol class="m-0 list-decimal space-y-4 pl-6 leading-relaxed break-words">
                    <li>
                        Armstrong McKay, D. I., Staal, A., Abrams, J. F., Winkelmann, R., Sakschewski,
                        B., Loriani, S., Fetzer, I., Cornell, S. E., Rockström, J., &amp; Lenton, T. M.
                        (2022). Exceeding 1.5°C global warming could trigger multiple climate tipping
                        points. <em>Science</em>, 377(6611), eabn7950.
                        <a href="https://doi.org/10.1126/science.abn7950" rel="noopener noreferrer"
                            >https://doi.org/10.1126/science.abn7950</a
                        >. Primary source for every best-estimate and range value on this page.
                    </li>
                    <li>
                        Potsdam Institute for Climate Impact Research (2022, September 9). Risk of
                        passing multiple climate tipping points escalates above 1.5°C global warming
                        [Press release].
                        <a
                            href="https://www.pik-potsdam.de/en/news/latest-news/risk-of-passing-multiple-climate-tipping-points-escalates-above-1-5degc-global-warming"
                            rel="noopener noreferrer"
                            >pik-potsdam.de</a
                        >. Source for the Greenland Ice Sheet framing and the “five tipping points
                        already at risk” context.
                    </li>
                    <li>
                        Wikipedia contributors. Tipping points in the climate system. <em>Wikipedia,
                        The Free Encyclopedia</em>.
                        <a
                            href="https://en.wikipedia.org/wiki/Tipping_points_in_the_climate_system"
                            rel="noopener noreferrer"
                            >https://en.wikipedia.org/wiki/Tipping_points_in_the_climate_system</a
                        >. Cross-referenced for per-element threshold and timescale figures drawn from
                        Armstrong McKay et al. (2022).
                    </li>
                    <li>
                        ScienceDaily (2022, September 8). Risk of multiple climate tipping points
                        escalates above 1.5°C global warming.
                        <a
                            href="https://www.sciencedaily.com/releases/2022/09/220908172309.htm"
                            rel="noopener noreferrer"
                            >sciencedaily.com</a
                        >.
                    </li>
                    <li>
                        ScienceDaily (2021, June 3). Tipping elements can destabilize each other,
                        leading to climate domino effects.
                        <a
                            href="https://www.sciencedaily.com/releases/2021/06/210603170305.htm"
                            rel="noopener noreferrer"
                            >sciencedaily.com</a
                        >. Source for the cascade/interaction caveat above.
                    </li>
                    <li>
                        Winkelmann, R., Garbe, J., Donges, J. F., &amp; Albrecht, T. (2026). Mapping
                        tipping risks from Antarctic ice basins under global warming.
                        <em>Nature Climate Change</em>.
                        <a
                            href="https://doi.org/10.1038/s41558-025-02554-0"
                            rel="noopener noreferrer"
                            >https://doi.org/10.1038/s41558-025-02554-0</a
                        >. Source for the Wilkes / Cook–Ninnis–Mertz sub-basin note under East Antarctic
                        subglacial basins.
                    </li>
                    <li>
                        Parry, I., Ritchie, P., &amp; Cox, P. (2022). Evidence of Amazon rainforest
                        dieback in CMIP6 models. <em>Earth System Dynamics</em>, 13, 1667–1682.
                        <a
                            href="https://esd.copernicus.org/articles/13/1667/2022/"
                            rel="noopener noreferrer"
                            >https://esd.copernicus.org/articles/13/1667/2022/</a
                        >.
                    </li>
                    <li>
                        Global Tipping Points Explainer (2022, September 9). Exceeding 1.5°C global
                        warming could trigger multiple climate tipping points — paper explainer.
                        <a
                            href="https://climatetippingpoints.info/2022/09/09/climate-tipping-points-reassessment-explainer/"
                            rel="noopener noreferrer"
                            >climatetippingpoints.info</a
                        >.
                    </li>
                    <li>
                        Möller, T., Högner, A. E., Schleussner, C.-F., Bien, S., Kitzmann, N. H.,
                        Lamboll, R. D., Rogelj, J., Donges, J. F., Rockström, J., &amp; Wunderling, N.
                        (2024). Achieving net zero greenhouse gas emissions critical to limit climate
                        tipping risks. <em>Nature Communications</em>, 15, 6192.
                        <a
                            href="https://doi.org/10.1038/s41467-024-49863-0"
                            rel="noopener noreferrer"
                            >https://doi.org/10.1038/s41467-024-49863-0</a
                        >. Source for the 45%-by-2300 cumulative tipping-risk figure.
                    </li>
                </ol>
            </section>
        </article>
    </Transition>
</template>

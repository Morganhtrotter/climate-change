<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import WhatCanWeDoChart from '../components/WhatCanWeDoChart.vue'
import { GLOBAL_CONTEXT, SECTORS, SOLUTIONS, INDIVIDUAL_ACTIONS } from '../data/whatCanWeDo.js'

const sectorSections = computed(() =>
    SECTORS.map((sector) => ({
        ...sector,
        items: SOLUTIONS.filter((s) => s.sectorId === sector.id).sort((a, b) => b.high - a.high),
    })),
)

function fmtGt(s) {
    return s.low === s.high ? `${s.high.toFixed(2)} Gt/yr` : `${s.low.toFixed(1)}–${s.high.toFixed(1)} Gt/yr`
}
</script>

<template>
    <Transition name="carousel-fade" appear>
        <article class="page-container max-w-[1440px] newsprint-texture">
            <header class="mb-8 border-b-4 border-newsprint-fg pb-6">
                <RouterLink class="link-back mb-4 inline-block" to="/">← Climate data</RouterLink>
                <h1 class="mb-3 font-serif text-3xl font-black leading-tight lg:text-4xl">
                    What Can We Do
                </h1>
                <p class="drop-cap m-0 max-w-3xl leading-relaxed">
                    Climate change is often reported as a diagnosis without a prescription. It has one:
                    a well-studied set of technologies and practices, deployable today, whose combined
                    potential exceeds what is needed to bend the emissions curve down this decade. The
                    thresholds on the Tipping Points page describe what happens if we don't use them —
                    this page quantifies what happens if we do.
                </p>
            </header>

            <section class="mb-10" aria-labelledby="context-heading">
                <h2 id="context-heading" class="section-heading mb-3">The scale of the problem</h2>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div class="panel-newsprint">
                        <p class="label-meta mb-2">Current global emissions</p>
                        <p class="m-0 font-serif text-2xl font-black leading-tight">
                            {{ GLOBAL_CONTEXT.currentEmissionsGt }} Gt CO2-eq
                        </p>
                        <p class="mt-1 text-sm text-neutral-600">per year, {{ GLOBAL_CONTEXT.currentEmissionsYear }}</p>
                    </div>
                    <div class="panel-newsprint">
                        <p class="label-meta mb-2">Required trajectory</p>
                        <p class="m-0 font-serif text-2xl font-black leading-tight">
                            Peak by {{ GLOBAL_CONTEXT.peakByYear }}
                        </p>
                        <p class="mt-1 text-sm text-neutral-600">
                            then cut {{ GLOBAL_CONTEXT.reduction2030 }} below {{ GLOBAL_CONTEXT.reduction2030Baseline }} levels by 2030
                        </p>
                    </div>
                    <div class="panel-newsprint">
                        <p class="label-meta mb-2">Available mitigation potential</p>
                        <p class="m-0 font-serif text-2xl font-black leading-tight">
                            {{ GLOBAL_CONTEXT.mitigationPotentialLowGt }}–{{ GLOBAL_CONTEXT.mitigationPotentialHighGt }} Gt CO2-eq
                        </p>
                        <p class="mt-1 text-sm text-neutral-600">by 2030, across all sectors, more than half below $20/tonne</p>
                    </div>
                </div>
                <p class="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-600">
                    The IPCC's Sixth Assessment Report (2022) concluded that the technical and economic
                    potential to halve emissions by 2030 already exists in every sector — the gap is one
                    of deployment and policy, not invention. Clean-energy costs have fallen accordingly:
                    solar, wind, and battery prices have dropped up to
                    {{ GLOBAL_CONTEXT.cleanEnergyCostDrop }} since 2010<sup class="ml-0.5 font-semibold">[1]</sup>.
                </p>
            </section>

            <section class="mb-12" aria-labelledby="chart-heading">
                <h2 id="chart-heading" class="section-heading mb-3">Where the biggest levers are</h2>
                <p class="mb-6 max-w-3xl text-sm leading-relaxed text-neutral-600">
                    Twenty solutions grouped by sector, ranked within each group by estimated impact.
                    Bars show Project Drawdown's estimated range of Gt CO2-eq avoided or sequestered per
                    year at full projected deployment<sup class="ml-0.5 font-semibold">[2]</sup>. Hover
                    or focus a row for the full range and a short description.
                </p>
                <WhatCanWeDoChart />
            </section>

            <section
                v-for="sector in sectorSections"
                :key="sector.id"
                class="mb-12 last:mb-0"
                :aria-labelledby="`${sector.id}-heading`"
            >
                <p class="label-meta mb-2 text-newsprint-accent">{{ sector.tag }}</p>
                <h2 :id="`${sector.id}-heading`" class="section-heading mb-3">{{ sector.title }}</h2>
                <p class="mb-6 max-w-3xl leading-relaxed text-neutral-600">{{ sector.intro }}</p>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div
                        v-for="s in sector.items"
                        :key="s.name"
                        class="panel-newsprint hard-shadow-hover"
                    >
                        <h3 class="mb-1.5 font-serif text-lg font-bold leading-snug">{{ s.name }}</h3>
                        <p class="label-meta mb-3">{{ fmtGt(s) }} avoided or sequestered</p>
                        <p class="m-0 text-sm leading-relaxed">{{ s.blurb }}</p>
                    </div>
                </div>
            </section>

            <section class="inverted-section newsprint-texture mb-12" aria-labelledby="systemic-heading">
                <p class="label-meta mb-3 text-neutral-400">Why policy and industry outweigh any single habit</p>
                <h2 id="systemic-heading" class="mb-4 font-serif text-2xl font-black leading-tight">
                    The solutions above are not additive one-by-one purchases
                </h2>
                <p class="mb-4 leading-relaxed">
                    Every figure on this page describes potential at full, mature deployment — a wind
                    farm, a refrigerant-recovery program, or a transit network reaching the scale
                    described only after years of financing, permitting, and construction happening in
                    parallel across many countries at once. None of them individually closes the gap
                    between current emissions and the required trajectory; together, deployed at pace,
                    the IPCC's assessment is that they can<sup class="ml-0.5 font-semibold">[1]</sup>.
                </p>
                <p class="mb-0 leading-relaxed">
                    That is also why the largest, cheapest levers — solar, wind, refrigerant management,
                    stopping deforestation — are concentrated in <strong>policy and industrial-scale
                    decisions</strong>: utility procurement, building codes, refrigerant regulation, land-use
                    law. Individual choices still matter, both directly and as a signal that shifts what
                    policy and industry find viable — the next section quantifies that contribution too.
                </p>
            </section>

            <section class="mb-12" aria-labelledby="individual-heading">
                <h2 id="individual-heading" class="section-heading mb-3">What one person's choices are worth</h2>
                <p class="mb-6 max-w-3xl leading-relaxed text-neutral-600">
                    Wynes &amp; Nicholas (2017) compared the annual emissions impact of dozens of
                    commonly recommended individual actions and found the effective ones cluster far
                    from the ones most often promoted<sup class="ml-0.5 font-semibold">[3]</sup>. Figures
                    below are averages for individuals in developed countries.
                </p>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div
                        v-for="a in INDIVIDUAL_ACTIONS"
                        :key="a.name"
                        class="panel-newsprint hard-shadow-hover"
                    >
                        <h3 class="mb-1.5 font-serif text-lg font-bold leading-snug">{{ a.name }}</h3>
                        <p class="label-meta mb-3">{{ a.value }}</p>
                        <p class="m-0 text-sm leading-relaxed">{{ a.note }}</p>
                    </div>
                </div>
                <p
                    class="mt-4 border-l-4 border-newsprint-accent bg-newsprint-muted/60 px-3 py-2.5 text-sm leading-relaxed text-neutral-600"
                >
                    <strong class="text-newsprint-fg">On "one fewer child":</strong> this figure attributes a
                    discounted share of a hypothetical child's — and their descendants' — lifetime emissions
                    to the parent, under an assumption that current national emissions rates persist across
                    generations. Critics argue this both double-counts emissions already attributed to the
                    child as an independent adult and treats a highly personal decision as an
                    emissions-reduction strategy comparable to a light-bulb swap. It is included here because
                    it is the study's own headline result, not because this site endorses treating
                    reproductive choices as a mitigation lever.
                </p>
            </section>

            <section class="mb-12" aria-labelledby="caveat-heading">
                <h2 id="caveat-heading" class="section-heading mb-3">How to read these numbers</h2>
                <p class="mb-4 max-w-3xl leading-relaxed text-neutral-600">
                    Every figure above is a <strong>technical or economic potential</strong>, not a
                    guarantee — it describes what a solution could deliver if deployed at the scale
                    modeled, not what current policy trajectories will actually achieve. Solution
                    estimates overlap in places (efficient buildings reduce the electricity that solar
                    and wind need to displace, for instance), so summing every bar on the chart would
                    overstate total avoided emissions. Ranges reflect genuine uncertainty in deployment
                    speed, regional variation, and underlying data — treat the low end as a floor and the
                    high end as an upper bound, not a midpoint estimate to average.
                </p>
            </section>

            <section class="mb-0" aria-labelledby="wcwd-refs-heading">
                <h2 id="wcwd-refs-heading" class="section-heading mb-3">References</h2>
                <ol class="m-0 list-decimal space-y-4 pl-6 leading-relaxed break-words">
                    <li>
                        IPCC (2022). <em>Climate Change 2022: Mitigation of Climate Change. Contribution of
                        Working Group III to the Sixth Assessment Report of the Intergovernmental Panel on
                        Climate Change.</em> Summary for Policymakers.
                        <a
                            href="https://www.ipcc.ch/report/ar6/wg3/downloads/report/IPCC_AR6_WGIII_SPM.pdf"
                            rel="noopener noreferrer"
                            >ipcc.ch</a
                        >. Source for the peak-by-2025, 43%-cut-by-2030, 32–44 Gt CO2-eq mitigation-potential,
                        and clean-energy cost-decline figures. See also the accompanying
                        <a
                            href="https://www.ipcc.ch/2022/04/04/ipcc-ar6-wgiii-pressrelease/"
                            rel="noopener noreferrer"
                            >press release</a
                        >.
                    </li>
                    <li>
                        Project Drawdown. <em>Drawdown Explorer / Table of Solutions.</em>
                        <a href="https://drawdown.org/solutions" rel="noopener noreferrer">drawdown.org/solutions</a>
                        (accessed 2026). Successor to the peer-reviewed methodology in Hawken, P. (Ed.) (2017),
                        <em>Drawdown: The Most Comprehensive Plan Ever Proposed to Reverse Global Warming</em>,
                        and Project Drawdown (2020), <em>The Drawdown Review</em>. Source for every solution's
                        Gt CO2-eq/yr range on this page.
                    </li>
                    <li>
                        Wynes, S. &amp; Nicholas, K. A. (2017). The climate mitigation gap: education and
                        government recommendations miss the most effective individual actions.
                        <em>Environmental Research Letters</em>, 12(7), 074024.
                        <a href="https://doi.org/10.1088/1748-9326/aa7541" rel="noopener noreferrer"
                            >https://doi.org/10.1088/1748-9326/aa7541</a
                        >. Source for every figure in the individual-actions section.
                    </li>
                    <li>
                        National and world historical emissions context reuses this site's PRIMAP-hist
                        EARTH series — see reference&nbsp;[2] on the
                        <RouterLink to="/sources">Sources page</RouterLink> for the full citation.
                    </li>
                </ol>
            </section>
        </article>
    </Transition>
</template>

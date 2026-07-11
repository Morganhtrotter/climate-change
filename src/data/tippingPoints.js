/**
 * Climate tipping-element thresholds (°C of warming above pre-industrial).
 * Primary source: Armstrong McKay, D. I. et al. (2022), "Exceeding 1.5°C global warming
 * could trigger multiple climate tipping points," Science, doi:10.1126/science.abn7950.
 * Cross-checked against the sources listed on the Tipping Points and Sources pages.
 * Shared by TippingPointsChart.vue (visualization) and TippingPointsView.vue (tier cards).
 */

export const TIERS = [
    {
        id: 'tier-a',
        tag: '≤ 1.5°C',
        title: 'Already within reach',
        intro: 'Four tipping elements are assessed as likely to be triggered at or just above the Paris Agreement’s 1.5°C target — meaning the world may already be approaching, or committed to, some of them.',
    },
    {
        id: 'tier-b',
        tag: '1.5–2°C',
        title: 'The next threshold',
        intro: 'Two further elements — both centred on the North Atlantic and Arctic — are forecast as likely on approach to 2°C.',
    },
    {
        id: 'tier-c',
        tag: '2–3°C',
        title: 'Systemic risk builds',
        intro: 'Between 2°C and 3°C, additional monsoon and ice-sheet systems join the list, and cascading interactions between already-tipped elements become a live concern.',
    },
    {
        id: 'tier-d',
        tag: '3°C and beyond',
        title: 'Deep Earth-system reorganization',
        intro: 'Above 3°C, singular large-scale events — rainforest dieback, ocean-circulation collapse — become very likely, and the story shifts from individual tipping points to chains of them.',
    },
]

export const TIPPING_ELEMENTS = [
    {
        name: 'Greenland Ice Sheet',
        tierId: 'tier-a',
        best: 1.5,
        low: 0.8,
        high: 3.0,
        timescale: '1,000–15,000 yrs to complete loss',
        blurb: 'There are indications that the tipping point leading to long-term, essentially irreversible ice loss is likely reached around 1.5°C of warming. Complete loss would eventually contribute up to roughly 7 m of global sea-level rise.',
    },
    {
        name: 'West Antarctic Ice Sheet',
        tierId: 'tier-a',
        best: 1.5,
        low: 1.0,
        high: 3.0,
        timescale: '500–13,000 yrs',
        blurb: 'Marine ice-sheet instability is estimated to likely pass a tipping point at 1.5°C. Once under way, collapse could contribute several metres of sea-level rise over centuries to millennia.',
    },
    {
        name: 'Tropical coral reefs',
        tierId: 'tier-a',
        best: 1.5,
        low: 1.0,
        high: 2.0,
        timescale: '~10 yrs',
        blurb: 'Warm-water coral reef die-off is estimated to likely pass a tipping point at 1.5°C. Repeated bleaching events prevent recovery, and roughly 70–90% of reefs are projected to disappear, ending the ecosystem services reef communities depend on.',
    },
    {
        name: 'Boreal permafrost (abrupt thaw)',
        tierId: 'tier-a',
        best: 1.5,
        low: 1.0,
        high: 2.3,
        timescale: '100–300 yrs; emissions begin within decades',
        blurb: 'Abrupt permafrost thaw is estimated to likely pass a tipping point at 1.5°C. It releases stored CO₂ and methane, a self-amplifying feedback loop that accelerates warming beyond direct human emissions.',
    },
    {
        name: 'Barents Sea winter ice',
        tierId: 'tier-b',
        best: 1.6,
        low: 1.5,
        high: 1.7,
        timescale: '~25 yrs',
        blurb: 'Abrupt loss of Barents Sea winter ice is forecast as likely on approach to 2°C. It accelerates Arctic warming through the ice–albedo feedback: a darker, heat-absorbing ocean replaces reflective ice.',
    },
    {
        name: 'Labrador–Irminger Seas convection',
        tierId: 'tier-b',
        best: 1.8,
        low: 1.1,
        high: 3.8,
        timescale: '5–50 yrs',
        blurb: 'Collapse of deep convection in the Labrador and Irminger Seas — a major component of Atlantic circulation — is forecast as likely near 2°C, and could unfold over as little as a few decades, among the fastest-acting elements assessed.',
    },
    {
        name: 'West African monsoon / Sahel',
        tierId: 'tier-c',
        best: 2.8,
        low: 2.0,
        high: 3.5,
        timescale: '10–500 yrs',
        blurb: 'An abrupt reorganization of West African monsoon rainfall is assessed between 2°C and 3.5°C. The direction and regional magnitude of the shift carry real uncertainty, but the scale of change would matter enormously for Sahelian agriculture.',
    },
    {
        name: 'East Antarctic subglacial basins',
        tierId: 'tier-c',
        best: 3.0,
        low: 2.0,
        high: 6.0,
        timescale: '500–10,000 yrs',
        blurb: 'The marine basins of East Antarctica hold ice equivalent to many metres of potential sea-level rise. The Wilkes / Cook–Ninnis–Mertz sector is flagged as the earliest-risk sector, with instability potentially beginning around 2–3°C.',
    },
    {
        name: 'Amazon rainforest',
        tierId: 'tier-d',
        best: 3.5,
        low: 2.0,
        high: 6.0,
        timescale: '50–200 yrs',
        blurb: 'A lengthened dry season, increased fire frequency, and reduced precipitation could convert large areas of rainforest to savanna. Partial dieback would release carbon on the order of 30 billion tonnes; near-total dieback roughly 75 billion tonnes.',
    },
    {
        name: 'Boreal forest (southern dieback)',
        tierId: 'tier-d',
        best: 4.0,
        low: 1.4,
        high: 5.0,
        timescale: '50+ yrs',
        blurb: 'As warming pushes the boreal zone northward, the southern edge of the world’s second-largest forest biome faces die-off from drought, fire, and pest outbreaks — a major carbon sink losing its function.',
    },
    {
        name: 'AMOC collapse',
        tierId: 'tier-d',
        best: 4.0,
        low: 1.4,
        high: 8.0,
        timescale: '15–300 yrs',
        blurb: 'Collapse of the Atlantic Meridional Overturning Circulation would dramatically alter temperature and precipitation patterns across Europe and the North Atlantic. It is considered one of the most consequential possible tipping events for human civilization, though its threshold is among the least tightly constrained.',
    },
]

/**
 * Qualitative risks discussed in the source literature without a single-value,
 * peer-reviewed threshold comparable to the elements above — shown as prose, not
 * plotted on the chart, so the visualization never implies false numeric precision.
 */
export const QUALITATIVE_RISKS = [
    {
        name: 'Indian Summer Monsoon shift',
        tierId: 'tier-d',
        note: 'Discussed as a high-warming risk to agriculture for over a billion people, but Armstrong McKay et al. (2022) excluded it from their quantitative assessment: the balance of evidence suggests warming tends to strengthen, rather than destabilize, the monsoon — a reminder that not every widely discussed “tipping point” has a settled threshold.',
    },
    {
        name: 'Cascade and compound interactions',
        tierId: 'tier-d',
        note: 'Individual thresholds likely overstate safety in isolation: interactions between tipping elements can lower the critical temperature at which others destabilize. One Earth-system model finds tipping risk strongly accelerates for peak warming above 2.0°C, and that current policies this century would commit the planet to roughly a 45% cumulative tipping risk by the year 2300.',
    },
]

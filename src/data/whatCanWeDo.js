/**
 * Climate mitigation solutions and their estimated global impact.
 *
 * Solution-level estimates (Gt CO2-eq avoided or sequestered per year, at full
 * projected deployment) are drawn from Project Drawdown's Drawdown Explorer /
 * Table of Solutions (drawdown.org, accessed 2026), the successor to the
 * peer-reviewed methodology published in Hawken (Ed.), Drawdown (2017) and
 * The Drawdown Review (2020). These are technical/economic potentials, not
 * forecasts — see the caveat section on the page itself and full citations on
 * the Sources page.
 *
 * Systemic framing figures are drawn from the IPCC Sixth Assessment Report,
 * Working Group III, Summary for Policymakers (2022).
 *
 * Individual-action figures are drawn from Wynes & Nicholas (2017), "The
 * climate mitigation gap," Environmental Research Letters.
 *
 * Current global emissions baseline reuses this site's PRIMAP-hist EARTH
 * series (see src/data and the Sources page) for internal consistency with
 * the Home and Graphs pages.
 */

export const GLOBAL_CONTEXT = {
    currentEmissionsGt: 49.6,
    currentEmissionsYear: 2023,
    peakByYear: 2025,
    reduction2030: '43%',
    reduction2030Baseline: 2019,
    mitigationPotentialLowGt: 32,
    mitigationPotentialHighGt: 44,
    cleanEnergyCostDrop: '85%',
}

export const SECTORS = [
    {
        id: 'electricity',
        tag: 'Electricity & power',
        title: 'Decarbonizing the grid',
        intro: 'Generating electricity is the single largest source of global emissions, which also makes it the sector with the largest available solutions. Wind and solar costs have fallen so fast that new renewable capacity is now cheaper than continuing to run most existing fossil generation.',
    },
    {
        id: 'food',
        tag: 'Food, agriculture & land',
        title: 'Growing, eating, and wasting less carbon',
        intro: 'What is farmed, how it is grown, and how much of it is thrown away together account for roughly a third of global emissions — and land itself can be a carbon sink or a carbon source depending on how it is managed.',
    },
    {
        id: 'buildings-industry',
        tag: 'Buildings & industry',
        title: 'Materials, refrigerants, and heat',
        intro: 'Heavy industry and buildings run on process heat, refrigerant chemicals, and embedded materials that are individually less visible than a wind farm but collectively add up to a comparable share of emissions.',
    },
    {
        id: 'transport',
        tag: 'Transportation',
        title: 'Moving people and goods',
        intro: 'Road transport dominates this sector\'s emissions. Electrification, modal shift to transit and non-motorized options, and efficiency improvements each chip away at a different slice of it.',
    },
]

/**
 * Sorted descending by high-estimate within each sector's declared order above.
 * low/high are Gt CO2-eq avoided or sequestered per year at full deployment.
 */
export const SOLUTIONS = [
    {
        name: 'Utility-scale solar PV',
        sectorId: 'electricity',
        low: 9.2,
        high: 11.0,
        blurb: 'Grid-scale photovoltaic installations. The single largest solution in the Drawdown dataset — module costs have dropped roughly 90% since 2010, making new solar cheaper than new fossil generation in most markets.',
    },
    {
        name: 'Onshore wind turbines',
        sectorId: 'electricity',
        low: 5.4,
        high: 7.5,
        blurb: 'Land-based wind farms, now among the cheapest sources of new electricity generation in many regions, with mature supply chains and financing.',
    },
    {
        name: 'Distributed (rooftop) solar PV',
        sectorId: 'electricity',
        low: 2.8,
        high: 3.5,
        blurb: 'Building-mounted panels that displace grid electricity at the point of use, reducing transmission losses and giving households and businesses direct exposure to falling solar costs.',
    },
    {
        name: 'Offshore wind turbines',
        sectorId: 'electricity',
        low: 1.9,
        high: 3.04,
        blurb: 'Ocean-sited turbines that capture stronger, steadier winds than most onshore sites; costs have fallen quickly as turbines and installation vessels have scaled up.',
    },
    {
        name: 'LED lighting',
        sectorId: 'electricity',
        low: 0.62,
        high: 0.65,
        blurb: 'Solid-state lighting uses a fraction of the electricity of incandescent or fluorescent bulbs — a small per-unit effect multiplied across essentially every building on Earth.',
    },
    {
        name: 'Reduce food loss & waste',
        sectorId: 'food',
        low: 1.23,
        high: 2.47,
        blurb: 'Roughly a third of food produced is never eaten. Cutting loss across the supply chain and waste at the retail and household level avoids both the emissions of growing that food and the methane released as it rots in landfills.',
    },
    {
        name: 'Shift to plant-rich diets',
        sectorId: 'food',
        low: 1.4,
        high: 2.8,
        blurb: 'Ruminant livestock (especially cattle) are disproportionately emissions-intensive per calorie. Shifting a portion of global demand toward plant-based proteins reduces methane, land conversion, and feed-related emissions.',
    },
    {
        name: 'Protect tropical forests',
        sectorId: 'food',
        low: 1.67,
        high: 2.35,
        blurb: 'Intact tropical forest is one of the largest active carbon sinks on land. Halting conversion to agriculture keeps that stored carbon out of the atmosphere and preserves the sink for future removal.',
    },
    {
        name: 'Protect tropical peatlands',
        sectorId: 'food',
        low: 0.95,
        high: 1.22,
        blurb: 'Peat soils store carbon built up over thousands of years; draining them for agriculture (and the fires that often follow) releases it rapidly. Keeping peatlands wet keeps that carbon locked in the ground.',
    },
    {
        name: 'Manage refrigerants (HFC phase-down)',
        sectorId: 'buildings-industry',
        low: 2.5,
        high: 2.7,
        blurb: 'Hydrofluorocarbon refrigerants used in cooling and refrigeration are thousands of times more potent than CO2 by mass. Capturing, destroying, and replacing them with low-GWP alternatives under the Kigali Amendment is one of the fastest-acting levers available.',
    },
    {
        name: 'Improve windows & building envelopes',
        sectorId: 'buildings-industry',
        low: 2.1,
        high: 2.6,
        blurb: 'Better insulation, glazing, and air sealing cut the heating and cooling load of a building for its entire lifetime, lowering demand on whatever generates its electricity or heat.',
    },
    {
        name: 'Recycle metals',
        sectorId: 'buildings-industry',
        low: 1.9,
        high: 2.1,
        blurb: 'Producing metal from recycled scrap takes a fraction of the energy that primary smelting from ore requires, avoiding both energy-related emissions and mining impacts.',
    },
    {
        name: 'Centralized composting',
        sectorId: 'buildings-industry',
        low: 0.78,
        high: 1.2,
        blurb: 'Diverting organic waste from landfills to managed composting prevents anaerobic decomposition, the process that turns landfilled food and yard waste into methane.',
    },
    {
        name: 'Substitute cement clinker',
        sectorId: 'buildings-industry',
        low: 0.7,
        high: 1.0,
        blurb: 'Clinker production is the most carbon-intensive step in cement making. Replacing part of it with fly ash, slag, or other substitutes cuts emissions from one of the hardest-to-decarbonize industrial materials.',
    },
    {
        name: 'Deploy clean cooking',
        sectorId: 'buildings-industry',
        low: 0.98,
        high: 0.98,
        blurb: 'Replacing open fires and inefficient stoves burning wood, charcoal, or kerosene with cleaner-burning or electric alternatives cuts both emissions and the indoor air pollution that harms hundreds of millions of people today.',
    },
    {
        name: 'Use heat pumps',
        sectorId: 'buildings-industry',
        low: 0.58,
        high: 0.93,
        blurb: 'Heat pumps move heat rather than generating it by combustion, delivering several units of heating or cooling per unit of electricity — a large efficiency gain over gas furnaces and resistive heating.',
    },
    {
        name: 'Mobilize electric cars',
        sectorId: 'transport',
        low: 1.26,
        high: 2.3,
        blurb: 'Battery-electric vehicles eliminate tailpipe emissions outright and become cleaner over time as the electricity grid that charges them decarbonizes.',
    },
    {
        name: 'Expand non-motorized transport',
        sectorId: 'transport',
        low: 1.43,
        high: 1.89,
        blurb: 'Walking and cycling infrastructure shifts short trips away from cars entirely, with essentially zero operating emissions and substantial co-benefits for health and local air quality.',
    },
    {
        name: 'Enhance public transit',
        sectorId: 'transport',
        low: 0.7,
        high: 1.03,
        blurb: 'Moving people by bus and rail rather than single-occupancy vehicles cuts per-passenger emissions sharply, particularly as transit fleets themselves electrify.',
    },
    {
        name: 'Mobilize hybrid cars',
        sectorId: 'transport',
        low: 0.34,
        high: 0.86,
        blurb: 'Hybrid drivetrains improve fuel economy over conventional combustion vehicles without requiring charging infrastructure, useful as a transitional step in markets where EV adoption is slower.',
    },
]

/**
 * Wynes, S. & Nicholas, K. A. (2017), "The climate mitigation gap,"
 * Environmental Research Letters 12(7). Figures are averages for individuals
 * in developed countries; see the page's caveat section for the "one fewer
 * child" accounting controversy.
 */
export const INDIVIDUAL_ACTIONS = [
    {
        name: 'Have one fewer child',
        value: '58.6 tCO2e/yr',
        note: 'By far the largest single figure in the study, calculated by amortizing a share of descendants\' lifetime emissions back to the parent under current-average national emissions rates. It is also the most contested figure the study produced — see the caveat below.',
    },
    {
        name: 'Live car-free',
        value: '2.4 tCO2e/yr',
        note: 'Avoiding vehicle ownership and use entirely, replaced by walking, cycling, and public transit.',
    },
    {
        name: 'Avoid one transatlantic round-trip flight',
        value: '1.6 tCO2e/flight',
        note: 'Aviation emissions are concentrated in a small share of frequent flyers; a single long-haul round trip is comparable to roughly a year of an average diet\'s emissions.',
    },
    {
        name: 'Eat a plant-based diet',
        value: '0.8 tCO2e/yr',
        note: 'About four times the effect of comprehensive recycling and roughly eight times the effect of switching household lightbulbs to LEDs, per the same study\'s comparisons.',
    },
]

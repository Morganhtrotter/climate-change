/**
 * Step-by-step GuidedTour scripts for the three home-page carousel charts. Each builder takes
 * the chart's template ref so steps can drive the chart live (pin a reference line, toggle
 * extrapolate, preview a tooltip) while the matching element is spotlighted.
 */

export function buildTemperatureTourSteps(chartRef) {
    return [
        {
            title: 'Welcome to the temperature chart',
            body: [
                'This chart tracks how much warmer or cooler the world has been each year since 1880, compared with a baseline average.',
                "Let's walk through its key features — click Next to continue, or Skip tour to explore on your own.",
            ],
        },
        {
            target: '[data-anomaly="0"]',
            title: 'Baseline 1: the 1951–1980 average',
            body: "This dashed line is zero — NASA's reference period. Every value on the chart is measured as how far above or below this 30-year average a given year was.",
            onEnter: () => chartRef.value?.focusReference(0),
        },
        {
            target: '[data-anomaly="-0.19"]',
            title: 'Baseline 2: the pre-industrial average',
            body: 'This second line marks temperatures before industrial emissions took off — about 0.19°C cooler than the 1951–1980 average. Most warming targets, like "1.5°C," are measured from this earlier baseline instead.',
            onEnter: () => chartRef.value?.focusReference(-0.19),
        },
        {
            target: '[data-tour="temp-extrapolate"]',
            title: 'The Extrapolate button',
            body: "Turning this on projects the last 40 years of warming forward as a dashed line, so you can see roughly when we'd reach future thresholds if the recent trend continues.",
            onEnter: () => {
                chartRef.value?.clearReference()
                chartRef.value?.setExtrapolate(true)
            },
        },
        {
            target: '[data-anomaly="1.31"]',
            title: 'Tipping point: 1.5°C of warming',
            body: 'At 1.5°C above pre-industrial levels, coral reefs and Arctic summer sea ice become seriously at risk, and heatwaves once considered rare become common.',
            onEnter: () => chartRef.value?.focusReference(1.31),
        },
        {
            target: '[data-anomaly="1.81"]',
            title: 'Tipping point: 2°C of warming',
            body: 'At 2°C, major systems like the Greenland Ice Sheet and the Amazon rainforest face a serious risk of passing points of no return.',
            onEnter: () => chartRef.value?.focusReference(1.81),
        },
        {
            target: '[data-anomaly="2.81"]',
            title: 'Tipping point: 3°C of warming',
            body: 'At 3°C, permafrost thaw becomes a major source of additional warming on its own, and large parts of the Amazon may collapse into a different ecosystem entirely.',
            onEnter: () => chartRef.value?.focusReference(2.81),
        },
        {
            target: '[data-anomaly="3.81"]',
            title: 'Tipping point: 4°C of warming',
            body: 'At 4°C, the Earth system is considered profoundly destabilized — entire climate zones shift and extreme weather becomes the everyday norm rather than the exception.',
            onEnter: () => chartRef.value?.focusReference(3.81),
        },
        {
            target: '[data-tour="temp-chart-area"]',
            title: "You're ready to explore",
            body: 'Hover anywhere on the line to see the exact anomaly for any year, or click a dashed line any time to revisit what it means.',
            onEnter: () => chartRef.value?.clearReference(),
        },
    ]
}

export function buildGhgTourSteps(chartRef) {
    return [
        {
            title: 'Welcome to the greenhouse gas chart',
            body: 'This line shows the total greenhouse gases released worldwide each year, all converted into one common unit (CO₂-equivalent) so they can be added together.',
        },
        {
            target: '[data-tour="ghg-baseline"]',
            title: 'The mid-century baseline',
            body: 'This dashed line marks the 1951–1980 average — the same baseline used on the temperature chart — so you can see how far emissions have climbed past it.',
        },
        {
            target: '[data-tour="ghg-chart-area"]',
            title: 'Individual Gas Breakdown',
            body: 'Hover anywhere on the line (or tap it on mobile) to split the total out by gas — carbon dioxide, methane, nitrous oxide, and more — in the panel on the left.',
            onEnter: () => chartRef.value?.previewLatestYear(),
            onExit: () => chartRef.value?.clearPreview(),
        },
        {
            target: '[data-tour="ghg-chart-area"]',
            title: "You're ready to explore",
            body: 'Move your cursor along the line anytime to check a specific year, from 1880 to the most recent data available.',
        },
    ]
}

export function buildMapTourSteps() {
    return [
        {
            title: 'Welcome to the emissions map',
            body: "Every country's greenhouse gas emissions, year by year, plus a running world total and the biggest emitters for whichever year you're looking at.",
        },
        {
            target: '[data-tour="map-total"]',
            title: 'World total',
            body: "This panel shows the world's total greenhouse gas emissions for the year shown on the map — the same total as the chart before it, now broken down by country.",
        },
        {
            target: '[data-tour="map-slider"]',
            title: 'The year slider',
            body: 'Drag this slider to travel through time, from 1880 to the most recent year available, and watch emissions patterns shift country by country.',
        },
        {
            target: '[data-tour="map-play"]',
            title: 'Play button',
            body: 'Prefer to watch it unfold automatically? Press Play to step through every year on its own.',
        },
        {
            target: '[data-tour="map-continents"]',
            title: 'Continents',
            body: 'A quick regional rollup, so you can compare entire continents at a glance instead of scanning every country.',
        },
        {
            target: '[data-tour="map-top5"]',
            title: 'Top 5 countries',
            body: 'The five biggest emitters for the selected year, ranked and ready — no hunting across the map required.',
        },
        {
            target: '[data-tour="map-area"]',
            title: "You're ready to explore",
            body: 'Hover or tap any country on the map to see its exact emissions and gas-by-gas breakdown.',
        },
    ]
}

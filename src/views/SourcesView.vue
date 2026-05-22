<template>
    <Transition name="carousel-fade" appear>
        <article class="page-container max-w-[1440px] newsprint-texture">
            <header class="mb-8 border-b-4 border-newsprint-fg pb-6">
                <h1 class="mb-3 font-serif text-3xl font-black leading-tight lg:text-4xl">
                    Data sources and references
                </h1>
                <p class="m-0 max-w-3xl leading-relaxed">
                    This appendix lists primary observational datasets, derived files stored in this
                    repository, and methodological references underpinning the figures. Citations follow
                    a conventional numbered format so readers can trace each visualization to its
                    evidence base.
                </p>
            </header>

            <section class="mb-9 last:mb-0" aria-labelledby="why-heading">
                <h2 id="why-heading" class="section-heading mb-3">Why we chose these datasets</h2>
                <p class="mb-6 leading-relaxed">
                    This site pairs a global temperature record with harmonized national emissions so that
                    readers can relate observed warming to long-run greenhouse-gas trajectories using sources
                    that are transparent, maintained, and widely used in climate science and policy analysis.
                </p>

                <div class="mb-7 last:mb-0">
                    <h3 class="mb-2.5 font-serif text-lg font-bold leading-snug">
                        NASA climate data — GISS Surface Temperature Analysis (GISTEMP)
                    </h3>
                    <p class="leading-relaxed">
                        We use NASA’s Goddard Institute for Space Studies (GISS)
                        <abbr title="GISS Surface Temperature Analysis">GISTEMP</abbr> land–ocean temperature
                        index—the same family of products documented by NASA’s climate research program and
                        featured across NASA Earth science communications (e.g.
                        <a href="https://climate.nasa.gov/" rel="noopener noreferrer">NASA Climate</a> /
                        Earth Observatory context)—because it is <strong>trusted</strong>: it is produced by a
                        federal climate modeling group with a multi-decade publication record, consistent with
                        methods described in the peer-reviewed literature. The series is
                        <strong>updated frequently</strong> (GISS releases refreshed global-mean tables as new
                        monthly station and ocean data become available; this project can refresh its local
                        copy via the bundled script). It <strong>measures global temperature change since
                        1880</strong>, providing a continuous century-scale context for recent warming. It is
                        also <strong>among the most widely cited global temperature datasets</strong>, making
                        comparisons with textbooks, assessments, and media reporting straightforward for readers
                        checking our charts against other reputable analyses.
                    </p>
                </div>

                <div class="mb-7 last:mb-0">
                    <h3 class="mb-2.5 font-serif text-lg font-bold leading-snug">
                        PRIMAP-hist national historical emissions
                    </h3>
                    <p class="leading-relaxed">
                        We rely on PRIMAP-hist because it offers a <strong>single, peer-reviewed framework</strong>
                        for comparing national emissions over the long run: the same gas and sector definitions
                        (IPCC 2006), the same treatment of the Kyoto basket and GWP choices, and explicit
                        scenarios such as <abbr title="country reported data priority">HISTCR</abbr> that
                        prioritize official UNFCCC reporting while still gap-filling where inventories are
                        incomplete. That makes it well suited to maps and time series that must be
                        <strong>comparable across countries and decades</strong>, and it is widely used in
                        academic and policy analyses—so readers can connect our figures to the broader
                        literature on national mitigation and global totals.
                    </p>
                    <p class="mt-3 leading-relaxed">
                        The PRIMAP-hist national historical emissions time series is a global climate-emissions
                        dataset providing long-term, country-level greenhouse gas (GHG) emissions time series.
                        It combines multiple official and research datasets to produce consistent, gap-filled
                        trajectories for all major Kyoto gases and almost all countries from the preindustrial
                        period to the present.
                    </p>

                    <h4 class="mt-4 mb-2 font-sans text-sm font-semibold first:mt-3">Key facts</h4>
                    <dl
                        class="mb-3 grid grid-cols-1 gap-x-4 gap-y-1.5 text-[0.95rem] leading-snug sm:grid-cols-[minmax(7rem,10rem)_1fr]"
                    >
                        <dt class="m-0 font-semibold text-neutral-500 sm:mt-0 mt-2 first:mt-0">
                            Domain
                        </dt>
                        <dd class="m-0">National GHG emissions time series (climate emissions dataset)</dd>
                        <dt class="m-0 font-semibold text-neutral-500 sm:mt-0 mt-2">Temporal coverage</dt>
                        <dd class="m-0">1750–2024 (latest v2.7 release)</dd>
                        <dt class="m-0 font-semibold text-neutral-500 sm:mt-0 mt-2">Spatial coverage</dt>
                        <dd class="m-0">All UNFCCC Parties + most non-UNFCCC territories</dd>
                        <dt class="m-0 font-semibold text-neutral-500 sm:mt-0 mt-2">Gases</dt>
                        <dd class="m-0">CO₂, CH₄, N₂O, F-gases, Kyoto basket (multiple GWP metrics)</dd>
                        <dt class="m-0 font-semibold text-neutral-500 sm:mt-0 mt-2">Sectors</dt>
                        <dd class="m-0">
                            IPCC 2006 categories (Energy, IPPU, Agriculture, Waste, Other)
                        </dd>
                    </dl>

                    <h4 class="mt-4 mb-2 font-sans text-sm font-semibold">Background and purpose</h4>
                    <p class="mt-3 leading-relaxed">
                        PRIMAP-hist was developed by researchers associated with the Potsdam Institute for
                        Climate Impact Research to create a comparable, comprehensive, and long-run record of
                        national emissions. It addresses inconsistencies and gaps in official national
                        inventories by merging them with other datasets and harmonizing them to common
                        sector/gas definitions. The original method description is documented in Gütschow et
                        al. (2016, <em>Earth System Science Data</em>).
                    </p>

                    <h4 class="mt-4 mb-2 font-sans text-sm font-semibold">Data content and structure</h4>
                    <p class="mt-3 leading-relaxed">
                        The dataset provides annual emissions for individual Kyoto gases (CO₂, CH₄, N₂O,
                        various F-gases); aggregated “Kyoto basket” totals under different GWP choices (e.g.,
                        AR4, AR5, AR6); and IPCC 2006 sectors: Energy; Industrial Processes and Product Use
                        (IPPU); Agriculture; Waste; and “Other,” plus national totals excluding land use,
                        land-use change and forestry (LULUCF). Most versions include a “country reported data
                        priority” (HISTCR) scenario that prioritizes data directly reported by countries to the
                        UNFCCC, supplemented by additional national submissions and gap-filling procedures.
                    </p>

                    <h4 class="mt-4 mb-2 font-sans text-sm font-semibold">Methodology and updates</h4>
                    <p class="mt-3 leading-relaxed">
                        PRIMAP-hist stitches together national inventory data, global/sectoral datasets, and
                        proxy series, then harmonizes and extrapolates where necessary. For recent years it
                        uses official inventories where available; energy CO₂ extrapolation based on energy
                        statistics (e.g., Energy Institute’s Statistical Review of World Energy); and linear
                        trend extrapolation for other sectors/gases when no direct data exist. LULUCF emissions
                        are not included in the main file of recent versions (e.g., v2.7); instead they are
                        provided separately and flagged as higher-uncertainty due to heterogeneous sources and
                        methods.
                    </p>
                    <p
                        class="mt-4 border-l-4 border-newsprint-accent bg-newsprint-muted/60 px-3 py-2.5 text-sm leading-relaxed text-neutral-600"
                    >
                        The figures and derived JSON files in this repository were built from PRIMAP-hist
                        v2.6.1 (see references below); newer releases extend coverage and may revise historical
                        values as methods and reporting evolve.
                    </p>
                </div>
            </section>

            <section class="mb-9 last:mb-0" aria-labelledby="use-heading">
                <h2 id="use-heading" class="section-heading mb-3">
                    Dataset use on this site
                </h2>
                <p class="mb-4 text-sm leading-relaxed text-neutral-600">
                    The table links each interactive element to local files where applicable (paths
                    relative to project root).
                </p>

                <div class="overflow-x-auto border border-newsprint-fg">
                    <table class="w-full min-w-[38rem] border-collapse text-sm leading-normal">
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    class="label-meta border-b border-newsprint-fg bg-newsprint-muted px-3 py-2.5 text-left"
                                >
                                    Site location
                                </th>
                                <th
                                    scope="col"
                                    class="label-meta border-b border-newsprint-fg bg-newsprint-muted px-3 py-2.5 text-left"
                                >
                                    Role
                                </th>
                                <th
                                    scope="col"
                                    class="label-meta border-b border-newsprint-fg bg-newsprint-muted px-3 py-2.5 text-left"
                                >
                                    Data / citation
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    <strong class="whitespace-nowrap">Home</strong> — Carousel slide&nbsp;1,<br /><span class="text-sm text-neutral-500"
                                        >Global land–ocean temperature anomaly</span
                                    ><br /><code class="font-mono text-xs">TemperatureChart.vue</code>
                                </td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    Annual (<code>J-D</code>) and monthly global-mean anomalies (°C) vs
                                    the 1951–1980 baseline; chart and tooltips computed in-browser.
                                </td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    ASCII table <code>public/data/GLB.Ts+dSST.csv</code> maintained from
                                    NASA GISS LOTI<sup class="ml-0.5 font-semibold">[1]</sup>.
                                </td>
                            </tr>
                            <tr>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    <strong class="whitespace-nowrap">Home</strong> — Carousel slide&nbsp;2,<br /><span class="text-sm text-neutral-500"
                                        >World aggregate greenhouse gases (Kyoto basket)</span
                                    ><br /><code class="font-mono text-xs">GreenhouseGasChart.vue</code>
                                </td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    Time series for aggregate <strong>EARTH</strong>, PRIMAP scenario
                                    <code>HISTCR</code>, national total excluding land use /
                                    land-use change (IPCC&nbsp;2006 reporting category <code>M.0.EL</code>).
                                    Stacked constituents and Kyoto total in CO₂-equivalent using AR5
                                    100-yr GWPs where applicable<sup class="ml-0.5 font-semibold">[4]</sup>; dashed line:
                                    mean of Kyoto total over 1951–1980.
                                </td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    Pre-derived JSON <code>public/data/earth-ghg-annual.json</code> from
                                    PRIMAP-hist v2.6.1<sup class="ml-0.5 font-semibold">[2,&nbsp;3]</sup>.
                                </td>
                            </tr>
                            <tr>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    <strong class="whitespace-nowrap">Home</strong> — Carousel slide&nbsp;3,<br /><span class="text-sm text-neutral-500"
                                        >Country map of greenhouse gases</span
                                    ><br /><code class="font-mono text-xs">WorldEmissionsMap.vue</code>
                                </td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    Choropleth and tooltips join annual country totals (Gg CO₂-eq / yr,
                                    Kyoto basket AR5&nbsp;GWP100) on ISO&nbsp;3166-1 alpha-3 keys; gas-wise
                                    values in tooltip are converted to CO₂-eq using the same GWPs as the
                                    global chart<sup class="ml-0.5 font-semibold">[4]</sup>.
                                    Continental rollups use an ISO-derived region classification embedded in
                                    the JSON build<sup class="ml-0.5 font-semibold">[5]</sup>; two PRIMAP-area codes that
                                    are multi-country aggregates are excluded from “top regions” maths to
                                    avoid double counting.
                                    World outline geometry is purely cartographic — it does not change
                                    reported emissions totals.
                                </td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    <code>public/data/country-ghg-annual.json</code>, produced by
                                    <code>scripts/build-country-ghg-data.py</code> from the official
                                    PRIMAP-hist CSV<sup class="ml-0.5 font-semibold">[2]</sup>; regional metadata merged
                                    from the ISO‑3166 list<sup class="ml-0.5 font-semibold">[5]</sup>; cartographic layers
                                    <code>public/data/world.geojson</code> (<strong>boundary basemap</strong><sup class="ml-0.5 font-semibold">[6]</sup>). The aggregate world total displayed on
                                    the map side panel is anchored to the same EARTH Kyoto total as slide
                                    2 via <code>earth-ghg-annual.json</code><sup class="ml-0.5 font-semibold">[2]</sup>.
                                </td>
                            </tr>
                            <tr>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    <strong class="whitespace-nowrap">Explore</strong><br /><code class="font-mono text-xs"
                                        >ExploreView.vue</code
                                    >
                                </td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">Introductory narrative only; no quantitative series loaded.</td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">—</td>
                            </tr>
                            <tr>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    <strong class="whitespace-nowrap">Repository tooling</strong><br /><code class="font-mono text-xs"
                                        >scripts/build-country-ghg-data.py</code
                                    >,
                                    <code class="font-mono text-xs">scripts/update-gistemp-data.sh</code>
                                </td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    Reproducible refresh of local copies: temperature table from GISS;
                                    country-level PRIMAP extract from Zenodo; regional codes from the
                                    ISO CSV mirror.
                                </td>
                                <td class="border-b border-newsprint-fg px-3 py-2.5 align-top">
                                    Build script sources listed in file headers: PRIMAP CSV via Zenodo
                                    record for v2.6.1<sup class="ml-0.5 font-semibold">[2]</sup>; regional lookup from
                                    GitHub mirror<sup class="ml-0.5 font-semibold">[5]</sup>. Temperature script targets
                                    live GISS products<sup class="ml-0.5 font-semibold">[1]</sup>.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="mb-9 last:mb-0" aria-labelledby="refs-heading">
                <h2 id="refs-heading" class="section-heading mb-3">References</h2>
                <ol class="m-0 list-decimal space-y-4 pl-6 leading-relaxed">
                    <li>
                        <span class="mr-1.5 inline font-semibold">Global temperature (LOTI / GISTEMP).</span>
                        NASA Goddard Institute for Space Studies. <em>GISS Surface Temperature Analysis
                        (GISTEMP)</em> — global-mean land–ocean index
                        (<code>GLB.Ts+dSST</code>). Accessed as tabular ASCII from
                        <a
                            href="https://data.giss.nasa.gov/gistemp/"
                            rel="noopener noreferrer"
                            >https://data.giss.nasa.gov/gistemp/</a
                        >. The scientific basis for the merged land–ocean index is discussed in Hansen,
                        J., Ruedy, R., Sato, M., &amp; Lo, K. (2010). Global surface temperature change.
                        <em>Reviews of Geophysics</em>, 48, RG4004.
                        <a href="https://doi.org/10.1029/2010RG000345" rel="noopener noreferrer"
                            >https://doi.org/10.1029/2010RG000345</a
                        >.
                    </li>
                    <li>
                        <span class="mr-1.5 inline font-semibold">National and world historical emissions (PRIMAP-hist).</span>
                        Gütschow, J., Busch, D., &amp; Pflüger, M. (2025). The PRIMAP-hist national
                        historical emissions time series v2.6.1 (1750–2023). <em>Zenodo</em>.
                        <a href="https://doi.org/10.5281/zenodo.15016289" rel="noopener noreferrer"
                            >https://doi.org/10.5281/zenodo.15016289</a
                        >. This release is the direct source for the CSV ingested by the project build
                        script and for the metadata embedded in the derived JSON files.
                    </li>
                    <li>
                        <span class="mr-1.5 inline font-semibold">PRIMAP-hist methods and earlier releases.</span>
                        Gütschow, J., Jeffery, L., Gieseke, R., Gebel, R., Stevens, D., Krapp, M., &amp;
                        Rocha, M. (2016). The PRIMAP-hist national historical emissions time series.
                        <em>Earth System Science Data</em>, 8, 571–603.
                        <a href="https://doi.org/10.5194/essd-8-571-2016" rel="noopener noreferrer"
                            >https://doi.org/10.5194/essd-8-571-2016</a
                        >.
                    </li>
                    <li>
                        <span class="mr-1.5 inline font-semibold">IPCC AR5 global warming potentials (100-yr, no climate–carbon feedback).</span>
                        Myhre, G., Shindell, D., Bréon, F.-M., Collins, W., Fuglestvedt, J., Huang, J.,
                        … Zhang, H. (2013). Anthropogenic and natural radiative forcing. In T. F. Stocker
                        et&nbsp;al. (Eds.), <em>Climate Change 2013: The Physical Science Basis. Contribution
                        of Working Group I to the Fifth Assessment Report of the Intergovernmental Panel
                        on Climate Change</em> (pp. 659–740). Cambridge University Press. Table&nbsp;8.A.1
                        lists species-specific GWPs on a 100-year horizon; the site applies those values
                        when converting reported CH₄, N₂O, SF₆, and NF₃ mass to CO₂-equivalent in map
                        tooltips (HFC and PFC series in PRIMAP are already supplied on a CO₂-eq basis for
                        the chosen reporting option).
                    </li>
                    <li>
                        <span class="mr-1.5 inline font-semibold">ISO country codes and UN regional groupings (preprocessing).</span>
                        Public CSV listing ISO&nbsp;3166 alpha-2/alpha-3 identifiers with UN macro-region
                        and sub-region labels, used only to attach continent labels for optional
                        rollups in <code>country-ghg-annual.json</code>. Retrieved from
                        <a
                            href="https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes"
                            rel="noopener noreferrer"
                            >https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes</a
                        >
                        (file <code>all/all.csv</code> as referenced in the build script).
                    </li>
                    <li>
                        <span class="mr-1.5 inline font-semibold">World country boundaries (visualization basemap).</span>
                        <code>public/data/world.geojson</code> provides simplified country polygons keyed
                        by ISO&nbsp;3166-1 alpha-3 in each feature’s <code>id</code> field for D3
                        rendering. The file is a cartographic convenience layer; it does not influence
                        emissions accounting. Comparable global country datasets are commonly derived from
                        public-domain products such as Natural Earth
                        (<a href="https://www.naturalearthdata.com/" rel="noopener noreferrer"
                            >https://www.naturalearthdata.com/</a
                        >); this repository does not presently record an independent lineage file for the
                        specific GeoJSON export.
                    </li>
                    <li>
                        <span class="mr-1.5 inline font-semibold">IPCC inventory boundary (national totals excluding LULUCF).</span>
                        Reporting category <code>M.0.EL</code> (“national total excluding LULUCF”) follows the
                        2006 IPCC Guidelines structure referenced in PRIMAP documentation; inventories that
                        exclude land use fluxes are summarized in IPCC methodological guidance volumes
                        accompanying national greenhouse gas reporting. (See PRIMAP column documentation
                        in the Zenodo package<sup class="ml-0.5 font-semibold">[2]</sup> for field definitions used by this
                        site.)
                    </li>
                </ol>
            </section>

            <section class="mb-0" aria-labelledby="software-heading">
                <h2 id="software-heading" class="section-heading mb-3">Software libraries</h2>
                <p class="leading-relaxed">
                    Interactive figures are implemented in Vue&nbsp;3 and rendered with D3 scales, axes, and
                    geographic paths. Library versions are declared in <code>package.json</code>; they are
                    general-purpose visualization tools and are not themselves sources of climate
                    observations.
                </p>
            </section>
        </article>
    </Transition>
</template>

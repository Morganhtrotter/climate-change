<template>
    <Transition name="carousel-fade" appear>
        <article class="sources">
            <header class="sources-header">
                <h1 class="sources-title">Data sources and references</h1>
                <p class="sources-intro">
                    This appendix lists primary observational datasets, derived files stored in this
                    repository, and methodological references underpinning the figures. Citations follow
                    a conventional numbered format so readers can trace each visualization to its
                    evidence base.
                </p>
            </header>

            <section class="sources-section" aria-labelledby="why-heading">
                <h2 id="why-heading" class="sources-h2">Why we chose these datasets</h2>
                <p class="sources-body sources-lead">
                    This site pairs a global temperature record with harmonized national emissions so that
                    readers can relate observed warming to long-run greenhouse-gas trajectories using sources
                    that are transparent, maintained, and widely used in climate science and policy analysis.
                </p>

                <div class="rationale-block">
                    <h3 class="sources-h3">NASA climate data — GISS Surface Temperature Analysis (GISTEMP)</h3>
                    <p class="sources-body">
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

                <div class="rationale-block">
                    <h3 class="sources-h3">PRIMAP-hist national historical emissions</h3>
                    <p class="sources-body">
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
                    <p class="sources-body">
                        The PRIMAP-hist national historical emissions time series is a global climate-emissions
                        dataset providing long-term, country-level greenhouse gas (GHG) emissions time series.
                        It combines multiple official and research datasets to produce consistent, gap-filled
                        trajectories for all major Kyoto gases and almost all countries from the preindustrial
                        period to the present.
                    </p>

                    <h4 class="sources-h4">Key facts</h4>
                    <dl class="key-facts">
                        <dt>Domain</dt>
                        <dd>National GHG emissions time series (climate emissions dataset)</dd>
                        <dt>Temporal coverage</dt>
                        <dd>1750–2024 (latest v2.7 release)</dd>
                        <dt>Spatial coverage</dt>
                        <dd>All UNFCCC Parties + most non-UNFCCC territories</dd>
                        <dt>Gases</dt>
                        <dd>CO₂, CH₄, N₂O, F-gases, Kyoto basket (multiple GWP metrics)</dd>
                        <dt>Sectors</dt>
                        <dd>
                            IPCC 2006 categories (Energy, IPPU, Agriculture, Waste, Other)
                        </dd>
                    </dl>

                    <h4 class="sources-h4">Background and purpose</h4>
                    <p class="sources-body">
                        PRIMAP-hist was developed by researchers associated with the Potsdam Institute for
                        Climate Impact Research to create a comparable, comprehensive, and long-run record of
                        national emissions. It addresses inconsistencies and gaps in official national
                        inventories by merging them with other datasets and harmonizing them to common
                        sector/gas definitions. The original method description is documented in Gütschow et
                        al. (2016, <em>Earth System Science Data</em>).
                    </p>

                    <h4 class="sources-h4">Data content and structure</h4>
                    <p class="sources-body">
                        The dataset provides annual emissions for individual Kyoto gases (CO₂, CH₄, N₂O,
                        various F-gases); aggregated “Kyoto basket” totals under different GWP choices (e.g.,
                        AR4, AR5, AR6); and IPCC 2006 sectors: Energy; Industrial Processes and Product Use
                        (IPPU); Agriculture; Waste; and “Other,” plus national totals excluding land use,
                        land-use change and forestry (LULUCF). Most versions include a “country reported data
                        priority” (HISTCR) scenario that prioritizes data directly reported by countries to the
                        UNFCCC, supplemented by additional national submissions and gap-filling procedures.
                    </p>

                    <h4 class="sources-h4">Methodology and updates</h4>
                    <p class="sources-body">
                        PRIMAP-hist stitches together national inventory data, global/sectoral datasets, and
                        proxy series, then harmonizes and extrapolates where necessary. For recent years it
                        uses official inventories where available; energy CO₂ extrapolation based on energy
                        statistics (e.g., Energy Institute’s Statistical Review of World Energy); and linear
                        trend extrapolation for other sectors/gases when no direct data exist. LULUCF emissions
                        are not included in the main file of recent versions (e.g., v2.7); instead they are
                        provided separately and flagged as higher-uncertainty due to heterogeneous sources and
                        methods.
                    </p>
                    <p class="sources-body sources-note-inline">
                        The figures and derived JSON files in this repository were built from PRIMAP-hist
                        v2.6.1 (see references below); newer releases extend coverage and may revise historical
                        values as methods and reporting evolve.
                    </p>
                </div>
            </section>

            <section class="sources-section" aria-labelledby="use-heading">
                <h2 id="use-heading" class="sources-h2">
                    Dataset use on this site
                </h2>
                <p class="sources-note">
                    The table links each interactive element to local files where applicable (paths
                    relative to project root).
                </p>

                <div class="use-table-wrap">
                    <table class="use-table">
                        <thead>
                            <tr>
                                <th scope="col">Site location</th>
                                <th scope="col">Role</th>
                                <th scope="col">Data / citation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong class="nowrap">Home</strong> — Carousel slide&nbsp;1,<br /><span class="muted"
                                        >Global land–ocean temperature anomaly</span
                                    ><br /><code class="file">TemperatureChart.vue</code>
                                </td>
                                <td>
                                    Annual (<code>J-D</code>) and monthly global-mean anomalies (°C) vs
                                    the 1951–1980 baseline; chart and tooltips computed in-browser.
                                </td>
                                <td>
                                    ASCII table <code>public/data/GLB.Ts+dSST.csv</code> maintained from
                                    NASA GISS LOTI<sup class="cite">[1]</sup>.
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong class="nowrap">Home</strong> — Carousel slide&nbsp;2,<br /><span class="muted"
                                        >World aggregate greenhouse gases (Kyoto basket)</span
                                    ><br /><code class="file">GreenhouseGasChart.vue</code>
                                </td>
                                <td>
                                    Time series for aggregate <strong>EARTH</strong>, PRIMAP scenario
                                    <code>HISTCR</code>, national total excluding land use /
                                    land-use change (IPCC&nbsp;2006 reporting category <code>M.0.EL</code>).
                                    Stacked constituents and Kyoto total in CO₂-equivalent using AR5
                                    100-yr GWPs where applicable<sup class="cite">[4]</sup>; dashed line:
                                    mean of Kyoto total over 1951–1980.
                                </td>
                                <td>
                                    Pre-derived JSON <code>public/data/earth-ghg-annual.json</code> from
                                    PRIMAP-hist v2.6.1<sup class="cite">[2,&nbsp;3]</sup>.
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong class="nowrap">Home</strong> — Carousel slide&nbsp;3,<br /><span class="muted"
                                        >Country map of greenhouse gases</span
                                    ><br /><code class="file">WorldEmissionsMap.vue</code>
                                </td>
                                <td>
                                    Choropleth and tooltips join annual country totals (Gg CO₂-eq / yr,
                                    Kyoto basket AR5&nbsp;GWP100) on ISO&nbsp;3166-1 alpha-3 keys; gas-wise
                                    values in tooltip are converted to CO₂-eq using the same GWPs as the
                                    global chart<sup class="cite">[4]</sup>.
                                    Continental rollups use an ISO-derived region classification embedded in
                                    the JSON build<sup class="cite">[5]</sup>; two PRIMAP-area codes that
                                    are multi-country aggregates are excluded from “top regions” maths to
                                    avoid double counting.
                                    World outline geometry is purely cartographic — it does not change
                                    reported emissions totals.
                                </td>
                                <td>
                                    <code>public/data/country-ghg-annual.json</code>, produced by
                                    <code>scripts/build-country-ghg-data.py</code> from the official
                                    PRIMAP-hist CSV<sup class="cite">[2]</sup>; regional metadata merged
                                    from the ISO‑3166 list<sup class="cite">[5]</sup>; cartographic layers
                                    <code>public/data/world.geojson</code> (<strong>boundary basemap</strong><sup class="cite">[6]</sup>). The aggregate world total displayed on
                                    the map side panel is anchored to the same EARTH Kyoto total as slide
                                    2 via <code>earth-ghg-annual.json</code><sup class="cite">[2]</sup>.
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong class="nowrap">Explore</strong><br /><code class="file"
                                        >ExploreView.vue</code
                                    >
                                </td>
                                <td>Introductory narrative only; no quantitative series loaded.</td>
                                <td>—</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong class="nowrap">Repository tooling</strong><br /><code class="file"
                                        >scripts/build-country-ghg-data.py</code
                                    >,
                                    <code class="file">scripts/update-gistemp-data.sh</code>
                                </td>
                                <td>
                                    Reproducible refresh of local copies: temperature table from GISS;
                                    country-level PRIMAP extract from Zenodo; regional codes from the
                                    ISO CSV mirror.
                                </td>
                                <td>
                                    Build script sources listed in file headers: PRIMAP CSV via Zenodo
                                    record for v2.6.1<sup class="cite">[2]</sup>; regional lookup from
                                    GitHub mirror<sup class="cite">[5]</sup>. Temperature script targets
                                    live GISS products<sup class="cite">[1]</sup>.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="sources-section" aria-labelledby="refs-heading">
                <h2 id="refs-heading" class="sources-h2">References</h2>
                <ol class="ref-list">
                    <li>
                        <span class="ref-label">Global temperature (LOTI / GISTEMP).</span>
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
                        <span class="ref-label">National and world historical emissions (PRIMAP-hist).</span>
                        Gütschow, J., Busch, D., &amp; Pflüger, M. (2025). The PRIMAP-hist national
                        historical emissions time series v2.6.1 (1750–2023). <em>Zenodo</em>.
                        <a href="https://doi.org/10.5281/zenodo.15016289" rel="noopener noreferrer"
                            >https://doi.org/10.5281/zenodo.15016289</a
                        >. This release is the direct source for the CSV ingested by the project build
                        script and for the metadata embedded in the derived JSON files.
                    </li>
                    <li>
                        <span class="ref-label">PRIMAP-hist methods and earlier releases.</span>
                        Gütschow, J., Jeffery, L., Gieseke, R., Gebel, R., Stevens, D., Krapp, M., &amp;
                        Rocha, M. (2016). The PRIMAP-hist national historical emissions time series.
                        <em>Earth System Science Data</em>, 8, 571–603.
                        <a href="https://doi.org/10.5194/essd-8-571-2016" rel="noopener noreferrer"
                            >https://doi.org/10.5194/essd-8-571-2016</a
                        >.
                    </li>
                    <li>
                        <span class="ref-label">IPCC AR5 global warming potentials (100-yr, no climate–carbon feedback).</span>
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
                        <span class="ref-label">ISO country codes and UN regional groupings (preprocessing).</span>
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
                        <span class="ref-label">World country boundaries (visualization basemap).</span>
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
                        <span class="ref-label">IPCC inventory boundary (national totals excluding LULUCF).</span>
                        Reporting category <code>M.0.EL</code> (“national total excluding LULUCF”) follows the
                        2006 IPCC Guidelines structure referenced in PRIMAP documentation; inventories that
                        exclude land use fluxes are summarized in IPCC methodological guidance volumes
                        accompanying national greenhouse gas reporting. (See PRIMAP column documentation
                        in the Zenodo package<sup class="cite">[2]</sup> for field definitions used by this
                        site.)
                    </li>
                </ol>
            </section>

            <section class="sources-section" aria-labelledby="software-heading">
                <h2 id="software-heading" class="sources-h2">Software libraries</h2>
                <p class="sources-body">
                    Interactive figures are implemented in Vue&nbsp;3 and rendered with D3 scales, axes, and
                    geographic paths. Library versions are declared in <code>package.json</code>; they are
                    general-purpose visualization tools and are not themselves sources of climate
                    observations.
                </p>
            </section>
        </article>
    </Transition>
</template>

<style scoped>
.sources {
    min-height: 100vh;
    max-width: 1440px;
    margin: 0 auto;
    padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem);
}

.sources-header {
    margin-bottom: 2rem;
}

.sources-title {
    font-family: 'Cantarell', 'Roboto Condensed', sans-serif;
    font-weight: 700;
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    color: var(--color-heading);
    margin: 0 0 0.75rem;
    line-height: 1.2;
}

.sources-intro {
    margin: 0;
    font-size: 1rem;
    line-height: 1.65;
    color: var(--color-text);
}

.sources-section {
    margin-bottom: 2.25rem;
}

.sources-section:last-child {
    margin-bottom: 0;
}

.sources-h2 {
    font-family: 'Cantarell', 'Roboto Condensed', sans-serif;
    font-weight: 600;
    font-size: clamp(1.1rem, 2.2vw, 1.3rem);
    color: var(--color-heading);
    margin: 0 0 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--color-heading);
}

.sources-note {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    color: var(--color-muted);
    line-height: 1.55;
}

.sources-body {
    margin: 0;
    font-size: 0.98rem;
    line-height: 1.65;
    color: var(--color-text);
}

.sources-lead {
    margin-bottom: 1.5rem;
}

.rationale-block {
    margin-bottom: 1.75rem;
}

.rationale-block:last-child {
    margin-bottom: 0;
}

.sources-h3 {
    font-family: 'Cantarell', 'Roboto Condensed', sans-serif;
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--color-heading);
    margin: 0 0 0.65rem;
    line-height: 1.35;
}

.sources-h4 {
    font-family: inherit;
    font-weight: 600;
    font-size: 0.92rem;
    color: var(--color-heading);
    margin: 1.15rem 0 0.5rem;
    letter-spacing: 0.01em;
}

.sources-h4:first-of-type {
    margin-top: 0.85rem;
}

.key-facts {
    margin: 0 0 0.85rem;
    display: grid;
    grid-template-columns: minmax(7rem, 10rem) 1fr;
    gap: 0.35rem 1rem;
    font-size: 0.95rem;
    line-height: 1.55;
}

.key-facts dt {
    margin: 0;
    font-weight: 600;
    color: var(--color-muted);
}

.key-facts dd {
    margin: 0;
    color: var(--color-text);
}

@media (max-width: 520px) {
    .key-facts {
        grid-template-columns: 1fr;
    }

    .key-facts dt {
        margin-top: 0.35rem;
    }

    .key-facts dt:first-child {
        margin-top: 0;
    }
}

.sources-note-inline {
    margin-top: 1rem;
    padding: 0.65rem 0.85rem;
    border-left: 3px solid var(--color-border-hover);
    background: var(--color-background-soft);
    font-size: 0.92rem;
    color: var(--color-muted);
}

.rationale-block .sources-body + .sources-body {
    margin-top: 0.75rem;
}

.use-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
}

.use-table {
    width: 100%;
    min-width: 38rem;
    border-collapse: collapse;
    font-size: 0.9rem;
    line-height: 1.5;
}

.use-table th,
.use-table td {
    padding: 0.65rem 0.75rem;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--color-border);
}

.use-table thead th {
    font-family: 'Cantarell', 'Roboto Condensed', sans-serif;
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--color-heading);
    background: var(--color-background-soft);
}

.use-table tbody tr:last-child th,
.use-table tbody tr:last-child td {
    border-bottom: none;
}

.muted {
    color: var(--color-muted);
    font-size: 0.88rem;
}

.file {
    font-size: 0.8rem;
    font-family:
        ui-monospace,
        'Cascadia Code',
        monospace;
}

.nowrap {
    white-space: nowrap;
}

.cite {
    font-weight: 600;
    margin-left: 0.125rem;
    color: var(--color-heading);
}

.ref-list {
    margin: 0;
    padding-left: 1.35rem;
}

.ref-list > li {
    margin-bottom: 1.1rem;
    padding-left: 0.35rem;
    line-height: 1.6;
    color: var(--color-text);
}

.ref-list > li:last-child {
    margin-bottom: 0;
}

.ref-label {
    display: inline;
    font-weight: 600;
    margin-right: 0.35rem;
    color: var(--color-heading);
}
</style>

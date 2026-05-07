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

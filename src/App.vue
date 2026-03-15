<script setup>
import TemperatureChart from './components/TemperatureChart.vue'
</script>

<template>
    <div class="portfolio">
        <header class="hero">
            <h1 class="hero-title">Climate Change in Data</h1>
            <p class="hero-subtitle">
                Understanding the real impacts of climate change through data. Global temperature
                anomalies show how far we’ve moved from the 1951–1980 baseline—and why it matters.
            </p>
        </header>

        <main class="main">
            <section class="section">
                <h2 class="section-title">Global land–ocean temperature anomaly</h2>
                <p class="section-description">
                    Annual mean temperature anomaly in °C relative to the 1951–1980 average. Values
                    above zero indicate a warmer world; the trend over the last decades is clear.
                </p>
                <TemperatureChart />
            </section>
        </main>

        <footer class="footer">
            <p>Data: NASA GISS Land-Ocean Temperature Index (GLB.Ts+dSST). Portfolio piece.</p>
        </footer>
    </div>
</template>

<style scoped>
.portfolio {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.hero {
    padding: clamp(2rem, 6vw, 4rem) 0;
    text-align: center;
    border-bottom: 1px solid var(--color-border);
}

.hero-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: clamp(2rem, 5vw, 3rem);
    letter-spacing: -0.02em;
    color: var(--color-heading);
    margin: 0 0 0.75rem;
    line-height: 1.15;
}

.hero-subtitle {
    font-size: clamp(1rem, 2vw, 1.15rem);
    color: var(--color-muted);
    max-width: 42rem;
    margin: 0 auto;
    line-height: 1.6;
}

.main {
    flex: 1;
    padding: clamp(2rem, 5vw, 3.5rem) 0;
}

.section {
    max-width: 900px;
    margin: 0 auto;
}

.section-title {
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: clamp(1.25rem, 2.5vw, 1.5rem);
    color: var(--color-heading);
    margin: 0 0 0.5rem;
}

.section-description {
    font-size: 0.95rem;
    color: var(--color-muted);
    margin: 0 0 1.5rem;
    line-height: 1.55;
}

.footer {
    padding: 1.5rem 0;
    border-top: 1px solid var(--color-border);
    text-align: center;
    font-size: 0.8rem;
    color: var(--color-muted);
}

.footer p {
    margin: 0;
}
</style>

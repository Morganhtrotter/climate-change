# Climate Change in Data

A small Vue 3 app that visualizes global land–ocean temperature anomalies using [NASA GISS](https://data.giss.nasa.gov/gistemp/) data. The chart shows how far global mean temperatures have moved from the 1951–1980 baseline and supports switching between annual and monthly views.

## Features

- **Global temperature anomaly chart** — Line chart of temperature anomaly (°C) over time (1880–present) with a gradient for above/below baseline.
- **Annual vs monthly** — Pill toggle to switch between annual mean (J-D) and monthly mean series from the same dataset.
- **Interactive tooltip** — Hover to see the exact year (or month + year), period label, and anomaly value; a dotted vertical line marks the nearest data point.

## Data

Uses the NASA GISS Land-Ocean Temperature Index ([GLB.Ts+dSST](https://data.giss.nasa.gov/gistemp/)). Anomalies are relative to the 1951–1980 mean. The CSV is loaded from `public/data/GLB.Ts+dSST.csv`.

## Monthly Data Refresh

Run the data update script **once per month** to pull the latest global-mean monthly, seasonal, and annual means from NASA GISS and replace the local CSV in `public/data`.

```sh
./scripts/update-gistemp-data.sh
```

If needed, you can also run it from anywhere with an absolute path:

```sh
/Users/morgantrotter/workspace/personal/climate-change/scripts/update-gistemp-data.sh
```

### Update Checklist

- [ ] Run `./scripts/update-gistemp-data.sh`
- [ ] Verify chart renders in both annual and monthly views
- [ ] Update this line with the latest refresh date: `Last refresh: 2026-03-14`

## Tech

- **Vue 3** (Composition API) + **Vite**
- **D3.js** for scales, axes, and line/area rendering

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Format with Prettier

```sh
npm run format
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

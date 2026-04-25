#!/usr/bin/env python3
import csv
import json
import math
import urllib.request
from collections import defaultdict

SOURCE_URL = (
    "https://zenodo.org/api/records/15016289/files/"
    "Guetschow_et_al_2025-PRIMAP-hist_v2.6.1_final_13-Mar-2025.csv/content"
)
REGION_SOURCE_URL = "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv"
OUT_PATH = "public/data/country-ghg-annual.json"

ENTITIES = {
    "KYOTOGHG (AR5GWP100)": "total",
    "CO2": "co2",
    "CH4": "ch4",
    "N2O": "n2o",
    "HFCs (AR5GWP100)": "hfcs",
    "PFCs (AR5GWP100)": "pfcs",
    "SF6": "sf6",
    "NF3": "nf3",
}

country_year = defaultdict(lambda: defaultdict(dict))
all_years = set()
iso3_to_continent = {}


def normalize_continent(region: str, sub_region: str) -> str:
    if region == "Americas":
        if sub_region in ("South America",):
            return "South America"
        return "North America"
    if region in ("Africa", "Asia", "Europe", "Oceania"):
        return region
    return "Other"


with urllib.request.urlopen(REGION_SOURCE_URL, timeout=60) as response:
    text_stream = (line.decode("utf-8", errors="replace") for line in response)
    reader = csv.DictReader(text_stream)
    for row in reader:
        iso3 = (row.get("alpha-3") or "").strip().upper()
        if len(iso3) != 3:
            continue
        region = (row.get("region") or "").strip()
        sub_region = (row.get("sub-region") or "").strip()
        iso3_to_continent[iso3] = normalize_continent(region, sub_region)

with urllib.request.urlopen(SOURCE_URL, timeout=300) as response:
    text_stream = (line.decode("utf-8", errors="replace") for line in response)
    reader = csv.DictReader(text_stream)
    year_columns = [name for name in (reader.fieldnames or []) if name and name.isdigit()]
    year_columns = [y for y in year_columns if 1880 <= int(y) <= 2023]
    for row in reader:
        if row.get("scenario (PRIMAP-hist)") != "HISTCR":
            continue
        if row.get("category (IPCC2006_PRIMAP)") != "M.0.EL":
            continue

        entity = row.get("entity")
        key = ENTITIES.get(entity)
        if key is None:
            continue

        area = row.get("area (ISO3)", "")
        if len(area) != 3 or not area.isalpha():
            continue

        for year_text in year_columns:
            raw = row.get(year_text)
            if raw in (None, "", "NaN"):
                continue
            try:
                value = float(raw)
            except ValueError:
                continue
            if not math.isfinite(value):
                continue

            year = int(year_text)
            all_years.add(year)
            country_year[area][year][key] = value

years = sorted(all_years)
values_by_year = {str(year): {} for year in years}

for area, by_year in country_year.items():
    for year, metrics in by_year.items():
        if "total" not in metrics:
            continue
        values_by_year[str(year)][area] = {
            "total": metrics["total"],
            "breakdown": {k: metrics[k] for k in ("co2", "ch4", "n2o", "hfcs", "pfcs", "sf6", "nf3") if k in metrics},
        }

payload = {
    "meta": {
        "scenario": "HISTCR",
        "category": "M.0.EL",
        "totalEntity": "KYOTOGHG (AR5GWP100)",
        "units": {
            "total": "CO2 equivalent (Gg CO2-eq / yr)",
            "co2": "CO2 mass (Gg CO2 / yr)",
            "ch4": "CH4 mass (Gg CH4 / yr)",
            "n2o": "N2O mass (Gg N2O / yr)",
            "sf6": "SF6 mass (Gg SF6 / yr)",
            "nf3": "NF3 mass (Gg NF3 / yr)",
            "hfcs": "HFCs AR5 GWP100 (Gg CO2-eq / yr)",
            "pfcs": "PFCs AR5 GWP100 (Gg CO2-eq / yr)",
        },
        "source": "Guetschow, J.; Busch, D.; Pflueger, M. (2025): PRIMAP-hist v2.6.1 (1750-2023). Zenodo. https://doi.org/10.5281/zenodo.15016289",
        "note": "National total excluding LULUCF (IPCC 2006 M.0.EL). Kyoto basket total uses AR5 GWP100.",
        "yearRange": [years[0], years[-1]] if years else [],
        "iso3ToContinent": iso3_to_continent,
    },
    "years": years,
    "valuesByYear": values_by_year,
}

with open(OUT_PATH, "w", encoding="utf-8") as out_file:
    json.dump(payload, out_file, separators=(",", ":"))

print(f"saved {OUT_PATH}")
print(f"years: {years[0]}-{years[-1]} ({len(years)})")
print(f"countries: {len(country_year)}")

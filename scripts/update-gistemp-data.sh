#!/usr/bin/env bash
# Download NASA GISS Global-mean monthly, seasonal, and annual means (CSV)
# from https://data.giss.nasa.gov/gistemp/data_v4.html
# and replace the local file at public/data/GLB.Ts+dSST.csv

set -e

SOURCE_URL='https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv'
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_FILE="${PROJECT_ROOT}/public/data/GLB.Ts+dSST.csv"

if [[ ! -d "$(dirname "$OUTPUT_FILE")" ]]; then
    echo "Error: directory public/data not found (expected $(dirname "$OUTPUT_FILE"))." >&2
    exit 1
fi

echo "Downloading Global-mean temperature data from NASA GISS..."
OUTPUT_DIR="$(dirname "$OUTPUT_FILE")"
TMP_FILE="$(mktemp "${OUTPUT_DIR}/GLB.Ts+dSST.csv.tmp.XXXXXX")"

# Ensure temp file is removed on failure or interruption.
cleanup() {
    rm -f "$TMP_FILE"
}
trap cleanup EXIT

if curl -f -L -o "$TMP_FILE" "$SOURCE_URL"; then
    mv "$TMP_FILE" "$OUTPUT_FILE"
    trap - EXIT
    echo "Saved to $OUTPUT_FILE"
else
    echo "Error: download failed." >&2
    exit 1
fi

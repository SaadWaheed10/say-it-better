#!/usr/bin/env bash
# Download Qwen2.5-1.5B-Instruct Q4_K_M GGUF for on-device English correction.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL_NAME="Qwen2.5-1.5B-Instruct-Q4_K_M.gguf"
DEST="${1:-$ROOT/models/$MODEL_NAME}"
mkdir -p "$(dirname "$DEST")"

MIN_BYTES=$((900 * 1024 * 1024))
if [[ -f "$DEST" ]]; then
  SIZE=$(stat -f%z "$DEST" 2>/dev/null || stat -c%s "$DEST")
  if [[ "$SIZE" -gt "$MIN_BYTES" ]]; then
    echo "Already present: $DEST ($(ls -lh "$DEST" | awk '{print $5}'))"
    exit 0
  fi
fi

URLS=(
  "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf"
  "https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf"
)

echo "Downloading $MODEL_NAME (~1GB)…"
for url in "${URLS[@]}"; do
  echo "Trying: $url"
  if curl -L --fail --retry 3 -A "Mozilla/5.0" -o "$DEST.tmp" "$url"; then
    mv "$DEST.tmp" "$DEST"
    ls -lh "$DEST"
    echo "Saved to $DEST"
    exit 0
  fi
  rm -f "$DEST.tmp"
done

echo "Failed to download $MODEL_NAME."
echo "Place it manually at: $DEST"
exit 1

#!/usr/bin/env bash
# Download ggml-tiny.en.bin for on-device speech recognition (whisper.rn).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL_NAME="ggml-tiny.en.bin"
DEST="${1:-$ROOT/models/$MODEL_NAME}"
mkdir -p "$(dirname "$DEST")"

if [[ -f "$DEST" ]] && [[ $(stat -f%z "$DEST" 2>/dev/null || stat -c%s "$DEST") -gt 10000000 ]]; then
  echo "Already present: $DEST ($(ls -lh "$DEST" | awk '{print $5}'))"
  exit 0
fi

URLS=(
  "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin"
  "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin?download=true"
  "https://ggml.ggerganov.com/ggml-model-whisper-tiny.en.bin"
)

echo "Downloading $MODEL_NAME…"
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
echo "Source: https://huggingface.co/ggerganov/whisper.cpp"
exit 1

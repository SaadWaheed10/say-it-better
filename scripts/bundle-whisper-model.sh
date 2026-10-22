#!/usr/bin/env bash
# Copy Whisper GGML into Android assets and iOS Resources.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL_NAME="ggml-tiny.en.bin"
MODEL_SRC="${WHISPER_MODEL_SRC:-$ROOT/models/$MODEL_NAME}"

if [[ ! -f "$MODEL_SRC" ]]; then
  if [[ -f "$HOME/Downloads/$MODEL_NAME" ]]; then
    MODEL_SRC="$HOME/Downloads/$MODEL_NAME"
  else
    echo "Whisper model not found. Downloading…"
    bash "$ROOT/scripts/download-whisper-model.sh" "$ROOT/models/$MODEL_NAME"
    MODEL_SRC="$ROOT/models/$MODEL_NAME"
  fi
fi

if [[ ! -f "$MODEL_SRC" ]]; then
  echo "Model not found at: $MODEL_SRC"
  exit 1
fi

ANDROID_ASSETS="$ROOT/android/app/src/main/assets/models"
IOS_RESOURCES="$ROOT/ios/SayItBetter/Resources"

mkdir -p "$ANDROID_ASSETS" "$IOS_RESOURCES"

echo "Bundling Whisper model from: $MODEL_SRC"
cp -f "$MODEL_SRC" "$ANDROID_ASSETS/$MODEL_NAME"
cp -f "$MODEL_SRC" "$IOS_RESOURCES/$MODEL_NAME"

echo "$MODEL_NAME" > "$ANDROID_ASSETS/.whisper-bundled"
echo "$MODEL_NAME" > "$IOS_RESOURCES/.whisper-bundled"

ls -lh "$ANDROID_ASSETS/$MODEL_NAME" "$IOS_RESOURCES/$MODEL_NAME"
echo ""
echo "Whisper model bundled. Rebuild the app (npm run android / ios)."

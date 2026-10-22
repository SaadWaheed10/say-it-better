#!/usr/bin/env bash
# Bundle on-device models into Android assets + iOS Resources (gitignored; too large for Git).
# - Qwen2.5-1.5B Instruct GGUF (~1GB) for English correction
# - Whisper ggml-tiny.en.bin (~74MB) for voice dictation
#
# After this runs once, normal `npm run ios` / `android` pick them up automatically.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_ASSETS="$ROOT/android/app/src/main/assets/models"
IOS_RESOURCES="$ROOT/ios/SayItBetter/Resources"
mkdir -p "$ANDROID_ASSETS" "$IOS_RESOURCES"

# --- LLM (Qwen2.5) ---
MODEL_NAME="Qwen2.5-1.5B-Instruct-Q4_K_M.gguf"
MODEL_SRC="${MODEL_SRC:-$ROOT/models/$MODEL_NAME}"

if [[ ! -f "$MODEL_SRC" ]]; then
  if [[ -f "$HOME/Downloads/$MODEL_NAME" ]]; then
    MODEL_SRC="$HOME/Downloads/$MODEL_NAME"
  else
    echo "LLM model not found. Downloading…"
    bash "$ROOT/scripts/download-llm-model.sh" "$ROOT/models/$MODEL_NAME"
    MODEL_SRC="$ROOT/models/$MODEL_NAME"
  fi
fi

if [[ ! -f "$MODEL_SRC" ]]; then
  echo "LLM model not found at: $MODEL_SRC"
  exit 1
fi

# Remove previous SmolLM2 bundle if present (avoid shipping two LLMs).
rm -f \
  "$ANDROID_ASSETS/SmolLM2-360M-Instruct.Q4_K_M.gguf" \
  "$IOS_RESOURCES/SmolLM2-360M-Instruct.Q4_K_M.gguf"

echo "Bundling LLM from: $MODEL_SRC"
cp -f "$MODEL_SRC" "$ANDROID_ASSETS/$MODEL_NAME"
cp -f "$MODEL_SRC" "$IOS_RESOURCES/$MODEL_NAME"
echo "$MODEL_NAME" > "$ANDROID_ASSETS/.bundled"
echo "$MODEL_NAME" > "$IOS_RESOURCES/.bundled"
ls -lh "$ANDROID_ASSETS/$MODEL_NAME" "$IOS_RESOURCES/$MODEL_NAME"

# --- Whisper ---
echo ""
bash "$ROOT/scripts/bundle-whisper-model.sh"

echo ""
echo "Both models are in Android assets and iOS Resources."
echo "Rebuild once (npm run android / ios). Day-to-day runs need no extra commands."
echo "Note: APK/IPA will be large (~1GB+) because Qwen 1.5B is bundled."

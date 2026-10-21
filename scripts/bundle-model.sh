#!/usr/bin/env bash
# Copy the GGUF into Android assets (and iOS Resources) so release builds
# ship with the model. The file is gitignored because it is ~270MB.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL_NAME="SmolLM2-360M-Instruct.Q4_K_M.gguf"
MODEL_SRC="${MODEL_SRC:-$HOME/Downloads/$MODEL_NAME}"

# Prefer project models/ symlink if it resolves
if [[ -f "$ROOT/models/$MODEL_NAME" ]]; then
  MODEL_SRC="$ROOT/models/$MODEL_NAME"
fi

if [[ ! -f "$MODEL_SRC" ]]; then
  echo "Model not found at: $MODEL_SRC"
  echo "Set MODEL_SRC=/path/to/$MODEL_NAME or place it in ~/Downloads/"
  exit 1
fi

ANDROID_ASSETS="$ROOT/android/app/src/main/assets/models"
IOS_RESOURCES="$ROOT/ios/SayItBetter/Resources"

mkdir -p "$ANDROID_ASSETS" "$IOS_RESOURCES"

echo "Bundling model from: $MODEL_SRC"
cp -f "$MODEL_SRC" "$ANDROID_ASSETS/$MODEL_NAME"
cp -f "$MODEL_SRC" "$IOS_RESOURCES/$MODEL_NAME"

# Keep a tiny marker so CI/scripts can detect presence without scanning size
echo "$MODEL_NAME" > "$ANDROID_ASSETS/.bundled"
echo "$MODEL_NAME" > "$IOS_RESOURCES/.bundled"

ls -lh "$ANDROID_ASSETS/$MODEL_NAME" "$IOS_RESOURCES/$MODEL_NAME"
echo ""
echo "Model bundled into Android assets and iOS Resources."
echo "Rebuild the app (npm run android / ios). Testers do NOT need copy-model:*."

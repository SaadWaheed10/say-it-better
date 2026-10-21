#!/usr/bin/env bash
set -euo pipefail

MODEL_SRC="${MODEL_SRC:-$HOME/Downloads/SmolLM2-360M-Instruct.Q4_K_M.gguf}"
BUNDLE_ID="${BUNDLE_ID:-com.sayitbetter}"

if [[ ! -f "$MODEL_SRC" ]]; then
  echo "Model not found: $MODEL_SRC"
  exit 1
fi

DATA_PATH="$(xcrun simctl get_app_container booted "$BUNDLE_ID" data 2>/dev/null || true)"
if [[ -z "$DATA_PATH" ]]; then
  echo "Could not find booted simulator app container for $BUNDLE_ID."
  echo "Install and launch the app on the simulator first."
  exit 1
fi

mkdir -p "$DATA_PATH/Documents"
cp "$MODEL_SRC" "$DATA_PATH/Documents/SmolLM2-360M-Instruct.Q4_K_M.gguf"
echo "Copied model to $DATA_PATH/Documents/"

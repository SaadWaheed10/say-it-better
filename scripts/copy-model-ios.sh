#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL_NAME="Qwen2.5-1.5B-Instruct-Q4_K_M.gguf"
MODEL_SRC="${MODEL_SRC:-$ROOT/models/$MODEL_NAME}"
BUNDLE_ID="${BUNDLE_ID:-com.sayitbetter}"

if [[ ! -f "$MODEL_SRC" ]] && [[ -f "$HOME/Downloads/$MODEL_NAME" ]]; then
  MODEL_SRC="$HOME/Downloads/$MODEL_NAME"
fi

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
cp "$MODEL_SRC" "$DATA_PATH/Documents/$MODEL_NAME"
echo "Copied model to $DATA_PATH/Documents/"

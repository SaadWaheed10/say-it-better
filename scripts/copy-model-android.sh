#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL_NAME="Qwen2.5-1.5B-Instruct-Q4_K_M.gguf"
MODEL_SRC="${MODEL_SRC:-$ROOT/models/$MODEL_NAME}"
PACKAGE="${PACKAGE:-com.sayitbetter}"
REMOTE_NAME="$MODEL_NAME"

if [[ ! -f "$MODEL_SRC" ]] && [[ -f "$HOME/Downloads/$MODEL_NAME" ]]; then
  MODEL_SRC="$HOME/Downloads/$MODEL_NAME"
fi

if [[ ! -f "$MODEL_SRC" ]]; then
  echo "Model not found: $MODEL_SRC"
  exit 1
fi

adb push "$MODEL_SRC" "/data/local/tmp/$REMOTE_NAME"
adb shell "run-as $PACKAGE mkdir -p files"
adb shell "run-as $PACKAGE cp /data/local/tmp/$REMOTE_NAME files/$REMOTE_NAME"
echo "Copied model into $PACKAGE files/"

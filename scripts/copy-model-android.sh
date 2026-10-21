#!/usr/bin/env bash
set -euo pipefail

MODEL_SRC="${MODEL_SRC:-$HOME/Downloads/SmolLM2-360M-Instruct.Q4_K_M.gguf}"
PACKAGE="${PACKAGE:-com.sayitbetter}"
REMOTE_NAME="SmolLM2-360M-Instruct.Q4_K_M.gguf"

if [[ ! -f "$MODEL_SRC" ]]; then
  echo "Model not found: $MODEL_SRC"
  exit 1
fi

adb push "$MODEL_SRC" "/data/local/tmp/$REMOTE_NAME"
adb shell "run-as $PACKAGE mkdir -p files"
adb shell "run-as $PACKAGE cp /data/local/tmp/$REMOTE_NAME files/$REMOTE_NAME"
echo "Copied model into $PACKAGE files/"

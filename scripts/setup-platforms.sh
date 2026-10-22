#!/usr/bin/env bash
# Prepare SayItBetter native projects for iOS and Android.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

echo "==> Node / npm"
node -v
npm -v

if [[ ! -d node_modules ]]; then
  echo "==> npm install"
  npm install
fi

# Ensure llama.rn native artifacts exist
if [[ ! -d node_modules/llama.rn/ios/rnllama.xcframework ]] || [[ ! -d node_modules/llama.rn/android/src/main/jniLibs/arm64-v8a ]]; then
  echo "==> Downloading llama.rn native artifacts"
  (cd node_modules/llama.rn && node ./install/download-native-artifacts.js --force)
fi

# Ensure on-device models are present (Qwen LLM + Whisper)
if [[ ! -f android/app/src/main/assets/models/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf ]] || \
   [[ ! -f android/app/src/main/assets/models/ggml-tiny.en.bin ]]; then
  echo "==> Bundling on-device models (Qwen2.5-1.5B + Whisper)"
  npm run bundle-model || echo "WARNING: Run once: npm run bundle-model"
fi

echo "==> iOS: pod install"
if ! command -v cmake >/dev/null 2>&1; then
  echo "WARNING: cmake not found on PATH. Hermes podspec needs cmake (brew install cmake)."
fi
(
  cd ios
  pod install
)

echo "==> Android: check SDK"
if [[ -z "${ANDROID_HOME:-}${ANDROID_SDK_ROOT:-}" ]]; then
  if [[ -d "$HOME/Library/Android/sdk" ]]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    export ANDROID_SDK_ROOT="$ANDROID_HOME"
    echo "Using ANDROID_HOME=$ANDROID_HOME"
  else
    echo "WARNING: ANDROID_HOME is not set."
  fi
fi

echo ""
echo "Setup finished."
echo "Run iOS:     npm run ios"
echo "Run Android: npm run android"
echo "Copy model:  npm run copy-model:ios   OR   npm run copy-model:android"
echo "See docs/MODEL_SETUP.md and docs/PLATFORM_SETUP.md"

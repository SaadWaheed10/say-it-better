# Local model setup (SmolLM2 GGUF)

SayItBetter runs inference on-device with [`llama.rn`](https://github.com/mybigday/llama.rn). It does **not** call a cloud AI API.

`llama.rn` already provides a New Architecture / Turbo Native Module (`RNLlamaSpec`). We do **not** need a custom Turbo Module for model loading — see the official [Turbo Native Modules guide](https://reactnative.dev/docs/turbo-native-modules-introduction) only if you add new native APIs later.

## Recommended: bundle into the app (for APK / IPA testing)

This is the path you want when sharing a build with testers.

```bash
cd ~/Desktop/SayItBetter
npm run bundle-model    # once on your machine (copies ~258MB into native assets)
npm run android         # or build a release APK
```

What this does:

1. Copies `SmolLM2-360M-Instruct.Q4_K_M.gguf` into:
   - `android/app/src/main/assets/models/`
   - `ios/SayItBetter/Resources/`
2. On first launch, the app extracts the file into app Documents storage automatically.
3. Testers who install your APK/IPA **do not** run any copy commands.

### Release APK

```bash
npm run android:release
# output: android/app/build/outputs/apk/release/app-release.apk
```

Note: the APK will be large (~260MB+) because the model is inside it.

### Git

The `.gguf` files are **gitignored** (too large for GitHub). After cloning:

```bash
npm run bundle-model
```

before building.

## Optional fallback: adb / simulator copy

Still available if you are not bundling:

```bash
npm run copy-model:android
npm run copy-model:ios
```

## Model file

- Name: `SmolLM2-360M-Instruct.Q4_K_M.gguf`
- Default source: `~/Downloads/...` or `models/` symlink in the project

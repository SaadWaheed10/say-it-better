# SayItBetter

React Native CLI (0.88) + TypeScript app that corrects English on-device with `llama.rn` (**Qwen2.5-1.5B**) and optional voice input via `whisper.rn`.

## Features

- Splash → onboarding (2 screens) → Home
- Improve Message with tone selection
- Results with clipboard copy
- History + Settings (local AsyncStorage)
- Offline English correction via `llama.rn` + Qwen2.5-1.5B (no cloud AI API)
- Offline voice dictation via `whisper.rn` (`ggml-tiny.en.bin`)
- Responsive layout via [`react-native-pixelflow`](https://www.npmjs.com/package/react-native-pixelflow) (`usePixelSheet` / per-screen `*.styles.ts`)

## Design

Visual reference images live in `docs/`:

- `docs/design-reference.jpg`
- `docs/onboarding-reference.jpg`

Palette: navy `#202653`, accent `#5054D8`, lavender/white surfaces.

## Setup (iOS + Android)

```bash
cd ~/Desktop/SayItBetter
npm run setup:platforms   # npm deps + llama.rn artifacts + pod install
npm start                 # Metro
# other terminal:
npm run ios
# or
npm run android
```

Full platform guide: [docs/PLATFORM_SETUP.md](docs/PLATFORM_SETUP.md)  
Model file: [docs/MODEL_SETUP.md](docs/MODEL_SETUP.md)

### Ship an APK with the model inside (for testers)

```bash
npm run bundle-model      # once: pack GGUF into Android assets / iOS Resources
npm run android           # debug install
# or
npm run android:release   # shareable APK (large ~260MB+)
```

Testers who install that APK do **not** need `copy-model:*`. First launch extracts the bundled model automatically.

Native AI uses `llama.rn`'s existing Turbo Module — no custom Turbo Module required ([RN docs](https://reactnative.dev/docs/turbo-native-modules-introduction)).

## Local model

See [docs/MODEL_SETUP.md](docs/MODEL_SETUP.md).

```bash
npm run copy-model:ios
# or
npm run copy-model:android
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Metro bundler |
| `npm run ios` / `android` | Run native app |
| `npm run typecheck` | TypeScript check |
| `npm run copy-model:ios` | Push GGUF into iOS Simulator Documents |
| `npm run copy-model:android` | Push GGUF into Android app files |

## Project layout

```
src/
  components/
  screens/
  navigation/
  services/   # aiService, historyService, settingsService
  theme/
  types/
```

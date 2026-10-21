# SayItBetter

React Native CLI (0.88) + TypeScript app that rewrites messages on-device with `llama.rn` and a local SmolLM2 GGUF model.

## Features

- Splash → onboarding (2 screens) → Home
- Improve Message with tone selection
- Results with clipboard copy
- History + Settings (local AsyncStorage)
- Offline AI via `llama.rn` (no cloud AI API)

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

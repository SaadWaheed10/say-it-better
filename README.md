# SayItBetter

React Native CLI (0.88) + TypeScript app that corrects English **on-device** with `llama.rn` (**Qwen2.5-1.5B**) and optional voice input / skill-test speech via `whisper.rn` + device TTS.

No cloud AI API is used for rewrites or speech recognition.

## Features

- Splash → onboarding → Home, Situations, Tests, History, Settings
- Improve Message with tone selection + offline voice dictation
- Skill tests (MCQ, fill-blank, listening, written) with hear/speak controls
- Results, History, Library, Practice
- Offline English correction via `llama.rn` + Qwen2.5-1.5B
- Offline speech-to-text via `whisper.rn` (`ggml-tiny.en.bin`)
- Responsive layout via [`react-native-pixelflow`](https://www.npmjs.com/package/react-native-pixelflow)

## After cloning (important)

Model weights are **not in Git** (too large / gitignored). After a fresh clone you must download and bundle them once before Improve / voice / tests that need AI work.

### 1. Install & native setup

```bash
git clone <your-repo-url> SayItBetter
cd SayItBetter
npm run setup:platforms   # npm install + llama.rn native artifacts + iOS pods
```

### 2. Download & bundle on-device models

```bash
npm run bundle-model
```

This will:

1. Download (if missing) into `models/`:
   - `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf` (~1GB) — English correction
   - `ggml-tiny.en.bin` (~75MB) — voice / speak-answer
2. Copy both into:
   - `android/app/src/main/assets/models/`
   - `ios/SayItBetter/Resources/`
3. On first app launch, extract them into app Documents storage

**Disk / network:** first run needs a solid connection and free space (well over 1GB).

### 3. Run the app

```bash
npm start                 # Metro
# other terminal:
npm run ios
# or
npm run android
```

If models are missing, Metro/Android may warn:

`Bundled model(s) missing. Run once: npm run bundle-model`

In the app, **Settings → Local AI Model** shows status (`ready` / `missing` / `error`).

### Optional: download models separately

```bash
npm run download-llm-model       # Qwen GGUF only → models/
npm run download-whisper-model   # Whisper tiny.en only → models/
npm run bundle-model             # then copy into native assets
```

### Dev fallback (push into running app storage)

Usually not needed if you used `bundle-model` and rebuilt:

```bash
npm run copy-model:ios
# or
npm run copy-model:android
```

Full model details: **[docs/MODEL_SETUP.md](docs/MODEL_SETUP.md)**  
Platform setup: **[docs/PLATFORM_SETUP.md](docs/PLATFORM_SETUP.md)**

## Ship a build with models inside

```bash
npm run bundle-model
npm run android           # debug
# or
npm run android:release   # large APK (models embedded)
```

Testers who install that build do **not** need `copy-model:*` or a separate model download.

## Design

Visual references live in `docs/`. The app uses a dark-first “noir jewel” palette (teal / amber / rose accents).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run setup:platforms` | Deps + native artifacts + pods (also tries to bundle models) |
| `npm run bundle-model` | **Required after clone** — download + pack LLM + Whisper into native assets |
| `npm run download-llm-model` | Download Qwen GGUF only |
| `npm run download-whisper-model` | Download Whisper tiny.en only |
| `npm start` | Metro bundler |
| `npm run ios` / `android` | Run native app |
| `npm run typecheck` | TypeScript check |
| `npm run copy-model:ios` | Dev: push GGUF into iOS Simulator Documents |
| `npm run copy-model:android` | Dev: push GGUF into Android app files |
| `npm run android:release` | Bundle models + assemble release APK |

## Project layout

```
src/
  components/
  screens/
  navigation/
  services/   # aiService, voiceService, ttsService, testService, …
  theme/
  types/
models/                 # downloaded weights (gitignored)
docs/MODEL_SETUP.md     # detailed model guide
docs/PLATFORM_SETUP.md  # iOS / Android environment
```

Native AI uses `llama.rn`'s Turbo Module — no custom Turbo Module required ([RN docs](https://reactnative.dev/docs/turbo-native-modules-introduction)).

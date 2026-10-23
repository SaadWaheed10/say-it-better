# Local model setup (Qwen2.5 + Whisper)

SayItBetter runs **fully on-device**:

- **English correction:** [`llama.rn`](https://github.com/mybigday/llama.rn) + **Qwen2.5-1.5B-Instruct** (GGUF)
- **Voice dictation / speak answers:** [`whisper.rn`](https://github.com/mybigday/whisper.rn) + **ggml-tiny.en.bin**
- **Hear question / listening playback:** device TTS (`react-native-tts`) — no model file required

No cloud AI API is used for rewrite or speech recognition.

## Fresh clone checklist

`.gguf` and Whisper `.bin` files are **gitignored**. After cloning:

```bash
cd SayItBetter
npm run setup:platforms   # deps + native bits + pods
npm run bundle-model      # download + pack both models (once)
npm start
npm run ios               # or: npm run android
```

Without `bundle-model`, Improve Message / voice features will show model **missing** in Settings, and skill-test written grading / speak-answer will degrade.

## Recommended: bundle into the app

```bash
npm run bundle-model    # downloads if needed, then copies into native assets
npm run android         # or ios — rebuild so assets are picked up
```

What this does:

1. Ensures files exist under `models/` (downloads from Hugging Face if absent).
2. Copies into:
   - `android/app/src/main/assets/models/`
   - `ios/SayItBetter/Resources/`
3. On first launch, the app extracts them into app Documents storage.
4. Testers who install your build do **not** run copy commands.

### Release APK

```bash
npm run android:release
```

Expect a **large** APK (well over 1GB) because both models ship inside the app.

## Optional scripts

| Script | Purpose |
| --- | --- |
| `npm run download-llm-model` | Download Qwen GGUF only → `models/` |
| `npm run download-whisper-model` | Download Whisper tiny.en only → `models/` |
| `npm run bundle-whisper-model` | Bundle Whisper only into native assets |
| `npm run copy-model:ios` / `android` | Dev fallback: push into Documents on a running install |

## Model files

| Role | File | Approx size | Source |
| --- | --- | --- | --- |
| LLM | `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf` | ~1GB | [Qwen GGUF](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF) |
| Speech | `ggml-tiny.en.bin` | ~75MB | [whisper.cpp](https://huggingface.co/ggerganov/whisper.cpp) |

## Permissions

- **Microphone** is requested when the user taps speak / dictate (Improve Message or skill tests).
- **iOS:** `NSMicrophoneUsageDescription` in `Info.plist`
- **Android:** `RECORD_AUDIO` in the manifest + runtime prompt

## Verify it worked

1. Open **Settings → Local AI Model** — status should become `ready` after first load.
2. Improve a short sentence — you should get a corrected phrase.
3. Tap **Dictate** / **Speak answer** — mic prompt, then on-device transcription.
4. In Tests, **Hear question** uses system TTS (no Whisper/LLM required).

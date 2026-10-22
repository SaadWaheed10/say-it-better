# Local model setup (Qwen2.5 + Whisper)

SayItBetter runs **fully on-device**:

- **English correction:** [`llama.rn`](https://github.com/mybigday/llama.rn) + **Qwen2.5-1.5B-Instruct** (GGUF)
- **Voice dictation:** [`whisper.rn`](https://github.com/mybigday/whisper.rn) + **ggml-tiny.en.bin**

No cloud AI API is used for rewrite or speech.

## Recommended: bundle into the app (APK / IPA)

```bash
cd ~/Desktop/SayItBetter
npm run bundle-model    # downloads if needed, then copies into native assets
npm run android         # or ios
```

What this does:

1. Bundles `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf` (~1GB) and `ggml-tiny.en.bin` (~74MB) into:
   - `android/app/src/main/assets/models/`
   - `ios/SayItBetter/Resources/`
2. On first launch, the app extracts them into app Documents storage.
3. Testers who install your build do **not** run copy commands.

### Release APK

```bash
npm run android:release
```

Expect a **large** APK (well over 1GB) because both models ship inside the app.

### Git

`.gguf` / Whisper `.bin` files are **gitignored**. After cloning:

```bash
npm run bundle-model
```

## Optional scripts

| Script | Purpose |
| --- | --- |
| `npm run download-llm-model` | Download Qwen GGUF only |
| `npm run download-whisper-model` | Download Whisper tiny.en only |
| `npm run bundle-whisper-model` | Bundle Whisper only |
| `npm run copy-model:ios` / `android` | Dev fallback push into Documents |

## Model files

- LLM: `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf` (from [Qwen GGUF](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF))
- Speech: `ggml-tiny.en.bin` (from [whisper.cpp models](https://huggingface.co/ggerganov/whisper.cpp))

Mic permission is requested only when the user taps the microphone on Correct phrase.

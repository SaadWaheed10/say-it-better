# Local model setup (SmolLM2 GGUF)

SayItBetter runs inference on-device with `llama.rn`. It does **not** call a cloud AI API.

## Model file

- File: `SmolLM2-360M-Instruct.Q4_K_M.gguf`
- Project symlink (for reference only): `models/SmolLM2-360M-Instruct.Q4_K_M.gguf`
- Source on this machine: `~/Downloads/SmolLM2-360M-Instruct.Q4_K_M.gguf`

The app looks for the file in the **app Documents directory**, not at a hardcoded macOS path.

## iOS Simulator

After installing the app once, copy the model into the simulator Documents folder:

```bash
# Find the app container (adjust if needed)
xcrun simctl get_app_container booted com.sayitbetter data

# Then copy (replace DATA_PATH with the printed path)
cp ~/Downloads/SmolLM2-360M-Instruct.Q4_K_M.gguf \
  "$DATA_PATH/Documents/SmolLM2-360M-Instruct.Q4_K_M.gguf"
```

Or use the helper:

```bash
npm run copy-model:ios
```

## Android emulator / device

```bash
adb shell mkdir -p /data/local/tmp
adb push ~/Downloads/SmolLM2-360M-Instruct.Q4_K_M.gguf /data/local/tmp/
adb shell run-as com.sayitbetter mkdir -p files
adb shell run-as com.sayitbetter cp /data/local/tmp/SmolLM2-360M-Instruct.Q4_K_M.gguf files/
```

Or:

```bash
npm run copy-model:android
```

## Custom path

You can store an override path with AsyncStorage key `sayitbetter_model_path` (file URI or absolute path). Prefer Documents placement for portable builds.

## Notes

- Do not commit the GGUF (~270MB) to git.
- First load can take several seconds on device.
- If the model is missing, the app still opens; Settings shows the real status.

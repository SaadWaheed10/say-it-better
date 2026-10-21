# Run SayItBetter on iOS and Android

Both platforms share the same TypeScript app. Native modules used:

- `llama.rn` (on-device GGUF)
- `@react-native-async-storage/async-storage`
- `react-native-fs`
- `react-native-screens` / `safe-area-context` / `gesture-handler` / `svg`
- React Navigation

App id on both platforms: **`com.sayitbetter`**

## One-time setup (run in Terminal.app / iTerm — not required inside Cursor)

```bash
cd ~/Desktop/SayItBetter
chmod +x scripts/*.sh
./scripts/setup-platforms.sh
```

### Prerequisites

| Tool | Notes |
| --- | --- |
| Node.js ≥ 22.11 | RN 0.88 requirement |
| Xcode 16+ | iOS Simulator / device |
| CocoaPods | `pod --version` |
| CMake | Needed by Hermes podspec (`brew install cmake`) |
| Android Studio / SDK | `ANDROID_HOME` set |
| JDK 17+ | Android Gradle |

If `pod install` fails with CocoaPods CDN `403`, retry on a normal network, or temporarily:

```bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
cd ios && pod install --verbose
```

## Run

Terminal 1:

```bash
cd ~/Desktop/SayItBetter
npm start
```

Terminal 2 — iOS:

```bash
npm run ios
```

Terminal 2 — Android:

```bash
npm run android
```

## Local model (required for AI, both platforms)

After the app has been installed once:

```bash
npm run copy-model:ios
# or
npm run copy-model:android
```

Details: [MODEL_SETUP.md](./MODEL_SETUP.md)

Without the model file, the UI still runs; Settings shows model status as missing/error.

## Platform notes

### iOS

- Bundle ID: `com.sayitbetter`
- New Architecture enabled
- Metal GPU layers used when available (`n_gpu_layers: 99`)
- Open workspace: `ios/SayItBetter.xcworkspace` (after pods)

### Android

- Application id: `com.sayitbetter`
- `largeHeap=true` for the 360M model
- CPU inference by default (`n_gpu_layers: 0`)
- minSdk 24

## Verify both

1. App launches past Splash on iOS Simulator and Android emulator
2. Onboarding → Home works
3. Settings shows model status
4. After copying the GGUF, Improve Message returns a real rewrite offline

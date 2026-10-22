import {Platform} from 'react-native';
import RNFS from 'react-native-fs';

/**
 * Whisper GGML model (speech recognition) — separate from SmolLM2.
 * Android: android/app/src/main/assets/models/<file>
 * iOS: ios/SayItBetter/Resources/<file> (Copy Bundle Resources)
 */
export const WHISPER_MODEL_FILENAME = 'ggml-tiny.en.bin';

/** Relative Android asset path (inside src/main/assets). */
export const ANDROID_ASSET_WHISPER_PATH = `models/${WHISPER_MODEL_FILENAME}`;

/** Minimum expected size (~75MB for tiny.en). */
const MIN_WHISPER_BYTES = 10 * 1024 * 1024;

export function getRuntimeWhisperModelPath(): string {
  return `${RNFS.DocumentDirectoryPath.replace(/\/$/, '')}/${WHISPER_MODEL_FILENAME}`;
}

export function toFileUri(path: string): string {
  if (path.startsWith('file://')) {
    return path;
  }
  return `file://${path}`;
}

export async function whisperModelFileExists(path: string): Promise<boolean> {
  try {
    if (!(await RNFS.exists(path))) {
      return false;
    }
    const stat = await RNFS.stat(path);
    return Number(stat.size) >= MIN_WHISPER_BYTES;
  } catch {
    return false;
  }
}

/**
 * Ensure the bundled Whisper model is available on the filesystem.
 * - Android: extract from APK assets once into Documents
 * - iOS: copy from app bundle Resources once into Documents
 */
export async function ensureBundledWhisperModelAvailable(): Promise<
  string | null
> {
  const dest = getRuntimeWhisperModelPath();

  if (await whisperModelFileExists(dest)) {
    return dest;
  }

  try {
    if (Platform.OS === 'android') {
      await RNFS.copyFileAssets(ANDROID_ASSET_WHISPER_PATH, dest);
      if (await whisperModelFileExists(dest)) {
        return dest;
      }
      return null;
    }

    const bundleCandidates = [
      `${RNFS.MainBundlePath}/${WHISPER_MODEL_FILENAME}`,
      `${RNFS.MainBundlePath}/Resources/${WHISPER_MODEL_FILENAME}`,
    ];

    for (const source of bundleCandidates) {
      if (await RNFS.exists(source)) {
        await RNFS.copyFile(source, dest);
        if (await whisperModelFileExists(dest)) {
          return dest;
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

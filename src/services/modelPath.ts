import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {STORAGE_KEYS} from '../constants/storage';

/**
 * On-device instruct LLM (English correction).
 * Android: android/app/src/main/assets/models/<file>
 * iOS: ios/SayItBetter/Resources/<file> (Copy Bundle Resources)
 */
export const MODEL_FILENAME = 'Qwen2.5-1.5B-Instruct-Q4_K_M.gguf';

/** Relative Android asset path (inside src/main/assets). */
export const ANDROID_ASSET_MODEL_PATH = `models/${MODEL_FILENAME}`;

/** Minimum size sanity check (~900MB for this Q4_K_M build). */
const MIN_MODEL_BYTES = 100 * 1024 * 1024;

const DEV_MODEL_CANDIDATES: string[] = [];

export async function getStoredModelPathOverride(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.modelPath);
  } catch {
    return null;
  }
}

export async function setStoredModelPathOverride(
  path: string | null,
): Promise<void> {
  try {
    if (!path) {
      await AsyncStorage.removeItem(STORAGE_KEYS.modelPath);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.modelPath, path);
  } catch {
    // ignore
  }
}

export function toFileUri(path: string): string {
  if (path.startsWith('file://')) {
    return path;
  }
  return `file://${path}`;
}

export function stripFileUri(path: string): string {
  return path.replace(/^file:\/\//, '');
}

export function getRuntimeModelPath(): string {
  return `${RNFS.DocumentDirectoryPath.replace(/\/$/, '')}/${MODEL_FILENAME}`;
}

type ModelPathRoots = {
  documentDirectoryPath?: string | null;
  cachesDirectoryPath?: string | null;
  externalDirectoryPath?: string | null;
};

export function buildModelPathCandidates(
  roots: ModelPathRoots | string | null,
  overridePath?: string | null,
): string[] {
  const candidates: string[] = [];
  const normalizedRoots: ModelPathRoots =
    typeof roots === 'string' || roots == null
      ? {documentDirectoryPath: roots}
      : roots;

  if (overridePath) {
    candidates.push(stripFileUri(overridePath));
  }

  const bases = [
    normalizedRoots.documentDirectoryPath,
    normalizedRoots.cachesDirectoryPath,
    normalizedRoots.externalDirectoryPath,
  ].filter((value): value is string => Boolean(value));

  for (const baseRaw of bases) {
    const base = baseRaw.replace(/\/$/, '');
    candidates.push(`${base}/${MODEL_FILENAME}`);
    candidates.push(`${base}/models/${MODEL_FILENAME}`);
  }

  if (__DEV__) {
    candidates.push(
      `/Users/Shared/SayItBetter/${MODEL_FILENAME}`,
      ...DEV_MODEL_CANDIDATES,
    );
    if (Platform.OS === 'android') {
      candidates.push(`/sdcard/Download/${MODEL_FILENAME}`);
    }
  }

  return [...new Set(candidates)];
}

async function isUsableModelFile(path: string): Promise<boolean> {
  try {
    if (!(await RNFS.exists(path))) {
      return false;
    }
    const stat = await RNFS.stat(path);
    return Number(stat.size) >= MIN_MODEL_BYTES;
  } catch {
    return false;
  }
}

/**
 * Ensure the bundled model is available on the filesystem.
 * - Android: extract from APK assets once into Documents
 * - iOS: copy from app bundle Resources once into Documents
 */
export async function ensureBundledModelAvailable(): Promise<string | null> {
  const dest = getRuntimeModelPath();

  // Drop legacy SmolLM2 extract if present (saves device storage after upgrade).
  try {
    const legacy = `${RNFS.DocumentDirectoryPath.replace(
      /\/$/,
      '',
    )}/SmolLM2-360M-Instruct.Q4_K_M.gguf`;
    if (await RNFS.exists(legacy)) {
      await RNFS.unlink(legacy);
    }
  } catch {
    // ignore
  }

  if (await isUsableModelFile(dest)) {
    return dest;
  }

  try {
    if (Platform.OS === 'android') {
      await RNFS.copyFileAssets(ANDROID_ASSET_MODEL_PATH, dest);
      if (await isUsableModelFile(dest)) {
        return dest;
      }
      return null;
    }

    const bundleCandidates = [
      `${RNFS.MainBundlePath}/${MODEL_FILENAME}`,
      `${RNFS.MainBundlePath}/Resources/${MODEL_FILENAME}`,
    ];

    for (const source of bundleCandidates) {
      if (await RNFS.exists(source)) {
        await RNFS.copyFile(source, dest);
        if (await isUsableModelFile(dest)) {
          return dest;
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

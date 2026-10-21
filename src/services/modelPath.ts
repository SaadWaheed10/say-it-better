import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/storage';

/**
 * Bundled / expected filename for the local GGUF model.
 * Place this file in the app Documents directory (see docs/MODEL_SETUP.md).
 */
export const MODEL_FILENAME = 'SmolLM2-360M-Instruct.Q4_K_M.gguf';

/**
 * Optional absolute path override for local development only.
 * Prefer Documents-directory placement over hardcoding machine paths.
 */
const DEV_MODEL_CANDIDATES: string[] = [
  // Project symlink / models folder (macOS Simulator / desktop debugging)
  // These are checked only when a Documents copy is missing.
];

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

type ModelPathRoots = {
  documentDirectoryPath?: string | null;
  cachesDirectoryPath?: string | null;
  externalDirectoryPath?: string | null;
};

/**
 * Candidate absolute paths for the GGUF file on iOS and Android.
 * Prefer app-private Documents/files directories (see docs/MODEL_SETUP.md).
 */
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

  // Development convenience paths (host machine / shared folder).
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

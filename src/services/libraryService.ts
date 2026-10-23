import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/storage';
import {LibraryItem, ToneId} from '../types';

const MAX_LIBRARY_ITEMS = 100;

function createId(): string {
  return `lib-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getLibrary(): Promise<LibraryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.library);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as LibraryItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      item =>
        item &&
        typeof item.id === 'string' &&
        typeof item.text === 'string' &&
        item.text.trim().length > 0,
    );
  } catch {
    return [];
  }
}

async function persist(items: LibraryItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.library, JSON.stringify(items));
}

export async function addLibraryItem(input: {
  text: string;
  original?: string;
  tone?: ToneId;
  sourceHistoryId?: string;
}): Promise<LibraryItem> {
  const item: LibraryItem = {
    id: createId(),
    text: input.text.trim(),
    original: input.original?.trim() || undefined,
    tone: input.tone,
    sourceHistoryId: input.sourceHistoryId,
    createdAt: Date.now(),
  };

  try {
    const existing = await getLibrary();
    const deduped = existing.filter(
      entry => entry.text.toLowerCase() !== item.text.toLowerCase(),
    );
    await persist([item, ...deduped].slice(0, MAX_LIBRARY_ITEMS));
  } catch {
    // Keep returning the item even if persistence fails.
  }

  return item;
}

export async function deleteLibraryItem(id: string): Promise<LibraryItem[]> {
  const next = (await getLibrary()).filter(item => item.id !== id);
  try {
    await persist(next);
  } catch {
    // no-op
  }
  return next;
}

export async function clearLibrary(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.library);
  } catch {
    // no-op
  }
}

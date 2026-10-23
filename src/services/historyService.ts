import AsyncStorage from '@react-native-async-storage/async-storage';
import {MAX_HISTORY_ITEMS} from '../constants/tones';
import {STORAGE_KEYS} from '../constants/storage';
import {HistoryItem, ImproveResult, ToneId} from '../types';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.history);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as HistoryItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      item =>
        item &&
        typeof item.id === 'string' &&
        typeof item.original === 'string' &&
        typeof item.improved === 'string',
    );
  } catch {
    return [];
  }
}

async function persist(items: HistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(items));
}

export async function addHistoryItem(
  result: ImproveResult,
): Promise<HistoryItem> {
  const item: HistoryItem = {
    id: createId(),
    original: result.original,
    improved: result.improved,
    alternatives: result.alternatives ?? [],
    tone: result.tone,
    createdAt: result.createdAt || Date.now(),
  };

  try {
    const existing = await getHistory();
    const next = [item, ...existing].slice(0, MAX_HISTORY_ITEMS);
    await persist(next);
  } catch {
    // Keep returning the item even if persistence fails.
  }

  return item;
}

export async function deleteHistoryItem(id: string): Promise<HistoryItem[]> {
  const existing = await getHistory();
  const next = existing.filter(item => item.id !== id);
  try {
    await persist(next);
  } catch {
    // no-op
  }
  return next;
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.history);
  } catch {
    // no-op
  }
}

export async function getHistoryItem(
  id: string,
): Promise<HistoryItem | undefined> {
  const items = await getHistory();
  return items.find(item => item.id === id);
}

export async function toggleHistoryFavorite(
  id: string,
): Promise<HistoryItem[]> {
  const existing = await getHistory();
  const next = existing.map(item =>
    item.id === id ? {...item, isFavorite: !item.isFavorite} : item,
  );
  try {
    await persist(next);
  } catch {
    // no-op
  }
  return next;
}

export async function setHistoryFavorite(
  id: string,
  isFavorite: boolean,
): Promise<HistoryItem[]> {
  const existing = await getHistory();
  const next = existing.map(item =>
    item.id === id ? {...item, isFavorite} : item,
  );
  try {
    await persist(next);
  } catch {
    // no-op
  }
  return next;
}

export async function getFavorites(): Promise<HistoryItem[]> {
  const items = await getHistory();
  return items.filter(item => item.isFavorite);
}

export function filterHistory(
  items: HistoryItem[],
  options: {
    query?: string;
    tone?: ToneId | 'all';
    favoritesOnly?: boolean;
  },
): HistoryItem[] {
  const query = options.query?.trim().toLowerCase() ?? '';
  const tone = options.tone ?? 'all';
  return items.filter(item => {
    if (options.favoritesOnly && !item.isFavorite) {
      return false;
    }
    if (tone !== 'all' && item.tone !== tone) {
      return false;
    }
    if (!query) {
      return true;
    }
    return (
      item.improved.toLowerCase().includes(query) ||
      item.original.toLowerCase().includes(query) ||
      item.tone.toLowerCase().includes(query)
    );
  });
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/storage';
import {getLibrary} from './libraryService';
import {getHistory} from './historyService';
import {getMistakeQuestionIds, findQuestionById} from './testService';

export type ReviewItemKind = 'mistake' | 'library' | 'history';

export type SpacedReviewItem = {
  id: string;
  kind: ReviewItemKind;
  refId: string;
  prompt: string;
  hint?: string;
  nextAt: number;
  intervalDays: number;
  reps: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const INTERVALS = [1, 3, 7, 14];

async function loadQueue(): Promise<SpacedReviewItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.spacedReviewQueue);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SpacedReviewItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQueue(items: SpacedReviewItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.spacedReviewQueue,
      JSON.stringify(items.slice(0, 120)),
    );
  } catch {
    // no-op
  }
}

function upsert(
  queue: SpacedReviewItem[],
  item: Omit<SpacedReviewItem, 'nextAt' | 'intervalDays' | 'reps'> &
    Partial<Pick<SpacedReviewItem, 'nextAt' | 'intervalDays' | 'reps'>>,
): SpacedReviewItem[] {
  const existing = queue.findIndex(row => row.id === item.id);
  const next: SpacedReviewItem = {
    nextAt: item.nextAt ?? Date.now(),
    intervalDays: item.intervalDays ?? 1,
    reps: item.reps ?? 0,
    ...item,
  } as SpacedReviewItem;
  if (existing >= 0) {
    const copy = [...queue];
    copy[existing] = {...copy[existing], ...next, prompt: item.prompt};
    return copy;
  }
  return [next, ...queue];
}

/** Sync due queue from mistakes, library, and favorites/history. */
export async function syncReviewQueue(): Promise<SpacedReviewItem[]> {
  let queue = await loadQueue();
  const now = Date.now();

  const mistakeIds = await getMistakeQuestionIds();
  mistakeIds.slice(0, 40).forEach(qid => {
    const q = findQuestionById(qid);
    if (!q) {
      return;
    }
    const prompt =
      q.kind === 'written'
        ? q.rough
        : q.kind === 'fill'
          ? q.sentence
          : q.kind === 'listening'
            ? q.speakText
            : q.prompt;
    const hint =
      q.kind === 'written'
        ? q.hint
        : q.kind === 'mcq' || q.kind === 'fill' || q.kind === 'listening'
          ? q.explanation
          : undefined;
    queue = upsert(queue, {
      id: `mistake:${qid}`,
      kind: 'mistake',
      refId: qid,
      prompt,
      hint,
      nextAt: now,
    });
  });

  const library = await getLibrary();
  library.slice(0, 30).forEach(item => {
    queue = upsert(queue, {
      id: `library:${item.id}`,
      kind: 'library',
      refId: item.id,
      prompt: item.original || item.text,
      hint: `Aim for: ${item.text}`,
      nextAt: now + DAY_MS,
    });
  });

  const history = await getHistory();
  history
    .filter(item => item.isFavorite)
    .slice(0, 20)
    .forEach(item => {
      queue = upsert(queue, {
        id: `history:${item.id}`,
        kind: 'history',
        refId: item.id,
        prompt: item.original,
        hint: `Improved version: ${item.improved}`,
        nextAt: now + DAY_MS,
      });
    });

  await saveQueue(queue);
  return queue;
}

export async function getDueReviews(
  now = Date.now(),
): Promise<SpacedReviewItem[]> {
  const queue = await syncReviewQueue();
  return queue
    .filter(item => item.nextAt <= now)
    .sort((a, b) => a.nextAt - b.nextAt)
    .slice(0, 20);
}

export async function getReviewDueCount(): Promise<number> {
  const due = await getDueReviews();
  return due.length;
}

export async function markReviewResult(
  id: string,
  remembered: boolean,
): Promise<void> {
  const queue = await loadQueue();
  const index = queue.findIndex(item => item.id === id);
  if (index < 0) {
    return;
  }
  const item = queue[index];
  let intervalDays = item.intervalDays;
  let reps = item.reps;
  if (remembered) {
    reps += 1;
    const step = Math.min(reps - 1, INTERVALS.length - 1);
    intervalDays = INTERVALS[Math.max(0, step)];
  } else {
    reps = 0;
    intervalDays = 1;
  }
  queue[index] = {
    ...item,
    reps,
    intervalDays,
    nextAt: Date.now() + intervalDays * DAY_MS,
  };
  await saveQueue(queue);
}

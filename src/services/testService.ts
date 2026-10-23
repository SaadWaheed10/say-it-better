import AsyncStorage from '@react-native-async-storage/async-storage';
import {MCQ_BANK, WRITTEN_BANK} from '../constants/testQuestions';
import {getTestPack, packForSkill, TEST_PACKS} from '../constants/tests';
import {STORAGE_KEYS} from '../constants/storage';
import {
  McqQuestion,
  TestAnswerRecord,
  TestAttempt,
  TestBadge,
  TestBadgeId,
  TestDifficulty,
  TestPack,
  TestProgressSnapshot,
  TestQuestion,
  TestSkill,
  WrittenQuestion,
} from '../types';
import {getModelStatus, improveMessage} from './aiService';

const MAX_ATTEMPTS = 40;
const RECENT_WINDOW = 60;
const MAX_MISTAKES = 80;

const BADGE_META: Record<TestBadgeId, {title: string; description: string}> = {
  'first-test': {
    title: 'First steps',
    description: 'Completed your first skill test',
  },
  'streak-3': {
    title: '3-day streak',
    description: 'Practiced on 3 days in a row',
  },
  'streak-7': {
    title: 'Week warrior',
    description: '7-day test streak',
  },
  'perfect-10': {
    title: 'Perfect run',
    description: 'Scored full marks on a test',
  },
  'grammar-i': {
    title: 'Grammar I',
    description: 'Finished 3 Grammar focus tests',
  },
  'grammar-ii': {
    title: 'Grammar II',
    description: 'Scored 80%+ on Grammar focus',
  },
  'workplace-pro': {
    title: 'Workplace pro',
    description: 'Scored 80%+ on Workplace English',
  },
  comeback: {
    title: 'Comeback',
    description: 'Improved vs your previous attempt',
  },
};

function createId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function qDifficulty(
  item: {difficulty?: TestDifficulty},
): TestDifficulty {
  return item.difficulty ?? 'medium';
}

function matchesSkills(skill: TestSkill, filter?: TestSkill[]): boolean {
  if (!filter || filter.length === 0) {
    return true;
  }
  return filter.includes(skill);
}

function matchesDifficulty(
  item: {difficulty?: TestDifficulty},
  filter?: TestDifficulty | 'all',
): boolean {
  if (!filter || filter === 'all') {
    return true;
  }
  return qDifficulty(item) === filter;
}

async function getRecentQuestionIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.testRecentQuestionIds);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

async function pushRecentQuestionIds(ids: string[]): Promise<void> {
  try {
    const existing = await getRecentQuestionIds();
    const next = [...ids, ...existing].slice(0, RECENT_WINDOW);
    await AsyncStorage.setItem(
      STORAGE_KEYS.testRecentQuestionIds,
      JSON.stringify(next),
    );
  } catch {
    // no-op
  }
}

function pickRandom<T extends {id: string; skill: TestSkill; difficulty?: TestDifficulty}>(
  bank: T[],
  count: number,
  skillFilter: TestSkill[] | undefined,
  difficulty: TestDifficulty | 'all' | undefined,
  recentIds: Set<string>,
): T[] {
  const eligible = bank.filter(
    item =>
      matchesSkills(item.skill, skillFilter) &&
      matchesDifficulty(item, difficulty),
  );
  const fresh = eligible.filter(item => !recentIds.has(item.id));
  const pool = fresh.length >= count ? fresh : eligible;
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

export type BuildSessionOptions = {
  packId: string;
  timed?: boolean;
  mcqOnly?: boolean;
  difficulty?: TestDifficulty | 'all';
  mistakeQuestionIds?: string[];
};

export async function buildRandomTestSession(
  options: BuildSessionOptions,
): Promise<{pack: TestPack; questions: TestQuestion[]; timedSeconds?: number}> {
  const pack = getTestPack(options.packId);
  if (!pack) {
    throw new Error('Unknown test pack.');
  }

  const modelReady = getModelStatus().status === 'ready';
  const forceMcqOnly =
    options.mcqOnly ||
    pack.writtenCount === 0 ||
    (!modelReady && pack.writtenCount > 0);

  const difficulty = options.difficulty ?? pack.difficulty ?? 'all';

  if (options.mistakeQuestionIds && options.mistakeQuestionIds.length > 0) {
    const idSet = new Set(options.mistakeQuestionIds);
    const mcqs = MCQ_BANK.filter(q => idSet.has(q.id)).map(
      (q): TestQuestion => ({...q, kind: 'mcq'}),
    );
    const written = forceMcqOnly
      ? []
      : WRITTEN_BANK.filter(q => idSet.has(q.id)).map(
          (q): TestQuestion => ({...q, kind: 'written'}),
        );
    const questions = shuffle([...mcqs, ...written]).slice(0, 10);
    if (questions.length === 0) {
      throw new Error('No saved mistakes to retry yet.');
    }
    return {
      pack: {
        ...pack,
        title: 'Retry mistakes',
        subtitle: 'Only questions you missed',
      },
      questions,
      timedSeconds: options.timed ? pack.timedSeconds : undefined,
    };
  }

  const recent = new Set(await getRecentQuestionIds());
  const mcqCount = forceMcqOnly
    ? pack.mcqCount + pack.writtenCount
    : pack.mcqCount;
  const writtenCount = forceMcqOnly ? 0 : pack.writtenCount;

  const mcqs = pickRandom(
    MCQ_BANK,
    mcqCount,
    pack.skillFilter,
    difficulty,
    recent,
  ).map((q): TestQuestion => ({...q, kind: 'mcq'}));

  const written = pickRandom(
    WRITTEN_BANK,
    writtenCount,
    pack.skillFilter,
    difficulty,
    recent,
  ).map((q): TestQuestion => ({...q, kind: 'written'}));

  const questions = shuffle([...mcqs, ...written]);
  if (questions.length === 0) {
    throw new Error('No questions available for this test.');
  }

  await pushRecentQuestionIds(questions.map(q => q.id));
  return {
    pack,
    questions,
    timedSeconds:
      options.timed || pack.timedSeconds
        ? pack.timedSeconds ?? 8 * 60
        : undefined,
  };
}

export function scoreMcq(
  question: McqQuestion,
  selectedIndex: number,
): TestAnswerRecord {
  const correct = selectedIndex === question.correctIndex;
  return {
    questionId: question.id,
    kind: 'mcq',
    skill: question.skill,
    earned: correct ? 1 : 0,
    max: 1,
    userMcqIndex: selectedIndex,
    explanation: question.explanation,
    correct,
  };
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function similarityScore(a: string, b: string): number {
  const wa = new Set(normalizeWords(a));
  const wb = new Set(normalizeWords(b));
  if (wa.size === 0 || wb.size === 0) {
    return 0;
  }
  let inter = 0;
  wa.forEach(word => {
    if (wb.has(word)) {
      inter += 1;
    }
  });
  const union = wa.size + wb.size - inter;
  return union === 0 ? 0 : inter / union;
}

function parseAiScore(text: string): number | null {
  const match = text.match(/SCORE\s*[:=]\s*(0(?:\.5)?|1|0\.0|1\.0)/i);
  if (!match) {
    return null;
  }
  const value = Number(match[1]);
  if (value === 0 || value === 0.5 || value === 1) {
    return value;
  }
  return null;
}

export async function scoreWritten(
  question: WrittenQuestion,
  userAnswer: string,
): Promise<TestAnswerRecord> {
  const trimmed = userAnswer.trim();
  const model = await improveMessage({
    message: question.rough,
    tone: question.tone,
    instruction: 'Return one natural corrected English sentence only.',
  });

  let earned = 0;
  let explanation =
    'Needs work — study the model suggestion and try a similar prompt in Practice.';

  // Fairer pass: ask the model to score meaning (falls back to overlap).
  try {
    const judge = await improveMessage({
      message: `Original rough: ${question.rough}\nLearner answer: ${trimmed}\nModel answer: ${model.improved}`,
      tone: 'concise',
      instruction:
        'Judge if the learner answer keeps the same meaning and is clear English. Reply ONLY like: SCORE:1 or SCORE:0.5 or SCORE:0 then one short tip.',
    });
    const aiScore = parseAiScore(judge.improved);
    if (aiScore != null) {
      earned = aiScore;
      explanation = judge.improved.replace(/SCORE\s*[:=]\s*[^\s]+/i, '').trim()
        || explanation;
    } else {
      throw new Error('No parseable score');
    }
  } catch {
    const sim = similarityScore(trimmed, model.improved);
    if (sim >= 0.72) {
      earned = 1;
      explanation = 'Strong rewrite — close to a clear natural phrasing.';
    } else if (sim >= 0.45) {
      earned = 0.5;
      explanation = 'Partially clear — compare with the model suggestion.';
    }
  }

  if (earned === 1 && explanation.startsWith('Needs work')) {
    explanation = 'Strong rewrite — meaning and clarity look solid.';
  } else if (earned === 0.5 && explanation.startsWith('Needs work')) {
    explanation = 'Partially clear — compare with the model suggestion.';
  }

  return {
    questionId: question.id,
    kind: 'written',
    skill: question.skill,
    earned,
    max: 1,
    userWritten: trimmed,
    modelAnswer: model.improved,
    explanation,
    correct: earned === 1,
  };
}

/** Offline-safe written fallback when model unavailable mid-run. */
export function scoreWrittenOffline(
  question: WrittenQuestion,
  userAnswer: string,
): TestAnswerRecord {
  const trimmed = userAnswer.trim();
  const roughWords = new Set(normalizeWords(question.rough));
  const userWords = normalizeWords(trimmed);
  const novel = userWords.filter(w => !roughWords.has(w)).length;
  const earned = trimmed.length > 8 && novel >= 2 ? 0.5 : 0;
  return {
    questionId: question.id,
    kind: 'written',
    skill: question.skill,
    earned,
    max: 1,
    userWritten: trimmed,
    explanation:
      'Model offline — partial credit for an attempt. Retake when AI is ready for a full grade.',
    correct: false,
  };
}

function buildSuggestions(answers: TestAnswerRecord[]): {
  weakSkills: TestSkill[];
  suggestions: string[];
} {
  const skillMisses: Partial<Record<TestSkill, number>> = {};
  answers.forEach(answer => {
    if (answer.earned < answer.max) {
      skillMisses[answer.skill] = (skillMisses[answer.skill] ?? 0) + 1;
    }
  });

  const weakSkills = (
    Object.entries(skillMisses) as Array<[TestSkill, number]>
  )
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);

  const suggestions: string[] = [];
  if (weakSkills[0]) {
    suggestions.push(
      `Recommended next: ${getTestPack(packForSkill(weakSkills[0]))?.title ?? 'Quick check'}`,
    );
  }
  if (weakSkills.includes('grammar')) {
    suggestions.push('Retry Grammar focus or Practice past-tense prompts.');
  }
  if (weakSkills.includes('travel')) {
    suggestions.push('Try the Travel English pack for trip phrases.');
  }
  if (weakSkills.includes('interview')) {
    suggestions.push('Run Interview prep to sharpen confident answers.');
  }
  if (weakSkills.includes('clarity') || weakSkills.includes('tone')) {
    suggestions.push('Workplace English + Situations templates will help.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Great run — keep your streak with another Quick check.');
  } else {
    suggestions.push('Use Retry mistakes to drill only what you missed.');
  }

  return {
    weakSkills: weakSkills.slice(0, 3),
    suggestions: suggestions.slice(0, 4),
  };
}

export function finalizeAttempt(input: {
  pack: TestPack;
  questions: TestQuestion[];
  answers: TestAnswerRecord[];
  timed?: boolean;
  mcqOnly?: boolean;
}): TestAttempt {
  const score = input.answers.reduce((sum, a) => sum + a.earned, 0);
  const maxScore = input.answers.reduce((sum, a) => sum + a.max, 0);
  const {weakSkills, suggestions} = buildSuggestions(input.answers);

  return {
    id: createId(),
    packId: input.pack.id,
    packTitle: input.pack.title,
    score: Math.round(score * 10) / 10,
    maxScore,
    answers: input.answers,
    weakSkills,
    suggestions,
    questionIds: input.questions.map(q => q.id),
    createdAt: Date.now(),
    timed: input.timed,
    mcqOnly: input.mcqOnly,
  };
}

export async function getTestAttempts(): Promise<TestAttempt[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.testAttempts);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as TestAttempt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getMistakeQuestionIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.testMistakeIds);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function mergeMistakes(answers: TestAnswerRecord[]): Promise<void> {
  const missed = answers
    .filter(a => a.earned < a.max)
    .map(a => a.questionId);
  if (missed.length === 0) {
    return;
  }
  try {
    const existing = await getMistakeQuestionIds();
    const next = [...missed, ...existing.filter(id => !missed.includes(id))].slice(
      0,
      MAX_MISTAKES,
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.testMistakeIds,
      JSON.stringify(next),
    );
  } catch {
    // no-op
  }
}

export async function clearMistakesForAnswers(
  answers: TestAnswerRecord[],
): Promise<void> {
  const solved = new Set(
    answers.filter(a => a.earned >= a.max).map(a => a.questionId),
  );
  if (solved.size === 0) {
    return;
  }
  try {
    const existing = await getMistakeQuestionIds();
    const next = existing.filter(id => !solved.has(id));
    await AsyncStorage.setItem(
      STORAGE_KEYS.testMistakeIds,
      JSON.stringify(next),
    );
  } catch {
    // no-op
  }
}

async function getStoredBadges(): Promise<TestBadge[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.testBadges);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as TestBadge[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function unlockBadges(attempts: TestAttempt[]): Promise<TestBadge[]> {
  const existing = await getStoredBadges();
  const unlocked = new Map(existing.map(b => [b.id, b]));
  const now = Date.now();

  const unlock = (id: TestBadgeId) => {
    if (!unlocked.has(id)) {
      unlocked.set(id, {...BADGE_META[id], id, unlockedAt: now});
    }
  };

  if (attempts.length >= 1) {
    unlock('first-test');
  }
  const streak = computeStreakDays(attempts);
  if (streak >= 3) {
    unlock('streak-3');
  }
  if (streak >= 7) {
    unlock('streak-7');
  }
  if (attempts.some(a => a.maxScore > 0 && a.score >= a.maxScore)) {
    unlock('perfect-10');
  }
  const grammarRuns = attempts.filter(a => a.packId === 'grammar-focus');
  if (grammarRuns.length >= 3) {
    unlock('grammar-i');
  }
  if (
    grammarRuns.some(a => a.maxScore > 0 && a.score / a.maxScore >= 0.8)
  ) {
    unlock('grammar-ii');
  }
  if (
    attempts.some(
      a =>
        a.packId === 'workplace' &&
        a.maxScore > 0 &&
        a.score / a.maxScore >= 0.8,
    )
  ) {
    unlock('workplace-pro');
  }
  if (attempts.length >= 2) {
    const [latest, prev] = attempts;
    if (
      latest.packId === prev.packId &&
      latest.maxScore > 0 &&
      prev.maxScore > 0 &&
      latest.score / latest.maxScore > prev.score / prev.maxScore
    ) {
      unlock('comeback');
    }
  }

  const list = Array.from(unlocked.values());
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.testBadges, JSON.stringify(list));
  } catch {
    // no-op
  }
  return list;
}

export function computeStreakDays(attempts: TestAttempt[]): number {
  if (attempts.length === 0) {
    return 0;
  }
  const days = new Set(
    attempts.map(a => new Date(a.createdAt).toDateString()),
  );
  let streak = 0;
  const cursor = new Date();
  // Allow today or yesterday as the streak head.
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toDateString())) {
      return 0;
    }
  }
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function saveTestAttempt(
  attempt: TestAttempt,
): Promise<TestAttempt[]> {
  const existing = await getTestAttempts();
  const next = [attempt, ...existing].slice(0, MAX_ATTEMPTS);
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.testAttempts,
      JSON.stringify(next),
    );
  } catch {
    // no-op
  }
  await mergeMistakes(attempt.answers);
  await clearMistakesForAnswers(attempt.answers);
  await unlockBadges(next);
  return next;
}

export async function getTestAttempt(
  id: string,
): Promise<TestAttempt | undefined> {
  const items = await getTestAttempts();
  return items.find(item => item.id === id);
}

export function formatScore(score: number, max: number): string {
  const whole = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return `${whole} / ${max}`;
}

export function poolStats(): {mcq: number; written: number} {
  return {mcq: MCQ_BANK.length, written: WRITTEN_BANK.length};
}

export function findQuestionById(id: string): TestQuestion | undefined {
  const mcq = MCQ_BANK.find(q => q.id === id);
  if (mcq) {
    return {...mcq, kind: 'mcq'};
  }
  const written = WRITTEN_BANK.find(q => q.id === id);
  if (written) {
    return {...written, kind: 'written'};
  }
  return undefined;
}

export async function getProgressSnapshot(): Promise<TestProgressSnapshot> {
  const attempts = await getTestAttempts();
  const badges = await unlockBadges(attempts);
  const streakDays = computeStreakDays(attempts);
  const bestByPack: Record<string, number> = {};
  attempts.forEach(a => {
    if (a.maxScore <= 0) {
      return;
    }
    const pct = a.score / a.maxScore;
    bestByPack[a.packId] = Math.max(bestByPack[a.packId] ?? 0, pct);
  });

  const today = new Date().toDateString();
  const todayDone = attempts.some(
    a => new Date(a.createdAt).toDateString() === today,
  );

  const weak = attempts[0]?.weakSkills?.[0];
  const recommendedPackId = weak ? packForSkill(weak) : 'mixed-10';

  return {
    attempts,
    streakDays,
    bestByPack,
    badges: badges.filter(b => b.unlockedAt),
    todayDone,
    recommendedPackId:
      TEST_PACKS.some(p => p.id === recommendedPackId)
        ? recommendedPackId
        : 'mixed-10',
  };
}

export function isModelReadyForWritten(): boolean {
  return getModelStatus().status === 'ready';
}

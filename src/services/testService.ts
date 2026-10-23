import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FILL_BLANK_BANK,
  LISTENING_Q_BANK,
  MCQ_BANK,
  WRITTEN_BANK,
} from '../constants/testQuestions';
import {
  getTestPack,
  packForDifficulty,
  packForSkill,
  TEST_PACKS,
} from '../constants/tests';
import {STORAGE_KEYS} from '../constants/storage';
import {
  FillBlankQuestion,
  ListeningQuestion,
  McqQuestion,
  PausedTestSession,
  SkillScoreBreakdown,
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
  WrittenTipTag,
} from '../types';
import {getModelStatus, improveMessage} from './aiService';

const MAX_ATTEMPTS = 40;
const RECENT_WINDOW = 80;
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

export const ALL_BADGE_DEFS: TestBadge[] = (
  Object.keys(BADGE_META) as TestBadgeId[]
).map(id => ({id, ...BADGE_META[id]}));

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

/** Deterministic shuffle for daily challenge (same set all day). */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let s = seed % 2147483647;
  if (s <= 0) {
    s += 2147483646;
  }
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function qDifficulty(item: {difficulty?: TestDifficulty}): TestDifficulty {
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

function pickRandom<
  T extends {id: string; skill: TestSkill; difficulty?: TestDifficulty},
>(
  bank: T[],
  count: number,
  skillFilter: TestSkill[] | undefined,
  difficulty: TestDifficulty | 'all' | undefined,
  recentIds: Set<string>,
  seeded?: number,
): T[] {
  const eligible = bank.filter(
    item =>
      matchesSkills(item.skill, skillFilter) &&
      matchesDifficulty(item, difficulty),
  );
  const fresh = eligible.filter(item => !recentIds.has(item.id));
  const pool = fresh.length >= count ? fresh : eligible;
  const ordered = seeded != null ? seededShuffle(pool, seeded) : shuffle(pool);
  return ordered.slice(0, Math.min(count, pool.length));
}

function scaleCounts(
  pack: TestPack,
  questionCount?: 5 | 10 | 15,
): {
  mcq: number;
  written: number;
  fill: number;
  listening: number;
} {
  const baseTotal = Math.max(pack.totalQuestions, 1);
  const target = questionCount ?? pack.totalQuestions;
  const ratio = target / baseTotal;
  const fill = Math.round((pack.fillCount ?? 0) * ratio);
  const listening = Math.round((pack.listeningCount ?? 0) * ratio);
  const written = Math.round(pack.writtenCount * ratio);
  let mcq = Math.round(pack.mcqCount * ratio);
  const sum = mcq + written + fill + listening;
  if (sum < target) {
    mcq += target - sum;
  } else if (sum > target && mcq > 0) {
    mcq = Math.max(0, mcq - (sum - target));
  }
  return {mcq, written, fill, listening};
}

export type BuildSessionOptions = {
  packId: string;
  timed?: boolean;
  mcqOnly?: boolean;
  difficulty?: TestDifficulty | 'all';
  mistakeQuestionIds?: string[];
  questionCount?: 5 | 10 | 15;
  isDaily?: boolean;
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
  const useDailySeed = Boolean(options.isDaily || pack.isDaily);
  const seed = useDailySeed ? daySeed() : undefined;

  if (options.mistakeQuestionIds && options.mistakeQuestionIds.length > 0) {
    const idSet = new Set(options.mistakeQuestionIds);
    const mcqs = MCQ_BANK.filter(q => idSet.has(q.id)).map(
      (q): TestQuestion => ({...q, kind: 'mcq'}),
    );
    const fills = FILL_BLANK_BANK.filter(q => idSet.has(q.id)).map(
      (q): TestQuestion => ({...q, kind: 'fill'}),
    );
    const listening = LISTENING_Q_BANK.filter(q => idSet.has(q.id)).map(
      (q): TestQuestion => ({...q, kind: 'listening'}),
    );
    const written = forceMcqOnly
      ? []
      : WRITTEN_BANK.filter(q => idSet.has(q.id)).map(
          (q): TestQuestion => ({...q, kind: 'written'}),
        );
    const questions = shuffle([...mcqs, ...fills, ...listening, ...written]).slice(
      0,
      10,
    );
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

  const recent = useDailySeed
    ? new Set<string>()
    : new Set(await getRecentQuestionIds());
  const counts = scaleCounts(pack, options.questionCount);

  let mcqCount = counts.mcq;
  let writtenCount = forceMcqOnly ? 0 : counts.written;
  let fillCount = counts.fill;
  let listeningCount = counts.listening;

  if (forceMcqOnly) {
    mcqCount += writtenCount;
    writtenCount = 0;
  }

  const mcqs = pickRandom(
    MCQ_BANK,
    mcqCount,
    pack.skillFilter,
    difficulty,
    recent,
    seed,
  ).map((q): TestQuestion => ({...q, kind: 'mcq'}));

  const fills = pickRandom(
    FILL_BLANK_BANK,
    fillCount,
    pack.skillFilter,
    difficulty,
    recent,
    seed != null ? seed + 11 : undefined,
  ).map((q): TestQuestion => ({...q, kind: 'fill'}));

  const listening = pickRandom(
    LISTENING_Q_BANK,
    listeningCount,
    pack.skillFilter,
    difficulty,
    recent,
    seed != null ? seed + 23 : undefined,
  ).map((q): TestQuestion => ({...q, kind: 'listening'}));

  const written = pickRandom(
    WRITTEN_BANK,
    writtenCount,
    pack.skillFilter,
    difficulty,
    recent,
    seed != null ? seed + 37 : undefined,
  ).map((q): TestQuestion => ({...q, kind: 'written'}));

  const questions =
    seed != null
      ? seededShuffle([...mcqs, ...fills, ...listening, ...written], seed + 99)
      : shuffle([...mcqs, ...fills, ...listening, ...written]);

  if (questions.length === 0) {
    throw new Error('No questions available for this test.');
  }

  if (!useDailySeed) {
    await pushRecentQuestionIds(questions.map(q => q.id));
  }

  return {
    pack,
    questions,
    timedSeconds:
      options.timed || pack.timedSeconds
        ? pack.timedSeconds ?? 8 * 60
        : undefined,
  };
}

function scoreChoice(
  kind: 'mcq' | 'fill' | 'listening',
  question: McqQuestion | FillBlankQuestion | ListeningQuestion,
  selectedIndex: number,
): TestAnswerRecord {
  const correct = selectedIndex === question.correctIndex;
  return {
    questionId: question.id,
    kind,
    skill: question.skill,
    earned: correct ? 1 : 0,
    max: 1,
    userMcqIndex: selectedIndex,
    explanation: question.explanation,
    correct,
  };
}

export function scoreMcq(
  question: McqQuestion,
  selectedIndex: number,
): TestAnswerRecord {
  return scoreChoice('mcq', question, selectedIndex);
}

export function scoreFillBlank(
  question: FillBlankQuestion,
  selectedIndex: number,
): TestAnswerRecord {
  return scoreChoice('fill', question, selectedIndex);
}

export function scoreListening(
  question: ListeningQuestion,
  selectedIndex: number,
): TestAnswerRecord {
  return scoreChoice('listening', question, selectedIndex);
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

function normalizeChoiceText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[—–−]/g, '-')
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Map a spoken answer onto an MCQ / fill / listening option.
 * Accepts letters (A–D), numbers (1–4), ordinals, or option text.
 */
export function matchSpokenChoice(
  transcript: string,
  options: string[],
): number | null {
  if (!options.length) {
    return null;
  }
  const raw = transcript.trim().toLowerCase();
  const spoken = normalizeChoiceText(transcript);
  if (!spoken) {
    return null;
  }

  const letterMatch = raw.match(
    /(?:^|\b)(?:option|answer|choice)?\s*([a-d])(?:\b|$)/i,
  );
  if (letterMatch) {
    const idx = letterMatch[1].toLowerCase().charCodeAt(0) - 97;
    if (idx >= 0 && idx < options.length) {
      return idx;
    }
  }

  const numberMatch = raw.match(
    /(?:^|\b)(?:option|answer|choice|number)?\s*([1-4]|one|two|three|four|first|second|third|fourth)(?:\b|$)/i,
  );
  if (numberMatch) {
    const token = numberMatch[1].toLowerCase();
    const map: Record<string, number> = {
      '1': 0,
      one: 0,
      first: 0,
      '2': 1,
      two: 1,
      second: 1,
      '3': 2,
      three: 2,
      third: 2,
      '4': 3,
      four: 3,
      fourth: 3,
    };
    const idx = map[token];
    if (idx != null && idx < options.length) {
      return idx;
    }
  }

  // Exact / contains match on option text
  let bestIndex = -1;
  let bestScore = 0;
  options.forEach((option, index) => {
    const opt = normalizeChoiceText(option);
    if (!opt) {
      return;
    }
    if (spoken === opt || spoken.includes(opt) || opt.includes(spoken)) {
      const score = Math.max(spoken.length, opt.length) / Math.min(spoken.length, opt.length);
      const quality = 1 / score + (spoken === opt ? 2 : 0);
      if (quality > bestScore) {
        bestScore = quality;
        bestIndex = index;
      }
      return;
    }
    const sim = similarityScore(spoken, opt);
    if (sim > bestScore) {
      bestScore = sim;
      bestIndex = index;
    }
  });

  if (bestIndex >= 0 && bestScore >= 0.45) {
    return bestIndex;
  }
  return null;
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

function tipTagLabel(tag?: WrittenTipTag): string {
  if (!tag) {
    return '';
  }
  const labels: Record<WrittenTipTag, string> = {
    tense: 'Tense',
    'word-order': 'Word order',
    tone: 'Tone',
    article: 'Articles',
    agreement: 'Agreement',
    clarity: 'Clarity',
    'word-choice': 'Word choice',
  };
  return labels[tag] ?? tag;
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
      explanation =
        judge.improved.replace(/SCORE\s*[:=]\s*[^\s]+/i, '').trim() ||
        explanation;
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

  const tag = question.tipTag;
  if (tag && earned < 1) {
    const label = tipTagLabel(tag);
    if (label && !explanation.toLowerCase().includes(label.toLowerCase())) {
      explanation = `${explanation} Tip focus: ${label}.`;
    }
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
    tipTag: tag,
    correct: earned === 1,
  };
}

export function scoreWrittenOffline(
  question: WrittenQuestion,
  userAnswer: string,
): TestAnswerRecord {
  const trimmed = userAnswer.trim();
  const roughWords = new Set(normalizeWords(question.rough));
  const userWords = normalizeWords(trimmed);
  const novel = userWords.filter(w => !roughWords.has(w)).length;
  const earned = trimmed.length > 8 && novel >= 2 ? 0.5 : 0;
  const tag = question.tipTag;
  let explanation =
    'Model offline — partial credit for an attempt. Retake when AI is ready for a full grade.';
  if (tag) {
    explanation = `${explanation} Tip focus: ${tipTagLabel(tag)}.`;
  }
  return {
    questionId: question.id,
    kind: 'written',
    skill: question.skill,
    earned,
    max: 1,
    userWritten: trimmed,
    explanation,
    tipTag: tag,
    correct: false,
  };
}

function buildSkillBreakdown(answers: TestAnswerRecord[]): SkillScoreBreakdown[] {
  const map = new Map<TestSkill, {earned: number; max: number}>();
  answers.forEach(answer => {
    const cur = map.get(answer.skill) ?? {earned: 0, max: 0};
    cur.earned += answer.earned;
    cur.max += answer.max;
    map.set(answer.skill, cur);
  });
  return Array.from(map.entries())
    .map(([skill, {earned, max}]) => ({
      skill,
      earned: Math.round(earned * 10) / 10,
      max,
      percent: max > 0 ? earned / max : 0,
    }))
    .sort((a, b) => a.percent - b.percent);
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

  const tipCounts: Partial<Record<WrittenTipTag, number>> = {};
  answers.forEach(a => {
    if (a.tipTag && a.earned < a.max) {
      tipCounts[a.tipTag] = (tipCounts[a.tipTag] ?? 0) + 1;
    }
  });
  const topTip = (
    Object.entries(tipCounts) as Array<[WrittenTipTag, number]>
  ).sort((a, b) => b[1] - a[1])[0]?.[0];

  const suggestions: string[] = [];
  if (weakSkills[0]) {
    suggestions.push(
      `Recommended next: ${getTestPack(packForSkill(weakSkills[0]))?.title ?? 'Quick check'}`,
    );
  }
  if (topTip) {
    suggestions.push(`Written tip focus: ${tipTagLabel(topTip)}.`);
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
  difficulty?: TestDifficulty | 'all';
  isDaily?: boolean;
  isPlacement?: boolean;
}): TestAttempt {
  const score = input.answers.reduce((sum, a) => sum + a.earned, 0);
  const maxScore = input.answers.reduce((sum, a) => sum + a.max, 0);
  const {weakSkills, suggestions} = buildSuggestions(input.answers);
  const skillBreakdown = buildSkillBreakdown(input.answers);

  return {
    id: createId(),
    packId: input.pack.id,
    packTitle: input.pack.title,
    score: Math.round(score * 10) / 10,
    maxScore,
    answers: input.answers,
    weakSkills,
    skillBreakdown,
    suggestions,
    questionIds: input.questions.map(q => q.id),
    createdAt: Date.now(),
    timed: input.timed,
    mcqOnly: input.mcqOnly,
    difficulty: input.difficulty ?? input.pack.difficulty,
    isDaily: input.isDaily ?? input.pack.isDaily,
    isPlacement: input.isPlacement ?? input.pack.isPlacement,
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
    const next = [
      ...missed,
      ...existing.filter(id => !missed.includes(id)),
    ].slice(0, MAX_MISTAKES);
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
  if (grammarRuns.some(a => a.maxScore > 0 && a.score / a.maxScore >= 0.8)) {
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

function computeAdaptiveDifficulty(attempts: TestAttempt[]): TestDifficulty {
  const recent = attempts.slice(0, 5);
  if (recent.length === 0) {
    return 'easy';
  }
  const avg =
    recent.reduce((sum, a) => {
      if (a.maxScore <= 0) {
        return sum;
      }
      return sum + a.score / a.maxScore;
    }, 0) / recent.length;
  if (avg >= 0.85) {
    return 'hard';
  }
  if (avg >= 0.6) {
    return 'medium';
  }
  return 'easy';
}

export async function getPausedSession(): Promise<PausedTestSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.testPausedSession);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PausedTestSession;
    if (!parsed?.packId || !Array.isArray(parsed.questions)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function savePausedSession(
  session: PausedTestSession,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.testPausedSession,
      JSON.stringify({...session, savedAt: Date.now()}),
    );
  } catch {
    // no-op
  }
}

export async function clearPausedSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.testPausedSession);
  } catch {
    // no-op
  }
}

async function getDailyCompletedDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.testDailyCompleted);
  } catch {
    return null;
  }
}

export async function markDailyChallengeDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.testDailyCompleted,
      new Date().toDateString(),
    );
  } catch {
    // no-op
  }
}

export async function isPlacementDone(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.testPlacementDone);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markPlacementDone(
  recommended: TestDifficulty,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.testPlacementDone, 'true');
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.testPlacementDone}_level`,
      recommended,
    );
  } catch {
    // no-op
  }
}

export function placementLevelFromScore(
  score: number,
  maxScore: number,
): TestDifficulty {
  if (maxScore <= 0) {
    return 'easy';
  }
  const pct = score / maxScore;
  if (pct >= 0.8) {
    return 'hard';
  }
  if (pct >= 0.5) {
    return 'medium';
  }
  return 'easy';
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
  await clearPausedSession();

  if (attempt.isDaily) {
    await markDailyChallengeDone();
  }
  if (attempt.isPlacement) {
    const level = placementLevelFromScore(attempt.score, attempt.maxScore);
    await markPlacementDone(level);
  }
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

export function poolStats(): {
  mcq: number;
  written: number;
  fill: number;
  listening: number;
} {
  return {
    mcq: MCQ_BANK.length,
    written: WRITTEN_BANK.length,
    fill: FILL_BLANK_BANK.length,
    listening: LISTENING_Q_BANK.length,
  };
}

export function findQuestionById(id: string): TestQuestion | undefined {
  const mcq = MCQ_BANK.find(q => q.id === id);
  if (mcq) {
    return {...mcq, kind: 'mcq'};
  }
  const fill = FILL_BLANK_BANK.find(q => q.id === id);
  if (fill) {
    return {...fill, kind: 'fill'};
  }
  const listening = LISTENING_Q_BANK.find(q => q.id === id);
  if (listening) {
    return {...listening, kind: 'listening'};
  }
  const written = WRITTEN_BANK.find(q => q.id === id);
  if (written) {
    return {...written, kind: 'written'};
  }
  return undefined;
}

export function exportAttemptsCsv(attempts: TestAttempt[]): string {
  const header =
    'id,packId,packTitle,score,maxScore,percent,createdAt,timed,mcqOnly,isDaily,isPlacement,weakSkills';
  const rows = attempts.map(a => {
    const pct =
      a.maxScore > 0 ? ((a.score / a.maxScore) * 100).toFixed(1) : '0';
    const weak = (a.weakSkills ?? []).join('|');
    const title = `"${(a.packTitle ?? '').replace(/"/g, '""')}"`;
    return [
      a.id,
      a.packId,
      title,
      a.score,
      a.maxScore,
      pct,
      new Date(a.createdAt).toISOString(),
      a.timed ? '1' : '0',
      a.mcqOnly ? '1' : '0',
      a.isDaily ? '1' : '0',
      a.isPlacement ? '1' : '0',
      `"${weak}"`,
    ].join(',');
  });
  return [header, ...rows].join('\n');
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
  const dailyDate = await getDailyCompletedDate();
  const dailyChallengeDone = dailyDate === today;
  const placementDone = await isPlacementDone();
  const pausedSession = await getPausedSession();
  const adaptiveDifficulty = computeAdaptiveDifficulty(attempts);

  const weak = attempts[0]?.weakSkills?.[0];
  let recommendedPackId = weak ? packForSkill(weak) : 'mixed-10';
  if (!placementDone) {
    recommendedPackId = 'placement';
  } else if (!dailyChallengeDone) {
    recommendedPackId = 'daily';
  } else {
    recommendedPackId = packForDifficulty(adaptiveDifficulty);
  }

  const unlockedMap = new Map(badges.map(b => [b.id, b]));
  const allBadges = ALL_BADGE_DEFS.map(def => ({
    ...def,
    unlockedAt: unlockedMap.get(def.id)?.unlockedAt,
  }));

  return {
    attempts,
    streakDays,
    bestByPack,
    badges: badges.filter(b => b.unlockedAt),
    allBadges,
    todayDone,
    dailyChallengeDone,
    recommendedPackId: TEST_PACKS.some(p => p.id === recommendedPackId)
      ? recommendedPackId
      : 'mixed-10',
    adaptiveDifficulty,
    placementDone,
    pausedSession,
  };
}

export function isModelReadyForWritten(): boolean {
  return getModelStatus().status === 'ready';
}

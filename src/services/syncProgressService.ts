import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/storage';
import {AppSettings, TestAttempt, TestBadge, TestBadgeId} from '../types';
import {getCurrentUser} from './authService';
import {getSettings, saveSettings} from './settingsService';
import {SpacedReviewItem} from './spacedReviewService';
import {getSituationScores, SituationScoreRecord} from './situationScoreService';
import {getSupabase} from './supabaseClient';
import {
  getMistakeQuestionIds,
  getTestAttempts,
  isPlacementDone,
} from './testService';

function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

function fromIso(value: string | null | undefined, fallback = Date.now()): number {
  if (!value) {
    return fallback;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getUnlockedBadgesLocal(): Promise<TestBadge[]> {
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

async function getDailyCompletedDateLocal(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.testDailyCompleted);
  } catch {
    return null;
  }
}

async function loadSpacedReviewLocal(): Promise<SpacedReviewItem[]> {
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

async function upsertAttemptRow(
  userId: string,
  attempt: TestAttempt,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const {error} = await supabase.from('test_attempts').upsert(
    {
      id: attempt.id,
      user_id: userId,
      pack_id: attempt.packId,
      pack_title: attempt.packTitle,
      score: attempt.score,
      max_score: attempt.maxScore,
      answers: attempt.answers,
      weak_skills: attempt.weakSkills,
      skill_breakdown: attempt.skillBreakdown,
      suggestions: attempt.suggestions,
      question_ids: attempt.questionIds,
      timed: Boolean(attempt.timed),
      mcq_only: Boolean(attempt.mcqOnly),
      difficulty: attempt.difficulty ?? null,
      is_daily: Boolean(attempt.isDaily),
      is_placement: Boolean(attempt.isPlacement),
      created_at: toIso(attempt.createdAt),
      synced_at: toIso(Date.now()),
    },
    {onConflict: 'id'},
  );
  if (error) {
    throw error;
  }
}

/** Push one attempt to Supabase (no-op if signed out / offline). */
export async function pushTestAttempt(attempt: TestAttempt): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }
  await upsertAttemptRow(user.id, attempt);
  await pushUserProgressMeta(user.id);
  await pushBadges(user.id);
}

async function pushUserProgressMeta(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const [placementDone, dailyCompletedDate, mistakeIds] = await Promise.all([
    isPlacementDone(),
    getDailyCompletedDateLocal(),
    getMistakeQuestionIds(),
  ]);

  const {error} = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      placement_done: placementDone,
      daily_completed_date: dailyCompletedDate,
      mistake_question_ids: mistakeIds,
      updated_at: toIso(Date.now()),
    },
    {onConflict: 'user_id'},
  );
  if (error) {
    throw error;
  }
}

async function pushBadges(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const badges = (await getUnlockedBadgesLocal()).filter(b => b.unlockedAt);
  if (badges.length === 0) {
    return;
  }
  const rows = badges.map(b => ({
    user_id: userId,
    badge_id: b.id,
    unlocked_at: toIso(b.unlockedAt as number),
  }));
  const {error} = await supabase
    .from('test_badges')
    .upsert(rows, {onConflict: 'user_id,badge_id'});
  if (error) {
    throw error;
  }
}

export async function pushUserSettings(userId?: string): Promise<void> {
  const supabase = getSupabase();
  const user = userId ? {id: userId} : await getCurrentUser();
  if (!supabase || !user) {
    return;
  }
  const settings = await getSettings();
  const onboardingDone = await isOnboardingFlagTrue(settings);
  const {error} = await supabase.from('user_settings').upsert(
    {
      user_id: user.id,
      default_tone: settings.defaultTone,
      theme_preference: settings.themePreference,
      daily_test_reminder: Boolean(settings.dailyTestReminder),
      reduce_motion: Boolean(settings.reduceMotion),
      onboarding_completed: onboardingDone,
      improve_tip_dismissed: Boolean(settings.improveTipDismissed),
      updated_at: toIso(Date.now()),
    },
    {onConflict: 'user_id'},
  );
  if (error) {
    throw error;
  }
}

async function isOnboardingFlagTrue(settings: AppSettings): Promise<boolean> {
  if (settings.onboardingCompleted) {
    return true;
  }
  try {
    const flag = await AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted);
    return flag === 'true';
  } catch {
    return false;
  }
}

async function pushSpacedReview(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const items = await loadSpacedReviewLocal();
  if (items.length === 0) {
    return;
  }
  const rows = items.map(item => ({
    id: item.id,
    user_id: userId,
    kind: item.kind,
    ref_id: item.refId,
    prompt: item.prompt,
    hint: item.hint ?? null,
    next_at: toIso(item.nextAt),
    interval_days: item.intervalDays,
    reps: item.reps,
    updated_at: toIso(Date.now()),
  }));
  const {error} = await supabase
    .from('spaced_review_items')
    .upsert(rows, {onConflict: 'id'});
  if (error) {
    throw error;
  }
}

async function pushSituationScores(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const scores = await getSituationScores();
  if (scores.length === 0) {
    return;
  }
  // Scores only — skip answer text for privacy by default.
  const rows = scores.map((s: SituationScoreRecord) => ({
    id: s.id,
    user_id: userId,
    template_id: s.templateId,
    title: s.title,
    score: s.score,
    max_score: s.maxScore,
    tip: s.tip,
    user_answer: null,
    model_answer: null,
    created_at: toIso(s.createdAt),
    synced_at: toIso(Date.now()),
  }));
  const {error} = await supabase
    .from('situation_scores')
    .upsert(rows, {onConflict: 'id'});
  if (error) {
    throw error;
  }
}

async function pullAndMergeAttempts(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const {data, error} = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    throw error;
  }
  const remote: TestAttempt[] = (data ?? []).map(row => ({
    id: row.id,
    packId: row.pack_id,
    packTitle: row.pack_title,
    score: Number(row.score),
    maxScore: Number(row.max_score),
    answers: row.answers ?? [],
    weakSkills: row.weak_skills ?? [],
    skillBreakdown: row.skill_breakdown ?? [],
    suggestions: row.suggestions ?? [],
    questionIds: row.question_ids ?? [],
    createdAt: fromIso(row.created_at),
    timed: Boolean(row.timed),
    mcqOnly: Boolean(row.mcq_only),
    difficulty: row.difficulty ?? undefined,
    isDaily: Boolean(row.is_daily),
    isPlacement: Boolean(row.is_placement),
  }));

  const local = await getTestAttempts();
  const byId = new Map<string, TestAttempt>();
  [...local, ...remote].forEach(item => {
    const prev = byId.get(item.id);
    if (!prev || item.createdAt >= prev.createdAt) {
      byId.set(item.id, item);
    }
  });
  const merged = Array.from(byId.values()).sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  await AsyncStorage.setItem(
    STORAGE_KEYS.testAttempts,
    JSON.stringify(merged.slice(0, 80)),
  );
}

async function pullAndMergeBadges(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const {data, error} = await supabase
    .from('test_badges')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    throw error;
  }
  const local = await getUnlockedBadgesLocal();
  const byId = new Map<string, TestBadge>();
  local.forEach(b => byId.set(b.id, b));
  (data ?? []).forEach(row => {
    const id = row.badge_id as TestBadgeId;
    const unlockedAt = fromIso(row.unlocked_at);
    const prev = byId.get(id);
    if (!prev?.unlockedAt || unlockedAt < (prev.unlockedAt as number)) {
      byId.set(id, {
        id,
        title: prev?.title ?? id,
        description: prev?.description ?? '',
        unlockedAt,
      });
    }
  });
  await AsyncStorage.setItem(
    STORAGE_KEYS.testBadges,
    JSON.stringify(Array.from(byId.values())),
  );
}

async function pullProgressMeta(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const {data, error} = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return;
  }
  if (data.placement_done) {
    await AsyncStorage.setItem(STORAGE_KEYS.testPlacementDone, 'true');
  }
  if (typeof data.daily_completed_date === 'string' && data.daily_completed_date) {
    const local = await getDailyCompletedDateLocal();
    if (!local) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.testDailyCompleted,
        data.daily_completed_date,
      );
    }
  }
  if (Array.isArray(data.mistake_question_ids)) {
    const local = await getMistakeQuestionIds();
    const merged = Array.from(
      new Set([...data.mistake_question_ids, ...local]),
    ).slice(0, 80);
    await AsyncStorage.setItem(
      STORAGE_KEYS.testMistakeIds,
      JSON.stringify(merged),
    );
  }
}

async function pullSettings(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const {data, error} = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return;
  }

  const local = await getSettings();
  const localOnboarding = await isOnboardingFlagTrue(local);
  const remoteOnboarding = Boolean(data.onboarding_completed);
  // Never downgrade a completed onboarding flag with the cloud default (false).
  const onboardingCompleted = localOnboarding || remoteOnboarding;

  const patch: Partial<AppSettings> = {
    defaultTone: data.default_tone,
    themePreference: data.theme_preference,
    dailyTestReminder: Boolean(data.daily_test_reminder),
    reduceMotion: Boolean(data.reduce_motion),
    onboardingCompleted,
    improveTipDismissed:
      Boolean(local.improveTipDismissed) ||
      Boolean(data.improve_tip_dismissed),
  };
  await saveSettings(patch);

  if (onboardingCompleted) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, 'true');
    } catch {
      // no-op
    }
  }
}

/**
 * Full sync for the signed-in user: pull remote → merge local → push local.
 * Safe to call often; no-ops when signed out.
 */
export async function syncAllProgress(): Promise<{ok: boolean; detail: string}> {
  const supabase = getSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) {
    return {ok: false, detail: 'Sign in to sync progress to the cloud.'};
  }

  try {
    await pullAndMergeAttempts(user.id);
    await pullAndMergeBadges(user.id);
    await pullProgressMeta(user.id);
    await pullSettings(user.id);

    const attempts = await getTestAttempts();
    for (const attempt of attempts) {
      await upsertAttemptRow(user.id, attempt);
    }
    await pushUserProgressMeta(user.id);
    await pushBadges(user.id);
    await pushUserSettings(user.id);
    await pushSpacedReview(user.id);
    await pushSituationScores(user.id);

    return {ok: true, detail: `Synced ${attempts.length} attempt(s) to Supabase.`};
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sync failed';
    return {ok: false, detail: message};
  }
}

/** Fire-and-forget push after a local attempt is saved. */
export function queuePushTestAttempt(attempt: TestAttempt): void {
  pushTestAttempt(attempt).catch(() => {
    // Offline / RLS errors should not block finishing a test.
  });
}

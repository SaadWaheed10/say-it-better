import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/storage';
import {getTemplate} from '../constants/templates';
import {ToneId} from '../types';
import {getModelStatus, improveMessage} from './aiService';
import {similarityScore} from './testService';

export type SituationScoreRecord = {
  id: string;
  templateId: string;
  title: string;
  score: number;
  maxScore: number;
  userAnswer: string;
  modelAnswer?: string;
  tip: string;
  createdAt: number;
};

const MAX = 40;

async function loadScores(): Promise<SituationScoreRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.situationScores);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SituationScoreRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveScores(items: SituationScoreRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.situationScores,
      JSON.stringify(items.slice(0, MAX)),
    );
  } catch {
    // no-op
  }
}

export async function getSituationScores(): Promise<SituationScoreRecord[]> {
  return loadScores();
}

export async function getBestSituationScore(
  templateId: string,
): Promise<number | null> {
  const items = await loadScores();
  const forTemplate = items.filter(item => item.templateId === templateId);
  if (forTemplate.length === 0) {
    return null;
  }
  return Math.max(...forTemplate.map(item => item.score / item.maxScore));
}

export async function scoreSituationAttempt(input: {
  templateId: string;
  userAnswer: string;
  tone: ToneId;
}): Promise<SituationScoreRecord> {
  const template = getTemplate(input.templateId);
  if (!template) {
    throw new Error('Unknown situation.');
  }
  const trimmed = input.userAnswer.trim();
  if (!trimmed) {
    throw new Error('Write your improved version first.');
  }

  let modelAnswer = '';
  let earned = 0.5;
  let tip = 'Solid attempt — keep practicing this situation.';

  if (getModelStatus().status === 'ready') {
    const model = await improveMessage({
      message: template.example,
      tone: input.tone,
      instruction: template.instruction,
    });
    modelAnswer = model.improved;
    const sim = similarityScore(trimmed, model.improved);
    if (sim >= 0.72) {
      earned = 1;
      tip = 'Excellent — clear and natural for this situation.';
    } else if (sim >= 0.45) {
      earned = 0.5;
      tip = 'Partially clear — compare with the model suggestion.';
    } else {
      earned = 0;
      tip = 'Needs work — study the model line and try again.';
    }
  } else {
    tip =
      'Model offline — partial credit for an attempt. Retry when AI is ready.';
    earned = trimmed.length > 12 ? 0.5 : 0;
  }

  const record: SituationScoreRecord = {
    id: `sit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    templateId: template.id,
    title: template.title,
    score: earned,
    maxScore: 1,
    userAnswer: trimmed,
    modelAnswer: modelAnswer || undefined,
    tip,
    createdAt: Date.now(),
  };

  const existing = await loadScores();
  await saveScores([record, ...existing]);
  return record;
}

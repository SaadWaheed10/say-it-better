import {PracticePrompt, ToneId} from '../types';

export const PRACTICE_PROMPTS: PracticePrompt[] = [
  {
    id: 'p1',
    rough: 'i go to store yesterday and buy milk but forget bread',
    hint: 'Past tense and a natural connector',
    tone: 'casual',
  },
  {
    id: 'p2',
    rough: 'please send me the file when you will finished it',
    hint: 'Fix tense and keep it polite',
    tone: 'polite',
  },
  {
    id: 'p3',
    rough: 'i am agree with your idea but we need more time',
    hint: 'Natural agreement phrasing',
    tone: 'professional',
  },
  {
    id: 'p4',
    rough: 'can you tell me how much cost the ticket',
    hint: 'Word order for questions',
    tone: 'friendly',
  },
  {
    id: 'p5',
    rough: 'she dont like coffee she prefer tea always',
    hint: 'Subject–verb agreement',
    tone: 'casual',
  },
  {
    id: 'p6',
    rough: 'we discuss about the budget in last meeting already',
    hint: 'Drop unnecessary words; fix tense',
    tone: 'concise',
  },
];

export function pickPracticePrompt(
  excludeId?: string,
): PracticePrompt {
  const pool = excludeId
    ? PRACTICE_PROMPTS.filter(p => p.id !== excludeId)
    : PRACTICE_PROMPTS;
  const list = pool.length > 0 ? pool : PRACTICE_PROMPTS;
  return list[Math.floor(Math.random() * list.length)];
}

export type {ToneId};

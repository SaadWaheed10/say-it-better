import {TestPack} from '../types';

export const TEST_PACKS: TestPack[] = [
  {
    id: 'mixed-10',
    title: 'Quick check',
    subtitle: '10 random · mixed skills',
    description:
      'A fresh mix of multiple-choice and short rewrites every time you start.',
    totalQuestions: 10,
    mcqCount: 8,
    writtenCount: 2,
    difficulty: 'all',
    accent: 'teal',
  },
  {
    id: 'easy-start',
    title: 'Easy start',
    subtitle: '10 easy questions · build confidence',
    description: 'Shorter grammar and clarity items for a gentle warm-up.',
    totalQuestions: 10,
    mcqCount: 9,
    writtenCount: 1,
    difficulty: 'easy',
    accent: 'teal',
  },
  {
    id: 'grammar-focus',
    title: 'Grammar focus',
    subtitle: '10 random grammar & wording',
    description: 'Drawn from a large pool so repeats stay rare.',
    totalQuestions: 10,
    mcqCount: 9,
    writtenCount: 1,
    skillFilter: ['grammar', 'word-choice'],
    difficulty: 'all',
    accent: 'amber',
  },
  {
    id: 'workplace',
    title: 'Workplace English',
    subtitle: '10 clarity & tone items',
    description: 'Emails, follow-ups, and polite asks — reshuffled each run.',
    totalQuestions: 10,
    mcqCount: 7,
    writtenCount: 3,
    skillFilter: ['clarity', 'tone'],
    difficulty: 'medium',
    accent: 'rose',
  },
  {
    id: 'travel',
    title: 'Travel English',
    subtitle: 'Hotels, airports, restaurants',
    description: 'Practical phrases for trips — random each attempt.',
    totalQuestions: 8,
    mcqCount: 6,
    writtenCount: 2,
    skillFilter: ['travel', 'clarity', 'tone'],
    difficulty: 'all',
    accent: 'amber',
  },
  {
    id: 'interview',
    title: 'Interview prep',
    subtitle: 'Confident workplace answers',
    description: 'Practice interview tone and clarity under light pressure.',
    totalQuestions: 8,
    mcqCount: 6,
    writtenCount: 2,
    skillFilter: ['interview', 'tone', 'clarity'],
    difficulty: 'medium',
    timedSeconds: 8 * 60,
    accent: 'rose',
  },
  {
    id: 'timed-sprint',
    title: 'Timed sprint',
    subtitle: '8 min · mixed MCQ + written',
    description: 'Optional timer on — finish before the clock runs out.',
    totalQuestions: 10,
    mcqCount: 8,
    writtenCount: 2,
    difficulty: 'all',
    timedSeconds: 8 * 60,
    accent: 'teal',
  },
  {
    id: 'mcq-only',
    title: 'MCQ only',
    subtitle: 'Works even if the model is loading',
    description: 'Pure multiple-choice — no written grading required.',
    totalQuestions: 10,
    mcqCount: 10,
    writtenCount: 0,
    difficulty: 'all',
    accent: 'amber',
  },
];

export function getTestPack(id: string): TestPack | undefined {
  return TEST_PACKS.find(pack => pack.id === id);
}

export function packForSkill(skill: string): string {
  if (skill === 'grammar' || skill === 'word-choice') {
    return 'grammar-focus';
  }
  if (skill === 'travel') {
    return 'travel';
  }
  if (skill === 'interview') {
    return 'interview';
  }
  if (skill === 'clarity' || skill === 'tone') {
    return 'workplace';
  }
  return 'mixed-10';
}

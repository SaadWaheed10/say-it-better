import {TestPack} from '../types';

export const TEST_PACKS: TestPack[] = [
  {
    id: 'daily',
    title: 'Daily challenge',
    subtitle: 'Same random set all day · resets tomorrow',
    description: 'A seeded daily mix so you can compare with yourself tomorrow.',
    totalQuestions: 10,
    mcqCount: 6,
    writtenCount: 1,
    fillCount: 2,
    listeningCount: 1,
    difficulty: 'all',
    isDaily: true,
    accent: 'teal',
  },
  {
    id: 'placement',
    title: 'Placement test',
    subtitle: 'Find your starting level',
    description: 'A short mixed set that recommends Easy, Medium, or Hard next.',
    totalQuestions: 8,
    mcqCount: 5,
    writtenCount: 1,
    fillCount: 1,
    listeningCount: 1,
    difficulty: 'all',
    isPlacement: true,
    accent: 'amber',
  },
  {
    id: 'mixed-10',
    title: 'Quick check',
    subtitle: '10 random · mixed skills',
    description:
      'A fresh mix of multiple-choice, fill-in, listening, and rewrites.',
    totalQuestions: 10,
    mcqCount: 5,
    writtenCount: 2,
    fillCount: 2,
    listeningCount: 1,
    difficulty: 'all',
    accent: 'teal',
  },
  {
    id: 'easy-start',
    title: 'Easy start',
    subtitle: '10 easy questions · build confidence',
    description: 'Gentle grammar and clarity items for a warm-up.',
    totalQuestions: 10,
    mcqCount: 7,
    writtenCount: 1,
    fillCount: 2,
    difficulty: 'easy',
    accent: 'teal',
  },
  {
    id: 'hard-mode',
    title: 'Hard mode',
    subtitle: 'Advanced grammar, tone & clarity',
    description: 'Tougher items for confident writers.',
    totalQuestions: 10,
    mcqCount: 5,
    writtenCount: 2,
    fillCount: 2,
    listeningCount: 1,
    difficulty: 'hard',
    accent: 'rose',
  },
  {
    id: 'grammar-focus',
    title: 'Grammar focus',
    subtitle: '10 random grammar & wording',
    description: 'Drawn from a large pool so repeats stay rare.',
    totalQuestions: 10,
    mcqCount: 6,
    writtenCount: 1,
    fillCount: 3,
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
    mcqCount: 5,
    writtenCount: 2,
    fillCount: 2,
    listeningCount: 1,
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
    mcqCount: 4,
    writtenCount: 1,
    fillCount: 2,
    listeningCount: 1,
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
    mcqCount: 4,
    writtenCount: 1,
    fillCount: 2,
    listeningCount: 1,
    skillFilter: ['interview', 'tone', 'clarity'],
    difficulty: 'medium',
    timedSeconds: 8 * 60,
    accent: 'rose',
  },
  {
    id: 'timed-sprint',
    title: 'Timed sprint',
    subtitle: '8 min · mixed types',
    description: 'Timer on — pause anytime and resume later.',
    totalQuestions: 10,
    mcqCount: 5,
    writtenCount: 2,
    fillCount: 2,
    listeningCount: 1,
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

export function packForDifficulty(
  difficulty: 'easy' | 'medium' | 'hard',
): string {
  if (difficulty === 'easy') {
    return 'easy-start';
  }
  if (difficulty === 'hard') {
    return 'hard-mode';
  }
  return 'mixed-10';
}

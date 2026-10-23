import type {NavigatorScreenParams} from '@react-navigation/native';

export type ToneId =
  | 'professional'
  | 'friendly'
  | 'polite'
  | 'confident'
  | 'casual'
  | 'concise';

export type ToneOption = {
  id: ToneId;
  label: string;
  description: string;
  icon: string;
};

export type ThemePreference = 'light' | 'dark' | 'system';

export type ModelStatus =
  | 'idle'
  | 'checking'
  | 'missing'
  | 'loading'
  | 'ready'
  | 'error';

export type ModelState = {
  status: ModelStatus;
  message: string;
  detail?: string;
  path?: string;
};

export type ImproveRequest = {
  message: string;
  tone: ToneId;
  instruction?: string;
};

export type ImproveResult = {
  improved: string;
  alternatives: string[];
  tone: ToneId;
  original: string;
  createdAt: number;
};

export type HistoryItem = {
  id: string;
  original: string;
  improved: string;
  alternatives: string[];
  tone: ToneId;
  createdAt: number;
  isFavorite?: boolean;
};

export type LibraryItem = {
  id: string;
  text: string;
  original?: string;
  tone?: ToneId;
  sourceHistoryId?: string;
  createdAt: number;
};

export type TemplateSituation = {
  id: string;
  title: string;
  subtitle: string;
  example: string;
  instruction: string;
  tone: ToneId;
  accent: 'teal' | 'amber' | 'rose';
};

export type PracticePrompt = {
  id: string;
  rough: string;
  hint: string;
  tone: ToneId;
};

export type TestSkill =
  | 'grammar'
  | 'word-choice'
  | 'clarity'
  | 'tone'
  | 'travel'
  | 'interview';

export type TestDifficulty = 'easy' | 'medium' | 'hard';

export type WrittenTipTag =
  | 'tense'
  | 'word-order'
  | 'tone'
  | 'article'
  | 'agreement'
  | 'clarity'
  | 'word-choice';

export type McqQuestion = {
  id: string;
  skill: TestSkill;
  /** Defaults to medium when omitted */
  difficulty?: TestDifficulty;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type WrittenQuestion = {
  id: string;
  skill: TestSkill;
  difficulty?: TestDifficulty;
  prompt: string;
  rough: string;
  hint: string;
  tone: ToneId;
  tipTag?: WrittenTipTag;
};

export type FillBlankQuestion = {
  id: string;
  skill: TestSkill;
  difficulty?: TestDifficulty;
  prompt: string;
  /** Sentence with _____ for the blank */
  sentence: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type ListeningQuestion = {
  id: string;
  skill: TestSkill;
  difficulty?: TestDifficulty;
  prompt: string;
  /** Spoken by on-device TTS */
  speakText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type TestQuestion =
  | ({kind: 'mcq'} & McqQuestion)
  | ({kind: 'written'} & WrittenQuestion)
  | ({kind: 'fill'} & FillBlankQuestion)
  | ({kind: 'listening'} & ListeningQuestion);

export type TestPack = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  totalQuestions: number;
  mcqCount: number;
  writtenCount: number;
  fillCount?: number;
  listeningCount?: number;
  skillFilter?: TestSkill[];
  difficulty?: TestDifficulty | 'all';
  timedSeconds?: number;
  accent: 'teal' | 'amber' | 'rose';
  isPlacement?: boolean;
  isDaily?: boolean;
};

export type TestAnswerRecord = {
  questionId: string;
  kind: 'mcq' | 'written' | 'fill' | 'listening';
  skill: TestSkill;
  earned: number;
  max: number;
  userMcqIndex?: number;
  userWritten?: string;
  modelAnswer?: string;
  explanation?: string;
  tipTag?: WrittenTipTag;
  correct?: boolean;
};

export type SkillScoreBreakdown = {
  skill: TestSkill;
  earned: number;
  max: number;
  percent: number;
};

export type TestAttempt = {
  id: string;
  packId: string;
  packTitle: string;
  score: number;
  maxScore: number;
  answers: TestAnswerRecord[];
  weakSkills: TestSkill[];
  skillBreakdown: SkillScoreBreakdown[];
  suggestions: string[];
  questionIds: string[];
  createdAt: number;
  timed?: boolean;
  mcqOnly?: boolean;
  difficulty?: TestDifficulty | 'all';
  isDaily?: boolean;
  isPlacement?: boolean;
};

export type PausedTestSession = {
  packId: string;
  packTitle: string;
  questions: TestQuestion[];
  answers: TestAnswerRecord[];
  index: number;
  secondsLeft: number | null;
  timed: boolean;
  mcqOnly: boolean;
  difficulty?: TestDifficulty | 'all';
  questionCount?: number;
  savedAt: number;
};

export type TestBadgeId =
  | 'first-test'
  | 'streak-3'
  | 'streak-7'
  | 'perfect-10'
  | 'grammar-i'
  | 'grammar-ii'
  | 'workplace-pro'
  | 'comeback';

export type TestBadge = {
  id: TestBadgeId;
  title: string;
  description: string;
  unlockedAt?: number;
};

export type TestProgressSnapshot = {
  attempts: TestAttempt[];
  streakDays: number;
  bestByPack: Record<string, number>;
  badges: TestBadge[];
  allBadges: TestBadge[];
  todayDone: boolean;
  dailyChallengeDone: boolean;
  recommendedPackId: string;
  adaptiveDifficulty: TestDifficulty;
  placementDone: boolean;
  pausedSession: PausedTestSession | null;
};

export type AppSettings = {
  defaultTone: ToneId;
  themePreference: ThemePreference;
  onboardingCompleted: boolean;
  modelPathOverride?: string;
  improveTipDismissed?: boolean;
  dailyTestReminder?: boolean;
};

export type MainTabParamList = {
  Home: undefined;
  Templates: undefined;
  Tests: undefined;
  History: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ImproveMessage:
    | {
        tone?: ToneId;
        message?: string;
        instruction?: string;
        templateId?: string;
      }
    | undefined;
  Results: {
    original: string;
    improved: string;
    alternatives: string[];
    tone: ToneId;
    historyId?: string;
  };
  Practice: undefined;
  Library: undefined;
  About: undefined;
  TestRunner: {
    packId: string;
    timed?: boolean;
    mcqOnly?: boolean;
    difficulty?: TestDifficulty | 'all';
    mistakeQuestionIds?: string[];
    questionCount?: 5 | 10 | 15;
    resume?: boolean;
    isDaily?: boolean;
  };
  TestResults: {attemptId: string};
  TestBadges: undefined;
};

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingTone: undefined;
};

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

export type AppSettings = {
  defaultTone: ToneId;
  themePreference: ThemePreference;
  onboardingCompleted: boolean;
  modelPathOverride?: string;
  improveTipDismissed?: boolean;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
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
};

export type MainTabParamList = {
  Home: undefined;
  Templates: undefined;
  History: undefined;
  Settings: undefined;
};

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingTone: undefined;
};

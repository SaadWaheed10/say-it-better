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
};

export type AppSettings = {
  defaultTone: ToneId;
  themePreference: ThemePreference;
  onboardingCompleted: boolean;
  modelPathOverride?: string;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  ImproveMessage: {tone?: ToneId; message?: string} | undefined;
  Results: {
    original: string;
    improved: string;
    alternatives: string[];
    tone: ToneId;
    historyId?: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingTone: undefined;
};

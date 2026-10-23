import AsyncStorage from '@react-native-async-storage/async-storage';
import {DEFAULT_TONE} from '../constants/tones';
import {STORAGE_KEYS} from '../constants/storage';
import {AppSettings, ThemePreference, ToneId} from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  defaultTone: DEFAULT_TONE,
  themePreference: 'dark',
  onboardingCompleted: false,
};

function isToneId(value: unknown): value is ToneId {
  return (
    value === 'professional' ||
    value === 'friendly' ||
    value === 'polite' ||
    value === 'confident' ||
    value === 'casual' ||
    value === 'concise'
  );
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function normalizeSettings(raw: Partial<AppSettings> | null): AppSettings {
  if (!raw) {
    return {...DEFAULT_SETTINGS};
  }

  return {
    defaultTone: isToneId(raw.defaultTone)
      ? raw.defaultTone
      : DEFAULT_SETTINGS.defaultTone,
    themePreference: isThemePreference(raw.themePreference)
      ? raw.themePreference
      : DEFAULT_SETTINGS.themePreference,
    onboardingCompleted: Boolean(raw.onboardingCompleted),
    modelPathOverride:
      typeof raw.modelPathOverride === 'string'
        ? raw.modelPathOverride
        : undefined,
    improveTipDismissed: Boolean(raw.improveTipDismissed),
    dailyTestReminder: Boolean(raw.dailyTestReminder),
  };
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const [settingsJson, onboardingFlag] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.settings),
      AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted),
    ]);

    const parsed = settingsJson ? (JSON.parse(settingsJson) as AppSettings) : null;
    const settings = normalizeSettings(parsed);

    if (onboardingFlag === 'true') {
      settings.onboardingCompleted = true;
    }

    return settings;
  } catch {
    return {...DEFAULT_SETTINGS};
  }
}

export async function saveSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  const current = await getSettings();
  const next = normalizeSettings({...current, ...patch});

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
    if (typeof patch.onboardingCompleted === 'boolean') {
      await AsyncStorage.setItem(
        STORAGE_KEYS.onboardingCompleted,
        patch.onboardingCompleted ? 'true' : 'false',
      );
    }
  } catch {
    // Persist failures should not crash the UI.
  }

  return next;
}

export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted);
    if (value === 'true') {
      return true;
    }
    const settings = await getSettings();
    return settings.onboardingCompleted;
  } catch {
    return false;
  }
}

export async function markOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, 'true');
    await saveSettings({onboardingCompleted: true});
  } catch {
    // Ignore storage failures; navigation can still proceed.
  }
}

export {DEFAULT_SETTINGS};

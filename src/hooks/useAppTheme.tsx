import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useColorScheme} from 'react-native';
import {createTheme, AppTheme, ThemeMode} from '../theme';
import {useResponsiveThemeTokens} from '../theme/useResponsiveThemeTokens';
import {getSettings, saveSettings} from '../services/settingsService';

type ThemeContextValue = AppTheme & {
  themePreference: ThemeMode;
  setThemePreference: (mode: ThemeMode) => Promise<void>;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const systemScheme = useColorScheme();
  const {typography, spacing, radii} = useResponsiveThemeTokens();
  const [themePreference, setThemePreferenceState] =
    useState<ThemeMode>('light');
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSettings()
      .then(settings => {
        if (mounted) {
          setThemePreferenceState(settings.themePreference);
          setReduceMotionState(Boolean(settings.reduceMotion));
        }
      })
      .finally(() => {
        if (mounted) {
          setReady(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isDark = useMemo(() => {
    if (themePreference === 'system') {
      return systemScheme === 'dark';
    }
    return themePreference === 'dark';
  }, [themePreference, systemScheme]);

  const theme = useMemo(() => {
    const base = createTheme(isDark);
    return {
      ...base,
      typography,
      spacing,
      radii,
    };
  }, [isDark, typography, spacing, radii]);

  const setThemePreference = useCallback(async (mode: ThemeMode) => {
    setThemePreferenceState(mode);
    await saveSettings({themePreference: mode});
  }, []);

  const setReduceMotion = useCallback(async (enabled: boolean) => {
    setReduceMotionState(enabled);
    await saveSettings({reduceMotion: enabled});
  }, []);

  const value = useMemo(
    () => ({
      ...theme,
      themePreference,
      setThemePreference,
      reduceMotion,
      setReduceMotion,
    }),
    [theme, themePreference, reduceMotion, setThemePreference, setReduceMotion],
  );

  if (!ready) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return ctx;
}

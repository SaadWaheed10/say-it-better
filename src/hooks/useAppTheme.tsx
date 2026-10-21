import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useColorScheme} from 'react-native';
import {createTheme, AppTheme, ThemeMode} from '../theme';
import {getSettings, saveSettings} from '../services/settingsService';

type ThemeContextValue = AppTheme & {
  themePreference: ThemeMode;
  setThemePreference: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSettings()
      .then(settings => {
        if (mounted) {
          setThemePreferenceState(settings.themePreference);
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

  const theme = useMemo(() => createTheme(isDark), [isDark]);

  const setThemePreference = async (mode: ThemeMode) => {
    setThemePreferenceState(mode);
    await saveSettings({themePreference: mode});
  };

  const value = useMemo(
    () => ({
      ...theme,
      themePreference,
      setThemePreference,
    }),
    [theme, themePreference],
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

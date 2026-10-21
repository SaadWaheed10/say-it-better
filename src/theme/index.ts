import {lightColors, darkColors, AppColors} from './colors';
import {radii, spacing} from './spacing';
import {typography} from './typography';

export type ThemeMode = 'light' | 'dark' | 'system';

export type AppTheme = {
  colors: AppColors | typeof darkColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  isDark: boolean;
};

export function createTheme(isDark: boolean): AppTheme {
  return {
    colors: (isDark ? darkColors : lightColors) as AppTheme['colors'],
    spacing,
    radii,
    typography,
    isDark,
  };
}

export {lightColors, darkColors, spacing, radii, typography};
export type {AppColors};

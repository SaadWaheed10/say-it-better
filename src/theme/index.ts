import {TextStyle} from 'react-native';
import {lightColors, darkColors, AppColors} from './colors';
import {radii, spacing} from './spacing';
import {typography} from './typography';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeSpacing = {[K in keyof typeof spacing]: number};
export type ThemeRadii = {[K in keyof typeof radii]: number};
export type ThemeTypography = {
  [K in keyof typeof typography]: TextStyle;
};

export type AppTheme = {
  colors: AppColors | typeof darkColors;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  typography: ThemeTypography;
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

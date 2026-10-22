/**
 * SayItBetter visual system — dark-first “noir jewel”
 * Charcoal base + teal / amber / rose accents (not purple-indigo).
 */
export const lightColors = {
  primaryNavy: '#14201C',
  primaryAccent: '#0F9B82',
  accentWarm: '#C4892E',
  accentRose: '#C45B6E',
  background: '#F6F4EF',
  secondaryBackground: '#EEEAE2',
  canvas: '#F3F0EA',
  canvasDeep: '#E5E0D6',
  surface: 'rgba(255, 255, 255, 0.82)',
  surfaceSolid: '#FFFFFF',
  surfaceMuted: 'rgba(255, 255, 255, 0.62)',
  accentWash: 'rgba(15, 155, 130, 0.12)',
  warmWash: 'rgba(196, 137, 46, 0.12)',
  roseWash: 'rgba(196, 91, 110, 0.10)',
  navyWash: 'rgba(20, 32, 28, 0.06)',
  lavender: '#D9EFE9',
  lavenderSoft: '#EAF6F2',
  primaryText: '#14201C',
  secondaryText: '#5C655F',
  border: '#DDD6CB',
  borderSoft: 'rgba(20, 32, 28, 0.08)',
  success: '#168653',
  successSoft: '#E5F6EE',
  error: '#C0392B',
  errorSoft: '#FDECEC',
  white: '#FFFFFF',
  black: '#000000',
  cardShadow: 'rgba(20, 32, 28, 0.08)',
  overlay: 'rgba(20, 32, 28, 0.45)',
  tabInactive: '#8A918B',
  tabBarBg: 'rgba(255, 255, 255, 0.92)',
  tabActiveBg: 'rgba(15, 155, 130, 0.14)',
  gradientTop: '#E8F5F1',
  gradientMid: '#F3F0EA',
  gradientBottom: '#FBF8F3',
} as const;

export const darkColors = {
  /** Brand mark / icon stroke on dark */
  primaryNavy: '#F3EEE6',
  /** Primary interactive — teal */
  primaryAccent: '#3DDCB8',
  /** Warm jewel */
  accentWarm: '#E8B86D',
  /** Soft rose jewel */
  accentRose: '#F0718A',
  background: '#07090F',
  secondaryBackground: '#10141C',
  canvas: '#07090F',
  canvasDeep: '#05060A',
  surface: 'rgba(18, 22, 30, 0.88)',
  surfaceSolid: '#12161E',
  surfaceMuted: 'rgba(18, 22, 30, 0.72)',
  accentWash: 'rgba(61, 220, 184, 0.14)',
  warmWash: 'rgba(232, 184, 109, 0.14)',
  roseWash: 'rgba(240, 113, 138, 0.12)',
  navyWash: 'rgba(243, 238, 230, 0.06)',
  lavender: '#1A2430',
  lavenderSoft: '#151B26',
  primaryText: '#F5F2EC',
  secondaryText: '#9AA3AE',
  border: '#243040',
  borderSoft: 'rgba(243, 238, 230, 0.08)',
  success: '#3DDCB8',
  successSoft: '#0F2A24',
  error: '#F0718A',
  errorSoft: '#2A1218',
  white: '#FFFFFF',
  black: '#000000',
  cardShadow: 'rgba(0, 0, 0, 0.45)',
  overlay: 'rgba(0, 0, 0, 0.62)',
  tabInactive: '#6E7886',
  tabBarBg: 'rgba(12, 15, 22, 0.94)',
  tabActiveBg: 'rgba(61, 220, 184, 0.16)',
  gradientTop: '#0C1520',
  gradientMid: '#0A0E16',
  gradientBottom: '#07090F',
} as const;

export type AppColors = typeof lightColors;

export const brandNavy = '#14201C';
export const brandLavender = '#3DDCB8';

/** Multi-stop gradients for LinearGradient (dark-first). */
export const darkGradientHero = ['#1A3A34', '#3DDCB8', '#E8B86D'] as const;
export const darkGradientTab = ['#12161E', '#0E1620', '#15101A'] as const;
export const darkBackdropOrbs = {
  teal: 'rgba(61, 220, 184, 0.28)',
  amber: 'rgba(232, 184, 109, 0.22)',
  rose: 'rgba(240, 113, 138, 0.18)',
  mist: 'rgba(36, 48, 64, 0.55)',
} as const;

export const lightGradientHero = ['#0F9B82', '#C4892E'] as const;
export const lightBackdropOrbs = {
  teal: 'rgba(15, 155, 130, 0.22)',
  amber: 'rgba(196, 137, 46, 0.18)',
  rose: 'rgba(196, 91, 110, 0.14)',
  mist: 'rgba(217, 239, 233, 0.7)',
} as const;

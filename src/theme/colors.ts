export const lightColors = {
  primaryNavy: '#202653',
  primaryAccent: '#5054D8',
  background: '#FFFFFF',
  secondaryBackground: '#F7F7FC',
  lavender: '#E6E8FF',
  lavenderSoft: '#F0F1FF',
  primaryText: '#171A2E',
  secondaryText: '#74778C',
  border: '#E7E8F0',
  success: '#168653',
  successSoft: '#E8F6EF',
  error: '#C62828',
  errorSoft: '#FDECEC',
  white: '#FFFFFF',
  black: '#000000',
  cardShadow: 'rgba(32, 38, 83, 0.08)',
  overlay: 'rgba(23, 26, 46, 0.45)',
  tabInactive: '#9AA0B5',
} as const;

export const darkColors = {
  primaryNavy: '#E8EAF5',
  primaryAccent: '#7B7FE8',
  background: '#12141F',
  secondaryBackground: '#1A1D2E',
  lavender: '#2A2E4A',
  lavenderSoft: '#22263A',
  primaryText: '#F2F3F8',
  secondaryText: '#A0A4B8',
  border: '#2E3348',
  success: '#3DCA8A',
  successSoft: '#163528',
  error: '#EF6A6A',
  errorSoft: '#3A1C1C',
  white: '#FFFFFF',
  black: '#000000',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
  overlay: 'rgba(0, 0, 0, 0.55)',
  tabInactive: '#6E748A',
} as const;

export type AppColors = typeof lightColors;

export const brandNavy = '#202653';
export const brandLavender = '#E6E8FF';

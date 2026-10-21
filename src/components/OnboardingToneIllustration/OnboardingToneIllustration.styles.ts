import {useScaledStyles} from '../../theme/useScaledStyles';

export function useOnboardingToneIllustrationStyles() {
  return useScaledStyles(() => ({
    wrap: {
      width: '100%' as const,
      alignItems: 'center' as const,
    },
    card: {
      width: '100%' as const,
      maxWidth: 320,
    },
    messageCard: {
      borderWidth: 1,
      padding: 16,
      gap: 10,
    },
    line: {
      height: 8,
      borderRadius: 4,
    },
    chipRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
    },
    chip: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
  }));
}

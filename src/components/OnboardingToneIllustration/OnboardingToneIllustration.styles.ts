import {useScaledStyles, rp, rm, rr} from '../../theme/useScaledStyles';

export function useOnboardingToneIllustrationStyles() {
  return useScaledStyles(() => ({
    wrap: {
      width: '100%' as const,
      alignItems: 'center' as const,
    },
    card: {
      width: '100%' as const,
      maxWidth: rp(320),
      borderRadius: rr(22),
      padding: rp(16),
    },
    messageCard: {
      borderWidth: 1,
      padding: rp(16),
      gap: rp(10),
      borderRadius: rr(18),
      marginBottom: rm(12),
    },
    line: {
      height: rp(8),
      borderRadius: rr(4),
    },
    chipRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: rp(8),
    },
    chip: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
      paddingHorizontal: rp(10),
      paddingVertical: rp(7),
      borderRadius: rr(999),
    },
    chipLabel: {
      marginLeft: rm(6),
      fontWeight: '600' as const,
    },
  }));
}

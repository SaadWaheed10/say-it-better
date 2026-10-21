import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useEmptyStateStyles() {
  return useScaledStyles(() => ({
    wrap: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: rp(24),
      borderRadius: rr(22),
      borderWidth: 1,
    },
    title: {
      fontSize: rf(18),
      fontWeight: '600' as const,
      lineHeight: rl(24),
      textAlign: 'center' as const,
    },
    description: {
      fontSize: rf(16),
      lineHeight: rl(24),
      textAlign: 'center' as const,
      marginTop: rm(12),
    },
  }));
}

import {useScaledStyles, rp, rr, rf, rl} from '../../theme/useScaledStyles';

export function useAppButtonStyles() {
  return useScaledStyles(() => ({
    base: {
      minHeight: rp(52),
      borderRadius: rr(18),
      overflow: 'hidden' as const,
    },
    gradientFill: {
      flex: 1,
      minHeight: rp(52),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: rp(22),
      borderRadius: rr(18),
    },
    solid: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: rp(22),
    },
    label: {
      fontSize: rf(16),
      fontWeight: '700' as const,
      lineHeight: rl(22),
      letterSpacing: 0.2,
    },
  }));
}

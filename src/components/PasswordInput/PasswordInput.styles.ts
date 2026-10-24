import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function usePasswordInputStyles() {
  return useScaledStyles(() => ({
    wrap: {
      borderWidth: 1,
      borderRadius: rr(14),
      marginBottom: rm(14),
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingRight: rp(4),
    },
    input: {
      flex: 1,
      paddingHorizontal: rp(14),
      paddingVertical: rp(12),
      fontSize: rf(16),
      lineHeight: rl(22),
    },
    eyeHit: {
      width: rp(44),
      height: rp(44),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  }));
}

import {useScaledStyles, rp, rm, rf, rl} from '../../theme/useScaledStyles';

export function useLoadingViewStyles() {
  return useScaledStyles(() => ({
    wrap: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: rp(24),
    },
    message: {
      fontSize: rf(16),
      lineHeight: rl(24),
      marginTop: rm(16),
      textAlign: 'center' as const,
    },
  }));
}

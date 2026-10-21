import {useScaledStyles, rp, rm, rf, rl} from '../../theme/useScaledStyles';

export function useSplashScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    content: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: rp(24),
    },
    brand: {
      fontSize: rf(34),
      fontWeight: '800' as const,
      letterSpacing: -0.8,
      marginTop: rm(16),
      textAlign: 'center' as const,
    },
    tagline: {
      fontSize: rf(16),
      lineHeight: rl(24),
      marginTop: rm(8),
      textAlign: 'center' as const,
    },
    loader: {
      marginBottom: rm(32),
    },
  }));
}

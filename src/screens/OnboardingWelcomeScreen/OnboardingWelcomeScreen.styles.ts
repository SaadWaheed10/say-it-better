import {useScaledStyles, rp, rm, rf, rl} from '../../theme/useScaledStyles';

export function useOnboardingWelcomeScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    content: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: rp(24),
    },
    brand: {
      fontSize: rf(28),
      fontWeight: '800' as const,
      letterSpacing: -0.6,
      marginTop: rm(12),
    },
    tagline: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(4),
    },
    illustration: {
      marginVertical: rm(24),
    },
    title: {
      fontSize: rf(28),
      fontWeight: '700' as const,
      letterSpacing: -0.4,
      lineHeight: rl(36),
      textAlign: 'center' as const,
    },
    body: {
      fontSize: rf(16),
      lineHeight: rl(24),
      textAlign: 'center' as const,
      marginTop: rm(12),
    },
    footer: {
      paddingHorizontal: rp(24),
      paddingBottom: rp(8),
    },
    actions: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      gap: rp(12),
      marginTop: rm(20),
    },
    skip: {
      minWidth: rp(88),
      paddingHorizontal: rp(8),
    },
    continue: {
      flex: 1,
    },
  }));
}

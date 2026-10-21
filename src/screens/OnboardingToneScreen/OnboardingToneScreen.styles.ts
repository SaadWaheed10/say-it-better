import {useScaledStyles, rp, rm, rf, rl} from '../../theme/useScaledStyles';

export function useOnboardingToneScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    content: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: rp(24),
    },
    illustration: {
      width: '100%' as const,
      marginBottom: rm(24),
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
      justifyContent: 'space-between' as const,
      marginTop: rm(20),
    },
    sideButton: {
      minWidth: rp(88),
      paddingHorizontal: rp(8),
    },
    primaryCta: {
      marginTop: rm(12),
    },
  }));
}

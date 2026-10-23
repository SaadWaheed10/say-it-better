import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useOnboardingModesScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    content: {
      flex: 1,
      paddingHorizontal: rp(24),
      justifyContent: 'center' as const,
    },
    title: {
      fontSize: rf(26),
      fontWeight: '700' as const,
      letterSpacing: -0.4,
      lineHeight: rl(34),
      textAlign: 'center' as const,
    },
    body: {
      fontSize: rf(15),
      lineHeight: rl(22),
      textAlign: 'center' as const,
      marginTop: rm(10),
      marginBottom: rm(20),
    },
    demoCard: {
      borderWidth: 1,
      borderRadius: rr(18),
      padding: rp(14),
      marginBottom: rm(12),
    },
    demoTitle: {
      fontSize: rf(15),
      fontWeight: '700' as const,
      marginBottom: rm(4),
    },
    demoBody: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(12),
    },
    demoPrompt: {
      fontSize: rf(14),
      lineHeight: rl(20),
      fontStyle: 'italic' as const,
      marginBottom: rm(12),
    },
    status: {
      fontSize: rf(12),
      marginTop: rm(8),
      textAlign: 'center' as const,
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
      minHeight: rp(52),
    },
  }));
}

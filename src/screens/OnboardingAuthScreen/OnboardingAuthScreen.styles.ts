import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useOnboardingAuthScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    content: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: rp(24),
    },
    brandRow: {
      alignItems: 'center' as const,
      marginBottom: rm(8),
    },
    brand: {
      fontSize: rf(22),
      fontWeight: '800' as const,
      letterSpacing: -0.5,
      marginTop: rm(8),
    },
    brandUnderline: {
      width: rp(48),
      height: rp(3),
      borderRadius: rr(2),
      marginTop: rm(8),
    },
    illustration: {
      width: '100%' as const,
      marginVertical: rm(18),
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
      gap: rp(12),
      marginTop: rm(16),
    },
    sideButton: {
      flex: 1,
      minWidth: rp(88),
    },
    primaryCta: {
      marginTop: rm(10),
    },
    ghostCta: {
      marginTop: rm(4),
    },
  }));
}

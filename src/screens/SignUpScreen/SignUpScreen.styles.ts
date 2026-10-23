import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useSignUpScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {flex: 1, paddingHorizontal: rp(20)},
    scrollContent: {paddingBottom: rp(40), flexGrow: 1},
    hero: {
      alignItems: 'center' as const,
      marginBottom: rm(20),
      marginTop: rm(4),
    },
    brand: {
      fontSize: rf(26),
      fontWeight: '800' as const,
      letterSpacing: -0.5,
      marginTop: rm(10),
    },
    brandUnderline: {
      width: rp(52),
      height: rp(3),
      borderRadius: rr(2),
      marginTop: rm(8),
    },
    title: {
      fontSize: rf(22),
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      lineHeight: rl(28),
      marginTop: rm(18),
      textAlign: 'center' as const,
    },
    lead: {
      fontSize: rf(14),
      lineHeight: rl(20),
      textAlign: 'center' as const,
      marginTop: rm(8),
      marginBottom: rm(8),
    },
    formCard: {
      borderWidth: 1,
      borderRadius: rr(22),
      padding: rp(16),
      marginTop: rm(8),
    },
    label: {
      fontSize: rf(13),
      fontWeight: '700' as const,
      marginBottom: rm(6),
      letterSpacing: 0.2,
    },
    input: {
      borderWidth: 1,
      borderRadius: rr(14),
      paddingHorizontal: rp(14),
      paddingVertical: rp(12),
      fontSize: rf(16),
      lineHeight: rl(22),
      marginBottom: rm(14),
    },
    error: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(10),
    },
    hint: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(10),
    },
    actions: {
      marginTop: rm(4),
      gap: rm(10),
    },
    switchRow: {
      marginTop: rm(22),
      alignItems: 'center' as const,
    },
    switchText: {
      fontSize: rf(14),
      lineHeight: rl(20),
    },
    switchLink: {
      fontWeight: '700' as const,
    },
  }));
}

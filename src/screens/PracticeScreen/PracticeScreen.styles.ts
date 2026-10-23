import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function usePracticeScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
    },
    scrollContent: {
      paddingBottom: rp(48),
      flexGrow: 1,
    },
    lead: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginBottom: rm(16),
    },
    promptCard: {
      borderWidth: 1,
      borderRadius: rr(20),
      padding: rp(16),
      marginBottom: rm(16),
    },
    promptLabel: {
      fontSize: rf(11),
      fontWeight: '700' as const,
      letterSpacing: 0.6,
      marginBottom: rm(8),
    },
    promptText: {
      fontSize: rf(17),
      fontWeight: '500' as const,
      lineHeight: rl(26),
      fontStyle: 'italic' as const,
    },
    hint: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(10),
    },
    sectionTitle: {
      fontSize: rf(16),
      fontWeight: '600' as const,
      lineHeight: rl(22),
      marginBottom: rm(10),
    },
    input: {
      borderWidth: 1,
      minHeight: rp(100),
      borderRadius: rr(18),
      padding: rp(14),
      fontSize: rf(16),
      lineHeight: rl(24),
      textAlignVertical: 'top' as const,
      marginBottom: rm(16),
    },
    compareCard: {
      borderWidth: 1,
      borderRadius: rr(18),
      padding: rp(14),
      marginTop: rm(16),
    },
    compareLabel: {
      fontSize: rf(11),
      fontWeight: '700' as const,
      letterSpacing: 0.5,
      marginBottom: rm(6),
    },
    compareText: {
      fontSize: rf(15),
      lineHeight: rl(22),
    },
    actions: {
      marginTop: rm(8),
      gap: rm(10),
    },
    error: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(10),
    },
  }));
}

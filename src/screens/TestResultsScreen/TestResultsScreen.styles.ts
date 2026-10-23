import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useTestResultsScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
    },
    scrollContent: {paddingBottom: rp(40)},
    scoreHero: {
      borderWidth: 1,
      borderRadius: rr(22),
      padding: rp(20),
      alignItems: 'center' as const,
      marginBottom: rm(18),
    },
    scoreLabel: {
      fontSize: rf(13),
      fontWeight: '600' as const,
      letterSpacing: 0.4,
      marginBottom: rm(6),
    },
    scoreValue: {
      fontSize: rf(40),
      fontWeight: '800' as const,
      letterSpacing: -1,
    },
    packTitle: {
      fontSize: rf(14),
      marginTop: rm(8),
    },
    sectionTitle: {
      fontSize: rf(16),
      fontWeight: '700' as const,
      lineHeight: rl(22),
      marginBottom: rm(10),
      marginTop: rm(8),
    },
    chipRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: rp(8),
      marginBottom: rm(12),
    },
    chip: {
      paddingHorizontal: rp(10),
      paddingVertical: rp(6),
      borderRadius: rr(999),
      borderWidth: 1,
    },
    chipText: {
      fontSize: rf(12),
      fontWeight: '600' as const,
    },
    suggestion: {
      borderWidth: 1,
      borderRadius: rr(14),
      padding: rp(12),
      marginBottom: rm(8),
    },
    suggestionText: {
      fontSize: rf(14),
      lineHeight: rl(20),
    },
    answerCard: {
      borderWidth: 1,
      borderRadius: rr(16),
      padding: rp(14),
      marginBottom: rm(10),
    },
    answerMeta: {
      fontSize: rf(12),
      fontWeight: '700' as const,
      marginBottom: rm(6),
    },
    answerBody: {
      fontSize: rf(14),
      lineHeight: rl(20),
    },
    actions: {
      marginTop: rm(12),
      gap: rm(10),
    },
  }));
}

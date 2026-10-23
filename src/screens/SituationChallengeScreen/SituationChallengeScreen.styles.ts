import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useSituationChallengeScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {flex: 1, paddingHorizontal: rp(20)},
    scrollContent: {paddingBottom: rp(40)},
    lead: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginBottom: rm(12),
    },
    situation: {
      fontSize: rf(18),
      fontWeight: '700' as const,
      lineHeight: rl(24),
      marginBottom: rm(8),
    },
    starter: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(16),
    },
    input: {
      borderWidth: 1,
      borderRadius: rr(14),
      padding: rp(14),
      minHeight: rp(120),
      fontSize: rf(16),
      lineHeight: rl(22),
      textAlignVertical: 'top' as const,
      marginBottom: rm(12),
    },
    scoreCard: {
      borderWidth: 1,
      borderRadius: rr(16),
      padding: rp(16),
      marginTop: rm(16),
    },
    scoreTitle: {
      fontSize: rf(15),
      fontWeight: '700' as const,
      marginBottom: rm(6),
    },
    scoreLine: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginBottom: rm(4),
    },
    errorLine: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginTop: rm(12),
    },
    improved: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginTop: rm(8),
    },
  }));
}

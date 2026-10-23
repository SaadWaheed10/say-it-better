import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useReviewScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {flex: 1, paddingHorizontal: rp(20)},
    scrollContent: {paddingBottom: rp(40)},
    lead: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginBottom: rm(16),
    },
    card: {
      borderWidth: 1,
      borderRadius: rr(16),
      padding: rp(16),
      marginBottom: rm(12),
    },
    kind: {
      fontSize: rf(11),
      fontWeight: '700' as const,
      letterSpacing: 0.3,
      textTransform: 'uppercase' as const,
      marginBottom: rm(6),
    },
    prompt: {
      fontSize: rf(16),
      fontWeight: '600' as const,
      lineHeight: rl(22),
      marginBottom: rm(8),
    },
    hint: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(12),
    },
    actions: {
      flexDirection: 'row' as const,
      gap: rp(8),
    },
    actionBtn: {flex: 1},
  }));
}

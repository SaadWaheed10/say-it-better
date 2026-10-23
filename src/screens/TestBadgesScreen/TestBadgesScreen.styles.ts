import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useTestBadgesScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
    },
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
      marginBottom: rm(10),
    },
    title: {
      fontSize: rf(16),
      fontWeight: '700' as const,
      lineHeight: rl(22),
    },
    desc: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(6),
    },
    meta: {
      fontSize: rf(11),
      marginTop: rm(8),
    },
  }));
}

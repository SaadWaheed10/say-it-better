import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useTipsLibraryScreenStyles() {
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
    title: {
      fontSize: rf(17),
      fontWeight: '700' as const,
      marginBottom: rm(6),
    },
    summary: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginBottom: rm(10),
    },
    example: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(4),
    },
    practice: {
      fontSize: rf(12),
      lineHeight: rl(16),
      marginTop: rm(8),
      fontWeight: '600' as const,
    },
  }));
}

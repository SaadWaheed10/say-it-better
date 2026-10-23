import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useAboutScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
    },
    scrollContent: {
      paddingBottom: rp(40),
    },
    brand: {
      fontSize: rf(28),
      fontWeight: '800' as const,
      letterSpacing: -0.6,
      marginTop: rm(12),
    },
    version: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(6),
      marginBottom: rm(20),
    },
    card: {
      borderWidth: 1,
      borderRadius: rr(20),
      padding: rp(16),
      marginBottom: rm(14),
    },
    cardTitle: {
      fontSize: rf(16),
      fontWeight: '700' as const,
      lineHeight: rl(22),
      marginBottom: rm(8),
    },
    cardBody: {
      fontSize: rf(15),
      lineHeight: rl(22),
    },
  }));
}

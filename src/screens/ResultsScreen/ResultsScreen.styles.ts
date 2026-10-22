import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useResultsScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
    },
    scrollContent: {
      paddingBottom: rp(36),
    },
    lead: {
      fontSize: rf(15),
      lineHeight: rl(22),
      marginBottom: rm(18),
    },
    copied: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(12),
      fontWeight: '600' as const,
    },
    sectionTitle: {
      fontSize: rf(18),
      fontWeight: '600' as const,
      lineHeight: rl(24),
      marginTop: rm(24),
      marginBottom: rm(12),
    },
    altItem: {
      marginBottom: rm(12),
    },
    secondaryCta: {
      marginTop: rm(24),
    },
    ghostCta: {
      marginTop: rm(8),
    },
  }));
}

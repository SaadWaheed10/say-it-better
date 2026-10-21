import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useResultsScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
    },
    scrollContent: {
      paddingBottom: rp(32),
    },
    copyHit: {
      width: rp(44),
      height: rp(44),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: rr(22),
    },
    badge: {
      alignSelf: 'flex-start' as const,
      paddingHorizontal: rp(12),
      paddingVertical: rp(8),
      marginBottom: rm(16),
      borderRadius: rr(999),
    },
    badgeText: {
      fontSize: rf(13),
      lineHeight: rl(18),
      fontWeight: '600' as const,
    },
    copied: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(12),
    },
    sectionTitle: {
      fontSize: rf(18),
      fontWeight: '600' as const,
      lineHeight: rl(24),
      marginTop: rm(20),
      marginBottom: rm(12),
    },
    altItem: {
      marginBottom: rm(12),
    },
    secondaryCta: {
      marginTop: rm(20),
    },
    ghostCta: {
      marginTop: rm(8),
    },
  }));
}

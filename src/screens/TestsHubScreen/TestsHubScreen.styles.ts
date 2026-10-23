import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useTestsHubScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    scrollContent: {
      paddingHorizontal: rp(20),
      paddingBottom: rp(130),
    },
    title: {
      fontSize: rf(28),
      fontWeight: '800' as const,
      letterSpacing: -0.6,
      lineHeight: rl(34),
    },
    titleAccent: {
      height: rp(3),
      width: rp(40),
      borderRadius: rr(2),
      marginTop: rm(8),
      marginBottom: rm(8),
    },
    lead: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginBottom: rm(8),
    },
    poolNote: {
      fontSize: rf(12),
      lineHeight: rl(16),
      marginBottom: rm(16),
    },
    statsRow: {
      flexDirection: 'row' as const,
      gap: rp(10),
      marginBottom: rm(14),
    },
    statCard: {
      flex: 1,
      borderWidth: 1,
      borderRadius: rr(16),
      paddingVertical: rp(12),
      paddingHorizontal: rp(8),
      alignItems: 'center' as const,
    },
    statValue: {
      fontSize: rf(16),
      fontWeight: '800' as const,
    },
    statLabel: {
      fontSize: rf(11),
      marginTop: rm(4),
      textAlign: 'center' as const,
    },
    badgeRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: rp(8),
      marginBottom: rm(8),
    },
    badgeChip: {
      borderWidth: 1,
      borderRadius: rr(999),
      paddingHorizontal: rp(12),
      paddingVertical: rp(7),
    },
    badgeTitle: {
      fontSize: rf(12),
      fontWeight: '700' as const,
    },
    bestScore: {
      fontSize: rf(12),
      fontWeight: '700' as const,
      marginTop: rm(8),
    },
    card: {
      borderWidth: 1,
      borderRadius: rr(20),
      padding: rp(16),
      marginBottom: rm(12),
      overflow: 'hidden' as const,
    },
    cardStripe: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: rp(4),
    },
    cardBody: {paddingLeft: rp(10)},
    cardTitle: {
      fontSize: rf(17),
      fontWeight: '700' as const,
      lineHeight: rl(22),
    },
    cardSubtitle: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(4),
    },
    cardDesc: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(8),
    },
    sectionTitle: {
      fontSize: rf(16),
      fontWeight: '700' as const,
      lineHeight: rl(22),
      marginTop: rm(20),
      marginBottom: rm(10),
    },
    attemptRow: {
      borderWidth: 1,
      borderRadius: rr(16),
      padding: rp(14),
      marginBottom: rm(10),
    },
    attemptTitle: {
      fontSize: rf(15),
      fontWeight: '600' as const,
      lineHeight: rl(20),
    },
    attemptMeta: {
      fontSize: rf(12),
      lineHeight: rl(16),
      marginTop: rm(4),
    },
    scoreBadge: {
      fontSize: rf(16),
      fontWeight: '800' as const,
    },
    attemptTop: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      gap: rp(8),
    },
  }));
}

import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useHistoryScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
      paddingBottom: rp(130),
    },
    headerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      minHeight: rp(48),
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
      marginTop: rm(6),
      marginBottom: rm(4),
    },
    clearBtn: {
      minHeight: rp(40),
      paddingHorizontal: rp(8),
    },
    caption: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(12),
    },
    search: {
      borderWidth: 1,
      borderRadius: rr(14),
      paddingHorizontal: rp(14),
      paddingVertical: rp(10),
      fontSize: rf(15),
      lineHeight: rl(20),
      marginBottom: rm(12),
    },
    filterRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: rp(8),
      marginBottom: rm(14),
    },
    filterChip: {
      paddingHorizontal: rp(12),
      paddingVertical: rp(7),
      borderRadius: rr(999),
      borderWidth: 1,
    },
    filterChipText: {
      fontSize: rf(12),
      fontWeight: '600' as const,
    },
    card: {
      borderWidth: 1,
      borderRadius: rr(18),
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
    cardBody: {
      paddingTop: rp(16),
      paddingBottom: rp(16),
      paddingRight: rp(18),
      paddingLeft: rp(20),
    },
    cardTop: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      justifyContent: 'space-between' as const,
      gap: rp(8),
    },
    meta: {
      fontSize: rf(13),
      lineHeight: rl(18),
      flex: 1,
    },
    starHit: {
      padding: rp(4),
    },
    preview: {
      fontSize: rf(16),
      fontWeight: '500' as const,
      lineHeight: rl(24),
      marginTop: rm(6),
    },
    original: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(6),
    },
    cardActions: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: rp(16),
      marginTop: rm(10),
    },
    deleteHit: {
      alignSelf: 'flex-start' as const,
    },
    deleteText: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
    practiceHit: {
      alignSelf: 'flex-start' as const,
    },
    practiceText: {
      fontSize: rf(13),
      fontWeight: '700' as const,
      lineHeight: rl(18),
    },
  }));
}

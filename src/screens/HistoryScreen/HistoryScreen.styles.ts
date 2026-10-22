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
      marginBottom: rm(16),
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
    /** Content inset — keeps copy clear of the left accent stripe */
    cardBody: {
      paddingTop: rp(16),
      paddingBottom: rp(16),
      paddingRight: rp(18),
      paddingLeft: rp(20),
    },
    meta: {
      fontSize: rf(13),
      lineHeight: rl(18),
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
    deleteHit: {
      marginTop: rm(10),
      marginLeft: 0,
      alignSelf: 'flex-start' as const,
    },
    deleteText: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
  }));
}

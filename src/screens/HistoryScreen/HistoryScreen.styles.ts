import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useHistoryScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      minHeight: rp(48),
    },
    title: {
      fontSize: rf(22),
      fontWeight: '700' as const,
      letterSpacing: -0.2,
      lineHeight: rl(30),
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
      padding: rp(16),
      marginBottom: rm(12),
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
      alignSelf: 'flex-start' as const,
    },
    deleteText: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
  }));
}

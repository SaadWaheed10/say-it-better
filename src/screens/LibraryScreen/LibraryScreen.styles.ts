import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useLibraryScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
      paddingBottom: rp(24),
    },
    title: {
      fontSize: rf(22),
      fontWeight: '700' as const,
      letterSpacing: -0.2,
      lineHeight: rl(30),
    },
    caption: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(16),
      marginTop: rm(6),
    },
    card: {
      borderWidth: 1,
      borderRadius: rr(18),
      padding: rp(16),
      marginBottom: rm(12),
    },
    phrase: {
      fontSize: rf(16),
      fontWeight: '500' as const,
      lineHeight: rl(24),
    },
    meta: {
      fontSize: rf(12),
      lineHeight: rl(16),
      marginTop: rm(8),
    },
    actions: {
      flexDirection: 'row' as const,
      gap: rp(16),
      marginTop: rm(12),
    },
    actionText: {
      fontSize: rf(13),
      fontWeight: '600' as const,
      lineHeight: rl(18),
    },
  }));
}

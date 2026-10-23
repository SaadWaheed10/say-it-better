import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useAppModalStyles() {
  return useScaledStyles(() => ({
    root: {
      flex: 1,
    },
    backdrop: {
      ...({
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      } as const),
    },
    center: {
      flex: 1,
      justifyContent: 'center' as const,
      paddingHorizontal: rp(28),
    },
    card: {
      borderWidth: 1,
      borderRadius: rr(22),
      overflow: 'hidden' as const,
      maxWidth: rp(400),
      width: '100%' as const,
      alignSelf: 'center' as const,
    },
    accent: {
      height: rp(3),
      width: '100%' as const,
    },
    body: {
      paddingHorizontal: rp(20),
      paddingTop: rp(18),
      paddingBottom: rp(16),
    },
    title: {
      fontSize: rf(18),
      fontWeight: '800' as const,
      letterSpacing: -0.3,
      lineHeight: rl(24),
      marginBottom: rm(8),
    },
    message: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginBottom: rm(4),
    },
    actions: {
      marginTop: rm(16),
      gap: rm(8),
    },
    destructiveLabel: {
      // color applied inline
    },
  }));
}

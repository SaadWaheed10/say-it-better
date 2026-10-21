import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useMessageInputStyles() {
  return useScaledStyles(() => ({
    wrap: {
      borderWidth: 1,
      borderRadius: rr(22),
      padding: rp(16),
    },
    input: {
      padding: 0,
      fontSize: rf(16),
      lineHeight: rl(24),
      minHeight: rp(140),
    },
    footer: {
      marginTop: rm(10),
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    footerAction: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
    counter: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
  }));
}

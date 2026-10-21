import {useScaledStyles, rp, rr} from '../../theme/useScaledStyles';

export function useScreenHeaderStyles() {
  return useScaledStyles(() => ({
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: rp(12),
    },
    side: {
      width: rp(44),
      minHeight: rp(44),
      justifyContent: 'center' as const,
    },
    right: {
      alignItems: 'flex-end' as const,
    },
    backButton: {
      width: rp(44),
      height: rp(44),
      alignItems: 'flex-start' as const,
      justifyContent: 'center' as const,
      borderRadius: rr(22),
    },
    title: {
      flex: 1,
      textAlign: 'center' as const,
    },
  }));
}

import {useScaledStyles, rp, rr} from '../../theme/useScaledStyles';

export function usePaginationDotsStyles() {
  return useScaledStyles(() => ({
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: rp(8),
    },
    dot: {
      height: rp(8),
      borderRadius: rr(999),
    },
    dotActive: {
      width: rp(18),
    },
    dotInactive: {
      width: rp(8),
    },
  }));
}

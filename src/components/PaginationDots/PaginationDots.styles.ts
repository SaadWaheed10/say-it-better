import {useScaledStyles} from '../../theme/useScaledStyles';

export function usePaginationDotsStyles() {
  return useScaledStyles(() => ({
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
    },
    dot: {
      height: 8,
      borderRadius: 999,
    },
  }));
}

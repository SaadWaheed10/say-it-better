import {useScaledStyles} from '../../theme/useScaledStyles';

export function useEmptyStateStyles() {
  return useScaledStyles(() => ({
    wrap: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  }));
}

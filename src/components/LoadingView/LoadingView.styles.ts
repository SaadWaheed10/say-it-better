import {useScaledStyles} from '../../theme/useScaledStyles';

export function useLoadingViewStyles() {
  return useScaledStyles(() => ({
    wrap: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  }));
}

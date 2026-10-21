import {useScaledStyles} from '../../theme/useScaledStyles';

export function useBrandLogoStyles() {
  return useScaledStyles(() => ({
    wrap: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  }));
}

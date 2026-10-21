import {useScaledStyles} from '../../theme/useScaledStyles';

export function useSplashScreenStyles() {
  return useScaledStyles(() => ({
    safe: {
      flex: 1,
    },
    content: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 24,
    },
  }));
}

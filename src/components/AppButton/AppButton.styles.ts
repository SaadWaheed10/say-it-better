import {useScaledStyles} from '../../theme/useScaledStyles';

export function useAppButtonStyles() {
  return useScaledStyles(() => ({
    base: {
      minHeight: 52,
      borderRadius: 999,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 22,
    },
  }));
}

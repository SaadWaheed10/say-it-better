import {useScaledStyles, rp, rr} from '../../theme/useScaledStyles';

export function useAppButtonStyles() {
  return useScaledStyles(() => ({
    base: {
      minHeight: rp(52),
      borderRadius: rr(999),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: rp(22),
    },
  }));
}

import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useToneSelectorStyles() {
  return useScaledStyles(() => ({
    grid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: rp(10),
    },
    chip: {
      width: '31%' as const,
      minWidth: rp(96),
      flexGrow: 1,
      alignItems: 'center' as const,
      borderWidth: 1,
      minHeight: rp(72),
      justifyContent: 'center' as const,
      borderRadius: rr(18),
      paddingVertical: rp(12),
      paddingHorizontal: rp(12),
    },
    label: {
      fontSize: rf(14),
      fontWeight: '600' as const,
      lineHeight: rl(20),
      marginTop: rm(6),
    },
  }));
}

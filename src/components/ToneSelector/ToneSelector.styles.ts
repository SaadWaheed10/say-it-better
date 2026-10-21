import {useScaledStyles} from '../../theme/useScaledStyles';

export function useToneSelectorStyles() {
  return useScaledStyles(() => ({
    grid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 10,
    },
    chip: {
      width: '31%' as const,
      minWidth: 96,
      flexGrow: 1,
      alignItems: 'center' as const,
      borderWidth: 1,
      minHeight: 72,
      justifyContent: 'center' as const,
    },
  }));
}

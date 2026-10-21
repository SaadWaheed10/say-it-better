import {useScaledStyles} from '../../theme/useScaledStyles';

export function useHistoryScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    headerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      minHeight: 48,
    },
    card: {
      borderWidth: 1,
    },
  }));
}

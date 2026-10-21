import {useScaledStyles} from '../../theme/useScaledStyles';

export function useHomeScreenStyles() {
  return useScaledStyles(() => ({
    safe: {
      flex: 1,
    },
    topRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      minHeight: 44,
      marginBottom: 4,
    },
    heroCard: {},
    statusBanner: {},
    toneGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 12,
    },
    toneCard: {
      width: '47%' as const,
      flexGrow: 1,
      borderWidth: 1,
      minHeight: 88,
      justifyContent: 'center' as const,
    },
  }));
}

import {useScaledStyles} from '../../theme/useScaledStyles';

export function useScreenHeaderStyles() {
  return useScaledStyles(() => ({
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    side: {
      width: 44,
      minHeight: 44,
      justifyContent: 'center' as const,
    },
    right: {
      alignItems: 'flex-end' as const,
    },
    backButton: {
      width: 44,
      height: 44,
      alignItems: 'flex-start' as const,
      justifyContent: 'center' as const,
    },
  }));
}

import {useScaledStyles} from '../../theme/useScaledStyles';

export function useResultCardStyles() {
  return useScaledStyles(() => ({
    card: {
      borderWidth: 1,
    },
    copyButton: {
      alignSelf: 'flex-end' as const,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minHeight: 36,
      justifyContent: 'center' as const,
    },
  }));
}

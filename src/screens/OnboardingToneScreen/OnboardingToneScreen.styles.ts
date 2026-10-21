import {useScaledStyles} from '../../theme/useScaledStyles';

export function useOnboardingToneScreenStyles() {
  return useScaledStyles(() => ({
    safe: {
      flex: 1,
    },
    content: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    footer: {
      paddingBottom: 8,
    },
    actions: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
    },
    sideButton: {
      minWidth: 88,
      paddingHorizontal: 8,
    },
  }));
}

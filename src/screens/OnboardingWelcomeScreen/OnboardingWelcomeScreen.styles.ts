import {useScaledStyles} from '../../theme/useScaledStyles';

export function useOnboardingWelcomeScreenStyles() {
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
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      gap: 12,
    },
    skip: {
      minWidth: 88,
      paddingHorizontal: 8,
    },
    continue: {
      flex: 1,
    },
  }));
}

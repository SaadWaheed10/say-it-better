import {useScaledStyles} from '../../theme/useScaledStyles';

export function useOnboardingWelcomeIllustrationStyles() {
  return useScaledStyles(() => ({
    wrap: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  }));
}

import {useScaledStyles, rp} from '../../theme/useScaledStyles';

export function useOnboardingWelcomeIllustrationStyles() {
  return useScaledStyles(() => ({
    wrap: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    svgWidth: {
      width: rp(280),
    },
    svgHeight: {
      height: rp(170),
    },
  }));
}

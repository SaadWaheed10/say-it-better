import {useScaledStyles} from '../../theme/useScaledStyles';

export function useMessageInputStyles() {
  return useScaledStyles(() => ({
    wrap: {
      borderWidth: 1,
    },
    input: {
      padding: 0,
    },
    footer: {
      marginTop: 10,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
  }));
}

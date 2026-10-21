import {useScaledStyles} from '../theme/useScaledStyles';

export function useMainTabNavigatorStyles() {
  return useScaledStyles(() => ({
    iconWrap: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    label: {
      fontWeight: '600' as const,
    },
    tabBar: {
      height: 64,
      paddingBottom: 8,
      paddingTop: 8,
    },
  }));
}

import {useScaledStyles, rp, rf} from '../theme/useScaledStyles';

export function useMainTabNavigatorStyles() {
  return useScaledStyles(() => ({
    iconWrap: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    label: {
      fontWeight: '600' as const,
      fontSize: rf(12),
    },
    tabBar: {
      borderTopWidth: 1,
    },
    tabBarPaddingTop: {
      paddingTop: rp(8),
    },
  }));
}

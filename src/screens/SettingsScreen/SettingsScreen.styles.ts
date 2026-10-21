import {useScaledStyles} from '../../theme/useScaledStyles';

export function useSettingsScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    row: {
      borderWidth: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      minHeight: 52,
    },
    modelCard: {
      borderWidth: 1,
    },
  }));
}

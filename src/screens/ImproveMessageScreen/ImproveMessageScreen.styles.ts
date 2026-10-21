import {useScaledStyles} from '../../theme/useScaledStyles';

export function useImproveMessageScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    flex: {flex: 1},
    instruction: {
      borderWidth: 1,
      minHeight: 48,
    },
  }));
}

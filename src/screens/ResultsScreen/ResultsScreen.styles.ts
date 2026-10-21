import {useScaledStyles} from '../../theme/useScaledStyles';

export function useResultsScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    badge: {},
  }));
}

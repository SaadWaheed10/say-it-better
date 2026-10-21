import {
  useScaledStyles as usePixelFlowScaledStyles,
  rp,
  rm,
  rf,
  rr,
  rl,
  ri,
  rls,
} from 'react-native-pixelflow';
import type {ImageStyle, TextStyle, ViewStyle} from 'react-native';

type NamedStyles<T> = {[P in keyof T]: ViewStyle | TextStyle | ImageStyle};

/**
 * StyleSheet that recomputes when screen size / orientation changes.
 * Wrap design-px values with rp / rm / rf / rr / rl / ri / rls inside the factory.
 */
export function useScaledStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  factory: () => T,
): T {
  return usePixelFlowScaledStyles(factory);
}

export {rp, rm, rf, rr, rl, ri, rls};

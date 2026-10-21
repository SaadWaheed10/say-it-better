import {usePixelSheet} from 'react-native-pixelflow';
import type {ImageStyle, TextStyle, ViewStyle} from 'react-native';

type NamedStyles<T> = {[P in keyof T]: ViewStyle | TextStyle | ImageStyle};

/**
 * PixelFlow-backed StyleSheet helper.
 * Prefer this over StyleSheet.create so paddings/fonts/radii rescale on rotation
 * and across phone/tablet sizes.
 */
export function useScaledStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  factory: () => T,
): T {
  return usePixelSheet(factory);
}

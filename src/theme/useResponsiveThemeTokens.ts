import {useMemo} from 'react';
import {rp, rr, useScalingVersion} from 'react-native-pixelflow';
import {useScaledStyles} from './useScaledStyles';
import {radii as baseRadii, spacing as baseSpacing} from './spacing';
import {typography as baseTypography} from './typography';

/**
 * Live theme tokens that rescale with PixelFlow when the window size changes.
 */
export function useResponsiveThemeTokens() {
  const version = useScalingVersion();

  const typography = useScaledStyles(() => ({
    brand: {...baseTypography.brand},
    h1: {...baseTypography.h1},
    h2: {...baseTypography.h2},
    h3: {...baseTypography.h3},
    body: {...baseTypography.body},
    bodyMedium: {...baseTypography.bodyMedium},
    caption: {...baseTypography.caption},
    label: {...baseTypography.label},
    button: {...baseTypography.button},
  }));

  const spacing = useMemo(
    () => ({
      xxs: rp(baseSpacing.xxs),
      xs: rp(baseSpacing.xs),
      sm: rp(baseSpacing.sm),
      md: rp(baseSpacing.md),
      lg: rp(baseSpacing.lg),
      xl: rp(baseSpacing.xl),
      xxl: rp(baseSpacing.xxl),
      xxxl: rp(baseSpacing.xxxl),
      huge: rp(baseSpacing.huge),
    }),
    [version],
  );

  const radii = useMemo(
    () => ({
      sm: rr(baseRadii.sm),
      md: rr(baseRadii.md),
      lg: rr(baseRadii.lg),
      xl: rr(baseRadii.xl),
      pill: baseRadii.pill,
    }),
    [version],
  );

  return {typography, spacing, radii};
}

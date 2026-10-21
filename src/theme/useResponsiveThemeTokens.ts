import {useMemo} from 'react';
import {useScalingVersion} from 'react-native-pixelflow';
import {rp, rr, rf, rl, rls, useScaledStyles} from './useScaledStyles';
import {radii as baseRadii, spacing as baseSpacing} from './spacing';
import {typography as baseTypography} from './typography';

/**
 * Live theme tokens that rescale with PixelFlow when the window size changes.
 */
export function useResponsiveThemeTokens() {
  const version = useScalingVersion();

  const typography = useScaledStyles(() => ({
    brand: {
      fontSize: rf(baseTypography.brand.fontSize),
      fontWeight: baseTypography.brand.fontWeight,
      letterSpacing: rls(baseTypography.brand.letterSpacing ?? 0),
    },
    h1: {
      fontSize: rf(baseTypography.h1.fontSize),
      fontWeight: baseTypography.h1.fontWeight,
      letterSpacing: rls(baseTypography.h1.letterSpacing ?? 0),
      lineHeight: rl(baseTypography.h1.lineHeight ?? 34),
    },
    h2: {
      fontSize: rf(baseTypography.h2.fontSize),
      fontWeight: baseTypography.h2.fontWeight,
      letterSpacing: rls(baseTypography.h2.letterSpacing ?? 0),
      lineHeight: rl(baseTypography.h2.lineHeight ?? 30),
    },
    h3: {
      fontSize: rf(baseTypography.h3.fontSize),
      fontWeight: baseTypography.h3.fontWeight,
      lineHeight: rl(baseTypography.h3.lineHeight ?? 24),
    },
    body: {
      fontSize: rf(baseTypography.body.fontSize),
      fontWeight: baseTypography.body.fontWeight,
      lineHeight: rl(baseTypography.body.lineHeight ?? 24),
    },
    bodyMedium: {
      fontSize: rf(baseTypography.bodyMedium.fontSize),
      fontWeight: baseTypography.bodyMedium.fontWeight,
      lineHeight: rl(baseTypography.bodyMedium.lineHeight ?? 24),
    },
    caption: {
      fontSize: rf(baseTypography.caption.fontSize),
      fontWeight: baseTypography.caption.fontWeight,
      lineHeight: rl(baseTypography.caption.lineHeight ?? 18),
    },
    label: {
      fontSize: rf(baseTypography.label.fontSize),
      fontWeight: baseTypography.label.fontWeight,
      lineHeight: rl(baseTypography.label.lineHeight ?? 20),
    },
    button: {
      fontSize: rf(baseTypography.button.fontSize),
      fontWeight: baseTypography.button.fontWeight,
      letterSpacing: rls(baseTypography.button.letterSpacing ?? 0),
    },
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

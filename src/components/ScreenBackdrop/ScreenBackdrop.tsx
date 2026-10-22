import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle, Ellipse, Path} from 'react-native-svg';
import {useAppTheme} from '../../hooks/useAppTheme';
import {
  darkBackdropOrbs,
  darkGradientHero,
  lightBackdropOrbs,
  lightGradientHero,
} from '../../theme/colors';

export type BackdropVariant = 'splash' | 'onboarding' | 'app' | 'focus';

type Props = {
  variant?: BackdropVariant;
};

export function ScreenBackdrop({variant = 'app'}: Props) {
  const {colors, isDark} = useAppTheme();
  const orbs = isDark ? darkBackdropOrbs : lightBackdropOrbs;
  const heroStops = isDark ? [...darkGradientHero] : [...lightGradientHero];

  const intensity =
    variant === 'splash'
      ? 1
      : variant === 'onboarding'
        ? 0.95
        : variant === 'focus'
          ? 0.7
          : 0.85;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Soft diagonal jewel wash */}
      <LinearGradient
        colors={[
          `${heroStops[0]}55`,
          'transparent',
          `${heroStops[heroStops.length - 1]}33`,
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}>
        <Ellipse
          cx="30"
          cy="0"
          rx="210"
          ry="160"
          fill={orbs.teal}
          opacity={0.9 * intensity}
        />
        <Ellipse
          cx="360"
          cy="90"
          rx="170"
          ry="130"
          fill={orbs.amber}
          opacity={0.85 * intensity}
        />
        <Ellipse
          cx="320"
          cy="320"
          rx="110"
          ry="90"
          fill={orbs.rose}
          opacity={0.55 * intensity}
        />
        <Circle
          cx="70"
          cy="420"
          r="80"
          fill={orbs.mist}
          opacity={0.5 * intensity}
        />
        {variant === 'splash' || variant === 'onboarding' ? (
          <Path
            d="M0 680 C 90 620, 170 760, 250 710 S 340 660, 390 720 L 390 844 L 0 844 Z"
            fill={orbs.teal}
            opacity={0.35 * intensity}
          />
        ) : (
          <Ellipse
            cx="80"
            cy="800"
            rx="200"
            ry="120"
            fill={orbs.amber}
            opacity={0.28 * intensity}
          />
        )}
        {variant === 'focus' ? (
          <Ellipse
            cx="195"
            cy="150"
            rx="240"
            ry="100"
            fill={orbs.teal}
            opacity={0.32}
          />
        ) : null}
      </Svg>
    </View>
  );
}

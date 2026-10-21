import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle, Ellipse, Path} from 'react-native-svg';
import {useAppTheme} from '../../hooks/useAppTheme';

export type BackdropVariant = 'splash' | 'onboarding' | 'app' | 'focus';

type Props = {
  variant?: BackdropVariant;
};

export function ScreenBackdrop({variant = 'app'}: Props) {
  const {colors, isDark} = useAppTheme();

  const blob = isDark ? colors.lavender : colors.lavender;
  const accent = isDark
    ? 'rgba(123, 127, 232, 0.22)'
    : 'rgba(80, 84, 216, 0.18)';
  const mist = isDark
    ? 'rgba(42, 46, 74, 0.55)'
    : 'rgba(230, 232, 255, 0.7)';

  const intensity =
    variant === 'splash' ? 1 : variant === 'onboarding' ? 0.9 : variant === 'focus' ? 0.55 : 0.75;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}>
        <Ellipse
          cx="40"
          cy="20"
          rx="200"
          ry="140"
          fill={blob}
          opacity={0.5 * intensity}
        />
        <Ellipse
          cx="360"
          cy="110"
          rx="160"
          ry="120"
          fill={accent}
          opacity={0.85 * intensity}
        />
        <Circle
          cx="300"
          cy="280"
          r="70"
          fill={mist}
          opacity={0.45 * intensity}
        />
        {variant === 'splash' || variant === 'onboarding' ? (
          <Path
            d="M0 680 C 90 620, 170 760, 250 710 S 340 660, 390 720 L 390 844 L 0 844 Z"
            fill={blob}
            opacity={0.55 * intensity}
          />
        ) : (
          <Ellipse
            cx="60"
            cy="780"
            rx="180"
            ry="100"
            fill={mist}
            opacity={0.4 * intensity}
          />
        )}
        {variant === 'focus' ? (
          <Ellipse
            cx="195"
            cy="160"
            rx="220"
            ry="90"
            fill={accent}
            opacity={0.35}
          />
        ) : null}
      </Svg>
    </View>
  );
}

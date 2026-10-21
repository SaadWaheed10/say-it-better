import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Ellipse, Path} from 'react-native-svg';
import {useAppTheme} from '../hooks/useAppTheme';

type Props = {
  variant?: 'splash' | 'onboarding';
};

export function LavenderBackdrop({variant = 'onboarding'}: Props) {
  const {colors, isDark} = useAppTheme();
  const fill = isDark ? colors.lavender : '#E6E8FF';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}>
        <Ellipse cx="60" cy="40" rx="180" ry="120" fill={fill} opacity={0.55} />
        <Ellipse cx="340" cy="90" rx="140" ry="100" fill={fill} opacity={0.4} />
        <Path
          d="M0 700 C 80 650, 160 760, 240 720 S 340 680, 390 730 L 390 844 L 0 844 Z"
          fill={fill}
          opacity={variant === 'splash' ? 0.7 : 0.55}
        />
        <Ellipse cx="320" cy="780" rx="120" ry="70" fill={fill} opacity={0.35} />
      </Svg>
    </View>
  );
}

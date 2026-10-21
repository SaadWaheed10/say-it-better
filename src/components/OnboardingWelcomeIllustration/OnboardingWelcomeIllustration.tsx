import React from 'react';
import {View} from 'react-native';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useOnboardingWelcomeIllustrationStyles} from './OnboardingWelcomeIllustration.styles';

export function OnboardingWelcomeIllustration() {
  const {colors, isDark} = useAppTheme();
  const styles = useOnboardingWelcomeIllustrationStyles();
  const lavender = isDark ? '#3A4068' : '#D9DCFF';
  const navy = isDark ? '#E8EAF5' : '#202653';
  const card = colors.background;
  const line = isDark ? '#8A90AE' : '#B7BBD4';

  return (
    <View style={styles.wrap} accessibilityLabel="Message improvement illustration">
      <Svg width={280} height={170} viewBox="0 0 280 170">
        <Path
          d="M40 120 C 70 70, 210 70, 240 120 C 210 155, 70 155, 40 120 Z"
          fill={lavender}
          opacity={0.55}
        />
        <Rect
          x="28"
          y="48"
          width="88"
          height="72"
          rx="16"
          fill={lavender}
          transform="rotate(-8 72 84)"
        />
        <Path d="M42 68 h48" stroke={line} strokeWidth={4} strokeLinecap="round" />
        <Path d="M42 84 h40" stroke={line} strokeWidth={4} strokeLinecap="round" />
        <Path d="M42 100 h28" stroke={line} strokeWidth={4} strokeLinecap="round" />

        <Path
          d="M118 92 C 140 70, 150 70, 168 88"
          stroke={lavender}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
        <Path d="M160 78 l12 12 -16 2 Z" fill={lavender} />

        <Rect
          x="164"
          y="40"
          width="96"
          height="78"
          rx="16"
          fill={card}
          stroke={colors.border}
          strokeWidth={1}
          transform="rotate(7 212 79)"
        />
        <Path d="M182 62 h48" stroke={line} strokeWidth={4} strokeLinecap="round" />
        <Path d="M182 78 h40" stroke={line} strokeWidth={4} strokeLinecap="round" />
        <Path d="M182 94 h32" stroke={line} strokeWidth={4} strokeLinecap="round" />
        <Circle cx="246" cy="48" r="10" fill={colors.primaryAccent} />
        <Path
          d="M241 48 l3.5 3.5 7-7"
          stroke="#FFFFFF"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M214 28 l4 10 10-2 -8 8 4 10 -10-5 -10 5 4-10 -8-8 10 2 Z"
          fill={navy}
        />
        <Circle cx="236" cy="22" r="2" fill={navy} />
        <Circle cx="244" cy="28" r="1.5" fill={navy} />
      </Svg>
    </View>
  );
}


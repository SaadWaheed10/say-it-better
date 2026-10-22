import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path, Circle} from 'react-native-svg';
import {darkGradientHero} from '../../theme/colors';
import {ri} from '../../theme/useScaledStyles';
import {useBrandLogoStyles} from './BrandLogo.styles';

type Props = {
  size?: number;
};

export function BrandLogo({size = 72}: Props) {
  const styles = useBrandLogoStyles();
  const scaled = ri(size);
  const radius = scaled * 0.22;
  return (
    <View
      style={[
        styles.wrap,
        {
          width: scaled,
          height: scaled,
          borderRadius: radius,
          overflow: 'hidden',
        },
      ]}
      accessibilityLabel="SayItBetter logo">
      <LinearGradient
        colors={[...darkGradientHero]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={{
          width: scaled,
          height: scaled,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Svg
          width={scaled * 0.55}
          height={scaled * 0.55}
          viewBox="0 0 64 64">
          <Path
            d="M34 8 L44 20 L30 34 L24 28 Z"
            fill="#07090F"
            opacity={0.92}
          />
          <Path d="M24 28 L30 34 L18 52 L12 46 Z" fill="#07090F" />
          <Path d="M30 34 L44 20 L50 26 L36 40 Z" fill="#F5F2EC" opacity={0.85} />
          <Circle cx="48" cy="12" r="2.2" fill="#F5F2EC" />
          <Circle cx="54" cy="18" r="1.6" fill="#F5F2EC" />
          <Circle cx="46" cy="6" r="1.4" fill="#F5F2EC" />
        </Svg>
      </LinearGradient>
    </View>
  );
}

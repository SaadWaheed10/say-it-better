import React from 'react';
import {View} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {brandNavy} from '../../theme/colors';
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
          backgroundColor: brandNavy,
        },
      ]}
      accessibilityLabel="SayItBetter logo">
      <Svg
        width={scaled * 0.55}
        height={scaled * 0.55}
        viewBox="0 0 64 64">
        <Path
          d="M34 8 L44 20 L30 34 L24 28 Z"
          fill="#FFFFFF"
          opacity={0.95}
        />
        <Path d="M24 28 L30 34 L18 52 L12 46 Z" fill="#FFFFFF" />
        <Path d="M30 34 L44 20 L50 26 L36 40 Z" fill="#D7DBFF" />
        <Circle cx="48" cy="12" r="2.2" fill="#FFFFFF" />
        <Circle cx="54" cy="18" r="1.6" fill="#FFFFFF" />
        <Circle cx="46" cy="6" r="1.4" fill="#FFFFFF" />
      </Svg>
    </View>
  );
}

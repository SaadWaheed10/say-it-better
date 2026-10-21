import React, {useEffect, useRef} from 'react';
import {Animated, StyleProp, ViewStyle} from 'react-native';
import {rp} from '../../theme/useScaledStyles';

type Props = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
};

export function FadeIn({
  children,
  delay = 0,
  duration = 480,
  distance,
  style,
}: Props) {
  const travel = distance ?? rp(14);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(travel)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [delay, travel, duration, opacity, translateY]);

  return (
    <Animated.View style={[{opacity, transform: [{translateY}]}, style]}>
      {children}
    </Animated.View>
  );
}

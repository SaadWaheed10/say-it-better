import React, {useEffect, useRef} from 'react';
import {Animated, StyleProp, View, ViewStyle} from 'react-native';
import {useReduceMotion} from '../../hooks/useReduceMotion';
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
  const reduceMotion = useReduceMotion();
  const travel = distance ?? rp(14);
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(
    new Animated.Value(reduceMotion ? 0 : travel),
  ).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
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
  }, [delay, travel, duration, opacity, translateY, reduceMotion]);

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View style={[{opacity, transform: [{translateY}]}, style]}>
      {children}
    </Animated.View>
  );
}

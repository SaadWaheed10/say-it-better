import React, {useRef} from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import {useReduceMotion} from '../../hooks/useReduceMotion';

type Props = Omit<PressableProps, 'style'> & {
  children: React.ReactNode;
  /** Layout styles belong on the Pressable so width/flex grids work. */
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function PressScale({
  children,
  style,
  scaleTo = 0.97,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    if (reduceMotion) {
      return;
    }
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 7,
      tension: 180,
    }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      style={style}
      onPressIn={event => {
        if (!disabled) {
          animateTo(scaleTo);
        }
        onPressIn?.(event);
      }}
      onPressOut={event => {
        animateTo(1);
        onPressOut?.(event);
      }}
      {...rest}>
      {reduceMotion ? (
        <View style={{width: '100%', alignSelf: 'stretch'}}>{children}</View>
      ) : (
        <Animated.View
          style={{
            transform: [{scale}],
            width: '100%',
            alignSelf: 'stretch',
          }}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}

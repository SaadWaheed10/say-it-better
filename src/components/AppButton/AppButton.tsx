import React from 'react';
import {ActivityIndicator, Text, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useAppTheme} from '../../hooks/useAppTheme';
import {darkGradientHero, lightGradientHero} from '../../theme/colors';
import {PressScale} from '../PressScale';
import {useAppButtonStyles} from './AppButton.styles';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  iconRight?: string;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
  iconRight,
}: Props) {
  const {colors, typography, isDark} = useAppTheme();
  const styles = useAppButtonStyles();
  const isDisabled = disabled || loading;
  const hero = isDark ? [...darkGradientHero] : [...lightGradientHero];

  const textColor =
    variant === 'primary' ? colors.black : colors.primaryText;

  const content = loading ? (
    <ActivityIndicator color={textColor} />
  ) : (
    <Text style={[typography.button, styles.label, {color: textColor}]}>
      {label}
      {iconRight ? ` ${iconRight}` : ''}
    </Text>
  );

  if (variant === 'primary') {
    return (
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{disabled: isDisabled}}
        disabled={isDisabled}
        onPress={onPress}
        style={[styles.base, {opacity: isDisabled ? 0.5 : 1}, style]}>
        <LinearGradient
          colors={[hero[0], hero[1], hero[2] ?? hero[1]]}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          style={styles.gradientFill}>
          {content}
        </LinearGradient>
      </PressScale>
    );
  }

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{disabled: isDisabled}}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        styles.solid,
        {
          backgroundColor:
            variant === 'secondary' ? colors.surfaceSolid : 'transparent',
          borderColor:
            variant === 'secondary' ? colors.borderSoft : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}>
      <Text
        style={[
          typography.button,
          styles.label,
          {
            color:
              variant === 'ghost' ? colors.primaryAccent : colors.primaryText,
          },
        ]}>
        {label}
        {iconRight ? ` ${iconRight}` : ''}
      </Text>
    </PressScale>
  );
}

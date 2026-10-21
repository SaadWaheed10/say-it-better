import React from 'react';
import {
  ActivityIndicator,
  Text,
  ViewStyle,
} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';
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
  const {colors, typography} = useAppTheme();
  const styles = useAppButtonStyles();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? colors.primaryNavy
      : variant === 'secondary'
        ? colors.surfaceSolid
        : 'transparent';

  const textColor =
    variant === 'primary' ? colors.white : colors.primaryNavy;

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{disabled: isDisabled}}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor:
            variant === 'secondary' ? colors.borderSoft : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[typography.button, {color: textColor}]}>
          {label}
          {iconRight ? ` ${iconRight}` : ''}
        </Text>
      )}
    </PressScale>
  );
}

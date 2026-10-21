import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  ViewStyle,
} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';
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
        ? colors.secondaryBackground
        : 'transparent';

  const textColor =
    variant === 'primary' ? colors.white : colors.primaryNavy;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{disabled: isDisabled}}
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        {
          backgroundColor,
          borderColor:
            variant === 'secondary' ? colors.border : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1,
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
    </Pressable>
  );
}


import React, {useState} from 'react';
import {Pressable, TextInput, TextInputProps, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {useAppTheme} from '../../hooks/useAppTheme';
import {ri} from '../../theme/useScaledStyles';
import {usePasswordInputStyles} from './PasswordInput.styles';

type Props = Omit<TextInputProps, 'secureTextEntry'> & {
  value: string;
  onChangeText: (text: string) => void;
};

function EyeIcon({visible, color}: {visible: boolean; color: string}) {
  const size = ri(22);
  if (visible) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M2 12 s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12 Z"
          stroke={color}
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} fill="none" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 3 l18 18 M10.6 10.6 a2.5 2.5 0 0 0 3.5 3.5 M9.9 5.1 A10.4 10.4 0 0 1 12 5 c6.5 0 10 7 10 7 a18 18 0 0 1-3.2 3.9 M6.1 6.1 A17.5 17.5 0 0 0 2 12 s3.5 7 10 7 a9.7 9.7 0 0 0 4.2-.9"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PasswordInput({
  value,
  onChangeText,
  placeholder = '••••••••',
  accessibilityLabel = 'Password',
  ...rest
}: Props) {
  const {colors} = useAppTheme();
  const styles = usePasswordInputStyles();
  const [visible, setVisible] = useState(false);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.borderSoft,
        },
      ]}>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        style={[styles.input, {color: colors.primaryText}]}
        accessibilityLabel={accessibilityLabel}
      />
      <Pressable
        onPress={() => setVisible(v => !v)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        style={styles.eyeHit}>
        <EyeIcon visible={visible} color={colors.secondaryText} />
      </Pressable>
    </View>
  );
}

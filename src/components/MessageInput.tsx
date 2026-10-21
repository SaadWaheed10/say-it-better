import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {MAX_MESSAGE_LENGTH} from '../constants/tones';
import {useAppTheme} from '../hooks/useAppTheme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  onClear?: () => void;
};

export function MessageInput({
  value,
  onChangeText,
  placeholder = 'Enter your message here…',
  maxLength = MAX_MESSAGE_LENGTH,
  onClear,
}: Props) {
  const {colors, typography, spacing, radii} = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: radii.lg,
          padding: spacing.md,
        },
      ]}>
      <TextInput
        value={value}
        onChangeText={text => onChangeText(text.slice(0, maxLength))}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        multiline
        textAlignVertical="top"
        style={[
          typography.body,
          styles.input,
          {color: colors.primaryText, minHeight: 140},
        ]}
        accessibilityLabel="Message input"
      />
      <View style={styles.footer}>
        {value.length > 0 && onClear ? (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Clear message"
            hitSlop={8}>
            <Text style={[typography.caption, {color: colors.primaryAccent}]}>
              Clear
            </Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Text style={[typography.caption, {color: colors.secondaryText}]}>
          {value.length}/{maxLength}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
  },
  input: {
    padding: 0,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

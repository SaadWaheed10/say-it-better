import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useAppTheme} from '../hooks/useAppTheme';

type Props = {
  title?: string;
  text: string;
  onCopy: () => void;
  compact?: boolean;
};

export function ResultCard({title, text, onCopy, compact = false}: Props) {
  const {colors, typography, spacing, radii} = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: radii.lg,
          padding: spacing.md,
        },
      ]}>
      {title ? (
        <Text
          style={[
            typography.caption,
            {color: colors.secondaryText, marginBottom: 8},
          ]}>
          {title}
        </Text>
      ) : null}
      <Text
        selectable
        style={[
          compact ? typography.body : typography.bodyMedium,
          {color: colors.primaryText},
        ]}>
        {text}
      </Text>
      <Pressable
        onPress={onCopy}
        accessibilityRole="button"
        accessibilityLabel="Copy message"
        style={[
          styles.copyButton,
          {
            backgroundColor: colors.primaryNavy,
            borderRadius: radii.pill,
            marginTop: spacing.sm,
          },
        ]}>
        <Text style={[typography.label, {color: colors.white}]}>Copy</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  copyButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
});

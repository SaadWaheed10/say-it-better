import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useResultCardStyles} from './ResultCard.styles';

type Props = {
  title?: string;
  text: string;
  onCopy: () => void;
  compact?: boolean;
};

export function ResultCard({title, text, onCopy, compact = false}: Props) {
  const {colors} = useAppTheme();
  const styles = useResultCardStyles();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceSolid,
          borderColor: colors.borderSoft,
        },
      ]}>
      {title ? (
        <Text style={[styles.title, {color: colors.secondaryText}]}>
          {title}
        </Text>
      ) : null}
      <Text
        selectable
        style={[
          compact ? styles.body : styles.bodyMedium,
          {color: colors.primaryText},
        ]}>
        {text}
      </Text>
      <Pressable
        onPress={onCopy}
        accessibilityRole="button"
        accessibilityLabel="Copy message"
        style={[styles.copyButton, {backgroundColor: colors.primaryNavy}]}>
        <Text style={[styles.copyLabel, {color: colors.white}]}>Copy</Text>
      </Pressable>
    </View>
  );
}

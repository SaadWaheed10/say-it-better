import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {TONES} from '../constants/tones';
import {useAppTheme} from '../hooks/useAppTheme';
import {ToneIcon} from './ToneIcon';

export function OnboardingToneIllustration() {
  const {colors, typography, radii, spacing} = useAppTheme();

  return (
    <View
      style={styles.wrap}
      accessibilityLabel="Tone options illustration">
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.lavenderSoft,
            borderRadius: radii.xl,
            padding: spacing.md,
          },
        ]}>
        <View
          style={[
            styles.messageCard,
            {
              backgroundColor: colors.background,
              borderRadius: radii.lg,
              borderColor: colors.border,
              marginBottom: spacing.sm,
            },
          ]}>
          <View style={[styles.line, {backgroundColor: colors.border, width: '88%'}]} />
          <View style={[styles.line, {backgroundColor: colors.border, width: '70%'}]} />
          <View style={[styles.line, {backgroundColor: colors.border, width: '56%'}]} />
        </View>
        <View style={styles.chipRow}>
          {TONES.map(tone => (
            <View
              key={tone.id}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: radii.pill,
                },
              ]}>
              <ToneIcon name={tone.icon} color={colors.primaryNavy} size={14} />
              <Text
                style={[
                  typography.caption,
                  {color: colors.primaryText, marginLeft: 6, fontWeight: '600'},
                ]}>
                {tone.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 320,
  },
  messageCard: {
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  line: {
    height: 8,
    borderRadius: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});

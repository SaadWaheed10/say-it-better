import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {TONES} from '../constants/tones';
import {useAppTheme} from '../hooks/useAppTheme';
import {ToneId} from '../types';
import {ToneIcon} from './ToneIcon';

type Props = {
  selected: ToneId;
  onSelect: (tone: ToneId) => void;
  tones?: typeof TONES;
};

export function ToneSelector({
  selected,
  onSelect,
  tones = TONES,
}: Props) {
  const {colors, typography, spacing, radii} = useAppTheme();

  return (
    <View style={styles.grid}>
      {tones.map(tone => {
        const isSelected = tone.id === selected;
        return (
          <Pressable
            key={tone.id}
            accessibilityRole="button"
            accessibilityState={{selected: isSelected}}
            accessibilityLabel={`${tone.label} tone`}
            onPress={() => onSelect(tone.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? colors.primaryNavy
                  : colors.background,
                borderColor: isSelected ? colors.primaryNavy : colors.border,
                borderRadius: radii.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.sm,
              },
            ]}>
            <ToneIcon
              name={tone.icon}
              color={isSelected ? colors.white : colors.primaryNavy}
            />
            <Text
              style={[
                typography.label,
                {
                  color: isSelected ? colors.white : colors.primaryText,
                  marginTop: 6,
                },
              ]}>
              {tone.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    width: '31%',
    minWidth: 96,
    flexGrow: 1,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 72,
    justifyContent: 'center',
  },
});

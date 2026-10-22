import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {TONES} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {ToneId} from '../../types';
import {ToneIcon} from '../ToneIcon';
import {useToneSelectorStyles} from './ToneSelector.styles';

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
  const {colors} = useAppTheme();
  const styles = useToneSelectorStyles();

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
                  ? colors.primaryAccent
                  : colors.surfaceSolid,
                borderColor: isSelected
                  ? colors.primaryAccent
                  : colors.borderSoft,
              },
            ]}>
            <ToneIcon
              name={tone.icon}
              color={isSelected ? colors.canvas : colors.primaryAccent}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? colors.canvas : colors.primaryText,
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

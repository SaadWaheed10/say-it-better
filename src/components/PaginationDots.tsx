import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useAppTheme} from '../hooks/useAppTheme';

type Props = {
  total: number;
  activeIndex: number;
};

export function PaginationDots({total, activeIndex}: Props) {
  const {colors} = useAppTheme();

  return (
    <View
      style={styles.row}
      accessibilityRole="tablist"
      accessibilityLabel={`Step ${activeIndex + 1} of ${total}`}>
      {Array.from({length: total}).map((_, index) => {
        const active = index === activeIndex;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: active
                  ? colors.primaryAccent
                  : colors.lavender,
                width: active ? 18 : 8,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
});

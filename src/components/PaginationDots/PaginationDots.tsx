import React from 'react';
import {View} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';
import {usePaginationDotsStyles} from './PaginationDots.styles';

type Props = {
  total: number;
  activeIndex: number;
};

export function PaginationDots({total, activeIndex}: Props) {
  const {colors} = useAppTheme();
  const styles = usePaginationDotsStyles();

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


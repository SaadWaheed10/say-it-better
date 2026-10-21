import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useAppTheme} from '../hooks/useAppTheme';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function ScreenHeader({title, onBack, right}: Props) {
  const {colors, typography, spacing} = useAppTheme();

  return (
    <View style={[styles.row, {paddingVertical: spacing.sm}]}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={styles.backButton}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                d="M15 18 l-6-6 6-6"
                stroke={colors.primaryNavy}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        ) : null}
      </View>
      <Text
        style={[
          typography.h3,
          {color: colors.primaryText, textAlign: 'center', flex: 1},
        ]}
        numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});

import React from 'react';
import {Pressable, Text, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useAppTheme} from '../../hooks/useAppTheme';
import {ri} from '../../theme/useScaledStyles';
import {useScreenHeaderStyles} from './ScreenHeader.styles';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function ScreenHeader({title, onBack, right}: Props) {
  const {colors, typography} = useAppTheme();
  const styles = useScreenHeaderStyles();

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={styles.backButton}>
            <Svg width={ri(22)} height={ri(22)} viewBox="0 0 24 24">
              <Path
                d="M15 18 l-6-6 6-6"
                stroke={colors.primaryAccent}
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
        style={[typography.h3, styles.title, {color: colors.primaryText}]}
        numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

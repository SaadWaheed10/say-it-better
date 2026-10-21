import React from 'react';
import {Text, View} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useEmptyStateStyles} from './EmptyState.styles';

type Props = {
  title: string;
  description?: string;
};

export function EmptyState({title, description}: Props) {
  const {colors, typography, spacing} = useAppTheme();
  const styles = useEmptyStateStyles();

  return (
    <View style={[styles.wrap, {padding: spacing.xl}]}>
      <Text
        style={[
          typography.h3,
          {color: colors.primaryText, textAlign: 'center'},
        ]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            typography.body,
            {
              color: colors.secondaryText,
              textAlign: 'center',
              marginTop: spacing.sm,
            },
          ]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}


import React from 'react';
import {Text, View} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useEmptyStateStyles} from './EmptyState.styles';

type Props = {
  title: string;
  description?: string;
};

export function EmptyState({title, description}: Props) {
  const {colors} = useAppTheme();
  const styles = useEmptyStateStyles();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.borderSoft,
        },
      ]}>
      <Text style={[styles.title, {color: colors.primaryText}]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, {color: colors.secondaryText}]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

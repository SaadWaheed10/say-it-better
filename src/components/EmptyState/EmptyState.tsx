import React from 'react';
import {Text, View} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';
import {AppButton} from '../AppButton';
import {useEmptyStateStyles} from './EmptyState.styles';

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
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
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

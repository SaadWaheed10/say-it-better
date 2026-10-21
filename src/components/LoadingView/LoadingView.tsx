import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useLoadingViewStyles} from './LoadingView.styles';

type Props = {
  message?: string;
};

export function LoadingView({
  message = 'Finding the right words…',
}: Props) {
  const {colors, typography, spacing} = useAppTheme();
  const styles = useLoadingViewStyles();

  return (
    <View style={[styles.wrap, {padding: spacing.xl}]}>
      <ActivityIndicator size="large" color={colors.primaryNavy} />
      <Text
        style={[
          typography.body,
          {color: colors.secondaryText, marginTop: spacing.md, textAlign: 'center'},
        ]}>
        {message}
      </Text>
    </View>
  );
}


import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useAppTheme} from '../hooks/useAppTheme';

type Props = {
  message?: string;
};

export function LoadingView({
  message = 'Finding the right words…',
}: Props) {
  const {colors, typography, spacing} = useAppTheme();

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

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

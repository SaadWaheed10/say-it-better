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
  const {colors} = useAppTheme();
  const styles = useLoadingViewStyles();

  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primaryNavy} />
      <Text style={[styles.message, {color: colors.secondaryText}]}>
        {message}
      </Text>
    </View>
  );
}

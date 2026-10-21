import React, {useCallback} from 'react';
import {BackHandler, Text, View} from 'react-native';
import {CompositeScreenProps, useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {LavenderBackdrop} from '../../components/LavenderBackdrop';
import {OnboardingToneIllustration} from '../../components/OnboardingToneIllustration';
import {PaginationDots} from '../../components/PaginationDots';
import {useAppTheme} from '../../hooks/useAppTheme';
import {markOnboardingCompleted} from '../../services/settingsService';
import {OnboardingStackParamList, RootStackParamList} from '../../types';
import {useOnboardingToneScreenStyles} from './OnboardingToneScreen.styles';

type Props = CompositeScreenProps<
  NativeStackScreenProps<OnboardingStackParamList, 'OnboardingTone'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function OnboardingToneScreen({navigation}: Props) {
  const {colors, typography, spacing} = useAppTheme();
  const styles = useOnboardingToneScreenStyles();

  const finish = useCallback(async () => {
    await markOnboardingCompleted();
    navigation.getParent()?.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.goBack();
        return true;
      });
      return () => sub.remove();
    }, [navigation]),
  );

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.background}]}
      edges={['top', 'bottom']}>
      <LavenderBackdrop />
      <View style={[styles.content, {paddingHorizontal: spacing.xl}]}>
        <View style={{width: '100%', marginBottom: spacing.xl}}>
          <OnboardingToneIllustration />
        </View>
        <Text
          style={[
            typography.h1,
            {color: colors.primaryText, textAlign: 'center'},
          ]}>
          Every message. The right tone.
        </Text>
        <Text
          style={[
            typography.body,
            {
              color: colors.secondaryText,
              textAlign: 'center',
              marginTop: spacing.sm,
            },
          ]}>
          Make every message sound the way you want. Choose a tone that fits
          your situation.
        </Text>
      </View>

      <View style={[styles.footer, {paddingHorizontal: spacing.xl}]}>
        <PaginationDots total={2} activeIndex={1} />
        <View style={[styles.actions, {marginTop: spacing.lg}]}>
          <AppButton
            label="Back"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={styles.sideButton}
            accessibilityLabel="Back to welcome"
          />
          <AppButton
            label="Skip"
            variant="ghost"
            onPress={finish}
            style={styles.sideButton}
            accessibilityLabel="Skip onboarding"
          />
        </View>
        <AppButton
          label="Get Started"
          onPress={finish}
          style={{marginTop: spacing.sm}}
          accessibilityLabel="Finish onboarding and go to home"
        />
      </View>
    </SafeAreaView>
  );
}

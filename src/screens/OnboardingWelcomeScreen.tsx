import React, {useCallback} from 'react';
import {BackHandler, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../components/AppButton';
import {BrandLogo} from '../components/BrandLogo';
import {LavenderBackdrop} from '../components/LavenderBackdrop';
import {OnboardingWelcomeIllustration} from '../components/OnboardingWelcomeIllustration';
import {PaginationDots} from '../components/PaginationDots';
import {APP_NAME, APP_TAGLINE} from '../constants/storage';
import {useAppTheme} from '../hooks/useAppTheme';
import {markOnboardingCompleted} from '../services/settingsService';
import {OnboardingStackParamList, RootStackParamList} from '../types';
import {CompositeScreenProps} from '@react-navigation/native';

type Props = CompositeScreenProps<
  NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWelcome'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function OnboardingWelcomeScreen({navigation}: Props) {
  const {colors, typography, spacing} = useAppTheme();

  const finish = useCallback(async () => {
    await markOnboardingCompleted();
    navigation.getParent()?.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, []),
  );

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.background}]}
      edges={['top', 'bottom']}>
      <LavenderBackdrop />
      <View style={[styles.content, {paddingHorizontal: spacing.xl}]}>
        <BrandLogo size={64} />
        <Text
          style={[
            typography.brand,
            {
              color: colors.primaryNavy,
              marginTop: spacing.sm,
              fontSize: 24,
            },
          ]}>
          {APP_NAME}
        </Text>
        <Text
          style={[
            typography.caption,
            {color: colors.secondaryText, marginTop: 4},
          ]}>
          {APP_TAGLINE}
        </Text>

        <View style={{marginVertical: spacing.xl}}>
          <OnboardingWelcomeIllustration />
        </View>

        <Text
          style={[
            typography.h1,
            {color: colors.primaryText, textAlign: 'center'},
          ]}>
          Say it better, every time.
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
          Turn your everyday messages into clear, natural writing that says
          exactly what you mean.
        </Text>
      </View>

      <View style={[styles.footer, {paddingHorizontal: spacing.xl}]}>
        <PaginationDots total={2} activeIndex={0} />
        <View style={[styles.actions, {marginTop: spacing.lg}]}>
          <AppButton
            label="Skip"
            variant="ghost"
            onPress={finish}
            style={styles.skip}
            accessibilityLabel="Skip onboarding"
          />
          <AppButton
            label="Continue"
            iconRight="→"
            onPress={() => navigation.navigate('OnboardingTone')}
            style={styles.continue}
            accessibilityLabel="Continue to next onboarding screen"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  skip: {
    minWidth: 88,
    paddingHorizontal: 8,
  },
  continue: {
    flex: 1,
  },
});

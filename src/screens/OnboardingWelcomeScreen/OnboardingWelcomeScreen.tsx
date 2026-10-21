import React, {useCallback} from 'react';
import {BackHandler, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CompositeScreenProps, useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {BrandLogo} from '../../components/BrandLogo';
import {LavenderBackdrop} from '../../components/LavenderBackdrop';
import {OnboardingWelcomeIllustration} from '../../components/OnboardingWelcomeIllustration';
import {PaginationDots} from '../../components/PaginationDots';
import {APP_NAME, APP_TAGLINE} from '../../constants/storage';
import {useAppTheme} from '../../hooks/useAppTheme';
import {markOnboardingCompleted} from '../../services/settingsService';
import {OnboardingStackParamList, RootStackParamList} from '../../types';
import {useOnboardingWelcomeScreenStyles} from './OnboardingWelcomeScreen.styles';

type Props = CompositeScreenProps<
  NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWelcome'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function OnboardingWelcomeScreen({navigation}: Props) {
  const {colors, typography, spacing} = useAppTheme();
  const styles = useOnboardingWelcomeScreenStyles();

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

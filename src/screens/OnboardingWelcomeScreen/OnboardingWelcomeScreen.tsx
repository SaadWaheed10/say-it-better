import React, {useCallback} from 'react';
import {BackHandler, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CompositeScreenProps, useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {BrandLogo} from '../../components/BrandLogo';
import {FadeIn} from '../../components/FadeIn';
import {OnboardingWelcomeIllustration} from '../../components/OnboardingWelcomeIllustration';
import {PaginationDots} from '../../components/PaginationDots';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {APP_TAGLINE} from '../../constants/storage';
import {useAppTheme} from '../../hooks/useAppTheme';
import {markOnboardingCompleted} from '../../services/settingsService';
import {OnboardingStackParamList, RootStackParamList} from '../../types';
import {useOnboardingWelcomeScreenStyles} from './OnboardingWelcomeScreen.styles';

type Props = CompositeScreenProps<
  NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWelcome'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function OnboardingWelcomeScreen({navigation}: Props) {
  const {colors} = useAppTheme();
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
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="onboarding" />
      <View style={styles.content}>
        <FadeIn>
          <BrandLogo size={68} />
          <Text style={[styles.brand, {color: colors.primaryText}]}>
            SayIt
            <Text style={{color: colors.primaryAccent}}>Better</Text>
          </Text>
          <Text style={[styles.tagline, {color: colors.secondaryText}]}>
            {APP_TAGLINE}
          </Text>
        </FadeIn>

        <FadeIn delay={100} style={styles.illustration}>
          <OnboardingWelcomeIllustration />
        </FadeIn>

        <FadeIn delay={180}>
          <Text style={[styles.title, {color: colors.primaryText}]}>
            Say it better, every time.
          </Text>
          <Text style={[styles.body, {color: colors.secondaryText}]}>
            Turn your everyday messages into clear, natural writing that says
            exactly what you mean.
          </Text>
        </FadeIn>
      </View>

      <FadeIn delay={240} style={styles.footer}>
        <PaginationDots total={2} activeIndex={0} />
        <View style={styles.actions}>
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
      </FadeIn>
    </SafeAreaView>
  );
}

import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BrandLogo} from '../../components/BrandLogo';
import {FadeIn} from '../../components/FadeIn';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {APP_NAME, APP_TAGLINE} from '../../constants/storage';
import {useAppTheme} from '../../hooks/useAppTheme';
import {initializeModel} from '../../services/aiService';
import {isOnboardingCompleted} from '../../services/settingsService';
import {RootStackParamList} from '../../types';
import {useSplashScreenStyles} from './SplashScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const MIN_SPLASH_MS = 900;
const MAX_WAIT_MS = 2500;

export function SplashScreen({navigation}: Props) {
  const {colors} = useAppTheme();
  const styles = useSplashScreenStyles();
  const navigated = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const started = Date.now();

      const onboardingPromise = isOnboardingCompleted();
      const modelPromise = Promise.race([
        initializeModel().catch(() => undefined),
        new Promise<void>(resolve => {
          setTimeout(() => resolve(), MAX_WAIT_MS);
        }),
      ]);

      const [completed] = await Promise.all([onboardingPromise, modelPromise]);

      const elapsed = Date.now() - started;
      if (elapsed < MIN_SPLASH_MS) {
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), MIN_SPLASH_MS - elapsed);
        });
      }

      if (cancelled || navigated.current) {
        return;
      }
      navigated.current = true;

      if (completed) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Onboarding');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="splash" />
      <View style={styles.content}>
        <FadeIn>
          <BrandLogo size={96} />
        </FadeIn>
        <FadeIn delay={80}>
          <Text style={[styles.brand, {color: colors.primaryNavy}]}>
            {APP_NAME}
          </Text>
        </FadeIn>
        <FadeIn delay={140}>
          <Text style={[styles.tagline, {color: colors.secondaryText}]}>
            {APP_TAGLINE}
          </Text>
        </FadeIn>
      </View>
      <ActivityIndicator
        color={colors.primaryAccent}
        style={styles.loader}
      />
    </SafeAreaView>
  );
}

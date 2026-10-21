import React, {useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BrandLogo} from '../components/BrandLogo';
import {LavenderBackdrop} from '../components/LavenderBackdrop';
import {APP_NAME, APP_TAGLINE} from '../constants/storage';
import {useAppTheme} from '../hooks/useAppTheme';
import {initializeModel} from '../services/aiService';
import {isOnboardingCompleted} from '../services/settingsService';
import {RootStackParamList} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const MIN_SPLASH_MS = 900;
const MAX_WAIT_MS = 2500;

export function SplashScreen({navigation}: Props) {
  const {colors, typography, spacing} = useAppTheme();
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
      style={[styles.safe, {backgroundColor: colors.background}]}
      edges={['top', 'bottom']}>
      <LavenderBackdrop variant="splash" />
      <View style={styles.content}>
        <BrandLogo size={88} />
        <Text
          style={[
            typography.brand,
            {color: colors.primaryNavy, marginTop: spacing.md},
          ]}>
          {APP_NAME}
        </Text>
        <Text
          style={[
            typography.body,
            {color: colors.secondaryText, marginTop: spacing.xs},
          ]}>
          {APP_TAGLINE}
        </Text>
      </View>
      <ActivityIndicator
        color={colors.primaryAccent}
        style={{marginBottom: spacing.xxl}}
      />
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
    paddingHorizontal: 24,
  },
});

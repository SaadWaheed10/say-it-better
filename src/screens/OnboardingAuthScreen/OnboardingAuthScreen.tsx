import React, {useCallback} from 'react';
import {BackHandler, Text, View} from 'react-native';
import {CompositeScreenProps, useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {BrandLogo} from '../../components/BrandLogo';
import {FadeIn} from '../../components/FadeIn';
import {OnboardingAuthIllustration} from '../../components/OnboardingAuthIllustration';
import {PaginationDots} from '../../components/PaginationDots';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {useAppTheme} from '../../hooks/useAppTheme';
import {markOnboardingCompleted} from '../../services/settingsService';
import {OnboardingStackParamList, RootStackParamList} from '../../types';
import {useOnboardingAuthScreenStyles} from './OnboardingAuthScreen.styles';

type Props = CompositeScreenProps<
  NativeStackScreenProps<OnboardingStackParamList, 'OnboardingAuth'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function OnboardingAuthScreen({navigation}: Props) {
  const {colors} = useAppTheme();
  const styles = useOnboardingAuthScreenStyles();

  const enterApp = useCallback(async () => {
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
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="onboarding" />
      <View style={styles.content}>
        <FadeIn style={styles.brandRow}>
          <BrandLogo size={56} />
          <Text style={[styles.brand, {color: colors.primaryText}]}>
            SayIt
            <Text style={{color: colors.primaryAccent}}>Better</Text>
          </Text>
          <LinearGradient
            colors={[
              colors.primaryAccent,
              colors.accentWarm,
              colors.accentRose,
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.brandUnderline}
          />
        </FadeIn>

        <FadeIn delay={80} style={styles.illustration}>
          <OnboardingAuthIllustration />
        </FadeIn>

        <FadeIn delay={140}>
          <Text style={[styles.title, {color: colors.primaryText}]}>
            Keep your streak with you.
          </Text>
          <Text style={[styles.body, {color: colors.secondaryText}]}>
            Optional account for scores and reviews across devices. Your writing
            stays on this phone unless you choose to sync it later.
          </Text>
        </FadeIn>
      </View>

      <FadeIn delay={200} style={styles.footer}>
        <PaginationDots total={4} activeIndex={3} />
        <View style={styles.actions}>
          <AppButton
            label="Back"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={styles.sideButton}
            accessibilityLabel="Back to hear and speak demo"
          />
          <AppButton
            label="Sign in"
            variant="secondary"
            onPress={() =>
              navigation.getParent()?.navigate('SignIn', {
                fromOnboarding: true,
              })
            }
            style={styles.sideButton}
            accessibilityLabel="Sign in"
          />
        </View>
        <AppButton
          label="Create account"
          iconRight="→"
          onPress={() =>
            navigation.getParent()?.navigate('SignUp', {
              fromOnboarding: true,
            })
          }
          style={styles.primaryCta}
          accessibilityLabel="Create an account"
        />
        <AppButton
          label="Continue without account"
          variant="ghost"
          onPress={enterApp}
          style={styles.ghostCta}
          accessibilityLabel="Continue without creating an account"
          accessibilityHint="You can sign in later from Settings"
        />
      </FadeIn>
    </SafeAreaView>
  );
}

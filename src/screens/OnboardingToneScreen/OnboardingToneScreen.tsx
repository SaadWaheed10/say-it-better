import React, {useCallback} from 'react';
import {BackHandler, Text, View} from 'react-native';
import {CompositeScreenProps, useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {FadeIn} from '../../components/FadeIn';
import {OnboardingToneIllustration} from '../../components/OnboardingToneIllustration';
import {PaginationDots} from '../../components/PaginationDots';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {useAppTheme} from '../../hooks/useAppTheme';
import {OnboardingStackParamList, RootStackParamList} from '../../types';
import {useOnboardingToneScreenStyles} from './OnboardingToneScreen.styles';

type Props = CompositeScreenProps<
  NativeStackScreenProps<OnboardingStackParamList, 'OnboardingTone'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function OnboardingToneScreen({navigation}: Props) {
  const {colors} = useAppTheme();
  const styles = useOnboardingToneScreenStyles();

  const skipToAuth = useCallback(() => {
    navigation.navigate('OnboardingAuth');
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
        <FadeIn style={styles.illustration}>
          <OnboardingToneIllustration />
        </FadeIn>
        <FadeIn delay={100}>
          <Text style={[styles.title, {color: colors.primaryText}]}>
            Every message. The right tone.
          </Text>
          <Text style={[styles.body, {color: colors.secondaryText}]}>
            Make every message sound the way you want. Choose a tone that fits
            your situation.
          </Text>
        </FadeIn>
      </View>

      <FadeIn delay={180} style={styles.footer}>
        <PaginationDots total={4} activeIndex={1} />
        <View style={styles.actions}>
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
            onPress={skipToAuth}
            style={styles.sideButton}
            accessibilityLabel="Skip to account step"
          />
        </View>
        <AppButton
          label="Continue"
          iconRight="→"
          onPress={() => navigation.navigate('OnboardingModes')}
          style={styles.primaryCta}
          accessibilityLabel="Continue to hear and speak demo"
        />
      </FadeIn>
    </SafeAreaView>
  );
}

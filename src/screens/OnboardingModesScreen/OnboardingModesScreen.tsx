import React, {useCallback, useState} from 'react';
import {BackHandler, Text, View} from 'react-native';
import {CompositeScreenProps, useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {FadeIn} from '../../components/FadeIn';
import {PaginationDots} from '../../components/PaginationDots';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useVoiceInput} from '../../hooks/useVoiceInput';
import {hapticSelection, hapticSuccess} from '../../services/hapticService';
import {markOnboardingCompleted} from '../../services/settingsService';
import {speakText, stopSpeaking} from '../../services/ttsService';
import {OnboardingStackParamList, RootStackParamList} from '../../types';
import {useOnboardingModesScreenStyles} from './OnboardingModesScreen.styles';

type Props = CompositeScreenProps<
  NativeStackScreenProps<OnboardingStackParamList, 'OnboardingModes'>,
  NativeStackScreenProps<RootStackParamList>
>;

const SAMPLE_QUESTION =
  'Choose the clearer workplace line. Option A: Going forward circle back. Option B: Let’s combine the drafts by Friday.';

export function OnboardingModesScreen({navigation}: Props) {
  const {colors} = useAppTheme();
  const styles = useOnboardingModesScreenStyles();
  const [hearStatus, setHearStatus] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);

  const voice = useVoiceInput({
    onTranscript: text => {
      hapticSuccess();
      setVoiceStatus(`Heard: “${text.trim()}”`);
    },
    onError: detail => setVoiceStatus(detail),
  });

  const finish = useCallback(async () => {
    void stopSpeaking();
    void voice.cancel();
    await markOnboardingCompleted();
    navigation.getParent()?.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  }, [navigation, voice]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        void stopSpeaking();
        navigation.goBack();
        return true;
      });
      return () => {
        sub.remove();
        void stopSpeaking();
        void voice.cancel();
      };
    }, [navigation, voice]),
  );

  const onHear = async () => {
    hapticSelection();
    void voice.cancel();
    setHearStatus('Playing…');
    const ok = await speakText(SAMPLE_QUESTION);
    setHearStatus(
      ok
        ? 'That’s Hear question — available on every skill test.'
        : 'Audio unavailable on this device — you can still read questions.',
    );
  };

  const onSpeak = () => {
    hapticSelection();
    void stopSpeaking();
    setVoiceStatus(
      voice.isRecording
        ? 'Tap Done when finished'
        : 'Say a short answer, then tap Done',
    );
    if (voice.isRecording) {
      void voice.stop();
    } else {
      void voice.begin();
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="onboarding" />
      <View style={styles.content}>
        <FadeIn>
          <Text style={[styles.title, {color: colors.primaryText}]}>
            Hear it. Speak it.
          </Text>
          <Text style={[styles.body, {color: colors.secondaryText}]}>
            Skill tests support both reading and listening — and you can type
            or speak your answers.
          </Text>
        </FadeIn>

        <FadeIn delay={80}>
          <View
            style={[
              styles.demoCard,
              {
                backgroundColor: colors.accentWash,
                borderColor: `${colors.primaryAccent}44`,
              },
            ]}
            accessibilityRole="summary"
            accessibilityLabel="Demo: hear a sample question">
            <Text style={[styles.demoTitle, {color: colors.primaryAccent}]}>
              Hear question
            </Text>
            <Text style={[styles.demoBody, {color: colors.secondaryText}]}>
              Don’t want to read? Play the question aloud.
            </Text>
            <Text style={[styles.demoPrompt, {color: colors.primaryText}]}>
              “Choose the clearer workplace line…”
            </Text>
            <AppButton
              label="Try Hear question"
              variant="secondary"
              onPress={onHear}
              accessibilityLabel="Play a sample skill test question aloud"
              accessibilityHint="Uses on-device text to speech"
            />
            {hearStatus ? (
              <Text
                style={[styles.status, {color: colors.secondaryText}]}
                accessibilityLiveRegion="polite">
                {hearStatus}
              </Text>
            ) : null}
          </View>
        </FadeIn>

        <FadeIn delay={140}>
          <View
            style={[
              styles.demoCard,
              {
                backgroundColor: colors.warmWash,
                borderColor: `${colors.accentWarm}44`,
              },
            ]}
            accessibilityRole="summary"
            accessibilityLabel="Demo: speak your answer">
            <Text style={[styles.demoTitle, {color: colors.accentWarm}]}>
              Speak answer
            </Text>
            <Text style={[styles.demoBody, {color: colors.secondaryText}]}>
              Prefer talking? Dictate MCQ letters or a full rewrite.
            </Text>
            {voice.isRecording ? (
              <View style={{gap: 8}}>
                <AppButton
                  label="Done"
                  onPress={() => {
                    void voice.stop();
                  }}
                  accessibilityLabel="Finish recording and transcribe"
                />
                <AppButton
                  label="Cancel"
                  variant="ghost"
                  onPress={() => {
                    void voice.cancel();
                    setVoiceStatus(null);
                  }}
                  accessibilityLabel="Cancel voice recording"
                />
              </View>
            ) : (
              <AppButton
                label={
                  voice.isTranscribing || voice.isLoadingModel
                    ? 'Listening…'
                    : 'Try Speak answer'
                }
                variant="secondary"
                disabled={voice.busy || voice.isTranscribing}
                onPress={onSpeak}
                accessibilityLabel="Record a spoken answer with the microphone"
                accessibilityHint="Audio stays on your device"
              />
            )}
            {voiceStatus ? (
              <Text
                style={[styles.status, {color: colors.secondaryText}]}
                accessibilityLiveRegion="polite">
                {voiceStatus}
              </Text>
            ) : null}
          </View>
        </FadeIn>
      </View>

      <FadeIn delay={180} style={styles.footer}>
        <PaginationDots total={3} activeIndex={2} />
        <View style={styles.actions}>
          <AppButton
            label="Back"
            variant="ghost"
            onPress={() => {
              void stopSpeaking();
              navigation.goBack();
            }}
            style={styles.sideButton}
            accessibilityLabel="Back to tone screen"
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
          style={styles.primaryCta}
          accessibilityLabel="Finish onboarding and go to home"
        />
      </FadeIn>
    </SafeAreaView>
  );
}

import React, {useMemo, useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {showAppAlert} from '../../components/AppModal';
import {FadeIn} from '../../components/FadeIn';
import {LoadingView} from '../../components/LoadingView';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {pickPracticePrompt} from '../../constants/practice';
import {TONES} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {improveMessage} from '../../services/aiService';
import {hapticSuccess} from '../../services/hapticService';
import {PracticePrompt, RootStackParamList} from '../../types';
import {usePracticeScreenStyles} from './PracticeScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Practice'>;

export function PracticeScreen({navigation}: Props) {
  const {colors} = useAppTheme();
  const styles = usePracticeScreenStyles();
  const [prompt, setPrompt] = useState<PracticePrompt>(() =>
    pickPracticePrompt(),
  );
  const [attempt, setAttempt] = useState('');
  const [modelAnswer, setModelAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toneLabel = useMemo(
    () => TONES.find(t => t.id === prompt.tone)?.label ?? prompt.tone,
    [prompt.tone],
  );

  const onCheck = async () => {
    if (!attempt.trim()) {
      setError('Write your corrected version first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await improveMessage({
        message: prompt.rough,
        tone: prompt.tone,
        instruction: 'Return one natural corrected English sentence only.',
      });
      setModelAnswer(result.improved);
      hapticSuccess();
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : 'Could not check your practice.';
      setError(detail);
      showAppAlert('Practice check failed', detail);
    } finally {
      setLoading(false);
    }
  };

  const onNext = () => {
    setPrompt(pickPracticePrompt(prompt.id));
    setAttempt('');
    setModelAnswer(null);
    setError(null);
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <View style={styles.body}>
        <ScreenHeader title="Practice" onBack={() => navigation.goBack()} />
        {loading ? (
          <LoadingView message="Checking your rewrite…" />
        ) : (
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <FadeIn>
              <Text style={[styles.lead, {color: colors.secondaryText}]}>
                Rewrite the rough phrase in clearer English, then compare with
                the on-device suggestion.
              </Text>
              <View
                style={[
                  styles.promptCard,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}>
                <Text
                  style={[styles.promptLabel, {color: colors.primaryAccent}]}>
                  ROUGH PHRASE · {toneLabel.toUpperCase()}
                </Text>
                <Text style={[styles.promptText, {color: colors.primaryText}]}>
                  {prompt.rough}
                </Text>
                <Text style={[styles.hint, {color: colors.secondaryText}]}>
                  Hint: {prompt.hint}
                </Text>
              </View>

              <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
                Your rewrite
              </Text>
              <TextInput
                value={attempt}
                onChangeText={text => {
                  setAttempt(text);
                  if (error) {
                    setError(null);
                  }
                }}
                placeholder="Type a clearer version…"
                placeholderTextColor={colors.secondaryText}
                multiline
                style={[
                  styles.input,
                  {
                    color: colors.primaryText,
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}
              />

              {error ? (
                <Text style={[styles.error, {color: colors.error}]}>{error}</Text>
              ) : null}

              <View style={styles.actions}>
                <AppButton
                  label="Compare with model"
                  onPress={onCheck}
                  disabled={!attempt.trim()}
                />
                <AppButton
                  label="Next phrase"
                  variant="secondary"
                  onPress={onNext}
                />
              </View>

              {modelAnswer ? (
                <View
                  style={[
                    styles.compareCard,
                    {
                      backgroundColor: colors.accentWash,
                      borderColor: `${colors.primaryAccent}55`,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.compareLabel,
                      {color: colors.primaryAccent},
                    ]}>
                    YOUR VERSION
                  </Text>
                  <Text
                    style={[styles.compareText, {color: colors.primaryText}]}>
                    {attempt.trim()}
                  </Text>
                  <Text
                    style={[
                      styles.compareLabel,
                      {color: colors.accentWarm, marginTop: 14},
                    ]}>
                    MODEL SUGGESTION
                  </Text>
                  <Text
                    style={[styles.compareText, {color: colors.primaryText}]}>
                    {modelAnswer}
                  </Text>
                </View>
              ) : null}
            </FadeIn>
          </KeyboardAwareScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

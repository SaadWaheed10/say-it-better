import React, {useMemo, useState} from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {showAppAlert} from '../../components/AppModal';
import {FadeIn} from '../../components/FadeIn';
import {LoadingView} from '../../components/LoadingView';
import {MessageInput} from '../../components/MessageInput';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {ToneSelector} from '../../components/ToneSelector';
import {DEFAULT_TONE} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useVoiceInput} from '../../hooks/useVoiceInput';
import {improveMessage} from '../../services/aiService';
import {addHistoryItem} from '../../services/historyService';
import {hapticSuccess} from '../../services/hapticService';
import {getSettings} from '../../services/settingsService';
import {
  dismissImproveTip,
  isImproveTipDismissed,
} from '../../services/tipService';
import {releaseVoiceResources} from '../../services/voiceService';
import {RootStackParamList, ToneId} from '../../types';
import {useImproveMessageScreenStyles} from './ImproveMessageScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ImproveMessage'>;

export function ImproveMessageScreen({navigation, route}: Props) {
  const {colors} = useAppTheme();
  const styles = useImproveMessageScreenStyles();
  const [message, setMessage] = useState(route.params?.message ?? '');
  const [tone, setTone] = useState<ToneId>(
    route.params?.tone ?? DEFAULT_TONE,
  );
  const [instruction, setInstruction] = useState(
    route.params?.instruction ?? '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [defaultsLoaded, setDefaultsLoaded] = useState(
    Boolean(route.params?.tone),
  );

  const voice = useVoiceInput({
    onTranscript: text => {
      setMessage(prev => {
        const next = prev.trim().length > 0 ? `${prev.trim()} ${text}` : text;
        return next;
      });
      setError(null);
    },
    onError: detail => {
      setError(detail);
    },
  });

  React.useEffect(() => {
    return () => {
      void releaseVoiceResources();
    };
  }, []);

  React.useEffect(() => {
    if (route.params?.message != null) {
      setMessage(route.params.message);
    }
    if (route.params?.instruction != null) {
      setInstruction(route.params.instruction);
    }
    if (route.params?.tone != null) {
      setTone(route.params.tone);
    }
  }, [
    route.params?.message,
    route.params?.instruction,
    route.params?.tone,
  ]);

  React.useEffect(() => {
    isImproveTipDismissed().then(dismissed => setShowTip(!dismissed));
  }, []);

  React.useEffect(() => {
    if (defaultsLoaded) {
      return;
    }
    getSettings().then(settings => {
      if (!route.params?.tone) {
        setTone(settings.defaultTone);
      }
      setDefaultsLoaded(true);
    });
  }, [defaultsLoaded, route.params?.tone]);

  const canSubmit = useMemo(
    () =>
      message.trim().length > 0 &&
      !loading &&
      !voice.isRecording &&
      !voice.isTranscribing &&
      !voice.isLoadingModel,
    [
      message,
      loading,
      voice.isRecording,
      voice.isTranscribing,
      voice.isLoadingModel,
    ],
  );

  const onSubmit = async () => {
    if (!canSubmit) {
      setError('Enter a message before improving it.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await improveMessage({
        message,
        tone,
        instruction,
      });
      const historyItem = await addHistoryItem(result);
      hapticSuccess();
      navigation.navigate('Results', {
        original: result.original,
        improved: result.improved,
        alternatives: result.alternatives,
        tone: result.tone,
        historyId: historyItem.id,
      });
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : 'Something went wrong.';
      setError(detail);
      showAppAlert('Could not improve message', detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <View style={styles.body}>
        <ScreenHeader
          title="Correct phrase"
          onBack={() => navigation.goBack()}
        />
        {loading ? (
          <LoadingView />
        ) : (
          <KeyboardAwareScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid
            enableAutomaticScroll
            keyboardShouldPersistTaps="handled"
            keyboardOpeningTime={0}
            extraScrollHeight={24}
            extraHeight={120}
            showsVerticalScrollIndicator={false}
            enableResetScrollToCoords={false}>
            {showTip ? (
              <FadeIn>
                <View
                  style={[
                    styles.tip,
                    {
                      backgroundColor: colors.accentWash,
                      borderColor: `${colors.primaryAccent}44`,
                    },
                  ]}>
                  <Text style={[styles.tipText, {color: colors.primaryText}]}>
                    Tip: speak or type rough English — even broken grammar is
                    fine. We correct the phrase, we don’t answer it.
                  </Text>
                  <Pressable
                    onPress={async () => {
                      await dismissImproveTip();
                      setShowTip(false);
                    }}
                    hitSlop={8}>
                    <Text
                      style={[styles.tipDismiss, {color: colors.primaryAccent}]}>
                      Got it
                    </Text>
                  </Pressable>
                </View>
              </FadeIn>
            ) : null}

            <FadeIn>
              <Text style={[styles.hint, {color: colors.secondaryText}]}>
                Type or speak your rough English. We’ll return the corrected
                phrase — not an answer to it.
              </Text>
              <MessageInput
                value={message}
                onChangeText={text => {
                  setMessage(text);
                  if (error) {
                    setError(null);
                  }
                }}
                onClear={() => setMessage('')}
                voice={{
                  status: voice.status,
                  statusMessage:
                    voice.status === 'idle' &&
                    voice.voice.message === 'Voice input is ready.'
                      ? undefined
                      : voice.voice.message,
                  isRecording: voice.isRecording,
                  isTranscribing: voice.isTranscribing,
                  isLoadingModel: voice.isLoadingModel,
                  disabled: loading || voice.busy,
                  onMicPress: () => {
                    void voice.begin();
                  },
                  onStopPress: () => {
                    void voice.stop();
                  },
                  onCancelPress: () => {
                    void voice.cancel();
                  },
                }}
              />
            </FadeIn>

            <FadeIn delay={80}>
              <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
                Choose a tone
              </Text>
              <ToneSelector selected={tone} onSelect={setTone} />
            </FadeIn>

            <FadeIn delay={140}>
              <Text
                style={[styles.instructionLabel, {color: colors.primaryText}]}>
                Optional instruction
              </Text>
              <TextInput
                value={instruction}
                onChangeText={setInstruction}
                placeholder="Make it warmer without sounding unprofessional."
                placeholderTextColor={colors.secondaryText}
                style={[
                  styles.instruction,
                  {
                    color: colors.primaryText,
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.surfaceSolid,
                  },
                ]}
              />

              {error ? (
                <Text style={[styles.error, {color: colors.error}]}>
                  {error}
                </Text>
              ) : null}

              <AppButton
                label="Correct my phrase"
                onPress={onSubmit}
                disabled={!canSubmit}
                style={styles.submit}
                accessibilityLabel="Correct my phrase"
              />
            </FadeIn>
          </KeyboardAwareScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

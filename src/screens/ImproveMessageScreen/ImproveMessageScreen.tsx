import React, {useMemo, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {FadeIn} from '../../components/FadeIn';
import {LoadingView} from '../../components/LoadingView';
import {MessageInput} from '../../components/MessageInput';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {ToneSelector} from '../../components/ToneSelector';
import {DEFAULT_TONE} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {improveMessage} from '../../services/aiService';
import {addHistoryItem} from '../../services/historyService';
import {getSettings} from '../../services/settingsService';
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
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultsLoaded, setDefaultsLoaded] = useState(
    Boolean(route.params?.tone),
  );

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
    () => message.trim().length > 0 && !loading,
    [message, loading],
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
      navigation.replace('Results', {
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
      Alert.alert('Could not improve message', detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.body}>
          <ScreenHeader
            title="Improve Message"
            onBack={() => navigation.goBack()}
          />
          {loading ? (
            <LoadingView />
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              <FadeIn>
                <MessageInput
                  value={message}
                  onChangeText={text => {
                    setMessage(text);
                    if (error) {
                      setError(null);
                    }
                  }}
                  onClear={() => setMessage('')}
                />
              </FadeIn>

              <FadeIn delay={80}>
                <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
                  Choose a Tone
                </Text>
                <ToneSelector selected={tone} onSelect={setTone} />
              </FadeIn>

              <FadeIn delay={140}>
                <Text
                  style={[
                    styles.instructionLabel,
                    {color: colors.primaryText},
                  ]}>
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
                  label="Improve with AI"
                  onPress={onSubmit}
                  disabled={!canSubmit}
                  style={styles.submit}
                  accessibilityLabel="Improve with AI"
                />
              </FadeIn>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

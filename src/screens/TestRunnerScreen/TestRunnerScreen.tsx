import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  BackHandler,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path, Rect} from 'react-native-svg';
import {AppButton} from '../../components/AppButton';
import {showAppAlert} from '../../components/AppModal';
import {LoadingView} from '../../components/LoadingView';
import {PressScale} from '../../components/PressScale';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useVoiceInput} from '../../hooks/useVoiceInput';
import {
  hapticLight,
  hapticSelection,
  hapticSuccess,
} from '../../services/hapticService';
import {
  buildRandomTestSession,
  clearPausedSession,
  finalizeAttempt,
  getPausedSession,
  isModelReadyForWritten,
  savePausedSession,
  saveTestAttempt,
  matchSpokenChoice,
  scoreFillBlank,
  scoreListening,
  scoreMcq,
  scoreWritten,
  scoreWrittenOffline,
} from '../../services/testService';
import {
  speakText,
  stopSpeaking,
  subscribeSpeaking,
} from '../../services/ttsService';
import {ri} from '../../theme/useScaledStyles';
import {
  RootStackParamList,
  TestAnswerRecord,
  TestPack,
  TestQuestion,
} from '../../types';
import {useTestRunnerScreenStyles} from './TestRunnerScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'TestRunner'>;

function kindLabel(kind: TestQuestion['kind']): string {
  if (kind === 'mcq') {
    return 'Multiple choice';
  }
  if (kind === 'fill') {
    return 'Fill in the blank';
  }
  if (kind === 'listening') {
    return 'Listening';
  }
  return 'Written';
}

/** Spoken narration so learners can hear the question instead of reading. */
function buildQuestionNarration(question: TestQuestion): string {
  const optionLine = (options: string[]) =>
    options
      .map((option, i) => `Option ${String.fromCharCode(65 + i)}: ${option}`)
      .join('. ');

  if (question.kind === 'mcq') {
    return `${question.prompt}. ${optionLine(question.options)}`;
  }
  if (question.kind === 'fill') {
    const sentence = question.sentence.replace(/_+/g, 'blank');
    return `${question.prompt}. The sentence is: ${sentence}. ${optionLine(question.options)}`;
  }
  if (question.kind === 'listening') {
    return `${question.prompt}. Then play the listening audio when you are ready.`;
  }
  return `${question.prompt}. Rough version: ${question.rough}. Hint: ${question.hint}`;
}

type ThemeColors = ReturnType<typeof useAppTheme>['colors'];
type RunnerStyles = ReturnType<typeof useTestRunnerScreenStyles>;

function SpeakerIcon({color, size = 16}: {color: string; size?: number}) {
  return (
    <Svg width={ri(size)} height={ri(size)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5L6 9H3v6h3l5 4V5z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 8.5a5 5 0 010 7M18.5 6a9 9 0 010 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MicIcon({color, size = 16}: {color: string; size?: number}) {
  return (
    <Svg width={ri(size)} height={ri(size)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M5 11a7 7 0 0014 0M12 18v3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StopIcon({color, size = 14}: {color: string; size?: number}) {
  return (
    <Svg width={ri(size)} height={ri(size)} viewBox="0 0 24 24" fill="none">
      <Rect x={6} y={6} width={12} height={12} rx={2} fill={color} />
    </Svg>
  );
}

type AudioTone = 'teal' | 'warm' | 'rose' | 'muted';

function audioPalette(tone: AudioTone, colors: ThemeColors) {
  if (tone === 'teal') {
    return {
      bg: colors.accentWash,
      border: `${colors.primaryAccent}66`,
      iconBg: `${colors.primaryAccent}28`,
      fg: colors.primaryAccent,
    };
  }
  if (tone === 'warm') {
    return {
      bg: colors.warmWash,
      border: `${colors.accentWarm}66`,
      iconBg: `${colors.accentWarm}28`,
      fg: colors.accentWarm,
    };
  }
  if (tone === 'rose') {
    return {
      bg: colors.errorSoft,
      border: `${colors.accentRose}66`,
      iconBg: `${colors.accentRose}28`,
      fg: colors.accentRose,
    };
  }
  return {
    bg: colors.surfaceSolid,
    border: colors.borderSoft,
    iconBg: colors.navyWash,
    fg: colors.secondaryText,
  };
}

type AudioActionButtonProps = {
  label: string;
  sublabel?: string;
  icon: 'speaker' | 'mic' | 'stop';
  onPress: () => void;
  disabled?: boolean;
  tone: AudioTone;
  colors: ThemeColors;
  styles: RunnerStyles;
  pair?: boolean;
};

function AudioActionButton({
  label,
  sublabel,
  icon,
  onPress,
  disabled,
  tone,
  colors,
  styles,
  pair,
}: AudioActionButtonProps) {
  const palette = audioPalette(tone, colors);
  const iconEl =
    icon === 'speaker' ? (
      <SpeakerIcon color={palette.fg} size={18} />
    ) : icon === 'mic' ? (
      <MicIcon color={palette.fg} size={18} />
    ) : (
      <StopIcon color={palette.fg} size={16} />
    );

  return (
    <PressScale
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        pair ? styles.audioPairBtn : styles.audioBtn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}>
      <View style={styles.audioBtnInner}>
        <View style={[styles.audioIconWrap, {backgroundColor: palette.iconBg}]}>
          {iconEl}
        </View>
        <View style={styles.audioChipTextCol}>
          <Text
            style={[styles.audioChipLabel, {color: palette.fg}]}
            numberOfLines={1}>
            {label}
          </Text>
          {sublabel ? (
            <Text
              style={[styles.audioChipSub, {color: colors.secondaryText}]}
              numberOfLines={1}>
              {sublabel}
            </Text>
          ) : null}
        </View>
      </View>
    </PressScale>
  );
}

type QuestionAudioBarProps = {
  speaking: boolean;
  onHear: () => void;
  onStop: () => void;
  colors: ThemeColors;
  styles: RunnerStyles;
};

function QuestionAudioBar({
  speaking,
  onHear,
  onStop,
  colors,
  styles,
}: QuestionAudioBarProps) {
  const stopPalette = audioPalette(speaking ? 'rose' : 'muted', colors);
  return (
    <View style={styles.audioStack}>
      <View style={styles.audioRow}>
        <PressScale
          onPress={onHear}
          accessibilityRole="button"
          accessibilityLabel={speaking ? 'Playing question' : 'Hear question'}
          style={[
            styles.audioRowMain,
            {
              backgroundColor: audioPalette('teal', colors).bg,
              borderColor: audioPalette('teal', colors).border,
            },
          ]}>
          <View style={styles.audioBtnInner}>
            <View
              style={[
                styles.audioIconWrap,
                {backgroundColor: audioPalette('teal', colors).iconBg},
              ]}>
              <SpeakerIcon color={audioPalette('teal', colors).fg} size={16} />
            </View>
            <View style={styles.audioChipTextCol}>
              <Text
                style={[
                  styles.audioChipLabel,
                  {color: audioPalette('teal', colors).fg},
                ]}
                numberOfLines={1}>
                {speaking ? 'Playing…' : 'Hear question'}
              </Text>
            </View>
          </View>
        </PressScale>
        <PressScale
          disabled={!speaking}
          onPress={onStop}
          accessibilityRole="button"
          accessibilityLabel="Stop audio"
          style={[
            styles.audioRowSide,
            {
              backgroundColor: stopPalette.bg,
              borderColor: stopPalette.border,
              opacity: speaking ? 1 : 0.4,
            },
          ]}>
          <View style={styles.audioRowSideInner}>
            <StopIcon color={stopPalette.fg} size={14} />
            <Text style={[styles.audioRowSideLabel, {color: stopPalette.fg}]}>
              Stop
            </Text>
          </View>
        </PressScale>
      </View>
    </View>
  );
}

type VoiceControlsProps = {
  voice: ReturnType<typeof useVoiceInput>;
  disabled?: boolean;
  colors: ThemeColors;
  styles: RunnerStyles;
};

function VoiceControls({voice, disabled, colors, styles}: VoiceControlsProps) {
  if (voice.isRecording) {
    return (
      <View style={styles.audioStack}>
        <View style={styles.audioPair}>
          <AudioActionButton
            icon="mic"
            label="Done"
            tone="warm"
            pair
            onPress={() => {
              void voice.stop();
            }}
            colors={colors}
            styles={styles}
          />
          <AudioActionButton
            icon="stop"
            label="Cancel"
            tone="rose"
            pair
            onPress={() => {
              void voice.cancel();
            }}
            colors={colors}
            styles={styles}
          />
        </View>
      </View>
    );
  }

  const busy = voice.isTranscribing || voice.isLoadingModel;
  return (
    <View style={styles.audioStack}>
      <AudioActionButton
        icon="mic"
        label={busy ? 'Listening…' : 'Speak answer'}
        tone="warm"
        disabled={disabled || voice.busy || busy}
        onPress={() => {
          void stopSpeaking();
          void voice.begin();
        }}
        colors={colors}
        styles={styles}
      />
    </View>
  );
}

export function TestRunnerScreen({navigation, route}: Props) {
  const {colors} = useAppTheme();
  const styles = useTestRunnerScreenStyles();
  const [pack, setPack] = useState<TestPack | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswerRecord[]>([]);
  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  const [mcqFeedback, setMcqFeedback] = useState<TestAnswerRecord | null>(null);
  const [written, setWritten] = useState('');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const timedRef = useRef(Boolean(route.params.timed));
  const mcqOnlyRef = useRef(Boolean(route.params.mcqOnly));
  const difficultyRef = useRef(route.params.difficulty);
  const isDailyRef = useRef(Boolean(route.params.isDaily));
  const finishingRef = useRef(false);

  useEffect(() => subscribeSpeaking(setSpeaking), []);
  const voiceContextRef = useRef({
    questions,
    index,
    mcqFeedback,
  });
  voiceContextRef.current = {questions, index, mcqFeedback};

  const voice = useVoiceInput({
    onTranscript: text => {
      const {
        questions: qs,
        index: qi,
        mcqFeedback: feedback,
      } = voiceContextRef.current;
      const q = qs[qi];
      if (!q) {
        return;
      }

      if (q.kind === 'written') {
        setWritten(prev => {
          const next = prev.trim().length > 0 ? `${prev.trim()} ${text}` : text;
          return next;
        });
        setError(null);
        return;
      }

      if (feedback) {
        return;
      }

      const matched = matchSpokenChoice(text, q.options);
      if (matched == null) {
        setError(
          `Couldn't match “${text.trim()}”. Say A–D, 1–4, or the option text.`,
        );
        return;
      }
      setSelectedMcq(matched);
      hapticSelection();
      setError(null);
    },
    onError: detail => setError(detail),
  });

  const cancelVoice = voice.cancel;

  const stopAudioSession = useCallback(() => {
    void stopSpeaking();
    void cancelVoice();
  }, [cancelVoice]);

  const goToTestsTab = useCallback(() => {
    stopAudioSession();
    navigation.navigate('MainTabs', {screen: 'Tests'});
  }, [navigation, stopAudioSession]);

  const pauseAndLeave = useCallback(async () => {
    if (!pack || questions.length === 0) {
      goToTestsTab();
      return;
    }
    await savePausedSession({
      packId: pack.id,
      packTitle: pack.title,
      questions,
      answers,
      index,
      secondsLeft,
      timed: timedRef.current,
      mcqOnly: mcqOnlyRef.current,
      difficulty: difficultyRef.current,
      questionCount: route.params.questionCount,
      savedAt: Date.now(),
    });
    stopAudioSession();
    navigation.navigate('MainTabs', {screen: 'Tests'});
  }, [
    answers,
    index,
    navigation,
    pack,
    questions,
    route.params.questionCount,
    secondsLeft,
    stopAudioSession,
  ]);

  useEffect(() => {
    return () => {
      void stopSpeaking();
      void cancelVoice();
    };
  }, [cancelVoice]);

  const confirmLeave = useCallback(() => {
    showAppAlert('Leave test?', 'You can pause and resume later, or leave now.', [
      {text: 'Stay', style: 'cancel'},
      {
        text: 'Pause & save',
        onPress: () => {
          void pauseAndLeave();
        },
      },
      {
        text: 'Leave without saving',
        style: 'destructive',
        onPress: () => {
          void clearPausedSession();
          goToTestsTab();
        },
      },
    ]);
  }, [goToTestsTab, pauseAndLeave]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading) {
        goToTestsTab();
        return true;
      }
      confirmLeave();
      return true;
    });
    return () => sub.remove();
  }, [confirmLeave, goToTestsTab, loading]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (route.params.resume) {
          const paused = await getPausedSession();
          if (!paused) {
            throw new Error('No paused test to resume.');
          }
          if (cancelled) {
            return;
          }
          setPack({
            id: paused.packId,
            title: paused.packTitle,
            subtitle: 'Resumed',
            description: '',
            totalQuestions: paused.questions.length,
            mcqCount: 0,
            writtenCount: 0,
            accent: 'teal',
            difficulty: paused.difficulty,
          });
          setQuestions(paused.questions);
          setAnswers(paused.answers);
          setIndex(paused.index);
          timedRef.current = paused.timed;
          mcqOnlyRef.current = paused.mcqOnly;
          difficultyRef.current = paused.difficulty;
          if (paused.secondsLeft != null) {
            setSecondsLeft(paused.secondsLeft);
          }
          return;
        }

        const forceMcq =
          route.params.mcqOnly ||
          (!isModelReadyForWritten() && !route.params.mistakeQuestionIds);
        mcqOnlyRef.current = Boolean(forceMcq);
        isDailyRef.current = Boolean(
          route.params.isDaily || route.params.packId === 'daily',
        );
        difficultyRef.current = route.params.difficulty;
        const session = await buildRandomTestSession({
          packId: route.params.packId,
          timed: route.params.timed,
          mcqOnly: forceMcq,
          difficulty: route.params.difficulty,
          mistakeQuestionIds: route.params.mistakeQuestionIds,
          questionCount: route.params.questionCount,
          isDaily: isDailyRef.current,
        });
        if (cancelled) {
          return;
        }
        setPack(session.pack);
        setQuestions(session.questions);
        if (session.timedSeconds) {
          timedRef.current = true;
          setSecondsLeft(session.timedSeconds);
        }
      } catch (err) {
        const detail =
          err instanceof Error ? err.message : 'Could not start test.';
        showAppAlert('Test unavailable', detail, [
          {text: 'OK', onPress: goToTestsTab},
        ]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      void stopSpeaking();
    };
  }, [goToTestsTab, route.params]);

  const finishWith = useCallback(
    async (allAnswers: TestAnswerRecord[]) => {
      if (!pack || finishingRef.current) {
        return;
      }
      finishingRef.current = true;
      void stopSpeaking();
      const attempt = finalizeAttempt({
        pack,
        questions,
        answers: allAnswers,
        timed: timedRef.current,
        mcqOnly: mcqOnlyRef.current,
        difficulty: difficultyRef.current,
        isDaily: isDailyRef.current || pack.isDaily,
        isPlacement: pack.isPlacement,
      });
      await saveTestAttempt(attempt);
      hapticSuccess();
      navigation.replace('TestResults', {attemptId: attempt.id});
    },
    [navigation, pack, questions],
  );

  useEffect(() => {
    if (secondsLeft == null) {
      return;
    }
    if (secondsLeft <= 0) {
      showAppAlert('Time’s up', 'We’ll score what you’ve answered so far.');
      void finishWith(answers);
      return;
    }
    const id = setTimeout(
      () => setSecondsLeft(s => (s == null ? s : s - 1)),
      1000,
    );
    return () => clearTimeout(id);
  }, [answers, finishWith, secondsLeft]);

  const current = questions[index];
  const progress = useMemo(() => {
    if (questions.length === 0) {
      return 0;
    }
    return (index + 1) / questions.length;
  }, [index, questions.length]);

  const isChoice =
    current?.kind === 'mcq' ||
    current?.kind === 'fill' ||
    current?.kind === 'listening';

  const advanceAfterRecord = async (record: TestAnswerRecord) => {
    const nextAnswers = [...answers, record];
    setAnswers(nextAnswers);
    setSelectedMcq(null);
    setMcqFeedback(null);
    setWritten('');
    void stopSpeaking();
    if (index + 1 >= questions.length) {
      await finishWith(nextAnswers);
    } else {
      setIndex(index + 1);
    }
  };

  const onCheckChoice = () => {
    if (!current || !isChoice) {
      return;
    }
    if (selectedMcq == null) {
      setError('Choose an answer first.');
      return;
    }
    let record: TestAnswerRecord;
    if (current.kind === 'fill') {
      record = scoreFillBlank(current, selectedMcq);
    } else if (current.kind === 'listening') {
      record = scoreListening(current, selectedMcq);
    } else {
      record = scoreMcq(current, selectedMcq);
    }
    setMcqFeedback(record);
    if (record.correct) {
      hapticSuccess();
    } else {
      hapticLight();
    }
    setError(null);
  };

  const onNext = async () => {
    if (!current) {
      return;
    }
    setError(null);

    if (isChoice) {
      if (!mcqFeedback) {
        onCheckChoice();
        return;
      }
      await advanceAfterRecord(mcqFeedback);
      return;
    }

    if (!written.trim()) {
      setError('Write or dictate your corrected version first.');
      return;
    }

    setGrading(true);
    try {
      const record = isModelReadyForWritten()
        ? await scoreWritten(current, written)
        : scoreWrittenOffline(current, written);
      await advanceAfterRecord(record);
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : 'Could not grade your answer.';
      try {
        const fallback = scoreWrittenOffline(current, written);
        await advanceAfterRecord(fallback);
      } catch {
        setError(detail);
        showAppAlert('Grading failed', detail);
      }
    } finally {
      setGrading(false);
    }
  };

  const timerLabel =
    secondsLeft == null
      ? null
      : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  if (loading || !pack) {
    return (
      <SafeAreaView
        style={[styles.safe, {backgroundColor: colors.canvas}]}
        edges={['top', 'bottom']}>
        <ScreenBackdrop variant="focus" />
        <View style={styles.body}>
          <ScreenHeader title="Tests" onBack={goToTestsTab} />
          <LoadingView message="Shuffling a fresh question set…" />
        </View>
      </SafeAreaView>
    );
  }

  if (grading) {
    return (
      <SafeAreaView
        style={[styles.safe, {backgroundColor: colors.canvas}]}
        edges={['top', 'bottom']}>
        <ScreenBackdrop variant="focus" />
        <View style={styles.body}>
          <ScreenHeader title={pack.title} onBack={confirmLeave} />
          <LoadingView message="Checking your written answer…" />
        </View>
      </SafeAreaView>
    );
  }

  if (!current) {
    return (
      <SafeAreaView
        style={[styles.safe, {backgroundColor: colors.canvas}]}
        edges={['top', 'bottom']}>
        <ScreenBackdrop variant="focus" />
        <View style={styles.body}>
          <ScreenHeader title="Tests" onBack={goToTestsTab} />
          <LoadingView message="Preparing questions…" />
        </View>
      </SafeAreaView>
    );
  }

  const choiceOptions =
    current.kind === 'mcq' ||
    current.kind === 'fill' ||
    current.kind === 'listening'
      ? current.options
      : [];
  const correctIndex =
    current.kind === 'mcq' ||
    current.kind === 'fill' ||
    current.kind === 'listening'
      ? current.correctIndex
      : -1;

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <View style={styles.body}>
        <ScreenHeader title={pack.title} onBack={confirmLeave} />

        <View
          style={[styles.progressTrack, {backgroundColor: colors.navyWash}]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: colors.primaryAccent,
              },
            ]}
          />
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.progressLabel, {color: colors.secondaryText}]}>
            Question {index + 1} of {questions.length}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <Pressable
              onPress={() => {
                void pauseAndLeave();
              }}>
              <Text
                style={[styles.progressLabel, {color: colors.primaryAccent}]}>
                Pause
              </Text>
            </Pressable>
            {timerLabel ? (
              <Text
                style={[
                  styles.timer,
                  {
                    color:
                      secondsLeft != null && secondsLeft < 60
                        ? colors.accentRose
                        : colors.accentWarm,
                  },
                ]}>
                {timerLabel}
              </Text>
            ) : null}
          </View>
        </View>

        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          enableOnAndroid
          enableAutomaticScroll
          keyboardShouldPersistTaps="handled"
          keyboardOpeningTime={0}
          extraScrollHeight={48}
          extraHeight={140}
          enableResetScrollToCoords={false}
          showsVerticalScrollIndicator={false}>
          <View
            style={[styles.skillChip, {backgroundColor: colors.accentWash}]}>
            <Text
              style={[styles.skillChipText, {color: colors.primaryAccent}]}>
              {current.skill.replace('-', ' ')} · {kindLabel(current.kind)}
              {current.difficulty ? ` · ${current.difficulty}` : ''}
            </Text>
          </View>

          <Text style={[styles.prompt, {color: colors.primaryText}]}>
            {current.prompt}
          </Text>

          <QuestionAudioBar
            speaking={speaking}
            colors={colors}
            styles={styles}
            onHear={() => {
              hapticSelection();
              void cancelVoice();
              void (async () => {
                const played = await speakText(
                  buildQuestionNarration(current),
                );
                if (!played) {
                  showAppAlert(
                    'Audio unavailable',
                    'Could not play speech on this device. You can still read the question.',
                  );
                }
              })();
            }}
            onStop={() => {
              void stopSpeaking();
            }}
          />

          {current.kind === 'fill' ? (
            <Text
              style={[
                styles.rough,
                {
                  color: colors.primaryText,
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                  fontStyle: 'normal',
                },
              ]}>
              {current.sentence}
            </Text>
          ) : null}

          {current.kind === 'listening' ? (
            <View style={styles.audioStack}>
              <View style={styles.audioRow}>
                <PressScale
                  onPress={() => {
                    hapticSelection();
                    void cancelVoice();
                    void (async () => {
                      const played = await speakText(current.speakText);
                      if (!played) {
                        showAppAlert(
                          'Audio unavailable',
                          'Could not play listening audio on this device.',
                        );
                      }
                    })();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Play listening"
                  style={[
                    styles.audioRowMain,
                    {
                      backgroundColor: audioPalette('teal', colors).bg,
                      borderColor: audioPalette('teal', colors).border,
                    },
                  ]}>
                  <View style={styles.audioBtnInner}>
                    <View
                      style={[
                        styles.audioIconWrap,
                        {backgroundColor: audioPalette('teal', colors).iconBg},
                      ]}>
                      <SpeakerIcon
                        color={audioPalette('teal', colors).fg}
                        size={16}
                      />
                    </View>
                    <Text
                      style={[
                        styles.audioChipLabel,
                        {color: audioPalette('teal', colors).fg},
                      ]}
                      numberOfLines={1}>
                      {speaking ? 'Playing clip…' : 'Play listening'}
                    </Text>
                  </View>
                </PressScale>
                <PressScale
                  onPress={() => {
                    void speakText(current.speakText);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Replay"
                  style={[
                    styles.audioRowSide,
                    {
                      backgroundColor: audioPalette('muted', colors).bg,
                      borderColor: audioPalette('muted', colors).border,
                    },
                  ]}>
                  <View style={styles.audioRowSideInner}>
                    <Text
                      style={[
                        styles.audioRowSideLabel,
                        {color: audioPalette('muted', colors).fg},
                      ]}>
                      Replay
                    </Text>
                  </View>
                </PressScale>
              </View>
            </View>
          ) : null}

          {current.kind === 'written' ? (
            <>
              <Text
                style={[
                  styles.rough,
                  {
                    color: colors.secondaryText,
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}>
                {current.rough}
              </Text>
              <Text style={[styles.hint, {color: colors.secondaryText}]}>
                Hint: {current.hint}
              </Text>
              <TextInput
                value={written}
                onChangeText={text => {
                  setWritten(text);
                  if (error) {
                    setError(null);
                  }
                }}
                placeholder="Type or speak your corrected version…"
                placeholderTextColor={colors.secondaryText}
                multiline
                style={[
                  styles.writtenInput,
                  {
                    color: colors.primaryText,
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}
              />
              <VoiceControls
                voice={voice}
                colors={colors}
                styles={styles}
              />
            </>
          ) : (
            <View>
              <Text style={[styles.hint, {color: colors.secondaryText}]}>
                Tap an option or speak your answer (A–D, or the option text)
              </Text>
              {choiceOptions.map((option, optionIndex) => {
                const selected = selectedMcq === optionIndex;
                const revealed = Boolean(mcqFeedback);
                const isCorrectOption = optionIndex === correctIndex;
                const showGood = revealed && isCorrectOption;
                const showBad = revealed && selected && !isCorrectOption;
                const letter = String.fromCharCode(65 + optionIndex);
                return (
                  <PressScale
                    key={`${current.id}-${optionIndex}`}
                    disabled={revealed}
                    onPress={() => {
                      hapticSelection();
                      setSelectedMcq(optionIndex);
                      setError(null);
                    }}
                    style={[
                      styles.option,
                      {
                        backgroundColor: showGood
                          ? colors.accentWash
                          : showBad
                            ? colors.errorSoft
                            : selected
                              ? colors.tabActiveBg
                              : colors.surfaceSolid,
                        borderColor: showGood
                          ? `${colors.success}88`
                          : showBad
                            ? `${colors.error}88`
                            : selected
                              ? `${colors.primaryAccent}88`
                              : colors.borderSoft,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: showGood
                            ? colors.success
                            : showBad
                              ? colors.error
                              : selected
                                ? colors.primaryAccent
                                : colors.primaryText,
                          fontWeight:
                            selected || showGood || showBad ? '700' : '400',
                        },
                      ]}>
                      {letter}. {option}
                    </Text>
                  </PressScale>
                );
              })}
              {!mcqFeedback ? (
                <VoiceControls
                  voice={voice}
                  colors={colors}
                  styles={styles}
                />
              ) : null}
              {mcqFeedback ? (
                <View
                  style={[
                    styles.feedbackBox,
                    {
                      backgroundColor: mcqFeedback.correct
                        ? colors.accentWash
                        : colors.warmWash,
                      borderColor: mcqFeedback.correct
                        ? `${colors.success}55`
                        : `${colors.accentWarm}55`,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.feedbackTitle,
                      {
                        color: mcqFeedback.correct
                          ? colors.success
                          : colors.accentWarm,
                      },
                    ]}>
                    {mcqFeedback.correct ? 'Correct' : 'Not quite'}
                  </Text>
                  <Text
                    style={[
                      styles.feedbackBody,
                      {color: colors.primaryText},
                    ]}>
                    {mcqFeedback.explanation}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {error ? (
            <Text style={[styles.error, {color: colors.error}]}>{error}</Text>
          ) : null}

          <View style={styles.footer}>
            <AppButton
              label={
                isChoice && !mcqFeedback
                  ? 'Check answer'
                  : index + 1 >= questions.length
                    ? 'Finish & see score'
                    : 'Next'
              }
              onPress={onNext}
            />
            {isChoice && !mcqFeedback ? (
              <Pressable
                onPress={() =>
                  setError('Choose or speak an answer, then Check.')
                }>
                <Text style={[styles.hint, {color: colors.tabInactive}]}>
                  Instant feedback after you check
                </Text>
              </Pressable>
            ) : null}
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}

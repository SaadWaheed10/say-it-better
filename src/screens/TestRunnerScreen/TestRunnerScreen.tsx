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
  scoreFillBlank,
  scoreListening,
  scoreMcq,
  scoreWritten,
  scoreWrittenOffline,
} from '../../services/testService';
import {speakText, stopSpeaking} from '../../services/ttsService';
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
  const timedRef = useRef(Boolean(route.params.timed));
  const mcqOnlyRef = useRef(Boolean(route.params.mcqOnly));
  const difficultyRef = useRef(route.params.difficulty);
  const isDailyRef = useRef(Boolean(route.params.isDaily));
  const finishingRef = useRef(false);

  const voice = useVoiceInput({
    onTranscript: text => {
      setWritten(prev => {
        const next = prev.trim().length > 0 ? `${prev.trim()} ${text}` : text;
        return next;
      });
      setError(null);
    },
    onError: detail => setError(detail),
  });

  const goToTestsTab = useCallback(() => {
    void stopSpeaking();
    navigation.navigate('MainTabs', {screen: 'Tests'});
  }, [navigation]);

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
    void stopSpeaking();
    goToTestsTab();
  }, [
    answers,
    goToTestsTab,
    index,
    pack,
    questions,
    route.params.questionCount,
    secondsLeft,
  ]);

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
            <View style={styles.voiceRow}>
              <AppButton
                label="Play audio"
                variant="secondary"
                onPress={() => {
                  hapticSelection();
                  void speakText(current.speakText);
                }}
                style={styles.voiceBtn}
              />
              <AppButton
                label="Replay"
                variant="ghost"
                onPress={() => {
                  void speakText(current.speakText);
                }}
                style={styles.voiceBtn}
              />
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
                placeholder="Type or dictate your corrected version…"
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
              <View style={styles.voiceRow}>
                {voice.isRecording ? (
                  <>
                    <AppButton
                      label="Stop"
                      onPress={() => {
                        void voice.stop();
                      }}
                      style={styles.voiceBtn}
                    />
                    <AppButton
                      label="Cancel"
                      variant="secondary"
                      onPress={() => {
                        void voice.cancel();
                      }}
                      style={styles.voiceBtn}
                    />
                  </>
                ) : (
                  <AppButton
                    label={
                      voice.isTranscribing || voice.isLoadingModel
                        ? 'Listening…'
                        : 'Dictate answer'
                    }
                    variant="secondary"
                    disabled={voice.busy || voice.isTranscribing}
                    onPress={() => {
                      void voice.begin();
                    }}
                  />
                )}
              </View>
            </>
          ) : (
            <View>
              {choiceOptions.map((option, optionIndex) => {
                const selected = selectedMcq === optionIndex;
                const revealed = Boolean(mcqFeedback);
                const isCorrectOption = optionIndex === correctIndex;
                const showGood = revealed && isCorrectOption;
                const showBad = revealed && selected && !isCorrectOption;
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
                      {option}
                    </Text>
                  </PressScale>
                );
              })}
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
                onPress={() => setError('Choose an answer, then Check.')}>
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

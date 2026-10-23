import React, {useCallback, useEffect, useState} from 'react';
import {BackHandler, ScrollView, Share, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {FadeIn} from '../../components/FadeIn';
import {LoadingView} from '../../components/LoadingView';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useAppTheme} from '../../hooks/useAppTheme';
import {hapticLight} from '../../services/hapticService';
import {packForDifficulty} from '../../constants/tests';
import {
  exportAttemptsCsv,
  formatScore,
  getMistakeQuestionIds,
  getTestAttempt,
  placementLevelFromScore,
} from '../../services/testService';
import {RootStackParamList, TestAttempt} from '../../types';
import {useTestResultsScreenStyles} from './TestResultsScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'TestResults'>;

export function TestResultsScreen({navigation, route}: Props) {
  const {colors} = useAppTheme();
  const styles = useTestResultsScreenStyles();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);

  const goToHub = useCallback(() => {
    navigation.navigate('MainTabs', {screen: 'Tests'});
  }, [navigation]);

  useEffect(() => {
    getTestAttempt(route.params.attemptId).then(item => {
      setAttempt(item ?? null);
    });
    getMistakeQuestionIds().then(ids => setMistakeCount(ids.length));
  }, [route.params.attemptId]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goToHub();
      return true;
    });
    return () => sub.remove();
  }, [goToHub]);

  const onShare = async () => {
    if (!attempt) {
      return;
    }
    try {
      await Share.share({
        message: `I scored ${formatScore(attempt.score, attempt.maxScore)} on ${attempt.packTitle} in SayItBetter.`,
      });
      hapticLight();
    } catch {
      // cancelled
    }
  };

  const onExportCsv = async () => {
    if (!attempt) {
      return;
    }
    try {
      await Share.share({
        message: exportAttemptsCsv([attempt]),
        title: 'SayItBetter score export',
      });
      hapticLight();
    } catch {
      // cancelled
    }
  };

  if (!attempt) {
    return (
      <SafeAreaView
        style={[styles.safe, {backgroundColor: colors.canvas}]}
        edges={['top', 'bottom']}>
        <ScreenBackdrop variant="focus" />
        <View style={styles.body}>
          <ScreenHeader title="Your score" onBack={goToHub} />
          <LoadingView message="Loading your score…" />
        </View>
      </SafeAreaView>
    );
  }

  const pct = attempt.maxScore > 0 ? attempt.score / attempt.maxScore : 0;
  const scoreColor =
    pct >= 0.8
      ? colors.success
      : pct >= 0.5
        ? colors.accentWarm
        : colors.accentRose;

  const levelLabel =
    pct >= 0.9
      ? 'Level: Excellent'
      : pct >= 0.75
        ? 'Level: Strong'
        : pct >= 0.5
          ? 'Level: Building'
          : 'Level: Keep practicing';

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <View style={styles.body}>
        <ScreenHeader title="Your score" onBack={goToHub} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <FadeIn>
            <View
              style={[
                styles.scoreHero,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: `${scoreColor}55`,
                },
              ]}>
              <Text style={[styles.scoreLabel, {color: colors.secondaryText}]}>
                SCORE
              </Text>
              <Text style={[styles.scoreValue, {color: scoreColor}]}>
                {formatScore(attempt.score, attempt.maxScore)}
              </Text>
              <Text style={[styles.packTitle, {color: colors.secondaryText}]}>
                {attempt.packTitle}
                {attempt.timed ? ' · timed' : ''}
                {attempt.mcqOnly ? ' · MCQ only' : ''}
              </Text>
              <Text
                style={[
                  styles.packTitle,
                  {color: colors.primaryAccent, marginTop: 6, fontWeight: '700'},
                ]}>
                {levelLabel}
              </Text>
            </View>
          </FadeIn>

          {attempt.isPlacement ? (
            <FadeIn delay={40}>
              <View
                style={[
                  styles.suggestion,
                  {
                    backgroundColor: colors.accentWash,
                    borderColor: `${colors.primaryAccent}44`,
                  },
                ]}>
                <Text
                  style={[styles.suggestionText, {color: colors.primaryText}]}>
                  Placement result: start at{' '}
                  {placementLevelFromScore(attempt.score, attempt.maxScore)}{' '}
                  difficulty next.
                </Text>
              </View>
            </FadeIn>
          ) : null}

          {(attempt.skillBreakdown?.length ?? 0) > 0 ? (
            <FadeIn delay={50}>
              <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
                Per-skill report
              </Text>
              {attempt.skillBreakdown.map(row => (
                <View
                  key={row.skill}
                  style={[
                    styles.answerCard,
                    {
                      backgroundColor: colors.surfaceSolid,
                      borderColor: colors.borderSoft,
                    },
                  ]}>
                  <View style={styles.chipRow}>
                    <Text
                      style={[
                        styles.answerMeta,
                        {color: colors.primaryText, marginBottom: 0},
                      ]}>
                      {row.skill.replace('-', ' ')}
                    </Text>
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            row.percent >= 0.75
                              ? colors.success
                              : row.percent >= 0.5
                                ? colors.accentWarm
                                : colors.accentRose,
                        },
                      ]}>
                      {formatScore(row.earned, row.max)} ·{' '}
                      {Math.round(row.percent * 100)}%
                    </Text>
                  </View>
                </View>
              ))}
            </FadeIn>
          ) : null}

          {attempt.weakSkills.length > 0 ? (
            <FadeIn delay={60}>
              <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
                Focus areas
              </Text>
              <View style={styles.chipRow}>
                {attempt.weakSkills.map(skill => (
                  <View
                    key={skill}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.warmWash,
                        borderColor: `${colors.accentWarm}55`,
                      },
                    ]}>
                    <Text
                      style={[styles.chipText, {color: colors.accentWarm}]}>
                      {skill.replace('-', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </FadeIn>
          ) : null}

          <FadeIn delay={100}>
            <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
              Suggestions
            </Text>
            {attempt.suggestions.map(item => (
              <View
                key={item}
                style={[
                  styles.suggestion,
                  {
                    backgroundColor: colors.accentWash,
                    borderColor: `${colors.primaryAccent}33`,
                  },
                ]}>
                <Text
                  style={[styles.suggestionText, {color: colors.primaryText}]}>
                  {item}
                </Text>
              </View>
            ))}
          </FadeIn>

          <FadeIn delay={140}>
            <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
              Answer review
            </Text>
            {attempt.answers.map((answer, i) => (
              <View
                key={`${answer.questionId}-${i}`}
                style={[
                  styles.answerCard,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}>
                <Text
                  style={[
                    styles.answerMeta,
                    {
                      color:
                        answer.earned >= answer.max
                          ? colors.success
                          : colors.accentRose,
                    },
                  ]}>
                  Q{i + 1} · {answer.kind.toUpperCase()} ·{' '}
                  {formatScore(answer.earned, answer.max)} · {answer.skill}
                  {answer.tipTag ? ` · tip: ${answer.tipTag}` : ''}
                </Text>
                {answer.userWritten ? (
                  <Text
                    style={[styles.answerBody, {color: colors.secondaryText}]}>
                    You: {answer.userWritten}
                  </Text>
                ) : null}
                {answer.modelAnswer ? (
                  <Text
                    style={[
                      styles.answerBody,
                      {color: colors.primaryText, marginTop: 6},
                    ]}>
                    Model: {answer.modelAnswer}
                  </Text>
                ) : null}
                {answer.explanation ? (
                  <Text
                    style={[
                      styles.answerBody,
                      {color: colors.secondaryText, marginTop: 6},
                    ]}>
                    {answer.explanation}
                  </Text>
                ) : null}
              </View>
            ))}
          </FadeIn>

          <View style={styles.actions}>
            <AppButton label="Share score" onPress={onShare} />
            <AppButton
              label="Export this score (CSV)"
              variant="secondary"
              onPress={onExportCsv}
            />
            {attempt.isPlacement ? (
              <AppButton
                label={`Start ${placementLevelFromScore(attempt.score, attempt.maxScore)} pack`}
                onPress={() => {
                  const level = placementLevelFromScore(
                    attempt.score,
                    attempt.maxScore,
                  );
                  navigation.replace('TestRunner', {
                    packId: packForDifficulty(level),
                    difficulty: level,
                  });
                }}
              />
            ) : null}
            <AppButton
              label="Retake (new random set)"
              variant="secondary"
              onPress={() =>
                navigation.replace('TestRunner', {
                  packId: attempt.packId,
                  timed: attempt.timed,
                  mcqOnly: attempt.mcqOnly,
                  difficulty: attempt.difficulty,
                  isDaily: attempt.isDaily,
                })
              }
            />
            {mistakeCount > 0 ? (
              <AppButton
                label={`Retry mistakes (${mistakeCount})`}
                variant="secondary"
                onPress={async () => {
                  const ids = await getMistakeQuestionIds();
                  navigation.replace('TestRunner', {
                    packId: attempt.packId,
                    mistakeQuestionIds: ids,
                  });
                }}
              />
            ) : null}
            <AppButton
              label="Practice mode"
              variant="ghost"
              onPress={() => navigation.navigate('Practice')}
            />
            <AppButton
              label="Back to tests"
              variant="ghost"
              onPress={goToHub}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

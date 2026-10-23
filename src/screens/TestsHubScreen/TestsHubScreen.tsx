import React, {useCallback, useState} from 'react';
import {ScrollView, Share, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {EmptyState} from '../../components/EmptyState';
import {FadeIn} from '../../components/FadeIn';
import {PressScale} from '../../components/PressScale';
import {ScoreTrendChart} from '../../components/ScoreTrendChart';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {TEST_PACKS, getTestPack} from '../../constants/tests';
import {useAppTheme} from '../../hooks/useAppTheme';
import {hapticLight, hapticSelection} from '../../services/hapticService';
import {getSettings} from '../../services/settingsService';
import {
  exportAttemptsCsv,
  formatScore,
  getMistakeQuestionIds,
  getProgressSnapshot,
  isModelReadyForWritten,
  poolStats,
} from '../../services/testService';
import {
  RootStackParamList,
  TestAttempt,
  TestBadge,
  TestDifficulty,
  TestProgressSnapshot,
} from '../../types';
import {useTestsHubScreenStyles} from './TestsHubScreen.styles';

function accentFor(
  packAccent: 'teal' | 'amber' | 'rose',
  colors: {
    primaryAccent: string;
    accentWarm: string;
    accentRose: string;
  },
): string {
  if (packAccent === 'amber') {
    return colors.accentWarm;
  }
  if (packAccent === 'rose') {
    return colors.accentRose;
  }
  return colors.primaryAccent;
}

const LENGTH_OPTIONS: Array<5 | 10 | 15> = [5, 10, 15];

export function TestsHubScreen() {
  const {colors} = useAppTheme();
  const styles = useTestsHubScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [progress, setProgress] = useState<TestProgressSnapshot | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15>(10);
  const [showReminder, setShowReminder] = useState(false);
  const stats = poolStats();
  const modelReady = isModelReadyForWritten();

  useFocusEffect(
    useCallback(() => {
      getProgressSnapshot().then(setProgress);
      getMistakeQuestionIds().then(ids => setMistakeCount(ids.length));
      getSettings().then(settings => {
        setShowReminder(Boolean(settings.dailyTestReminder));
      });
    }, []),
  );

  const attempts: TestAttempt[] = progress?.attempts ?? [];
  const badges: TestBadge[] = progress?.badges ?? [];
  const recommended = getTestPack(progress?.recommendedPackId ?? 'mixed-10');
  const paused = progress?.pausedSession;
  const featuredPacks = TEST_PACKS.filter(p => p.isDaily || p.isPlacement);
  const regularPacks = TEST_PACKS.filter(p => !p.isDaily && !p.isPlacement);

  const startPack = (
    packId: string,
    extras?: {
      timed?: boolean;
      mcqOnly?: boolean;
      mistakeQuestionIds?: string[];
      difficulty?: TestDifficulty | 'all';
      resume?: boolean;
      isDaily?: boolean;
      skipLength?: boolean;
    },
  ) => {
    hapticSelection();
    navigation.navigate('TestRunner', {
      packId,
      timed: extras?.timed,
      mcqOnly: extras?.mcqOnly ?? (!modelReady && packId !== 'mcq-only'),
      mistakeQuestionIds: extras?.mistakeQuestionIds,
      difficulty: extras?.difficulty,
      resume: extras?.resume,
      isDaily: extras?.isDaily,
      questionCount: extras?.skipLength ? undefined : questionCount,
    });
  };

  const onExport = async () => {
    if (attempts.length === 0) {
      return;
    }
    try {
      await Share.share({
        message: exportAttemptsCsv(attempts),
        title: 'SayItBetter test scores',
      });
      hapticLight();
    } catch {
      // cancelled
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top']}>
      <ScreenBackdrop variant="app" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <FadeIn>
          <Text style={[styles.title, {color: colors.primaryText}]}>Tests</Text>
          <LinearGradient
            colors={[
              colors.primaryAccent,
              colors.accentWarm,
              colors.accentRose,
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.titleAccent}
          />
          <Text style={[styles.lead, {color: colors.secondaryText}]}>
            Random questions every run · track progress · retry mistakes
          </Text>
          <Text style={[styles.poolNote, {color: colors.tabInactive}]}>
            Pool: {stats.mcq} MCQ · {stats.fill} fill · {stats.listening}{' '}
            listening · {stats.written} written
            {!modelReady ? ' · model loading → MCQ-only available' : ''}
          </Text>
        </FadeIn>

        {showReminder && !progress?.dailyChallengeDone ? (
          <FadeIn delay={20}>
            <PressScale
              onPress={() =>
                startPack('daily', {isDaily: true, skipLength: true})
              }
              style={[
                styles.card,
                {
                  backgroundColor: colors.warmWash,
                  borderColor: `${colors.accentWarm}66`,
                },
              ]}>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, {color: colors.primaryText}]}>
                  Daily reminder
                </Text>
                <Text
                  style={[styles.cardSubtitle, {color: colors.secondaryText}]}>
                  You haven’t finished today’s challenge yet — tap to start.
                </Text>
              </View>
            </PressScale>
          </FadeIn>
        ) : null}

        <FadeIn delay={40}>
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                },
              ]}>
              <Text style={[styles.statValue, {color: colors.primaryAccent}]}>
                {progress?.streakDays ?? 0}
              </Text>
              <Text style={[styles.statLabel, {color: colors.secondaryText}]}>
                Day streak
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                },
              ]}>
              <Text style={[styles.statValue, {color: colors.accentWarm}]}>
                {progress?.dailyChallengeDone ? 'Done' : 'Open'}
              </Text>
              <Text style={[styles.statLabel, {color: colors.secondaryText}]}>
                Daily
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                },
              ]}>
              <Text style={[styles.statValue, {color: colors.accentRose}]}>
                {(progress?.adaptiveDifficulty ?? 'easy')
                  .slice(0, 1)
                  .toUpperCase()}
              </Text>
              <Text style={[styles.statLabel, {color: colors.secondaryText}]}>
                Adaptive
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={55}>
          <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
            Test length
          </Text>
          <View style={styles.badgeRow}>
            {LENGTH_OPTIONS.map(n => {
              const selected = questionCount === n;
              return (
                <PressScale
                  key={n}
                  onPress={() => {
                    hapticSelection();
                    setQuestionCount(n);
                  }}
                  style={[
                    styles.badgeChip,
                    {
                      backgroundColor: selected
                        ? colors.accentWash
                        : colors.surfaceSolid,
                      borderColor: selected
                        ? `${colors.primaryAccent}88`
                        : colors.borderSoft,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.badgeTitle,
                      {
                        color: selected
                          ? colors.primaryAccent
                          : colors.secondaryText,
                      },
                    ]}>
                    {n} questions
                  </Text>
                </PressScale>
              );
            })}
          </View>
        </FadeIn>

        <FadeIn delay={70}>
          <ScoreTrendChart attempts={attempts} />
        </FadeIn>

        {paused ? (
          <FadeIn delay={80}>
            <PressScale
              onPress={() =>
                startPack(paused.packId, {resume: true, skipLength: true})
              }
              style={[
                styles.card,
                {
                  backgroundColor: colors.accentWash,
                  borderColor: `${colors.primaryAccent}66`,
                },
              ]}>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, {color: colors.primaryText}]}>
                  Resume paused test
                </Text>
                <Text
                  style={[styles.cardSubtitle, {color: colors.secondaryText}]}>
                  {paused.packTitle} · Q{paused.index + 1} of{' '}
                  {paused.questions.length}
                </Text>
              </View>
            </PressScale>
          </FadeIn>
        ) : null}

        {recommended ? (
          <FadeIn delay={90}>
            <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
              Recommended for you
            </Text>
            <PressScale
              onPress={() =>
                startPack(recommended.id, {
                  isDaily: recommended.isDaily,
                  skipLength: Boolean(
                    recommended.isDaily || recommended.isPlacement,
                  ),
                  difficulty:
                    recommended.isDaily || recommended.isPlacement
                      ? undefined
                      : progress?.adaptiveDifficulty,
                })
              }
              style={[
                styles.card,
                {
                  backgroundColor: colors.accentWash,
                  borderColor: `${colors.primaryAccent}55`,
                },
              ]}>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, {color: colors.primaryText}]}>
                  {recommended.title}
                </Text>
                <Text
                  style={[styles.cardSubtitle, {color: colors.secondaryText}]}>
                  {progress?.placementDone
                    ? `Adaptive level: ${progress.adaptiveDifficulty}`
                    : 'Start with placement to find your level'}
                </Text>
              </View>
            </PressScale>
          </FadeIn>
        ) : null}

        {mistakeCount > 0 ? (
          <FadeIn delay={100}>
            <PressScale
              onPress={() =>
                getMistakeQuestionIds().then(ids =>
                  startPack('mixed-10', {
                    mistakeQuestionIds: ids,
                    skipLength: true,
                  }),
                )
              }
              style={[
                styles.card,
                {
                  backgroundColor: colors.warmWash,
                  borderColor: `${colors.accentWarm}55`,
                },
              ]}>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, {color: colors.primaryText}]}>
                  Retry mistakes ({mistakeCount})
                </Text>
                <Text
                  style={[styles.cardSubtitle, {color: colors.secondaryText}]}>
                  Only the questions you missed before
                </Text>
              </View>
            </PressScale>
          </FadeIn>
        ) : null}

        <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
          Featured
        </Text>
        {featuredPacks.map(pack => {
          const accent = accentFor(pack.accent, colors);
          const doneDaily = pack.isDaily && progress?.dailyChallengeDone;
          return (
            <FadeIn key={pack.id} delay={105}>
              <PressScale
                onPress={() =>
                  startPack(pack.id, {
                    timed: Boolean(pack.timedSeconds),
                    mcqOnly: pack.writtenCount === 0 || !modelReady,
                    isDaily: pack.isDaily,
                    skipLength: Boolean(pack.isDaily || pack.isPlacement),
                  })
                }
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: `${accent}44`,
                    opacity: doneDaily ? 0.7 : 1,
                  },
                ]}>
                <LinearGradient
                  colors={[accent, colors.accentWarm]}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                  style={styles.cardStripe}
                />
                <View style={styles.cardBody}>
                  <Text
                    style={[styles.cardTitle, {color: colors.primaryText}]}>
                    {pack.title}
                    {doneDaily ? ' · done today' : ''}
                  </Text>
                  <Text
                    style={[
                      styles.cardSubtitle,
                      {color: colors.secondaryText},
                    ]}>
                    {pack.subtitle}
                  </Text>
                </View>
              </PressScale>
            </FadeIn>
          );
        })}

        <View style={styles.attemptTop}>
          <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
            Badges
          </Text>
          <PressScale onPress={() => navigation.navigate('TestBadges')}>
            <Text
              style={[
                styles.badgeTitle,
                {color: colors.primaryAccent, marginTop: 20},
              ]}>
              View all ({badges.length}/{progress?.allBadges?.length ?? 8})
            </Text>
          </PressScale>
        </View>
        <View style={styles.badgeRow}>
          {(progress?.allBadges ?? [])
            .filter(b => b.unlockedAt)
            .slice(0, 4)
            .map(badge => (
              <PressScale
                key={badge.id}
                onPress={() => navigation.navigate('TestBadges')}
                style={[
                  styles.badgeChip,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}>
                <Text
                  style={[styles.badgeTitle, {color: colors.primaryAccent}]}>
                  {badge.title}
                </Text>
              </PressScale>
            ))}
          {badges.length === 0 ? (
            <Text style={[styles.poolNote, {color: colors.secondaryText}]}>
              Finish a test to unlock your first badge.
            </Text>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
          Test packs
        </Text>
        {regularPacks.map((pack, index) => {
          const accent = accentFor(pack.accent, colors);
          const best = progress?.bestByPack?.[pack.id];
          return (
            <FadeIn key={pack.id} delay={Math.min(120 + index * 30, 240)}>
              <PressScale
                onPress={() =>
                  startPack(pack.id, {
                    timed: Boolean(pack.timedSeconds),
                    mcqOnly: pack.writtenCount === 0 || !modelReady,
                  })
                }
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: `${accent}44`,
                  },
                ]}>
                <LinearGradient
                  colors={[accent, colors.accentWarm]}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                  style={styles.cardStripe}
                />
                <View style={styles.cardBody}>
                  <Text
                    style={[styles.cardTitle, {color: colors.primaryText}]}>
                    {pack.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardSubtitle,
                      {color: colors.secondaryText},
                    ]}>
                    {pack.subtitle}
                    {pack.timedSeconds
                      ? ` · ${Math.round(pack.timedSeconds / 60)} min timer`
                      : ''}
                    {pack.difficulty && pack.difficulty !== 'all'
                      ? ` · ${pack.difficulty}`
                      : ''}
                  </Text>
                  <Text
                    style={[styles.cardDesc, {color: colors.secondaryText}]}>
                    {pack.description}
                  </Text>
                  {best != null ? (
                    <Text
                      style={[
                        styles.bestScore,
                        {color: colors.primaryAccent},
                      ]}>
                      Best: {Math.round(best * 100)}%
                    </Text>
                  ) : null}
                </View>
              </PressScale>
            </FadeIn>
          );
        })}

        <View style={styles.attemptTop}>
          <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
            Recent scores
          </Text>
          {attempts.length > 0 ? (
            <PressScale onPress={onExport}>
              <Text
                style={[
                  styles.badgeTitle,
                  {color: colors.primaryAccent, marginTop: 20},
                ]}>
                Export CSV
              </Text>
            </PressScale>
          ) : null}
        </View>
        {attempts.length === 0 ? (
          <EmptyState
            title="No tests yet"
            description="Start Easy start or Quick check — you’ll get a score and a trend graph."
          />
        ) : (
          attempts.slice(0, 8).map(attempt => (
            <PressScale
              key={attempt.id}
              onPress={() =>
                navigation.navigate('TestResults', {attemptId: attempt.id})
              }
              style={[
                styles.attemptRow,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                },
              ]}>
              <View style={styles.attemptTop}>
                <Text
                  style={[styles.attemptTitle, {color: colors.primaryText}]}>
                  {attempt.packTitle}
                </Text>
                <Text
                  style={[styles.scoreBadge, {color: colors.primaryAccent}]}>
                  {formatScore(attempt.score, attempt.maxScore)}
                </Text>
              </View>
              <Text style={[styles.attemptMeta, {color: colors.secondaryText}]}>
                {new Date(attempt.createdAt).toLocaleString()}
              </Text>
            </PressScale>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

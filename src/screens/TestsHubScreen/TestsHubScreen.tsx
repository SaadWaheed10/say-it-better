import React, {useCallback, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
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
import {hapticSelection} from '../../services/hapticService';
import {
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

export function TestsHubScreen() {
  const {colors} = useAppTheme();
  const styles = useTestsHubScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [progress, setProgress] = useState<TestProgressSnapshot | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const stats = poolStats();
  const modelReady = isModelReadyForWritten();

  useFocusEffect(
    useCallback(() => {
      getProgressSnapshot().then(setProgress);
      getMistakeQuestionIds().then(ids => setMistakeCount(ids.length));
    }, []),
  );

  const attempts: TestAttempt[] = progress?.attempts ?? [];
  const badges: TestBadge[] = progress?.badges ?? [];
  const recommended = getTestPack(progress?.recommendedPackId ?? 'mixed-10');

  const startPack = (
    packId: string,
    extras?: {
      timed?: boolean;
      mcqOnly?: boolean;
      mistakeQuestionIds?: string[];
    },
  ) => {
    hapticSelection();
    navigation.navigate('TestRunner', {
      packId,
      timed: extras?.timed,
      mcqOnly: extras?.mcqOnly ?? (!modelReady && packId !== 'mcq-only'),
      mistakeQuestionIds: extras?.mistakeQuestionIds,
    });
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
            Pool: {stats.mcq} MCQ · {stats.written} written
            {!modelReady ? ' · model loading → MCQ-only available' : ''}
          </Text>
        </FadeIn>

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
                {progress?.todayDone ? 'Done' : '1 left'}
              </Text>
              <Text style={[styles.statLabel, {color: colors.secondaryText}]}>
                Daily goal
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
                {badges.length}
              </Text>
              <Text style={[styles.statLabel, {color: colors.secondaryText}]}>
                Badges
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={70}>
          <ScoreTrendChart attempts={attempts} />
        </FadeIn>

        {recommended ? (
          <FadeIn delay={90}>
            <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
              Recommended for you
            </Text>
            <PressScale
              onPress={() => startPack(recommended.id)}
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
                  Based on your recent weak skills
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
                  startPack('mixed-10', {mistakeQuestionIds: ids}),
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

        {badges.length > 0 ? (
          <FadeIn delay={110}>
            <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
              Badges
            </Text>
            <View style={styles.badgeRow}>
              {badges.map(badge => (
                <View
                  key={badge.id}
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
                </View>
              ))}
            </View>
          </FadeIn>
        ) : null}

        <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
          Test packs
        </Text>
        {TEST_PACKS.map((pack, index) => {
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
                      style={[styles.bestScore, {color: colors.primaryAccent}]}>
                      Best: {Math.round(best * 100)}%
                    </Text>
                  ) : null}
                </View>
              </PressScale>
            </FadeIn>
          );
        })}

        <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
          Recent scores
        </Text>
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

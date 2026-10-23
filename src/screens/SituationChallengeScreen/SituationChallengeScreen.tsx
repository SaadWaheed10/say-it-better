import React, {useMemo, useState} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {FadeIn} from '../../components/FadeIn';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {getTemplate} from '../../constants/templates';
import {useAppTheme} from '../../hooks/useAppTheme';
import {hapticSuccess} from '../../services/hapticService';
import {
  getBestSituationScore,
  scoreSituationAttempt,
  SituationScoreRecord,
} from '../../services/situationScoreService';
import {RootStackParamList} from '../../types';
import {useSituationChallengeScreenStyles} from './SituationChallengeScreen.styles';

export function SituationChallengeScreen() {
  const {colors} = useAppTheme();
  const styles = useSituationChallengeScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'SituationChallenge'>>();
  const template = useMemo(
    () => getTemplate(route.params.templateId),
    [route.params.templateId],
  );

  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SituationScoreRecord | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);

  React.useEffect(() => {
    if (!template) {
      return;
    }
    getBestSituationScore(template.id).then(setBestScore);
  }, [template]);

  const onScore = async () => {
    if (!template || !draft.trim() || busy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const scored = await scoreSituationAttempt({
        templateId: template.id,
        userAnswer: draft.trim(),
        tone: template.tone,
      });
      setResult(scored);
      const best = await getBestSituationScore(template.id);
      setBestScore(best);
      hapticSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not score reply.');
    } finally {
      setBusy(false);
    }
  };

  if (!template) {
    return (
      <SafeAreaView
        style={[styles.safe, {backgroundColor: colors.canvas}]}
        edges={['top', 'bottom']}>
        <ScreenBackdrop variant="focus" />
        <View style={styles.body}>
          <ScreenHeader title="Challenge" onBack={() => navigation.goBack()} />
          <Text style={[styles.lead, {color: colors.secondaryText}]}>
            Template not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const scorePct = result ? Math.round((result.score / result.maxScore) * 100) : null;
  const bestPct =
    bestScore != null ? Math.round(bestScore * 100) : null;

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <View style={styles.body}>
        <ScreenHeader
          title="Situation challenge"
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.situation, {color: colors.primaryText}]}>
            {template.title}
          </Text>
          <Text style={[styles.lead, {color: colors.secondaryText}]}>
            Rewrite this rough draft for the situation. We’ll score clarity
            against an on-device suggestion.
          </Text>
          <Text style={[styles.starter, {color: colors.secondaryText}]}>
            Rough draft: {template.example}
          </Text>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            placeholder="Type your improved reply…"
            placeholderTextColor={colors.secondaryText}
            style={[
              styles.input,
              {
                color: colors.primaryText,
                backgroundColor: colors.surfaceSolid,
                borderColor: colors.borderSoft,
              },
            ]}
            accessibilityLabel="Your situation reply"
          />

          <AppButton
            label={busy ? 'Scoring…' : 'Score my reply'}
            onPress={onScore}
            disabled={busy || !draft.trim()}
            accessibilityLabel="Score my situation reply"
          />

          {error ? (
            <Text style={[styles.errorLine, {color: colors.accentRose}]}>
              {error}
            </Text>
          ) : null}

          {result && scorePct != null ? (
            <FadeIn>
              <View
                style={[
                  styles.scoreCard,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.primaryAccent,
                  },
                ]}>
                <Text style={[styles.scoreTitle, {color: colors.primaryText}]}>
                  Score {scorePct}/100
                  {bestPct != null ? ` · best ${bestPct}/100` : ''}
                </Text>
                <Text style={[styles.scoreLine, {color: colors.secondaryText}]}>
                  {result.tip}
                </Text>
                {result.modelAnswer ? (
                  <Text style={[styles.improved, {color: colors.primaryText}]}>
                    Stronger version: {result.modelAnswer}
                  </Text>
                ) : null}
              </View>
            </FadeIn>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

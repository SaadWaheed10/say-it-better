import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, ScrollView, Share, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {FadeIn} from '../../components/FadeIn';
import {LoadingView} from '../../components/LoadingView';
import {PhraseComparePanel} from '../../components/PhraseComparePanel';
import {ResultCard} from '../../components/ResultCard';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {TONES} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {improveMessage} from '../../services/aiService';
import {
  addHistoryItem,
  getHistoryItem,
  setHistoryFavorite,
} from '../../services/historyService';
import {hapticLight, hapticSuccess} from '../../services/hapticService';
import {addLibraryItem} from '../../services/libraryService';
import {RootStackParamList} from '../../types';
import {useResultsScreenStyles} from './ResultsScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export function ResultsScreen({navigation, route}: Props) {
  const {colors} = useAppTheme();
  const styles = useResultsScreenStyles();
  const [original, setOriginal] = useState(route.params.original);
  const [improved, setImproved] = useState(route.params.improved);
  const [alternatives, setAlternatives] = useState(route.params.alternatives);
  const [tone] = useState(route.params.tone);
  const [historyId, setHistoryId] = useState(route.params.historyId);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const toneLabel = useMemo(
    () => TONES.find(item => item.id === tone)?.label,
    [tone],
  );

  useEffect(() => {
    if (!historyId) {
      return;
    }
    getHistoryItem(historyId).then(item => {
      if (item) {
        setIsFavorite(Boolean(item.isFavorite));
      }
    });
  }, [historyId]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1600);
  }, []);

  const copyText = async (text: string, label: string) => {
    try {
      Clipboard.setString(text);
      setCopiedLabel(label);
      hapticSuccess();
      setTimeout(() => setCopiedLabel(null), 1600);
    } catch {
      Alert.alert('Copy failed', 'Could not copy to the clipboard.');
    }
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: improved,
        title: 'Corrected phrase',
      });
      hapticLight();
    } catch {
      // User cancelled share sheet.
    }
  };

  const onSaveLibrary = async () => {
    try {
      await addLibraryItem({
        text: improved,
        original,
        tone,
        sourceHistoryId: historyId,
      });
      hapticSuccess();
      showToast('Saved to library');
    } catch {
      Alert.alert('Could not save', 'Phrase library could not be updated.');
    }
  };

  const onToggleFavorite = async () => {
    if (!historyId) {
      Alert.alert(
        'Not in history',
        'This result is not linked to a history item yet.',
      );
      return;
    }
    const next = !isFavorite;
    await setHistoryFavorite(historyId, next);
    setIsFavorite(next);
    hapticLight();
    showToast(next ? 'Added to favorites' : 'Removed from favorites');
  };

  const onRegenerate = async () => {
    setBusy(true);
    try {
      const result = await improveMessage({
        message: original,
        tone,
        instruction: 'Provide a fresh corrected version of the same meaning.',
      });
      const historyItem = await addHistoryItem(result);
      setOriginal(result.original);
      setImproved(result.improved);
      setAlternatives(result.alternatives);
      setHistoryId(historyItem.id);
      setIsFavorite(false);
      hapticSuccess();
      showToast('New version ready');
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : 'Something went wrong.';
      Alert.alert('Could not regenerate', detail);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <View style={styles.body}>
        <ScreenHeader
          title="Before & after"
          onBack={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }
            navigation.navigate('ImproveMessage', {
              message: original,
              tone,
            });
          }}
        />

        {busy ? (
          <LoadingView message="Trying another rewrite…" />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <FadeIn>
              <Text style={[styles.lead, {color: colors.secondaryText}]}>
                Compare what you entered with the corrected English you can
                send.
              </Text>

              {copiedLabel || toast ? (
                <Text style={[styles.copied, {color: colors.success}]}>
                  {copiedLabel ?? toast}
                </Text>
              ) : null}

              <PhraseComparePanel
                original={original}
                corrected={improved}
                toneLabel={toneLabel}
                onCopyOriginal={() => copyText(original, 'Draft copied')}
                onCopyCorrected={() =>
                  copyText(improved, 'Corrected phrase copied')
                }
              />
            </FadeIn>

            {alternatives.length > 0 ? (
              <FadeIn delay={100}>
                <Text
                  style={[styles.sectionTitle, {color: colors.primaryText}]}>
                  Other options
                </Text>
                {alternatives.map((alt, index) => (
                  <View
                    key={`${index}-${alt.slice(0, 12)}`}
                    style={styles.altItem}>
                    <ResultCard
                      compact
                      text={alt}
                      onCopy={() =>
                        copyText(alt, `Option ${index + 1} copied`)
                      }
                    />
                  </View>
                ))}
              </FadeIn>
            ) : null}

            <FadeIn delay={140}>
              <AppButton
                label="Share corrected phrase"
                onPress={onShare}
                style={styles.secondaryCta}
              />
              <AppButton
                label="Try again"
                variant="secondary"
                onPress={onRegenerate}
                style={styles.ghostCta}
              />
              <AppButton
                label="Save to library"
                variant="secondary"
                onPress={onSaveLibrary}
                style={styles.ghostCta}
              />
              <AppButton
                label={isFavorite ? 'Unfavorite' : 'Add to favorites'}
                variant="ghost"
                onPress={onToggleFavorite}
                style={styles.ghostCta}
              />
              <AppButton
                label="Try another tone"
                variant="ghost"
                onPress={() =>
                  navigation.navigate('ImproveMessage', {
                    message: original,
                    tone,
                  })
                }
                style={styles.ghostCta}
              />
              <AppButton
                label="Edit your draft"
                variant="ghost"
                onPress={() =>
                  navigation.navigate('ImproveMessage', {
                    message: original,
                    tone,
                  })
                }
                style={styles.ghostCta}
              />
            </FadeIn>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

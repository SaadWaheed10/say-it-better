import React, {useMemo, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {FadeIn} from '../../components/FadeIn';
import {PhraseComparePanel} from '../../components/PhraseComparePanel';
import {ResultCard} from '../../components/ResultCard';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {TONES} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {RootStackParamList} from '../../types';
import {useResultsScreenStyles} from './ResultsScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export function ResultsScreen({navigation, route}: Props) {
  const {colors} = useAppTheme();
  const styles = useResultsScreenStyles();
  const {original, improved, alternatives, tone} = route.params;
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const toneLabel = useMemo(
    () => TONES.find(item => item.id === tone)?.label,
    [tone],
  );

  const copyText = async (text: string, label: string) => {
    try {
      Clipboard.setString(text);
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(null), 1600);
    } catch {
      Alert.alert('Copy failed', 'Could not copy to the clipboard.');
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
            // Fallback if Results was opened without a prior screen.
            navigation.navigate('ImproveMessage', {
              message: original,
              tone,
            });
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <FadeIn>
            <Text style={[styles.lead, {color: colors.secondaryText}]}>
              Compare what you entered with the corrected English you can send.
            </Text>

            {copiedLabel ? (
              <Text style={[styles.copied, {color: colors.success}]}>
                {copiedLabel}
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
              <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
                Other options
              </Text>
              {alternatives.map((alt, index) => (
                <View
                  key={`${index}-${alt.slice(0, 12)}`}
                  style={styles.altItem}>
                  <ResultCard
                    compact
                    text={alt}
                    onCopy={() => copyText(alt, `Option ${index + 1} copied`)}
                  />
                </View>
              ))}
            </FadeIn>
          ) : null}

          <FadeIn delay={160}>
            <AppButton
              label="Try another tone"
              variant="secondary"
              onPress={() =>
                navigation.navigate('ImproveMessage', {
                  message: original,
                  tone,
                })
              }
              style={styles.secondaryCta}
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
      </View>
    </SafeAreaView>
  );
}

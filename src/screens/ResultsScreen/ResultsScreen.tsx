import React, {useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {AppButton} from '../../components/AppButton';
import {FadeIn} from '../../components/FadeIn';
import {PressScale} from '../../components/PressScale';
import {ResultCard} from '../../components/ResultCard';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useAppTheme} from '../../hooks/useAppTheme';
import {RootStackParamList} from '../../types';
import {ri} from '../../theme/useScaledStyles';
import {useResultsScreenStyles} from './ResultsScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export function ResultsScreen({navigation, route}: Props) {
  const {colors} = useAppTheme();
  const styles = useResultsScreenStyles();
  const {original, improved, alternatives, tone} = route.params;
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

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
          title="Your Improved Message"
          onBack={() => navigation.goBack()}
          right={
            <PressScale
              accessibilityRole="button"
              accessibilityLabel="Copy improved message"
              hitSlop={8}
              onPress={() => copyText(improved, 'Improved message copied')}
              style={[
                styles.copyHit,
                {backgroundColor: colors.surfaceMuted},
              ]}>
              <Svg width={ri(22)} height={ri(22)} viewBox="0 0 24 24">
                <Path
                  d="M8 8 h11 v13 H8 Z"
                  stroke={colors.primaryNavy}
                  strokeWidth={1.8}
                  fill="none"
                />
                <Path
                  d="M5 16 V3 h11"
                  stroke={colors.primaryNavy}
                  strokeWidth={1.8}
                  fill="none"
                />
              </Svg>
            </PressScale>
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <FadeIn>
            <View
              style={[styles.badge, {backgroundColor: colors.successSoft}]}>
              <Text style={[styles.badgeText, {color: colors.success}]}>
                Here's your improved message!
              </Text>
            </View>

            {copiedLabel ? (
              <Text style={[styles.copied, {color: colors.success}]}>
                {copiedLabel}
              </Text>
            ) : null}

            <ResultCard
              title="Improved Version"
              text={improved}
              onCopy={() => copyText(improved, 'Improved message copied')}
            />
          </FadeIn>

          {alternatives.length > 0 ? (
            <FadeIn delay={100}>
              <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
                Other Options
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
              label="Try Another Tone"
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
              label="Edit Original"
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

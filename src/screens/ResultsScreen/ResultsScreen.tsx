import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {AppButton} from '../../components/AppButton';
import {ResultCard} from '../../components/ResultCard';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useAppTheme} from '../../hooks/useAppTheme';
import {RootStackParamList} from '../../types';
import {useResultsScreenStyles} from './ResultsScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export function ResultsScreen({navigation, route}: Props) {
  const {colors, typography, spacing, radii} = useAppTheme();
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
      style={[styles.safe, {backgroundColor: colors.secondaryBackground}]}
      edges={['top', 'bottom']}>
      <View style={{paddingHorizontal: spacing.lg, flex: 1}}>
        <ScreenHeader
          title="Your Improved Message"
          onBack={() => navigation.goBack()}
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Copy improved message"
              hitSlop={8}
              onPress={() => copyText(improved, 'Improved message copied')}>
              <Svg width={22} height={22} viewBox="0 0 24 24">
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
            </Pressable>
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: spacing.xxl}}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.successSoft,
                borderRadius: radii.pill,
                alignSelf: 'flex-start',
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: spacing.md,
              },
            ]}>
            <Text style={[typography.caption, {color: colors.success, fontWeight: '600'}]}>
              Here's your improved message!
            </Text>
          </View>

          {copiedLabel ? (
            <Text
              style={[
                typography.caption,
                {color: colors.success, marginBottom: spacing.sm},
              ]}>
              {copiedLabel}
            </Text>
          ) : null}

          <ResultCard
            title="Improved Version"
            text={improved}
            onCopy={() => copyText(improved, 'Improved message copied')}
          />

          {alternatives.length > 0 ? (
            <>
              <Text
                style={[
                  typography.h3,
                  {
                    color: colors.primaryText,
                    marginTop: spacing.lg,
                    marginBottom: spacing.sm,
                  },
                ]}>
                Other Options
              </Text>
              {alternatives.map((alt, index) => (
                <View key={`${index}-${alt.slice(0, 12)}`} style={{marginBottom: spacing.sm}}>
                  <ResultCard
                    compact
                    text={alt}
                    onCopy={() => copyText(alt, `Option ${index + 1} copied`)}
                  />
                </View>
              ))}
            </>
          ) : null}

          <AppButton
            label="Try Another Tone"
            variant="secondary"
            onPress={() =>
              navigation.navigate('ImproveMessage', {message: original, tone})
            }
            style={{marginTop: spacing.lg}}
          />
          <AppButton
            label="Edit Original"
            variant="ghost"
            onPress={() =>
              navigation.navigate('ImproveMessage', {message: original, tone})
            }
            style={{marginTop: spacing.xs}}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

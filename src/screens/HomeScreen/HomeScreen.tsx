import React, {useCallback, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {AppButton} from '../../components/AppButton';
import {FadeIn} from '../../components/FadeIn';
import {PressScale} from '../../components/PressScale';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ToneIcon} from '../../components/ToneIcon';
import {TONES} from '../../constants/tones';
import {APP_NAME} from '../../constants/storage';
import {useAppTheme} from '../../hooks/useAppTheme';
import {getModelStatus} from '../../services/aiService';
import {ModelState, RootStackParamList, ToneId} from '../../types';
import {ri} from '../../theme/useScaledStyles';
import {useHomeScreenStyles} from './HomeScreen.styles';

export function HomeScreen() {
  const {colors} = useAppTheme();
  const styles = useHomeScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [modelState, setModelState] = useState<ModelState>(getModelStatus());

  useFocusEffect(
    useCallback(() => {
      setModelState(getModelStatus());
    }, []),
  );

  const openImprove = (tone?: ToneId) => {
    navigation.navigate('ImproveMessage', tone ? {tone} : undefined);
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
          <View style={styles.topRow}>
            <View />
            <PressScale
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              hitSlop={10}
              onPress={() =>
                (navigation as {navigate: (name: string) => void}).navigate(
                  'Settings',
                )
              }
              style={[
                styles.settingsHit,
                {backgroundColor: colors.surfaceMuted},
              ]}>
              <Svg width={ri(22)} height={ri(22)} viewBox="0 0 24 24">
                <Path
                  d="M12 15 a3 3 0 1 0 0-6 a3 3 0 0 0 0 6 Z"
                  stroke={colors.primaryNavy}
                  strokeWidth={1.8}
                  fill="none"
                />
                <Path
                  d="M19.4 15 a1.7 1.7 0 0 0 .3 1.8 l.1.1 a2 2 0 1 1-2.8 2.8 l-.1-.1 a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5 V21 a2 2 0 1 1-4 0 v-.1 a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3 l-.1.1 a2 2 0 1 1-2.8-2.8 l.1-.1 a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1 H3 a2 2 0 1 1 0-4 h.1 a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8 l-.1-.1 a2 2 0 1 1 2.8-2.8 l.1.1 a1.7 1.7 0 0 0 1.8.3 H9 a1.7 1.7 0 0 0 1-1.5 V3 a2 2 0 1 1 4 0 v.1 a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3 l.1-.1 a2 2 0 1 1 2.8 2.8 l-.1.1 a1.7 1.7 0 0 0-.3 1.8 V9 a1.7 1.7 0 0 0 1.5 1 H21 a2 2 0 1 1 0 4 h-.1 a1.7 1.7 0 0 0-1.5 1 Z"
                  stroke={colors.primaryNavy}
                  strokeWidth={1.5}
                  fill="none"
                />
              </Svg>
            </PressScale>
          </View>

          <Text style={[styles.brand, {color: colors.primaryNavy}]}>
            {APP_NAME}
          </Text>
          <Text style={[styles.headline, {color: colors.primaryText}]}>
            Let's find the right words.
          </Text>
          <Text style={[styles.subtitle, {color: colors.secondaryText}]}>
            Type or speak in your own words — we fix the English so it sounds
            clear. Fully on your device.
          </Text>
        </FadeIn>

        <FadeIn delay={90} style={styles.heroPanel}>
          <View
            style={[
              styles.heroAccentBar,
              {backgroundColor: colors.primaryAccent},
            ]}
          />
          <Text style={[styles.heroCopy, {color: colors.primaryText}]}>
            Rough English in → polished message out. We correct phrases, not
            answer questions.
          </Text>
          <AppButton
            label="Start Improving"
            iconRight="→"
            onPress={() => openImprove()}
            accessibilityLabel="Improve a message"
          />
        </FadeIn>

        {modelState.status !== 'ready' ? (
          <FadeIn delay={120}>
            <View
              style={[
                styles.statusBanner,
                {
                  backgroundColor:
                    modelState.status === 'error' ||
                    modelState.status === 'missing'
                      ? colors.errorSoft
                      : colors.accentWash,
                  borderColor: colors.borderSoft,
                },
              ]}>
              <Text style={[styles.statusText, {color: colors.secondaryText}]}>
                {modelState.message}
              </Text>
            </View>
          </FadeIn>
        ) : null}

        <FadeIn delay={160}>
          <Text style={[styles.sectionTitle, {color: colors.primaryText}]}>
            Popular Tones
          </Text>
          <View style={styles.toneGrid}>
            {TONES.slice(0, 4).map(tone => (
              <PressScale
                key={tone.id}
                onPress={() => openImprove(tone.id)}
                accessibilityRole="button"
                accessibilityLabel={`Improve with ${tone.label} tone`}
                style={[
                  styles.toneCard,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}>
                <ToneIcon name={tone.icon} color={colors.primaryNavy} />
                <Text style={[styles.toneLabel, {color: colors.primaryText}]}>
                  {tone.label}
                </Text>
              </PressScale>
            ))}
          </View>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

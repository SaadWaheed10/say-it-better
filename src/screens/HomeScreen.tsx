import React, {useCallback, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {AppButton} from '../components/AppButton';
import {ToneIcon} from '../components/ToneIcon';
import {TONES} from '../constants/tones';
import {APP_NAME} from '../constants/storage';
import {useAppTheme} from '../hooks/useAppTheme';
import {getModelStatus} from '../services/aiService';
import {ModelState, RootStackParamList, ToneId} from '../types';

export function HomeScreen() {
  const {colors, typography, spacing, radii} = useAppTheme();
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
      style={[styles.safe, {backgroundColor: colors.background}]}
      edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            hitSlop={10}
            onPress={() =>
              (navigation as {navigate: (name: string) => void}).navigate(
                'Settings',
              )
            }>
            <Svg width={22} height={22} viewBox="0 0 24 24">
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
          </Pressable>
        </View>

        <Text style={[typography.brand, {color: colors.primaryNavy, fontSize: 26}]}>
          {APP_NAME}
        </Text>
        <Text
          style={[
            typography.h2,
            {color: colors.primaryText, marginTop: spacing.sm},
          ]}>
          Let's find the right words.
        </Text>
        <Text
          style={[
            typography.body,
            {color: colors.secondaryText, marginTop: spacing.xs},
          ]}>
          Improve your message with AI — privately, on your device.
        </Text>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.lavenderSoft,
              borderRadius: radii.xl,
              marginTop: spacing.xl,
              padding: spacing.lg,
            },
          ]}>
          <Svg width={120} height={72} viewBox="0 0 120 72">
            <Rect x="18" y="16" width="70" height="44" rx="14" fill={colors.lavender} />
            <Path d="M34 32 h38 M34 44 h28" stroke={colors.primaryAccent} strokeWidth={4} strokeLinecap="round" />
            <Circle cx="96" cy="22" r="10" fill={colors.primaryNavy} />
            <Path d="M96 16 v12 M90 22 h12" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <Text
            style={[
              typography.body,
              {color: colors.secondaryText, marginVertical: spacing.sm},
            ]}>
            Rewrite a message in seconds while keeping your original meaning.
          </Text>
          <AppButton
            label="Start Improving"
            iconRight="→"
            onPress={() => openImprove()}
            accessibilityLabel="Improve a message"
          />
        </View>

        {modelState.status !== 'ready' ? (
          <View
            style={[
              styles.statusBanner,
              {
                backgroundColor:
                  modelState.status === 'error' || modelState.status === 'missing'
                    ? colors.errorSoft
                    : colors.secondaryBackground,
                borderRadius: radii.md,
                marginTop: spacing.md,
                padding: spacing.sm,
              },
            ]}>
            <Text style={[typography.caption, {color: colors.secondaryText}]}>
              {modelState.message}
            </Text>
          </View>
        ) : null}

        <Text
          style={[
            typography.h3,
            {color: colors.primaryText, marginTop: spacing.xl, marginBottom: spacing.sm},
          ]}>
          Popular Tones
        </Text>
        <View style={styles.toneGrid}>
          {TONES.slice(0, 4).map(tone => (
            <Pressable
              key={tone.id}
              onPress={() => openImprove(tone.id)}
              accessibilityRole="button"
              accessibilityLabel={`Improve with ${tone.label} tone`}
              style={[
                styles.toneCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                },
              ]}>
              <ToneIcon name={tone.icon} color={colors.primaryNavy} />
              <Text
                style={[
                  typography.label,
                  {color: colors.primaryText, marginTop: 8},
                ]}>
                {tone.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    marginBottom: 4,
  },
  heroCard: {},
  statusBanner: {},
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toneCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    minHeight: 88,
    justifyContent: 'center',
  },
});

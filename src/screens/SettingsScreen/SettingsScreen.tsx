import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Pressable, ScrollView, Switch, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {ToneSelector} from '../../components/ToneSelector';
import {APP_NAME, APP_VERSION} from '../../constants/storage';
import {useAppTheme} from '../../hooks/useAppTheme';
import {
  getModelStatus,
  initializeModel,
  subscribeModelState,
} from '../../services/aiService';
import {clearHistory} from '../../services/historyService';
import {getSettings, saveSettings} from '../../services/settingsService';
import {ModelState, ThemePreference, ToneId} from '../../types';
import {useSettingsScreenStyles} from './SettingsScreen.styles';

export function SettingsScreen() {
  const {colors, typography, spacing, radii, themePreference, setThemePreference} =
    useAppTheme();
  const styles = useSettingsScreenStyles();
  const [defaultTone, setDefaultTone] = useState<ToneId>('professional');
  const [modelState, setModelState] = useState<ModelState>(getModelStatus());
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeModelState(setModelState), []);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(settings => setDefaultTone(settings.defaultTone));
      setModelState(getModelStatus());
    }, []),
  );

  const onToneChange = async (tone: ToneId) => {
    setDefaultTone(tone);
    await saveSettings({defaultTone: tone});
  };

  const onThemeToggle = async (dark: boolean) => {
    const next: ThemePreference = dark ? 'dark' : 'light';
    await setThemePreference(next);
  };

  const onClearHistory = () => {
    Alert.alert(
      'Clear local history?',
      'All saved rewrites will be removed from this device.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ],
    );
  };

  const onReloadModel = async () => {
    setBusy(true);
    try {
      await initializeModel();
    } finally {
      setBusy(false);
    }
  };

  const rowStyle = [
    styles.row,
    {
      backgroundColor: colors.secondaryBackground,
      borderRadius: radii.md,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.background}]}
      edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxxl,
        }}>
        <Text style={[typography.h2, {color: colors.primaryText}]}>
          Settings
        </Text>

        <Text
          style={[
            typography.label,
            {
              color: colors.secondaryText,
              marginTop: spacing.lg,
              marginBottom: spacing.sm,
            },
          ]}>
          App Preferences
        </Text>

        <Text
          style={[
            typography.bodyMedium,
            {color: colors.primaryText, marginBottom: spacing.xs},
          ]}>
          Default Tone
        </Text>
        <ToneSelector selected={defaultTone} onSelect={onToneChange} />

        <View style={[rowStyle, {marginTop: spacing.lg}]}>
          <Text style={[typography.bodyMedium, {color: colors.primaryText}]}>
            Dark Mode
          </Text>
          <Switch
            value={themePreference === 'dark'}
            onValueChange={onThemeToggle}
            accessibilityLabel="Toggle dark mode"
          />
        </View>

        <Pressable
          style={rowStyle}
          onPress={() =>
            Alert.alert(
              'Theme preference',
              'Choose light, dark, or follow the system setting.',
              [
                {text: 'Light', onPress: () => setThemePreference('light')},
                {text: 'Dark', onPress: () => setThemePreference('dark')},
                {text: 'System', onPress: () => setThemePreference('system')},
                {text: 'Cancel', style: 'cancel'},
              ],
            )
          }>
          <Text style={[typography.bodyMedium, {color: colors.primaryText}]}>
            Theme
          </Text>
          <Text style={[typography.body, {color: colors.secondaryText}]}>
            {themePreference}
          </Text>
        </Pressable>

        <Text
          style={[
            typography.label,
            {
              color: colors.secondaryText,
              marginTop: spacing.lg,
              marginBottom: spacing.sm,
            },
          ]}>
          Local AI Model
        </Text>
        <View
          style={[
            styles.modelCard,
            {
              backgroundColor: colors.secondaryBackground,
              borderRadius: radii.lg,
              borderColor: colors.border,
              padding: spacing.md,
            },
          ]}>
          <Text style={[typography.bodyMedium, {color: colors.primaryText}]}>
            Status: {modelState.status}
          </Text>
          <Text
            style={[
              typography.caption,
              {color: colors.secondaryText, marginTop: 6},
            ]}>
            {modelState.message}
          </Text>
          {modelState.detail ? (
            <Text
              style={[
                typography.caption,
                {color: colors.secondaryText, marginTop: 4},
              ]}>
              {modelState.detail}
            </Text>
          ) : null}
          {modelState.path ? (
            <Text
              style={[
                typography.caption,
                {color: colors.secondaryText, marginTop: 4},
              ]}
              numberOfLines={2}>
              Path: {modelState.path}
            </Text>
          ) : null}
          <AppButton
            label="Retry model load"
            variant="secondary"
            loading={busy}
            onPress={onReloadModel}
            style={{marginTop: spacing.md}}
          />
        </View>

        <Text
          style={[
            typography.label,
            {
              color: colors.secondaryText,
              marginTop: spacing.lg,
              marginBottom: spacing.sm,
            },
          ]}>
          Privacy & Data
        </Text>
        <View style={rowStyle}>
          <Text
            style={[
              typography.body,
              {color: colors.secondaryText, flex: 1, paddingVertical: 8},
            ]}>
            Messages and history are stored only on this device. SayItBetter does
            not send your writing to a cloud AI API.
          </Text>
        </View>
        <AppButton
          label="Clear local history"
          variant="secondary"
          onPress={onClearHistory}
        />

        <Text
          style={[
            typography.label,
            {
              color: colors.secondaryText,
              marginTop: spacing.lg,
              marginBottom: spacing.sm,
            },
          ]}>
          About
        </Text>
        <View style={rowStyle}>
          <Text style={[typography.bodyMedium, {color: colors.primaryText}]}>
            About {APP_NAME}
          </Text>
          <Text style={[typography.caption, {color: colors.secondaryText}]}>
            v{APP_VERSION}
          </Text>
        </View>
        <Text
          style={[
            typography.caption,
            {
              color: colors.secondaryText,
              textAlign: 'center',
              marginTop: spacing.xl,
            },
          ]}>
          Made for a better way to communicate
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, Switch, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {showAppAlert} from '../../components/AppModal';
import {FadeIn} from '../../components/FadeIn';
import {PressScale} from '../../components/PressScale';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ToneSelector} from '../../components/ToneSelector';
import {APP_NAME, APP_VERSION} from '../../constants/storage';
import {useAppTheme} from '../../hooks/useAppTheme';
import {
  getModelStatus,
  initializeModel,
  subscribeModelState,
} from '../../services/aiService';
import {clearHistory} from '../../services/historyService';
import {syncDailyTestReminder} from '../../services/notificationService';
import {getSettings, saveSettings} from '../../services/settingsService';
import {
  ModelState,
  RootStackParamList,
  ThemePreference,
  ToneId,
} from '../../types';
import {useSettingsScreenStyles} from './SettingsScreen.styles';

export function SettingsScreen() {
  const {
    colors,
    themePreference,
    setThemePreference,
    reduceMotion,
    setReduceMotion,
  } = useAppTheme();
  const styles = useSettingsScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [defaultTone, setDefaultTone] = useState<ToneId>('professional');
  const [dailyTestReminder, setDailyTestReminder] = useState(false);
  const [modelState, setModelState] = useState<ModelState>(getModelStatus());
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeModelState(setModelState), []);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(settings => {
        setDefaultTone(settings.defaultTone);
        setDailyTestReminder(Boolean(settings.dailyTestReminder));
      });
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
    showAppAlert(
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

  const surface = {
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.borderSoft,
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top']}>
      <ScreenBackdrop variant="app" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FadeIn>
          <Text style={[styles.title, {color: colors.primaryText}]}>
            Settings
          </Text>
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
        </FadeIn>

        <FadeIn delay={80}>
          <Text style={[styles.sectionLabel, {color: colors.secondaryText}]}>
            App Preferences
          </Text>

          <Text style={[styles.fieldLabel, {color: colors.primaryText}]}>
            Default Tone
          </Text>
          <ToneSelector selected={defaultTone} onSelect={onToneChange} />

          <View style={[styles.row, styles.rowAfterTone, surface]}>
            <Text style={[styles.rowText, {color: colors.primaryText}]}>
              Dark Mode
            </Text>
            <Switch
              value={themePreference === 'dark'}
              onValueChange={onThemeToggle}
              accessibilityLabel="Toggle dark mode"
              trackColor={{
                false: colors.border,
                true: colors.primaryAccent,
              }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.row, surface]}>
            <Text style={[styles.rowText, {color: colors.primaryText}]}>
              Daily test reminder
            </Text>
            <Switch
              value={dailyTestReminder}
              onValueChange={async enabled => {
                setDailyTestReminder(enabled);
                await saveSettings({dailyTestReminder: enabled});
                await syncDailyTestReminder(enabled);
              }}
              accessibilityLabel="Toggle daily test reminder"
              trackColor={{
                false: colors.border,
                true: colors.primaryAccent,
              }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.row, surface]}>
            <Text style={[styles.rowText, {color: colors.primaryText}]}>
              Reduce motion
            </Text>
            <Switch
              value={reduceMotion}
              onValueChange={async enabled => {
                await setReduceMotion(enabled);
              }}
              accessibilityLabel="Toggle reduce motion"
              accessibilityHint="Turns off decorative animations in the app"
              trackColor={{
                false: colors.border,
                true: colors.primaryAccent,
              }}
              thumbColor={colors.white}
            />
          </View>

          <PressScale
            style={[styles.row, surface]}
            accessibilityRole="button"
            accessibilityLabel={`Theme preference, currently ${themePreference}`}
            onPress={() =>
              showAppAlert(
                'Theme preference',
                'Choose light, dark, or follow the system setting.',
                [
                  {text: 'Light', onPress: () => setThemePreference('light')},
                  {text: 'Dark', onPress: () => setThemePreference('dark')},
                  {
                    text: 'System',
                    onPress: () => setThemePreference('system'),
                  },
                  {text: 'Cancel', style: 'cancel'},
                ],
              )
            }>
            <Text style={[styles.rowText, {color: colors.primaryText}]}>
              Theme
            </Text>
            <Text style={[styles.rowValue, {color: colors.secondaryText}]}>
              {themePreference}
            </Text>
          </PressScale>
        </FadeIn>

        <FadeIn delay={140}>
          <Text style={[styles.sectionLabel, {color: colors.secondaryText}]}>
            Local AI Model
          </Text>
          <View style={[styles.modelCard, surface]}>
            <Text style={[styles.modelTitle, {color: colors.primaryText}]}>
              Status: {modelState.status}
            </Text>
            <Text style={[styles.modelMeta, {color: colors.secondaryText}]}>
              {modelState.message}
            </Text>
            {modelState.detail ? (
              <Text
                style={[styles.modelMetaTight, {color: colors.secondaryText}]}>
                {modelState.detail}
              </Text>
            ) : null}
            {modelState.path ? (
              <Text
                style={[styles.modelMetaTight, {color: colors.secondaryText}]}
                numberOfLines={2}>
                Path: {modelState.path}
              </Text>
            ) : null}
            <AppButton
              label="Retry model load"
              variant="secondary"
              loading={busy}
              onPress={onReloadModel}
              style={styles.retryBtn}
            />
          </View>
        </FadeIn>

        <FadeIn delay={200}>
          <Text style={[styles.sectionLabel, {color: colors.secondaryText}]}>
            Privacy & Data
          </Text>
          <View style={[styles.row, surface]}>
            <Text
              style={[styles.privacyText, {color: colors.secondaryText}]}>
              Messages and history are stored only on this device. SayItBetter
              does not send your writing to a cloud AI API.
            </Text>
          </View>
          <AppButton
            label="Clear local history"
            variant="secondary"
            onPress={onClearHistory}
          />

          <Text style={[styles.sectionLabel, {color: colors.secondaryText}]}>
            About
          </Text>
          <PressScale
            style={[styles.row, surface]}
            onPress={() => navigation.navigate('About')}>
            <Text style={[styles.rowText, {color: colors.primaryText}]}>
              About & privacy
            </Text>
            <Text style={[styles.aboutCaption, {color: colors.secondaryText}]}>
              v{APP_VERSION}
            </Text>
          </PressScale>
          <PressScale
            style={[styles.row, surface]}
            onPress={() => navigation.navigate('Library')}>
            <Text style={[styles.rowText, {color: colors.primaryText}]}>
              Phrase library
            </Text>
            <Text style={[styles.aboutCaption, {color: colors.secondaryText}]}>
              Saved lines
            </Text>
          </PressScale>
          <PressScale
            style={[styles.row, surface]}
            onPress={() => navigation.navigate('Practice')}>
            <Text style={[styles.rowText, {color: colors.primaryText}]}>
              Practice mode
            </Text>
            <Text style={[styles.aboutCaption, {color: colors.secondaryText}]}>
              Learn by rewriting
            </Text>
          </PressScale>
          <PressScale
            style={[styles.row, surface]}
            onPress={() => navigation.navigate('Review')}>
            <Text style={[styles.rowText, {color: colors.primaryText}]}>
              Spaced review
            </Text>
            <Text style={[styles.aboutCaption, {color: colors.secondaryText}]}>
              Mistakes & favorites
            </Text>
          </PressScale>
          <PressScale
            style={[styles.row, surface]}
            onPress={() => navigation.navigate('TipsLibrary')}>
            <Text style={[styles.rowText, {color: colors.primaryText}]}>
              Tips library
            </Text>
            <Text style={[styles.aboutCaption, {color: colors.secondaryText}]}>
              Offline writing tips
            </Text>
          </PressScale>
          <Text style={[styles.footerNote, {color: colors.secondaryText}]}>
            {APP_NAME} · Made for a better way to communicate
          </Text>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

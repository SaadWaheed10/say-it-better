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
import {useAuth} from '../../hooks/useAuth';
import {useAppTheme} from '../../hooks/useAppTheme';
import {
  getModelStatus,
  initializeModel,
  subscribeModelState,
} from '../../services/aiService';
import {
  checkSupabaseConnection,
  SupabaseConnectionStatus,
} from '../../services/authService';
import {clearHistory} from '../../services/historyService';
import {syncDailyTestReminder} from '../../services/notificationService';
import {getSettings, saveSettings} from '../../services/settingsService';
import {syncAllProgress} from '../../services/syncProgressService';
import {
  ModelState,
  RootStackParamList,
  ThemePreference,
  ToneId,
} from '../../types';
import {useSettingsScreenStyles} from './SettingsScreen.styles';

function connectionLabel(status: SupabaseConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'unreachable':
      return 'Unreachable';
    case 'not_configured':
      return 'Not configured';
    default:
      return 'Checking…';
  }
}

export function SettingsScreen() {
  const {
    colors,
    themePreference,
    setThemePreference,
    reduceMotion,
    setReduceMotion,
  } = useAppTheme();
  const {user: authUser, signOut, refresh: refreshAuth} = useAuth();
  const styles = useSettingsScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [defaultTone, setDefaultTone] = useState<ToneId>('professional');
  const [dailyTestReminder, setDailyTestReminder] = useState(false);
  const [modelState, setModelState] = useState<ModelState>(getModelStatus());
  const [busy, setBusy] = useState(false);
  const [supabaseStatus, setSupabaseStatus] =
    useState<SupabaseConnectionStatus>('checking');
  const [supabaseDetail, setSupabaseDetail] = useState('Checking…');
  const [pingBusy, setPingBusy] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncDetail, setSyncDetail] = useState<string | null>(null);

  useEffect(() => subscribeModelState(setModelState), []);

  const refreshSupabaseStatus = useCallback(async () => {
    setPingBusy(true);
    setSupabaseStatus('checking');
    setSupabaseDetail('Checking…');
    try {
      const result = await checkSupabaseConnection();
      setSupabaseStatus(result.status);
      setSupabaseDetail(result.detail);
    } finally {
      setPingBusy(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(settings => {
        setDefaultTone(settings.defaultTone);
        setDailyTestReminder(Boolean(settings.dailyTestReminder));
      });
      setModelState(getModelStatus());
      refreshSupabaseStatus();
      void refreshAuth();
    }, [refreshSupabaseStatus, refreshAuth]),
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

        <FadeIn delay={40}>
          <Text style={[styles.sectionLabel, {color: colors.secondaryText}]}>
            Account
          </Text>
          <View style={[styles.modelCard, surface]}>
            <Text style={[styles.modelTitle, {color: colors.primaryText}]}>
              Supabase: {connectionLabel(supabaseStatus)}
            </Text>
            <Text style={[styles.modelMeta, {color: colors.secondaryText}]}>
              {supabaseDetail}
            </Text>
            <Text style={[styles.modelMetaTight, {color: colors.secondaryText}]}>
              {authUser?.email
                ? `Signed in as ${authUser.email}`
                : 'Not signed in — app works offline without an account'}
            </Text>
            <AppButton
              label={pingBusy ? 'Checking…' : 'Check connection'}
              variant="secondary"
              loading={pingBusy}
              onPress={refreshSupabaseStatus}
              style={styles.retryBtn}
              accessibilityLabel="Check Supabase connection"
            />
            {authUser ? (
              <>
                {syncDetail ? (
                  <Text
                    style={[
                      styles.modelMetaTight,
                      {color: colors.secondaryText},
                    ]}>
                    {syncDetail}
                  </Text>
                ) : null}
                <AppButton
                  label={syncBusy ? 'Syncing…' : 'Sync progress now'}
                  variant="secondary"
                  loading={syncBusy}
                  onPress={async () => {
                    setSyncBusy(true);
                    try {
                      const result = await syncAllProgress();
                      setSyncDetail(result.detail);
                    } finally {
                      setSyncBusy(false);
                    }
                  }}
                  style={styles.retryBtn}
                  accessibilityLabel="Sync progress to Supabase"
                />
                <AppButton
                  label="Sign out"
                  variant="ghost"
                  onPress={() => {
                    showAppAlert(
                      'Sign out?',
                      'You can keep using the app locally.',
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Sign out',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await signOut();
                              setSyncDetail(null);
                            } catch (e) {
                              showAppAlert(
                                'Sign out failed',
                                e instanceof Error ? e.message : 'Try again.',
                              );
                            }
                          },
                        },
                      ],
                    );
                  }}
                  style={styles.retryBtn}
                />
              </>
            ) : (
              <>
                <AppButton
                  label="Sign in"
                  onPress={() => navigation.navigate('SignIn')}
                  style={styles.retryBtn}
                />
                <AppButton
                  label="Create account"
                  variant="secondary"
                  onPress={() => navigation.navigate('SignUp')}
                  style={styles.retryBtn}
                />
              </>
            )}
          </View>
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

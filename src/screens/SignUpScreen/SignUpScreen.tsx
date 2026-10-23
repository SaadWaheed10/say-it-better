import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {BrandLogo} from '../../components/BrandLogo';
import {showAppAlert} from '../../components/AppModal';
import {FadeIn} from '../../components/FadeIn';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useAppTheme} from '../../hooks/useAppTheme';
import {signUpWithEmail} from '../../services/authService';
import {hapticSuccess} from '../../services/hapticService';
import {markOnboardingCompleted} from '../../services/settingsService';
import {RootStackParamList} from '../../types';
import {useSignUpScreenStyles} from './SignUpScreen.styles';

export function SignUpScreen() {
  const {colors} = useAppTheme();
  const styles = useSignUpScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SignUp'>>();
  const fromOnboarding = Boolean(route.params?.fromOnboarding);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishAfterAuth = async () => {
    if (fromOnboarding) {
      await markOnboardingCompleted();
      navigation.reset({index: 0, routes: [{name: 'MainTabs'}]});
      return;
    }
    navigation.goBack();
  };

  const onSubmit = async () => {
    if (busy) {
      return;
    }
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError('Enter a valid email and a password (6+ characters).');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const result = await signUpWithEmail(email, password);
      hapticSuccess();
      if (result.needsEmailConfirm) {
        showAppAlert(
          'Check your email',
          'We sent a confirmation link. After confirming, come back and sign in.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.replace('SignIn', {fromOnboarding}),
            },
          ],
        );
        return;
      }
      await finishAfterAuth();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant={fromOnboarding ? 'onboarding' : 'focus'} />
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader
          title="Create account"
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <FadeIn style={styles.hero}>
            <BrandLogo size={64} />
            <Text style={[styles.brand, {color: colors.primaryText}]}>
              SayIt
              <Text style={{color: colors.primaryAccent}}>Better</Text>
            </Text>
            <LinearGradient
              colors={[
                colors.primaryAccent,
                colors.accentWarm,
                colors.accentRose,
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.brandUnderline}
            />
            <Text style={[styles.title, {color: colors.primaryText}]}>
              Create your account
            </Text>
            <Text style={[styles.lead, {color: colors.secondaryText}]}>
              Optional — sync streaks and scores later. You can keep using the
              app without signing up.
            </Text>
          </FadeIn>

          <FadeIn delay={80}>
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                },
              ]}>
              <Text style={[styles.label, {color: colors.primaryText}]}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                placeholder="you@example.com"
                placeholderTextColor={colors.secondaryText}
                style={[
                  styles.input,
                  {
                    color: colors.primaryText,
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.borderSoft,
                  },
                ]}
                accessibilityLabel="Email"
              />

              <Text style={[styles.label, {color: colors.primaryText}]}>
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                placeholder="At least 6 characters"
                placeholderTextColor={colors.secondaryText}
                style={[
                  styles.input,
                  {
                    color: colors.primaryText,
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.borderSoft,
                  },
                ]}
                accessibilityLabel="Password"
              />

              <Text style={[styles.label, {color: colors.primaryText}]}>
                Confirm password
              </Text>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                placeholder="Repeat password"
                placeholderTextColor={colors.secondaryText}
                style={[
                  styles.input,
                  {
                    color: colors.primaryText,
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.borderSoft,
                  },
                ]}
                accessibilityLabel="Confirm password"
              />

              {error ? (
                <Text style={[styles.error, {color: colors.accentRose}]}>
                  {error}
                </Text>
              ) : (
                <Text style={[styles.hint, {color: colors.secondaryText}]}>
                  Tip: disable “Confirm email” in Supabase Auth while testing
                  for instant sign-in.
                </Text>
              )}

              <View style={styles.actions}>
                <AppButton
                  label={busy ? 'Creating…' : 'Create account'}
                  onPress={onSubmit}
                  disabled={busy}
                  accessibilityLabel="Create account"
                />
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={120}>
            <Pressable
              style={styles.switchRow}
              onPress={() => navigation.replace('SignIn', {fromOnboarding})}
              accessibilityRole="button"
              accessibilityLabel="Sign in instead">
              <Text style={[styles.switchText, {color: colors.secondaryText}]}>
                Already have an account?{' '}
                <Text
                  style={[styles.switchLink, {color: colors.primaryAccent}]}>
                  Sign in
                </Text>
              </Text>
            </Pressable>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

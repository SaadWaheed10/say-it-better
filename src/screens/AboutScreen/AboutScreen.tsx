import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BrandLogo} from '../../components/BrandLogo';
import {FadeIn} from '../../components/FadeIn';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {APP_NAME, APP_TAGLINE, APP_VERSION} from '../../constants/storage';
import {useAppTheme} from '../../hooks/useAppTheme';
import {RootStackParamList} from '../../types';
import {useAboutScreenStyles} from './AboutScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export function AboutScreen({navigation}: Props) {
  const {colors} = useAppTheme();
  const styles = useAboutScreenStyles();

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="app" />
      <View style={styles.body}>
        <ScreenHeader title="About & privacy" onBack={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <FadeIn>
            <BrandLogo size={72} />
            <Text style={[styles.brand, {color: colors.primaryText}]}>
              {APP_NAME}
            </Text>
            <Text style={[styles.version, {color: colors.secondaryText}]}>
              v{APP_VERSION} · {APP_TAGLINE}
            </Text>
          </FadeIn>

          <FadeIn delay={80}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                },
              ]}>
              <Text style={[styles.cardTitle, {color: colors.primaryText}]}>
                What this app does
              </Text>
              <Text style={[styles.cardBody, {color: colors.secondaryText}]}>
                SayItBetter corrects rough English into clearer phrases you can
                send. It is a rewriting tool — not a chatbot that answers
                questions.
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={120}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                },
              ]}>
              <Text style={[styles.cardTitle, {color: colors.primaryText}]}>
                Privacy
              </Text>
              <Text style={[styles.cardBody, {color: colors.secondaryText}]}>
                Speech recognition and phrase correction run on your device.
                Drafts, history, favorites, and your phrase library stay in
                local storage. SayItBetter does not send your writing to a cloud
                AI API.
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={160}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceSolid,
                  borderColor: colors.borderSoft,
                },
              ]}>
              <Text style={[styles.cardTitle, {color: colors.primaryText}]}>
                On-device models
              </Text>
              <Text style={[styles.cardBody, {color: colors.secondaryText}]}>
                A bundled language model rewrites your phrases. An optional
                speech model turns voice into text. Both stay on the phone —
                nothing is uploaded for processing.
              </Text>
            </View>
          </FadeIn>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FadeIn} from '../../components/FadeIn';
import {PressScale} from '../../components/PressScale';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {TONES} from '../../constants/tones';
import {TEMPLATES, accentColorKey} from '../../constants/templates';
import {useAppTheme} from '../../hooks/useAppTheme';
import {hapticSelection} from '../../services/hapticService';
import {RootStackParamList} from '../../types';
import {useTemplatesScreenStyles} from './TemplatesScreen.styles';

export function TemplatesScreen() {
  const {colors} = useAppTheme();
  const styles = useTemplatesScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top']}>
      <ScreenBackdrop variant="app" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <FadeIn>
          <Text style={[styles.title, {color: colors.primaryText}]}>
            Situations
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
          <Text style={[styles.caption, {color: colors.secondaryText}]}>
            Pick a scenario — we prefill a rough draft and tone so you can
            correct it faster.
          </Text>
        </FadeIn>

        {TEMPLATES.map((template, index) => {
          const accent = colors[accentColorKey(template.accent)];
          const toneLabel =
            TONES.find(t => t.id === template.tone)?.label ?? template.tone;
          return (
            <FadeIn key={template.id} delay={Math.min(index * 40, 200)}>
              <PressScale
                onPress={() => {
                  hapticSelection();
                  navigation.navigate('ImproveMessage', {
                    message: template.example,
                    instruction: template.instruction,
                    tone: template.tone,
                    templateId: template.id,
                  });
                }}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: `${accent}44`,
                  },
                ]}>
                <LinearGradient
                  colors={[accent, colors.accentWarm]}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                  style={styles.cardStripe}
                />
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, {color: colors.primaryText}]}>
                    {template.title}
                  </Text>
                  <Text
                    style={[styles.cardSubtitle, {color: colors.secondaryText}]}>
                    {template.subtitle}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[styles.example, {color: colors.secondaryText}]}>
                    “{template.example}”
                  </Text>
                  <View
                    style={[
                      styles.toneChip,
                      {backgroundColor: `${accent}22`},
                    ]}>
                    <Text style={[styles.toneChipText, {color: accent}]}>
                      {toneLabel}
                    </Text>
                  </View>
                </View>
              </PressScale>
            </FadeIn>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

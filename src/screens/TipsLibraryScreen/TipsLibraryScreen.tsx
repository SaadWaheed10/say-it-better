import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FadeIn} from '../../components/FadeIn';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {TIP_CARDS} from '../../constants/tips';
import {useAppTheme} from '../../hooks/useAppTheme';
import {RootStackParamList} from '../../types';
import {useTipsLibraryScreenStyles} from './TipsLibraryScreen.styles';

export function TipsLibraryScreen() {
  const {colors} = useAppTheme();
  const styles = useTipsLibraryScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <View style={styles.body}>
        <ScreenHeader
          title="Tips library"
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.lead, {color: colors.secondaryText}]}>
            Short offline cards for the tip tags you see after written answers.
          </Text>
          {TIP_CARDS.map((card, index) => (
            <FadeIn key={card.id} delay={Math.min(index * 40, 200)}>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}
                accessibilityRole="summary"
                accessibilityLabel={`${card.title}. ${card.summary}`}>
                <Text style={[styles.title, {color: colors.primaryText}]}>
                  {card.title}
                </Text>
                <Text style={[styles.summary, {color: colors.secondaryText}]}>
                  {card.summary}
                </Text>
                {card.examples.map(example => (
                  <Text
                    key={example}
                    style={[styles.example, {color: colors.primaryText}]}>
                    • {example}
                  </Text>
                ))}
                <Text style={[styles.practice, {color: colors.primaryAccent}]}>
                  Try: {card.practiceHint}
                </Text>
              </View>
            </FadeIn>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

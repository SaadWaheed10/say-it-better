import React, {useCallback, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {EmptyState} from '../../components/EmptyState';
import {FadeIn} from '../../components/FadeIn';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useAppTheme} from '../../hooks/useAppTheme';
import {hapticLight, hapticSuccess} from '../../services/hapticService';
import {
  getDueReviews,
  markReviewResult,
  SpacedReviewItem,
} from '../../services/spacedReviewService';
import {RootStackParamList} from '../../types';
import {useReviewScreenStyles} from './ReviewScreen.styles';

export function ReviewScreen() {
  const {colors} = useAppTheme();
  const styles = useReviewScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<SpacedReviewItem[]>([]);
  const [index, setIndex] = useState(0);

  const reload = useCallback(() => {
    getDueReviews().then(list => {
      setItems(list);
      setIndex(0);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const current = items[index];

  const onGrade = async (remembered: boolean) => {
    if (!current) {
      return;
    }
    await markReviewResult(current.id, remembered);
    if (remembered) {
      hapticSuccess();
    } else {
      hapticLight();
    }
    if (index + 1 >= items.length) {
      reload();
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <View style={styles.body}>
        <ScreenHeader
          title="Spaced review"
          onBack={() => navigation.navigate('MainTabs', {screen: 'Tests'})}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.lead, {color: colors.secondaryText}]}>
            Revisit mistakes, library lines, and favorites on a spaced schedule.
          </Text>

          {!current ? (
            <EmptyState
              title="You’re caught up"
              description="No reviews due right now. Miss a few test items or save phrases to build your queue."
              actionLabel="Back to tests"
              onAction={() =>
                navigation.navigate('MainTabs', {screen: 'Tests'})
              }
            />
          ) : (
            <FadeIn>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}
                accessibilityLabel={`Review ${index + 1} of ${items.length}`}>
                <Text style={[styles.kind, {color: colors.primaryAccent}]}>
                  {current.kind} · {index + 1}/{items.length}
                </Text>
                <Text style={[styles.prompt, {color: colors.primaryText}]}>
                  {current.prompt}
                </Text>
                {current.hint ? (
                  <Text style={[styles.hint, {color: colors.secondaryText}]}>
                    Hint: {current.hint}
                  </Text>
                ) : null}
                <View style={styles.actions}>
                  <AppButton
                    label="Still tricky"
                    variant="secondary"
                    onPress={() => onGrade(false)}
                    style={styles.actionBtn}
                    accessibilityLabel="Mark as still tricky"
                  />
                  <AppButton
                    label="Got it"
                    onPress={() => onGrade(true)}
                    style={styles.actionBtn}
                    accessibilityLabel="Mark as remembered"
                  />
                </View>
              </View>
            </FadeIn>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

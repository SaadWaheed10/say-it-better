import React, {useCallback, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FadeIn} from '../../components/FadeIn';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useAppTheme} from '../../hooks/useAppTheme';
import {getProgressSnapshot} from '../../services/testService';
import {RootStackParamList, TestBadge} from '../../types';
import {useTestBadgesScreenStyles} from './TestBadgesScreen.styles';

export function TestBadgesScreen() {
  const {colors} = useAppTheme();
  const styles = useTestBadgesScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [badges, setBadges] = useState<TestBadge[]>([]);

  useFocusEffect(
    useCallback(() => {
      getProgressSnapshot().then(snap => setBadges(snap.allBadges));
    }, []),
  );

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="focus" />
      <View style={styles.body}>
        <ScreenHeader
          title="Badges"
          onBack={() => navigation.navigate('MainTabs', {screen: 'Tests'})}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.lead, {color: colors.secondaryText}]}>
            Unlock badges by practicing consistently and hitting score goals.
          </Text>
          {badges.map((badge, index) => {
            const unlocked = Boolean(badge.unlockedAt);
            return (
              <FadeIn key={badge.id} delay={Math.min(index * 40, 200)}>
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: unlocked
                        ? colors.accentWash
                        : colors.surfaceSolid,
                      borderColor: unlocked
                        ? `${colors.primaryAccent}55`
                        : colors.borderSoft,
                      opacity: unlocked ? 1 : 0.55,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.title,
                      {
                        color: unlocked
                          ? colors.primaryAccent
                          : colors.secondaryText,
                      },
                    ]}>
                    {badge.title}
                    {unlocked ? '' : ' · locked'}
                  </Text>
                  <Text
                    style={[styles.desc, {color: colors.secondaryText}]}>
                    {badge.description}
                  </Text>
                  {unlocked && badge.unlockedAt ? (
                    <Text
                      style={[styles.meta, {color: colors.tabInactive}]}>
                      Unlocked{' '}
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
              </FadeIn>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

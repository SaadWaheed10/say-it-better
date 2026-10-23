import React from 'react';
import {Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path} from 'react-native-svg';
import {useAppTheme} from '../../hooks/useAppTheme';
import {ri} from '../../theme/useScaledStyles';
import {useOnboardingAuthIllustrationStyles} from './OnboardingAuthIllustration.styles';

export function OnboardingAuthIllustration() {
  const {colors} = useAppTheme();
  const styles = useOnboardingAuthIllustrationStyles();

  return (
    <View
      style={styles.wrap}
      accessibilityLabel="Progress sync illustration">
      <LinearGradient
        colors={[
          `${colors.primaryAccent}22`,
          `${colors.accentWarm}18`,
          `${colors.accentRose}14`,
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.stage}>
        <View
          style={[
            styles.cloud,
            {
              backgroundColor: colors.surfaceSolid,
              borderColor: `${colors.primaryAccent}55`,
            },
          ]}>
          <Svg width={ri(22)} height={ri(22)} viewBox="0 0 24 24">
            <Path
              d="M7 18 h10 a4 4 0 0 0 .3-8 5 5 0 0 0-9.7-1.2 A3.5 3.5 0 0 0 7 18 Z"
              fill="none"
              stroke={colors.primaryAccent}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <View
          style={[
            styles.device,
            {
              backgroundColor: colors.surfaceSolid,
              borderColor: colors.borderSoft,
            },
          ]}>
          <View
            style={[styles.deviceBar, {backgroundColor: colors.borderSoft}]}
          />
          <View style={styles.scoreRow}>
            <View
              style={[
                styles.scorePill,
                {backgroundColor: `${colors.primaryAccent}18`},
              ]}>
              <Text
                style={[styles.scoreValue, {color: colors.primaryAccent}]}>
                7
              </Text>
              <Text
                style={[styles.scoreLabel, {color: colors.secondaryText}]}>
                Streak
              </Text>
            </View>
            <View
              style={[
                styles.scorePill,
                {backgroundColor: `${colors.accentWarm}18`},
              ]}>
              <Text style={[styles.scoreValue, {color: colors.accentWarm}]}>
                12
              </Text>
              <Text
                style={[styles.scoreLabel, {color: colors.secondaryText}]}>
                Tests
              </Text>
            </View>
            <View
              style={[
                styles.scorePill,
                {backgroundColor: `${colors.accentRose}18`},
              ]}>
              <Text style={[styles.scoreValue, {color: colors.accentRose}]}>
                3
              </Text>
              <Text
                style={[styles.scoreLabel, {color: colors.secondaryText}]}>
                Reviews
              </Text>
            </View>
          </View>
          <View style={styles.syncRow}>
            <View
              style={[styles.syncDot, {backgroundColor: colors.primaryAccent}]}
            />
            <Text style={[styles.syncText, {color: colors.primaryText}]}>
              Progress ready to sync — messages stay local
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

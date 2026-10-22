import React from 'react';
import {Pressable, Text, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useAppTheme} from '../../hooks/useAppTheme';
import {ri} from '../../theme/useScaledStyles';
import {usePhraseComparePanelStyles} from './PhraseComparePanel.styles';

type Props = {
  original: string;
  corrected: string;
  toneLabel?: string;
  onCopyOriginal: () => void;
  onCopyCorrected: () => void;
};

function ArrowDown({color}: {color: string}) {
  return (
    <Svg width={ri(22)} height={ri(22)} viewBox="0 0 24 24">
      <Path
        d="M12 5 v12 M7 12 l5 5 5-5"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PhraseComparePanel({
  original,
  corrected,
  toneLabel,
  onCopyOriginal,
  onCopyCorrected,
}: Props) {
  const {colors} = useAppTheme();
  const styles = usePhraseComparePanelStyles();
  const unchanged =
    original.trim().toLowerCase() === corrected.trim().toLowerCase();

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.panel,
          styles.draftPanel,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.borderSoft,
          },
        ]}>
        <View style={styles.panelHeader}>
          <View
            style={[styles.stepBadge, {backgroundColor: colors.navyWash}]}>
            <Text style={[styles.stepBadgeText, {color: colors.primaryNavy}]}>
              1
            </Text>
          </View>
          <View style={styles.panelHeaderText}>
            <Text style={[styles.eyebrow, {color: colors.secondaryText}]}>
              YOU WROTE
            </Text>
            <Text style={[styles.panelTitle, {color: colors.primaryText}]}>
              Your draft
            </Text>
          </View>
        </View>
        <Text
          selectable
          style={[styles.draftBody, {color: colors.secondaryText}]}>
          {original}
        </Text>
        <Pressable
          onPress={onCopyOriginal}
          accessibilityRole="button"
          accessibilityLabel="Copy your draft"
          style={[styles.ghostCopy, {borderColor: colors.border}]}>
          <Text style={[styles.ghostCopyLabel, {color: colors.primaryText}]}>
            Copy draft
          </Text>
        </Pressable>
      </View>

      <View style={styles.connector}>
        <View
          style={[
            styles.connectorBadge,
            {backgroundColor: colors.lavenderSoft, borderColor: colors.border},
          ]}>
          <ArrowDown color={colors.primaryAccent} />
        </View>
        <Text style={[styles.connectorLabel, {color: colors.primaryAccent}]}>
          {unchanged ? 'Already clear — no changes needed' : 'Corrected to'}
        </Text>
      </View>

      <View
        style={[
          styles.panel,
          styles.resultPanel,
          {
            backgroundColor: colors.surfaceSolid,
            borderColor: colors.primaryAccent,
          },
        ]}>
        <View style={styles.panelHeader}>
          <View
            style={[
              styles.stepBadge,
              {backgroundColor: colors.primaryAccent},
            ]}>
            <Text style={[styles.stepBadgeText, {color: colors.white}]}>2</Text>
          </View>
          <View style={styles.panelHeaderText}>
            <Text style={[styles.eyebrow, {color: colors.primaryAccent}]}>
              SAY IT BETTER
            </Text>
            <Text style={[styles.panelTitle, {color: colors.primaryText}]}>
              Corrected version
            </Text>
          </View>
          {toneLabel ? (
            <View
              style={[
                styles.toneChip,
                {backgroundColor: colors.accentWash},
              ]}>
              <Text style={[styles.toneChipText, {color: colors.primaryAccent}]}>
                {toneLabel}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          selectable
          style={[styles.resultBody, {color: colors.primaryText}]}>
          {corrected}
        </Text>
        <Pressable
          onPress={onCopyCorrected}
          accessibilityRole="button"
          accessibilityLabel="Copy corrected phrase"
          style={[styles.primaryCopy, {backgroundColor: colors.primaryNavy}]}>
          <Text style={[styles.primaryCopyLabel, {color: colors.white}]}>
            Copy corrected phrase
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

import React, {useMemo} from 'react';
import {Pressable, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path} from 'react-native-svg';
import {useAppTheme} from '../../hooks/useAppTheme';
import {darkGradientHero, lightGradientHero} from '../../theme/colors';
import {ri} from '../../theme/useScaledStyles';
import {diffPhrases} from '../../utils/textDiff';
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
  const {colors, isDark} = useAppTheme();
  const styles = usePhraseComparePanelStyles();
  const hero = isDark ? [...darkGradientHero] : [...lightGradientHero];
  const unchanged =
    original.trim().toLowerCase() === corrected.trim().toLowerCase();

  const segments = useMemo(
    () => (unchanged ? [] : diffPhrases(original, corrected)),
    [original, corrected, unchanged],
  );

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
        {unchanged || segments.length === 0 ? (
          <Text
            selectable
            style={[styles.draftBody, {color: colors.secondaryText}]}>
            {original}
          </Text>
        ) : (
          <Text selectable style={styles.draftBody}>
            {segments
              .filter(seg => seg.kind !== 'added')
              .map((seg, i) => (
                <Text
                  key={`o-${i}`}
                  style={{
                    color:
                      seg.kind === 'removed'
                        ? colors.accentRose
                        : colors.secondaryText,
                    textDecorationLine:
                      seg.kind === 'removed' ? 'line-through' : 'none',
                    backgroundColor:
                      seg.kind === 'removed'
                        ? `${colors.accentRose}22`
                        : 'transparent',
                  }}>
                  {seg.text}
                </Text>
              ))}
          </Text>
        )}
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
            <Text style={[styles.stepBadgeText, {color: colors.canvas}]}>2</Text>
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
        {unchanged || segments.length === 0 ? (
          <Text
            selectable
            style={[styles.resultBody, {color: colors.primaryText}]}>
            {corrected}
          </Text>
        ) : (
          <Text selectable style={styles.resultBody}>
            {segments
              .filter(seg => seg.kind !== 'removed')
              .map((seg, i) => (
                <Text
                  key={`c-${i}`}
                  style={{
                    color: colors.primaryText,
                    fontWeight: seg.kind === 'added' ? '700' : '500',
                    backgroundColor:
                      seg.kind === 'added'
                        ? `${colors.primaryAccent}28`
                        : 'transparent',
                  }}>
                  {seg.text}
                </Text>
              ))}
          </Text>
        )}
        <Pressable
          onPress={onCopyCorrected}
          accessibilityRole="button"
          accessibilityLabel="Copy corrected phrase"
          style={styles.primaryCopy}>
          <LinearGradient
            colors={[hero[0], hero[1], hero[2] ?? hero[1]]}
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}
            style={styles.primaryCopyGradient}>
            <Text style={[styles.primaryCopyLabel, {color: colors.canvas}]}>
              Copy corrected phrase
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

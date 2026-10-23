import React, {useCallback, useMemo, useState} from 'react';
import {Alert, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {AppButton} from '../../components/AppButton';
import {EmptyState} from '../../components/EmptyState';
import {FadeIn} from '../../components/FadeIn';
import {PressScale} from '../../components/PressScale';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {TONES} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {hapticLight, hapticSelection} from '../../services/hapticService';
import {
  clearHistory,
  deleteHistoryItem,
  filterHistory,
  getHistory,
  toggleHistoryFavorite,
} from '../../services/historyService';
import {HistoryItem, RootStackParamList, ToneId} from '../../types';
import {ri} from '../../theme/useScaledStyles';
import {useHistoryScreenStyles} from './HistoryScreen.styles';

type Scope = 'all' | 'favorites';
type ToneFilter = ToneId | 'all';

function formatDate(value: number): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '';
  }
}

function StarIcon({filled, color}: {filled: boolean; color: string}) {
  return (
    <Svg width={ri(20)} height={ri(20)} viewBox="0 0 24 24">
      <Path
        d="M12 3.5 l2.6 5.4 6 .9-4.3 4.2 1 5.9L12 16.8 6.7 19.9 l1-5.9L3.4 9.8 l6-.9 Z"
        stroke={color}
        strokeWidth={1.6}
        fill={filled ? color : 'none'}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HistoryScreen() {
  const {colors} = useAppTheme();
  const styles = useHistoryScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [toneFilter, setToneFilter] = useState<ToneFilter>('all');

  const refresh = useCallback(async () => {
    setItems(await getHistory());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const visible = useMemo(
    () =>
      filterHistory(items, {
        query,
        tone: toneFilter,
        favoritesOnly: scope === 'favorites',
      }),
    [items, query, toneFilter, scope],
  );

  const onClearAll = () => {
    Alert.alert(
      'Clear history?',
      'This permanently removes all locally stored rewrites.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setItems([]);
          },
        },
      ],
    );
  };

  const onDelete = (id: string) => {
    Alert.alert('Delete item?', 'Remove this rewrite from history.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setItems(await deleteHistoryItem(id));
          hapticLight();
        },
      },
    ]);
  };

  const filterChips: {id: Scope | ToneFilter; label: string}[] = [
    {id: 'all', label: 'All'},
    {id: 'favorites', label: 'Favorites'},
    ...TONES.map(t => ({id: t.id as ToneFilter, label: t.label})),
  ];

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top']}>
      <ScreenBackdrop variant="app" />
      <View style={styles.body}>
        <FadeIn>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, {color: colors.primaryText}]}>
                History
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
            </View>
            {items.length > 0 ? (
              <AppButton
                label="Clear all"
                variant="ghost"
                onPress={onClearAll}
                style={styles.clearBtn}
              />
            ) : null}
          </View>
          <Text style={[styles.caption, {color: colors.secondaryText}]}>
            Message history stays on this device only.
          </Text>

          {items.length > 0 ? (
            <>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search drafts or corrections…"
                placeholderTextColor={colors.secondaryText}
                style={[
                  styles.search,
                  {
                    color: colors.primaryText,
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.borderSoft,
                  },
                ]}
                accessibilityLabel="Search history"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}>
                {filterChips.map(chip => {
                  const isScope = chip.id === 'all' || chip.id === 'favorites';
                  const active = isScope
                    ? scope === chip.id &&
                      (chip.id === 'favorites' || toneFilter === 'all')
                    : toneFilter === chip.id && scope === 'all';

                  return (
                    <Pressable
                      key={String(chip.id)}
                      onPress={() => {
                        hapticSelection();
                        if (chip.id === 'all') {
                          setScope('all');
                          setToneFilter('all');
                        } else if (chip.id === 'favorites') {
                          setScope('favorites');
                          setToneFilter('all');
                        } else {
                          setScope('all');
                          setToneFilter(chip.id as ToneId);
                        }
                      }}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active
                            ? colors.tabActiveBg
                            : colors.surfaceSolid,
                          borderColor: active
                            ? `${colors.primaryAccent}66`
                            : colors.borderSoft,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color: active
                              ? colors.primaryAccent
                              : colors.secondaryText,
                          },
                        ]}>
                        {chip.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          ) : null}
        </FadeIn>

        {items.length === 0 ? (
          <FadeIn delay={80}>
            <EmptyState
              title="No rewrites yet"
              description="Improved messages will appear here after you correct a phrase."
              actionLabel="Start improving"
              onAction={() => navigation.navigate('ImproveMessage')}
            />
          </FadeIn>
        ) : visible.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try another search or clear the tone / favorites filter."
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {visible.map((item, index) => {
              const toneLabel =
                TONES.find(tone => tone.id === item.tone)?.label ?? item.tone;
              return (
                <FadeIn key={item.id} delay={Math.min(index * 40, 200)}>
                  <PressScale
                    onPress={() =>
                      navigation.navigate('Results', {
                        original: item.original,
                        improved: item.improved,
                        alternatives: item.alternatives,
                        tone: item.tone,
                        historyId: item.id,
                      })
                    }
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.surfaceSolid,
                        borderColor: colors.borderSoft,
                      },
                    ]}>
                    <LinearGradient
                      colors={[
                        colors.primaryAccent,
                        colors.accentWarm,
                        colors.accentRose,
                      ]}
                      start={{x: 0, y: 0}}
                      end={{x: 0, y: 1}}
                      style={styles.cardStripe}
                    />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <Text
                          style={[styles.meta, {color: colors.secondaryText}]}>
                          {toneLabel} · {formatDate(item.createdAt)}
                        </Text>
                        <Pressable
                          onPress={async () => {
                            setItems(await toggleHistoryFavorite(item.id));
                            hapticSelection();
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={
                            item.isFavorite
                              ? 'Remove from favorites'
                              : 'Add to favorites'
                          }
                          hitSlop={8}
                          style={styles.starHit}>
                          <StarIcon
                            filled={Boolean(item.isFavorite)}
                            color={
                              item.isFavorite
                                ? colors.accentWarm
                                : colors.tabInactive
                            }
                          />
                        </Pressable>
                      </View>
                      <Text
                        numberOfLines={2}
                        style={[styles.preview, {color: colors.primaryText}]}>
                        {item.improved}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.original,
                          {color: colors.secondaryText},
                        ]}>
                        Original: {item.original}
                      </Text>
                      <Pressable
                        onPress={() => onDelete(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel="Delete history item"
                        style={styles.deleteHit}>
                        <Text
                          style={[styles.deleteText, {color: colors.error}]}>
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  </PressScale>
                </FadeIn>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

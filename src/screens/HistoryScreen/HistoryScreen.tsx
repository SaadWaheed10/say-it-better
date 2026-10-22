import React, {useCallback, useState} from 'react';
import {Alert, Pressable, ScrollView, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {EmptyState} from '../../components/EmptyState';
import {FadeIn} from '../../components/FadeIn';
import {PressScale} from '../../components/PressScale';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {TONES} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {
  clearHistory,
  deleteHistoryItem,
  getHistory,
} from '../../services/historyService';
import {HistoryItem, RootStackParamList} from '../../types';
import {useHistoryScreenStyles} from './HistoryScreen.styles';

function formatDate(value: number): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '';
  }
}

export function HistoryScreen() {
  const {colors} = useAppTheme();
  const styles = useHistoryScreenStyles();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<HistoryItem[]>([]);

  const refresh = useCallback(async () => {
    setItems(await getHistory());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
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
        },
      },
    ]);
  };

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
        </FadeIn>

        {items.length === 0 ? (
          <FadeIn delay={80}>
            <EmptyState
              title="No rewrites yet"
              description="Improved messages will appear here after you use Improve with AI."
            />
          </FadeIn>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {items.map((item, index) => {
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
                      <Text
                        style={[styles.meta, {color: colors.secondaryText}]}>
                        {toneLabel} · {formatDate(item.createdAt)}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.preview,
                          {color: colors.primaryText},
                        ]}>
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

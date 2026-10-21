import React, {useCallback, useState} from 'react';
import {Alert, Pressable, ScrollView, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton} from '../../components/AppButton';
import {EmptyState} from '../../components/EmptyState';
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
  const {colors, typography, spacing, radii} = useAppTheme();
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
      style={[styles.safe, {backgroundColor: colors.background}]}
      edges={['top']}>
      <View style={{paddingHorizontal: spacing.lg, flex: 1}}>
        <View style={styles.headerRow}>
          <Text style={[typography.h2, {color: colors.primaryText}]}>
            History
          </Text>
          {items.length > 0 ? (
            <AppButton
              label="Clear all"
              variant="ghost"
              onPress={onClearAll}
              style={{minHeight: 40, paddingHorizontal: 8}}
            />
          ) : null}
        </View>
        <Text
          style={[
            typography.caption,
            {color: colors.secondaryText, marginBottom: spacing.md},
          ]}>
          Message history stays on this device only.
        </Text>

        {items.length === 0 ? (
          <EmptyState
            title="No rewrites yet"
            description="Improved messages will appear here after you use Improve with AI."
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {items.map(item => {
              const toneLabel =
                TONES.find(tone => tone.id === item.tone)?.label ?? item.tone;
              return (
                <Pressable
                  key={item.id}
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
                      backgroundColor: colors.secondaryBackground,
                      borderRadius: radii.lg,
                      borderColor: colors.border,
                      padding: spacing.md,
                      marginBottom: spacing.sm,
                    },
                  ]}>
                  <Text
                    style={[typography.caption, {color: colors.secondaryText}]}>
                    {toneLabel} · {formatDate(item.createdAt)}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[
                      typography.bodyMedium,
                      {color: colors.primaryText, marginTop: 6},
                    ]}>
                    {item.improved}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.caption,
                      {color: colors.secondaryText, marginTop: 6},
                    ]}>
                    Original: {item.original}
                  </Text>
                  <Pressable
                    onPress={() => onDelete(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Delete history item"
                    style={{marginTop: 10, alignSelf: 'flex-start'}}>
                    <Text style={[typography.caption, {color: colors.error}]}>
                      Delete
                    </Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

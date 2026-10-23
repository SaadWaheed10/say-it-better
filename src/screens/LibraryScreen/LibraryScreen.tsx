import React, {useCallback, useState} from 'react';
import {Alert, Pressable, ScrollView, Share, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {EmptyState} from '../../components/EmptyState';
import {FadeIn} from '../../components/FadeIn';
import {ScreenBackdrop} from '../../components/ScreenBackdrop';
import {ScreenHeader} from '../../components/ScreenHeader';
import {TONES} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {hapticLight, hapticSuccess} from '../../services/hapticService';
import {
  clearLibrary,
  deleteLibraryItem,
  getLibrary,
} from '../../services/libraryService';
import {LibraryItem, RootStackParamList} from '../../types';
import {useLibraryScreenStyles} from './LibraryScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

export function LibraryScreen({navigation}: Props) {
  const {colors} = useAppTheme();
  const styles = useLibraryScreenStyles();
  const [items, setItems] = useState<LibraryItem[]>([]);

  const refresh = useCallback(async () => {
    setItems(await getLibrary());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onClear = () => {
    Alert.alert('Clear library?', 'Remove all saved phrases from this device.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearLibrary();
          setItems([]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: colors.canvas}]}
      edges={['top', 'bottom']}>
      <ScreenBackdrop variant="app" />
      <View style={styles.body}>
        <ScreenHeader
          title="Phrase library"
          onBack={() => navigation.goBack()}
          right={
            items.length > 0 ? (
              <Pressable onPress={onClear} hitSlop={8}>
                <Text style={[styles.actionText, {color: colors.error}]}>
                  Clear
                </Text>
              </Pressable>
            ) : null
          }
        />
        <Text style={[styles.caption, {color: colors.secondaryText}]}>
          Saved corrected lines you can reuse anytime. Stored only on this
          device.
        </Text>

        {items.length === 0 ? (
          <EmptyState
            title="No saved phrases yet"
            description="From Results, tap Save to library to keep a corrected line here."
            actionLabel="Correct a phrase"
            onAction={() => navigation.navigate('ImproveMessage')}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {items.map((item, index) => {
              const toneLabel = item.tone
                ? TONES.find(t => t.id === item.tone)?.label
                : undefined;
              return (
                <FadeIn key={item.id} delay={Math.min(index * 40, 160)}>
                  <View
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.surfaceSolid,
                        borderColor: colors.borderSoft,
                      },
                    ]}>
                    <Text
                      selectable
                      style={[styles.phrase, {color: colors.primaryText}]}>
                      {item.text}
                    </Text>
                    {toneLabel ? (
                      <Text style={[styles.meta, {color: colors.secondaryText}]}>
                        {toneLabel}
                      </Text>
                    ) : null}
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() => {
                          Clipboard.setString(item.text);
                          hapticSuccess();
                        }}
                        hitSlop={6}>
                        <Text
                          style={[
                            styles.actionText,
                            {color: colors.primaryAccent},
                          ]}>
                          Copy
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={async () => {
                          try {
                            await Share.share({message: item.text});
                            hapticLight();
                          } catch {
                            // user cancelled
                          }
                        }}
                        hitSlop={6}>
                        <Text
                          style={[
                            styles.actionText,
                            {color: colors.primaryAccent},
                          ]}>
                          Share
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          navigation.navigate('ImproveMessage', {
                            message: item.original ?? item.text,
                            tone: item.tone,
                          })
                        }
                        hitSlop={6}>
                        <Text
                          style={[
                            styles.actionText,
                            {color: colors.secondaryText},
                          ]}>
                          Reuse
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={async () => {
                          setItems(await deleteLibraryItem(item.id));
                          hapticLight();
                        }}
                        hitSlop={6}>
                        <Text style={[styles.actionText, {color: colors.error}]}>
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </FadeIn>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

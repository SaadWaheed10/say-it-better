import React from 'react';
import {ActivityIndicator, Pressable, Text, TextInput, View} from 'react-native';
import Svg, {Path, Rect} from 'react-native-svg';
import {MAX_MESSAGE_LENGTH} from '../../constants/tones';
import {useAppTheme} from '../../hooks/useAppTheme';
import {VoiceStatus} from '../../services/voiceService';
import {ri} from '../../theme/useScaledStyles';
import {useMessageInputStyles} from './MessageInput.styles';

type VoiceControls = {
  status: VoiceStatus;
  statusMessage?: string;
  isRecording: boolean;
  isTranscribing: boolean;
  isLoadingModel: boolean;
  disabled?: boolean;
  onMicPress: () => void;
  onStopPress: () => void;
  onCancelPress: () => void;
};

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  onClear?: () => void;
  voice?: VoiceControls;
};

function MicIcon({color, size}: {color: string; size: number}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M12 3 a3 3 0 0 1 3 3 v6 a3 3 0 0 1-6 0 V6 a3 3 0 0 1 3-3 z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.5 11 a6.5 6.5 0 0 0 13 0 M12 17.5 V21"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StopIcon({color, size}: {color: string; size: number}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Rect x="7" y="7" width="10" height="10" rx="1.5" fill={color} />
    </Svg>
  );
}

export function MessageInput({
  value,
  onChangeText,
  placeholder = 'Type or speak your draft — even if the English is rough…',
  maxLength = MAX_MESSAGE_LENGTH,
  onClear,
  voice,
}: Props) {
  const {colors} = useAppTheme();
  const styles = useMessageInputStyles();
  const iconSize = ri(20);
  const recordingActive = Boolean(voice?.isRecording);
  const processing =
    Boolean(voice?.isTranscribing) || Boolean(voice?.isLoadingModel);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surfaceSolid,
          borderColor: recordingActive ? colors.primaryAccent : colors.borderSoft,
        },
      ]}>
      <TextInput
        value={value}
        onChangeText={text => onChangeText(text.slice(0, maxLength))}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        multiline
        editable
        textAlignVertical="top"
        style={[styles.input, {color: colors.primaryText}]}
        accessibilityLabel="Message input"
      />

      {voice?.statusMessage ? (
        <Text
          style={[
            styles.voiceStatus,
            {
              color: recordingActive
                ? colors.primaryAccent
                : voice.status === 'error' || voice.status === 'permission_denied'
                  ? colors.error
                  : colors.secondaryText,
            },
          ]}
          accessibilityLiveRegion="polite">
          {voice.statusMessage}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {value.length > 0 && onClear ? (
            <Pressable
              onPress={onClear}
              accessibilityRole="button"
              accessibilityLabel="Clear message"
              hitSlop={8}>
              <Text
                style={[styles.footerAction, {color: colors.primaryAccent}]}>
                Clear
              </Text>
            </Pressable>
          ) : (
            <View />
          )}

          {voice ? (
            <View style={styles.voiceActions}>
              {recordingActive ? (
                <>
                  <Pressable
                    onPress={voice.onStopPress}
                    disabled={voice.disabled}
                    accessibilityRole="button"
                    accessibilityLabel="Stop recording"
                    style={[
                      styles.voiceButton,
                      {backgroundColor: colors.primaryAccent},
                    ]}
                    hitSlop={6}>
                    <StopIcon color={colors.white} size={iconSize} />
                    <Text style={[styles.voiceButtonLabel, {color: colors.white}]}>
                      Stop
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={voice.onCancelPress}
                    disabled={voice.disabled}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel recording"
                    style={[
                      styles.voiceButton,
                      {
                        backgroundColor: colors.lavenderSoft,
                        borderColor: colors.border,
                        borderWidth: 1,
                      },
                    ]}
                    hitSlop={6}>
                    <Text
                      style={[
                        styles.voiceButtonLabel,
                        {color: colors.primaryText},
                      ]}>
                      Cancel
                    </Text>
                  </Pressable>
                </>
              ) : processing ? (
                <View style={styles.processingRow}>
                  <ActivityIndicator color={colors.primaryAccent} size="small" />
                  <Text
                    style={[
                      styles.footerAction,
                      {color: colors.secondaryText},
                    ]}>
                    {voice.isLoadingModel ? 'Loading model…' : 'Transcribing…'}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={voice.onMicPress}
                  disabled={voice.disabled}
                  accessibilityRole="button"
                  accessibilityLabel="Dictate with microphone"
                  style={[
                    styles.micButton,
                    {
                      backgroundColor: colors.lavenderSoft,
                      borderColor: colors.border,
                    },
                  ]}
                  hitSlop={6}>
                  <MicIcon color={colors.primaryAccent} size={iconSize} />
                </Pressable>
              )}
            </View>
          ) : null}
        </View>

        <Text style={[styles.counter, {color: colors.secondaryText}]}>
          {value.length}/{maxLength}
        </Text>
      </View>
    </View>
  );
}

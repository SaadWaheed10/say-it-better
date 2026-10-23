import {useCallback, useEffect, useState} from 'react';
import {
  cancelRecording,
  getVoiceState,
  startRecording,
  stopRecording,
  subscribeVoiceState,
  VoiceState,
  VoiceStatus,
} from '../services/voiceService';

type Options = {
  onTranscript: (text: string) => void;
  onError?: (message: string) => void;
};

export function useVoiceInput({onTranscript, onError}: Options) {
  const [voice, setVoice] = useState<VoiceState>(getVoiceState);
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeVoiceState(setVoice), []);

  const isRecording = voice.status === 'recording';
  const isTranscribing = voice.status === 'transcribing';
  const isLoadingModel = voice.status === 'loading_model';
  const isRequestingPermission = voice.status === 'requesting_permission';

  const begin = useCallback(async () => {
    if (busy || isRecording || isTranscribing) {
      return;
    }
    setBusy(true);
    try {
      await startRecording();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not start recording.';
      onError?.(message);
    } finally {
      setBusy(false);
    }
  }, [busy, isRecording, isTranscribing, onError]);

  const stop = useCallback(async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const text = await stopRecording();
      if (text) {
        onTranscript(text);
      } else {
        onError?.(
          'No speech detected. Try again, or type / tap your answer.',
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Transcription failed.';
      onError?.(message);
    } finally {
      setBusy(false);
    }
  }, [busy, onError, onTranscript]);

  const cancel = useCallback(async () => {
    setBusy(true);
    try {
      await cancelRecording();
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    voice,
    status: voice.status as VoiceStatus,
    isRecording,
    isTranscribing,
    isLoadingModel,
    isRequestingPermission,
    busy,
    begin,
    stop,
    cancel,
  };
}

import {PermissionsAndroid, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import LiveAudioStream from '@fugood/react-native-audio-pcm-stream';
import {initWhisper, WhisperContext} from 'whisper.rn';
import {
  base64ToUint8Array,
  WavFileWriter,
  type WavFileWriterFs,
} from '../utils/wavFileWriter';
import {
  ensureBundledWhisperModelAvailable,
  toFileUri,
  whisperModelFileExists,
  WHISPER_MODEL_FILENAME,
} from './whisperModelPath';

export type VoiceStatus =
  | 'idle'
  | 'requesting_permission'
  | 'permission_denied'
  | 'loading_model'
  | 'recording'
  | 'transcribing'
  | 'error';

export type VoiceState = {
  status: VoiceStatus;
  message: string;
  detail?: string;
};

type Listener = (state: VoiceState) => void;

const SAMPLE_RATE = 16000;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

let whisperContext: WhisperContext | null = null;
let initPromise: Promise<WhisperContext> | null = null;
let recording = false;
let cancelled = false;
let wavWriter: WavFileWriter | null = null;
let recordingPath: string | null = null;
let stopTranscribe: (() => Promise<void>) | null = null;

let voiceState: VoiceState = {
  status: 'idle',
  message: 'Voice input is ready.',
};

const listeners = new Set<Listener>();

function emit(next: VoiceState) {
  voiceState = next;
  listeners.forEach(listener => listener(voiceState));
}

export function subscribeVoiceState(listener: Listener): () => void {
  listeners.add(listener);
  listener(voiceState);
  return () => {
    listeners.delete(listener);
  };
}

export function getVoiceState(): VoiceState {
  return voiceState;
}

function rnfsAdapter(): WavFileWriterFs {
  return {
    writeFile: (filePath, data, encoding) =>
      RNFS.writeFile(filePath, data, encoding as 'base64'),
    appendFile: (filePath, data, encoding) =>
      RNFS.appendFile(filePath, data, encoding as 'base64'),
    readFile: (filePath, encoding) =>
      RNFS.readFile(filePath, encoding as 'base64'),
    exists: filePath => RNFS.exists(filePath),
    unlink: filePath => RNFS.unlink(filePath),
  };
}

async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    // iOS prompts via NSMicrophoneUsageDescription when audio starts.
    return true;
  }

  emit({
    status: 'requesting_permission',
    message: 'Requesting microphone access…',
  });

  const existing = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );
  if (existing) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone permission',
      message:
        'SayItBetter needs the microphone to dictate messages and speak answers in skill tests. Audio stays on your phone.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function ensureWhisperContext(): Promise<WhisperContext> {
  if (whisperContext) {
    return whisperContext;
  }
  if (initPromise) {
    return initPromise;
  }

  const pending = (async () => {
    emit({
      status: 'loading_model',
      message: 'Loading speech model…',
    });

    const path = await ensureBundledWhisperModelAvailable();
    if (!path || !(await whisperModelFileExists(path))) {
      throw new Error(
        `Speech model missing (${WHISPER_MODEL_FILENAME}). Run once: npm run bundle-model`,
      );
    }

    const context = await initWhisper({
      filePath: toFileUri(path),
      useGpu: Platform.OS === 'ios',
    });
    whisperContext = context;
    return context;
  })();

  initPromise = pending;
  try {
    return await pending;
  } catch (error) {
    initPromise = null;
    throw error;
  } finally {
    if (whisperContext) {
      initPromise = null;
    }
  }
}

async function cleanupRecordingFiles(): Promise<void> {
  if (recordingPath && (await RNFS.exists(recordingPath))) {
    try {
      await RNFS.unlink(recordingPath);
    } catch {
      // ignore
    }
  }
  recordingPath = null;
  wavWriter = null;
}

function detachAudioListener() {
  try {
    LiveAudioStream.on('data', () => undefined);
  } catch {
    // ignore
  }
}

/**
 * Start microphone capture. Call stopRecording() to transcribe,
 * or cancelRecording() to discard audio.
 */
export async function startRecording(): Promise<void> {
  if (recording) {
    return;
  }

  cancelled = false;

  const allowed = await requestMicrophonePermission();
  if (!allowed) {
    emit({
      status: 'permission_denied',
      message: 'Microphone permission denied.',
      detail: 'Enable microphone access in system settings to use voice input.',
    });
    throw new Error('Microphone permission denied.');
  }

  // Warm the model while preparing the recorder so stop feels faster.
  void ensureWhisperContext().catch(() => {
    // Surface on stop if still failing.
  });

  const path = `${RNFS.CachesDirectoryPath.replace(
    /\/$/,
    '',
  )}/sayitbetter-voice-${Date.now()}.wav`;
  recordingPath = path;

  const writer = new WavFileWriter(rnfsAdapter(), path, {
    sampleRate: SAMPLE_RATE,
    channels: CHANNELS,
    bitsPerSample: BITS_PER_SAMPLE,
  });
  await writer.initialize();
  wavWriter = writer;

  LiveAudioStream.init({
    sampleRate: SAMPLE_RATE,
    channels: CHANNELS,
    bitsPerSample: BITS_PER_SAMPLE,
    audioSource: 6,
    bufferSize: 16 * 1024,
    wavFile: '',
  });

  LiveAudioStream.on('data', (data: string) => {
    if (!wavWriter || cancelled) {
      return;
    }
    void writer.appendAudioData(base64ToUint8Array(data));
  });

  LiveAudioStream.start();
  recording = true;

  emit({
    status: 'recording',
    message: 'Listening… tap Stop when finished.',
  });
}

async function haltCapture(): Promise<void> {
  if (!recording) {
    return;
  }
  try {
    await LiveAudioStream.stop();
  } catch {
    // ignore
  }
  recording = false;
  detachAudioListener();
}

/**
 * Stop capture and transcribe locally. Returns recognized text (may be empty).
 */
export async function stopRecording(): Promise<string> {
  if (!recording && !wavWriter) {
    return '';
  }

  cancelled = false;
  await haltCapture();

  const path = recordingPath;
  const writer = wavWriter;

  emit({
    status: 'transcribing',
    message: 'Transcribing on device…',
  });

  try {
    if (writer) {
      await writer.finalize();
    }

    if (!path || !(await RNFS.exists(path))) {
      throw new Error('No audio was captured.');
    }

    const context = await ensureWhisperContext();
    const {stop, promise} = context.transcribe(toFileUri(path), {
      language: 'en',
      maxThreads: 4,
    });
    stopTranscribe = stop;

    const {result, isAborted} = await promise;
    stopTranscribe = null;

    if (isAborted || cancelled) {
      emit({status: 'idle', message: 'Voice input cancelled.'});
      return '';
    }

    const text = (result ?? '').trim();
    emit({
      status: 'idle',
      message: text
        ? 'Transcription ready — edit before improving.'
        : 'No speech detected. Try again or type your message.',
    });
    return text;
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : 'Transcription failed.';
    emit({
      status: 'error',
      message: 'Could not transcribe audio.',
      detail,
    });
    throw error instanceof Error ? error : new Error(detail);
  } finally {
    stopTranscribe = null;
    await cleanupRecordingFiles();
  }
}

/**
 * Stop capture and discard audio without transcription.
 */
export async function cancelRecording(): Promise<void> {
  cancelled = true;

  if (stopTranscribe) {
    try {
      await stopTranscribe();
    } catch {
      // ignore
    }
    stopTranscribe = null;
  }

  await haltCapture();

  if (wavWriter) {
    try {
      await wavWriter.cancel();
    } catch {
      // ignore
    }
  }

  await cleanupRecordingFiles();
  emit({
    status: 'idle',
    message: 'Recording cancelled.',
  });
}

/** Free Whisper RAM so the LLM can load safely on mid-range phones. */
export async function releaseWhisperContext(): Promise<void> {
  if (!whisperContext) {
    initPromise = null;
    return;
  }
  try {
    await whisperContext.release();
  } catch {
    // ignore
  }
  whisperContext = null;
  initPromise = null;
}

export async function releaseVoiceResources(): Promise<void> {
  await cancelRecording();
  await releaseWhisperContext();
}

export function isVoiceRecording(): boolean {
  return recording;
}

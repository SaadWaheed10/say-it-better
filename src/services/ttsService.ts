import {Platform} from 'react-native';
import Tts from 'react-native-tts';

let ready = false;
let initPromise: Promise<boolean> | null = null;
let speaking = false;
const speakingListeners = new Set<(value: boolean) => void>();

function setSpeaking(value: boolean) {
  if (speaking === value) {
    return;
  }
  speaking = value;
  speakingListeners.forEach(listener => listener(speaking));
}

export function isSpeaking(): boolean {
  return speaking;
}

export function subscribeSpeaking(
  listener: (value: boolean) => void,
): () => void {
  speakingListeners.add(listener);
  listener(speaking);
  return () => {
    speakingListeners.delete(listener);
  };
}

function bindTtsEventsOnce() {
  Tts.addEventListener('tts-start', () => setSpeaking(true));
  Tts.addEventListener('tts-finish', () => setSpeaking(false));
  Tts.addEventListener('tts-cancel', () => setSpeaking(false));
  Tts.addEventListener('tts-error', () => setSpeaking(false));
}

let eventsBound = false;

async function ensureReady(): Promise<boolean> {
  if (ready) {
    return true;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      await Tts.getInitStatus();
    } catch {
      try {
        await Tts.setDefaultLanguage('en-US');
      } catch {
        return false;
      }
    }

    try {
      await Tts.setDefaultLanguage('en-US');
    } catch {
      // device default
    }

    try {
      await Tts.setDefaultRate(Platform.OS === 'ios' ? 0.45 : 0.48);
      await Tts.setDefaultPitch(1.0);
    } catch {
      // no-op
    }

    if (Platform.OS === 'ios') {
      try {
        await Tts.setIgnoreSilentSwitch('ignore');
      } catch {
        // no-op
      }
    }

    if (!eventsBound) {
      try {
        bindTtsEventsOnce();
        eventsBound = true;
      } catch {
        // no-op
      }
    }

    ready = true;
    return true;
  })();

  try {
    return await initPromise;
  } finally {
    if (!ready) {
      initPromise = null;
    }
  }
}

/** Speak text on-device (Android system TTS + iOS AVSpeech). Returns false if unavailable. */
export async function speakText(text: string): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }
  const ok = await ensureReady();
  if (!ok) {
    return false;
  }
  try {
    await Tts.stop();
    setSpeaking(false);
    if (Platform.OS === 'android') {
      Tts.speak(trimmed, {
        androidParams: {
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
          KEY_PARAM_VOLUME: 1,
          KEY_PARAM_PAN: 0,
        },
      } as Parameters<typeof Tts.speak>[1]);
    } else {
      Tts.speak(trimmed);
    }
    // Optimistic UI if events are delayed.
    setSpeaking(true);
    return true;
  } catch {
    setSpeaking(false);
    return false;
  }
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Tts.stop();
  } catch {
    // no-op
  }
  setSpeaking(false);
}

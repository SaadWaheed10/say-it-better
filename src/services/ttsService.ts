import Tts from 'react-native-tts';

let ready = false;

async function ensureReady(): Promise<void> {
  if (ready) {
    return;
  }
  try {
    await Tts.getInitStatus();
    Tts.setDefaultRate(0.45);
    Tts.setDefaultPitch(1.0);
    ready = true;
  } catch {
    // Some devices need an extra init call.
    try {
      await Tts.setDefaultLanguage('en-US');
      ready = true;
    } catch {
      ready = false;
    }
  }
}

export async function speakText(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }
  await ensureReady();
  try {
    await Tts.stop();
    Tts.speak(trimmed);
  } catch {
    // TTS unavailable — UI should still show a fallback hint.
  }
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Tts.stop();
  } catch {
    // no-op
  }
}

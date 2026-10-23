import {Platform, Vibration} from 'react-native';

let vibrationAllowed = true;

function safeVibrate(pattern: number | number[]): void {
  if (!vibrationAllowed) {
    return;
  }
  try {
    Vibration.vibrate(pattern);
  } catch {
    // Android without VIBRATE permission (or locked devices) — stop retrying.
    vibrationAllowed = false;
  }
}

/**
 * Light cross-platform feedback (iOS + Android) without native deps.
 */
export function hapticLight(): void {
  safeVibrate(Platform.OS === 'ios' ? 10 : 12);
}

export function hapticSuccess(): void {
  safeVibrate(Platform.OS === 'ios' ? [0, 12, 40, 12] : [0, 20, 40, 20]);
}

export function hapticSelection(): void {
  safeVibrate(Platform.OS === 'ios' ? 8 : 10);
}

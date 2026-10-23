import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../constants/storage';

export async function isImproveTipDismissed(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.improveTipDismissed);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function dismissImproveTip(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.improveTipDismissed, 'true');
  } catch {
    // no-op
  }
}

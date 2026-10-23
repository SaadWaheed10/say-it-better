import {PermissionsAndroid, Platform} from 'react-native';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

const CHANNEL_ID = 'sayitbetter-daily-tests';
const DAILY_ID = 'daily-test-reminder';

async function ensureAndroidPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  if (Platform.Version < 33) {
    return true;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Daily skill tests',
    importance: AndroidImportance.DEFAULT,
  });
}

/** Schedule a repeating local reminder around the given local hour (default 9). */
export async function syncDailyTestReminder(
  enabled: boolean,
  hour = 9,
  minute = 0,
): Promise<void> {
  try {
    await notifee.cancelNotification(DAILY_ID);
  } catch {
    // no-op
  }

  if (!enabled) {
    return;
  }

  const allowedAndroid = await ensureAndroidPermission();
  if (!allowedAndroid) {
    return;
  }

  const settings = await notifee.requestPermission();
  const authorized =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
  if (!authorized) {
    return;
  }

  await ensureChannel();

  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: next.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  await notifee.createTriggerNotification(
    {
      id: DAILY_ID,
      title: 'SayItBetter',
      body: 'Keep your streak — a quick skill test is waiting.',
      android: {
        channelId: CHANNEL_ID,
        pressAction: {id: 'default'},
      },
      ios: {
        sound: 'default',
      },
    },
    trigger,
  );
}

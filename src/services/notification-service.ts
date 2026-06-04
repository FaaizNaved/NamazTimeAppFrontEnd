import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { prayerTimeApi, TodayPrayerTimes } from '@/api/prayer-time-api';
import { deviceApi, toApiPreferences } from '@/api/device-api';
import {
  storageService,
  PrayerNotificationPrefs,
  SavedLocation,
} from '@/services/storage-service';
import {
  ADHAN_CATEGORY_ID,
  CHANNEL_DEFAULT,
  CHANNEL_FAJR,
  setupAdhanNotificationInfrastructure,
} from '@/services/notification-handler';

export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;
let handlerConfigured = false;

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (isExpoGo) return null;

  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
  }

  if (!handlerConfigured) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }

  return notificationsModule;
}

type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

const PRAYER_SCHEDULE: {
  key: PrayerKey;
  label: string;
  timeField: keyof TodayPrayerTimes;
  sound: string;
  channelId: string;
}[] = [
  { key: 'fajr', label: 'Fajr', timeField: 'fajr', sound: 'azan_fajr', channelId: CHANNEL_FAJR },
  { key: 'sunrise', label: 'Sunrise', timeField: 'sunrise', sound: 'azan_default', channelId: CHANNEL_DEFAULT },
  { key: 'dhuhr', label: 'Dhuhr', timeField: 'dhuhr', sound: 'azan_default', channelId: CHANNEL_DEFAULT },
  { key: 'asr', label: 'Asr', timeField: 'asr', sound: 'azan_default', channelId: CHANNEL_DEFAULT },
  { key: 'maghrib', label: 'Maghrib', timeField: 'maghrib', sound: 'azan_default', channelId: CHANNEL_DEFAULT },
  { key: 'isha', label: 'Isha', timeField: 'isha', sound: 'azan_default', channelId: CHANNEL_DEFAULT },
];

function parsePrayerDateTime(timeStr: string): Date | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

export const notificationService = {
  initialize: async () => {
    if (isExpoGo) return;
    await loadNotifications();
    await setupAdhanNotificationInfrastructure();
  },

  requestPermissions: async (): Promise<boolean> => {
    const Notifications = await loadNotifications();
    if (!Notifications || !Device.isDevice) return false;

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
    return status === 'granted';
  },

  getFcmToken: async (): Promise<string | null> => {
    const Notifications = await loadNotifications();
    if (!Notifications || !Device.isDevice) return null;

    try {
      const granted = await notificationService.requestPermissions();
      if (!granted) return null;
      await setupAdhanNotificationInfrastructure();
      const tokenData = await Notifications.getDevicePushTokenAsync();
      return tokenData.data;
    } catch {
      return null;
    }
  },

  cancelAllScheduled: async () => {
    const Notifications = await loadNotifications();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  schedulePrayerNotifications: async (
    times: TodayPrayerTimes,
    prefs: PrayerNotificationPrefs
  ) => {
    const Notifications = await loadNotifications();
    if (!Notifications) return;

    await notificationService.cancelAllScheduled();
    await setupAdhanNotificationInfrastructure();

    for (const prayer of PRAYER_SCHEDULE) {
      const pref = prefs[prayer.key];
      if (!pref.enabled) continue;

      const timeValue = times[prayer.timeField];
      if (!timeValue || typeof timeValue !== 'string') continue;

      const triggerDate = parsePrayerDateTime(timeValue);
      if (!triggerDate) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `adhan-${prayer.key}`,
        content: {
          title: `Adhan — ${prayer.label}`,
          body: `It is time for ${prayer.label} prayer.`,
          sound: Platform.OS === 'android' ? undefined : prayer.sound,
          categoryIdentifier: ADHAN_CATEGORY_ID,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            type: 'adhan',
            prayer: prayer.key,
            prayerName: prayer.label,
            sound: prayer.sound,
            volume: pref.volume,
          },
          ...(Platform.OS === 'android'
            ? { channelId: prayer.channelId }
            : { sound: `${prayer.sound}.mp3` }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: Platform.OS === 'android' ? prayer.channelId : undefined,
        },
      });
    }
  },

  syncWithBackend: async (location: SavedLocation, prefs: PrayerNotificationPrefs) => {
    const locationCode = location.locationCode;
    if (!locationCode) return;

    const deviceId = await storageService.getOrCreateDeviceId();
    const fcmToken = isExpoGo ? null : await notificationService.getFcmToken();
    const apiPrefs = toApiPreferences(prefs);
    const anyEnabled = Object.values(prefs).some((p) => p.enabled);

    await deviceApi.register({
      deviceUniqueId: deviceId,
      platform: Platform.OS,
      locationCode,
      fcmToken,
      notificationEnabled: anyEnabled,
      prayerPreferences: apiPrefs,
    });
  },

  refreshPrayerSchedule: async (
    location: SavedLocation,
    prefs: PrayerNotificationPrefs
  ) => {
    const code = location.locationCode;
    if (!code) return null;

    let times = await prayerTimeApi.getTodayPrayerTimes(code);
    if (!times) {
      try {
        await prayerTimeApi.generatePrayerTimes(code);
        times = await prayerTimeApi.getTodayPrayerTimes(code);
      } catch {
        return null;
      }
    }

    if (times) {
      if (!isExpoGo) {
        const granted = await notificationService.requestPermissions();
        if (granted) {
          await notificationService.schedulePrayerNotifications(times, prefs);
        }
      }
      await notificationService.syncWithBackend(location, prefs);
    }

    return times;
  },
};

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { isExpoGo } from '@/utils/runtime';
import { prayerTimeApi, TodayPrayerTimes } from '@/api/prayer-time-api';
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
import { SCHEDULE_AHEAD_DAYS } from '@/constants/scheduling';
import {
  markScheduleRefreshed,
  shouldSkipScheduleRefresh,
} from '@/services/schedule-refresh-cache';

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
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }

  return notificationsModule;
}

type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

const PRAYER_SCHEDULE: {
  key: PrayerKey;
  label: string;
  timeField: keyof TodayPrayerTimes;
  sound: string;
  channelId: string;
}[] = [
  { key: 'fajr', label: 'Fajr', timeField: 'fajr', sound: 'azan_fajr', channelId: CHANNEL_FAJR },
  { key: 'dhuhr', label: 'Dhuhr', timeField: 'dhuhr', sound: 'azan_default', channelId: CHANNEL_DEFAULT },
  { key: 'asr', label: 'Asr', timeField: 'asr', sound: 'azan_default', channelId: CHANNEL_DEFAULT },
  { key: 'maghrib', label: 'Maghrib', timeField: 'maghrib', sound: 'azan_default', channelId: CHANNEL_DEFAULT },
  { key: 'isha', label: 'Isha', timeField: 'isha', sound: 'azan_default', channelId: CHANNEL_DEFAULT },
];

function parseTimeOnDate(timeStr: string, baseDate: Date): Date | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
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
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return status === 'granted';
  },

  cancelAllScheduled: async () => {
    const Notifications = await loadNotifications();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  schedulePrayerNotifications: async (
    times: TodayPrayerTimes,
    prefs: PrayerNotificationPrefs,
    prayerDate?: string
  ) => {
    const Notifications = await loadNotifications();
    if (!Notifications) return;

    await setupAdhanNotificationInfrastructure();

    const baseDate = prayerDate ? new Date(prayerDate) : new Date();
    if (Number.isNaN(baseDate.getTime())) {
      baseDate.setTime(Date.now());
    }

    for (const prayer of PRAYER_SCHEDULE) {
      const pref = prefs[prayer.key];
      if (!pref.enabled) continue;

      const timeValue = times[prayer.timeField];
      if (!timeValue || typeof timeValue !== 'string') continue;

      const triggerDate = parseTimeOnDate(timeValue, baseDate);
      if (!triggerDate) continue;

      // Handle timing: if the trigger time is in the past, we still want to play it
      // (better late than never) but adjust for same-day prayers only
      const now = Date.now();
      const triggerTime = triggerDate.getTime();

      if (triggerTime <= now) {
        // Trigger time is in the past
        // Check if it's from today (within 24 hours)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayStart.getDate() + 1);

        if (triggerTime >= todayStart.getTime() && triggerTime < todayEnd.getTime()) {
          // It's from today, play it now (or very soon)
          triggerDate.setTime(now + 1000); // Play 1 second from now
        } else {
          // It's from a previous day, skip it (genuinely missed prayer)
          continue;
        }
      }

      const dateKey = triggerDate.toISOString().slice(0, 10);

      await Notifications.scheduleNotificationAsync({
        identifier: `adhan-${prayer.key}-${dateKey}`,
        content: {
          title: `Adhan — ${prayer.label}`,
          body: `It is time for ${prayer.label} prayer.`,
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
            ? { channelId: prayer.channelId, ongoing: true }
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

  /** Download prayer times once, schedule local alarms for SCHEDULE_AHEAD_DAYS (no server push). */
  refreshPrayerSchedule: async (
    location: SavedLocation,
    prefs: PrayerNotificationPrefs
  ) => {
    return scheduleLocalAlarmsForLocation(location, prefs);
  },
};

/** Used by Home screen, app launch, and background task. */
export async function scheduleLocalAlarmsForLocation(
  location: SavedLocation,
  prefs: PrayerNotificationPrefs
): Promise<TodayPrayerTimes | null> {
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

  if (!times) return null;

  if (!isExpoGo) {
    const granted = await notificationService.requestPermissions();
    if (granted) {
      await notificationService.cancelAllScheduled();

      const upcoming = await prayerTimeApi.getUpcomingPrayerTimes(code, SCHEDULE_AHEAD_DAYS);
      const daysToSchedule = upcoming.length > 0 ? upcoming : [times];

      const seen = new Set<string>();
      for (const day of daysToSchedule) {
        const dateKey = normalizeDateKey(day.prayerDate);
        if (!dateKey || seen.has(dateKey)) continue;
        seen.add(dateKey);
        await notificationService.schedulePrayerNotifications(day, prefs, day.prayerDate);
      }
    }
  }

  return times;
}

function normalizeDateKey(value: string | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export interface ScheduleRefreshOptions {
  /** Bypass the 6-hour throttle (e.g. app launch, preference change). */
  force?: boolean;
}

/** Entry point for launch + background fetch. */
export async function performLocalAlarmScheduling(
  options: ScheduleRefreshOptions = {}
): Promise<TodayPrayerTimes | null> {
  if (await shouldSkipScheduleRefresh(options.force ?? false)) {
    const loc = await storageService.getLocation();
    if (!loc?.locationCode) return null;
    try {
      return await prayerTimeApi.getTodayPrayerTimes(loc.locationCode);
    } catch {
      return null;
    }
  }

  const location = await storageService.getLocation();
  const prefs = await storageService.getNotificationPrefs();
  if (!location?.locationCode) return null;

  const times = await scheduleLocalAlarmsForLocation(location, prefs);
  if (times) {
    await markScheduleRefreshed();
  }
  return times;
}

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { playAdhan, stopAdhan } from '@/services/adhan-player';
import { isExpoGo } from '@/services/notification-service';

export const ADHAN_CATEGORY_ID = 'adhan-alarm';
export const STOP_ADHAN_ACTION = 'STOP_ADHAN';
export const CHANNEL_DEFAULT = 'adhan_alarm_default';
export const CHANNEL_FAJR = 'adhan_alarm_fajr';
const PLAYING_NOTIFICATION_ID = 'adhan-playing';

let handlersRegistered = false;

export async function setupAdhanNotificationInfrastructure() {
  if (isExpoGo) return;

  await Notifications.setNotificationCategoryAsync(ADHAN_CATEGORY_ID, [
    {
      identifier: STOP_ADHAN_ACTION,
      buttonTitle: 'Stop',
      options: {
        isDestructive: true,
        opensAppToForeground: false,
      },
    },
  ]);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_DEFAULT, {
      name: 'Adhan Alarm',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'azan_default',
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      vibrationPattern: [0, 500, 250, 500],
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    await Notifications.setNotificationChannelAsync(CHANNEL_FAJR, {
      name: 'Fajr Adhan Alarm',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'azan_fajr',
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      vibrationPattern: [0, 500, 250, 500],
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

async function showPlayingNotification(prayerName: string) {
  const NotificationsModule = await import('expo-notifications');
  await NotificationsModule.scheduleNotificationAsync({
    identifier: PLAYING_NOTIFICATION_ID,
    content: {
      title: `Adhan — ${prayerName}`,
      body: 'Tap Stop to end the adhan.',
      categoryIdentifier: ADHAN_CATEGORY_ID,
      sticky: true,
      priority: NotificationsModule.AndroidNotificationPriority.MAX,
      ...(Platform.OS === 'android'
        ? {
            channelId: CHANNEL_DEFAULT,
            ongoing: true,
          }
        : {}),
    },
    trigger: null,
  });
}

async function dismissPlayingNotification() {
  try {
    await Notifications.dismissNotificationAsync(PLAYING_NOTIFICATION_ID);
    await Notifications.cancelScheduledNotificationAsync(PLAYING_NOTIFICATION_ID);
  } catch {
    // ignore
  }
}

function isAdhanPayload(data: Record<string, unknown> | undefined): boolean {
  return data?.type === 'adhan';
}

export function registerAdhanNotificationHandlers() {
  if (isExpoGo || handlersRegistered) return;
  handlersRegistered = true;

  Notifications.addNotificationReceivedListener((notification) => {
    if (notification.request.identifier === PLAYING_NOTIFICATION_ID) return;

    const data = notification.request.content.data as Record<string, unknown>;
    if (!isAdhanPayload(data)) return;

    const prayerName = String(data.prayerName ?? data.prayer ?? 'Prayer');
    const volume = Number(data.volume ?? 80);
    const sound = String(data.sound ?? data.prayer ?? '');

    void (async () => {
      await playAdhan(sound, volume);
      await showPlayingNotification(prayerName);
    })();
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    const actionId = response.actionIdentifier;
    const data = response.notification.request.content.data as Record<string, unknown>;

    if (actionId === STOP_ADHAN_ACTION) {
      void (async () => {
        await stopAdhan();
        await dismissPlayingNotification();
      })();
    } else if (isAdhanPayload(data)) {
      const volume = Number(data.volume ?? 80);
      const sound = String(data.sound ?? data.prayer ?? '');
      void playAdhan(sound, volume);
    }
  });
}

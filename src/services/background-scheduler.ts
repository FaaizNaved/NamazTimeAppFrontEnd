import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { isExpoGo } from '@/utils/runtime';

export const ADHAN_SCHEDULE_TASK = 'adhan-schedule-refresh';

TaskManager.defineTask(ADHAN_SCHEDULE_TASK, async () => {
  try {
    const { performLocalAlarmScheduling } = await import('@/services/notification-service');
    await performLocalAlarmScheduling({ force: false });
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/** Registers periodic background refresh (~every 12h; OS decides exact timing). */
export async function registerBackgroundScheduler(): Promise<void> {
  if (isExpoGo) return;

  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(ADHAN_SCHEDULE_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(ADHAN_SCHEDULE_TASK, {
      minimumInterval: 60 * 60 * 12,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}

/** Runs on app launch — full 30-day schedule (forced refresh). */
export async function runLaunchScheduleRefresh(): Promise<void> {
  if (isExpoGo) return;
  const { performLocalAlarmScheduling } = await import('@/services/notification-service');
  await performLocalAlarmScheduling({ force: true });
}

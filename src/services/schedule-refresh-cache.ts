import * as SecureStore from 'expo-secure-store';

const LAST_REFRESH_KEY = 'namaz_last_schedule_refresh';
const MIN_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

export async function shouldSkipScheduleRefresh(force: boolean): Promise<boolean> {
  if (force) return false;
  const last = await SecureStore.getItemAsync(LAST_REFRESH_KEY);
  if (!last) return false;
  const lastMs = parseInt(last, 10);
  return !Number.isNaN(lastMs) && Date.now() - lastMs < MIN_REFRESH_INTERVAL_MS;
}

export async function markScheduleRefreshed(): Promise<void> {
  await SecureStore.setItemAsync(LAST_REFRESH_KEY, String(Date.now()));
}

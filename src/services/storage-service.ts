import * as SecureStore from 'expo-secure-store';

const KEYS = {
  LOCATION: 'namaz_location',
  NOTIFICATION_PREFS: 'namaz_notification_prefs',
  THEME_MODE: 'namaz_theme_mode',
};

export type ThemeMode = 'light' | 'dark' | 'system';

export interface SavedLocation {
  country: string;
  state: string;
  city: string;
  locationCode?: string;
}

export interface PrayerNotificationPrefs {
  fajr: { enabled: boolean; volume: number };
  dhuhr: { enabled: boolean; volume: number };
  asr: { enabled: boolean; volume: number };
  maghrib: { enabled: boolean; volume: number };
  isha: { enabled: boolean; volume: number };
}

const DEFAULT_PREFS: PrayerNotificationPrefs = {
  fajr: { enabled: true, volume: 100 },
  dhuhr: { enabled: true, volume: 100 },
  asr: { enabled: true, volume: 100 },
  maghrib: { enabled: true, volume: 100 },
  isha: { enabled: true, volume: 100 },
};

export const storageService = {
  saveLocation: async (location: SavedLocation): Promise<void> => {
    await SecureStore.setItemAsync(KEYS.LOCATION, JSON.stringify(location));
  },

  getLocation: async (): Promise<SavedLocation | null> => {
    const value = await SecureStore.getItemAsync(KEYS.LOCATION);
    return value ? JSON.parse(value) : null;
  },

  clearLocation: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(KEYS.LOCATION);
  },

  saveNotificationPrefs: async (prefs: PrayerNotificationPrefs): Promise<void> => {
    await SecureStore.setItemAsync(KEYS.NOTIFICATION_PREFS, JSON.stringify(prefs));
  },

  getNotificationPrefs: async (): Promise<PrayerNotificationPrefs> => {
    const value = await SecureStore.getItemAsync(KEYS.NOTIFICATION_PREFS);
    return value ? JSON.parse(value) : DEFAULT_PREFS;
  },

  saveThemeMode: async (mode: ThemeMode): Promise<void> => {
    await SecureStore.setItemAsync(KEYS.THEME_MODE, mode);
  },

  getThemeMode: async (): Promise<ThemeMode> => {
    const value = await SecureStore.getItemAsync(KEYS.THEME_MODE);
    return (value as ThemeMode) || 'light';
  },
};

import apiClient from './api-client';
import { PrayerNotificationPrefs } from '@/services/storage-service';

interface ApiResponse<T> {
  model?: T;
  Model?: T;
}

export interface DevicePrayerPreferencesPayload {
  fajr: { enabled: boolean; volume: number };
  sunrise: { enabled: boolean; volume: number };
  dhuhr: { enabled: boolean; volume: number };
  asr: { enabled: boolean; volume: number };
  maghrib: { enabled: boolean; volume: number };
  isha: { enabled: boolean; volume: number };
}

function unwrapModel<T>(data: ApiResponse<T>): T | null {
  return data.model ?? data.Model ?? null;
}

export function toApiPreferences(prefs: PrayerNotificationPrefs): DevicePrayerPreferencesPayload {
  return {
    fajr: { enabled: prefs.fajr.enabled, volume: prefs.fajr.volume },
    sunrise: { enabled: prefs.sunrise.enabled, volume: prefs.sunrise.volume },
    dhuhr: { enabled: prefs.dhuhr.enabled, volume: prefs.dhuhr.volume },
    asr: { enabled: prefs.asr.enabled, volume: prefs.asr.volume },
    maghrib: { enabled: prefs.maghrib.enabled, volume: prefs.maghrib.volume },
    isha: { enabled: prefs.isha.enabled, volume: prefs.isha.volume },
  };
}

export const deviceApi = {
  register: async (payload: {
    deviceUniqueId: string;
    platform: string;
    locationCode: string;
    fcmToken?: string | null;
    appVersion?: string;
    notificationEnabled: boolean;
    prayerPreferences: DevicePrayerPreferencesPayload;
  }) => {
    const response = await apiClient.post<ApiResponse<unknown>>(
      '/api/v1/devices/register',
      {
        deviceUniqueId: payload.deviceUniqueId,
        platform: payload.platform,
        locationCode: payload.locationCode,
        fcmToken: payload.fcmToken,
        appVersion: payload.appVersion ?? '1.0.0',
        notificationEnabled: payload.notificationEnabled,
        prayerPreferences: payload.prayerPreferences,
      }
    );
    return unwrapModel(response.data);
  },

  updatePreferences: async (
    deviceUniqueId: string,
    prayerPreferences: DevicePrayerPreferencesPayload,
    notificationEnabled?: boolean
  ) => {
    const response = await apiClient.put<ApiResponse<unknown>>(
      `/api/v1/devices/${encodeURIComponent(deviceUniqueId)}/preferences`,
      prayerPreferences,
      {
        params: notificationEnabled !== undefined ? { notificationEnabled } : undefined,
      }
    );
    return unwrapModel(response.data);
  },
};

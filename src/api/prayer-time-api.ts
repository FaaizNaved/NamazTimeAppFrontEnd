import apiClient from './api-client';

interface ApiResponse<T> {
  model?: T;
  Model?: T;
  totalRows?: number;
  messages?: { messageType: number; value: string; fieldName: string }[];
}

export interface TodayPrayerTimes {
  locationCode: string;
  locationName: string;
  prayerDate: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

function mapTodayTimes(raw: Record<string, string | undefined>): TodayPrayerTimes | null {
  const code = raw.locationCode ?? raw.LocationCode;
  const fajr = raw.fajr ?? raw.Fajr;
  if (!code || !fajr) return null;
  return {
    locationCode: code,
    locationName: raw.locationName ?? raw.LocationName ?? '',
    prayerDate: raw.prayerDate ?? raw.PrayerDate ?? '',
    fajr,
    sunrise: raw.sunrise ?? raw.Sunrise ?? '',
    dhuhr: raw.dhuhr ?? raw.Dhuhr ?? '',
    asr: raw.asr ?? raw.Asr ?? '',
    maghrib: raw.maghrib ?? raw.Maghrib ?? '',
    isha: raw.isha ?? raw.Isha ?? '',
  };
}

export const prayerTimeApi = {
  generatePrayerTimes: async (locationCode: string): Promise<string> => {
    const response = await apiClient.post<ApiResponse<object>>(
      `/api/v1/prayer-times/generate/${locationCode}`
    );
    return response.data.messages?.[0]?.value ?? 'Done';
  },

  getTodayPrayerTimes: async (locationCode: string): Promise<TodayPrayerTimes | null> => {
    const response = await apiClient.get<ApiResponse<Record<string, string>>>(
      `/api/v1/prayer-times/today/${locationCode}`
    );
    const model = response.data.model ?? response.data.Model;
    if (!model) return null;
    return mapTodayTimes(model);
  },
};

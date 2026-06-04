import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { useDrawer } from '@/components/common/drawer-context';
import { PrayerCard } from '@/components/prayer/prayer-card';
import {
  storageService,
  SavedLocation,
  PrayerNotificationPrefs,
} from '@/services/storage-service';
import { performLocalAlarmScheduling } from '@/services/notification-service';
import { TodayPrayerTimes } from '@/api/prayer-time-api';

type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

interface PrayerInfo {
  key: PrayerKey;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  isFajr?: boolean;
}

const PRAYERS: PrayerInfo[] = [
  { key: 'fajr', name: 'Fajr', icon: 'moon', isFajr: true },
  { key: 'sunrise', name: 'Sunrise', icon: 'sunny-outline' },
  { key: 'dhuhr', name: 'Dhuhr', icon: 'sunny' },
  { key: 'asr', name: 'Asr', icon: 'partly-sunny' },
  { key: 'maghrib', name: 'Maghrib', icon: 'cloudy-night' },
  { key: 'isha', name: 'Isha', icon: 'moon-outline' },
];

const FALLBACK_TIMES: Record<PrayerKey, string> = {
  fajr: '--:--',
  sunrise: '--:--',
  dhuhr: '--:--',
  asr: '--:--',
  maghrib: '--:--',
  isha: '--:--',
};

export default function HomeScreen() {
  const { toggleDrawer } = useDrawer();
  const colorScheme = useAppColorScheme();
  const theme = Colors[colorScheme];

  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [prefs, setPrefs] = useState<PrayerNotificationPrefs | null>(null);
  const [times, setTimes] = useState<TodayPrayerTimes | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [loc, notifPrefs] = await Promise.all([
      storageService.getLocation(),
      storageService.getNotificationPrefs(),
    ]);
    setLocation(loc);
    setPrefs(notifPrefs);

    if (loc?.locationCode) {
      const prayerTimes = await performLocalAlarmScheduling({ force: true });
      setTimes(prayerTimes);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const syncNotifications = async (
    nextPrefs: PrayerNotificationPrefs,
    loc: SavedLocation | null
  ) => {
    if (!loc?.locationCode) return;
    const prayerTimes = await performLocalAlarmScheduling({ force: true });
    setTimes(prayerTimes);
  };

  const handleToggleNotification = async (prayer: PrayerKey, value: boolean) => {
    if (!prefs) return;
    const updated = {
      ...prefs,
      [prayer]: { ...prefs[prayer], enabled: value },
    };
    setPrefs(updated);
    await storageService.saveNotificationPrefs(updated);
    await syncNotifications(updated, location);
  };

  const handleVolumeChange = async (prayer: PrayerKey, value: number) => {
    if (!prefs) return;
    const updated = {
      ...prefs,
      [prayer]: { ...prefs[prayer], volume: value },
    };
    setPrefs(updated);
    await storageService.saveNotificationPrefs(updated);
    await syncNotifications(updated, location);
  };

  const displayTimes: Record<PrayerKey, string> = times
    ? {
        fajr: times.fajr,
        sunrise: times.sunrise,
        dhuhr: times.dhuhr,
        asr: times.asr,
        maghrib: times.maghrib,
        isha: times.isha,
      }
    : FALLBACK_TIMES;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary, ...Shadows.lg }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={toggleDrawer}
            style={styles.hamburger}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{location?.city ?? 'Loading...'}</Text>
            <Text style={styles.headerSubtitle}>{dateStr}</Text>
          </View>
          <View style={styles.headerRight}>
            <Ionicons name="location" size={18} color="#FFFFFF90" />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <View
          style={[
            styles.infoBanner,
            { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30' },
          ]}
        >
          <Ionicons name="notifications" size={18} color={theme.accent} />
          <Text style={[styles.infoText, { color: theme.accent }]}>
            Local adhan alarms — works offline after prayer times are downloaded. Fajr uses special azaan.
          </Text>
        </View>

        {prefs &&
          PRAYERS.map((prayer) => (
            <PrayerCard
              key={prayer.key}
              name={prayer.name}
              time={displayTimes[prayer.key]}
              icon={prayer.icon}
              isFajr={prayer.isFajr}
              notificationEnabled={prefs[prayer.key].enabled}
              volume={prefs[prayer.key].volume}
              onToggleNotification={(val) => handleToggleNotification(prayer.key, val)}
              onVolumeChange={(val) => handleVolumeChange(prayer.key, val)}
            />
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingTop: 54,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  hamburger: { padding: Spacing.sm, marginLeft: -Spacing.sm },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: { fontSize: 13, color: '#FFFFFFB0', marginTop: 2 },
  headerRight: { padding: Spacing.sm },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  infoText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
});

import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

interface PrayerCardProps {
  name: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  notificationEnabled: boolean;
  volume: number;
  onToggleNotification: (value: boolean) => void;
  onVolumeChange: (value: number) => void;
  isFajr?: boolean;
}

export function PrayerCard({
  name,
  time,
  icon,
  notificationEnabled,
  volume,
  onToggleNotification,
  onVolumeChange,
  isFajr = false,
}: PrayerCardProps) {
  const colorScheme = useAppColorScheme();
  const theme = Colors[colorScheme];

  const accentColor = isFajr ? theme.accent : theme.primary;
  const cardBg = isFajr ? (colorScheme === 'dark' ? '#2A2215' : '#FFF8EC') : theme.card;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: isFajr ? theme.accent + '40' : theme.borderLight,
          ...Shadows.md,
        },
      ]}
    >
      {/* Top Row: Icon + Name + Time */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: accentColor + '18' },
          ]}
        >
          <Ionicons name={icon} size={24} color={accentColor} />
        </View>
        <View style={styles.nameContainer}>
          <Text style={[styles.prayerName, { color: theme.text }]}>{name}</Text>
          {isFajr 
            //<Text style={[styles.fajrBadge, { color: theme.accent }]}>★ Special Azaan</Text>
          }
        </View>
        <Text style={[styles.prayerTime, { color: accentColor }]}>{time}</Text>
      </View>

      {/* Bottom Row: Toggle + Volume */}
      <View style={[styles.bottomRow, { borderTopColor: theme.borderLight }]}>
        <View style={styles.toggleRow}>
          <Ionicons
            name={notificationEnabled ? 'notifications' : 'notifications-off-outline'}
            size={18}
            color={notificationEnabled ? theme.success : theme.textMuted}
          />
          <Text
            style={[
              styles.toggleLabel,
              { color: notificationEnabled ? theme.text : theme.textMuted },
            ]}
          >
            Notification
          </Text>
          <Switch
            value={notificationEnabled}
            onValueChange={onToggleNotification}
            trackColor={{ false: theme.sliderTrack, true: theme.success + '60' }}
            thumbColor={notificationEnabled ? theme.success : theme.textMuted}
            ios_backgroundColor={theme.sliderTrack}
          />
        </View>

        {notificationEnabled && (
          <View style={styles.volumeRow}>
            <Ionicons
              name={volume === 0 ? 'volume-mute' : volume < 50 ? 'volume-low' : 'volume-high'}
              size={18}
              color={theme.textSecondary}
            />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={volume}
              onValueChange={onVolumeChange}
              minimumTrackTintColor={accentColor}
              maximumTrackTintColor={theme.sliderTrack}
              thumbTintColor={accentColor}
            />
            <Text style={[styles.volumeText, { color: theme.textSecondary }]}>
              {Math.round(volume)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  nameContainer: {
    flex: 1,
  },
  prayerName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  fajrBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  prayerTime: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  slider: {
    flex: 1,
    height: 36,
  },
  volumeText: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 38,
    textAlign: 'right',
  },
});

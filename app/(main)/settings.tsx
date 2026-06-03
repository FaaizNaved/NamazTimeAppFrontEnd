import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { useAppTheme } from '@/contexts/theme-context';
import { useDrawer } from '@/components/common/drawer-context';
import { storageService, ThemeMode } from '@/services/storage-service';
import { notificationService } from '@/services/notification-service';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  danger?: boolean;
}

function SettingItem({ icon, label, subtitle, onPress, iconColor, danger }: SettingItemProps) {
  const colorScheme = useAppColorScheme();
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
          ...Shadows.sm,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.settingIconContainer,
          {
            backgroundColor: (danger ? theme.error : iconColor ?? theme.primary) + '15',
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={danger ? theme.error : iconColor ?? theme.primary}
        />
      </View>
      <View style={styles.settingTextContainer}>
        <Text
          style={[styles.settingLabel, { color: danger ? theme.error : theme.text }]}
        >
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { toggleDrawer } = useDrawer();
  const router = useRouter();
  const colorScheme = useAppColorScheme();
  const theme = Colors[colorScheme];
  const { themeMode, setThemeMode } = useAppTheme();

  const handleChangeLocation = () => {
    Alert.alert(
      'Change Location',
      'This will take you back to the location setup screen. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            await notificationService.cancelAllScheduled();
            await storageService.clearLocation();
            router.replace('/location-setup');
          },
        },
      ]
    );
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode);
  };

  const isDarkOn = themeMode === 'dark';

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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerRight} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPEARANCE</Text>

        <View
          style={[
            styles.settingItem,
            {
              backgroundColor: theme.card,
              borderColor: theme.borderLight,
              ...Shadows.sm,
            },
          ]}
        >
          <View
            style={[styles.settingIconContainer, { backgroundColor: theme.accent + '15' }]}
          >
            <Ionicons name="moon" size={22} color={theme.accent} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode (AMOLED)</Text>
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              Pure black background for OLED screens
            </Text>
          </View>
          <Switch
            value={isDarkOn}
            onValueChange={(on) => handleThemeChange(on ? 'dark' : 'light')}
            trackColor={{ false: theme.sliderTrack, true: theme.primary + '80' }}
            thumbColor={isDarkOn ? theme.primary : theme.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.themeChipRow,
            { backgroundColor: theme.card, borderColor: theme.borderLight },
          ]}
          onPress={() => handleThemeChange('system')}
          activeOpacity={0.7}
        >
          <Text style={[styles.themeChipLabel, { color: theme.textSecondary }]}>
            Use system theme
          </Text>
          {themeMode === 'system' && (
            <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
          )}
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>LOCATION</Text>

        <SettingItem
          icon="location"
          label="Change Location"
          subtitle="Update your city for accurate prayer times"
          onPress={handleChangeLocation}
        />

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ABOUT</Text>

        <SettingItem
          icon="information-circle"
          label="App Version"
          subtitle="1.0.0"
          onPress={() => {}}
          iconColor={theme.accent}
        />
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
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerRight: { width: 34 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
    marginLeft: Spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  settingIconContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingTextContainer: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  settingSubtitle: { fontSize: 13, marginTop: 2 },
  themeChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  themeChipLabel: { fontSize: 15, fontWeight: '500' },
});

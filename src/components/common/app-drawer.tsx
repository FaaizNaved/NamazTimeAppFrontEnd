import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDrawer } from './drawer-context';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/(main)/home' | '/(main)/settings';
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Home', icon: 'home', route: '/(main)/home' },
  { label: 'Settings', icon: 'settings', route: '/(main)/settings' },
];

export function AppDrawer({ children }: { children: React.ReactNode }) {
  const { isOpen, closeDrawer } = useDrawer();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useAppColorScheme();
  const theme = Colors[colorScheme];

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  const navigateTo = (route: MenuItem['route']) => {
    closeDrawer();
    if (pathname !== route) {
      router.replace(route);
    }
  };

  return (
    <View style={styles.container}>
      {children}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDrawer}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.overlay} onPress={closeDrawer} />

          <View style={[styles.drawer, { backgroundColor: theme.card, ...Shadows.lg }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeDrawer}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={28} color={theme.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
              <View
                style={[
                  styles.drawerLogo,
                  { backgroundColor: theme.primary + '15', borderColor: theme.accent + '40' },
                ]}
              >
                <MaterialCommunityIcons name="mosque" size={40} color={theme.primary} />
              </View>
              <Text style={[styles.drawerTitle, { color: theme.primary }]}>Namaz Time</Text>
              <Text style={[styles.drawerSubtitle, { color: theme.textSecondary }]}>
                Prayer Companion
              </Text>
            </View>

            <View style={styles.menuContainer}>
              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.menuItem, { borderBottomColor: theme.borderLight }]}
                  onPress={() => navigateTo(item.route)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.menuIconContainer, { backgroundColor: theme.primary + '15' }]}
                  >
                    <Ionicons name={item.icon} size={22} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.drawerFooter}>
              <Text style={[styles.footerText, { color: theme.textMuted }]}>v1.0.0</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    width: '75%',
    maxWidth: 320,
    paddingTop: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: Spacing.lg,
    zIndex: 2,
    padding: Spacing.xs,
  },
  drawerHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  drawerLogo: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  drawerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  drawerFooter: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

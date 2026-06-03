import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { storageService } from '@/services/storage-service';

export default function AppIndex() {
  const router = useRouter();
  const colorScheme = useAppColorScheme();
  const theme = Colors[colorScheme];
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    try {
      const location = await storageService.getLocation();
      if (location) {
        router.replace('/(main)/home');
      } else {
        router.replace('/location-setup');
      }
    } catch {
      router.replace('/location-setup');
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

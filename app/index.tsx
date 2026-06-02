import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function AppIndex() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">NamazTimeApp</ThemedText>
      <ThemedText type="default">Choose a section below:</ThemedText>

      <Link href="/home" style={styles.link}>
        <ThemedText type="defaultSemiBold">Home</ThemedText>
      </Link>
      <Link href="/prayer" style={styles.link}>
        <ThemedText type="defaultSemiBold">Prayer</ThemedText>
      </Link>
      <Link href="/settings" style={styles.link}>
        <ThemedText type="defaultSemiBold">Settings</ThemedText>
      </Link>
      <Link href="/profile" style={styles.link}>
        <ThemedText type="defaultSemiBold">Profile</ThemedText>
      </Link>
      <Link href="/auth/login" style={styles.link}>
        <ThemedText type="defaultSemiBold">Login</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  link: {
    paddingVertical: 12,
  },
});

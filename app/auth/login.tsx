import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function LoginScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Login</ThemedText>
      <ThemedText type="default">This is the login screen.</ThemedText>
      <Link href="/auth/register" style={styles.link}>
        <ThemedText type="defaultSemiBold">Go to Register</ThemedText>
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

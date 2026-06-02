import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function RegisterScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Register</ThemedText>
      <ThemedText type="default">This is the register screen.</ThemedText>
      <Link href="/auth/login" style={styles.link}>
        <ThemedText type="defaultSemiBold">Back to Login</ThemedText>
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

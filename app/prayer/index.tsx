import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function PrayerScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Prayer</ThemedText>
      <ThemedText type="default">This is the prayer screen.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});

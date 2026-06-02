import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Home</ThemedText>
      <ThemedText type="default">Welcome to the home screen.</ThemedText>
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

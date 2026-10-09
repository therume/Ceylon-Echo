import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { TravelColors } from '@/components/travel-ui';

export function DataMessage({
  message,
  isLoading = false,
  isError = false,
}: {
  message: string;
  isLoading?: boolean;
  isError?: boolean;
}) {
  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator color={TravelColors.green} /> : null}
      <Text style={[styles.message, isError && styles.error]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e8e7df',
    borderRadius: 15,
    backgroundColor: '#ffffff',
  },
  message: {
    color: TravelColors.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
  error: {
    color: '#9b4d32',
  },
});

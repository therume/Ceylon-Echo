import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { HeritageBackground } from '@/components/heritage-background';
import { useAuth } from '@/context/AuthContext';
import { TravelColors } from '@/components/travel-ui';

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user]);

  if (isLoading || !user) {
    return (
      <View style={styles.loading}>
        <HeritageBackground />
        <ActivityIndicator color={TravelColors.green} />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TravelColors.background,
  },
});

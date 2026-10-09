import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router, Stack, useSegments } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

import { AdminAuthProvider, useAdminAuth } from '@/features/admin/admin-auth';
import { AdminProvider } from '@/features/admin/admin-context';
import { adminColors } from '@/features/admin/admin-ui';
import { HeritageBackground } from '@/components/heritage-background';

export default function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminRoutes />
    </AdminAuthProvider>
  );
}

function AdminRoutes() {
  const { user, isAdmin, isLoading } = useAdminAuth();
  const reducedMotion = useReducedMotion();
  const segments = useSegments();
  const isLoginRoute = segments[1] !== 'attractions';

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!user && !isLoginRoute) {
      router.replace('/admin');
    } else if (user && isAdmin && isLoginRoute) {
      router.replace('/admin/attractions');
    } else if (user && !isAdmin && !isLoginRoute) {
      router.replace('/admin');
    }
  }, [isLoading, isLoginRoute, isAdmin, user]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <HeritageBackground />
        <ActivityIndicator color={adminColors.green} />
      </View>
    );
  }

  const stack = (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reducedMotion ? 'none' : 'fade',
        animationDuration: 220,
      }}
    />
  );
  return user && isAdmin ? <AdminProvider key={user.uid}>{stack}</AdminProvider> : stack;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: adminColors.background,
  },
});

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AttractionsProvider } from '@/context/AttractionsContext';
import { AuthProvider } from '@/context/AuthContext';
import { useReducedMotion } from 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const reducedMotion = useReducedMotion();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AttractionsProvider>
          <AnimatedSplashOverlay />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: reducedMotion ? 'none' : 'fade',
              animationDuration: 220,
            }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="language" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AttractionsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

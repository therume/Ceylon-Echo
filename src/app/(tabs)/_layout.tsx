import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

export const unstable_settings = {
  anchor: 'home',
};

export default function TabLayout() {
  const reducedMotion = useReducedMotion();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reducedMotion ? 'none' : 'fade',
        animationDuration: 220,
      }}
    />
  );
}

import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeritageBackground } from '@/components/heritage-background';
import { useAuth } from '@/context/AuthContext';
import { onboardingNavigation } from '@/navigation/app-navigation';

export default function WelcomePage() {
  const { user, isLoading } = useAuth();
  const { height } = useWindowDimensions();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, user]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <HeritageBackground />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View entering={FadeIn.duration(650)} style={styles.topBar}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>CE</Text>
              </View>
              <View>
                <Text style={styles.brandName}>CEYLON ECHO</Text>
                <Text style={styles.brandCaption}>A SRI LANKAN JOURNEY</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onboardingNavigation.begin}
              style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(650).delay(80)}
            style={[styles.photoFrame, { height: Math.min(Math.max(height * 0.38, 210), 310) }]}>
            {!imageFailed ? (
              <Image
                accessibilityLabel="Sri Lankan stilt fishermen at sunset"
                contentFit="cover"
                onError={() => setImageFailed(true)}
                source={require('../../assets/images/stilt-fishermen.png')}
                style={StyleSheet.absoluteFill}
                transition={500}
              />
            ) : (
              <View style={styles.photoFallback}>
                <Text style={styles.photoFallbackMark}>CE</Text>
                <Text style={styles.photoFallbackText}>The island is waiting to be explored</Text>
              </View>
            )}
            <View pointerEvents="none" style={styles.photoShade} />
            <View style={styles.photoLabel}>
              <View style={styles.photoDot} />
              <Text style={styles.photoLabelText}>SRI LANKA · ISLAND STORIES</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(700).delay(140)} style={styles.welcomeCopy}>
            <View style={styles.photoCaption}>
              <View style={styles.captionRule} />
              <Text style={styles.eyebrow}>AN ISLAND OF STORIES</Text>
            </View>
            <Text style={styles.welcomeTitle}>Discover the Soul of Sri Lanka</Text>
            <Text style={styles.welcomeSubtitle}>
              Find your way through living culture, ancient heritage, wild nature and unforgettable
              island experiences.
            </Text>
            <View style={styles.pageIndicators} accessibilityLabel="Onboarding page 1 of 1">
              <View style={styles.activeDot} />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onboardingNavigation.begin}
              style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
              <Text style={styles.startButtonText}>Get Started</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>
            <Text style={styles.footer}>A more meaningful way to explore</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1e2c1',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 14,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    marginBottom: 14,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#285944',
  },
  brandMarkText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  brandName: {
    color: '#26382f',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  brandCaption: {
    marginTop: 3,
    color: '#85877f',
    fontSize: 7,
    fontWeight: '600',
    letterSpacing: 1,
  },
  skipButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e1e2da',
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  skipText: {
    color: '#526158',
    fontSize: 11,
    fontWeight: '600',
  },
  photoFrame: {
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 20,
    backgroundColor: '#536b52',
  },
  photoShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(16, 31, 23, 0.14)',
  },
  photoLabel: {
    position: 'absolute',
    left: 13,
    bottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: 'rgba(20, 39, 30, 0.72)',
  },
  photoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e4c78f',
  },
  photoLabelText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  photoFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#536b52',
  },
  photoFallbackMark: {
    color: '#f0d39f',
    fontFamily: 'serif',
    fontSize: 25,
    fontWeight: '700',
  },
  photoFallbackText: {
    marginTop: 6,
    color: '#ffffff',
    fontSize: 11,
    textAlign: 'center',
  },
  welcomeCopy: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'flex-start',
    marginTop: 22,
  },
  photoCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 11,
  },
  captionRule: {
    width: 26,
    height: 1,
    backgroundColor: '#e7c997',
  },
  eyebrow: {
    color: '#a16b47',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.7,
  },
  welcomeTitle: {
    maxWidth: 360,
    color: '#26382f',
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  welcomeSubtitle: {
    maxWidth: 340,
    marginTop: 9,
    color: '#777d75',
    fontSize: 12,
    lineHeight: 19,
  },
  pageIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 17,
    marginBottom: 13,
  },
  activeDot: {
    width: 22,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#f0d39f',
  },
  startButton: {
    width: '100%',
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#285944',
    boxShadow: '0px 6px 14px rgba(40, 89, 68, 0.18)',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonArrow: {
    position: 'absolute',
    right: 18,
    color: '#ffffff',
    fontSize: 19,
  },
  footer: {
    alignSelf: 'center',
    marginTop: 11,
    color: '#85877f',
    fontSize: 9,
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.82,
  },
});

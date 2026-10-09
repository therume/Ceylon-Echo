import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { onboardingNavigation } from '@/navigation/app-navigation';
import { ParchmentBackground } from '@/components/parchment-background';

export default function WelcomePage() {
  const { user, isLoading, role, isRoleLoading, roleError, refreshUserRole } = useAuth();
  const {
    isReady: languageReady,
    hasSelectedLanguage,
    initializationError,
    retryInitialization,
    t,
  } = useLanguage();
  const { height } = useWindowDimensions();
  const [imageFailed, setImageFailed] = useState(false);
  const [roleRetryError, setRoleRetryError] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const lastTapTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!languageReady || isLoading) return;
    if (!hasSelectedLanguage) {
      router.replace('/language');
    } else if (user && !isRoleLoading && !roleError) {
      router.replace(role === 'admin' ? '/admin/attractions' : '/(tabs)/home');
    }
  }, [hasSelectedLanguage, isLoading, isRoleLoading, languageReady, roleError, role, user]);

  function handleTitleTap() {
    const now = Date.now();
    const nextTapCount =
      lastTapTimeRef.current !== null && now - lastTapTimeRef.current <= 1500
        ? tapCount + 1
        : 1;
    lastTapTimeRef.current = now;

    if (nextTapCount === 5) {
      setTapCount(0);
      lastTapTimeRef.current = null;
      router.push('/admin');
      return;
    }

    setTapCount(nextTapCount);
  }

  if (!languageReady) return null;

  if (initializationError) {
    return (
      <SafeAreaView style={styles.errorScreen}>
        <Text style={styles.errorText}>{initializationError}</Text>
        <Pressable accessibilityRole="button" onPress={retryInitialization}>
          <Text style={styles.retryText}>{t('languageRetry')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (user && roleError) {
    return (
      <SafeAreaView style={styles.errorScreen}>
        <Text style={styles.errorText}>
          {t('roleVerificationFailed')}: {roleRetryError ?? roleError}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isRoleLoading }}
          disabled={isRoleLoading}
          onPress={() => {
            setRoleRetryError(null);
            void refreshUserRole().catch((error: unknown) => {
              setRoleRetryError(
                error instanceof Error ? error.message : 'Could not verify your account role.',
              );
            });
          }}>
          <Text style={styles.retryText}>{t('languageRetry')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!hasSelectedLanguage || isLoading || isRoleLoading || user) return null;

  return (
    <View style={styles.screen}>
      {!imageFailed ? (
        <Image
          accessibilityLabel={t('sigiriyaImageDescription')}
          contentFit="cover"
          onError={() => setImageFailed(true)}
          source={require('../../assets/images/onboarding(8).jpg')}
          style={StyleSheet.absoluteFill}
          transition={500}
        />
      ) : null}
      <View style={styles.imageOverlay} />
      <ParchmentBackground opacity={0.1} washOpacity={0} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View entering={FadeIn.duration(650)} style={styles.topBar}>
          <Pressable
            accessibilityLabel="Ceylon Echo"
            accessibilityRole="button"
            hitSlop={20}
            onPress={handleTitleTap}>
            <View style={styles.brand}>
              <Text style={styles.brandName}>CEYLON ECHO</Text>
            </View>
          </Pressable>
        </Animated.View>

        <View style={styles.centerLogoContainer}>
          <Image
            accessibilityLabel="Ceylon Echo logo"
            contentFit="contain"
            source={require('../../assets/images/ce-logo.png')}
            style={styles.centerLogo}
          />
        </View>

        <Animated.View
          entering={FadeInUp.duration(700).delay(120)}
          style={[styles.welcomeCopy, { paddingBottom: Math.max(height * 0.045, 24) }]}>
          <View style={styles.photoCaption}>
            <View style={styles.captionRule} />
            <Text style={styles.eyebrow}>{t('islandOfStories')}</Text>
          </View>
          <Text style={styles.welcomeTitle}>{t('discoverSriLanka')}</Text>
          <Text style={styles.welcomeSubtitle}>{t('welcomeDescription')}</Text>
          <View style={styles.pageIndicators} accessibilityLabel={`${t('getStarted')} · 1 / 1`}>
            <View style={styles.activeDot} />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onboardingNavigation.begin}
            style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
            <Text style={styles.startButtonText}>{t('getStarted')}</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>
          <Text style={styles.footer}>{t('meaningfulExplore')}</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8f7f2',
  },
  errorText: {
    color: '#9b4d32',
    fontSize: 14,
    textAlign: 'center',
  },
  retryText: {
    marginTop: 16,
    color: '#285944',
    fontSize: 14,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#35473d',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12, 24, 19, 0.38)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingLeft: 4,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandName: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  centerLogoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  centerLogo: {
    width: 220,
    height: 220,
  },
  welcomeCopy: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'flex-start',
    marginTop: 'auto',
  },
  photoCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 14,
  },
  captionRule: {
    width: 26,
    height: 1,
    backgroundColor: '#e7c997',
  },
  eyebrow: {
    color: '#f0dfbd',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.7,
  },
  welcomeTitle: {
    maxWidth: 360,
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 42,
  },
  welcomeSubtitle: {
    maxWidth: 340,
    marginTop: 12,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 20,
  },
  pageIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    marginBottom: 16,
  },
  activeDot: {
    width: 22,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#f0d39f',
  },
  startButton: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#285944',
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
    marginTop: 12,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 9,
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.82,
  },
});

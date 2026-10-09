import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInUp, LinearTransition } from 'react-native-reanimated';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeritageBackground } from '@/components/heritage-background';
import { onboardingNavigation } from '@/navigation/app-navigation';
import { getSavedLanguage, saveLanguage } from '@/lib/language-preference';
import type { AppLanguage } from '@/lib/language-preference';

const languageOptions: { code: AppLanguage; label: string; flag: string; detail: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧', detail: 'Explore in English' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', detail: 'Explorer en français' },
  { code: 'ta', label: 'தமிழ்', flag: '🇱🇰', detail: 'இலங்கையை தமிழில் கண்டறியுங்கள்' },
];

export default function LanguageScreen() {
  const { height } = useWindowDimensions();
  const [selected, setSelected] = useState<AppLanguage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSavedLanguage()
      .then((language) => {
        if (active && language) {
          setSelected(language);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? `Could not load your saved language: ${loadError.message}`
              : 'Could not load your saved language.',
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function continueToApp() {
    if (isSaving || isLoading || !selected) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await saveLanguage(selected);
      onboardingNavigation.finish();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Your language could not be saved. Please try again. ${saveError.message}`
          : 'Your language could not be saved. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <HeritageBackground />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(500)} style={styles.brandRow}>
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
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(650).delay(80)}
          style={[styles.photoFrame, { height: Math.min(Math.max(height * 0.3, 170), 250) }]}>
          {!imageFailed ? (
            <Image
              accessibilityLabel="Sigiriya Rock Fortress above the Sri Lankan forest"
              contentFit="cover"
              onError={() => setImageFailed(true)}
              source={require('../../assets/images/Language(8).jpg')}
              style={StyleSheet.absoluteFill}
              transition={450}
            />
          ) : (
            <View style={styles.photoFallback}>
              <Text style={styles.photoFallbackMark}>CE</Text>
              <Text style={styles.photoFallbackText}>The island is waiting to be explored</Text>
            </View>
          )}
          <View style={styles.photoShade} />
          <View style={styles.photoLabel}>
            <View style={styles.photoDot} />
            <Text style={styles.photoLabelText}>SIGIRIYA · SRI LANKA</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(140)} style={styles.copy}>
          <Text style={styles.eyebrow}>MAKE IT YOUR JOURNEY</Text>
          <Text style={styles.title}>Choose your language</Text>
          <Text style={styles.subtitle}>
            Select your preferred language to continue.
          </Text>
        </Animated.View>

        <View style={styles.languageList}>
          {languageOptions.map((language, index) => {
            const isSelected = selected === language.code;
            return (
              <Animated.View
                key={language.label}
                layout={LinearTransition.springify().damping(18)}
                entering={FadeInUp.duration(400).delay(180 + index * 70)}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected, checked: isSelected }}
                  onPress={() => {
                    setSelected(language.code);
                    setError(null);
                  }}
                  style={({ pressed }) => [
                    styles.languageOption,
                    isSelected && styles.languageOptionSelected,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={styles.flag}>{language.flag}</Text>
                  <View style={styles.languageCopy}>
                    <Text style={[styles.languageText, isSelected && styles.languageTextSelected]}>
                      {language.label}
                    </Text>
                    <Text style={[styles.languageDetail, isSelected && styles.languageDetailSelected]}>
                      {language.detail}
                    </Text>
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading || isSaving || selected === null }}
          disabled={isLoading || isSaving || selected === null}
          onPress={() => void continueToApp()}
          style={({ pressed }) => [
            styles.continueButton,
            pressed && !isLoading && !isSaving && selected !== null && styles.pressed,
            (isLoading || isSaving || selected === null) && styles.continueDisabled,
          ]}>
          {isLoading || isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
          {!isLoading && !isSaving ? <Text style={styles.continueArrow}>→</Text> : null}
        </Pressable>
        <Text style={styles.footer}>You can change your language any time.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1e2c1',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 20,
  },
  brandRow: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    width: 37,
    height: 37,
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
    letterSpacing: 0.5,
  },
  brandName: {
    color: '#26382f',
    fontSize: 9,
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
  backButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e2da',
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },
  backText: {
    color: '#526158',
    fontSize: 10,
    fontWeight: '600',
  },
  photoFrame: {
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 17,
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
    paddingHorizontal: 10,
    paddingVertical: 7,
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
  copy: {
    marginTop: 22,
  },
  eyebrow: {
    color: '#a16b47',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.7,
  },
  title: {
    marginTop: 6,
    color: '#26382f',
    fontFamily: 'serif',
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: '#777d75',
    fontSize: 11,
    lineHeight: 17,
  },
  languageList: {
    gap: 9,
    marginTop: 18,
  },
  languageOption: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e6df',
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#26382f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.045,
    shadowRadius: 6,
    elevation: 1,
  },
  languageOptionSelected: {
    borderColor: '#547962',
    backgroundColor: '#edf3ee',
    shadowColor: '#285944',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 2,
  },
  flag: {
    width: 39,
    textAlign: 'center',
    fontSize: 25,
  },
  languageCopy: {
    flex: 1,
    marginLeft: 11,
  },
  languageText: {
    color: '#26382f',
    fontSize: 13,
    fontWeight: '700',
  },
  languageTextSelected: {
    color: '#285944',
  },
  languageDetail: {
    marginTop: 3,
    color: '#85877f',
    fontSize: 9,
  },
  languageDetailSelected: {
    color: '#5c7063',
  },
  radio: {
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#c8cec8',
    borderRadius: 10,
  },
  radioSelected: {
    borderColor: '#285944',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#285944',
  },
  error: {
    marginTop: 10,
    color: '#9b4d32',
    fontSize: 10,
    lineHeight: 15,
  },
  continueButton: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 17,
    borderRadius: 12,
    backgroundColor: '#285944',
  },
  continueDisabled: {
    opacity: 0.52,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  continueArrow: {
    position: 'absolute',
    right: 17,
    color: '#ffffff',
    fontSize: 18,
  },
  footer: {
    marginTop: 10,
    color: '#85877f',
    fontSize: 9,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});

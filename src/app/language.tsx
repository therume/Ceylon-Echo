import { useState } from 'react';
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

import { onboardingNavigation } from '@/navigation/app-navigation';
import { useLanguage } from '@/context/LanguageContext';
import type { AppLanguage } from '@/lib/language-preference';

const languageOptions: {
  code: AppLanguage;
  labelKey: 'languageNameEnglish' | 'languageNameFrench' | 'languageNameChinese';
  flag: string;
  detailKey: 'languageEnglishDetail' | 'languageFrenchDetail' | 'languageChineseDetail';
}[] = [
  { code: 'en', labelKey: 'languageNameEnglish', flag: '🇬🇧', detailKey: 'languageEnglishDetail' },
  { code: 'fr', labelKey: 'languageNameFrench', flag: '🇫🇷', detailKey: 'languageFrenchDetail' },
  { code: 'zh', labelKey: 'languageNameChinese', flag: '🇨🇳', detailKey: 'languageChineseDetail' },
];

export default function LanguageScreen() {
  const { height } = useWindowDimensions();
  const { language, isReady, initializationError, setLanguage, t, retryInitialization } =
    useLanguage();
  const [selected, setSelected] = useState<AppLanguage>(language);
  const [isSaving, setIsSaving] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoading = !isReady;

  async function continueToApp() {
    if (isSaving || isLoading || initializationError) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await setLanguage(selected);
      onboardingNavigation.finishLanguageSelection();
    } catch (saveError) {
      setError(saveError instanceof Error ? `${t('languageSaveError')} ${saveError.message}` : t('languageSaveError'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(500)} style={styles.brandRow}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Image
                accessibilityLabel="Ceylon Echo logo"
                contentFit="contain"
                source={require('../../assets/images/ce-logo.png')}
                style={styles.brandMarkImage}
              />
            </View>
            <View>
              <Text style={styles.brandName}>CEYLON ECHO</Text>
              <Text style={styles.brandCaption}>{t('journeyCaption')}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(650).delay(80)}
          style={[styles.photoFrame, { height: Math.min(Math.max(height * 0.3, 170), 250) }]}>
          {!imageFailed ? (
            <Image
              accessibilityLabel={t('sigiriyaImageDescription')}
              contentFit="cover"
              onError={() => setImageFailed(true)}
              source={require('../../assets/images/Language(8).jpg')}
              style={StyleSheet.absoluteFill}
              transition={450}
            />
          ) : (
            <View style={styles.photoFallback}>
              <View style={styles.photoFallbackLogo}>
                <Image
                  accessibilityLabel="Ceylon Echo logo"
                  contentFit="contain"
                  source={require('../../assets/images/ce-logo.png')}
                  style={styles.photoFallbackMarkImage}
                />
              </View>
              <Text style={styles.photoFallbackText}>{t('islandAwaits')}</Text>
            </View>
          )}
          <View style={styles.photoShade} />
          <View style={styles.photoLabel}>
            <View style={styles.photoDot} />
            <Text style={styles.photoLabelText}>{t('sigiriyaSriLanka')}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(140)} style={styles.copy}>
          <Text style={styles.eyebrow}>{t('languageEyebrow')}</Text>
          <Text style={styles.title}>{t('chooseLanguage')}</Text>
          <Text style={styles.subtitle}>{t('selectPreferredLanguage')}</Text>
        </Animated.View>

        <View style={styles.languageList}>
          {languageOptions.map((language, index) => {
            const isSelected = selected === language.code;
            return (
              <Animated.View
                key={language.code}
                layout={LinearTransition.springify().damping(18)}
                entering={FadeInUp.duration(400).delay(180 + index * 70)}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected, checked: isSelected }}
                  disabled={isSelecting || isSaving}
                  onPress={() => {
                    setSelected(language.code);
                    setIsSelecting(true);
                    setError(null);
                    void setLanguage(language.code)
                      .catch((saveError: unknown) => {
                        setError(
                          saveError instanceof Error
                            ? `${t('languageSaveError')} ${saveError.message}`
                            : t('languageSaveError'),
                        );
                      })
                      .finally(() => setIsSelecting(false));
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
                      {t(language.labelKey)}
                    </Text>
                    <Text style={[styles.languageDetail, isSelected && styles.languageDetailSelected]}>
                      {t(language.detailKey)}
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

        {initializationError ? (
          <View>
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {t('languageLoadError')} {initializationError}
            </Text>
            <Pressable accessibilityRole="button" onPress={retryInitialization}>
              <Text style={styles.backText}>{t('languageRetry')}</Text>
            </Pressable>
          </View>
        ) : null}

        {error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled: isLoading || isSaving || isSelecting || Boolean(initializationError),
          }}
          disabled={isLoading || isSaving || isSelecting || Boolean(initializationError)}
          onPress={() => void continueToApp()}
          style={({ pressed }) => [
            styles.continueButton,
            pressed && !isLoading && !isSaving && !isSelecting && styles.pressed,
            (isLoading || isSaving || isSelecting || Boolean(initializationError)) &&
              styles.continueDisabled,
          ]}>
          {isLoading || isSaving || isSelecting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.continueText}>{t('continue')}</Text>
          )}
          {!isLoading && !isSaving && !isSelecting ? (
            <Text style={styles.continueArrow}>→</Text>
          ) : null}
        </Pressable>
        <Text style={styles.footer}>{t('languageChangeAnytime')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f7f2',
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
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#285944',
    overflow: 'hidden',
  },
  brandMarkImage: {
    width: 31,
    height: 31,
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
  photoFallbackLogo: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(20, 39, 30, 0.72)',
    overflow: 'hidden',
  },
  photoFallbackMarkImage: {
    width: 48,
    height: 48,
  },
  photoFallbackText: {
    marginTop: 10,
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

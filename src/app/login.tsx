import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { onboardingNavigation } from '@/navigation/app-navigation';
import { getAuthErrorMessage } from '@/services/authService';

type SignInMode = 'user' | 'visitor';

export default function LoginScreen() {
  const { height } = useWindowDimensions();
  const {
    user,
    role,
    isRoleLoading,
    roleError,
    isFirebaseConfigured,
    authError,
    login,
    register,
    refreshUserRole,
  } = useAuth();
  const { hasSelectedLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [mode, setMode] = useState<SignInMode>('user');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const emailInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);
  const completedSignIn = useRef(false);
  const visibleMessage = message || roleError || authError;

  useEffect(() => {
    if (
      pathname === '/login' &&
      user &&
      !isBusy &&
      !isRoleLoading &&
      !roleError &&
      !completedSignIn.current
    ) {
      if (!hasSelectedLanguage) {
        onboardingNavigation.continueToLanguage();
      } else if (role === 'admin') {
        router.replace('/admin/attractions');
      } else {
        onboardingNavigation.finish();
      }
    }
  }, [hasSelectedLanguage, isBusy, isRoleLoading, pathname, roleError, role, user]);

  async function continueAfterAuthentication() {
    const currentRole = await refreshUserRole();
    completedSignIn.current = true;
    if (!hasSelectedLanguage) {
      onboardingNavigation.continueToLanguage();
    } else if (currentRole === 'admin') {
      router.replace('/admin/attractions');
    } else {
      onboardingNavigation.finish();
    }
  }

  async function handleSignIn() {
    if (mode === 'visitor') {
      if (hasSelectedLanguage) {
        onboardingNavigation.finish();
      } else {
        onboardingNavigation.continueToLanguage();
      }
      return;
    }

    if (!username.trim() || !password || (isRegistering && !name.trim())) {
      setMessage(
        isRegistering
          ? t('createAccountPrompt')
          : t('emailPasswordPrompt'),
      );
      return;
    }
    if (!isFirebaseConfigured) {
      setMessage(t('firebaseNotConfigured'));
      return;
    }

    Keyboard.dismiss();
    setIsBusy(true);
    setMessage('');
    try {
      if (isRegistering) {
        await register(name, username, password);
      } else {
        await login(username, password);
      }
      await continueAfterAuthentication();
    } catch (authError) {
      setMessage(getAuthErrorMessage(authError));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.brandHeader}>
              <View style={styles.brandHeaderLeft}>
                <Pressable
                  accessibilityLabel="Back to onboarding"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => router.replace('/')}
                  style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                  <Feather color="#285944" name="arrow-left" size={19} />
                </Pressable>
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
              </View>
              <View style={styles.islandTag}>
                <View style={styles.islandDot} />
                <Text style={styles.islandTagText}>{t('sriLanka')}</Text>
              </View>
            </View>

            <View
              style={[
                styles.hero,
                { height: Math.min(Math.max(height * 0.24, 170), 236) },
              ]}>
              {!imageFailed ? (
                <Image
                  accessibilityLabel={t('sigiriyaSriLanka')}
                  contentFit="cover"
                  onError={() => setImageFailed(true)}
                  source={require('../../assets/images/Language(8).jpg')}
                  style={StyleSheet.absoluteFill}
                  transition={450}
                />
              ) : (
                <View style={styles.imageFallback}>
                  <View style={styles.imageFallbackLogo}>
                    <Image
                      accessibilityLabel="Ceylon Echo logo"
                      contentFit="contain"
                      source={require('../../assets/images/ce-logo.png')}
                      style={styles.fallbackMarkImage}
                    />
                  </View>
                  <Text style={styles.fallbackCopy}>{t('islandAwaits')}</Text>
                </View>
              )}
              <View pointerEvents="none" style={styles.heroShade} />
              <View style={styles.heroCopy}>
                <View style={styles.locationPill}>
                  <Feather color="#f0d39f" name="map-pin" size={12} />
                  <Text style={styles.locationText}>{t('sigiriyaSriLanka')}</Text>
                </View>
                <Text style={styles.heroTitle}>{t('islandCalling')}</Text>
                <Text style={styles.heroSubtitle}>{t('findWonder')}</Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <View style={styles.formHeading}>
                <Text style={styles.eyebrow}>
                  {mode === 'visitor' ? t('exploreAtYourPace') : t('welcomeToCeylonEcho')}
                </Text>
                <Text style={styles.title}>
                  {mode === 'visitor'
                    ? t('exploreAsVisitor')
                    : isRegistering
                      ? t('createAccount')
                      : t('welcomeBack')}
                </Text>
                <Text style={styles.subtitle}>
                  {mode === 'visitor'
                    ? t('visitorDescription')
                    : isRegistering
                      ? t('createAccountDescription')
                      : t('signInDescription')}
                </Text>
              </View>

              <View style={styles.modeSelector} accessibilityRole="tablist">
                <ModeButton
                  disabled={isBusy}
                  label={t('userSignIn')}
                  selected={mode === 'user'}
                  onPress={() => {
                    setMode('user');
                    setIsRegistering(false);
                    setMessage('');
                  }}
                />
                <ModeButton
                  disabled={isBusy}
                  label={t('visitor')}
                  selected={mode === 'visitor'}
                  onPress={() => {
                    setMode('visitor');
                    setIsRegistering(false);
                    setMessage('');
                  }}
                />
              </View>

              {mode === 'visitor' ? (
                <View style={styles.visitorNote}>
                  <Feather color="#56715f" name="compass" size={18} />
                  <Text style={styles.visitorMessage}>
                    {t('visitorNote')}
                  </Text>
                </View>
              ) : (
                <View style={styles.fields}>
                  {isRegistering ? (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>{t('name')}</Text>
                      <View style={styles.inputShell}>
                        <Feather
                          accessible={false}
                          color="#78847b"
                          name="user"
                          size={17}
                        />
                        <TextInput
                          accessibilityLabel={t('name')}
                          autoCapitalize="words"
                          editable={!isBusy}
                          onChangeText={(value) => {
                            setName(value);
                            setMessage('');
                          }}
                          onSubmitEditing={() => emailInput.current?.focus()}
                          placeholder={t('yourName')}
                          placeholderTextColor="#9a9e95"
                          returnKeyType="next"
                          style={styles.input}
                          textContentType="name"
                          value={name}
                        />
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('emailAddress')}</Text>
                    <View style={styles.inputShell}>
                      <Feather
                        accessible={false}
                        color="#78847b"
                        name="mail"
                        size={17}
                      />
                      <TextInput
                        ref={emailInput}
                        accessibilityLabel={t('emailAddress')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isBusy}
                        keyboardType="email-address"
                        onChangeText={(value) => {
                          setUsername(value);
                          setMessage('');
                        }}
                        onSubmitEditing={() => passwordInput.current?.focus()}
                        placeholder="you@example.com"
                        placeholderTextColor="#9a9e95"
                        returnKeyType="next"
                        style={styles.input}
                        textContentType="emailAddress"
                        value={username}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('password')}</Text>
                    <View style={styles.inputShell}>
                      <Feather
                        accessible={false}
                        color="#78847b"
                        name="lock"
                        size={17}
                      />
                      <TextInput
                        ref={passwordInput}
                        accessibilityLabel={t('password')}
                        autoCapitalize="none"
                        editable={!isBusy}
                        onChangeText={(value) => {
                          setPassword(value);
                          setMessage('');
                        }}
                        onSubmitEditing={() => void handleSignIn()}
                        placeholder={t('enterPassword')}
                        placeholderTextColor="#9a9e95"
                        returnKeyType="go"
                        secureTextEntry={!isPasswordVisible}
                        style={styles.input}
                        textContentType={isRegistering ? 'newPassword' : 'password'}
                        value={password}
                      />
                      <Pressable
                        accessibilityLabel={isPasswordVisible ? t('hidePassword') : t('showPassword')}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: isBusy }}
                        disabled={isBusy}
                        hitSlop={8}
                        onPress={() => setIsPasswordVisible((visible) => !visible)}
                        style={styles.visibilityButton}>
                        <Feather
                          color="#78847b"
                          name={isPasswordVisible ? 'eye-off' : 'eye'}
                          size={18}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}

              {visibleMessage ? (
                <View style={styles.messageBox}>
                  <Feather color="#a14434" name="alert-circle" size={16} />
                  <Text accessibilityLiveRegion="polite" style={styles.message}>
                    {visibleMessage}
                  </Text>
                </View>
              ) : null}
              {user && roleError ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={isRoleLoading}
                  onPress={() =>
                    void refreshUserRole().catch((retryError: unknown) => {
                      setMessage(getAuthErrorMessage(retryError));
                    })
                  }
                  style={({ pressed }) => [pressed && styles.pressed]}>
                  <Text style={styles.switchModeAction}>
                    {isRoleLoading ? t('loading') : t('languageRetry')}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isBusy }}
                disabled={isBusy}
                onPress={() => void handleSignIn()}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && !isBusy && styles.pressed,
                  isBusy && styles.disabled,
                ]}>
                {isBusy ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : null}
                <Text style={styles.submitText}>
                  {mode === 'visitor'
                    ? t('continueAsVisitor')
                    : isBusy
                      ? isRegistering
                        ? t('creatingAccount')
                        : t('signingIn')
                      : isRegistering
                        ? t('createAccountAction')
                        : t('signIn')}
                </Text>
                {!isBusy ? (
                  <Feather
                    color="#ffffff"
                    name={mode === 'visitor' ? 'arrow-right' : 'arrow-up-right'}
                    size={17}
                    style={styles.submitIcon}
                  />
                ) : null}
              </Pressable>

              {mode === 'user' ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={isBusy}
                  onPress={() => {
                    setIsRegistering((current) => !current);
                    setMessage('');
                  }}
                  style={styles.switchMode}>
                  <Text style={styles.switchModePrompt}>
                    {isRegistering ? t('haveAccount') : t('noAccount')}
                  </Text>
                  <Text style={styles.switchModeAction}>
                    {isRegistering ? t('signIn') : t('createAccountAction')}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.footer}>
              <Feather color="#a9956d" name="sun" size={13} />
              <Text style={styles.footerText}>{t('journeyStartsHere')}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ModeButton({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        selected && styles.modeButtonSelected,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.modeText, selected && styles.modeTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f6ef',
  },
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  content: {
    width: '100%',
    maxWidth: 460,
  },
  brandHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e7e0d2',
    borderRadius: 17,
    backgroundColor: '#fcfbf7',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 41,
    height: 41,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d5c7a8',
    borderRadius: 13,
    backgroundColor: '#285944',
    overflow: 'hidden',
  },
  brandMarkImage: {
    width: 32,
    height: 32,
  },
  brandName: {
    color: '#294e3e',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  brandCaption: {
    marginTop: 3,
    color: '#938d7e',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1.15,
  },
  islandTag: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e7e0d2',
    borderRadius: 16,
    backgroundColor: '#fcfbf7',
  },
  islandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#b69b65',
  },
  islandTagText: {
    color: '#777267',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#496552',
  },
  imageFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#496552',
  },
  imageFallbackLogo: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(28, 58, 45, 0.8)',
    overflow: 'hidden',
  },
  fallbackMarkImage: {
    width: 56,
    height: 56,
  },
  fallbackCopy: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 12,
  },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 31, 23, 0.28)',
  },
  heroCopy: {
    position: 'absolute',
    right: 20,
    bottom: 18,
    left: 20,
    alignItems: 'flex-start',
  },
  locationPill: {
    minHeight: 27,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    borderRadius: 14,
    backgroundColor: 'rgba(20, 39, 29, 0.45)',
  },
  locationText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  heroTitle: {
    marginTop: 10,
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 25,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  heroSubtitle: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.87)',
    fontSize: 11,
  },
  formCard: {
    marginTop: 17,
    paddingHorizontal: 20,
    paddingTop: 21,
    paddingBottom: 13,
    borderWidth: 1,
    borderColor: '#ece8df',
    borderRadius: 22,
    backgroundColor: '#ffffff',
    boxShadow: '0px 7px 18px rgba(44, 64, 51, 0.07)',
  },
  formHeading: {
    marginBottom: 17,
  },
  eyebrow: {
    color: '#a28d62',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.55,
  },
  title: {
    marginTop: 6,
    color: '#26382f',
    fontFamily: 'serif',
    fontSize: 25,
    fontWeight: '600',
    lineHeight: 31,
  },
  subtitle: {
    marginTop: 5,
    color: '#777d75',
    fontSize: 12,
    lineHeight: 18,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 17,
    padding: 4,
    borderRadius: 13,
    backgroundColor: '#f2f0e9',
  },
  modeButton: {
    minHeight: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  modeButtonSelected: {
    backgroundColor: '#285944',
    boxShadow: '0px 2px 5px rgba(23, 61, 44, 0.15)',
  },
  modeText: {
    color: '#777267',
    fontSize: 11,
    fontWeight: '600',
  },
  modeTextSelected: {
    color: '#ffffff',
  },
  fields: {
    gap: 13,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: '#414b43',
    fontSize: 11,
    fontWeight: '700',
  },
  inputShell: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e6e5dd',
    borderRadius: 13,
    backgroundColor: '#fdfdfa',
  },
  input: {
    minHeight: 50,
    flex: 1,
    paddingVertical: 0,
    color: '#26382f',
    fontSize: 13,
  },
  visibilityButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitorNote: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    marginBottom: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e6ebe4',
    borderRadius: 13,
    backgroundColor: '#f4f7f2',
  },
  visitorMessage: {
    flex: 1,
    color: '#626f65',
    fontSize: 11,
    lineHeight: 17,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 13,
    padding: 11,
    borderWidth: 1,
    borderColor: '#f0d7cf',
    borderRadius: 11,
    backgroundColor: '#fff7f4',
  },
  message: {
    flex: 1,
    color: '#9b4434',
    fontSize: 11,
    lineHeight: 16,
  },
  submitButton: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 17,
    borderRadius: 14,
    backgroundColor: '#285944',
    boxShadow: '0px 4px 8px rgba(35, 75, 55, 0.18)',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  submitIcon: {
    position: 'absolute',
    right: 17,
  },
  disabled: {
    opacity: 0.76,
  },
  pressed: {
    opacity: 0.82,
  },
  switchMode: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  switchModePrompt: {
    color: '#777d75',
    fontSize: 11,
  },
  switchModeAction: {
    color: '#285944',
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 16,
  },
  footerText: {
    color: '#928d81',
    fontSize: 10,
    letterSpacing: 0.1,
  },
});

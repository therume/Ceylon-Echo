import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import {
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
import { onboardingNavigation } from '@/navigation/app-navigation';
import { getAuthErrorMessage } from '@/services/authService';

type SignInMode = 'user' | 'visitor';

export default function LoginScreen() {
  const { height } = useWindowDimensions();
  const { user, isFirebaseConfigured, authError, login, register } = useAuth();
  const [mode, setMode] = useState<SignInMode>('user');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const completedSignIn = useRef(false);

  useEffect(() => {
    if (user && !isBusy && !completedSignIn.current) {
      onboardingNavigation.finish();
    }
  }, [isBusy, user]);

  async function handleSignIn() {
    if (mode === 'visitor') {
      onboardingNavigation.continueToLanguage();
      return;
    }

    if (!username.trim() || !password || (isRegistering && !name.trim())) {
      setMessage(
        isRegistering
          ? 'Enter your name, email and password to create an account.'
          : 'Enter your email and password to continue.',
      );
      return;
    }
    if (!isFirebaseConfigured) {
      setMessage('Firebase is not configured. Add the project settings to .env and restart Expo.');
      return;
    }

    setIsBusy(true);
    setMessage('');
    try {
      if (isRegistering) {
        await register(name, username, password);
      } else {
        await login(username, password);
      }
      completedSignIn.current = true;
      onboardingNavigation.continueToLanguage();
    } catch (authError) {
      setMessage(getAuthErrorMessage(authError));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(height * 0.07, 44) },
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>CE</Text>
              </View>
              <View>
                <Text style={styles.brandName}>CEYLON ECHO</Text>
                <Text style={styles.brandCaption}>A SRI LANKAN JOURNEY</Text>
              </View>
            </View>
            <Text style={[styles.title, { marginBottom: Math.max(height * 0.035, 18) }]}>
              Access Portal
            </Text>

            <View style={[styles.imageRow, { height: Math.min(Math.max(height * 0.17, 132), 172) }]}>
              <Image
                accessibilityLabel="Sri Lankan stilt fishermen at sunset"
                contentFit="cover"
                source={require('../../assets/images/stilt-fishermen.png')}
                style={[styles.photoPlaceholder, styles.firstPhoto]}
                transition={250}
              />
              <Image
                accessibilityLabel="Sri Lankan coastline and fishing boats"
                contentFit="cover"
                source={require('../../assets/images/sri-lanka-coast.png')}
                style={[styles.photoPlaceholder, styles.secondPhoto]}
                transition={250}
              />
            </View>

            <View
              style={[
                styles.modeSelector,
                { marginTop: Math.max(height * 0.018, 10) },
              ]}>
              <ModeButton
                label="User Sign-in"
                selected={mode === 'user'}
                onPress={() => {
                  setMode('user');
                  setIsRegistering(false);
                  setMessage('');
                }}
              />
              <ModeButton
                label="Visitor Sign-in"
                selected={mode === 'visitor'}
                onPress={() => {
                  setMode('visitor');
                  setIsRegistering(false);
                  setMessage('');
                }}
              />
            </View>

            <View style={[styles.form, { marginTop: Math.max(height * 0.05, 28) }]}>
              {mode === 'visitor' ? (
                <Text style={styles.visitorMessage}>
                  Continue as a visitor to explore public attractions. Sign in to save places or
                  manage your profile.
                </Text>
              ) : (
                <>
                  {isRegistering ? (
                    <>
                      <Text style={styles.label}>Name</Text>
                      <TextInput
                        accessibilityLabel="Name"
                        autoCapitalize="words"
                        onChangeText={(value) => {
                          setName(value);
                          setMessage('');
                        }}
                        placeholder="Enter your name"
                        placeholderTextColor="#aaa69e"
                        returnKeyType="next"
                        style={styles.input}
                        textContentType="name"
                        value={name}
                      />
                    </>
                  ) : null}

                  <Text style={[styles.label, isRegistering && styles.passwordLabel]}>Email</Text>
                  <TextInput
                    accessibilityLabel="Email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={(value) => {
                      setUsername(value);
                      setMessage('');
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#aaa69e"
                    returnKeyType="next"
                    style={styles.input}
                    textContentType="emailAddress"
                    value={username}
                  />

                  <Text style={[styles.label, styles.passwordLabel]}>Password</Text>
                  <TextInput
                    accessibilityLabel="Password"
                    autoCapitalize="none"
                    onChangeText={(value) => {
                      setPassword(value);
                      setMessage('');
                    }}
                    onSubmitEditing={() => void handleSignIn()}
                    placeholder="••••••••"
                    placeholderTextColor="#aaa69e"
                    returnKeyType="go"
                    secureTextEntry
                    style={styles.input}
                    textContentType={isRegistering ? 'newPassword' : 'password'}
                    value={password}
                  />
                </>
              )}

              {message || authError ? (
                <Text accessibilityLiveRegion="polite" style={styles.message}>
                  {message ?? authError}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isBusy }}
                disabled={isBusy}
                onPress={() => void handleSignIn()}
                style={({ pressed }) => [
                  styles.submitButton,
                  { marginTop: 'auto' },
                  pressed && !isBusy && styles.pressed,
                  isBusy && styles.disabled,
                ]}>
                <Text style={styles.submitText}>
                  {mode === 'visitor'
                    ? 'Continue as a Visitor'
                    : isBusy
                      ? isRegistering
                        ? 'Creating account…'
                        : 'Signing in…'
                      : isRegistering
                        ? 'Create Account'
                        : 'Sign in Securely'}
                </Text>
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
                  <Text style={styles.switchModeText}>
                    {isRegistering ? 'Already have an account? Sign in' : 'New here? Create account'}
                  </Text>
                </Pressable>
              ) : null}

              <Text style={styles.footer}>
                Your journey through Sri Lanka starts here.
              </Text>
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
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        selected && styles.modeButtonSelected,
        pressed && styles.pressed,
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
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  content: {
    width: '100%',
    flexGrow: 1,
    maxWidth: 480,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
    marginBottom: 19,
  },
  brandMark: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#285944',
  },
  brandMarkText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  brandName: {
    color: '#26382f',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  brandCaption: {
    marginTop: 4,
    color: '#85877f',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  title: {
    color: '#26382f',
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 9,
    overflow: 'hidden',
    borderRadius: 16,
  },
  photoPlaceholder: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  firstPhoto: { backgroundColor: '#e7e3d9' },
  secondPhoto: { backgroundColor: '#e2e5df' },
  modeSelector: {
    flexDirection: 'row',
    gap: 7,
    padding: 5,
    borderRadius: 13,
    backgroundColor: '#eeece4',
  },
  modeButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  modeButtonSelected: {
    backgroundColor: '#285944',
  },
  modeText: {
    color: '#777d75',
    fontSize: 12,
    fontWeight: '600',
  },
  modeTextSelected: {
    color: '#ffffff',
  },
  form: {
    flexGrow: 1,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e8e7df',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#26382f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  label: {
    marginBottom: 4,
    color: '#45433d',
    fontSize: 12,
    fontWeight: '700',
  },
  passwordLabel: {
    marginTop: 10,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#e3e4dc',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#383731',
    backgroundColor: '#ffffff',
    fontSize: 13,
  },
  message: {
    marginTop: 8,
    color: '#9b4d32',
    fontSize: 10,
    lineHeight: 15,
  },
  visitorMessage: {
    marginTop: 4,
    color: '#777267',
    fontSize: 11,
    lineHeight: 17,
  },
  submitButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#285944',
  },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    opacity: 0.82,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  switchMode: {
    alignItems: 'center',
    paddingVertical: 9,
  },
  switchModeText: {
    color: '#285944',
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    marginTop: 7,
    color: '#969187',
    fontSize: 8,
    textAlign: 'center',
  },
});

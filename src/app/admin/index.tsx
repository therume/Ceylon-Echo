import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { useAdminAuth } from '@/features/admin/admin-auth';
import { AdminButton, AdminField, AdminScreen, adminColors } from '@/features/admin/admin-ui';

export default function AdminLoginScreen() {
  const { user, isAdmin, isFirebaseConfigured, error: authError, signIn, signOutAdmin } =
    useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Add the project settings to .env.local first.');
      return;
    }

    setError(null);
    setIsSigningIn(true);
    try {
      await signIn(email, password);
      router.replace('/admin/attractions');
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Could not sign in.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOutAdmin();
    } catch (signOutError) {
      setError(
        signOutError instanceof Error ? signOutError.message : 'Could not sign out. Please retry.',
      );
    }
  }

  return (
    <AdminScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.brandName}>Ceylon Echo</Text>
          <Text style={styles.brandCaption}>Staff & Curator Portal</Text>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>CE</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Admin Login</Text>
          {user && !isAdmin ? (
            <>
              <Text style={styles.error}>
                {authError ??
                  'This account is signed in but does not have admin access. Contact your Firebase project owner.'}
              </Text>
              <AdminButton
                label="Sign out"
                onPress={() => void handleSignOut()}
                style={styles.loginButton}
              />
            </>
          ) : (
            <>
              <AdminField
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                label="Email"
                onChangeText={setEmail}
                placeholder="admin@example.com"
                value={email}
              />
              <AdminField
                autoCapitalize="none"
                label="Password"
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
              />
              {!isFirebaseConfigured ? (
                <Text style={styles.info}>
                  Connect a Firebase project by adding its Expo public settings to .env.local.
                </Text>
              ) : null}
              {error || authError ? <Text style={styles.error}>{error ?? authError}</Text> : null}
              <AdminButton
                disabled={isSigningIn}
                label={isSigningIn ? 'Signing in…' : 'Login'}
                onPress={() => void handleLogin()}
                style={styles.loginButton}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandName: {
    color: adminColors.green,
    fontFamily: 'serif',
    fontSize: 29,
    fontWeight: '700',
  },
  brandCaption: {
    marginTop: 2,
    color: adminColors.muted,
    fontSize: 11,
  },
  brandMark: {
    width: 58,
    height: 58,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: adminColors.green,
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontFamily: 'serif',
    fontSize: 17,
    fontWeight: '700',
  },
  card: {
    gap: 17,
    padding: 22,
    borderRadius: 17,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.line,
    shadowColor: adminColors.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  title: {
    marginBottom: 1,
    color: adminColors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  error: {
    color: adminColors.rust,
    fontSize: 13,
  },
  info: {
    color: adminColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  loginButton: {
    marginTop: 1,
  },
});

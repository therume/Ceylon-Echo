import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthGate } from '@/components/auth-gate';
import { HeritageBackground } from '@/components/heritage-background';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/userService';

const interests = [
  { id: 'heritage', title: 'Ancient heritage', detail: 'Temples, ruins and stories' },
  { id: 'nature', title: 'Nature & wildlife', detail: 'Wild places and local wildlife' },
  { id: 'food', title: 'Food & culture', detail: 'Local flavours and traditions' },
  { id: 'coast', title: 'Coast & beaches', detail: 'Sea views and island escapes' },
];

export default function PreferencesScreen() {
  return (
    <AuthGate>
      <AuthenticatedPreferencesScreen />
    </AuthGate>
  );
}

function AuthenticatedPreferencesScreen() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>(['heritage', 'nature']);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      return () => {
        active = false;
      };
    }

    getUserProfile(user.uid)
      .then((profile) => {
        if (active && profile?.interests.length) {
          setSelected(profile.interests);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load preferences.');
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
  }, [user]);

  function toggleInterest(id: string) {
    setError(null);
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function savePreferences() {
    if (!user) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await updateUserProfile(user.uid, { interests: selected });
      router.replace('/(tabs)/home');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save preferences.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeritageBackground />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.mark}>
            <Text style={styles.markText}>CE</Text>
          </View>
          <Text style={styles.step}>A LITTLE ABOUT YOU · 2 OF 2</Text>
        </View>
        <Text style={styles.title}>What do you love to explore?</Text>
        <Text style={styles.subtitle}>Pick a few interests to personalize your journey.</Text>

        {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        {isLoading ? <Text style={styles.loading}>Loading your preferences…</Text> : null}
        <View style={styles.options}>
          {interests.map((interest) => {
            const active = selected.includes(interest.id);
            return (
              <Pressable
                key={interest.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                disabled={isLoading || isSaving}
                onPress={() => toggleInterest(interest.id)}
                style={({ pressed }) => [
                  styles.option,
                  active && styles.optionActive,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>{interest.title.slice(0, 1)}</Text>
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{interest.title}</Text>
                  <Text style={styles.optionDetail}>{interest.detail}</Text>
                </View>
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            You can always change your preferences later.
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving || isLoading}
            onPress={() => void savePreferences()}
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
            <Text style={styles.continueText}>
              {isSaving ? 'Saving…' : 'Save & Explore Sri Lanka'}
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.skip}>Skip for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1e2c1',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  mark: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#285944',
  },
  markText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: '700',
  },
  step: {
    color: '#85877f',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    maxWidth: 290,
    color: '#26382f',
    fontFamily: 'serif',
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 32,
  },
  subtitle: {
    marginTop: 8,
    color: '#777d75',
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    marginTop: 12,
    color: '#9b4d32',
    fontSize: 11,
    lineHeight: 16,
  },
  loading: {
    marginTop: 14,
    color: '#777d75',
    fontSize: 10,
  },
  options: {
    gap: 10,
    marginTop: 26,
  },
  option: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7e7df',
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  optionActive: {
    borderColor: '#a9c1b2',
    backgroundColor: '#f1f6f2',
  },
  optionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#e7efe8',
  },
  optionIconText: {
    color: '#285944',
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700',
  },
  optionCopy: {
    flex: 1,
    marginLeft: 11,
  },
  optionTitle: {
    color: '#26382f',
    fontSize: 12,
    fontWeight: '700',
  },
  optionDetail: {
    marginTop: 4,
    color: '#777d75',
    fontSize: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ced4cc',
    borderRadius: 6,
  },
  checkboxActive: {
    borderColor: '#285944',
    backgroundColor: '#285944',
  },
  check: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
  },
  footerNote: {
    marginBottom: 10,
    color: '#777d75',
    fontSize: 10,
    textAlign: 'center',
  },
  continueButton: {
    minHeight: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#285944',
  },
  continueText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  skip: {
    marginTop: 14,
    color: '#777d75',
    fontSize: 11,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});

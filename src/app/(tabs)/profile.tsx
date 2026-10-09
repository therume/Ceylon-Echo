import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuthGate } from '@/components/auth-gate';
import { DataMessage } from '@/components/data-message';
import {
  DetailRow,
  ScreenFrame,
  SectionHeading,
  TravelColors,
} from '@/components/travel-ui';
import { useAuth } from '@/context/AuthContext';
import type { Attraction } from '@/services/attractionService';
import { getAttractionsByIds } from '@/services/attractionService';
import { getSavedAttractionIds, getUserProfile, updateUserProfile } from '@/services/userService';
import type { UserProfile } from '@/services/userService';
import { safeFileName, uploadMedia } from '@/features/admin/upload-media';

export default function ProfileScreen() {
  return (
    <AuthGate>
      <AuthenticatedProfileScreen />
    </AuthGate>
  );
}

function AuthenticatedProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedAttractions, setSavedAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectingPhoto, setIsSelectingPhoto] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [failedImageUri, setFailedImageUri] = useState<string | null>(null);
  const userId = user?.uid;

  useEffect(() => {
    let active = true;
    if (!userId) {
      return () => {
        active = false;
      };
    }
    const uid = userId;

    async function loadProfile() {
      try {
        const [nextProfile, savedIds] = await Promise.all([
          getUserProfile(uid),
          getSavedAttractionIds(uid),
        ]);
        const attractions = await getAttractionsByIds(savedIds);
        if (active) {
          setProfile(nextProfile);
          setSavedAttractions(attractions);
        }
      } catch {
        if (active) {
          setError('We couldn’t load your profile. Check your connection and try again.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [userId]);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError(null);
    try {
      await logout();
      router.replace('/login');
    } catch {
      setError('We couldn’t sign you out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  }

  function startEditing() {
    setEditedName(profile?.name || user?.displayName || '');
    setPendingPhoto(null);
    setError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setPendingPhoto(null);
    setEditedName('');
    setError(null);
    setIsEditing(false);
  }

  async function selectProfilePhoto() {
    if (isSelectingPhoto || isSaving) {
      return;
    }

    setIsSelectingPhoto(true);
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPendingPhoto(result.assets[0]);
        if (!isEditing) {
          setEditedName(profile?.name || user?.displayName || '');
          setIsEditing(true);
        }
      }
    } catch {
      setError('We couldn’t open your photo library. Please try again.');
    } finally {
      setIsSelectingPhoto(false);
    }
  }

  async function saveProfile() {
    if (!user || isSaving) {
      return;
    }
    const nameToSave = editedName.trim();
    if (!nameToSave) {
      setError('Please enter your name before saving.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      let imageUrl = profile?.profileImage ?? user.photoURL ?? null;
      if (pendingPhoto) {
        const fileName = safeFileName(pendingPhoto.fileName ?? 'profile-image.jpg');
        const contentType = pendingPhoto.mimeType ?? 'image/jpeg';
        if (!/^image\/(jpeg|jpg|png|webp|heic|heif)$/i.test(contentType)) {
          setError('Choose a JPG, PNG, WebP, or HEIC image for your profile photo.');
          return;
        }
        const uploaded = await uploadMedia(
          pendingPhoto.uri,
          fileName,
          contentType,
          `users/${user.uid}/profile/profile-image`,
        );
        imageUrl = uploaded.url;
      }

      await updateUserProfile(user.uid, {
        name: nameToSave,
        ...(pendingPhoto ? { profileImage: imageUrl } : {}),
      });

      setProfile((current) => ({
        name: nameToSave,
        email: current?.email ?? user.email ?? '',
        profileImage: imageUrl,
        interests: current?.interests ?? [],
        createdAt: current?.createdAt ?? null,
        role: current?.role ?? 'user',
      }));
      setFailedImageUri(null);
      setPendingPhoto(null);
      setIsEditing(false);
      setEditedName('');
    } catch {
      setError(
        pendingPhoto
          ? 'We couldn’t save your profile changes or photo. Check your connection and try again.'
          : 'We couldn’t save your profile changes. Check your connection and try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  const email = profile?.email ?? user?.email ?? '';
  const name = profile?.name || user?.displayName || email.split('@')[0] || 'Traveller';
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const memberYear =
    profile?.createdAt?.toDate().getFullYear() ??
    (user?.metadata.creationTime ? new Date(user.metadata.creationTime).getFullYear() : null);
  const profileImage = pendingPhoto?.uri ?? profile?.profileImage ?? user?.photoURL ?? null;
  const showProfileImage = profileImage !== null && failedImageUri !== profileImage;

  return (
    <ScreenFrame title="Your Profile" subtitle="Your saved discoveries, all in one place.">
      {isLoading ? <DataMessage isLoading message="Loading your profile…" /> : null}
      {error ? <DataMessage isError message={error} /> : null}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {showProfileImage ? (
              <Image
                accessibilityLabel={`${name}'s profile photo`}
                contentFit="cover"
                onError={() => setFailedImageUri(profileImage)}
                source={{ uri: profileImage ?? '' }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            disabled={isSelectingPhoto || isSaving || isLoading}
            onPress={() => void selectProfilePhoto()}
            style={({ pressed }) => [
              styles.photoEditButton,
              pressed && styles.pressed,
              (isSelectingPhoto || isSaving || isLoading) && styles.disabled,
            ]}>
            {isSelectingPhoto ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.photoEditIcon}>📷</Text>
            )}
          </Pressable>
        </View>
        <View style={styles.profileCopy}>
          {isEditing ? (
            <TextInput
              accessibilityLabel="Profile name"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isSaving}
              maxLength={100}
              onChangeText={setEditedName}
              placeholder="Your name"
              placeholderTextColor={TravelColors.muted}
              returnKeyType="done"
              style={styles.nameInput}
              value={editedName}
            />
          ) : (
            <Text style={styles.name}>{name}</Text>
          )}
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.member}>
            {memberYear ? `Explorer since ${memberYear}` : 'Ceylon Echo explorer'}
          </Text>
        </View>
      </View>
      {isEditing ? (
        <View style={styles.editActions}>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={cancelEditing}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.pressed,
              isSaving && styles.disabled,
            ]}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving || isSelectingPhoto}
            onPress={() => void saveProfile()}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && !isSaving && styles.pressed,
              (isSaving || isSelectingPhoto) && styles.disabled,
            ]}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <SectionHeading title="Account" />
      <View style={styles.accountCard}>
        <ProfileActionRow
          icon="user"
          title="Edit Profile"
          subtitle="Update your name and profile photo"
          disabled={isLoading || isSaving}
          onPress={startEditing}
        />
        <ProfileActionRow
          icon="globe"
          title="Language"
          subtitle="Choose your preferred language"
          onPress={() => router.push('/language')}
        />
        <ProfileActionRow
          icon="settings"
          title="Settings"
          subtitle="Manage your travel interests"
          onPress={() => router.push('/preferences')}
        />
        <ProfileActionRow
          icon="log-out"
          title={isSigningOut ? 'Signing out…' : 'Logout'}
          subtitle="Sign out of your Ceylon Echo account"
          destructive
          disabled={isSigningOut}
          onPress={() => void handleSignOut()}
          isLoading={isSigningOut}
          isLast
        />
      </View>

      <SectionHeading
        title="Your Saved Places"
        action="See all"
        onPress={() => router.push('/(tabs)/bookmarks')}
      />
      {savedAttractions.length ? (
        savedAttractions.slice(0, 3).map((item) => (
          <DetailRow
            key={item.id}
            icon="⌑"
            title={item.name}
            subtitle={`${item.location} · ${item.category}`}
            trailing="›"
            onPress={() =>
              router.push({ pathname: '/(tabs)/attraction', params: { id: item.id } })
            }
          />
        ))
      ) : (
        <Text style={styles.emptyNote}>Your saved attractions will appear here.</Text>
      )}

      <SectionHeading
        title="Audio Guides"
        action="Downloads"
        onPress={() => router.push('/(tabs)/downloads')}
      />
      <DetailRow
        icon="♫"
        title="Browse available audio guides"
        subtitle="Open an attraction to see its audio guide."
        trailing="›"
        onPress={() => router.push('/(tabs)/explore')}
      />

    </ScreenFrame>
  );
}

function ProfileActionRow({
  icon,
  title,
  subtitle,
  onPress,
  disabled = false,
  destructive = false,
  isLoading = false,
  isLast = false,
}: {
  icon: 'user' | 'globe' | 'settings' | 'log-out';
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  isLoading?: boolean;
  isLast?: boolean;
}) {
  const color = destructive ? TravelColors.orange : TravelColors.green;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.accountRow,
        !isLast && styles.accountRowDivider,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <View style={[styles.accountIcon, destructive && styles.accountIconDestructive]}>
        {isLoading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Feather color={color} name={icon} size={16} />
        )}
      </View>
      <View style={styles.accountCopy}>
        <Text style={[styles.accountTitle, destructive && styles.accountTitleDestructive]}>
          {title}
        </Text>
        <Text style={styles.accountSubtitle}>{subtitle}</Text>
      </View>
      {!isLoading ? <Feather color="#9aa199" name="chevron-right" size={17} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 13,
    backgroundColor: TravelColors.surface,
  },
  avatarWrap: {
    position: 'relative',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    borderRadius: 36,
    backgroundColor: TravelColors.green,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: { color: '#ffffff', fontSize: 19, fontWeight: '700' },
  photoEditButton: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: TravelColors.surface,
    borderRadius: 15,
    backgroundColor: TravelColors.green,
  },
  photoEditIcon: {
    fontSize: 13,
  },
  profileCopy: { flex: 1, minWidth: 0 },
  name: { color: TravelColors.ink, fontFamily: 'serif', fontSize: 17, fontWeight: '700' },
  nameInput: {
    minHeight: 36,
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: TravelColors.ink,
    backgroundColor: TravelColors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  email: { marginTop: 4, color: TravelColors.muted, fontSize: 10 },
  member: { marginTop: 6, color: TravelColors.gold, fontSize: 10, fontWeight: '600' },
  accountCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 14,
    backgroundColor: TravelColors.surface,
  },
  accountRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  accountRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0efe9',
  },
  accountIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: TravelColors.greenLight,
  },
  accountIconDestructive: { backgroundColor: TravelColors.orangeLight },
  accountCopy: { flex: 1, minWidth: 0 },
  accountTitle: { color: TravelColors.ink, fontSize: 11, fontWeight: '700' },
  accountTitleDestructive: { color: TravelColors.orange },
  accountSubtitle: { marginTop: 3, color: TravelColors.muted, fontSize: 9 },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 9,
    marginTop: 9,
  },
  cancelButton: {
    minHeight: 39,
    minWidth: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  cancelText: {
    color: TravelColors.green,
    fontSize: 10,
    fontWeight: '700',
  },
  saveButton: {
    minHeight: 39,
    minWidth: 124,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    paddingHorizontal: 14,
    backgroundColor: TravelColors.green,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.62,
  },
  emptyNote: {
    paddingVertical: 12,
    color: TravelColors.muted,
    fontSize: 10,
  },
});

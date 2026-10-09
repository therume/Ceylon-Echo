import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { File } from 'expo-file-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  background: '#F8F6F1',
  white: '#FFFFFF',
  ink: '#1F2937',
  muted: '#7C838A',
  line: '#E5E1DA',
  rust: '#B85E3B',
  green: '#315443',
};

const AUDIO_LOAD_TIMEOUT_MS = 30_000;

export default function PlayerScreen() {
  const { audioUrl, localAudioUrl, title, subtitle, imageUrl, photoUrls } = useLocalSearchParams<{
    audioUrl?: string;
    localAudioUrl?: string;
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    photoUrls?: string;
  }>();
  const { width } = useWindowDimensions();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const galleryUrls = useMemo(() => {
    let parsedPhotoUrls: unknown = [];
    if (photoUrls) {
      try {
        parsedPhotoUrls = JSON.parse(photoUrls);
      } catch {
        parsedPhotoUrls = [];
      }
    }
    const uploadedPhotoUrls = Array.isArray(parsedPhotoUrls)
      ? parsedPhotoUrls.filter(
          (url): url is string => typeof url === 'string' && url.trim().length > 0,
        )
      : [];
    return [...new Set([imageUrl, ...uploadedPhotoUrls].filter(
      (url): url is string => Boolean(url),
    ))];
  }, [imageUrl, photoUrls]);
  const coverWidth = Math.min((width - 40) * 0.84, 310);
  const remoteUri = useMemo(
    () => (audioUrl ? normalizeAudioUri(audioUrl) : null),
    [audioUrl],
  );
  const localUri = useMemo(
    () => (localAudioUrl ? normalizeAudioUri(localAudioUrl) : null),
    [localAudioUrl],
  );
  const fallbackKey = localUri && remoteUri ? `${localUri}\n${remoteUri}` : null;
  const [fallbackSourceKey, setFallbackSourceKey] = useState<string | null>(null);
  const useRemoteFallback = fallbackKey !== null && fallbackSourceKey === fallbackKey;
  const sourceUri = localUri && !useRemoteFallback ? localUri : remoteUri;
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const playbackStatus = useAudioPlayerStatus(player);
  const [startedUri, setStartedUri] = useState<string | null>(null);
  const [loadFailure, setLoadFailure] = useState<{ uri: string; message: string } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportedFailureUriRef = useRef<string | null>(null);
  const loadError = loadFailure?.uri === sourceUri ? loadFailure.message : null;
  const isPlaying = playbackStatus.playing;
  const isLoading =
    Boolean(sourceUri) &&
    !loadError &&
    (startedUri !== sourceUri || !playbackStatus.isLoaded);
  const playbackError =
    loadError ??
    playbackStatus.error ??
    (!sourceUri ? 'This attraction does not have an audio guide yet.' : null);
  const progress =
    playbackStatus.duration > 0
      ? Math.min(playbackStatus.currentTime / playbackStatus.duration, 1)
      : 0;

  const reportPlaybackError = useCallback(
    (message: string) => {
      if (!sourceUri || reportedFailureUriRef.current === sourceUri) {
        return;
      }
      if (sourceUri === localUri) {
        if (remoteUri && fallbackKey) {
          setFallbackSourceKey(fallbackKey);
        } else {
          setLoadFailure({ uri: sourceUri, message });
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }
      reportedFailureUriRef.current = sourceUri;
      setLoadFailure({ uri: sourceUri, message });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      Alert.alert('Playback Error', message);
    },
    [fallbackKey, localUri, remoteUri, sourceUri],
  );

  useEffect(() => {
    let isActive = true;
    reportedFailureUriRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    async function prepareAudio() {
      if (!sourceUri) {
        return;
      }

      try {
        if (
          Platform.OS !== 'web' &&
          (sourceUri.startsWith('file://') || sourceUri.startsWith('/'))
        ) {
          const localFile = new File(sourceUri);
          if (!localFile.exists) {
            if (sourceUri === localUri && remoteUri && fallbackKey) {
              setFallbackSourceKey(fallbackKey);
              return;
            }
            throw new Error('The downloaded audio file is missing from this device.');
          }
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'duckOthers',
        });
        if (!isActive) {
          return;
        }

        setStartedUri(sourceUri);
        player.replace({ uri: sourceUri });
        timeoutRef.current = setTimeout(() => {
          if (isActive && !player.isLoaded) {
            reportPlaybackError('Audio loading timed out. Check your connection or try again.');
          }
        }, AUDIO_LOAD_TIMEOUT_MS);
      } catch (error) {
        if (isActive) {
          reportPlaybackError(
            error instanceof Error ? error.message : 'Could not load this audio guide.',
          );
        }
      }
    }

    void prepareAudio();
    return () => {
      isActive = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [fallbackKey, localUri, player, remoteUri, reportPlaybackError, sourceUri]);

  useEffect(() => {
    if (!sourceUri || startedUri !== sourceUri) {
      return;
    }
    if (playbackStatus.isLoaded) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    if (playbackStatus.error) {
      const error = playbackStatus.error;
      const errorTimer = setTimeout(() => reportPlaybackError(error), 0);
      return () => clearTimeout(errorTimer);
    }
  }, [playbackStatus.error, playbackStatus.isLoaded, reportPlaybackError, sourceUri, startedUri]);

  function togglePlayback() {
    if (!playbackStatus.isLoaded) {
      return;
    }

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.headerButton}>
            <Feather color={colors.ink} name="chevron-left" size={21} />
          </Pressable>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <Pressable
            accessibilityLabel="More player options"
            accessibilityRole="button"
            onPress={() => router.push('/downloads')}
            style={styles.headerButton}>
            <Feather color={colors.ink} name="more-horizontal" size={21} />
          </Pressable>
        </View>

        {galleryUrls.length > 0 ? (
          <View style={[styles.coverGallery, { width: coverWidth, height: coverWidth }]}>
            <ScrollView
              horizontal
              pagingEnabled
              scrollEnabled={galleryUrls.length > 1}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                setActivePhotoIndex(
                  Math.min(
                    Math.round(event.nativeEvent.contentOffset.x / coverWidth),
                    galleryUrls.length - 1,
                  ),
                );
              }}>
              {galleryUrls.map((photoUrl, index) => (
                <Image
                  key={`${photoUrl}-${index}`}
                  accessibilityLabel={`${title || 'Attraction'} photo ${index + 1} of ${galleryUrls.length}`}
                  contentFit="cover"
                  source={{ uri: photoUrl }}
                  style={[styles.coverImage, { width: coverWidth, height: coverWidth }]}
                />
              ))}
            </ScrollView>
          </View>
        ) : (
          <View
            style={[
              styles.coverImage,
              styles.coverPlaceholder,
              { width: coverWidth, height: coverWidth },
            ]}>
            <Feather color={colors.green} name="music" size={42} />
          </View>
        )}
        {galleryUrls.length > 1 ? (
          <View style={styles.photoIndicator}>
            {galleryUrls.map((photoUrl, index) => (
              <View
                key={`${photoUrl}-indicator`}
                style={[
                  styles.photoDot,
                  index === activePhotoIndex && styles.photoDotActive,
                ]}
              />
            ))}
            <Text style={styles.photoCount}>
              {activePhotoIndex + 1} / {galleryUrls.length}
            </Text>
          </View>
        ) : null}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{title || 'Audio Guide'}</Text>
          <Text style={styles.trackSubtitle}>{subtitle || 'Explore the attraction'}</Text>
        </View>

        <View style={styles.progressSection}>
          <View
            accessibilityLabel={`Audio progress, ${Math.round(progress * 100)} percent`}
            style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timestamp}>{formatTimestamp(playbackStatus.currentTime)}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(playbackStatus.duration)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable accessibilityLabel="Previous chapter" style={styles.skipButton}>
            <Feather color={colors.green} name="skip-back" size={20} />
          </Pressable>
          <Pressable
            accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
            accessibilityRole="button"
            disabled={isLoading || !playbackStatus.isLoaded}
            onPress={togglePlayback}
            style={styles.playControl}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Feather color={colors.white} name={isPlaying ? 'pause' : 'play'} size={22} />
            )}
          </Pressable>
          <Pressable accessibilityLabel="Next chapter" style={styles.skipButton}>
            <Feather color={colors.green} name="skip-forward" size={20} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/downloads')}
          style={({ pressed }) => [styles.offlineLink, pressed && styles.pressed]}>
          <Feather color={colors.rust} name="download" size={13} />
          <Text style={styles.offlineText}>Download for Offline Listening</Text>
        </Pressable>
        {playbackError && <Text style={styles.errorText}>{playbackError}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function normalizeAudioUri(uri: string): string {
  if (/^(https?|file|content):\/\//i.test(uri)) {
    return uri;
  }
  if (uri.startsWith('/')) {
    return `file://${uri}`;
  }
  return uri;
}

function formatTimestamp(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    height: 48,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  coverGallery: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: colors.line,
  },
  coverImage: {
    borderRadius: 20,
    backgroundColor: colors.line,
  },
  photoIndicator: {
    minHeight: 18,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  photoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C9C5BD',
  },
  photoDotActive: {
    width: 16,
    backgroundColor: colors.rust,
  },
  photoCount: {
    marginLeft: 4,
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    marginTop: 16,
    alignItems: 'center',
    gap: 4,
  },
  trackTitle: {
    color: colors.ink,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
  },
  trackSubtitle: {
    color: colors.rust,
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 21,
  },
  progressTrack: {
    height: 4,
    justifyContent: 'center',
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.rust,
  },
  progressThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: 6,
    backgroundColor: colors.rust,
  },
  timeRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timestamp: {
    color: colors.muted,
    fontSize: 10,
  },
  controls: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  skipButton: {
    width: 35,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playControl: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: colors.green,
  },
  offlineLink: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  offlineText: {
    color: colors.rust,
    fontSize: 11,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 10,
    color: colors.rust,
    textAlign: 'center',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});

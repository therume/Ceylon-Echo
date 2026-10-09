import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthGate } from '@/components/auth-gate';
import { DataMessage } from '@/components/data-message';
import { AttractionCard, ScreenFrame, TravelColors } from '@/components/travel-ui';
import { useAuth } from '@/context/AuthContext';
import { getAttractionsByIds } from '@/services/attractionService';
import type { Attraction } from '@/services/attractionService';
import { getSavedAttractionIds, removeSavedAttraction } from '@/services/userService';

export default function BookmarksScreen() {
  return (
    <AuthGate>
      <SavedAttractionsScreen />
    </AuthGate>
  );
}

function SavedAttractionsScreen() {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const userId = user?.uid;

  useEffect(() => {
    let active = true;
    if (!userId) {
      return () => {
        active = false;
      };
    }
    const uid = userId;

    async function loadSavedAttractions() {
      try {
        const ids = await getSavedAttractionIds(uid);
        const savedAttractions = await getAttractionsByIds(ids);
        if (active) {
          setAttractions(savedAttractions);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load saved places.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSavedAttractions();
    return () => {
      active = false;
    };
  }, [userId]);

  async function removeAttraction(attractionId: string) {
    if (!user) {
      return;
    }
    setRemovingId(attractionId);
    setError(null);
    try {
      await removeSavedAttraction(user.uid, attractionId);
      setAttractions((current) => current.filter((item) => item.id !== attractionId));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove saved place.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <ScreenFrame title="Saved Attractions" subtitle="The places you want to remember.">
      {isLoading ? <DataMessage isLoading message="Loading saved places…" /> : null}
      {error ? <DataMessage isError message={error} /> : null}
      {!isLoading && !error && attractions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyMark}>♡</Text>
          <Text style={styles.emptyTitle}>Your saved places will be here</Text>
          <Text style={styles.emptyCopy}>Save a destination when you find one you love.</Text>
        </View>
      ) : null}
      {attractions.map((item, index) => (
        <View key={item.id} style={styles.savedCard}>
          <AttractionCard
            title={item.name}
            location={item.location}
            category={item.category}
            tone={index % 3 === 0 ? 'gold' : index % 3 === 1 ? 'blue' : 'forest'}
            imageUrl={item.photos[0]?.url}
            onPress={() =>
              router.push({ pathname: '/(tabs)/attraction', params: { id: item.id } })
            }
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.name} from saved attractions`}
            disabled={removingId === item.id}
            onPress={() => void removeAttraction(item.id)}
            style={styles.bookmarkButton}>
            <Text style={styles.bookmarkIcon}>{removingId === item.id ? '…' : '▮'}</Text>
          </Pressable>
        </View>
      ))}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  savedCard: { position: 'relative', marginBottom: 11 },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#ffffff',
  },
  bookmarkIcon: { color: TravelColors.green, fontSize: 12 },
  empty: {
    alignItems: 'center',
    marginTop: 45,
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 32,
    backgroundColor: '#f0f3ed',
  },
  emptyMark: { color: TravelColors.green, fontSize: 30 },
  emptyTitle: { marginTop: 12, color: TravelColors.ink, fontSize: 15, fontWeight: '700' },
  emptyCopy: { marginTop: 6, color: TravelColors.muted, fontSize: 12, textAlign: 'center' },
});

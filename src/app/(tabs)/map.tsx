import { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataMessage } from '@/components/data-message';
import SriLankaMap from '@/components/sri-lanka-map';
import type { MappedAttraction } from '@/components/sri-lanka-map.types';
import { PrimaryButton, ScreenFrame, SectionHeading, TravelColors } from '@/components/travel-ui';
import { useAttractions } from '@/hooks/use-attractions';

export default function InteractiveMapScreen() {
  const { attractions, isLoading, error } = useAttractions();
  const [recenterMap, setRecenterMap] = useState<() => void>(() => () => {});
  const registerRecenterMap = useCallback((recenter: () => void) => {
    setRecenterMap(() => recenter);
  }, []);
  const mapAttractions = attractions.slice(0, 2);
  const mappedAttractions: MappedAttraction[] = useMemo(
    () =>
      attractions.flatMap((attraction) => {
        if (
          typeof attraction.latitude !== 'number' ||
          !Number.isFinite(attraction.latitude) ||
          typeof attraction.longitude !== 'number' ||
          !Number.isFinite(attraction.longitude)
        ) {
          return [];
        }
        return [
          {
            id: attraction.id,
            name: attraction.name,
            location: attraction.location,
            category: attraction.category,
            description: attraction.description,
            latitude: attraction.latitude,
            longitude: attraction.longitude,
          },
        ];
      }),
    [attractions],
  );
  const onAttractionPress = useCallback(
    (id: string) => router.push({ pathname: '/(tabs)/attraction', params: { id } }),
    [],
  );

  return (
    <ScreenFrame title="Explore Map" subtitle="Discover remarkable places around you.">
      <View style={styles.map}>
        <SriLankaMap
          attractions={mappedAttractions}
          onAttractionPress={onAttractionPress}
          onRecenterReady={registerRecenterMap}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recenter map on Sri Lanka"
          onPress={recenterMap}
          style={styles.locateButton}>
          <Text style={styles.locateText}>◎</Text>
        </Pressable>
        <View style={styles.mapLegend}>
          <Text style={styles.legendTitle}>Explore Sri Lanka</Text>
          <Text style={styles.legendSubtitle}>{mappedAttractions.length} mapped destinations</Text>
        </View>
      </View>
      {isLoading ? <DataMessage isLoading message="Loading map attractions…" /> : null}
      {error ? <DataMessage isError message={error} /> : null}
      <SectionHeading title="Around this area" action="Nearby" onPress={() => router.push('/(tabs)/nearby')} />
      {!isLoading && !error && attractions.length === 0 ? (
        <DataMessage message="No attractions are available to show on the map." />
      ) : null}
      {mapAttractions.map((item, index) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          onPress={() =>
            router.push({ pathname: '/(tabs)/attraction', params: { id: item.id } })
          }
          style={styles.placeRow}>
          <View style={[styles.placePin, index === 1 && styles.placePinAlt]}>
            <Text style={styles.placePinText}>{index + 1}</Text>
          </View>
          <View style={styles.placeCopy}>
            <Text style={styles.placeTitle}>{item.name}</Text>
            <Text style={styles.placeDistance}>{item.location}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
      <PrimaryButton title="See nearby attractions" onPress={() => router.push('/(tabs)/nearby')} style={styles.button} />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 380,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 18,
    backgroundColor: '#eaf0e8',
  },
  locateButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  locateText: { color: TravelColors.green, fontSize: 17 },
  mapLegend: {
    position: 'absolute',
    right: 9,
    bottom: 9,
    left: 9,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  legendTitle: { color: TravelColors.ink, fontSize: 10, fontWeight: '700' },
  legendSubtitle: { marginTop: 3, color: TravelColors.muted, fontSize: 8 },
  placeRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderColor: '#efeee8',
  },
  placePin: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: TravelColors.orange,
  },
  placePinAlt: { backgroundColor: TravelColors.green },
  placePinText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  placeCopy: { flex: 1 },
  placeTitle: { color: TravelColors.ink, fontSize: 12, fontWeight: '700' },
  placeDistance: { marginTop: 4, color: TravelColors.muted, fontSize: 10 },
  chevron: { color: TravelColors.green, fontSize: 20 },
  button: { marginTop: 18 },
});

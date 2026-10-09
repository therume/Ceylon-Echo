import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DataMessage } from '@/components/data-message';
import SriLankaMap from '@/components/sri-lanka-map';
import type { MappedAttraction } from '@/components/sri-lanka-map.types';
import {
  AttractionCard,
  ScreenFrame,
  SectionHeading,
  TravelColors,
} from '@/components/travel-ui';
import { useAttractions } from '@/hooks/use-attractions';

const filters = ['All', 'Heritage', 'Nature', 'Beaches'];

export default function ExploreScreen() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { attractions, isLoading, error } = useAttractions();
  const filteredAttractions = useMemo(
    () =>
      attractions.filter((item) => {
        const matchesSearch = `${item.name} ${item.location} ${item.category}`
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        return matchesSearch && (filter === 'All' || item.category.toLowerCase().includes(filter.toLowerCase()));
      }),
    [attractions, filter, search],
  );
  const mappedAttractions: MappedAttraction[] = useMemo(
    () =>
      filteredAttractions.flatMap((attraction) => {
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
    [filteredAttractions],
  );
  const onAttractionPress = useCallback(
    (id: string) => router.push({ pathname: '/(tabs)/attraction', params: { id } }),
    [],
  );
  const onRecenterReady = useCallback(() => {}, []);

  return (
    <ScreenFrame
      title="Explore"
      subtitle="Find a place that feels like yours."
      onProfile={() => router.push('/(tabs)/profile')}>
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Search attractions"
          onChangeText={setSearch}
          placeholder="Search attractions..."
          placeholderTextColor="#8b9189"
          style={styles.searchInput}
          value={search}
        />
      </View>

      <SectionHeading title="Explore the map" />
      <View style={styles.mapCard}>
        <SriLankaMap
          attractions={mappedAttractions}
          onAttractionPress={onAttractionPress}
          onRecenterReady={onRecenterReady}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/map')}
          style={({ pressed }) => [styles.mapAction, pressed && styles.mapActionPressed]}>
          <Text style={styles.mapActionText}>Open interactive map  →</Text>
        </Pressable>
      </View>

      <SectionHeading title="Nearby attractions" action="See all" onPress={() => router.push('/(tabs)/nearby')} />
      <View style={styles.filterRow}>
        {filters.map((item) => {
          const active = filter === item;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item)}
              style={[styles.filter, active && styles.filterActive]}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
      {isLoading ? <DataMessage isLoading message="Loading attractions…" /> : null}
      {error ? <DataMessage isError message={error} /> : null}
      {!isLoading && !error && filteredAttractions.length === 0 ? (
        <DataMessage message="No attractions match these filters." />
      ) : null}
      <View style={styles.cardList}>
        {filteredAttractions.map((item, index) => (
          <AttractionCard
            key={item.id}
            title={item.name}
            location={item.location}
            category={item.category}
            tone={index % 3 === 0 ? 'gold' : index % 3 === 1 ? 'blue' : 'forest'}
            imageUrl={item.photos[0]?.url}
            onPress={() =>
              router.push({ pathname: '/(tabs)/attraction', params: { id: item.id } })
            }
          />
        ))}
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 13,
    paddingHorizontal: 13,
    backgroundColor: '#ffffff',
  },
  searchIcon: { color: '#617167', fontSize: 23 },
  searchInput: { flex: 1, color: TravelColors.ink, fontSize: 13 },
  mapCard: {
    height: 260,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
    backgroundColor: '#e3ece6',
  },
  mapAction: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  mapActionPressed: { opacity: 0.8 },
  mapActionText: { color: TravelColors.green, fontSize: 11, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filter: {
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: '#ffffff',
  },
  filterActive: { borderColor: TravelColors.green, backgroundColor: TravelColors.green },
  filterText: { color: TravelColors.muted, fontSize: 10, fontWeight: '600' },
  filterTextActive: { color: '#ffffff' },
  cardList: { gap: 10 },
});

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataMessage } from '@/components/data-message';
import { AttractionCard, ScreenFrame, TravelColors } from '@/components/travel-ui';
import { useAttractions } from '@/hooks/use-attractions';

const filters = ['All', 'Heritage', 'Nature', 'Temple'];

export default function NearbyScreen() {
  const [selected, setSelected] = useState('All');
  const { attractions, isLoading, error } = useAttractions();
  const filteredAttractions = useMemo(
    () =>
      attractions.filter(
        (item) =>
          selected === 'All' || item.category.toLowerCase().includes(selected.toLowerCase()),
      ),
    [attractions, selected],
  );

  return (
    <ScreenFrame title="Nearby Attractions" subtitle="Wonderful places close to your location.">
      <View style={styles.location}>
        <Text style={styles.locationPin}>⌖</Text>
        <View style={styles.locationCopy}>
          <Text style={styles.locationTitle}>Across Sri Lanka</Text>
          <Text style={styles.locationSubtitle}>Browse admin-curated attractions</Text>
        </View>
      </View>
      <View style={styles.filters}>
        {filters.map((filter) => {
          const active = selected === filter;
          return (
            <Pressable
              key={filter}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setSelected(filter)}
              style={[styles.filter, active && styles.filterActive]}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
            </Pressable>
          );
        })}
      </View>
      {isLoading ? <DataMessage isLoading message="Loading attractions…" /> : null}
      {error ? <DataMessage isError message={error} /> : null}
      {!isLoading && !error && filteredAttractions.length === 0 ? (
        <DataMessage message="No attractions match this filter." />
      ) : null}
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
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  location: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#eef3ef',
  },
  locationPin: { color: TravelColors.orange, fontSize: 18 },
  locationCopy: { flex: 1 },
  locationTitle: { color: TravelColors.ink, fontSize: 12, fontWeight: '700' },
  locationSubtitle: { marginTop: 4, color: TravelColors.muted, fontSize: 10 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 14 },
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
});

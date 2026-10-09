import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DataMessage } from '@/components/data-message';
import {
  AttractionCard,
  DetailRow,
  PrimaryButton,
  ScreenFrame,
  SectionHeading,
} from '@/components/travel-ui';
import { useAttractions } from '@/hooks/use-attractions';

const suggestedRoutes = [
  {
    id: 'cultural-triangle',
    durationDays: 3,
    category: 'Culture',
    title: 'The Cultural Triangle',
    destinations: 'Sigiriya · Dambulla · Polonnaruwa',
  },
] as const;

const durationOptions = [
  { label: 'Any duration', value: 'any' },
  { label: '1 Day', value: '1' },
  { label: '2 Days', value: '2' },
  { label: '3 Days', value: '3' },
  { label: '4–7 Days', value: '4-7' },
] as const;

const categoryOptions = [
  'All',
  'Culture',
  'Nature',
  'Adventure',
  'Beach',
  'Wildlife',
  'Heritage',
] as const;

type RouteFilters = {
  duration: (typeof durationOptions)[number]['value'];
  category: (typeof categoryOptions)[number];
};

const defaultRouteFilters: RouteFilters = { duration: 'any', category: 'All' };

export default function HomeScreen() {
  const { attractions, isLoading, error } = useAttractions();
  const [search, setSearch] = useState('');
  const [isRouteFilterVisible, setIsRouteFilterVisible] = useState(false);
  const [routeFilters, setRouteFilters] = useState<RouteFilters>(defaultRouteFilters);
  const [draftRouteFilters, setDraftRouteFilters] =
    useState<RouteFilters>(defaultRouteFilters);
  const hasSearchQuery = search.trim().length > 0;
  const filteredAttractions = useMemo(
    () =>
      attractions.filter((item) =>
        [item.name, item.location, item.category, item.description]
          .join(' ')
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    [attractions, search],
  );
  const filteredRoutes = useMemo(
    () =>
      suggestedRoutes.filter((route) => {
        const matchesDuration =
          routeFilters.duration === 'any' ||
          (routeFilters.duration === '4-7'
            ? route.durationDays >= 4 && route.durationDays <= 7
            : route.durationDays === Number(routeFilters.duration));
        const matchesCategory =
          routeFilters.category === 'All' ||
          route.category.toLowerCase() === routeFilters.category.toLowerCase();
        return matchesDuration && matchesCategory;
      }),
    [routeFilters],
  );
  const activeRouteFilterCount =
    Number(routeFilters.duration !== 'any') + Number(routeFilters.category !== 'All');

  function openRouteFilters() {
    setDraftRouteFilters(routeFilters);
    setIsRouteFilterVisible(true);
  }

  function applyRouteFilters() {
    setRouteFilters(draftRouteFilters);
    setIsRouteFilterVisible(false);
  }

  return (
    <ScreenFrame
      title="Discover Sri Lanka"
      subtitle="Stories, places and experiences worth remembering."
      onProfile={() => router.push('/(tabs)/profile')}>
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Search destinations"
          onChangeText={setSearch}
          placeholder="Search destinations..."
          placeholderTextColor="#8b9189"
          style={styles.searchInput}
          value={search}
        />
        <Text style={styles.filter}>☷</Text>
      </View>

      {hasSearchQuery ? (
        <View style={styles.searchResults}>
          <Text style={styles.searchResultsTitle}>
            {isLoading
              ? 'Searching destinations…'
              : `${filteredAttractions.length} ${
                  filteredAttractions.length === 1 ? 'destination' : 'destinations'
                } found`}
          </Text>
          {isLoading ? <DataMessage isLoading message="Loading destinations…" /> : null}
          {error ? <DataMessage isError message={error} /> : null}
          {!isLoading && !error && filteredAttractions.length === 0 ? (
            <View style={styles.searchEmptyState}>
              <Feather color="#547962" name="map-pin" size={20} />
              <Text style={styles.searchEmptyText}>No destinations found.</Text>
            </View>
          ) : null}
          {!isLoading && !error
            ? filteredAttractions.map((item, index) => (
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
              ))
            : null}
        </View>
      ) : (
      <>
      <View style={styles.hero}>
        <Image
          accessibilityLabel="Turquoise Sri Lankan coastline with fishing boats"
          contentFit="cover"
          source={require('../../../assets/images/sri-lanka-coast.png')}
          style={styles.heroArt}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroEyebrow}>YOUR ISLAND, YOUR WAY</Text>
          <Text style={styles.heroTitle}>Find your next story</Text>
          <Text style={styles.heroCopy}>Explore the places that make Sri Lanka unforgettable.</Text>
          <PrimaryButton
            title="Explore the map"
            onPress={() => router.push('/(tabs)/map')}
            style={styles.heroButton}
          />
        </View>
      </View>

      <SectionHeading
        title="Nearby Attractions"
        action="See all"
        onPress={() => router.push('/(tabs)/nearby')}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {filteredAttractions.slice(0, 6).map((item, index) => (
          <AttractionCard
            key={item.id}
            title={item.name}
            location={item.location}
            category={item.category}
            tone={index % 2 === 0 ? 'gold' : 'blue'}
            imageUrl={item.photos[0]?.url}
            compact
            onPress={() =>
              router.push({ pathname: '/(tabs)/attraction', params: { id: item.id } })
            }
          />
        ))}
      </ScrollView>
      {isLoading ? <DataMessage isLoading message="Loading attractions…" /> : null}
      {error ? <DataMessage isError message={error} /> : null}
      {!isLoading && !error && filteredAttractions.length === 0 ? (
        <DataMessage message={search ? 'No attractions match your search.' : 'No attractions have been added yet.'} />
      ) : null}

      <View style={styles.routesHeading}>
        <Text style={styles.sectionTitle}>Suggested Routes</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter suggested routes"
          accessibilityState={{ expanded: isRouteFilterVisible }}
          onPress={openRouteFilters}
          style={({ pressed }) => [
            styles.filterButton,
            activeRouteFilterCount > 0 && styles.filterButtonActive,
            pressed && styles.pressed,
          ]}>
          <Feather
            color={activeRouteFilterCount > 0 ? '#ffffff' : '#285944'}
            name="sliders"
            size={14}
          />
          <Text
            style={[
              styles.filterButtonText,
              activeRouteFilterCount > 0 && styles.filterButtonTextActive,
            ]}>
            Filter{activeRouteFilterCount > 0 ? ` · ${activeRouteFilterCount}` : ''}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.routeCount}>
        {filteredRoutes.length} {filteredRoutes.length === 1 ? 'route' : 'routes'}
      </Text>
      {filteredRoutes.length > 0 ? (
        filteredRoutes.map((route) => (
          <Pressable
            key={route.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${route.title}, ${route.durationDays} days, ${route.category}`}
            onPress={() => router.push('/(tabs)/suggested')}
            style={styles.routeCard}>
            <View style={styles.routeBadge}>
              <Text style={styles.routeBadgeText}>
                {route.durationDays} DAYS · {route.category.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.routeTitle}>{route.title}</Text>
            <Text style={styles.routeDescription}>{route.destinations}</Text>
            <Text style={styles.routeArrow}>See your itinerary  →</Text>
          </Pressable>
        ))
      ) : (
        <View style={styles.routeEmptyState}>
          <View style={styles.emptyIcon}>
            <Feather color="#547962" name="map" size={19} />
          </View>
          <Text style={styles.emptyTitle}>No routes match your filters.</Text>
          <Text style={styles.emptyCopy}>Try adjusting your filters.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setRouteFilters(defaultRouteFilters)}
            style={({ pressed }) => [styles.emptyReset, pressed && styles.pressed]}>
            <Text style={styles.emptyResetText}>Reset Filters</Text>
          </Pressable>
        </View>
      )}

      <Modal
        animationType="slide"
        onRequestClose={() => setIsRouteFilterVisible(false)}
        transparent
        visible={isRouteFilterVisible}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close route filters"
            accessibilityRole="button"
            onPress={() => setIsRouteFilterVisible(false)}
            style={styles.modalBackdrop}
          />
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Filter routes</Text>
                <Text style={styles.sheetSubtitle}>Find a journey that fits your plans.</Text>
              </View>
              <Pressable
                accessibilityLabel="Close route filters"
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => setIsRouteFilterVisible(false)}
                style={styles.closeButton}>
                <Feather color="#526158" name="x" size={18} />
              </Pressable>
            </View>

            <Text style={styles.filterLabel}>Duration</Text>
            <View style={styles.optionRow}>
              {durationOptions.map((option) => {
                const selected = draftRouteFilters.duration === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected, checked: selected }}
                    onPress={() =>
                      setDraftRouteFilters((current) => ({
                        ...current,
                        duration: option.value,
                      }))
                    }
                    style={[styles.optionPill, selected && styles.optionPillSelected]}>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.filterLabel}>Category</Text>
            <View style={styles.optionRow}>
              {categoryOptions.map((category) => {
                const selected = draftRouteFilters.category === category;
                return (
                  <Pressable
                    key={category}
                    accessibilityRole="radio"
                    accessibilityState={{ selected, checked: selected }}
                    onPress={() =>
                      setDraftRouteFilters((current) => ({ ...current, category }))
                    }
                    style={[styles.optionPill, selected && styles.optionPillSelected]}>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDraftRouteFilters(defaultRouteFilters)}
                style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={applyRouteFilters}
                style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {filteredAttractions.length > 6 ? (
        <>
          <SectionHeading
            title="More to explore"
            action="See all"
            onPress={() => router.push('/(tabs)/explore')}
          />
          {filteredAttractions.slice(6, 8).map((item) => (
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
          ))}
        </>
      ) : null}
      </>
      )}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#e7e8e1',
    borderRadius: 13,
    paddingHorizontal: 13,
    backgroundColor: '#ffffff',
  },
  searchIcon: { color: '#617167', fontSize: 23 },
  searchInput: { flex: 1, color: '#26382f', fontSize: 13 },
  filter: { color: '#285944', fontSize: 19 },
  searchResults: { gap: 10, marginTop: 14 },
  searchResultsTitle: {
    marginBottom: 2,
    color: '#777d75',
    fontSize: 11,
    fontWeight: '600',
  },
  searchEmptyState: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#e8e7df',
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  searchEmptyText: { color: '#59635c', fontSize: 13, fontWeight: '600' },
  routesHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 4,
  },
  sectionTitle: { color: '#26382f', fontSize: 16, fontWeight: '700' },
  filterButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#dce5dd',
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },
  filterButtonActive: { borderColor: '#285944', backgroundColor: '#285944' },
  filterButtonText: { color: '#285944', fontSize: 11, fontWeight: '700' },
  filterButtonTextActive: { color: '#ffffff' },
  routeCount: {
    marginBottom: 9,
    color: '#858b84',
    fontSize: 10,
  },
  hero: {
    height: 220,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 15,
    borderRadius: 16,
    backgroundColor: '#315c49',
  },
  heroArt: { ...StyleSheet.absoluteFill },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 18,
    backgroundColor: 'rgba(26, 48, 37, 0.34)',
  },
  heroEyebrow: {
    color: '#f0dca7',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: { marginTop: 6, color: '#ffffff', fontSize: 24, fontWeight: '700' },
  heroCopy: { maxWidth: 285, marginTop: 5, color: '#f4f2e9', fontSize: 12, lineHeight: 17 },
  heroButton: { minHeight: 44, marginTop: 12, paddingHorizontal: 16 },
  horizontalList: { overflow: 'visible' },
  routeCard: {
    minHeight: 124,
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 17,
    backgroundColor: '#f0f3ed',
  },
  routeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dce8df',
  },
  routeBadgeText: { color: '#285944', fontSize: 9, fontWeight: '700' },
  routeTitle: { marginTop: 7, color: '#26382f', fontSize: 16, fontWeight: '700' },
  routeDescription: { marginTop: 4, color: '#777d75', fontSize: 11 },
  routeArrow: { position: 'absolute', right: 14, bottom: 12, color: '#285944', fontSize: 9 },
  routeEmptyState: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e7df',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  emptyIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#e9f0eb',
  },
  emptyTitle: { marginTop: 10, color: '#26382f', fontSize: 14, fontWeight: '700' },
  emptyCopy: { marginTop: 4, color: '#777d75', fontSize: 12 },
  emptyReset: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 10 },
  emptyResetText: { color: '#285944', fontSize: 10, fontWeight: '700' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(18, 29, 22, 0.42)' },
  filterSheet: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: '#fbfaf5',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 2,
    backgroundColor: '#d5d9d2',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 19,
  },
  sheetTitle: { color: '#26382f', fontFamily: 'serif', fontSize: 23, fontWeight: '700' },
  sheetSubtitle: { marginTop: 4, color: '#777d75', fontSize: 12 },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#edf0eb',
  },
  filterLabel: { marginBottom: 9, color: '#26382f', fontSize: 13, fontWeight: '700' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  optionPill: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e5df',
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },
  optionPillSelected: { borderColor: '#285944', backgroundColor: '#e9f0eb' },
  optionText: { color: '#59635c', fontSize: 11, fontWeight: '600' },
  optionTextSelected: { color: '#285944', fontWeight: '700' },
  sheetActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  resetButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#dce3dc',
    borderRadius: 11,
    backgroundColor: '#ffffff',
  },
  resetButtonText: { color: '#285944', fontSize: 12, fontWeight: '700' },
  applyButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#285944',
  },
  applyButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.78 },
});

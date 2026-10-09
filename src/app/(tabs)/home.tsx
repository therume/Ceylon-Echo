import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DataMessage } from '@/components/data-message';
import {
  AttractionCard,
  DetailRow,
  LandscapeArt,
  PrimaryButton,
  ScreenFrame,
  SectionHeading,
} from '@/components/travel-ui';
import { useAttractions } from '@/hooks/use-attractions';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeScreen() {
  const { t } = useLanguage();
  const { attractions, isLoading, error } = useAttractions();
  const [search, setSearch] = useState('');
  const filteredAttractions = useMemo(
    () =>
      attractions.filter((item) =>
        `${item.name} ${item.location} ${item.category}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    [attractions, search],
  );

  return (
    <ScreenFrame
      title={t('discoverSriLankaTitle')}
      subtitle={t('discoverSriLankaSubtitle')}
      onProfile={() => router.push('/(tabs)/profile')}>
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel={t('searchDestinations')}
          onChangeText={setSearch}
          placeholder={t('searchDestinationsPlaceholder')}
          placeholderTextColor="#8b9189"
          style={styles.searchInput}
          value={search}
        />
        <Text style={styles.filter}>☷</Text>
      </View>

      <View style={styles.hero}>
        <LandscapeArt tone="forest" style={styles.heroArt} />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroEyebrow}>{t('yourIslandYourWay')}</Text>
          <Text style={styles.heroTitle}>{t('findNextStory')}</Text>
          <Text style={styles.heroCopy}>{t('homeDescription')}</Text>
          <PrimaryButton
            title={t('exploreMap')}
            onPress={() => router.push('/(tabs)/map')}
            style={styles.heroButton}
          />
        </View>
      </View>

      <SectionHeading
        title={t('nearbyAttractions')}
        action={t('seeAll')}
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
              router.push({ pathname: '/attraction/[id]', params: { id: item.id } })
            }
          />
        ))}
      </ScrollView>
      {isLoading ? <DataMessage isLoading message={t('loadingAttractions')} /> : null}
      {error ? <DataMessage isError message={error} /> : null}
      {!isLoading && !error && filteredAttractions.length === 0 ? (
        <DataMessage message={search ? t('noSearchResults') : t('noAttractionsYet')} />
      ) : null}

      <SectionHeading
        title={t('suggestedRoutes')}
        action={t('viewRoutes')}
        onPress={() => router.push('/(tabs)/suggested')}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/suggested')}
        style={styles.routeCard}>
        <View style={styles.routeBadge}>
          <Text style={styles.routeBadgeText}>{t('daysCulture')}</Text>
        </View>
        <Text style={styles.routeTitle}>{t('culturalTriangle')}</Text>
        <Text style={styles.routeDescription}>{t('sigiriyaDambullaPolonnaruwa')}</Text>
        <Text style={styles.routeArrow}>{t('seeItinerary')}</Text>
      </Pressable>

      {filteredAttractions.length > 6 ? (
        <>
          <SectionHeading
            title={t('moreToExplore')}
            action={t('seeAll')}
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
                router.push({ pathname: '/attraction/[id]', params: { id: item.id } })
              }
            />
          ))}
        </>
      ) : null}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#e7e8e1',
    borderRadius: 11,
    paddingHorizontal: 11,
    backgroundColor: '#ffffff',
  },
  searchIcon: { color: '#617167', fontSize: 21 },
  searchInput: { flex: 1, color: '#26382f', fontSize: 11 },
  filter: { color: '#285944', fontSize: 17 },
  hero: {
    height: 190,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 15,
    borderRadius: 13,
    backgroundColor: '#315c49',
  },
  heroArt: { ...StyleSheet.absoluteFill },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: 'rgba(26, 48, 37, 0.34)',
  },
  heroEyebrow: {
    color: '#f0dca7',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: { marginTop: 5, color: '#ffffff', fontSize: 20, fontWeight: '700' },
  heroCopy: { maxWidth: 255, marginTop: 3, color: '#f4f2e9', fontSize: 10 },
  heroButton: { minHeight: 32, marginTop: 9, paddingHorizontal: 13 },
  horizontalList: { overflow: 'visible' },
  routeCard: {
    minHeight: 104,
    justifyContent: 'center',
    borderRadius: 13,
    paddingHorizontal: 15,
    backgroundColor: '#f0f3ed',
  },
  routeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dce8df',
  },
  routeBadgeText: { color: '#285944', fontSize: 8, fontWeight: '700' },
  routeTitle: { marginTop: 6, color: '#26382f', fontSize: 14, fontWeight: '700' },
  routeDescription: { marginTop: 3, color: '#777d75', fontSize: 10 },
  routeArrow: { position: 'absolute', right: 14, bottom: 12, color: '#285944', fontSize: 9 },
});

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAdminAuth } from '@/features/admin/admin-auth';
import { useAdmin } from '@/features/admin/admin-context';
import { AdminHeader, AdminScreen, adminColors } from '@/features/admin/admin-ui';

export default function AttractionsListScreen() {
  const { attractions, isLoading, error } = useAdmin();
  const { signOutAdmin } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [searchByLocation, setSearchByLocation] = useState(false);
  const filteredAttractions = useMemo(
    () =>
      attractions.filter((item) =>
        (searchByLocation ? item.location : `${item.name} ${item.category}`)
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [attractions, search, searchByLocation],
  );

  async function handleSignOut() {
    try {
      await signOutAdmin();
      router.replace('/admin');
    } catch (signOutError) {
      Alert.alert(
        'Could not sign out',
        signOutError instanceof Error ? signOutError.message : 'Please try again.',
      );
    }
  }

  return (
    <AdminScreen>
      <AdminHeader title="Curate Attractions" onSignOut={() => void handleSignOut()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel={searchByLocation ? 'Search by location' : 'Search attractions'}
            onChangeText={setSearch}
            placeholder={searchByLocation ? 'Search provinces / districts...' : 'Search attractions...'}
            placeholderTextColor={adminColors.muted}
            style={styles.searchInput}
            value={search}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/admin/attractions/new')}
            style={styles.addButton}>
            <Text style={styles.addText}>+ Add</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Curate Attractions</Text>
        {isLoading ? <Text style={styles.message}>Loading attractions…</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!isLoading && !error && filteredAttractions.length === 0 ? (
          <Text style={styles.message}>
            {search ? `No attractions match “${search}”.` : 'No attractions yet. Add your first site.'}
          </Text>
        ) : null}
        {!isLoading && !error ? filteredAttractions.map((item, index) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => router.push(`/admin/attractions/${item.id}`)}
            style={({ pressed }) => [
              styles.attractionCard,
              index === 0 && styles.featuredCard,
              pressed && styles.pressed,
            ]}>
            <View style={styles.attractionCopy}>
              <Text style={[styles.attractionName, index === 0 && styles.featuredText]}>
                {item.name}
              </Text>
              <Text style={[styles.category, index === 0 && styles.featuredCategory]}>
                {item.category}
              </Text>
            </View>
            <Text style={[styles.editIcon, index === 0 && styles.featuredText]}>✎</Text>
            <Text style={[styles.moreIcon, index === 0 && styles.featuredText]}>⋮</Text>
          </Pressable>
        )) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setSearch('');
            setSearchByLocation((current) => !current);
          }}
          style={styles.filterButton}>
          <Text style={styles.filterText}>
            ⌖  {searchByLocation ? 'Search attractions' : 'Search by Province / District'}
          </Text>
        </Pressable>
      </ScrollView>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    color: adminColors.muted,
    fontSize: 19,
  },
  searchInput: {
    height: 48,
    flex: 1,
    paddingLeft: 34,
    paddingRight: 10,
    borderRadius: 10,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.line,
    color: adminColors.text,
    fontSize: 14,
  },
  addButton: {
    height: 48,
    minWidth: 68,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: adminColors.rust,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    marginBottom: 2,
    color: adminColors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  attractionCard: {
    minHeight: 76,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: adminColors.surface,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: adminColors.line,
  },
  featuredCard: {
    backgroundColor: adminColors.green,
    borderColor: adminColors.green,
  },
  attractionCopy: {
    flex: 1,
    gap: 4,
  },
  attractionName: {
    color: adminColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  featuredText: {
    color: '#FFFFFF',
  },
  category: {
    color: adminColors.muted,
    fontSize: 11,
  },
  featuredCategory: {
    color: '#D8E3DA',
  },
  editIcon: {
    color: adminColors.green,
    fontSize: 18,
  },
  moreIcon: {
    color: adminColors.text,
    fontSize: 20,
  },
  message: {
    paddingVertical: 20,
    color: adminColors.muted,
    textAlign: 'center',
    fontSize: 14,
  },
  error: {
    paddingVertical: 12,
    color: adminColors.rust,
    fontSize: 13,
  },
  filterButton: {
    padding: 12,
    borderRadius: 7,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.line,
  },
  filterText: {
    color: adminColors.rust,
    fontSize: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.76,
  },
});

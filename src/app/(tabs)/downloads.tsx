import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DataMessage } from '@/components/data-message';
import { DetailRow, ScreenFrame, SectionHeading, TravelColors } from '@/components/travel-ui';
import { useAttractions } from '@/hooks/use-attractions';

export default function AudioGuidesScreen() {
  const { attractions, isLoading, error } = useAttractions();
  const audioAttractions = attractions.filter((attraction) => attraction.audioGuide !== null);

  return (
    <ScreenFrame title="Audio Guides" subtitle="Listen to guides uploaded by Ceylon Echo curators.">
      <View style={styles.storageCard}>
        <View style={styles.storageHeader}>
          <Text style={styles.storageTitle}>Available from Firebase Storage</Text>
          <Text style={styles.storageSize}>{audioAttractions.length} guides</Text>
        </View>
        <Text style={styles.storageNote}>Audio opens externally and requires an internet connection.</Text>
      </View>
      <SectionHeading title="Available guides" />
      {isLoading ? <DataMessage isLoading message="Loading audio guides…" /> : null}
      {error ? <DataMessage isError message={error} /> : null}
      {!isLoading && !error && audioAttractions.length === 0 ? (
        <DataMessage message="No audio guides have been uploaded yet." />
      ) : null}
      {audioAttractions.map((attraction) => (
        <DetailRow
          key={attraction.id}
          icon="♫"
          title={attraction.name}
          subtitle={attraction.audioGuide?.name}
          trailing="▶"
          onPress={() =>
            router.push({
              pathname: '/(tabs)/audio-guide',
              params: { id: attraction.id },
            })
          }
        />
      ))}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  storageCard: {
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 16,
    padding: 17,
    backgroundColor: '#f0f4ef',
  },
  storageHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  storageTitle: { flex: 1, color: TravelColors.ink, fontSize: 13, fontWeight: '700' },
  storageSize: { color: TravelColors.green, fontSize: 11, fontWeight: '600' },
  storageNote: { marginTop: 8, color: TravelColors.muted, fontSize: 11, lineHeight: 17 },
});

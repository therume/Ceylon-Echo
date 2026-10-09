import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, ScreenFrame, TravelColors } from '@/components/travel-ui';

const stops = [
  { day: 'DAY 1', title: 'Sigiriya Ancient Fortress', detail: 'Sunrise climb · 2–3 hours' },
  { day: 'DAY 1', title: 'Dambulla Cave Temple', detail: 'Golden Temple · 1–2 hours' },
  { day: 'DAY 2', title: 'Polonnaruwa Ancient City', detail: 'Cycle the ancient ruins · 3 hours' },
];

export default function SuggestedRouteScreen() {
  return (
    <ScreenFrame title="Suggested Route" subtitle="A thoughtful journey through Sri Lanka’s Cultural Triangle.">
      <Image
        accessibilityLabel="Sigiriya Rock Fortress rising above the forest"
        contentFit="cover"
        source={require('../../../assets/images/Language(8).jpg')}
        style={styles.hero}
        transition={250}
      />
      <View style={styles.routeSummary}>
        <Text style={styles.routeTitle}>The Cultural Triangle</Text>
        <Text style={styles.routeSub}>3 days · 3 stops · History & heritage</Text>
      </View>
      <View style={styles.timeline}>
        {stops.map((stop, index) => (
          <View key={stop.title} style={styles.stopRow}>
            <View style={styles.timelineColumn}>
              <View style={[styles.stopDot, index === 0 && styles.firstDot]}>
                <Text style={styles.stopNumber}>{index + 1}</Text>
              </View>
              {index < stops.length - 1 ? <View style={styles.connector} /> : null}
            </View>
            <View style={styles.stopContent}>
              <Text style={styles.stopDay}>{stop.day}</Text>
              <Text style={styles.stopTitle}>{stop.title}</Text>
              <Text style={styles.stopDetail}>{stop.detail}</Text>
            </View>
            <Text style={styles.stopMore}>›</Text>
          </View>
        ))}
      </View>
      <PrimaryButton
        title="Navigate this route"
        onPress={() => router.push('/(tabs)/map')}
        style={styles.button}
      />
      <Text style={styles.helper}>You can adjust this itinerary any time.</Text>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  hero: { height: 190, borderRadius: 16 },
  routeSummary: {
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#f2eee4',
  },
  routeTitle: { color: TravelColors.ink, fontFamily: 'serif', fontSize: 19, fontWeight: '700' },
  routeSub: { marginTop: 5, color: TravelColors.muted, fontSize: 11 },
  timeline: { marginTop: 18 },
  stopRow: { minHeight: 72, flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  timelineColumn: { width: 28, alignItems: 'center' },
  stopDot: {
    zIndex: 1,
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c8d8cd',
    borderRadius: 13,
    backgroundColor: '#ffffff',
  },
  firstDot: { borderColor: TravelColors.orange, backgroundColor: TravelColors.orange },
  stopNumber: { color: TravelColors.green, fontSize: 10, fontWeight: '700' },
  connector: {
    position: 'absolute',
    top: 27,
    bottom: -1,
    width: 1,
    backgroundColor: '#cedbd1',
  },
  stopContent: { flex: 1, paddingBottom: 12 },
  stopDay: { color: TravelColors.orange, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  stopTitle: { marginTop: 4, color: TravelColors.ink, fontSize: 13, fontWeight: '700' },
  stopDetail: { marginTop: 4, color: TravelColors.muted, fontSize: 11 },
  stopMore: { color: TravelColors.green, fontSize: 21 },
  button: { marginTop: 18, backgroundColor: TravelColors.green },
  helper: { marginTop: 10, color: TravelColors.muted, fontSize: 10, textAlign: 'center' },
});

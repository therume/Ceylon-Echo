import { useEffect, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import type { SriLankaMapProps } from '@/components/sri-lanka-map.types';

const sriLankaRegion = {
  latitude: 7.8731,
  longitude: 80.7718,
  latitudeDelta: 3.6,
  longitudeDelta: 3.6,
};

export default function SriLankaMap({
  attractions,
  onAttractionPress,
  onRecenterReady,
}: SriLankaMapProps) {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    onRecenterReady(() => mapRef.current?.animateToRegion(sriLankaRegion, 350));
    return () => onRecenterReady(() => {});
  }, [onRecenterReady]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFill}
      initialRegion={sriLankaRegion}
      showsCompass
      showsScale>
      {attractions.map((attraction) => (
        <Marker
          key={attraction.id}
          coordinate={{
            latitude: attraction.latitude,
            longitude: attraction.longitude,
          }}
          title={attraction.name}
          description={[
            attraction.location,
            attraction.category,
            attraction.description,
          ]
            .filter(Boolean)
            .join(' · ')}
          onCalloutPress={() => onAttractionPress(attraction.id)}
        />
      ))}
    </MapView>
  );
}

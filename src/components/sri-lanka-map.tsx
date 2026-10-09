import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SriLankaMapProps } from '@/components/sri-lanka-map.types';

type GoogleMap = {
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
};

type GoogleMarker = {
  setMap: (map: GoogleMap | null) => void;
};

type GoogleInfoWindow = {
  open: (options: { map: GoogleMap; anchor: GoogleMarker }) => void;
  setContent: (content: HTMLElement) => void;
};

type GoogleMapsApi = {
  Map: new (
    element: HTMLElement,
    options: {
      center: { lat: number; lng: number };
      zoom: number;
      mapTypeControl: boolean;
      streetViewControl: boolean;
      fullscreenControl: boolean;
    },
  ) => GoogleMap;
  Marker: new (options: {
    map: GoogleMap;
    position: { lat: number; lng: number };
    title: string;
  }) => GoogleMarker;
  InfoWindow: new (options: { maxWidth: number }) => GoogleInfoWindow;
  event: {
    addListener: (
      instance: GoogleMarker,
      eventName: 'click',
      handler: () => void,
    ) => void;
  };
};

type GoogleMapsWindow = Window & {
  google?: { maps?: GoogleMapsApi };
};

const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };
let mapsApiPromise: Promise<GoogleMapsApi> | null = null;

function loadGoogleMapsApi(apiKey: string): Promise<GoogleMapsApi> {
  const existingApi = (window as GoogleMapsWindow).google?.maps;
  if (existingApi) {
    return Promise.resolve(existingApi);
  }
  if (mapsApiPromise) {
    return mapsApiPromise;
  }

  mapsApiPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const maps = (window as GoogleMapsWindow).google?.maps;
      if (maps) {
        resolve(maps);
      } else {
        mapsApiPromise = null;
        reject(new Error('Google Maps JavaScript API did not initialize.'));
      }
    };
    script.onerror = () => {
      mapsApiPromise = null;
      reject(new Error('Google Maps could not be loaded. Check the API key and network connection.'));
    };
    document.head.appendChild(script);
  });

  return mapsApiPromise;
}

export default function SriLankaMap({
  attractions,
  onAttractionPress,
  onRecenterReady,
}: SriLankaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    let active = true;
    let map: GoogleMap | null = null;
    let markers: GoogleMarker[] = [];
    let infoWindow: GoogleInfoWindow | null = null;

    if (!apiKey) {
      onRecenterReady(() => {});
      return () => onRecenterReady(() => {});
    }

    void loadGoogleMapsApi(apiKey)
      .then((maps) => {
        if (!active || !containerRef.current) {
          return;
        }

        map = new maps.Map(containerRef.current, {
          center: sriLankaCenter,
          zoom: 7,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const createdMap = map;
        infoWindow = new maps.InfoWindow({ maxWidth: 280 });
        onRecenterReady(() => {
          createdMap.setCenter(sriLankaCenter);
          createdMap.setZoom(7);
        });
        markers = attractions.map((attraction) => {
          const marker = new maps.Marker({
            map: createdMap,
            position: { lat: attraction.latitude, lng: attraction.longitude },
            title: attraction.name,
          });
          maps.event.addListener(marker, 'click', () => {
            const content = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = attraction.name;
            content.appendChild(title);

            const details = [attraction.location, attraction.category].filter(Boolean).join(' · ');
            if (details) {
              const location = document.createElement('p');
              location.textContent = details;
              content.appendChild(location);
            }

            if (attraction.description) {
              const description = document.createElement('p');
              description.textContent = attraction.description;
              content.appendChild(description);
            }

            const openButton = document.createElement('button');
            openButton.type = 'button';
            openButton.textContent = 'View attraction';
            openButton.addEventListener('click', () => onAttractionPress(attraction.id));
            content.appendChild(openButton);

            infoWindow?.setContent(content);
            infoWindow?.open({ map: createdMap, anchor: marker });
          });
          return marker;
        });
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Google Maps failed to load.');
        }
      });

    return () => {
      active = false;
      markers.forEach((marker) => marker.setMap(null));
      infoWindow = null;
      onRecenterReady(() => {});
    };
  }, [apiKey, attractions, onAttractionPress, onRecenterReady]);
  const visibleError =
    !apiKey
      ? 'Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local and enable the Google Maps JavaScript API.'
      : error;

  return (
    <View style={styles.container}>
      <div
        ref={containerRef}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      {visibleError ? (
        <View style={styles.messageOverlay}>
          <Text style={styles.message}>{visibleError}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  messageOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#eaf0e8',
  },
  message: {
    color: '#59635c',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});

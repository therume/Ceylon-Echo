export type MappedAttraction = {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  category?: string;
  description?: string;
};

export type SriLankaMapProps = {
  attractions: MappedAttraction[];
  onAttractionPress: (id: string) => void;
  onRecenterReady: (recenter: () => void) => void;
};

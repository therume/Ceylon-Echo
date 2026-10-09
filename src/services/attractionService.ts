import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

import { requireFirestore } from '@/lib/firebase';

export type UploadedMedia = {
  name: string;
  path: string;
  url: string;
  contentType: string;
};

export type Attraction = {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  photos: UploadedMedia[];
  audioGuide: UploadedMedia | null;
};

export async function getAttractions(): Promise<Attraction[]> {
  const snapshot = await getDocs(
    query(collection(requireFirestore(), 'attractions'), orderBy('name', 'asc')),
  );
  return snapshot.docs.map((item) => parseAttraction(item.id, item.data()));
}

export function subscribeToAttractions(
  onAttractions: (attractions: Attraction[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(requireFirestore(), 'attractions'), orderBy('name', 'asc')),
    (snapshot) => {
      try {
        onAttractions(snapshot.docs.map((item) => parseAttraction(item.id, item.data())));
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Attraction data is invalid.'));
      }
    },
    onError,
  );
}

export async function getAttractionById(id: string): Promise<Attraction | null> {
  const snapshot = await getDoc(doc(requireFirestore(), 'attractions', id));
  return snapshot.exists() ? parseAttraction(snapshot.id, snapshot.data()) : null;
}

export async function getAttractionsByIds(ids: string[]): Promise<Attraction[]> {
  const attractions = await Promise.all(ids.map((id) => getAttractionById(id)));
  return attractions.filter((item): item is Attraction => item !== null);
}

function parseAttraction(id: string, data: DocumentData): Attraction {
  if (
    typeof data.name !== 'string' ||
    typeof data.category !== 'string' ||
    typeof data.location !== 'string' ||
    !isNullableNumber(data.latitude) ||
    !isNullableNumber(data.longitude) ||
    !Array.isArray(data.photos) ||
    !data.photos.every(isUploadedMedia) ||
    (data.audioGuide !== null && !isUploadedMedia(data.audioGuide))
  ) {
    throw new Error(`Attraction "${id}" has invalid Firestore data.`);
  }

  const description = parseDescription(data.description);

  return {
    id,
    name: data.name,
    category: data.category,
    description,
    location: data.location,
    latitude: data.latitude,
    longitude: data.longitude,
    photos: data.photos,
    audioGuide: data.audioGuide,
  };
}

function parseDescription(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const localized = value as Record<string, unknown>;
    if (typeof localized.en === 'string') {
      return localized.en;
    }
    const fallback = Object.values(localized).find(
      (description): description is string => typeof description === 'string',
    );
    if (fallback) {
      return fallback;
    }
  }

  throw new Error('Attraction description must be a string or contain localized text.');
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isUploadedMedia(value: unknown): value is UploadedMedia {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const media = value as Record<string, unknown>;
  return (
    typeof media.name === 'string' &&
    typeof media.path === 'string' &&
    typeof media.url === 'string' &&
    typeof media.contentType === 'string'
  );
}

// KINRO Care — Google Places (New) text search for vets near an area.
// Results are fetched live and returned to the caller; nothing from Google is
// stored (only a placeId may ever be kept, per Google Maps Platform terms).
import 'server-only';

import type { NearbyPlace } from '@/lib/contracts/care';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const FIELDS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.rating',
  'places.userRatingCount',
  'places.googleMapsUri',
  'places.currentOpeningHours.openNow',
].join(',');

type RawPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  currentOpeningHours?: { openNow?: boolean };
};

export function mapPlace(p: RawPlace): NearbyPlace | null {
  if (!p.id || !p.displayName?.text) return null;
  return {
    placeId: p.id,
    name: p.displayName.text,
    address: p.formattedAddress ?? null,
    phone: p.nationalPhoneNumber ?? null,
    rating: typeof p.rating === 'number' ? p.rating : null,
    ratingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
    openNow:
      typeof p.currentOpeningHours?.openNow === 'boolean' ? p.currentOpeningHours.openNow : null,
    mapsUrl: p.googleMapsUri ?? null,
  };
}

export async function searchNearbyVets(area: string, apiKey: string): Promise<NearbyPlace[]> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELDS,
    },
    body: JSON.stringify({
      textQuery: `veterinary clinic in ${area}`,
      includedType: 'veterinary_care',
      strictTypeFiltering: true,
      regionCode: 'IN',
      maxResultCount: 20,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`places ${res.status}`);
  const data = (await res.json()) as { places?: RawPlace[] };
  return (data.places ?? []).map(mapPlace).filter((x): x is NearbyPlace => x !== null);
}

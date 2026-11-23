import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { mapPlace } from '@/lib/care/google-places';

describe('mapPlace', () => {
  it('maps a Google place and keeps only safe fields', () => {
    const p = mapPlace({
      id: 'abc',
      displayName: { text: 'Paws Clinic' },
      formattedAddress: 'Madhapur, Hyderabad',
      nationalPhoneNumber: '040 1234 5678',
      rating: 4.6,
      userRatingCount: 120,
      googleMapsUri: 'https://maps.google.com/?cid=1',
      currentOpeningHours: { openNow: true },
    });
    expect(p).toMatchObject({ placeId: 'abc', name: 'Paws Clinic', openNow: true, rating: 4.6 });
  });
  it('drops entries without id or name and nulls missing fields', () => {
    expect(mapPlace({ displayName: { text: 'X' } })).toBeNull();
    expect(mapPlace({ id: 'z', displayName: { text: 'Y' } })).toMatchObject({
      phone: null,
      rating: null,
      openNow: null,
    });
  });
});

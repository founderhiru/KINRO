// KINRO Care — single decision point for "Nearby on Google".
// Dormant by default: Google Places is contacted only when an operator sets
// CARE_NEARBY_ENABLED=true AND provides GOOGLE_PLACES_API_KEY. The key alone
// is never enough, so a stray key cannot start paid calls.
import 'server-only';

import { env } from '@/lib/env';

/** The Places API key, or null while Nearby is switched off. */
export function nearbyKey(): string | null {
  if (env.CARE_NEARBY_ENABLED !== 'true') return null;
  return env.GOOGLE_PLACES_API_KEY ?? null;
}

export function nearbyEnabled(): boolean {
  return nearbyKey() !== null;
}

/**
 * Builds a standard Google Maps URL that opens the person's own Maps app (or
 * the browser). This is a plain link: no API key, no Maps SDK and no billable
 * Google request is made by KINRO.
 * https://developers.google.com/maps/documentation/urls/get-started
 */
export function mapsDirectionsUrl(place: {
  name: string;
  addressLine?: string | null;
  locality?: string | null;
  city?: string | null;
}): string | null {
  const parts = [place.name, place.addressLine, place.locality, place.city]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  // A name alone is too vague to navigate to; need at least a place too.
  if (parts.length < 2) return null;
  const query = encodeURIComponent(parts.join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

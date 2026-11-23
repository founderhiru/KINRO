// KINRO Care — client-safe contracts. Keep free of Prisma/server-only imports.
import { z } from 'zod';

export const CARE_MODES = ['in_person', 'online'] as const;
export const CARE_REASONS = ['check_up', 'vaccination', 'skin_ears', 'follow_up', 'other'] as const;
export const CARE_DAYS = ['today', 'tomorrow', 'this_week'] as const;
export const APPOINTMENT_STATUSES = [
  'requested',
  'confirmed',
  'declined',
  'cancelled',
  'completed',
] as const;

export const CareProviderItem = z.object({
  id: z.string(),
  kind: z.enum(['vet', 'clinic']),
  name: z.string(),
  qualifications: z.string().nullable(),
  specialties: z.array(z.string()),
  languages: z.array(z.string()),
  city: z.string(),
  locality: z.string().nullable(),
  verificationStatus: z.string(),
  verifiedUntil: z.string().nullable(),
  offersOnline: z.boolean(),
});
export type CareProviderItem = z.infer<typeof CareProviderItem>;

export const CareProviderList = z.object({ items: z.array(CareProviderItem) });
export type CareProviderList = z.infer<typeof CareProviderList>;

export const CareProviderDetail = CareProviderItem.extend({
  addressLine: z.string().nullable(),
  registrationCouncil: z.string().nullable(),
  registrationLast4: z.string().nullable(),
  verifiedAt: z.string().nullable(),
  clinic: z.object({ id: z.string(), name: z.string() }).nullable(),
  vets: z.array(CareProviderItem),
});
export type CareProviderDetail = z.infer<typeof CareProviderDetail>;

export const AppointmentWrite = z.object({
  providerId: z.string().min(1),
  dogId: z.string().min(1),
  mode: z.enum(CARE_MODES),
  reason: z.enum(CARE_REASONS),
  preferredDay: z.enum(CARE_DAYS).optional(),
  note: z.string().trim().max(500).optional(),
});
export type AppointmentWrite = z.infer<typeof AppointmentWrite>;

export const AppointmentItem = z.object({
  id: z.string(),
  relationshipId: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  dogId: z.string(),
  dogName: z.string(),
  mode: z.enum(CARE_MODES),
  reason: z.string(),
  preferredDay: z.string().nullable(),
  status: z.enum(APPOINTMENT_STATUSES),
  scheduledAt: z.string().nullable(),
  createdAt: z.string(),
});
export type AppointmentItem = z.infer<typeof AppointmentItem>;

export const AppointmentCancel = z.object({ status: z.literal('cancelled') });

export const CareRelationshipItem = z.object({
  id: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  providerKind: z.enum(['vet', 'clinic']),
  dogId: z.string(),
  dogName: z.string(),
  visitCount: z.number().int(),
  activeShare: z
    .object({ id: z.string(), categories: z.array(z.string()), expiresAt: z.string() })
    .nullable(),
});
export type CareRelationshipItem = z.infer<typeof CareRelationshipItem>;

// GET /api/care/connections — everything the Messages "Care" segment shows.
export const CareConnections = z.object({
  appointments: z.array(AppointmentItem),
  relationships: z.array(CareRelationshipItem),
});
export type CareConnections = z.infer<typeof CareConnections>;

// "Nearby on Google": live, read-only results. Nothing but placeId is ever
// stored by KINRO (Google Maps Platform terms), so these are never persisted.
export const NearbyPlace = z.object({
  placeId: z.string(),
  name: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  rating: z.number().nullable(),
  ratingCount: z.number().nullable(),
  openNow: z.boolean().nullable(),
  mapsUrl: z.string().nullable(),
});
export type NearbyPlace = z.infer<typeof NearbyPlace>;

export const NearbyPlaces = z.object({
  configured: z.boolean(),
  area: z.string(),
  items: z.array(NearbyPlace),
});
export type NearbyPlaces = z.infer<typeof NearbyPlaces>;

// @polsia:user-owned — public dog discovery endpoint (GET) + Phase 3
// authenticated dog creation (POST). POST requires a session and always
// derives ownerId from that session, never from the request body.
// Phase 5 adds coverPhotoUrl/hasHealthRecords (public-safe summaries only —
// see DogProfileItem's contract comment) and a verifiedOnly filter to GET.
import 'server-only';

import { NextResponse } from 'next/server';
import { AuthError, getAuthenticatedUser, requireAuthenticatedUser } from '@/lib/auth';
import { DogDiscoveryQuery, DogProfileList, DogProfileWrite } from '@/lib/contracts/dog-profiles';
import { prisma } from '@/lib/db';
import { findKnownCity } from '@/lib/india-cities';
import { getBlockedUserIds } from '@/lib/safety';

// Minimal URL-safe slug from the dog's name plus a short random suffix for
// uniqueness — there is no per-owner slug editing UI, so this only needs to
// avoid collisions, not be pretty.
function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'dog'}-${Math.random().toString(36).slice(2, 8)}`;
}

export const dynamic = 'force-dynamic';

const RADIUS_OPTIONS = [5, 10, 25, 50, 75, 100] as const;

function findCityCenter(city: string | undefined) {
  const entry = city ? findKnownCity(city) : undefined;
  return entry
    ? { name: entry.name, latitude: entry.latitude, longitude: entry.longitude }
    : undefined;
}

function haversineDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const latitudeOne = toRadians(from.latitude);
  const latitudeTwo = toRadians(to.latitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const parsed = DogDiscoveryQuery.safeParse(Object.fromEntries(searchParams.entries()));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid discovery filters',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const cityCenter = findCityCenter(parsed.data.city);
    // A city outside the known list has no coordinates to measure from, so
    // match dogs listed in that city by name instead of returning everyone.
    const unlistedCity = parsed.data.city && !cityCenter ? parsed.data.city : undefined;
    // Discovery is public, but a signed-in caller never sees dogs owned by
    // someone they blocked or who blocked them.
    const viewer = await getAuthenticatedUser();
    const blockedIds = viewer ? await getBlockedUserIds(viewer.id) : [];
    const profiles = await prisma.dogProfile.findMany({
      where: {
        ...(blockedIds.length ? { NOT: { ownerId: { in: blockedIds } } } : {}),
        ...(parsed.data.breed ? { breed: { equals: parsed.data.breed, mode: 'insensitive' } } : {}),
        ...(unlistedCity ? { city: { equals: unlistedCity, mode: 'insensitive' } } : {}),
        ...(parsed.data.verifiedOnly ? { isVerified: true } : {}),
      },
      include: {
        // Cover photo only (position 0) — never the full gallery on the
        // public endpoint. hasHealthRecords is a count, never the records
        // themselves; see DogProfileItem's comment for why.
        photos: { where: { position: 0 }, take: 1, select: { url: true } },
        _count: { select: { healthRecords: true } },
      },
    });

    const profilesWithDistance = profiles.map((profile) => ({
      id: profile.id,
      slug: profile.slug,
      name: profile.name,
      breed: profile.breed,
      city: profile.city,
      latitude: profile.latitude,
      longitude: profile.longitude,
      ageYears: profile.ageYears,
      sex: profile.sex,
      bio: profile.bio,
      isVerified: profile.isVerified,
      coverPhotoUrl: profile.photos[0]?.url ?? null,
      hasHealthRecords: profile._count.healthRecords > 0,
      distanceKm: cityCenter
        ? Math.round(
            haversineDistanceKm(cityCenter, {
              latitude: profile.latitude,
              longitude: profile.longitude,
            }) * 10,
          ) / 10
        : null,
    }));

    const matchingProfiles = profilesWithDistance.filter(
      (profile) => profile.distanceKm === null || profile.distanceKm <= parsed.data.radiusKm,
    );

    if (cityCenter) {
      matchingProfiles.sort(
        (first, second) =>
          (first.distanceKm ?? Number.POSITIVE_INFINITY) -
            (second.distanceKm ?? Number.POSITIVE_INFINITY) ||
          first.name.localeCompare(second.name),
      );
    } else {
      matchingProfiles.sort((first, second) => first.name.localeCompare(second.name));
    }

    const breeds = [...new Set(matchingProfiles.map((profile) => profile.breed))].sort((a, b) =>
      a.localeCompare(b),
    );
    const cities = [...new Set(matchingProfiles.map((profile) => profile.city))].sort((a, b) =>
      a.localeCompare(b),
    );

    const payload = DogProfileList.parse({
      items: matchingProfiles,
      total: matchingProfiles.length,
      filters: { breeds, cities, radiusOptions: [...RADIUS_OPTIONS] },
    });

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to load dog profiles' }, { status: 500 });
  }
}

// Phase 3 — create a dog profile owned by the authenticated user. ownerId
// is ALWAYS the server-derived session user's id; nothing from the request
// body ever reaches the ownerId column.
export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();

    const parsed = DogProfileWrite.safeParse(await request.json());
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(fieldErrors)) {
        const message = messages?.[0];
        if (message) {
          errors[field] = message;
        }
      }
      return NextResponse.json({ errors }, { status: 400 });
    }

    const created = await prisma.dogProfile.create({
      data: {
        ...parsed.data,
        slug: slugify(parsed.data.name),
        isVerified: false,
        ownerId: user.id,
      },
    });

    // A brand-new dog has neither yet — supplied explicitly since
    // OwnedDogProfileItem no longer defaults these (see its contract).
    return NextResponse.json({ ...created, photos: [], healthRecords: [] }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unable to create dog profile' }, { status: 500 });
  }
}

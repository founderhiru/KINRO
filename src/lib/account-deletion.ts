// @polsia:user-owned — permanently deletes a user and everything they own.
//
// Order matters: dog profiles use onDelete SetNull for their owner, so
// deleting only the user would leave their dogs (with photos and private
// health records) orphaned in the database and in storage. We therefore
// collect the storage keys first, delete the dogs explicitly, then the user.
// Deleting the user cascades to sessions, linked sign-in accounts, owner
// profile, interests sent, matches, conversations, the messages they sent,
// entitlements, notifications and blocks.
//
// Reports are intentionally kept (they have no foreign keys): they are safety
// records and may concern, or have been made by, other people.
import 'server-only';

import { prisma } from '@/lib/db';
import { deletePrivateObject, deletePublicObject } from '@/lib/storage';

export async function deleteAccount(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, phoneNumber: true },
  });
  if (!user) return;

  const dogs = await prisma.dogProfile.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      photos: { select: { storageKey: true } },
      healthRecords: { select: { documents: { select: { storageKey: true } } } },
    },
  });

  type OwnedDog = {
    photos: { storageKey: string }[];
    healthRecords: { documents: { storageKey: string }[] }[];
  };
  const owned: OwnedDog[] = dogs;
  const photoKeys: string[] = owned.flatMap((d) => d.photos.map((p) => p.storageKey));
  const documentKeys: string[] = owned.flatMap((d) =>
    d.healthRecords.flatMap((r) => r.documents.map((doc) => doc.storageKey)),
  );

  // Database first: once the rows are gone the account is gone, whatever
  // happens to the files. A failed file delete must not leave a live account.
  const identifiers = [user.email, user.phoneNumber].filter((v): v is string => !!v);
  await prisma.$transaction([
    prisma.dogProfile.deleteMany({ where: { ownerId: userId } }),
    prisma.verification.deleteMany({ where: { identifier: { in: identifiers } } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  await Promise.allSettled([
    ...photoKeys.map((key: string) => deletePublicObject(key)),
    ...documentKeys.map((key: string) => deletePrivateObject(key)),
  ]);
}

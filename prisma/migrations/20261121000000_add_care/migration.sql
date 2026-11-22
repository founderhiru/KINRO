-- KINRO Care: additive only. Four new tables; no existing table, column or
-- row is changed. Hand-authored like the earlier migrations.

-- CreateTable
CREATE TABLE "care_provider" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qualifications" TEXT,
    "specialties" TEXT[],
    "languages" TEXT[],
    "city" TEXT NOT NULL,
    "locality" TEXT,
    "addressLine" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "verifiedAt" TIMESTAMP(3),
    "verifiedUntil" TIMESTAMP(3),
    "registrationCouncil" TEXT,
    "registrationLast4" TEXT,
    "parentId" TEXT,
    "offersOnline" BOOLEAN NOT NULL DEFAULT false,
    "listingStatus" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_relationship" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_appointment" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'in_person',
    "reason" TEXT NOT NULL,
    "preferredDay" TEXT,
    "preferredTime" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_share_grant" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "categories" TEXT[],
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "record_share_grant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "care_provider_slug_key" ON "care_provider"("slug");
CREATE INDEX "care_provider_listingStatus_kind_city_idx" ON "care_provider"("listingStatus", "kind", "city");
CREATE UNIQUE INDEX "care_relationship_ownerId_dogId_providerId_key" ON "care_relationship"("ownerId", "dogId", "providerId");
CREATE INDEX "care_relationship_providerId_idx" ON "care_relationship"("providerId");
CREATE INDEX "care_appointment_relationshipId_status_idx" ON "care_appointment"("relationshipId", "status");
CREATE INDEX "record_share_grant_relationshipId_idx" ON "record_share_grant"("relationshipId");

-- AddForeignKey
ALTER TABLE "care_provider" ADD CONSTRAINT "care_provider_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "care_provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "care_relationship" ADD CONSTRAINT "care_relationship_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "care_relationship" ADD CONSTRAINT "care_relationship_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "DogProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "care_relationship" ADD CONSTRAINT "care_relationship_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "care_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "care_appointment" ADD CONSTRAINT "care_appointment_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "care_relationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "record_share_grant" ADD CONSTRAINT "record_share_grant_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "care_relationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

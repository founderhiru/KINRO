-- Additive: where a provider receives visit requests, and the owner's number.
ALTER TABLE "care_provider" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "care_provider" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "care_appointment" ADD COLUMN "ownerPhone" TEXT;

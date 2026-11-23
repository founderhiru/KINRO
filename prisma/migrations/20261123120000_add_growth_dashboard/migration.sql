-- Founder Growth Dashboard (Phase 1). Additive only: two new tables, no change to any
-- existing table, no data written. Safe to run on a live database.
--
-- Hand-authored like the other migrations (the authoring sandbox cannot download
-- Prisma's engines). Before the first real deploy, confirm it matches the schema with:
--   prisma migrate diff --from-migrations prisma/migrations \
--     --to-schema-datamodel prisma/schema --shadow-database-url <url> --script
-- (an empty diff means they agree).

-- CreateTable
CREATE TABLE "download_click" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'direct',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "download_click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_snapshot" (
    "id" TEXT NOT NULL,
    "weekEnding" DATE NOT NULL,
    "platform" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "download_click_createdAt_idx" ON "download_click"("createdAt");

-- CreateIndex
CREATE INDEX "download_click_platform_createdAt_idx" ON "download_click"("platform", "createdAt");

-- CreateIndex
CREATE INDEX "store_snapshot_weekEnding_idx" ON "store_snapshot"("weekEnding");

-- CreateIndex
CREATE UNIQUE INDEX "store_snapshot_weekEnding_platform_metric_key" ON "store_snapshot"("weekEnding", "platform", "metric");

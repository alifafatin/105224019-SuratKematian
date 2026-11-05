CREATE TABLE "DeathReport" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AWAITING_RTRW_APPROVAL',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterName" TEXT NOT NULL,
    "reporterNik" TEXT,
    "reporterContact" TEXT NOT NULL,
    "authMethod" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "deceasedName" TEXT NOT NULL,
    "deceasedNik" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "dateOfDeath" TEXT NOT NULL,
    "timeOfDeath" TEXT NOT NULL,
    "placeOfDeath" TEXT NOT NULL,
    "causeOfDeath" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "rt" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "assignedRTRW" JSONB NOT NULL,
    "documentNames" JSONB NOT NULL,
    "rtRwSignature" JSONB,
    "dukcapilIssuance" JSONB,
    "notes" TEXT,

    CONSTRAINT "DeathReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeathReport_registrationNumber_key" ON "DeathReport"("registrationNumber");
CREATE INDEX "DeathReport_submittedAt_idx" ON "DeathReport"("submittedAt");
CREATE INDEX "DeathReport_status_idx" ON "DeathReport"("status");

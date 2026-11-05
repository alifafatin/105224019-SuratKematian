ALTER TABLE "DeathReport"
ADD COLUMN "reporterProfileId" INTEGER;

CREATE INDEX "DeathReport_reporterProfileId_idx"
ON "DeathReport"("reporterProfileId");

ALTER TABLE "DeathReport"
ADD CONSTRAINT "DeathReport_reporterProfileId_fkey"
FOREIGN KEY ("reporterProfileId") REFERENCES "WargaProfile"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

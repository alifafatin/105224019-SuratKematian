CREATE TABLE "WargaProfile" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WargaProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WargaProfile_phone_key" ON "WargaProfile"("phone");

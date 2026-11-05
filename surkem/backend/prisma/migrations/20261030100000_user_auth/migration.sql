ALTER TABLE "User" RENAME COLUMN "name" TO "nama";
ALTER TABLE "User" ADD COLUMN "password" TEXT;

UPDATE "User"
SET "nama" = "email"
WHERE "nama" IS NULL;

UPDATE "User"
SET "password" = '$2b$12$CGXjv.c0wWHLaqk6lPZN1OyLf.iVw8DwAY.9GGosGUIMTVN95zAUK'
WHERE "password" IS NULL;

ALTER TABLE "User" ALTER COLUMN "nama" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

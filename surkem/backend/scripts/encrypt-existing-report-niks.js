require('dotenv').config();

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const {
  decryptSensitiveValue,
  encryptSensitiveValue,
  getEncryptionKey,
} = require('../src/security/sensitive-data');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL belum dikonfigurasi untuk migrasi NIK.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function migrateNik(value, context) {
  if (value === null) return null;

  if (value.startsWith('v1.')) {
    decryptSensitiveValue(value, context);
    return value;
  }

  if (!/^\d{16}$/.test(value)) {
    throw new Error(`Nilai lama pada ${context} bukan NIK 16 digit yang valid.`);
  }
  return encryptSensitiveValue(value, context);
}

async function main() {
  getEncryptionKey();
  const rows = await prisma.deathReport.findMany({
    select: {
      id: true,
      reporterNik: true,
      deceasedNik: true,
    },
  });

  let updatedCount = 0;
  for (const row of rows) {
    const reporterNik = migrateNik(row.reporterNik, 'DeathReport.reporterNik');
    const deceasedNik = migrateNik(row.deceasedNik, 'DeathReport.deceasedNik');
    if (reporterNik === row.reporterNik && deceasedNik === row.deceasedNik) continue;

    await prisma.deathReport.update({
      where: { id: row.id },
      data: { reporterNik, deceasedNik },
    });
    updatedCount += 1;
  }

  console.log(`Migrasi NIK selesai: ${updatedCount} dari ${rows.length} pengajuan diperbarui.`);
}

main()
  .catch((error) => {
    console.error('Gagal memigrasikan NIK pengajuan:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

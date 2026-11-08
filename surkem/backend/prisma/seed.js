require('dotenv').config();

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { encryptSensitiveValue } = require('../src/security/sensitive-data');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL belum dikonfigurasi untuk seeding.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const profile = await prisma.wargaProfile.upsert({
    where: { phone: '628111000000' },
    update: { nama: 'Warga Contoh' },
    create: {
      nama: 'Warga Contoh',
      phone: '628111000000',
    },
  });

  await prisma.deathReport.upsert({
    where: { registrationNumber: 'SRK-SEED-2026-001' },
    update: {
      reporterProfileId: profile.id,
      reporterNik: encryptSensitiveValue('3201010101010001', 'DeathReport.reporterNik'),
      deceasedNik: encryptSensitiveValue('3201010101010002', 'DeathReport.deceasedNik'),
    },
    create: {
      registrationNumber: 'SRK-SEED-2026-001',
      reporterName: 'Warga Contoh',
      reporterNik: encryptSensitiveValue('3201010101010001', 'DeathReport.reporterNik'),
      reporterContact: profile.phone,
      reporterProfileId: profile.id,
      authMethod: 'whatsapp',
      relation: 'Anak',
      deceasedName: 'Almarhum Contoh',
      deceasedNik: encryptSensitiveValue('3201010101010002', 'DeathReport.deceasedNik'),
      gender: 'Laki-laki',
      dateOfBirth: '1950-01-01',
      dateOfDeath: '2026-01-01',
      timeOfDeath: '10:00',
      placeOfDeath: 'Rumah',
      causeOfDeath: 'Data sintetis untuk pengujian',
      address: 'Jl. Contoh No. 1',
      rt: '01',
      rw: '01',
      kelurahan: 'Kelurahan Contoh',
      kecamatan: 'Kecamatan Contoh',
      city: 'Kota Contoh',
      assignedRTRW: {
        rt: '01',
        rw: '01',
        kelurahan: 'Kelurahan Contoh',
        kecamatan: 'Kecamatan Contoh',
        city: 'Kota Contoh',
        officerName: 'Petugas Contoh',
        officerPhone: '',
        officerEmail: '',
        publicKeyEd25519: '',
      },
      documentNames: {
        ktpDeceasedName: 'ktp-contoh.pdf',
        kkDeceasedName: 'kk-contoh.pdf',
        hospitalLetterName: 'surat-kematian-contoh.pdf',
      },
    },
  });
}

main()
  .catch((error) => {
    console.error('Gagal menjalankan seed data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

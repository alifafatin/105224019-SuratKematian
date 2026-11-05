import { z } from 'zod';

export const assignedOfficerSchema = z.object({
  rt: z.string(),
  rw: z.string(),
  kelurahan: z.string(),
  kecamatan: z.string(),
  city: z.string(),
  officerName: z.string(),
  officerPhone: z.string(),
  officerEmail: z.string(),
  publicKeyEd25519: z.string(),
});

export const createDeathReportSchema = z.object({
  reporterName: z.string().trim().min(1, 'Nama lengkap pelapor wajib diisi.').max(120),
  reporterNik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'NIK pelapor harus tepat 16 digit angka.')
    .or(z.literal('')),
  reporterContact: z.string().trim().min(1, 'Kontak notifikasi wajib diisi.').max(254),
  authMethod: z.enum(['email', 'whatsapp']),
  relation: z.string().trim().min(1, 'Hubungan keluarga wajib dipilih.').max(120),
  deceasedName: z.string().trim().min(1, 'Nama almarhum wajib diisi.').max(120),
  deceasedNik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'NIK almarhum harus tepat 16 digit angka.'),
  gender: z.enum(['Laki-laki', 'Perempuan']),
  dateOfBirth: z.string().trim().max(10, 'Tanggal lahir tidak valid.'),
  dateOfDeath: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal kematian wajib diisi dengan format yang valid.'),
  timeOfDeath: z.string().trim().min(1, 'Waktu kematian wajib diisi.').max(20),
  placeOfDeath: z.string().trim().min(1, 'Tempat kematian wajib diisi.').max(160),
  causeOfDeath: z.string().trim().min(1, 'Penyebab kematian wajib diisi.').max(500),
  address: z.string().trim().min(1, 'Alamat duka wajib diisi.').max(300),
  rt: z.string().trim().min(1, 'RT wajib diisi.').max(10),
  rw: z.string().trim().min(1, 'RW wajib diisi.').max(10),
  kelurahan: z.string().trim().min(1, 'Kelurahan wajib diisi.').max(120),
  kecamatan: z.string().trim().min(1, 'Kecamatan wajib diisi.').max(120),
  city: z.string().trim().min(1, 'Kota wajib diisi.').max(120),
  assignedRTRW: assignedOfficerSchema,
  documentNames: z.object({
    ktpDeceasedName: z.string().trim().min(1, 'Berkas KTP almarhum wajib dipilih.').max(255),
    kkDeceasedName: z.string().trim().min(1, 'Berkas Kartu Keluarga wajib dipilih.').max(255),
    hospitalLetterName: z.string().trim().min(1, 'Surat kematian medis wajib dipilih.').max(255),
  }),
  consent: z.literal(true, 'Persetujuan pemrosesan data wajib diberikan.'),
});

const reporterSchema = z.object({
  name: z.string(),
  nik: z.string(),
  email: z.string(),
  phone: z.string(),
  relation: z.string(),
  authMethod: z.enum(['email', 'whatsapp']),
  isVerified: z.boolean(),
  verifiedAt: z.string().optional(),
});

const deceasedSchema = z.object({
  fullName: z.string(),
  nik: z.string(),
  gender: z.enum(['Laki-laki', 'Perempuan']),
  dateOfBirth: z.string(),
  dateOfDeath: z.string(),
  timeOfDeath: z.string(),
  causeOfDeath: z.string(),
  placeOfDeath: z.string(),
  address: z.string(),
  rt: z.string(),
  rw: z.string(),
  kelurahan: z.string(),
  kecamatan: z.string(),
  city: z.string(),
});

const signatureSchema = z.object({
  algorithm: z.literal('Ed25519'),
  signerName: z.string(),
  signerRole: z.enum(['Ketua RT', 'Ketua RW', 'Petugas Dukcapil']),
  signatureHex: z.string(),
  publicKey: z.string(),
  timestamp: z.string(),
  verified: z.boolean(),
});

const issuanceSchema = z.object({
  issuedAt: z.string(),
  officerName: z.string(),
  officerNip: z.string(),
  certificateNumber: z.string(),
  qrValidationUrl: z.string(),
  pbkdf2Salt: z.string(),
  pbkdf2Iterations: z.number(),
});

export const deathReportApiSchema = z.object({
  id: z.string(),
  reporter: reporterSchema,
  deceased: deceasedSchema,
  status: z.enum([
    'DRAFT_ENCRYPTED',
    'AWAITING_RTRW_APPROVAL',
    'ED25519_SIGNED',
    'PROCESSING_DUKCAPIL',
    'CERTIFICATE_ISSUED',
  ]),
  assignedRTRW: assignedOfficerSchema,
  submittedAt: z.string(),
  documents: z.object({
    ktpDeceasedName: z.string().optional(),
    kkDeceasedName: z.string().optional(),
    hospitalLetterName: z.string().optional(),
    ktpReporterName: z.string().optional(),
    encryptionAlgorithm: z.literal('AES-256-GCM').optional(),
    payloadHashAes256Gcm: z.string().optional(),
    ivHex: z.string().optional(),
    encryptionTimestamp: z.string().optional(),
  }),
  rtRwSignature: signatureSchema.optional(),
  dukcapilIssuance: issuanceSchema.optional(),
  notes: z.string().optional(),
});

export const deathReportsResponseSchema = z.object({
  reports: z.array(deathReportApiSchema),
});

export const deathReportResponseSchema = z.object({
  report: deathReportApiSchema,
});

export type CreateDeathReportInput = z.infer<typeof createDeathReportSchema>;
export type DeathReportApi = z.infer<typeof deathReportApiSchema>;

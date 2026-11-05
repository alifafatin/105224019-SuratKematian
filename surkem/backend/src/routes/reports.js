const { Router } = require('express');
const { randomUUID } = require('node:crypto');
const { z } = require('zod');
const prisma = require('../config/prisma');

const router = Router();
const reportStatuses = [
  'DRAFT_ENCRYPTED',
  'AWAITING_RTRW_APPROVAL',
  'ED25519_SIGNED',
  'PROCESSING_DUKCAPIL',
  'CERTIFICATE_ISSUED',
];

function isValidDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const officerSchema = z.object({
  rt: z.string().trim().min(1).max(10),
  rw: z.string().trim().min(1).max(10),
  kelurahan: z.string().trim().min(1).max(120),
  kecamatan: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(120),
  officerName: z.string().trim().min(1).max(120),
  officerPhone: z.string().trim().max(30),
  officerEmail: z.string().trim().max(254),
  publicKeyEd25519: z.string().max(512),
});

const createReportSchema = z.object({
  reporterName: z.string().trim().min(1).max(120),
  reporterNik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'NIK pelapor harus tepat 16 digit angka.')
    .optional()
    .or(z.literal('')),
  reporterContact: z.string().trim().min(1).max(254),
  authMethod: z.enum(['email', 'whatsapp']),
  relation: z.string().trim().min(1).max(120),
  deceasedName: z.string().trim().min(1).max(120),
  deceasedNik: z.string().trim().regex(/^\d{16}$/, 'NIK almarhum harus tepat 16 digit angka.'),
  gender: z.enum(['Laki-laki', 'Perempuan']),
  dateOfBirth: z.string().trim().max(10).optional().or(z.literal('')),
  dateOfDeath: z.string().refine(isValidDate, 'Tanggal kematian tidak valid.'),
  timeOfDeath: z.string().trim().min(1).max(20),
  placeOfDeath: z.string().trim().min(1).max(160),
  causeOfDeath: z.string().trim().min(1).max(500),
  address: z.string().trim().min(1).max(300),
  rt: z.string().trim().min(1).max(10),
  rw: z.string().trim().min(1).max(10),
  kelurahan: z.string().trim().min(1).max(120),
  kecamatan: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(120),
  assignedRTRW: officerSchema,
  documentNames: z.object({
    ktpDeceasedName: z.string().trim().min(1).max(255),
    kkDeceasedName: z.string().trim().min(1).max(255),
    hospitalLetterName: z.string().trim().min(1).max(255),
  }),
  consent: z.literal(true),
}).superRefine((data, context) => {
  if (data.dateOfBirth && !isValidDate(data.dateOfBirth)) {
    context.addIssue({ code: 'custom', path: ['dateOfBirth'], message: 'Tanggal lahir tidak valid.' });
  }
  if (
    data.authMethod === 'email' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.reporterContact)
  ) {
    context.addIssue({ code: 'custom', path: ['reporterContact'], message: 'Email tidak valid.' });
  }
  if (data.authMethod === 'whatsapp') {
    const digits = data.reporterContact.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      context.addIssue({ code: 'custom', path: ['reporterContact'], message: 'Nomor telepon tidak valid.' });
    }
  }
});

const updateReportSchema = z.object({
  status: z.enum(reportStatuses),
  rtRwSignature: z.record(z.string(), z.unknown()).optional(),
  dukcapilIssuance: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().trim().max(1000).optional(),
});

function getFieldErrors(error) {
  return Object.fromEntries(
    error.issues.map((issue) => [
      issue.path[0] === 'documentNames' ? 'documents' : String(issue.path[0] || 'form'),
      issue.message,
    ])
  );
}

function toReport(row) {
  const isEmail = row.authMethod === 'email';
  return {
    id: row.registrationNumber,
    reporter: {
      name: row.reporterName,
      nik: row.reporterNik || '',
      email: isEmail ? row.reporterContact : '',
      phone: isEmail ? '' : row.reporterContact,
      relation: row.relation,
      authMethod: row.authMethod,
      isVerified: false,
    },
    deceased: {
      fullName: row.deceasedName,
      nik: row.deceasedNik,
      gender: row.gender,
      dateOfBirth: row.dateOfBirth || '',
      dateOfDeath: row.dateOfDeath,
      timeOfDeath: row.timeOfDeath,
      causeOfDeath: row.causeOfDeath,
      placeOfDeath: row.placeOfDeath,
      address: row.address,
      rt: row.rt,
      rw: row.rw,
      kelurahan: row.kelurahan,
      kecamatan: row.kecamatan,
      city: row.city,
    },
    status: row.status,
    assignedRTRW: row.assignedRTRW,
    submittedAt: row.submittedAt.toISOString(),
    documents: row.documentNames,
    rtRwSignature: row.rtRwSignature || undefined,
    dukcapilIssuance: row.dukcapilIssuance || undefined,
    notes: row.notes || undefined,
  };
}

router.get('/', async (_req, res) => {
  try {
    const rows = await prisma.deathReport.findMany({
      orderBy: { submittedAt: 'desc' },
    });
    return res.json({ reports: rows.map(toReport) });
  } catch (error) {
    console.error('Gagal mengambil daftar pengajuan:', error);
    return res.status(500).json({ error: 'Daftar pengajuan gagal dimuat.' });
  }
});

router.post('/', async (req, res) => {
  const input = createReportSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({
      error: 'Data pengajuan tidak valid atau belum lengkap.',
      fieldErrors: getFieldErrors(input.error),
    });
  }

  try {
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const id = randomUUID();
    const registrationNumber = `SRK-${dateStamp}-${id.slice(0, 6).toUpperCase()}`;
    const { consent: _consent, ...reportData } = input.data;
    const reporterProfile =
      input.data.authMethod === 'whatsapp'
        ? await prisma.wargaProfile.findUnique({
            where: {
              phone: input.data.reporterContact.replace(/\D/g, ''),
            },
            select: { id: true },
          })
        : null;
    const row = await prisma.deathReport.create({
      data: {
        id,
        registrationNumber,
        ...reportData,
        reporterNik: input.data.reporterNik || null,
        dateOfBirth: input.data.dateOfBirth || null,
        reporterProfileId: reporterProfile?.id,
      },
    });
    return res.status(201).json({ report: toReport(row) });
  } catch (error) {
    console.error('Gagal menyimpan pengajuan:', error);
    return res.status(500).json({ error: 'Pengajuan gagal disimpan.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await prisma.deathReport.findUnique({
      where: { registrationNumber: req.params.id },
    });
    if (!row) return res.status(404).json({ error: 'Pengajuan tidak ditemukan.' });
    return res.json({ report: toReport(row) });
  } catch (error) {
    console.error('Gagal mengambil detail pengajuan:', error);
    return res.status(500).json({ error: 'Detail pengajuan gagal dimuat.' });
  }
});

router.patch('/:id', async (req, res) => {
  const input = updateReportSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({
      error: 'Perubahan status pengajuan tidak valid.',
      fieldErrors: getFieldErrors(input.error),
    });
  }

  try {
    const existing = await prisma.deathReport.findUnique({
      where: { registrationNumber: req.params.id },
    });
    if (!existing) return res.status(404).json({ error: 'Pengajuan tidak ditemukan.' });

    const row = await prisma.deathReport.update({
      where: { id: existing.id },
      data: {
        status: input.data.status,
        ...(input.data.rtRwSignature ? { rtRwSignature: input.data.rtRwSignature } : {}),
        ...(input.data.dukcapilIssuance ? { dukcapilIssuance: input.data.dukcapilIssuance } : {}),
        ...(input.data.notes !== undefined ? { notes: input.data.notes } : {}),
      },
    });
    return res.json({ report: toReport(row) });
  } catch (error) {
    console.error('Gagal memperbarui pengajuan:', error);
    return res.status(500).json({ error: 'Status pengajuan gagal diperbarui.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = z.string().trim().min(1).max(100).safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ error: 'Nomor registrasi tidak valid.' });
  }

  try {
    const report = await prisma.deathReport.findUnique({
      where: { registrationNumber: id.data },
      select: { id: true },
    });
    if (!report) return res.status(404).json({ error: 'Pengajuan tidak ditemukan.' });

    await prisma.deathReport.delete({ where: { id: report.id } });
    return res.status(204).end();
  } catch (error) {
    console.error('Gagal menghapus pengajuan:', error);
    return res.status(500).json({ error: 'Pengajuan gagal dihapus.' });
  }
});

module.exports = router;

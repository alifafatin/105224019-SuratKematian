const { Router } = require('express');
const { rateLimit } = require('express-rate-limit');
const { z } = require('zod');
const prisma = require('../config/prisma');

const router = Router();
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
const profileSchema = z.object({
  nama: z.string().trim().min(3, 'Nama minimal 3 karakter.').max(120),
  phone: z
    .string()
    .transform((phone) => phone.replace(/\D/g, ''))
    .refine((phone) => phone.length >= 8 && phone.length <= 15),
  consent: z.literal(true),
});
const updateProfileSchema = z.object({
  nama: z.string().trim().min(3, 'Nama minimal 3 karakter.').max(120),
  consent: z.literal(true),
});
const deleteProfileSchema = z.object({
  consent: z.literal(true),
});
const profilePhoneSchema = z
  .string()
  .transform((phone) => phone.replace(/\D/g, ''))
  .refine((phone) => phone.length >= 8 && phone.length <= 15);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.post('/profiles', profileLimiter, async (req, res) => {
  const input = profileSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({
      error: 'Nama, nomor telepon, atau persetujuan penyimpanan tidak valid.',
    });
  }

  try {
    const profile = await prisma.wargaProfile.upsert({
      where: { phone: input.data.phone },
      create: {
        nama: input.data.nama,
        phone: input.data.phone,
      },
      update: { nama: input.data.nama },
      select: {
        nama: true,
        phone: true,
      },
    });

    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Gagal menyimpan profil warga:', error);
    return res.status(500).json({ error: 'Profil warga gagal disimpan.' });
  }
});

router.get('/profiles/:phone', profileLimiter, async (req, res) => {
  const phone = profilePhoneSchema.safeParse(req.params.phone);
  if (!phone.success) {
    return res.status(400).json({ error: 'Nomor telepon tidak valid.' });
  }

  try {
    const profile = await prisma.wargaProfile.findUnique({
      where: { phone: phone.data },
      select: { nama: true, phone: true },
    });
    if (!profile) return res.status(404).json({ error: 'Profil warga tidak ditemukan.' });
    return res.json({ profile });
  } catch (error) {
    console.error('Gagal mengambil profil warga:', error);
    return res.status(500).json({ error: 'Profil warga gagal dimuat.' });
  }
});

router.patch('/profiles/:phone', profileLimiter, async (req, res) => {
  const phone = profilePhoneSchema.safeParse(req.params.phone);
  const input = updateProfileSchema.safeParse(req.body);
  if (!phone.success || !input.success) {
    return res.status(400).json({ error: 'Nama, nomor telepon, atau persetujuan tidak valid.' });
  }

  try {
    const existing = await prisma.wargaProfile.findUnique({
      where: { phone: phone.data },
      select: { id: true },
    });
    if (!existing) return res.status(404).json({ error: 'Profil warga tidak ditemukan.' });

    const profile = await prisma.wargaProfile.update({
      where: { id: existing.id },
      data: { nama: input.data.nama },
      select: { nama: true, phone: true },
    });
    return res.json({ profile });
  } catch (error) {
    console.error('Gagal memperbarui profil warga:', error);
    return res.status(500).json({ error: 'Profil warga gagal diperbarui.' });
  }
});

router.delete('/profiles/:phone', profileLimiter, async (req, res) => {
  const phone = profilePhoneSchema.safeParse(req.params.phone);
  const input = deleteProfileSchema.safeParse(req.body);
  if (!phone.success || !input.success) {
    return res.status(400).json({ error: 'Nomor telepon atau persetujuan penghapusan tidak valid.' });
  }

  try {
    const existing = await prisma.wargaProfile.findUnique({
      where: { phone: phone.data },
      select: { id: true },
    });
    if (!existing) return res.status(404).json({ error: 'Profil warga tidak ditemukan.' });

    await prisma.wargaProfile.delete({ where: { id: existing.id } });
    return res.status(204).end();
  } catch (error) {
    console.error('Gagal menghapus profil warga:', error);
    return res.status(500).json({ error: 'Profil warga gagal dihapus.' });
  }
});

module.exports = router;

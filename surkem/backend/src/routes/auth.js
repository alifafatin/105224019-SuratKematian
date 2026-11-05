const { Router } = require('express');
const { rateLimit } = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/prisma');

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
const passwordSchema = z
  .string()
  .min(6)
  .refine((password) => Buffer.byteLength(password, 'utf8') <= 72);
const loginSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: passwordSchema,
});
const registrationSchema = loginSchema.extend({
  nama: z.string().trim().min(1).max(120),
});

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET harus diatur dan memiliki minimal 32 byte.');
  }
  return secret;
}

router.post('/register', registrationLimiter, async (req, res) => {
  const input = registrationSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({ error: 'Data pendaftaran tidak valid.' });
  }

  try {
    const password = await bcrypt.hash(input.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: input.data.email,
        nama: input.data.nama,
        password,
      },
      select: {
        id: true,
        email: true,
        nama: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ user });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ error: 'Email sudah terdaftar.' });
    }

    console.error('Gagal mendaftarkan pengguna:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const input = loginSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({ error: 'Email atau password salah.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: input.data.email },
    });

    if (!user || !(await bcrypt.compare(input.data.password, user.password))) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { email: user.email },
      getJwtSecret(),
      {
        subject: String(user.id),
        issuer: 'surkem-backend',
        audience: 'surkem-web',
        expiresIn: '15m',
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
      },
    });
  } catch (error) {
    console.error('Gagal memproses login pengguna:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

module.exports = router;

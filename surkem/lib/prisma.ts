import { z } from 'zod';

// Skema Login (Sudah Benar)
export const skemaLogin = z.object({
  email: z.string().trim().email('Masukkan alamat email yang valid.'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter.')
    .refine(
      (password) => new TextEncoder().encode(password).length <= 72,
      'Password maksimal 72 byte.'
    ),
});

// Skema Item (Sesuai Modul 7 - Perbaikan Galat 1 dengan z.stringbool())
export const skemaItem = z.object({
  judul: z.string().trim().min(3, 'Judul minimal 3 karakter.'),
  kategori: z.enum(['energi', 'lingkungan', 'kampus']),
  deskripsi: z.string().trim().max(500),
  // Menggunakan z.stringbool() agar string "false" dari select/form diparse jadi boolean false
  tersedia: z.stringbool(), 
});

export type DataLogin = z.infer<typeof skemaLogin>;
export type MasukanItem = z.infer<typeof skemaItem>;
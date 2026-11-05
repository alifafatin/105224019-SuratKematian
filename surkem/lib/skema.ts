import { z } from 'zod';

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

export type DataLogin = z.infer<typeof skemaLogin>;

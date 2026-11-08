'use server';

import { z } from 'zod';

export type WargaProfileState = {
  error?: string;
  fieldErrors?: Partial<Record<'name' | 'phone' | 'consent', string>>;
  profile?: {
    nama: string;
    phone: string;
  };
};

const createProfileSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter.').max(120, 'Nama maksimal 120 karakter.'),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => value.length >= 8 && value.length <= 15, {
      message: 'Nomor telepon harus terdiri dari 8–15 digit.',
    }),
  consent: z.boolean().refine((value) => value, {
    message: 'Persetujuan penyimpanan wajib diberikan.',
  }),
});

const profileResponseSchema = z.object({
  profile: z.object({
    nama: z.string(),
    phone: z.string(),
  }),
});

export async function saveWargaProfile(
  _previousState: WargaProfileState,
  formData: FormData
): Promise<WargaProfileState> {
  const input = createProfileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    consent: formData.get('consent') === 'on',
  });
  if (!input.success) {
    const fieldErrors: WargaProfileState['fieldErrors'] = {};
    for (const issue of input.error.issues) {
      const field = issue.path[0];
      if (
        (field === 'name' || field === 'phone' || field === 'consent') &&
        !fieldErrors[field]
      ) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      error: 'Periksa kembali data pada field yang ditandai.',
      fieldErrors,
    };
  }

  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) return { error: 'Layanan penyimpanan belum dikonfigurasi.' };

  let response: Response;
  try {
    response = await fetch(
      `${backendUrl.replace(/\/$/, '')}/api/warga/profiles`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: input.data.name,
          phone: input.data.phone,
          consent: input.data.consent,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch (error) {
    console.error('Backend profil warga tidak dapat dijangkau:', error);
    return { error: 'Layanan sedang tidak tersedia. Coba lagi nanti.' };
  }

  if (response.status === 400) {
    return {
      error: 'Periksa kembali nama, nomor telepon, dan persetujuan penyimpanan.',
    };
  }
  if (response.status === 429) {
    return { error: 'Terlalu banyak percobaan. Coba lagi beberapa saat.' };
  }
  if (response.status === 404) {
    console.error('Backend tidak memiliki route POST /api/warga/profiles; mulai ulang backend dari folder surkem/backend.');
    return { error: 'Backend yang berjalan belum memuat fitur profil warga. Restart backend dari folder surkem/backend.' };
  }
  if (!response.ok) {
    console.error(`Backend profil warga merespons dengan status ${response.status}.`);
    return { error: 'Profil gagal disimpan. Coba lagi nanti.' };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error('Respons backend profil warga bukan JSON yang valid:', error);
    return { error: 'Respons layanan penyimpanan tidak valid.' };
  }

  const result = profileResponseSchema.safeParse(payload);
  if (!result.success) {
    console.error('Respons backend profil warga tidak valid.');
    return { error: 'Respons layanan penyimpanan tidak valid.' };
  }

  return { profile: result.data.profile };
}

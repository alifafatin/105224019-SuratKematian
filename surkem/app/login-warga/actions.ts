'use server';

import { z } from 'zod';

export type WargaProfileState = {
  error?: string;
  profile?: {
    nama: string;
    phone: string;
  };
};

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
  const nama = formData.get('name');
  const phone = formData.get('phone');
  const consent = formData.get('consent') === 'on';
  const backendUrl = process.env.BACKEND_API_URL;

  if (
    typeof nama !== 'string' ||
    typeof phone !== 'string' ||
    !consent ||
    !backendUrl
  ) {
    return {
      error: !backendUrl
        ? 'Layanan penyimpanan belum dikonfigurasi.'
        : 'Lengkapi nama, nomor telepon, dan persetujuan penyimpanan.',
    };
  }

  let response: Response;
  try {
    response = await fetch(
      `${backendUrl.replace(/\/$/, '')}/api/warga/profiles`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, phone, consent }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch (error) {
    console.error('Backend profil warga tidak dapat dijangkau:', error);
    return { error: 'Layanan sedang tidak tersedia. Coba lagi nanti.' };
  }

  if (response.status === 400) {
    return { error: 'Masukkan nama dan nomor telepon yang valid.' };
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

'use server';

import { z } from 'zod';

export type ProfileActionResult<T> = {
  data?: T;
  error?: string;
};

export type WargaProfileData = {
  nama: string;
  phone: string;
};

const phoneSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => value.length >= 8 && value.length <= 15, {
    message: 'Nomor telepon harus terdiri dari 8–15 digit.',
  });
const profileSchema = z.object({
  profile: z.object({
    nama: z.string(),
    phone: z.string(),
  }),
});

function getProfilesUrl() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) throw new Error('BACKEND_API_URL belum dikonfigurasi.');
  return `${backendUrl.replace(/\/$/, '')}/api/warga/profiles`;
}

async function requestProfile(
  phone: string,
  init?: RequestInit
): Promise<ProfileActionResult<WargaProfileData>> {
  const parsedPhone = phoneSchema.safeParse(phone);
  if (!parsedPhone.success) {
    return { error: parsedPhone.error.issues[0]?.message || 'Nomor telepon tidak valid.' };
  }

  try {
    const response = await fetch(
      `${getProfilesUrl()}/${encodeURIComponent(parsedPhone.data)}`,
      {
        ...init,
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (response.status === 404) return { error: 'Profil warga tidak ditemukan.' };
    if (response.status === 400) return { error: 'Data profil tidak valid.' };
    if (!response.ok) {
      console.error(`Backend profil warga merespons dengan status ${response.status}.`);
      return { error: 'Operasi profil gagal. Coba lagi nanti.' };
    }
    if (response.status === 204) {
      return { data: { nama: '', phone: parsedPhone.data } };
    }

    const result = profileSchema.safeParse(await response.json());
    if (!result.success) {
      console.error('Respons backend profil warga tidak sesuai format.');
      return { error: 'Respons layanan profil tidak valid.' };
    }
    return { data: result.data.profile };
  } catch (error) {
    console.error('Layanan profil warga tidak dapat dijangkau:', error);
    return {
      error:
        error instanceof Error && error.message === 'BACKEND_API_URL belum dikonfigurasi.'
          ? 'Layanan penyimpanan belum dikonfigurasi.'
          : 'Database sedang tidak dapat dihubungi.',
    };
  }
}

export async function loadWargaProfile(phone: string) {
  return requestProfile(phone);
}

export async function updateWargaProfile(
  phone: string,
  nama: string
): Promise<ProfileActionResult<WargaProfileData>> {
  const input = z.object({
    nama: z.string().trim().min(1, 'Nama wajib diisi.').max(120, 'Nama maksimal 120 karakter.'),
  }).safeParse({ nama });
  if (!input.success) return { error: input.error.issues[0]?.message };

  return requestProfile(phone, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama: input.data.nama, consent: true }),
  });
}

export async function deleteWargaProfile(
  phone: string
): Promise<ProfileActionResult<true>> {
  const parsedPhone = phoneSchema.safeParse(phone);
  if (!parsedPhone.success) {
    return { error: parsedPhone.error.issues[0]?.message || 'Nomor telepon tidak valid.' };
  }

  try {
    const response = await fetch(
      `${getProfilesUrl()}/${encodeURIComponent(parsedPhone.data)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (response.status === 404) return { error: 'Profil warga tidak ditemukan.' };
    if (!response.ok) {
      console.error(`Backend penghapusan profil merespons dengan status ${response.status}.`);
      return { error: 'Profil warga gagal dihapus.' };
    }
    return { data: true };
  } catch (error) {
    console.error('Layanan penghapusan profil tidak dapat dijangkau:', error);
    return {
      error:
        error instanceof Error && error.message === 'BACKEND_API_URL belum dikonfigurasi.'
          ? 'Layanan penyimpanan belum dikonfigurasi.'
          : 'Database sedang tidak dapat dihubungi.',
    };
  }
}

'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { skemaLogin } from '@/lib/skema';

export type LoginState = {
  error?: string;
  success?: string;
};

const apiLoginResponseSchema = z.object({
  token: z.string().min(1),
});

export async function loginUser(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const input = skemaLogin.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Data login tidak valid.' };
  }

  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    console.error('BACKEND_API_URL belum dikonfigurasi.');
    return { error: 'Layanan login belum dikonfigurasi.' };
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.data),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error('Backend login tidak dapat dijangkau:', error);
    return { error: 'Layanan login sedang tidak tersedia. Coba lagi nanti.' };
  }

  if (response.status === 401 || response.status === 400) {
    return { error: 'Email atau password salah.' };
  }
  if (!response.ok) {
    console.error(`Backend login merespons dengan status ${response.status}.`);
    return { error: 'Terjadi kesalahan saat login. Coba lagi nanti.' };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error('Respons backend login bukan JSON yang valid:', error);
    return { error: 'Respons layanan login tidak valid.' };
  }

  const result = apiLoginResponseSchema.safeParse(payload);
  if (!result.success) {
    console.error('Respons backend login tidak memuat token sesi.');
    return { error: 'Respons layanan login tidak valid.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('surkem_session', result.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  });

  return { success: 'Login berhasil. Sesi Anda aktif selama 15 menit.' };
}

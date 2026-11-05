'use client';

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setUserSession } from '@/lib/mockData';
import { saveWargaProfile, type WargaProfileState } from './actions';

export default function WargaLoginPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<WargaProfileState, FormData>(
    saveWargaProfile,
    {}
  );

  useEffect(() => {
    if (!state.profile) return;

    setUserSession({
      isLoggedIn: true,
      role: 'warga',
      name: state.profile.nama,
      phone: state.profile.phone,
    });
    router.push('/pengajuan');
  }, [router, state.profile]);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-12 sm:px-6">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg md:grid-cols-2">
        <div className="bg-blue-800 p-8 text-white sm:p-10">
          <span className="text-sm font-semibold text-blue-200">PORTAL WARGA</span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight">
            Mulai pengajuan Surat Kematian
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-blue-100">
            Profil nama dan nomor telepon akan disimpan ke database. Nomor telepon belum
            diverifikasi, jadi login ini hanya untuk demo.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex text-sm font-semibold text-white underline underline-offset-4"
          >
            Kembali ke beranda
          </Link>
        </div>

        <form action={formAction} className="space-y-5 p-8 sm:p-10">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Login Warga</h2>
            <p className="mt-1 text-sm text-slate-600">Isi data berikut untuk melanjutkan.</p>
          </div>

          <div>
            <label htmlFor="warga-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Nama Lengkap
            </label>
            <input
              id="warga-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={120}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label htmlFor="warga-phone" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Nomor Telepon
            </label>
            <input
              id="warga-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              pattern="[\d\s()+-]{8,24}"
              title="Masukkan nomor telepon yang valid."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              placeholder="Contoh: 081223344556"
            />
          </div>

          <label className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
            <input
              name="consent"
              type="checkbox"
              required
              className="mt-1 size-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
            />
            <span>
              Saya setuju nama dan nomor telepon disimpan sebagai profil demo. Nomor HP
              belum diverifikasi dan tidak membuktikan identitas saya.
            </span>
          </label>

          {state.error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {pending ? 'Menyimpan profil...' : 'Simpan dan Lanjut'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Petugas?{' '}
            <Link href="/login-petugas" className="font-semibold text-blue-700 hover:underline">
              Login petugas
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

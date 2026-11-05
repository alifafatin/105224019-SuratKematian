'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  deleteWargaProfile,
  loadWargaProfile,
  updateWargaProfile,
  type WargaProfileData,
} from './actions';
import { getWargaSession, setUserSession } from '@/lib/mockData';

export default function WargaProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<WargaProfileData | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const session = getWargaSession();
    if (!session) {
      router.replace('/login-warga');
      return;
    }

    let active = true;
    loadWargaProfile(session.phone).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.data) {
        setProfile(result.data);
        setName(result.data.nama);
      } else {
        setError(result.error || 'Profil warga gagal dimuat.');
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    setPending(true);
    setError(null);
    setNotice(null);
    const result = await updateWargaProfile(profile.phone, name);
    setPending(false);
    if (!result.data) {
      setError(result.error || 'Profil warga gagal diperbarui.');
      return;
    }
    setProfile(result.data);
    setName(result.data.nama);
    setUserSession({
      isLoggedIn: true,
      role: 'warga',
      name: result.data.nama,
      phone: result.data.phone,
    });
    setNotice('Profil berhasil diperbarui.');
  };

  const handleDelete = async () => {
    if (!profile) return;
    if (!window.confirm('Hapus profil warga secara permanen? Pengajuan yang terkait tetap ada.')) {
      return;
    }
    setPending(true);
    setError(null);
    const result = await deleteWargaProfile(profile.phone);
    setPending(false);
    if (!result.data) {
      setError(result.error || 'Profil warga gagal dihapus.');
      return;
    }
    setUserSession(null);
    router.replace('/login-warga');
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-600">
          <Link href="/pengajuan" className="font-semibold text-blue-700 hover:underline">
            Pengajuan
          </Link>
          <span aria-hidden="true"> / </span>
          <span>Kelola Profil</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-950">Kelola Profil Warga</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Perbarui atau hapus profil yang tersimpan di database. Portal ini masih demo dan
          nomor telepon belum diverifikasi; jangan gunakan untuk data nyata.
        </p>

        {loading ? (
          <p role="status" className="mt-6 text-sm text-slate-700">Memuat profil...</p>
        ) : profile ? (
          <form onSubmit={handleUpdate} className="mt-6 space-y-5">
            <div>
              <label htmlFor="profile-phone" className="mb-1 block text-sm font-semibold text-slate-800">
                Nomor Telepon
              </label>
              <input
                id="profile-phone"
                value={profile.phone}
                readOnly
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800"
              />
            </div>
            <div>
              <label htmlFor="profile-name" className="mb-1 block text-sm font-semibold text-slate-800">
                Nama Lengkap
              </label>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={120}
                aria-invalid={Boolean(error) && !name.trim()}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus-visible:outline-2 focus-visible:outline-blue-700"
              />
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={handleDelete}
                className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                {pending ? 'Memproses...' : 'Hapus Profil'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6">
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <Link href="/login-warga" className="mt-4 inline-flex font-semibold text-blue-700 hover:underline">
              Kembali ke login warga
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

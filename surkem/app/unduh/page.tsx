import React, { Suspense } from 'react';
import Link from 'next/link';
import { getDaftarSurat } from '@/lib/data';
import BadgeStatus from '@/components/BadgeStatus';

interface CatalogPageProps {
  searchParams?: Promise<{ q?: string; status?: string }>;
}

async function UnduhCatalogContent({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const searchQuery = (params?.q || '').trim().toLowerCase();
  const allRecords = await getDaftarSurat();

  const filteredRecords = allRecords.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.noRegis.toLowerCase().includes(searchQuery) ||
      item.namaAlmarhum.toLowerCase().includes(searchQuery) ||
      item.nikAlmarhum.includes(searchQuery) ||
      item.namaPelapor.toLowerCase().includes(searchQuery) ||
      item.kelurahan.toLowerCase().includes(searchQuery)
    );
  });

  return (
    <div className="space-y-8">
      {/* Catalog Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-950 border border-blue-300">
              Daftar Status Pengajuan
            </span>
            <span className="text-xs text-slate-600">Total Pengajuan: {allRecords.length}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Status Pengajuan Surat Kematian
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Semua pengajuan tersimpan ditampilkan beserta status persetujuan RT/RW dan
            proses Dukcapil. Akta hanya dapat diunduh setelah diterbitkan Dukcapil.
          </p>
        </div>

        {/* Quick Action to Report */}
        <div className="shrink-0">
          <Link
            href="/pengajuan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs focus-visible:outline-2 focus-visible:outline-emerald-700 transition-colors"
          >
            <span>+</span>
            <span>Ajukan Laporan Kematian Baru</span>
          </Link>
        </div>
      </div>

      {/* Search Bar Filter Form (GET submission to update URL) */}
      <section aria-labelledby="catalog-search-title" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <h2 id="catalog-search-title" className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Pencarian Katalog Akta
        </h2>
        <form method="GET" action="/unduh" className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="catalog-search-input" className="sr-only">
              Cari berdasarkan Nama Almarhum, NIK, atau Nomor Registrasi
            </label>
            <input
              id="catalog-search-input"
              name="q"
              type="search"
              defaultValue={searchQuery}
              placeholder="Cari nomor registrasi, nama almarhum, atau NIK..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-blue-700 font-mono shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 transition-colors"
          >
            Cari Katalog
          </button>
          {searchQuery && (
            <Link
              href="/unduh"
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium text-center transition-colors"
            >
              Reset
            </Link>
          )}
        </form>
      </section>

      {/* Catalog Grid of Registered Records */}
      <section aria-labelledby="catalog-records-title" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="catalog-records-title" className="text-base font-bold text-slate-900">
            Daftar Pengajuan ({filteredRecords.length})
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Rute Detail: /unduh/[noRegis]
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="text-3xl" aria-hidden="true">🔍</div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery ? 'Pengajuan Tidak Ditemukan' : 'Belum Ada Pengajuan'}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada pengajuan yang sesuai dengan kata kunci "${searchQuery}". Periksa kembali nomor registrasi atau nama.`
                : 'Pengajuan yang dikirim akan muncul di sini beserta status persetujuan RT/RW dan proses Dukcapil.'}
            </p>
            <Link
              href="/unduh"
              className="inline-block mt-2 text-xs font-semibold text-blue-700 hover:underline"
            >
              Tampilkan Semua Pengajuan →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecords.map((item) => (
              <article
                key={item.noRegis}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Card Header: Reg ID & Status */}
                  <div className="flex flex-col gap-2 border-b border-slate-100 pb-3">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.noRegis}
                    </span>
                    <BadgeStatus status={item.statusVerifikasi} size="sm" />
                  </div>
                  <p
                    className={`text-xs font-semibold ${
                      item.statusVerifikasi === 'DRAFT_ENCRYPTED' ||
                      item.statusVerifikasi === 'AWAITING_RTRW_APPROVAL'
                        ? 'text-amber-800'
                        : 'text-emerald-800'
                    }`}
                  >
                    Persetujuan RT/RW:{' '}
                    {item.statusVerifikasi === 'DRAFT_ENCRYPTED' ||
                    item.statusVerifikasi === 'AWAITING_RTRW_APPROVAL'
                      ? 'Belum disetujui'
                      : 'Disetujui'}
                  </p>

                  {/* Title MUST be wrapped in Link navigating directly to dynamic route */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                      <Link
                        href={`/unduh/${item.noRegis}`}
                        className="hover:underline focus-visible:outline-2 focus-visible:outline-blue-700 rounded"
                        aria-label={`Lihat status pengajuan atas nama ${item.namaAlmarhum}`}
                      >
                        {item.namaAlmarhum}
                      </Link>
                    </h3>
                    <span className="font-mono text-xs text-slate-600 block mt-0.5">
                      NIK: {item.nikAlmarhum}
                    </span>
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Wafat:</span>
                      <strong className="text-slate-800">{item.tanggalWafat}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tempat:</span>
                      <span className="text-slate-800 truncate max-w-[170px]" title={item.tempatWafat}>
                        {item.tempatWafat}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pelapor:</span>
                      <span className="text-slate-800">{item.namaPelapor} ({item.hubunganPelapor})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Wilayah:</span>
                      <span className="text-slate-800">RT {item.rt} / RW {item.rw} {item.kelurahan}</span>
                    </div>
                  </div>

                  {/* Cryptographic SHA-256 Hash Preview */}
                  <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1.5 rounded border border-slate-200 truncate">
                    <span className="font-bold text-slate-700">SHA-256: </span>
                    {item.hashSHA256}
                  </div>
                </div>

                {/* Card Action Link: Direct navigation without pop-up/modal */}
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/unduh/${item.noRegis}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs focus-visible:outline-2 focus-visible:outline-blue-700 transition-colors"
                  >
                    <span>Lihat Status Pengajuan</span>
                    <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function UnduhCatalogPage({ searchParams }: CatalogPageProps) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-600">Memuat katalog akta...</p>}>
      <UnduhCatalogContent searchParams={searchParams} />
    </Suspense>
  );
}

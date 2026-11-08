import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findSuratByNoRegis } from '@/lib/data';
import BadgeStatus from '@/components/BadgeStatus';

interface DynamicCertificatePageProps {
  params: Promise<{ noRegis: string }>;
}

export default async function DynamicCertificatePage({ params }: DynamicCertificatePageProps) {
  // Next.js 16 (React 19) requires awaiting dynamic route params
  const { noRegis } = await params;

  const REGEX_REGIS_ID = /^SRK-\d{8}-[A-F0-9]{6}$/;
  if (!noRegis || !REGEX_REGIS_ID.test(noRegis)) {
    notFound();
  }

  const surat = await findSuratByNoRegis(noRegis);
  if (!surat) {
    notFound();
  }
  const certificateIssued = surat.statusVerifikasi === 'CERTIFICATE_ISSUED';
  const rtrwApproved = ![
    'DRAFT_ENCRYPTED',
    'AWAITING_RTRW_APPROVAL',
  ].includes(surat.statusVerifikasi);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-700">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/unduh" className="hover:text-blue-700">
            Katalog Akta
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold font-mono">{surat.noRegis}</span>
        </nav>

        {/* Kembali ke Katalog Button (Top) */}
        <Link
          href="/unduh"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 transition-colors w-fit focus-visible:outline-2 focus-visible:outline-blue-700"
        >
          <span>←</span>
          <span>Kembali ke Katalog</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              certificateIssued
                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                : 'bg-blue-100 text-blue-950 border-blue-300'
            }`}>
              {certificateIssued ? 'Akta Kematian Diterbitkan' : 'Status Pengajuan'}
            </span>
            <span className="text-xs font-mono text-slate-600">ID: {surat.noRegis}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {certificateIssued ? 'Akta Kematian Digital' : 'Status Pengajuan Surat Kematian'}: {surat.namaAlmarhum}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {certificateIssued
              ? 'Data pengajuan telah diterbitkan sebagai akta oleh petugas Dukcapil.'
              : 'Halaman ini menampilkan tahap persetujuan pengajuan. Ini belum merupakan akta resmi dan belum dapat digunakan sebagai dokumen kependudukan.'}
          </p>
        </div>

        <div className="shrink-0">
          <BadgeStatus status={surat.statusVerifikasi} size="md" />
        </div>
      </div>

      <section
        aria-labelledby="record-status-title"
        className="rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:p-6 text-amber-950"
      >
        <h2 id="record-status-title" className="text-sm font-bold">
          Status Persetujuan dan Penerbitan
        </h2>
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Persetujuan RT/RW</dt>
            <dd>{rtrwApproved ? 'Disetujui' : 'Belum disetujui'}</dd>
          </div>
          <div>
            <dt className="font-semibold">Penerbitan Dukcapil</dt>
            <dd>
              {certificateIssued
                ? 'Akta telah diterbitkan'
                : surat.statusVerifikasi === 'PROCESSING_DUKCAPIL'
                  ? 'Sedang diproses'
                  : 'Belum diterbitkan'}
            </dd>
          </div>
        </dl>
        {!certificateIssued && (
          <p className="mt-3 text-xs leading-relaxed">
            Status alur saat ini: <strong>{surat.statusVerifikasi}</strong>. Persetujuan
            RT/RW saja belum menerbitkan akta; pengajuan masih perlu diproses Dukcapil.
          </p>
        )}
      </section>

      {/* Certificate data preview */}
      <section
        aria-labelledby="cert-card-title"
        className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-10 shadow-lg space-y-6 print:border-none print:shadow-none"
      >
        {/* Certificate Header */}
        <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1">
          <div className="inline-block text-3xl mb-1" aria-hidden="true">
            🦅
          </div>
          <h2 id="cert-card-title" className="text-lg sm:text-xl font-black text-slate-900 tracking-wider uppercase">
            {certificateIssued ? 'Republik Indonesia' : 'Ringkasan Pengajuan'}
          </h2>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-wide uppercase">
            {certificateIssued ? 'Pratinjau Data Akta Kematian' : 'Belum diterbitkan sebagai akta'}
          </h3>
          <p className="text-xs text-slate-600 font-mono">
            Nomor: {surat.penerbitanDukcapil?.nomorAkta || 'Belum tersedia'}
          </p>
          {certificateIssued && (
            <p className="text-[11px] text-slate-500">
              Dinas Kependudukan dan Pencatatan Sipil {surat.kota}
            </p>
          )}
        </div>

        {/* Certificate Body Data */}
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-700 leading-relaxed text-center italic">
            Berdasarkan Surat Bukti Kematian Nomor Registrasi <strong className="font-mono text-slate-900 font-bold">{surat.noRegis}</strong>, bahwa di {surat.tempatWafat}:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Nama Lengkap Almarhum:</span>
              <strong className="text-slate-900 text-base font-bold">{surat.namaAlmarhum}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Nomor Induk Kependudukan (NIK):</span>
              <span className="font-mono text-slate-900 font-bold text-base">{surat.nikAlmarhum}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Jenis Kelamin:</span>
              <span className="text-slate-800 font-medium">{surat.jenisKelamin}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tanggal Kematian:</span>
              <strong className="text-slate-900">{surat.tanggalWafat} ({surat.waktuWafat || '10:00 WIB'})</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Penyebab Kematian:</span>
              <span className="text-slate-800">{surat.penyebabWafat}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tempat Peristiwa:</span>
              <span className="text-slate-800">{surat.tempatWafat}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block text-[11px]">Alamat Terakhir:</span>
              <span className="text-slate-800 font-medium">
                {surat.alamatDuka}, RT {surat.rt} / RW {surat.rw}, {surat.kelurahan}, {surat.kecamatan}, {surat.kota}
              </span>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-xs text-slate-600">
              <div>
                <span>Pelapor Resmi: </span>
                <strong className="text-slate-900">{surat.namaPelapor}</strong> ({surat.hubunganPelapor})
              </div>
              <div>
                <span>Status Akta: </span>
                <strong className={certificateIssued ? 'text-emerald-800 font-semibold' : 'text-amber-800 font-semibold'}>
                  {certificateIssued ? 'Diterbitkan' : 'Belum diterbitkan'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Issuance metadata */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-xl border border-dashed border-slate-400 flex items-center justify-center bg-slate-50 text-center text-xs text-slate-500">
              QR belum tersedia
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <strong className="block text-slate-900 font-bold">
                {certificateIssued ? 'QR belum tersedia' : 'Akta belum diterbitkan'}
              </strong>
              <span className="text-[11px] block">
                {certificateIssued
                  ? 'Validasi QR belum diaktifkan pada tahap ini.'
                  : 'Data ini hanya ringkasan pengajuan, bukan dokumen resmi.'}
              </span>
            </div>
          </div>

          {/* Official Officer Endorsement */}
          <div className="text-right space-y-1 text-xs">
            {certificateIssued ? (
              <>
                <span className="text-slate-500 block">Diterbitkan di {surat.kota}</span>
                <span className="text-slate-500 block">
                  Pada tanggal: {surat.penerbitanDukcapil?.tanggalTerbit || 'Belum tersedia'}
                </span>
                <div className="pt-4 font-bold text-slate-900 text-sm">
                  Kepala Dinas Kependudukan &amp; Pencatatan Sipil
                </div>
                <div className="font-bold text-slate-900 underline text-sm">
                  {surat.penerbitanDukcapil?.namaPejabat || 'Belum tersedia'}
                </div>
                <span className="text-[11px] font-mono text-slate-600 block">
                  NIP. {surat.penerbitanDukcapil?.nipPejabat || 'Belum tersedia'}
                </span>
              </>
            ) : (
              <p className="font-semibold text-amber-800">
                Menunggu proses penerbitan oleh Dukcapil
              </p>
            )}
          </div>
        </div>

        {/* Action Controls with Explicit "Kembali ke Katalog" Button */}
        <div className="no-print pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/unduh"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs border border-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            <span>←</span>
            <span>Kembali ke Katalog</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/pengajuan"
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Ajukan Laporan Baru
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Dashboard Petugas →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

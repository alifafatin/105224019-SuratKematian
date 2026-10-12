'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import BadgeStatus from '@/components/BadgeStatus';
import ModalAuthPin from '@/components/ModalAuthPin';
import { getStoredReports } from '@/lib/mockData';
import { DeathReport } from '@/types';

function CertificateDownloadContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [reports] = useState<DeathReport[]>(() => getStoredReports());
  const [searchInput, setSearchInput] = useState(() => initialId || 'SK-2026-00841');
  const [activeReport, setActiveReport] = useState<DeathReport | null>(() => {
    const list = getStoredReports();
    if (initialId) {
      return list.find((r) => r.id.toLowerCase() === initialId.toLowerCase()) || null;
    }
    return list.find((r) => r.status === 'CERTIFICATE_ISSUED') || null;
  });
  const [searchError, setSearchError] = useState<string | null>(null);

  // PIN Auth states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setIsUnlocked(false);

    const term = searchInput.trim().toLowerCase();
    if (!term) {
      setSearchError('Silakan masukkan Nomor Registrasi atau 16-Digit NIK.');
      return;
    }

    const found = reports.find(
      (r) =>
        r.id.toLowerCase() === term ||
        r.deceased.nik.toLowerCase() === term ||
        r.deceased.fullName.toLowerCase().includes(term)
    );

    if (found) {
      setActiveReport(found);
    } else {
      setActiveReport(null);
      setSearchError(
        `Permohonan dengan identitas "${searchInput}" tidak ditemukan. Pastikan nomor registrasi (contoh: SK-2026-00841) atau 16 digit NIK almarhum benar.`
      );
    }
  };

  // Helper to quickly load sample reports
  const selectQuickSample = (reportId: string) => {
    const match = reports.find((r) => r.id === reportId);
    if (match) {
      setSearchInput(match.id);
      setActiveReport(match);
      setIsUnlocked(false);
      setSearchError(null);
    }
  };

  // Simulated PDF download
  const handleDownloadPdf = () => {
    setDownloadSuccessToast(true);
    setTimeout(() => {
      setDownloadSuccessToast(false);
    }, 4500);

    // Create synthetic download trigger
    const blob = new Blob(
      [
        `REPUBLIK INDONESIA - KUTIPAN surat kematian\n` +
          `Nomor: ${activeReport?.dukcapilIssuance?.certificateNumber || '3273-KM-2026-0001'}\n` +
          `Nama Almarhum: ${activeReport?.deceased.fullName}\n` +
          `NIK: ${activeReport?.deceased.nik}\n` +
          `Tanggal Kematian: ${activeReport?.deceased.dateOfDeath}\n` +
          `Tanda Tangan Ed25519: ${activeReport?.rtRwSignature?.signatureHex || 'VALID'}\n` +
          `Telah diverifikasi resmi oleh Dinas Dukcapil.`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Akta_Kematian_${activeReport?.deceased.fullName.replace(/\s+/g, '_')}_${activeReport?.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deceasedPin = activeReport?.deceased.nik.slice(-4) || '0000';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-950 border border-emerald-300">
              Layanan Mandiri Warga
            </span>
            <span className="text-xs text-slate-700">Verifikasi Kredensial PIN NIK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Pencarian & Unduh surat kematian Resmi
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-700 max-w-3xl leading-relaxed">
            Periksa status penerbitan surat kematian dan unduh dokumen salinan resmi berkekuatan hukum. Untuk melindungi kerahasiaan data kependudukan, pengunduhan dilindungi PIN otorisasi berupa <strong className="text-slate-900 font-semibold">4 digit terakhir NIK almarhum</strong> dengan verifikasi berbasis PBKDF2.
          </p>
        </div>
      </div>

      {/* Search Bar Section */}
      <section aria-labelledby="section-search-heading" className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-8">
        <h2 id="section-search-heading" className="text-base font-bold text-slate-900 mb-2">
          Cari Berkas surat kematian
        </h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1">
            <label htmlFor="search-report-input" className="sr-only">
              Nomor Registrasi Laporan atau NIK 16 Digit
            </label>
            <div className="relative">
              <input
                id="search-report-input"
                name="searchQuery"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Masukkan Nomor Registrasi (SK-2026-...) atau 16 Digit NIK Almarhum"
                aria-describedby={searchError ? 'search-error-msg' : undefined}
                aria-invalid={searchError ? 'true' : 'false'}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-blue-700 font-mono shadow-2xs"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="shrink-0"
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          >
            Cari Berkas
          </Button>
        </form>

        {searchError && (
          <p id="search-error-msg" role="alert" className="mt-3 text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
            {searchError}
          </p>
        )}

        {/* Quick Sample Selector */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-700 font-medium">Uji Coba Data Cepat:</span>
          <button
            type="button"
            onClick={() => selectQuickSample('SK-2026-00841')}
            className="text-xs px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-semibold border border-emerald-300 focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            ✓ SK-2026-00841 (Haji Achmad Subagja - Akta Terbit)
          </button>
          <button
            type="button"
            onClick={() => selectQuickSample('SK-2026-00342')}
            className="text-xs px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-semibold border border-indigo-300 focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            • SK-2026-00342 (Siti Rahmawati - Ed25519 Signed)
          </button>
          <button
            type="button"
            onClick={() => selectQuickSample('SK-2026-00129')}
            className="text-xs px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-950 font-semibold border border-amber-300 focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            • SK-2026-00129 (Bambang Soedjarwo - Antrean RT/RW)
          </button>
        </div>
      </section>

      {/* Search Result Display */}
      {activeReport && (
        <div className="space-y-6">
          {/* Status & Summary Header Card */}
          <section aria-labelledby="section-report-status" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-mono text-blue-900 font-bold block">
                  Registrasi: {activeReport.id}
                </span>
                <h2 id="section-report-status" className="text-lg font-bold text-slate-900">
                  {activeReport.deceased.fullName}
                </h2>
                <span className="text-xs text-slate-700">
                  Diajukan oleh: {activeReport.reporter.name} ({activeReport.reporter.relation})
                </span>
              </div>
              <div className="flex flex-col sm:items-end gap-1.5">
                <BadgeStatus status={activeReport.status} size="md" />
                <span className="text-[11px] text-slate-600">
                  Waktu Kirim: {activeReport.submittedAt}
                </span>
              </div>
            </div>

            {/* Case 1: Certificate is NOT yet issued */}
            {activeReport.status !== 'CERTIFICATE_ISSUED' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-200 text-amber-900 shrink-0" aria-hidden="true">
                    ⏳
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-amber-950">
                      surat kematian Masih Dalam Proses Penerbitan
                    </h3>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Laporan ini saat ini berada pada tahap{' '}
                      <strong className="underline">{activeReport.status.replace(/_/g, ' ')}</strong>.
                      Dokumen resmi hanya dapat diunduh setelah Ketua RT/RW menandatangani secara digital (Ed25519) dan Dinas Dukcapil mengesahkan berkas.
                    </p>

                    <div className="pt-2 text-xs text-amber-950 border-t border-amber-200/80 flex flex-col sm:flex-row gap-4">
                      <div>
                        <span className="text-amber-800">Petugas Penanggung Jawab:</span>{' '}
                        <strong>{activeReport.assignedRTRW.officerName}</strong>
                      </div>
                      <div>
                        <span className="text-amber-800">Kontak WhatsApp:</span>{' '}
                        <strong>{activeReport.assignedRTRW.officerPhone}</strong>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center text-xs font-semibold text-blue-800 hover:text-blue-950 underline"
                      >
                        Buka Dashboard untuk menyetujui laporan ini sekarang →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Case 2: Certificate IS Issued, but locked */}
            {activeReport.status === 'CERTIFICATE_ISSUED' && !isUnlocked && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 sm:p-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-700" aria-hidden="true">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-900">
                    surat kematian Resmi Telah Terbit & Siap Diunduh
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Dokumen dilindungi otorisasi PIN (4 digit terakhir NIK almarhum: <strong className="font-mono text-blue-900">{deceasedPin}</strong>) guna mencegah akses oleh pihak tidak bertanggung jawab.
                  </p>
                </div>

                <div className="pt-2 flex justify-center">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => setIsPinModalOpen(true)}
                    className="shadow-md"
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    }
                  >
                    Buka Kunci & Unduh surat kematian
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Unlocked Official Certificate Preview Card */}
          {activeReport.status === 'CERTIFICATE_ISSUED' && isUnlocked && (
            <section
              aria-labelledby="section-cert-preview-heading"
              className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden print:border-none print:shadow-none"
            >
              {/* Actions Header Bar */}
              <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-emerald-600 text-white text-xs font-bold">
                    TERVERIFIKASI
                  </span>
                  <div>
                    <h2 id="section-cert-preview-heading" className="text-sm font-bold text-white">
                      Pratinjau surat kematian Digital Resmi
                    </h2>
                    <span className="text-[11px] text-slate-300">
                      Tanda Tangan Digital Kriptografis Sah Sesuai UU ITE & SPBE
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => window.print()}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    }
                  >
                    Cetak
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleDownloadPdf}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    }
                  >
                    Unduh Dokumen (PDF)
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsUnlocked(false)}
                    aria-label="Kunci kembali dokumen"
                  >
                    🔒 Kunci
                  </Button>
                </div>
              </div>

              {/* Toast Notification */}
              {downloadSuccessToast && (
                <div role="status" aria-live="polite" className="bg-emerald-700 text-white text-xs py-2 px-4 text-center font-medium">
                  ✓ Berkas surat kematian Resmi berhasil diunduh ke perangkat Anda.
                </div>
              )}

              {/* Certificate Document Graphic Container (A4 Ratio Styling) */}
              <div className="p-6 sm:p-12 bg-white text-slate-900 border-8 border-slate-100 relative">
                {/* Decorative Republic of Indonesia Header */}
                <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
                  {/* Garuda Pancasila SVG Vector Placeholder */}
                  <div className="w-16 h-16 mx-auto mb-2 text-slate-800" aria-hidden="true">
                    <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                      <path d="M50 10 L60 30 L82 32 L66 48 L71 70 L50 58 L29 70 L34 48 L18 32 L40 30 Z" />
                      <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path d="M40 50 L60 50 M50 40 L50 60" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold tracking-widest uppercase">
                    REPUBLIK INDONESIA
                  </h3>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL {activeReport.deceased.city.toUpperCase()}
                  </div>
                  <div className="mt-3 inline-block border-y-2 border-slate-800 py-1 px-4">
                    <span className="text-base sm:text-lg font-black tracking-widest uppercase">
                      KUTIPAN surat kematian
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-mono text-slate-700">
                    Nomor: <strong className="text-slate-900">{activeReport.dukcapilIssuance?.certificateNumber}</strong>
                  </div>
                </div>

                {/* Body Content of Certificate */}
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                  <p>
                    Berdasarkan surat kematian Nomor{' '}
                    <strong className="font-mono">{activeReport.dukcapilIssuance?.certificateNumber}</strong>{' '}
                    menurut Surat Keterangan Kematian yang dilaporkan oleh{' '}
                    <strong>{activeReport.reporter.name}</strong>, bahwa di{' '}
                    <strong>{activeReport.deceased.placeOfDeath}</strong>:
                  </p>

                  {/* Deceased Key Record Table */}
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-200 space-y-2.5 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <span className="text-slate-600">Nama Lengkap:</span>
                      <span className="sm:col-span-2 font-bold text-slate-900 text-sm sm:text-base uppercase">
                        {activeReport.deceased.fullName}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <span className="text-slate-600">Nomor Induk Kependudukan (NIK):</span>
                      <span className="sm:col-span-2 font-mono font-bold text-slate-900">
                        {activeReport.deceased.nik}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <span className="text-slate-600">Jenis Kelamin:</span>
                      <span className="sm:col-span-2 text-slate-900">
                        {activeReport.deceased.gender}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <span className="text-slate-600">Tanggal Lahir:</span>
                      <span className="sm:col-span-2 text-slate-900">
                        {activeReport.deceased.dateOfBirth}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <span className="text-slate-600">Tanggal Kematian:</span>
                      <span className="sm:col-span-2 font-bold text-slate-900">
                        {activeReport.deceased.dateOfDeath} (Pukul {activeReport.deceased.timeOfDeath} WIB)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <span className="text-slate-600">Penyebab Kematian:</span>
                      <span className="sm:col-span-2 text-slate-900 font-medium">
                        {activeReport.deceased.causeOfDeath}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <span className="text-slate-600">Alamat Tempat Tinggal Terakhir:</span>
                      <span className="sm:col-span-2 text-slate-900">
                        {activeReport.deceased.address}, RT {activeReport.deceased.rt} / RW {activeReport.deceased.rw}, {activeReport.deceased.kelurahan}, {activeReport.deceased.city}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic">
                    Kutipan ini diterbitkan berdasarkan ketentuan Undang-Undang Nomor 24 Tahun 2013 tentang Perubahan atas Undang-Undang Nomor 23 Tahun 2006 tentang Administrasi Kependudukan.
                  </p>
                </div>

                {/* Footer Validation & QR Matrix */}
                <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  {/* Left: QR Code and Integrity Seal */}
                  <div className="flex items-center gap-4">
                    {/* SVG QR Code Pattern */}
                    <div className="p-2 border-2 border-slate-900 bg-white rounded shrink-0">
                      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="black" aria-label="QR Code Verifikasi Resmi surat kematian">
                        {/* Corner markers */}
                        <rect x="5" y="5" width="25" height="25" fill="black" />
                        <rect x="8" y="8" width="19" height="19" fill="white" />
                        <rect x="12" y="12" width="11" height="11" fill="black" />

                        <rect x="70" y="5" width="25" height="25" fill="black" />
                        <rect x="73" y="8" width="19" height="19" fill="white" />
                        <rect x="77" y="12" width="11" height="11" fill="black" />

                        <rect x="5" y="70" width="25" height="25" fill="black" />
                        <rect x="8" y="73" width="19" height="19" fill="white" />
                        <rect x="12" y="77" width="11" height="11" fill="black" />

                        {/* Data dots pattern */}
                        <rect x="35" y="10" width="8" height="8" />
                        <rect x="48" y="15" width="8" height="8" />
                        <rect x="35" y="25" width="8" height="8" />
                        <rect x="48" y="35" width="8" height="8" />
                        <rect x="20" y="45" width="8" height="8" />
                        <rect x="35" y="45" width="8" height="8" />
                        <rect x="60" y="45" width="8" height="8" />
                        <rect x="75" y="45" width="8" height="8" />
                        <rect x="45" y="60" width="8" height="8" />
                        <rect x="60" y="60" width="8" height="8" />
                        <rect x="75" y="60" width="8" height="8" />
                        <rect x="35" y="75" width="8" height="8" />
                        <rect x="50" y="75" width="8" height="8" />
                        <rect x="70" y="75" width="8" height="8" />
                      </svg>
                    </div>

                    <div className="text-xs space-y-1">
                      <strong className="text-slate-900 block font-bold">
                        Pindai QR Code
                      </strong>
                      <span className="text-slate-600 block text-[11px]">
                        Verifikasi keabsahan melalui Balai Sertifikasi Elektronik (BSrE) & Dukcapil.
                      </span>
                      <span className="font-mono text-[10px] text-blue-900 block truncate">
                        ID: {activeReport.id}
                      </span>
                    </div>
                  </div>

                  {/* Right: Official Signer Signature Box */}
                  <div className="text-right text-xs space-y-1">
                    <div>{activeReport.deceased.city}, {activeReport.dukcapilIssuance?.issuedAt}</div>
                    <div className="font-semibold text-slate-800">
                      Kepala Dinas Kependudukan dan Pencatatan Sipil
                    </div>
                    <div className="my-2 inline-flex flex-col items-center justify-center p-2 rounded bg-indigo-50 border border-indigo-200 text-indigo-950 font-mono text-[10px]">
                      <span className="font-bold">🔐 TERTANDA SECARA ELEKTRONIK</span>
                      <span>Ed25519 DS: {activeReport.rtRwSignature?.signatureHex.slice(0, 18)}...</span>
                    </div>
                    <div className="font-bold text-slate-900 underline text-sm">
                      {activeReport.dukcapilIssuance?.officerName}
                    </div>
                    <div className="font-mono text-slate-600 text-[11px]">
                      NIP. {activeReport.dukcapilIssuance?.officerNip}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* PIN Authentication Modal Component */}
      {activeReport && (
        <ModalAuthPin
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => {
            setIsPinModalOpen(false);
            setIsUnlocked(true);
          }}
          deceasedName={activeReport.deceased.fullName}
          expectedPin={deceasedPin}
          reportId={activeReport.id}
        />
      )}
    </div>
  );
}

export default function CertificateDownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-600">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-700 border-t-transparent rounded-full mb-3" />
          <p className="text-sm font-semibold">Memuat Layanan Unduh Akta...</p>
        </div>
      }
    >
      <CertificateDownloadContent />
    </Suspense>
  );
}


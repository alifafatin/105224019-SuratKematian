'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import BadgeStatus from '@/components/BadgeStatus';
import CardInfo from '@/components/CardInfo';
import { getStoredReports, updateReportStatus } from '@/lib/mockData';
import { DeathReport } from '@/types';

type DashboardTab = 'all' | 'rtrw' | 'dukcapil' | 'completed';

export default function DashboardPage() {
  const [reports, setReports] = useState<DeathReport[]>(() => getStoredReports());
  const [activeTab, setActiveTab] = useState<DashboardTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<DeathReport | null>(null);

  // Signature simulation states
  const [signingReportId, setSigningReportId] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signStepNotice, setSignStepNotice] = useState<string | null>(null);

  // Dukcapil issuance simulation state
  const [issuingReportId, setIssuingReportId] = useState<string | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);

  // Filter reports based on active tab and search query
  const filteredReports = reports.filter((report) => {
    // Search filter
    const matchesSearch =
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.deceased.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.deceased.nik.includes(searchQuery) ||
      report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.deceased.kelurahan.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'rtrw') {
      return (
        report.status === 'AWAITING_RTRW_APPROVAL' ||
        report.status === 'DRAFT_ENCRYPTED'
      );
    }
    if (activeTab === 'dukcapil') {
      return (
        report.status === 'ED25519_SIGNED' ||
        report.status === 'PROCESSING_DUKCAPIL'
      );
    }
    if (activeTab === 'completed') {
      return report.status === 'CERTIFICATE_ISSUED';
    }

    return true;
  });

  // Stat calculations
  const stats = {
    total: reports.length,
    awaitingRtrw: reports.filter(
      (r) => r.status === 'AWAITING_RTRW_APPROVAL' || r.status === 'DRAFT_ENCRYPTED'
    ).length,
    awaitingDukcapil: reports.filter(
      (r) => r.status === 'ED25519_SIGNED' || r.status === 'PROCESSING_DUKCAPIL'
    ).length,
    completed: reports.filter((r) => r.status === 'CERTIFICATE_ISSUED').length,
  };

  // RT/RW Ed25519 Digital Signature Handler
  const handleSignRTRW = (report: DeathReport) => {
    setSigningReportId(report.id);
    setIsSigning(true);
    setSignStepNotice('Memuat Kunci Privat Ed25519 RT/RW dari Enklaf Aman...');

    setTimeout(() => {
      setSignStepNotice('Signing with Ed25519 Digital Signature...');

      setTimeout(() => {
        const randomSigPart = Math.random().toString(16).substring(2, 18);
        const signatureHex = `3045022100${randomSigPart}${randomSigPart}0220${randomSigPart}${randomSigPart}`;
        const timestamp = new Date().toLocaleString('id-ID') + ' WIB';

        const updated = updateReportStatus(report.id, 'ED25519_SIGNED', {
          rtRwSignature: {
            algorithm: 'Ed25519',
            signerName: report.assignedRTRW.officerName,
            signerRole: 'Ketua RT',
            signatureHex,
            publicKey: report.assignedRTRW.publicKeyEd25519,
            timestamp,
            verified: true,
          },
          notes: `Disetujui dan ditandatangani secara digital (Ed25519) oleh ${report.assignedRTRW.officerName}. Otomatis diteruskan ke antrean verifikasi Dinas Dukcapil.`,
        });

        setReports(updated);
        setIsSigning(false);
        setSigningReportId(null);
        setSignStepNotice(null);

        // Update selected detail modal if open
        if (selectedReport && selectedReport.id === report.id) {
          const fresh = updated.find((r) => r.id === report.id);
          if (fresh) setSelectedReport(fresh);
        }
      }, 1000);
    }, 600);
  };

  // Dukcapil Certificate Issuance Handler
  const handleIssueDukcapil = (report: DeathReport) => {
    setIssuingReportId(report.id);
    setIsIssuing(true);

    setTimeout(() => {
      const year = new Date().getFullYear();
      const randomCertSeq = Math.floor(1000 + Math.random() * 9000);
      const certNo = `3273-KM-${year}-${randomCertSeq}`;
      const now = new Date().toLocaleString('id-ID') + ' WIB';

      const updated = updateReportStatus(report.id, 'CERTIFICATE_ISSUED', {
        dukcapilIssuance: {
          issuedAt: now,
          officerName: 'H. Dedi Hermawan, M.Si',
          officerNip: '19740512 199903 1 002',
          certificateNumber: certNo,
          qrValidationUrl: `https://dukcapil.bandung.go.id/validasi/surkem/${certNo}`,
          pbkdf2Salt: '7f9a8b1c2d3e4f5a6b7c8d9e',
          pbkdf2Iterations: 100000,
        },
        notes: `surat kematian resmi Nomor ${certNo} telah diterbitkan secara sah oleh Dinas Kependudukan dan Pencatatan Sipil. Siap diunduh oleh pelapor menggunakan kredensial PIN NIK.`,
      });

      setReports(updated);
      setIsIssuing(false);
      setIssuingReportId(null);

      // Update selected detail modal if open
      if (selectedReport && selectedReport.id === report.id) {
        const fresh = updated.find((r) => r.id === report.id);
        if (fresh) setSelectedReport(fresh);
      }
    }, 900);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-200">
              Panel Verifikasi Aparatur
            </span>
            <span className="text-xs text-slate-700">SPBE Terintegrasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard Verifikasi RT/RW & Dinas Kependudukan
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-700 max-w-3xl leading-relaxed">
            Pusat kendali dan otorisasi permohonan Surat Kematian Digital. Pengurus RT/RW dapat meninjau berkas dan membubuhkan tanda tangan kriptografi <strong className="text-slate-900 font-semibold">Ed25519</strong>, disusul penerbitan resmi oleh operator Dukcapil.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            + Buat Laporan Baru
          </Link>
        </div>
      </div>

      {/* Statistical Summary Cards via CardInfo Component */}
      <section aria-labelledby="section-dashboard-stats" className="mb-8">
        <h2 id="section-dashboard-stats" className="sr-only">
          Ringkasan Statistik Permohonan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardInfo
            title="Total Permohonan"
            value={stats.total}
            subtitle="Semua berkas masuk di sistem"
            variant="default"
            headingLevel="h3"
            icon={
              <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <CardInfo
            title="Menunggu Persetujuan RT/RW"
            value={stats.awaitingRtrw}
            subtitle="Memerlukan TTD Ed25519"
            variant="warning"
            headingLevel="h3"
            icon={
              <svg className="w-5 h-5 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <CardInfo
            title="Verifikasi Dukcapil"
            value={stats.awaitingDukcapil}
            subtitle="Siap diterbitkan Akta Resmi"
            variant="info"
            headingLevel="h3"
            icon={
              <svg className="w-5 h-5 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <CardInfo
            title="Akta Telah Terbit"
            value={stats.completed}
            subtitle="Siap diunduh dengan PIN NIK"
            variant="success"
            headingLevel="h3"
            icon={
              <svg className="w-5 h-5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Main Table / Verification Area */}
      <section aria-labelledby="section-table-heading" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls: Search, Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 id="section-table-heading" className="text-lg font-bold text-slate-900">
              Daftar Berkas Masuk & Antrean Penandatanganan
            </h2>
            <p className="text-xs text-slate-700">
              Pilih permohonan untuk meninjau identitas, memeriksa hash dokumen, dan membubuhkan otorisasi digital.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72">
            <label htmlFor="dashboard-search-input" className="sr-only">
              Cari permohonan berdasarkan nama, NIK, atau ID
            </label>
            <div className="relative">
              <input
                id="dashboard-search-input"
                name="dashboardSearch"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID, NIK, atau Nama..."
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-blue-700"
              />
              <svg
                className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50/50 px-4 sm:px-5">
          <nav role="tablist" aria-label="Filter Berdasarkan Tahapan Layanan" className="flex space-x-2 sm:space-x-4 overflow-x-auto">
            <button
              role="tab"
              id="tab-all"
              aria-selected={activeTab === 'all'}
              aria-controls="panel-reports"
              onClick={() => setActiveTab('all')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 ${
                activeTab === 'all'
                  ? 'border-blue-700 text-blue-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-700 hover:text-slate-900'
              }`}
            >
              Semua Permohonan ({stats.total})
            </button>
            <button
              role="tab"
              id="tab-rtrw"
              aria-selected={activeTab === 'rtrw'}
              aria-controls="panel-reports"
              onClick={() => setActiveTab('rtrw')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 ${
                activeTab === 'rtrw'
                  ? 'border-amber-600 text-amber-950 bg-white shadow-2xs'
                  : 'border-transparent text-slate-700 hover:text-slate-900'
              }`}
            >
              Antrean RT/RW ({stats.awaitingRtrw})
            </button>
            <button
              role="tab"
              id="tab-dukcapil"
              aria-selected={activeTab === 'dukcapil'}
              aria-controls="panel-reports"
              onClick={() => setActiveTab('dukcapil')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 ${
                activeTab === 'dukcapil'
                  ? 'border-blue-700 text-blue-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-700 hover:text-slate-900'
              }`}
            >
              Panel Dukcapil ({stats.awaitingDukcapil})
            </button>
            <button
              role="tab"
              id="tab-completed"
              aria-selected={activeTab === 'completed'}
              aria-controls="panel-reports"
              onClick={() => setActiveTab('completed')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 ${
                activeTab === 'completed'
                  ? 'border-emerald-600 text-emerald-950 bg-white shadow-2xs'
                  : 'border-transparent text-slate-700 hover:text-slate-900'
              }`}
            >
              Akta Diterbitkan ({stats.completed})
            </button>
          </nav>
        </div>

        {/* Tab Content Panel */}
        <div id="panel-reports" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="p-0">
          {filteredReports.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3" aria-hidden="true">
                📋
              </div>
              <h3 className="text-sm font-bold text-slate-900">Tidak ada permohonan ditemukan</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ada berkas yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                  : 'Belum ada data pada kategori antrean ini.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-[11px] sm:text-xs uppercase tracking-wider font-semibold">
                    <th scope="col" className="py-3 px-4 sm:px-6">ID & Tanggal</th>
                    <th scope="col" className="py-3 px-4">Almarhum / NIK</th>
                    <th scope="col" className="py-3 px-4">Wilayah RT/RW</th>
                    <th scope="col" className="py-3 px-4">Status Alur</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 text-right">Aksi Otorisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredReports.map((report) => {
                    const isCurrentlySigning = isSigning && signingReportId === report.id;
                    const isCurrentlyIssuing = isIssuing && issuingReportId === report.id;

                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* ID & Submitted Time */}
                        <td className="py-4 px-4 sm:px-6 align-top">
                          <span className="font-mono font-bold text-blue-900 block">
                            {report.id}
                          </span>
                          <span className="text-[11px] text-slate-600 block mt-0.5">
                            {report.submittedAt}
                          </span>
                          <span className="inline-block mt-1 text-[10px] text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            Pelapor: {report.reporter.name}
                          </span>
                        </td>

                        {/* Deceased Info */}
                        <td className="py-4 px-4 align-top">
                          <span className="font-bold text-slate-900 block">
                            {report.deceased.fullName}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-mono text-slate-700">
                              NIK: {report.deceased.nik}
                            </span>
                            <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1 rounded border border-emerald-200">
                              AES-256
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-600 block mt-0.5">
                            Wafat: {report.deceased.dateOfDeath} ({report.deceased.placeOfDeath})
                          </span>
                        </td>

                        {/* Wilayah */}
                        <td className="py-4 px-4 align-top">
                          <span className="font-medium text-slate-900 block">
                            RT {report.deceased.rt} / RW {report.deceased.rw}
                          </span>
                          <span className="text-[11px] text-slate-600 block">
                            {report.deceased.kelurahan}
                          </span>
                          <span className="text-[10px] text-indigo-900 font-medium block mt-1">
                            {report.assignedRTRW.officerName}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 align-top">
                          <BadgeStatus status={report.status} size="sm" />
                          {report.rtRwSignature && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-900 font-mono">
                              <span>✓ Ed25519 Valid</span>
                            </div>
                          )}
                          {report.dukcapilIssuance && (
                            <div className="mt-1 text-[10px] text-emerald-900 font-mono">
                              No: {report.dukcapilIssuance.certificateNumber}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 sm:px-6 align-top text-right">
                          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                            {/* Detail Inspection Button */}
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                              aria-label={`Buka detail berkas laporan ${report.id}`}
                            >
                              Periksa
                            </Button>

                            {/* Stage 1 Approval: RT/RW Ed25519 Sign Button */}
                            {(report.status === 'AWAITING_RTRW_APPROVAL' ||
                              report.status === 'DRAFT_ENCRYPTED') && (
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                isLoading={isCurrentlySigning}
                                loadingText="Signing..."
                                onClick={() => handleSignRTRW(report)}
                                className="bg-indigo-700 hover:bg-indigo-800"
                                aria-label={`Tanda tangani digital Ed25519 untuk laporan ${report.id}`}
                              >
                                🖋️ TTD Ed25519
                              </Button>
                            )}

                            {/* Stage 2 Issuance: Dukcapil Issue Button */}
                            {(report.status === 'ED25519_SIGNED' ||
                              report.status === 'PROCESSING_DUKCAPIL') && (
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                isLoading={isCurrentlyIssuing}
                                loadingText="Menerbitkan..."
                                onClick={() => handleIssueDukcapil(report)}
                                className="bg-blue-700 hover:bg-blue-800"
                                aria-label={`Terbitkan surat kematian resmi untuk laporan ${report.id}`}
                              >
                                🏛️ Terbitkan Akta
                              </Button>
                            )}

                            {/* Stage 3 Completed: Direct link to download page */}
                            {report.status === 'CERTIFICATE_ISSUED' && (
                              <Link
                                href={`/unduh?id=${report.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs focus-visible:outline-2 focus-visible:outline-emerald-700"
                              >
                                📥 Unduh Akta
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Cryptographic Signing Feedback Overlay Banner */}
      {isSigning && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 p-4 flex items-center gap-3 animate-bounce"
        >
          <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-300 block">
              Operasi Kriptografi Asimetris
            </span>
            <p className="text-xs text-white font-mono">
              {signStepNotice || 'Signing with Ed25519 Digital Signature...'}
            </p>
          </div>
        </div>
      )}

      {/* Application Detail Inspection Modal */}
      {selectedReport && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReport(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-dossier-title"
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-md bg-blue-600 text-white text-xs font-bold">
                  DOSSIER
                </span>
                <div>
                  <h2 id="detail-dossier-title" className="text-base font-bold text-white leading-tight">
                    Berkas Permohonan #{selectedReport.id}
                  </h2>
                  <p className="text-xs text-slate-300">
                    Diajukan pada {selectedReport.submittedAt}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white p-1 rounded focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Tutup jendela berkas"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700 font-semibold">Tahapan Berkas Saat Ini:</span>
                <BadgeStatus status={selectedReport.status} size="md" />
              </div>

              {/* Deceased Data */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200">
                  Data Almarhum / Almarhumah
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-600 block">Nama Lengkap:</span>
                    <strong className="text-slate-900 text-sm font-bold">{selectedReport.deceased.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block">NIK (16 Digit):</span>
                    <span className="font-mono text-slate-900 font-semibold">{selectedReport.deceased.nik}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Tanggal / Jam Wafat:</span>
                    <span className="text-slate-900">{selectedReport.deceased.dateOfDeath} ({selectedReport.deceased.timeOfDeath} WIB)</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Tempat Kematian:</span>
                    <span className="text-slate-900">{selectedReport.deceased.placeOfDeath}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block">Penyebab Kematian:</span>
                    <span className="text-slate-900 font-medium">{selectedReport.deceased.causeOfDeath}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block">Alamat Duka:</span>
                    <span className="text-slate-900">
                      {selectedReport.deceased.address}, RT {selectedReport.deceased.rt} / RW {selectedReport.deceased.rw},{' '}
                      {selectedReport.deceased.kelurahan}, {selectedReport.deceased.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200">
                  Identitas Pelapor
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-600 block">Nama Pelapor:</span>
                    <strong className="text-slate-900">{selectedReport.reporter.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Hubungan Keluarga:</span>
                    <span className="text-slate-900 font-medium">{selectedReport.reporter.relation}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Kontak Terverifikasi:</span>
                    <span className="text-slate-900 font-mono">
                      {selectedReport.reporter.authMethod === 'whatsapp'
                        ? `📱 ${selectedReport.reporter.phone}`
                        : `✉️ ${selectedReport.reporter.email}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Status OTP:</span>
                    <span className="text-emerald-700 font-semibold">✓ Terverifikasi pada {selectedReport.reporter.verifiedAt}</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Documents & Payload integrity */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200">
                  Integritas Dokumen Enkripsi (AES-256-GCM)
                </h3>
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Algoritma Payload: {selectedReport.documents.encryptionAlgorithm}</span>
                    <span className="text-emerald-400">VERIFIED</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-500">Berkas Terlampir: </span>
                    {selectedReport.documents.ktpDeceasedName}, {selectedReport.documents.kkDeceasedName},{' '}
                    {selectedReport.documents.hospitalLetterName}
                  </div>
                  <div className="text-[11px] text-amber-300 break-all">
                    <span className="text-slate-500">IV Hex: </span>
                    {selectedReport.documents.ivHex}
                  </div>
                  <div className="text-[11px] text-indigo-300 break-all">
                    <span className="text-slate-500">SHA-256 Checksum: </span>
                    {selectedReport.documents.payloadHashAes256Gcm}
                  </div>
                </div>
              </div>

              {/* Digital Signature Audit Trail (If signed) */}
              {selectedReport.rtRwSignature && (
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200">
                    Tanda Tangan Digital RT/RW (Ed25519)
                  </h3>
                  <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-lg text-xs text-indigo-950 space-y-1 font-mono">
                    <div>
                      <span className="text-indigo-700">Penandatangan:</span> {selectedReport.rtRwSignature.signerName}
                    </div>
                    <div>
                      <span className="text-indigo-700">Waktu Tanda Tangan:</span> {selectedReport.rtRwSignature.timestamp}
                    </div>
                    <div className="truncate">
                      <span className="text-indigo-700">Public Key Ed25519:</span> {selectedReport.rtRwSignature.publicKey}
                    </div>
                    <div className="break-all text-[11px] text-indigo-900">
                      <span className="text-indigo-700">Signature Hash:</span> {selectedReport.rtRwSignature.signatureHex}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-600">
                Catatan: {selectedReport.notes}
              </span>

              <div className="flex items-center gap-2">
                {(selectedReport.status === 'AWAITING_RTRW_APPROVAL' ||
                  selectedReport.status === 'DRAFT_ENCRYPTED') && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleSignRTRW(selectedReport)}
                    className="bg-indigo-700 hover:bg-indigo-800"
                  >
                    🖋️ Tanda Tangani (Ed25519)
                  </Button>
                )}

                {(selectedReport.status === 'ED25519_SIGNED' ||
                  selectedReport.status === 'PROCESSING_DUKCAPIL') && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleIssueDukcapil(selectedReport)}
                  >
                    🏛️ Terbitkan Akta Resmi
                  </Button>
                )}

                {selectedReport.status === 'CERTIFICATE_ISSUED' && (
                  <Link
                    href={`/unduh?id=${selectedReport.id}`}
                    className="inline-flex items-center px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold focus-visible:outline-2 focus-visible:outline-emerald-700"
                  >
                    📥 Buka Halaman Unduh
                  </Link>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedReport(null)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


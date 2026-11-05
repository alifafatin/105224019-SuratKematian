'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import BadgeStatus from '@/components/BadgeStatus';
import CardInfo from '@/components/CardInfo';
import {
  getOfficerSession,
  logoutOfficer,
  getStoredAuditLogs,
  addAuditLog,
  subscribeToUserSession,
} from '@/lib/mockData';
import { DeathReport, AuditLogEntry } from '@/types';
import {
  deleteDeathReport,
  loadDeathReports,
  updateDeathReport,
} from '@/lib/report-actions';

type DashboardTab = 'queue' | 'all' | 'audit';

function getServerOfficerSession(): null {
  return null;
}

export default function DashboardPage() {
  const router = useRouter();

  const session = useSyncExternalStore(
    subscribeToUserSession,
    getOfficerSession,
    getServerOfficerSession
  );
  const [reports, setReports] = useState<DeathReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getStoredAuditLogs());
  const [activeTab, setActiveTab] = useState<DashboardTab>('queue');
  const [searchQuery, setSearchQuery] = useState('');

  // Signature simulation states
  const [signingReportId, setSigningReportId] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signStepNotice, setSignStepNotice] = useState<string | null>(null);

  // Dukcapil issuance simulation state
  const [issuingReportId, setIssuingReportId] = useState<string | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);

  // Whistle-blower / Security vulnerability states (ACM 2.5)
  const [isWhistleblowerOpen, setIsWhistleblowerOpen] = useState(false);
  const [vulnCategory, setVulnCategory] = useState('Anomali Kriptografi / Kebocoran Kunci Enkripsi');
  const [vulnSeverity, setVulnSeverity] = useState<'Rendah' | 'Sedang' | 'Tinggi / Kritis'>('Sedang');
  const [vulnAnon, setVulnAnon] = useState(true);
  const [vulnDesc, setVulnDesc] = useState('');
  const [vulnSubmittedToast, setVulnSubmittedToast] = useState(false);

  useEffect(() => {
    if (!session) return;
    let active = true;
    loadDeathReports().then((result) => {
      if (!active) return;
      setReportsLoading(false);
      setReportsError(result.error || null);
      if (result.data) setReports(result.data);
    });
    return () => {
      active = false;
    };
  }, [session]);

  const handleWhistleblowerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vulnDesc.trim()) return;

    addAuditLog({
      actorRole: vulnAnon ? 'Whistle-Blower (Anonim)' : isRTRW ? 'Ketua RT/RW' : 'Petugas Dukcapil',
      actorName: vulnAnon ? 'Aparatur Terlindungi (Whistle-Blower)' : (session?.name || 'Petugas SPBE'),
      action: `Laporan Kerentanan Sistem (${vulnSeverity}) - ${vulnCategory}`,
      targetReportId: 'SYS-RISK-ACM25',
      cryptoHash: `sec-eval:${Math.random().toString(16).substring(2, 18)}`,
      details: `[ACM 2.5 Risk Evaluation] ${vulnDesc}`,
    });

    setAuditLogs(getStoredAuditLogs());
    setIsWhistleblowerOpen(false);
    setVulnDesc('');
    setVulnSubmittedToast(true);
    setTimeout(() => setVulnSubmittedToast(false), 5000);
  };

  useEffect(() => {
    const handleAuditUpdated = () => {
      setAuditLogs(getStoredAuditLogs());
    };

    window.addEventListener('websurkem_audit_updated', handleAuditUpdated);
    return () => {
      window.removeEventListener('websurkem_audit_updated', handleAuditUpdated);
    };
  }, []);

  const handleLogout = () => {
    logoutOfficer();
    router.push('/login-petugas');
  };

  // ==========================================
  // RBAC ACCESS GUARD: Requires Officer Session
  // ==========================================
  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <section
          aria-labelledby="access-restricted-title"
          className="bg-white rounded-2xl border-2 border-amber-300 p-8 sm:p-12 shadow-lg text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-3xl mb-4" aria-hidden="true">
            🔒
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 mb-2">
            Akses Dibatasi • Otentikasi Petugas Diperlukan
          </span>

          <h1 id="access-restricted-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Ini Khusus untuk Aparatur RT/RW & Petugas Dukcapil
          </h1>

          <p className="mt-3 text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Untuk menjaga kerahasiaan identitas dan data duka warga sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP), portal kerja verifikasi hanya dapat diakses melalui otentikasi aparatur yang berwenang.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login-petugas"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-md focus-visible:outline-2 focus-visible:outline-blue-700"
            >
              🔐 Masuk ke Portal Petugas →
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-slate-700"
            >
              Kembali ke Beranda Warga
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const isRTRW = session.role === 'rtrw';
  const isDukcapil = session.role === 'dukcapil';

  // Specific role filtering
  const filteredReports = reports.filter((report) => {
    // Search query match
    const matchesSearch =
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.deceased.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.deceased.nik.includes(searchQuery) ||
      report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.deceased.kelurahan.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Queue tab: specific to logged-in officer role
    if (activeTab === 'queue') {
      if (isRTRW) {
        // RT/RW views neighborhood drafts needing local approval
        return (
          report.status === 'AWAITING_RTRW_APPROVAL' ||
          report.status === 'DRAFT_ENCRYPTED'
        );
      } else {
        // Dukcapil views Ed25519-signed drafts ready for official certificate issuance
        return (
          report.status === 'ED25519_SIGNED' ||
          report.status === 'PROCESSING_DUKCAPIL'
        );
      }
    }

    return true;
  });

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.targetReportId.toLowerCase().includes(q) ||
      log.cryptoHash.toLowerCase().includes(q)
    );
  });

  // Calculate statistics
  const stats = {
    total: reports.length,
    rtrwPending: reports.filter((r) => r.status === 'AWAITING_RTRW_APPROVAL' || r.status === 'DRAFT_ENCRYPTED').length,
    dukcapilPending: reports.filter((r) => r.status === 'ED25519_SIGNED' || r.status === 'PROCESSING_DUKCAPIL').length,
    completed: reports.filter((r) => r.status === 'CERTIFICATE_ISSUED').length,
    auditCount: auditLogs.length,
  };

  // RT/RW Ed25519 Digital Signature Handler
  const handleSignRTRW = async (report: DeathReport) => {
    setSigningReportId(report.id);
    setIsSigning(true);
    setSignStepNotice('Memuat Kunci Privat Ed25519 RT/RW dari Enklaf Aman...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSignStepNotice('Signing with Ed25519 Digital Signature...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const signatureBytes = new Uint8Array(8);
      window.crypto.getRandomValues(signatureBytes);
      const randomSigPart = Array.from(signatureBytes, (byte) =>
        byte.toString(16).padStart(2, '0')
      ).join('');
      const signatureHex = `3045022100${randomSigPart}${randomSigPart}0220${randomSigPart}${randomSigPart}`;
      const timestamp = new Date().toLocaleString('id-ID') + ' WIB';
      const result = await updateDeathReport(report.id, {
        status: 'ED25519_SIGNED',
        rtRwSignature: {
          algorithm: 'Ed25519',
          signerName: session.name,
          signerRole: 'Ketua RT',
          signatureHex,
          publicKey: report.assignedRTRW.publicKeyEd25519,
          timestamp,
          verified: true,
        },
        notes: `Disetujui oleh ${session.name}. Diteruskan ke antrean verifikasi Dinas Dukcapil.`,
      });
      if (!result.data) {
        setReportsError(result.error || 'Perubahan status gagal disimpan.');
        return;
      }
      const updatedReport = result.data;

      addAuditLog({
        actorRole: 'Ketua RT/RW',
        actorName: session.name,
        action: 'Persetujuan Pengajuan',
        targetReportId: report.id,
        cryptoHash: `ed25519:${signatureHex.slice(0, 36)}...`,
        details: `Pengajuan ${report.deceased.fullName} disetujui oleh ${session.name} (${session.region}).`,
      });
      setReports((current) =>
        current.map((item) => (item.id === report.id ? updatedReport : item))
      );
      setAuditLogs(getStoredAuditLogs());
      setReportsError(null);
    } catch (error) {
      console.error('Gagal memproses persetujuan RT/RW:', error);
      setReportsError('Persetujuan gagal diproses.');
    } finally {
      setIsSigning(false);
      setSigningReportId(null);
      setSignStepNotice(null);
    }
  };

  // Dukcapil Certificate Issuance Handler
  const handleIssueDukcapil = async (report: DeathReport) => {
    setIssuingReportId(report.id);
    setIsIssuing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const year = new Date().getFullYear();
      const randomCertSeq = Math.floor(1000 + Math.random() * 9000);
      const certNo = `3273-KM-${year}-${randomCertSeq}`;
      const now = new Date().toLocaleString('id-ID') + ' WIB';

      const result = await updateDeathReport(report.id, {
        status: 'CERTIFICATE_ISSUED',
        dukcapilIssuance: {
          issuedAt: now,
          officerName: session.name,
          officerNip: session.nipOrNik || '19740512 199903 1 002',
          certificateNumber: certNo,
          qrValidationUrl: `https://dukcapil.bandung.go.id/validasi/surkem/${certNo}`,
          pbkdf2Salt: '7f9a8b1c2d3e4f5a6b7c8d9e',
          pbkdf2Iterations: 100000,
        },
        notes: `Akta Kematian resmi Nomor ${certNo} telah diterbitkan secara sah oleh Dinas Kependudukan dan Pencatatan Sipil. Siap diunduh oleh pelapor menggunakan kredensial PIN NIK.`,
      });

      if (!result.data) {
        setReportsError(result.error || 'Penerbitan gagal disimpan.');
        return;
      }
      const updatedReport = result.data;

      addAuditLog({
        actorRole: 'Petugas Dukcapil',
        actorName: `${session.name} (NIP. ${session.nipOrNik})`,
        action: 'Penerbitan Resmi Akta Kematian Digital (BSrE & QR)',
        targetReportId: report.id,
        cryptoHash: `bsre:${certNo}:pbkdf2_100k`,
        details: `Akta Kematian Nomor ${certNo} diterbitkan untuk ${report.deceased.fullName}. Dilindungi PIN dekripsi NIK ${report.deceased.nik.slice(-4)}.`,
      });
      setReports((current) =>
        current.map((item) => (item.id === report.id ? updatedReport : item))
      );
      setAuditLogs(getStoredAuditLogs());
      setReportsError(null);
    } catch (error) {
      console.error('Gagal memproses penerbitan Dukcapil:', error);
      setReportsError('Penerbitan gagal diproses.');
    } finally {
      setIsIssuing(false);
      setIssuingReportId(null);
    }
  };

  const handleDeleteReport = async (report: DeathReport) => {
    const confirmed = window.confirm(
      `Hapus permanen pengajuan ${report.id} atas nama ${report.deceased.fullName}? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setDeletingReportId(report.id);
    const result = await deleteDeathReport(report.id);
    setDeletingReportId(null);
    if (!result.data) {
      setReportsError(result.error || 'Pengajuan gagal dihapus.');
      return;
    }

    setReports((current) => current.filter((item) => item.id !== report.id));
    setReportsError(null);
    addAuditLog({
      actorRole: 'Petugas Dukcapil',
      actorName: session.name,
      action: 'Penghapusan Pengajuan',
      targetReportId: report.id,
      cryptoHash: 'penghapusan-data',
      details: `Pengajuan ${report.deceased.fullName} dihapus dari database.`,
    });
    setAuditLogs(getStoredAuditLogs());
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {reportsError && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <span>{reportsError}</span>
          <button
            type="button"
            className="font-semibold underline"
            onClick={async () => {
              setReportsLoading(true);
              const result = await loadDeathReports();
              setReportsLoading(false);
              setReportsError(result.error || null);
              if (result.data) setReports(result.data);
            }}
          >
            Coba lagi
          </button>
        </div>
      )}
      {!reportsError && reportsLoading && (
        <p role="status" className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Memuat data pengajuan dari database...
        </p>
      )}
      {/* Officer Header with Profile & Logout */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isRTRW
                  ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                  : 'bg-blue-100 text-blue-950 border-blue-300'
              }`}
            >
              {isRTRW ? '🏡 Portal Verifikator RT/RW' : '🏛️ Panel Administrator Dukcapil'}
            </span>
            <span className="text-xs text-slate-600">Sesi Kriptografi Aktif</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {isRTRW ? 'Dashboard Pengurus RT/RW' : 'Panel Verifikasi Dinas Dukcapil'}
          </h1>

          <p className="mt-1 text-sm text-slate-700 max-w-3xl leading-relaxed">
            {isRTRW
              ? `Wilayah Tugas: ${session.region}. Tinjau berkas kematian warga setempat dan bubuhkan tanda tangan digital Ed25519.`
              : 'Verifikasi berkas kematian lintas wilayah yang telah ditandatangani RT/RW, terbitkan Kutipan Akta Kematian resmi, dan pantau log audit sistem.'}
          </p>
        </div>

        {/* Officer Profile Card & Logout */}
        <div className="shrink-0 flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg text-white font-bold text-xs ${isRTRW ? 'bg-indigo-700' : 'bg-blue-700'}`}>
              {isRTRW ? 'RT' : 'DKP'}
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block leading-tight">{session.name}</span>
              <span className="text-[11px] text-slate-500 leading-tight">{session.region}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold cursor-pointer transition-colors"
            title="Keluar dari sesi petugas"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Statistical Summary Cards */}
      <section aria-labelledby="section-dashboard-stats" className="mb-8">
        <h2 id="section-dashboard-stats" className="sr-only">
          Ringkasan Statistik Permohonan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardInfo
            title={isRTRW ? 'Menunggu TTD RT/RW' : 'Menunggu Terbit Dukcapil'}
            value={isRTRW ? stats.rtrwPending : stats.dukcapilPending}
            subtitle={isRTRW ? 'Perlu Tanda Tangan Ed25519' : 'Draft Siap Terbit Akta'}
            variant="warning"
            headingLevel="h3"
            icon={
              <svg className="w-5 h-5 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <CardInfo
            title="Akta Selesai Terbit"
            value={stats.completed}
            subtitle="Telah diterbitkan resmi"
            variant="success"
            headingLevel="h3"
            icon={
              <svg className="w-5 h-5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <CardInfo
            title="Total Berkas Keseluruhan"
            value={stats.total}
            subtitle="Semua permohonan masuk"
            variant="default"
            headingLevel="h3"
            icon={
              <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <CardInfo
            title="Jejak Audit Sistem"
            value={stats.auditCount}
            subtitle="Catatan log kriptografis"
            variant="primary"
            headingLevel="h3"
            icon={
              <svg className="w-5 h-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Toast Confirmation for Vulnerability Report */}
      {vulnSubmittedToast && (
        <div
          role="status"
          aria-live="polite"
          className="mb-8 p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-medium flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <span className="text-emerald-800 font-bold text-base">✓</span>
            <span>
              <strong>Laporan Kerentanan Sistem Tercatat:</strong> Laporan telah dienkripsi dan disimpan dalam Audit Trail SPBE. Identitas pelapor dilindungi sesuai etika komputasi ACM 2.5 (Evaluation of System Risks).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setVulnSubmittedToast(false)}
            className="text-emerald-800 hover:text-emerald-950 font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dedicated Audit Trail & Cryptographic Verification Log Widget (ACM 2.5 Risk Evaluation) */}
      <section
        aria-labelledby="section-audit-widget"
        className="mb-8 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Live Cryptographic Transparency • ACM 2.5 Evaluation of System Risks
              </span>
            </div>
            <h2 id="section-audit-widget" className="text-lg font-bold text-white tracking-tight">
              Audit Trail &amp; Cryptographic Verification Log
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-0.5">
              Pencatatan keputusan aparatur dan transaksi kriptografis secara transparan, akuntabel, dan bebas penyangkalan (non-repudiation) untuk audit berkala SPBE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsWhistleblowerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <span>🚨</span>
              <span>Laporkan Kerentanan / Whistle-Blower (ACM 2.5)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors focus-visible:outline-2 focus-visible:outline-blue-400 cursor-pointer"
            >
              <span>Lihat Semua Log ({stats.auditCount}) →</span>
            </button>
          </div>
        </div>

        {/* Live Event Stream / Decision Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {auditLogs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              className="rounded-xl bg-slate-800/80 border border-slate-700/80 p-3.5 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-700/60 pb-1.5 mb-1.5">
                  <span className="font-mono text-slate-300">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      log.actorRole === 'Petugas Dukcapil'
                        ? 'bg-blue-900/60 text-blue-300 border border-blue-600/40'
                        : log.actorRole === 'Ketua RT/RW'
                        ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-600/40'
                        : log.actorRole.includes('Whistle')
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-600/40'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {log.actorRole}
                  </span>
                </div>
                <div className="text-xs font-bold text-white leading-tight">
                  {log.action}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {log.details}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="text-emerald-400 truncate max-w-[150px]">{log.cryptoHash}</span>
                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300">#{log.targetReportId}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Table / Verification Area */}
      <section aria-labelledby="section-table-heading" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search Bar & Title */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 id="section-table-heading" className="text-lg font-bold text-slate-900">
              {activeTab === 'audit' ? 'Jejak Audit Kriptografi (Immutable Audit Trail)' : `Antrean Kerja: ${isRTRW ? 'Persetujuan RT/RW' : 'Penerbitan Dukcapil'}`}
            </h2>
            <p className="text-xs text-slate-700">
              {isRTRW
                ? 'Pilih permohonan warga untuk memeriksa kesesuaian dokumen dan membubuhkan tanda tangan Ed25519.'
                : 'Pilih permohonan yang telah diverifikasi RT/RW untuk menerbitkan Akta Kematian resmi ber-QR Code.'}
            </p>
          </div>

          <div className="w-full md:w-72">
            <label htmlFor="dashboard-search-input" className="sr-only">
              Cari permohonan berdasarkan nama, NIK, ID, atau aksi
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
          <nav role="tablist" aria-label="Filter Antrean Petugas" className="flex space-x-2 sm:space-x-4 overflow-x-auto">
            <button
              role="tab"
              id="tab-queue"
              aria-selected={activeTab === 'queue'}
              aria-controls="panel-reports"
              onClick={() => setActiveTab('queue')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 cursor-pointer ${
                activeTab === 'queue'
                  ? 'border-blue-700 text-blue-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-700 hover:text-slate-900'
              }`}
            >
              {isRTRW ? `Antrean RT/RW (${stats.rtrwPending})` : `Antrean Dukcapil (${stats.dukcapilPending})`}
            </button>
            <button
              role="tab"
              id="tab-all"
              aria-selected={activeTab === 'all'}
              aria-controls="panel-reports"
              onClick={() => setActiveTab('all')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 cursor-pointer ${
                activeTab === 'all'
                  ? 'border-blue-700 text-blue-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-700 hover:text-slate-900'
              }`}
            >
              Semua Berkas ({stats.total})
            </button>
            <button
              role="tab"
              id="tab-audit"
              aria-selected={activeTab === 'audit'}
              aria-controls="panel-reports"
              onClick={() => setActiveTab('audit')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-slate-800 text-slate-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-700 hover:text-slate-900'
              }`}
            >
              🛡️ Audit Trail Log ({stats.auditCount})
            </button>
          </nav>
        </div>

        {/* Tab Content Panel */}
        <div id="panel-reports" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="p-0">
          {/* AUDIT TRAIL TAB */}
          {activeTab === 'audit' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-[11px] sm:text-xs uppercase tracking-wider font-semibold">
                    <th scope="col" className="py-3 px-4 sm:px-6">Waktu & Aktor</th>
                    <th scope="col" className="py-3 px-4">Tindakan / Peristiwa</th>
                    <th scope="col" className="py-3 px-4">Target Berkas</th>
                    <th scope="col" className="py-3 px-4 sm:px-6">Hash Kriptografi & Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 align-top">
                        <span className="font-mono text-slate-600 block text-[11px]">{log.timestamp}</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{log.actorName}</span>
                        <span className="inline-block mt-1 text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {log.actorRole}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <strong className="text-slate-900 font-bold block">{log.action}</strong>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {log.targetReportId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 align-top font-mono text-[11px]">
                        <div className="bg-slate-900 text-emerald-400 p-2 rounded text-[10px] break-all max-w-xs">
                          {log.cryptoHash}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3" aria-hidden="true">
                📋
              </div>
              <h3 className="text-sm font-bold text-slate-900">Tidak ada permohonan ditemukan</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ada berkas yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                  : 'Belum ada data pada antrean ini.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-[11px] sm:text-xs uppercase tracking-wider font-semibold">
                    <th scope="col" className="py-3 px-4 sm:px-6">ID & Tanggal</th>
                    <th scope="col" className="py-3 px-4">Almarhum / NIK</th>
                    <th scope="col" className="py-3 px-4">Wilayah</th>
                    <th scope="col" className="py-3 px-4">Status Alur</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 text-right">Aksi Otorisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredReports.map((report) => {
                    const isCurrentlySigning = isSigning && signingReportId === report.id;
                    const isCurrentlyIssuing = isIssuing && issuingReportId === report.id;

                    return (
                      <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 sm:px-6 align-top">
                          <span className="font-mono font-bold text-blue-900 block">{report.id}</span>
                          <span className="text-[11px] text-slate-600 block mt-0.5">{report.submittedAt}</span>
                          <span className="inline-block mt-1 text-[10px] text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            Pelapor: {report.reporter.name}
                          </span>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <span className="font-bold text-slate-900 block">{report.deceased.fullName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-mono text-slate-700">NIK: {report.deceased.nik}</span>
                            <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1 rounded border border-emerald-200">
                              AES-256
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-600 block mt-0.5">
                            Wafat: {report.deceased.dateOfDeath} ({report.deceased.placeOfDeath})
                          </span>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <span className="font-medium text-slate-900 block">
                            RT {report.deceased.rt} / RW {report.deceased.rw}
                          </span>
                          <span className="text-[11px] text-slate-600 block">{report.deceased.kelurahan}</span>
                        </td>

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

                        <td className="py-4 px-4 sm:px-6 align-top text-right">
                          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/${report.id}`}
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs focus-visible:outline-2 focus-visible:outline-slate-700 transition-colors"
                              aria-label={`Periksa berkas laporan ${report.id}`}
                            >
                              Periksa
                            </Link>

                            {/* RT/RW Signing Action */}
                            {isRTRW &&
                              (report.status === 'AWAITING_RTRW_APPROVAL' ||
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

                            {/* Dukcapil Issuance Action */}
                            {isDukcapil &&
                              (report.status === 'ED25519_SIGNED' ||
                                report.status === 'PROCESSING_DUKCAPIL') && (
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  isLoading={isCurrentlyIssuing}
                                  loadingText="Menerbitkan..."
                                  onClick={() => handleIssueDukcapil(report)}
                                  className="bg-blue-700 hover:bg-blue-800"
                                  aria-label={`Terbitkan akta kematian resmi untuk laporan ${report.id}`}
                                >
                                  🏛️ Terbitkan Akta
                                </Button>
                              )}

                            {report.status === 'CERTIFICATE_ISSUED' && (
                              <Link
                                href={`/unduh?id=${report.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs focus-visible:outline-2 focus-visible:outline-emerald-700"
                              >
                                📥 Unduh Akta
                              </Link>
                            )}
                            {isDukcapil && (
                              <button
                                type="button"
                                disabled={deletingReportId === report.id}
                                onClick={() => handleDeleteReport(report)}
                                className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-red-700"
                                aria-label={`Hapus permanen pengajuan ${report.id}`}
                              >
                                {deletingReportId === report.id ? 'Menghapus...' : 'Hapus'}
                              </button>
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

      {/* Signing Progress Feedback Overlay */}
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
            <span className="text-xs font-bold text-indigo-300 block">Operasi Kriptografi Asimetris</span>
            <p className="text-xs text-white font-mono">{signStepNotice || 'Signing with Ed25519 Digital Signature...'}</p>
          </div>
        </div>
      )}

      {/* Whistle-Blower / Security Vulnerability Reporting Modal (ACM 2.5) */}
      {isWhistleblowerOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWhistleblowerOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="whistleblower-modal-title"
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm">🚨</span>
                <div>
                  <h2 id="whistleblower-modal-title" className="text-base font-bold text-white leading-tight">
                    Laporkan Kerentanan Keamanan (ACM 2.5)
                  </h2>
                  <p className="text-xs text-amber-300 font-mono">Whistle-Blower Protection &amp; Risk Evaluation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWhistleblowerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                aria-label="Tutup modal laporan kerentanan"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleWhistleblowerSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Sesuai <strong>ACM Code of Ethics Section 2.5 (Evaluation of System Risks)</strong>, aparatur berhak melaporkan potensi risiko, kebocoran kunci, atau anomali verifikasi. Laporan ini dicatat secara aman dalam log audit SPBE dengan jaminan perlindungan identitas pelapor.
              </p>

              <div>
                <label
                  htmlFor="vuln-category-select"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Kategori Kerentanan / Isu Etika <span className="text-red-700">*</span>
                </label>
                <select
                  id="vuln-category-select"
                  value={vulnCategory}
                  onChange={(e) => setVulnCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-white focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  <option value="Anomali Kriptografi / Kebocoran Kunci Enkripsi">
                    Anomali Kriptografi / Kebocoran Kunci Enkripsi (AES/Ed25519)
                  </option>
                  <option value="Inkonsistensi Integritas Dokumen / Checksum Mismatch">
                    Inkonsistensi Integritas Dokumen / Checksum Mismatch
                  </option>
                  <option value="Potensi Pelanggaran Privasi Warga (UU PDP No. 27/2022)">
                    Potensi Pelanggaran Privasi Warga (UU PDP No. 27/2022)
                  </option>
                  <option value="Kegagalan Verifikasi Identitas / Pemalsuan NIK">
                    Kegagalan Verifikasi Identitas / Pemalsuan NIK
                  </option>
                  <option value="Celah Otentikasi Sesi Petugas">Celah Otentikasi Sesi Petugas</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="vuln-severity-select"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Tingkat Keparahan Risiko <span className="text-red-700">*</span>
                </label>
                <select
                  id="vuln-severity-select"
                  value={vulnSeverity}
                  onChange={(e) => {
                    const severity = e.target.value;
                    if (
                      severity === 'Rendah' ||
                      severity === 'Sedang' ||
                      severity === 'Tinggi / Kritis'
                    ) {
                      setVulnSeverity(severity);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-white focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  <option value="Rendah">Rendah (Pemberitahuan Rutin)</option>
                  <option value="Sedang">Sedang (Perlu Investigasi Tim Keamanan)</option>
                  <option value="Tinggi / Kritis">Tinggi / Kritis (Memerlukan Tindakan Segera)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="vuln-desc-textarea"
                  className="block text-xs font-semibold text-slate-800 mb-1"
                >
                  Deskripsi Temuan / Penjelasan Risiko <span className="text-red-700">*</span>
                </label>
                <textarea
                  id="vuln-desc-textarea"
                  required
                  rows={3}
                  value={vulnDesc}
                  onChange={(e) => setVulnDesc(e.target.value)}
                  placeholder="Jelaskan anomali, nomor berkas terkait (jika ada), atau perilaku sistem yang mencurigakan..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-white focus-visible:outline-2 focus-visible:outline-blue-700"
                />
              </div>

              <div className="pt-1">
                <label
                  htmlFor="vuln-anon-checkbox"
                  className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer"
                >
                  <input
                    id="vuln-anon-checkbox"
                    type="checkbox"
                    checked={vulnAnon}
                    onChange={(e) => setVulnAnon(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 focus-visible:outline-2 focus-visible:outline-blue-700"
                  />
                  <span>
                    <strong>Kirim Secara Anonim</strong> (Nama &amp; jabatan Anda disamarkan sebagai &quot;Whistle-Blower&quot; dalam log audit)
                  </span>
                </label>
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsWhistleblowerOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
                >
                  Kirim Laporan Kerentanan →
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

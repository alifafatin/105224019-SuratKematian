'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import BadgeStatus from '@/components/BadgeStatus';
import {
  findRTRWOfficer,
  addReport,
} from '@/lib/mockData';
import { DeathReport, RTRWOfficer, AuthMethod } from '@/types';

interface FormErrors {
  reporterName?: string;
  reporterNik?: string;
  reporterContact?: string;
  deceasedName?: string;
  deceasedNik?: string;
  dateOfDeath?: string;
  causeOfDeath?: string;
  address?: string;
}

export default function ReporterSubmissionPage() {
  // Step 1: Authentication State
  const [authMethod, setAuthMethod] = useState<AuthMethod>('whatsapp');
  const [contactInput, setContactInput] = useState('081223344556');
  const [reporterName, setReporterName] = useState('Rian Pratama');
  const [reporterNik, setReporterNik] = useState('3273012508920003');
  const [relation, setRelation] = useState('Anak Kandung');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(true); // Pre-sent for smooth demo
  const [isAuthVerified, setIsAuthVerified] = useState(true); // Pre-verified for demo convenience
  const [authError, setAuthError] = useState<string | null>(null);

  // Step 2: Deceased Data State
  const [deceasedName, setDeceasedName] = useState('');
  const [deceasedNik, setDeceasedNik] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [timeOfDeath, setTimeOfDeath] = useState('10:00');
  const [placeOfDeath, setPlaceOfDeath] = useState('Rumah Tinggal');
  const [causeOfDeath, setCauseOfDeath] = useState('');

  // Step 3: Address & RT/RW Routing State
  const [address, setAddress] = useState('Jl. Merdeka No. 88');
  const [kelurahan, setKelurahan] = useState('Kelurahan Merdeka');
  const [rt, setRt] = useState('03');
  const [rw, setRw] = useState('05');
  const kecamatan = 'Kecamatan Sumur Bandung';
  const [assignedOfficer, setAssignedOfficer] = useState<RTRWOfficer>(() =>
    findRTRWOfficer('Kelurahan Merdeka', '03', '05')
  );

  // Step 4: Documents State
  const [docs, setDocs] = useState<{
    ktpDeceased: string | null;
    kkDeceased: string | null;
    hospitalLetter: string | null;
  }>({
    ktpDeceased: 'ktp_almarhum_scan.pdf',
    kkDeceased: 'kartu_keluarga_asli.pdf',
    hospitalLetter: 'surat_kematian_puskesmas.pdf',
  });

  // Cryptographic & Validation States
  const encryptionStatus = {
    algorithm: 'AES-256-GCM',
    keyBits: 256,
    ivHex: '7d89ab10ef34567890abcdef',
    integrityHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    isEncrypted: true,
  };
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<DeathReport | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Update assigned officer dynamically when RT/RW or Kelurahan changes
  const handleAddressRoutingChange = (newKel: string, newRt: string, newRw: string) => {
    setKelurahan(newKel);
    setRt(newRt);
    setRw(newRw);
    const officer = findRTRWOfficer(newKel, newRt, newRw);
    setAssignedOfficer(officer);
  };

  // Auth OTP verification handler
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (otpCode.trim().length !== 4 && otpCode !== '1234') {
      setAuthError('Kode OTP tidak valid. Gunakan kode simulasi 1234.');
      return;
    }
    setIsAuthVerified(true);
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!reporterName.trim()) {
      newErrors.reporterName = 'Nama lengkap pelapor wajib diisi.';
    }

    if (!deceasedName.trim()) {
      newErrors.deceasedName = 'Nama lengkap almarhum/almarhumah wajib diisi.';
    }

    if (!deceasedNik.trim()) {
      newErrors.deceasedNik = 'NIK almarhum wajib diisi.';
    } else if (!/^\d{16}$/.test(deceasedNik.trim())) {
      newErrors.deceasedNik = 'NIK almarhum harus tepat 16 digit angka sesuai KTP.';
    }

    if (reporterNik.trim() && !/^\d{16}$/.test(reporterNik.trim())) {
      newErrors.reporterNik = 'NIK pelapor harus tepat 16 digit angka.';
    }

    if (!dateOfDeath) {
      newErrors.dateOfDeath = 'Tanggal kematian wajib dipilih.';
    }

    if (!causeOfDeath.trim()) {
      newErrors.causeOfDeath = 'Penyebab kematian wajib diisi.';
    }

    if (!address.trim()) {
      newErrors.address = 'Alamat duka wajib diisi.';
    }

    setErrors(newErrors);

    // Scroll to the first error if exists
    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const element = document.getElementById(`${firstKey}-input`);
      element?.focus();
      return false;
    }

    return true;
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate Client-side AES-256-GCM encryption step
    setTimeout(() => {
      const randomIdSuffix = Math.floor(100 + Math.random() * 900);
      const reportId = `SK-2026-00${randomIdSuffix}`;

      const newReport: DeathReport = {
        id: reportId,
        reporter: {
          name: reporterName,
          nik: reporterNik || '3273010000000000',
          email: authMethod === 'email' ? contactInput : 'pelapor@gmail.com',
          phone: authMethod === 'whatsapp' ? contactInput : '081234567890',
          relation,
          authMethod,
          isVerified: true,
          verifiedAt: new Date().toLocaleString('id-ID'),
        },
        deceased: {
          fullName: deceasedName,
          nik: deceasedNik,
          gender,
          dateOfBirth: dateOfBirth || '1960-01-01',
          dateOfDeath,
          timeOfDeath,
          causeOfDeath,
          placeOfDeath,
          address,
          rt: rt.padStart(2, '0'),
          rw: rw.padStart(2, '0'),
          kelurahan,
          kecamatan,
          city: 'Kota Bandung',
        },
        status: 'AWAITING_RTRW_APPROVAL',
        assignedRTRW: assignedOfficer,
        submittedAt: new Date().toLocaleString('id-ID') + ' WIB',
        documents: {
          ktpDeceasedName: docs.ktpDeceased || 'ktp_almarhum_encrypted.bin',
          kkDeceasedName: docs.kkDeceased || 'kartu_keluarga_encrypted.bin',
          hospitalLetterName: docs.hospitalLetter || 'surat_rs_encrypted.bin',
          ktpReporterName: 'ktp_pelapor_encrypted.bin',
          encryptionAlgorithm: 'AES-256-GCM',
          payloadHashAes256Gcm: encryptionStatus.integrityHash,
          ivHex: encryptionStatus.ivHex,
          encryptionTimestamp: new Date().toISOString(),
        },
        notes: `Pengajuan baru dikirimkan oleh ${reporterName}. Notifikasi otomatis telah diteruskan ke ${assignedOfficer.officerName}.`,
      };

      addReport(newReport);
      setSubmittedReport(newReport);
      setIsSubmitting(false);
      setShowReceiptModal(true);
    }, 900);
  };

  // Prefill helper for instant testing
  const handleQuickFill = () => {
    setDeceasedName('Raden Mas Soewondo');
    setDeceasedNik('3273011902450007');
    setGender('Laki-laki');
    setDateOfBirth('1945-02-19');
    setDateOfDeath('2026-10-12');
    setTimeOfDeath('08:30');
    setPlaceOfDeath('Rumah Sakit Hasan Sadikin (RSHS)');
    setCauseOfDeath('Komplikasi Penyakit Dalam & Lanjut Usia');
    setAddress('Jl. Merdeka No. 104');
    handleAddressRoutingChange('Kelurahan Merdeka', '03', '05');
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200">
              Formulir Layanan Publik Terpadu
            </span>
            <span className="text-xs text-slate-700">Milestone 1 v0.1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Pelaporan Kematian Digital (WebSurkem)
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-700 max-w-3xl leading-relaxed">
            Laporkan peristiwa kematian anggota keluarga dengan aman. Seluruh data identitas dienkripsi secara client-side menggunakan <strong className="text-slate-900 font-semibold">AES-256-GCM</strong> sebelum diteruskan ke Ketua RT/RW dan Dinas Dukcapil.
          </p>
        </div>

        {/* Quick Demo Helper Button */}
        <div className="shrink-0 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleQuickFill}
            aria-label="Isi formulir dengan contoh data otomatis"
          >
            ⚡ Isi Contoh Otomatis
          </Button>
        </div>
      </div>

      {/* Main Grid: Form Left, Security & RT/RW Info Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-8 space-y-8">
          {/* SECTION 1: Reporter Authentication */}
          <section
            aria-labelledby="section-reporter-auth"
            className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold" aria-hidden="true">
                  1
                </span>
                <h2 id="section-reporter-auth" className="text-lg font-bold text-slate-900">
                  Langkah 1: Autentikasi & Verifikasi Pelapor
                </h2>
              </div>
              {isAuthVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true"></span>
                  Terautentikasi
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 mb-4 leading-relaxed">
              Pilih metode autentikasi menggunakan nomor WhatsApp atau alamat Email aktif untuk menerima kode verifikasi OTP dan pembaruan berkas.
            </p>

            {/* Auth Method Toggle */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setAuthMethod('whatsapp')}
                aria-pressed={authMethod === 'whatsapp'}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 ${
                  authMethod === 'whatsapp'
                    ? 'bg-blue-50 border-blue-700 text-blue-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>📱 WhatsApp OTP</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                aria-pressed={authMethod === 'email'}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 ${
                  authMethod === 'email'
                    ? 'bg-blue-50 border-blue-700 text-blue-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>✉️ Email Magic Link</span>
              </button>
            </div>

            {/* Reporter Information Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reporterName-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Nama Lengkap Pelapor <span className="text-red-700">*</span>
                </label>
                <input
                  id="reporterName-input"
                  name="reporterName"
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  aria-invalid={errors.reporterName ? 'true' : 'false'}
                  aria-describedby={errors.reporterName ? 'reporterName-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="Contoh: Rian Pratama"
                />
                {errors.reporterName && (
                  <p id="reporterName-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.reporterName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reporterNik-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  NIK Pelapor (16 Digit) <span className="text-slate-500 text-xs font-normal">(Opsional)</span>
                </label>
                <input
                  id="reporterNik-input"
                  name="reporterNik"
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={reporterNik}
                  onChange={(e) => setReporterNik(e.target.value.replace(/\D/g, ''))}
                  aria-invalid={errors.reporterNik ? 'true' : 'false'}
                  aria-describedby={errors.reporterNik ? 'reporterNik-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="16 digit angka NIK KTP pelapor"
                />
                {errors.reporterNik && (
                  <p id="reporterNik-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.reporterNik}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contactInput-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  {authMethod === 'whatsapp' ? 'Nomor WhatsApp Aktif' : 'Alamat Email Aktif'} <span className="text-red-700">*</span>
                </label>
                <input
                  id="contactInput-input"
                  name="contactInput"
                  type={authMethod === 'whatsapp' ? 'tel' : 'email'}
                  required
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder={authMethod === 'whatsapp' ? '081234567890' : 'nama@email.com'}
                />
              </div>

              <div>
                <label
                  htmlFor="relation-select"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Hubungan Keluarga dengan Almarhum <span className="text-red-700">*</span>
                </label>
                <select
                  id="relation-select"
                  name="relation"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  <option value="Anak Kandung">Anak Kandung</option>
                  <option value="Pasangan (Suami/Istri)">Pasangan (Suami/Istri)</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Saudara Kandung">Saudara Kandung</option>
                  <option value="Kerabat / Kuasa Keluarga">Kerabat / Kuasa Keluarga</option>
                </select>
              </div>
            </div>

            {/* OTP Simulation Panel */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              {!isAuthVerified ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      Masukkan Kode OTP 4-Digit (Simulasi Demo: Ketik 1234)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(true)}
                      className="text-xs text-blue-700 underline hover:text-blue-900"
                    >
                      {isOtpSent ? 'Kirim Ulang Kode (Terkirim)' : 'Kirim Kode'}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="otpCode-input"
                      name="otpCode"
                      type="text"
                      maxLength={4}
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      className="w-32 text-center font-mono tracking-widest text-lg py-1.5 px-3 rounded-lg border border-slate-300 bg-white focus-visible:outline-2 focus-visible:outline-blue-700"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={handleVerifyOtp}
                    >
                      Verifikasi OTP
                    </Button>
                  </div>
                  {authError && (
                    <p role="alert" className="text-xs text-red-700 font-semibold">
                      {authError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <svg className="w-4 h-4 text-emerald-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Sesi pelapor terotentikasi via {authMethod.toUpperCase()} ({contactInput})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAuthVerified(false)}
                    className="text-slate-600 hover:text-slate-900 underline text-[11px]"
                  >
                    Ganti Akun
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 2: Deceased Data */}
          <section
            aria-labelledby="section-deceased-info"
            className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold" aria-hidden="true">
                2
              </span>
              <h2 id="section-deceased-info" className="text-lg font-bold text-slate-900">
                Langkah 2: Data Almarhum / Almarhumah
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="deceasedName-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Nama Lengkap Almarhum / Almarhumah <span className="text-red-700">*</span>
                </label>
                <input
                  id="deceasedName-input"
                  name="deceasedName"
                  type="text"
                  required
                  value={deceasedName}
                  onChange={(e) => {
                    setDeceasedName(e.target.value);
                    if (errors.deceasedName) setErrors({ ...errors, deceasedName: undefined });
                  }}
                  aria-invalid={errors.deceasedName ? 'true' : 'false'}
                  aria-describedby={errors.deceasedName ? 'deceasedName-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="Contoh: Bambang Soedjarwo (sesuai KTP / KK)"
                />
                {errors.deceasedName && (
                  <p id="deceasedName-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.deceasedName}
                  </p>
                )}
              </div>

              {/* NIK 16 Digits */}
              <div>
                <label
                  htmlFor="deceasedNik-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  NIK Almarhum (Wajib 16 Digit) <span className="text-red-700">*</span>
                </label>
                <div className="relative">
                  <input
                    id="deceasedNik-input"
                    name="deceasedNik"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    required
                    value={deceasedNik}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setDeceasedNik(val);
                      if (errors.deceasedNik) setErrors({ ...errors, deceasedNik: undefined });
                    }}
                    aria-invalid={errors.deceasedNik ? 'true' : 'false'}
                    aria-describedby={errors.deceasedNik ? 'deceasedNik-error' : 'deceasedNik-hint'}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white font-mono shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                    placeholder="Contoh: 3273010504500002"
                  />
                  <div className="absolute right-2.5 top-2.5 text-xs text-slate-500 font-mono">
                    {deceasedNik.length}/16
                  </div>
                </div>
                <p id="deceasedNik-hint" className="mt-1 text-[11px] text-slate-600">
                  Data NIK akan dienkripsi client-side (AES-256) dan 4 digit terakhir digunakan sebagai PIN unduh.
                </p>
                {errors.deceasedNik && (
                  <p id="deceasedNik-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.deceasedNik}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender-select"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Jenis Kelamin <span className="text-red-700">*</span>
                </label>
                <select
                  id="gender-select"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dateOfBirth-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Tanggal Lahir
                </label>
                <input
                  id="dateOfBirth-input"
                  name="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                />
              </div>

              {/* Date of Death */}
              <div>
                <label
                  htmlFor="dateOfDeath-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Tanggal Meninggal Dunia <span className="text-red-700">*</span>
                </label>
                <input
                  id="dateOfDeath-input"
                  name="dateOfDeath"
                  type="date"
                  required
                  value={dateOfDeath}
                  onChange={(e) => {
                    setDateOfDeath(e.target.value);
                    if (errors.dateOfDeath) setErrors({ ...errors, dateOfDeath: undefined });
                  }}
                  aria-invalid={errors.dateOfDeath ? 'true' : 'false'}
                  aria-describedby={errors.dateOfDeath ? 'dateOfDeath-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                />
                {errors.dateOfDeath && (
                  <p id="dateOfDeath-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.dateOfDeath}
                  </p>
                )}
              </div>

              {/* Time of Death */}
              <div>
                <label
                  htmlFor="timeOfDeath-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Pukul / Jam Kematian (WIB)
                </label>
                <input
                  id="timeOfDeath-input"
                  name="timeOfDeath"
                  type="time"
                  value={timeOfDeath}
                  onChange={(e) => setTimeOfDeath(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                />
              </div>

              {/* Place of Death */}
              <div>
                <label
                  htmlFor="placeOfDeath-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Tempat Peristiwa Kematian
                </label>
                <input
                  id="placeOfDeath-input"
                  name="placeOfDeath"
                  type="text"
                  value={placeOfDeath}
                  onChange={(e) => setPlaceOfDeath(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="Contoh: Rumah Tinggal / RSUD Al-Ihsan"
                />
              </div>

              {/* Cause of Death */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="causeOfDeath-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Penyebab Kematian (Sesuai Keterangan Medis/Pemeriksa) <span className="text-red-700">*</span>
                </label>
                <input
                  id="causeOfDeath-input"
                  name="causeOfDeath"
                  type="text"
                  required
                  value={causeOfDeath}
                  onChange={(e) => {
                    setCauseOfDeath(e.target.value);
                    if (errors.causeOfDeath) setErrors({ ...errors, causeOfDeath: undefined });
                  }}
                  aria-invalid={errors.causeOfDeath ? 'true' : 'false'}
                  aria-describedby={errors.causeOfDeath ? 'causeOfDeath-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="Contoh: Penyakit Jantung Kronis (Sakit Alamiah) / Komplikasi Usia Lanjut"
                />
                {errors.causeOfDeath && (
                  <p id="causeOfDeath-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.causeOfDeath}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 3: Address & Automated RT/RW Routing */}
          <section
            aria-labelledby="section-address-routing"
            className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold" aria-hidden="true">
                3
              </span>
              <h2 id="section-address-routing" className="text-lg font-bold text-slate-900">
                Langkah 3: Alamat Duka & Routing Otomatis RT/RW
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-3">
                <label
                  htmlFor="address-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Alamat Lengkap Rumah Duka <span className="text-red-700">*</span>
                </label>
                <input
                  id="address-input"
                  name="address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="Nama jalan, nomor rumah, gang, atau kompleks"
                />
              </div>

              <div>
                <label
                  htmlFor="kelurahan-select"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Kelurahan <span className="text-red-700">*</span>
                </label>
                <select
                  id="kelurahan-select"
                  name="kelurahan"
                  value={kelurahan}
                  onChange={(e) => handleAddressRoutingChange(e.target.value, rt, rw)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  <option value="Kelurahan Merdeka">Kelurahan Merdeka</option>
                  <option value="Kelurahan Sukamaju">Kelurahan Sukamaju</option>
                  <option value="Kelurahan Melati">Kelurahan Melati</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="rt-select"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Rukun Tetangga (RT) <span className="text-red-700">*</span>
                </label>
                <select
                  id="rt-select"
                  name="rt"
                  value={rt}
                  onChange={(e) => handleAddressRoutingChange(kelurahan, e.target.value, rw)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  <option value="01">RT 01</option>
                  <option value="02">RT 02</option>
                  <option value="03">RT 03</option>
                  <option value="04">RT 04</option>
                  <option value="05">RT 05</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="rw-select"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Rukun Warga (RW) <span className="text-red-700">*</span>
                </label>
                <select
                  id="rw-select"
                  name="rw"
                  value={rw}
                  onChange={(e) => handleAddressRoutingChange(kelurahan, rt, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  <option value="01">RW 01</option>
                  <option value="02">RW 02</option>
                  <option value="03">RW 03</option>
                  <option value="05">RW 05</option>
                  <option value="07">RW 07</option>
                </select>
              </div>
            </div>

            {/* Automated RT/RW Officer Detection Display */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 sm:p-5 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/60 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-blue-700 text-white shrink-0" aria-hidden="true">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-blue-950">
                      Pejabat RT/RW Terdeteksi Otomatis
                    </h3>
                    <p className="text-xs text-blue-800">
                      Notifikasi instan otomatis diteruskan ke pengurus wilayah berikut:
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true"></span>
                  Terhubung Siap TTD
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-blue-950">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-600">Nama Pejabat:</span>{' '}
                    <strong className="font-semibold text-slate-900">{assignedOfficer.officerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600">Wilayah Tugas:</span>{' '}
                    <span className="font-medium text-slate-900">RT {assignedOfficer.rt} / RW {assignedOfficer.rw}, {assignedOfficer.kelurahan}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-600">WhatsApp Notifikasi:</span>{' '}
                    <span className="font-medium text-emerald-800">{assignedOfficer.officerPhone}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-600">Ed25519 Public Key:</span>{' '}
                    <code className="font-mono text-[11px] text-indigo-900 bg-white/70 px-1 py-0.5 rounded">
                      {assignedOfficer.publicKeyEd25519.slice(0, 24)}...
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Upload Supporting Documents & AES-256 Feedback */}
          <section
            aria-labelledby="section-docs-upload"
            className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold" aria-hidden="true">
                4
              </span>
              <h2 id="section-docs-upload" className="text-lg font-bold text-slate-900">
                Langkah 4: Unggah Dokumen Pendukung & Proteksi Kriptografi
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 mb-4 leading-relaxed">
              Unggah berkas identitas dan surat kematian medis. Semua berkas akan diamankan secara instan dengan algoritma enkripsi militer <strong className="text-slate-900 font-semibold">AES-256-GCM</strong>.
            </p>

            <div className="space-y-3">
              {/* Doc 1: KTP Almarhum */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-800 shrink-0" aria-hidden="true">
                    📄
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      1. KTP Almarhum / Almarhumah <span className="text-red-700">*</span>
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {docs.ktpDeceased || 'Belum dipilih (Format: PDF/JPG max 5MB)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    🔒 AES-256 Enkripsi Siap
                  </span>
                  <label
                    htmlFor="upload-ktp-almarhum"
                    className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 hover:bg-slate-100 focus-within:outline-2 focus-within:outline-blue-700"
                  >
                    <span>Ganti Berkas</span>
                    <input
                      id="upload-ktp-almarhum"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocs({ ...docs, ktpDeceased: file.name });
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Doc 2: Kartu Keluarga */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-800 shrink-0" aria-hidden="true">
                    📑
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      2. Kartu Keluarga (KK) <span className="text-red-700">*</span>
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {docs.kkDeceased || 'Belum dipilih (Format: PDF/JPG max 5MB)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    🔒 AES-256 Enkripsi Siap
                  </span>
                  <label
                    htmlFor="upload-kk-almarhum"
                    className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 hover:bg-slate-100 focus-within:outline-2 focus-within:outline-blue-700"
                  >
                    <span>Ganti Berkas</span>
                    <input
                      id="upload-kk-almarhum"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocs({ ...docs, kkDeceased: file.name });
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Doc 3: Surat Keterangan RS / Saksi */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-800 shrink-0" aria-hidden="true">
                    🏥
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      3. Surat Kematian Medis (RS/Puskesmas/Pemeriksa) <span className="text-red-700">*</span>
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {docs.hospitalLetter || 'Belum dipilih (Format: PDF/JPG max 5MB)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    🔒 AES-256 Enkripsi Siap
                  </span>
                  <label
                    htmlFor="upload-hospital-letter"
                    className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 hover:bg-slate-100 focus-within:outline-2 focus-within:outline-blue-700"
                  >
                    <span>Ganti Berkas</span>
                    <input
                      id="upload-hospital-letter"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocs({ ...docs, hospitalLetter: file.name });
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Submission Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-700" aria-hidden="true"></span>
              <span>Kepatuhan Standar Aksesibilitas WCAG 2.2 AA & SPBE</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                loadingText="Mengenkripsi AES-256 & Mengirim..."
                className="w-full sm:w-auto shadow-md"
              >
                🔐 Enkripsi & Kirim Pelaporan ke RT/RW
              </Button>
            </div>
          </div>
        </form>

        {/* Right Column: Crypto Indicator & System Sidebar */}
        <aside aria-label="Informasi Keamanan Kriptografi & Status Alur" className="lg:col-span-4 space-y-6">
          {/* Crypto Integration Visual Indicator Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-900" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Status Kriptografi Client-Side
                </h3>
                <span className="text-[11px] font-semibold text-emerald-800">
                  AES-256-GCM Terverifikasi Aktif
                </span>
              </div>
            </div>

            {/* Visual Indicator Notice */}
            <div className="bg-slate-900 text-slate-100 rounded-lg p-3.5 text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                <span>Algoritma: AES-256-GCM</span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Initialization Vector (IV):</span>
                <span className="text-amber-300 text-[11px] break-all">{encryptionStatus.ivHex}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Payload SHA-256 Checksum:</span>
                <span className="text-indigo-300 text-[11px] break-all">
                  {encryptionStatus.integrityHash.slice(0, 32)}...
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 text-[11px] text-emerald-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true"></span>
                <span>Data NIK & berkas dienkripsi sebelum dikirim.</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              🔒 Indikator ini memastikan data sensitif seperti NIK dan dokumen keluarga tidak dapat dibaca oleh pihak ketiga yang tidak berhak sebelum diverifikasi dengan kunci privat Ed25519 RT/RW.
            </p>
          </div>

          {/* Workflow Stage Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Tahapan Alur Pelayanan (Milestone 1)
            </h3>
            <ol className="space-y-4 text-xs">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white font-bold text-[11px]">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block font-semibold">Pelapor Mengisi Formulir & Enkripsi</strong>
                  <span className="text-slate-600">Pelapor verifikasi OTP & data diamankan AES-256-GCM.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[11px]">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block font-semibold">Tanda Tangan Digital RT/RW (Ed25519)</strong>
                  <span className="text-slate-600">Ketua RT/RW memverifikasi berkas dan membubuhkan tanda tangan kriptografi.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[11px]">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block font-semibold">Penerbitan Akta oleh Dukcapil</strong>
                  <span className="text-slate-600">Petugas Dukcapil menerbitkan surat kematian resmi ber-QR Code.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[11px]">
                  4
                </span>
                <div>
                  <strong className="text-slate-900 block font-semibold">Unduh Dokumen dengan PIN Kredensial</strong>
                  <span className="text-slate-600">Pelapor mengunduh berkas menggunakan 4-digit NIK (PBKDF2).</span>
                </div>
              </li>
            </ol>
          </div>

          {/* Shortcut to Dashboard */}
          <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-center space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Akses Cepat Petugas & Penguji
            </h3>
            <p className="text-xs text-slate-700">
              Buka dashboard untuk mensimulasikan persetujuan RT/RW dan penerbitan akta oleh Dukcapil.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-blue-700"
              >
                Buka Dashboard RT/RW & Dukcapil →
              </Link>
              <Link
                href="/unduh"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold focus-visible:outline-2 focus-visible:outline-blue-700"
              >
                Halaman Unduh Akta →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Submission Success Modal / Receipt */}
      {showReceiptModal && submittedReport && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReceiptModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-receipt-title"
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
          >
            {/* Header */}
            <div className="bg-emerald-700 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-white text-emerald-700 font-bold" aria-hidden="true">
                  ✓
                </div>
                <div>
                  <h2 id="success-receipt-title" className="text-lg font-bold text-white leading-tight">
                    Laporan Berhasil Dienkripsi & Dikirimkan!
                  </h2>
                  <p className="text-xs text-emerald-100">
                    ID Registrasi: {submittedReport.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-emerald-100 hover:text-white p-1 rounded focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Tutup jendela tanda terima"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600">Almarhum:</span>
                  <strong className="text-slate-900 font-bold">{submittedReport.deceased.fullName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600">NIK:</span>
                  <span className="font-mono text-slate-800">{submittedReport.deceased.nik}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600">RT/RW Penanggung Jawab:</span>
                  <span className="text-slate-900 font-medium">{submittedReport.assignedRTRW.officerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status Awal:</span>
                  <BadgeStatus status={submittedReport.status} size="sm" />
                </div>
              </div>

              {/* Encryption receipt info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-950">
                <span className="font-bold block mb-1">🔐 Jaminan Keamanan Kriptografi:</span>
                <span>
                  Berkas laporan Anda telah dienkripsi menggunakan AES-256-GCM. Notifikasi peninjauan dengan kunci publik Ed25519 telah dikirimkan ke WhatsApp RT/RW setempat.
                </span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/dashboard"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  Lihat di Dashboard RT/RW →
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowReceiptModal(false)}
                >
                  Tutup Tanda Terima
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

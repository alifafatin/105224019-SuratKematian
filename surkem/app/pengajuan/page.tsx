'use client';

import React, { useState, useSyncExternalStore, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import BadgeStatus from '@/components/BadgeStatus';
import {
  findRTRWOfficer,
  getWargaSession,
  subscribeToUserSession,
} from '@/lib/mockData';
import { deathReportFormSchema } from '@/lib/schemas/death-report';
import { DeathReport, RTRWOfficer, AuthMethod } from '@/types';
import { saveDeathReport } from '@/lib/report-actions';

interface FormErrors {
  reporterName?: string;
  reporterNik?: string;
  reporterContact?: string;
  relation?: string;
  deceasedName?: string;
  deceasedNik?: string;
  timeOfDeath?: string;
  placeOfDeath?: string;
  dateOfDeath?: string;
  dateOfBirth?: string;
  causeOfDeath?: string;
  address?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  city?: string;
  documents?: string;
  consent?: string;
}

const formErrorInputIds: Record<keyof FormErrors, string> = {
  reporterName: 'reporterName-input',
  reporterNik: 'reporterNik-input',
  reporterContact: 'contactInput-input',
  relation: 'relation-select',
  deceasedName: 'deceasedName-input',
  deceasedNik: 'deceasedNik-input',
  timeOfDeath: 'timeOfDeath-input',
  placeOfDeath: 'placeOfDeath-input',
  dateOfDeath: 'dateOfDeath-input',
  dateOfBirth: 'dateOfBirth-input',
  causeOfDeath: 'causeOfDeath-input',
  address: 'address-input',
  rt: 'rt-select',
  rw: 'rw-select',
  kelurahan: 'kelurahan-select',
  kecamatan: 'kelurahan-select',
  city: 'kelurahan-select',
  documents: 'ktp-deceased-file',
  consent: 'privacy-consent-checkbox',
};

function ReporterPortalContent() {
  const searchParams = useSearchParams();
  const initialContact = searchParams.get('contact') || '';
  const initialAuth: AuthMethod =
    searchParams.get('auth') === 'email' ? 'email' : 'whatsapp';
  const wargaSession = useSyncExternalStore(
    subscribeToUserSession,
    getWargaSession,
    () => null
  );

  // Step 1: Authentication & Reporter Identity
  const authMethod = initialAuth;
  const [contactOverride, setContactOverride] = useState<string | null>(null);
  const [reporterNameOverride, setReporterNameOverride] = useState<string | null>(null);
  const contactInput = contactOverride ?? (initialContact || wargaSession?.phone || '');
  const reporterName = reporterNameOverride ?? wargaSession?.name ?? '';
  const [reporterNik, setReporterNik] = useState('');
  const [relation, setRelation] = useState('');

  // Step 2: Deceased Data
  const [deceasedName, setDeceasedName] = useState('');
  const [deceasedNik, setDeceasedNik] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [timeOfDeath, setTimeOfDeath] = useState('');
  const [placeOfDeath, setPlaceOfDeath] = useState('');
  const [causeOfDeath, setCauseOfDeath] = useState('');

  // Step 3: Address & RT/RW Routing State
  const [address, setAddress] = useState('');
  const [kelurahan, setKelurahan] = useState('Kelurahan Merdeka');
  const [rt, setRt] = useState('03');
  const [rw, setRw] = useState('05');
  const [assignedOfficer, setAssignedOfficer] = useState<RTRWOfficer>(() =>
    findRTRWOfficer('03', '05', 'Kelurahan Merdeka')
  );

  // Step 4: Document file names
  const [docs, setDocs] = useState<{
    ktpDeceased: string | null;
    kkDeceased: string | null;
    hospitalLetter: string | null;
  }>({
    ktpDeceased: null,
    kkDeceased: null,
    hospitalLetter: null,
  });

  const [consentAgreed, setConsentAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<DeathReport | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Dynamic RT/RW routing change
  const handleAddressRoutingChange = (newKel: string, newRt: string, newRw: string) => {
    setKelurahan(newKel);
    setRt(newRt);
    setRw(newRw);
    const officer = findRTRWOfficer(newRt, newRw, newKel);
    setAssignedOfficer(officer);
  };

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((currentErrors) =>
      currentErrors[field]
        ? { ...currentErrors, [field]: undefined }
        : currentErrors
    );
  };

  const validateForm = (): boolean => {
    const result = deathReportFormSchema.safeParse({
      reporterName,
      reporterNik,
      reporterContact: contactInput,
      authMethod,
      relation,
      deceasedName,
      deceasedNik,
      dateOfDeath,
      causeOfDeath,
      address,
      dateOfBirth,
      gender,
      timeOfDeath,
      placeOfDeath,
      rt,
      rw,
      kelurahan,
      kecamatan: assignedOfficer.kecamatan,
      city: assignedOfficer.city,
      documentNames: {
        ktpDeceasedName: docs.ktpDeceased || '',
        kkDeceasedName: docs.kkDeceased || '',
        hospitalLetterName: docs.hospitalLetter || '',
      },
      consent: consentAgreed,
    });

    if (!result.success) {
      const newErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] === 'documentNames' ? 'documents' : issue.path[0];
        if (
          typeof field === 'string' &&
          Object.prototype.hasOwnProperty.call(formErrorInputIds, field) &&
          !newErrors[field as keyof FormErrors]
        ) {
          newErrors[field as keyof FormErrors] = issue.message;
        }
      }

      setErrors(newErrors);
      const pathField = result.error.issues[0]?.path[0];
      const firstInvalidField = pathField === 'documentNames' ? 'documents' : pathField;
      if (
        typeof firstInvalidField === 'string' &&
        Object.prototype.hasOwnProperty.call(formErrorInputIds, firstInvalidField)
      ) {
        document
          .getElementById(formErrorInputIds[firstInvalidField as keyof FormErrors])
          ?.focus();
      }
      return false;
    }

    setErrors({});
    return true;
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const result = await saveDeathReport({
      reporterName,
      reporterNik,
      reporterContact: contactInput,
      authMethod,
      relation,
      deceasedName,
      deceasedNik,
      gender,
      dateOfBirth,
      dateOfDeath,
      timeOfDeath,
      placeOfDeath,
      causeOfDeath,
      address,
      rt: rt.padStart(2, '0'),
      rw: rw.padStart(2, '0'),
      kelurahan,
      kecamatan: assignedOfficer.kecamatan,
      city: assignedOfficer.city,
      assignedRTRW: assignedOfficer,
      documentNames: {
        ktpDeceasedName: docs.ktpDeceased || '',
        kkDeceasedName: docs.kkDeceased || '',
        hospitalLetterName: docs.hospitalLetter || '',
      },
      consent: true,
    });
    setIsSubmitting(false);
    if (!result.data) {
      if (result.fieldErrors) {
        const serverErrors: FormErrors = {};
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (Object.prototype.hasOwnProperty.call(formErrorInputIds, field)) {
            serverErrors[field as keyof FormErrors] = message;
          }
        }
        setErrors(serverErrors);
        const firstInvalidField = Object.keys(serverErrors)[0] as keyof FormErrors | undefined;
        if (firstInvalidField) {
          document.getElementById(formErrorInputIds[firstInvalidField])?.focus();
        }
      }
      setSubmitError(result.error || 'Pengajuan gagal disimpan.');
      return;
    }
    setSubmittedReport(result.data);
    setShowReceiptModal(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Breadcrumb */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href="/" className="hover:text-blue-700">Beranda</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Portal Pelapor Resmi</span>
          </nav>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
              Portal Pelapor Warga
            </span>
            <span className="text-xs text-slate-600">Sesi Terotentikasi ({contactInput})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Formulir Pelaporan Kematian Digital
          </h1>
          <p className="mt-1 text-sm text-slate-700 max-w-3xl leading-relaxed">
            Isi data pelapor dan peristiwa secara lengkap. Setelah dikirim, data formulir disimpan di database untuk ditinjau petugas.
          </p>
          <Link
            href="/profil-warga"
            className="mt-3 inline-flex text-sm font-semibold text-blue-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            Kelola profil warga
          </Link>
        </div>
      </div>

      {/* Grid: Form Left, Crypto & RT/RW Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Controlled Form */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-8 space-y-8">
          {/* Step 1: Reporter Info */}
          <section
            aria-labelledby="section-reporter-info"
            className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold" aria-hidden="true">
                  1
                </span>
                <h2 id="section-reporter-info" className="text-lg font-bold text-slate-900">
                  Langkah 1: Identitas Pelapor & Kontak Notifikasi
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" aria-hidden="true"></span>
                Terverifikasi
              </span>
            </div>

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
                  onChange={(e) => {
                    setReporterNameOverride(e.target.value);
                    clearFieldError('reporterName');
                  }}
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
                  onChange={(e) => {
                    setReporterNik(e.target.value.replace(/\D/g, ''));
                    clearFieldError('reporterNik');
                  }}
                  aria-invalid={errors.reporterNik ? 'true' : 'false'}
                  aria-describedby={errors.reporterNik ? 'reporterNik-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="16 digit angka NIK pelapor"
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
                  Kontak Notifikasi ({authMethod.toUpperCase()}) <span className="text-red-700">*</span>
                </label>
                <input
                  id="contactInput-input"
                  name="contactInput"
                  type={authMethod === 'whatsapp' ? 'tel' : 'email'}
                  required
                  value={contactInput}
                  onChange={(e) => {
                    setContactOverride(e.target.value);
                    clearFieldError('reporterContact');
                  }}
                  aria-invalid={errors.reporterContact ? 'true' : 'false'}
                  aria-describedby={errors.reporterContact ? 'reporterContact-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                />
                {errors.reporterContact && (
                  <p id="reporterContact-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.reporterContact}
                  </p>
                )}
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
                  onChange={(e) => {
                    setRelation(e.target.value);
                    clearFieldError('relation');
                  }}
                  aria-invalid={errors.relation ? 'true' : 'false'}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  <option value="">Pilih hubungan keluarga</option>
                  <option value="Anak Kandung">Anak Kandung</option>
                  <option value="Pasangan (Suami/Istri)">Pasangan (Suami/Istri)</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Saudara Kandung">Saudara Kandung</option>
                  <option value="Kerabat / Kuasa Keluarga">Kerabat / Kuasa Keluarga</option>
                </select>
                {errors.relation && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{errors.relation}</p>
                )}
              </div>
            </div>
          </section>

          {/* Step 2: Deceased Data */}
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
                    clearFieldError('deceasedName');
                  }}
                  aria-invalid={errors.deceasedName ? 'true' : 'false'}
                  aria-describedby={errors.deceasedName ? 'deceasedName-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="Contoh: Raden Mas Soewondo (sesuai KTP / KK)"
                />
                {errors.deceasedName && (
                  <p id="deceasedName-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.deceasedName}
                  </p>
                )}
              </div>

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
                      clearFieldError('deceasedNik');
                    }}
                    aria-invalid={errors.deceasedNik ? 'true' : 'false'}
                    aria-describedby={errors.deceasedNik ? 'deceasedNik-error' : 'deceasedNik-hint'}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white font-mono shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                    placeholder="Contoh: 3273011902450007"
                  />
                  <div className="absolute right-2.5 top-2.5 text-xs text-slate-500 font-mono">
                    {deceasedNik.length}/16
                  </div>
                </div>
                <p id="deceasedNik-hint" className="mt-1 text-[11px] text-slate-600">
                  NIK dicatat sebagai bagian dari data pengajuan. Enkripsi belum diterapkan pada tahap ini.
                </p>
                {errors.deceasedNik && (
                  <p id="deceasedNik-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.deceasedNik}
                  </p>
                )}
              </div>

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
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    clearFieldError('dateOfBirth');
                  }}
                  aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
                  aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                />
                {errors.dateOfBirth && (
                  <p id="dateOfBirth-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

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
                    clearFieldError('dateOfDeath');
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
                  required
                  value={timeOfDeath}
                  onChange={(e) => {
                    setTimeOfDeath(e.target.value);
                    clearFieldError('timeOfDeath');
                  }}
                  aria-invalid={errors.timeOfDeath ? 'true' : 'false'}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                />
                {errors.timeOfDeath && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{errors.timeOfDeath}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="placeOfDeath-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Tempat Kematian
                </label>
                <input
                  id="placeOfDeath-input"
                  name="placeOfDeath"
                  type="text"
                  required
                  value={placeOfDeath}
                  onChange={(e) => {
                    setPlaceOfDeath(e.target.value);
                    clearFieldError('placeOfDeath');
                  }}
                  aria-invalid={errors.placeOfDeath ? 'true' : 'false'}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="Contoh: RS Hasan Sadikin / Rumah Tinggal"
                />
                {errors.placeOfDeath && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{errors.placeOfDeath}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="causeOfDeath-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Penyebab Kematian (Keterangan Medis) <span className="text-red-700">*</span>
                </label>
                <input
                  id="causeOfDeath-input"
                  name="causeOfDeath"
                  type="text"
                  required
                  value={causeOfDeath}
                  onChange={(e) => {
                    setCauseOfDeath(e.target.value);
                    clearFieldError('causeOfDeath');
                  }}
                  aria-invalid={errors.causeOfDeath ? 'true' : 'false'}
                  aria-describedby={errors.causeOfDeath ? 'causeOfDeath-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="Contoh: Komplikasi Penyakit Dalam & Usia Lanjut"
                />
                {errors.causeOfDeath && (
                  <p id="causeOfDeath-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.causeOfDeath}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Step 3: Address & RT/RW Routing */}
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
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearFieldError('address');
                  }}
                  aria-invalid={errors.address ? 'true' : 'false'}
                  aria-describedby={errors.address ? 'address-error' : undefined}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-700"
                  placeholder="Nama jalan, nomor rumah, gang, atau kompleks"
                />
                {errors.address && (
                  <p id="address-error" role="alert" className="mt-1 text-xs font-semibold text-red-700">
                    {errors.address}
                  </p>
                )}
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
                  onChange={(e) => {
                    handleAddressRoutingChange(e.target.value, rt, rw);
                    clearFieldError('kelurahan');
                  }}
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
                  RT <span className="text-red-700">*</span>
                </label>
                <select
                  id="rt-select"
                  name="rt"
                  value={rt}
                  onChange={(e) => {
                    handleAddressRoutingChange(kelurahan, e.target.value, rw);
                    clearFieldError('rt');
                  }}
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
                  RW <span className="text-red-700">*</span>
                </label>
                <select
                  id="rw-select"
                  name="rw"
                  value={rw}
                  onChange={(e) => {
                    handleAddressRoutingChange(kelurahan, rt, e.target.value);
                    clearFieldError('rw');
                  }}
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

            {/* Assigned RT/RW Card */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2 mb-2">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <span>📍 Pejabat RT/RW Terdeteksi Otomatis</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                  Terhubung Siap TTD
                </span>
              </div>
              <div className="text-xs text-blue-950 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-600">Pejabat:</span> <strong>{assignedOfficer.officerName}</strong>
                </div>
                <div>
                  <span className="text-slate-600">WhatsApp:</span> <strong className="text-emerald-900">{assignedOfficer.officerPhone}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4: Documents & AI Verification */}
          <section
            aria-labelledby="section-docs-upload"
            className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold" aria-hidden="true">
                4
              </span>
              <h2 id="section-docs-upload" className="text-lg font-bold text-slate-900">
                Langkah 4: Pilih Dokumen Pendukung
              </h2>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-amber-900">
              Untuk tahap ini, database hanya menyimpan nama file yang dipilih. Isi file belum diunggah atau disimpan.
            </p>

            <div className="space-y-3">
              {/* Doc 1 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📄</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">KTP Almarhum <span className="text-red-700">*</span></span>
                    <span className="text-[11px] text-slate-600">{docs.ktpDeceased}</span>
                  </div>
                </div>
                <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 hover:bg-slate-100">
                  <span>Ganti</span>
                  <input
                    id="ktp-deceased-file"
                    type="file"
                    required={!docs.ktpDeceased}
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setDocs({ ...docs, ktpDeceased: e.target.files[0].name });
                        clearFieldError('documents');
                      }
                    }}
                  />
                </label>
              </div>

              {/* Doc 2 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📑</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Kartu Keluarga (KK) <span className="text-red-700">*</span></span>
                    <span className="text-[11px] text-slate-600">{docs.kkDeceased}</span>
                  </div>
                </div>
                <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 hover:bg-slate-100">
                  <span>Ganti</span>
                  <input
                    type="file"
                    required={!docs.kkDeceased}
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setDocs({ ...docs, kkDeceased: e.target.files[0].name });
                        clearFieldError('documents');
                      }
                    }}
                  />
                </label>
              </div>

              {/* Doc 3 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🏥</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Surat Kematian Medis (RS/Puskesmas) <span className="text-red-700">*</span></span>
                    <span className="text-[11px] text-slate-600">{docs.hospitalLetter}</span>
                  </div>
                </div>
                <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 hover:bg-slate-100">
                  <span>Ganti</span>
                  <input
                    type="file"
                    required={!docs.hospitalLetter}
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setDocs({ ...docs, hospitalLetter: e.target.files[0].name });
                        clearFieldError('documents');
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {errors.documents && (
              <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{errors.documents}</p>
            )}

          </section>

          {/* Step 5: Deklarasi Persetujuan & Privasi Data Pemohon (ACM 1.6 & Indonesia UU PDP No. 27/2022) */}
          <section
            aria-labelledby="section-privacy-consent"
            className="bg-white rounded-xl border-2 border-blue-200 p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold" aria-hidden="true">
                  5
                </span>
                <h2 id="section-privacy-consent" className="text-lg font-bold text-slate-900">
                  Deklarasi Persetujuan &amp; Privasi Data Pemohon
                </h2>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-300 w-fit">
                ACM 1.6 &amp; UU PDP 27/2022
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 font-semibold">
                <span>🗄️</span>
                <span>Disimpan ke database</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold">
                <span>📄</span>
                <span>Isi berkas belum disimpan</span>
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Data yang Anda masukkan digunakan untuk memproses pengajuan surat kematian. Pengamanan lanjutan dan penyimpanan file asli akan dikerjakan pada tahap berikutnya.
            </p>

            {/* Mandatory Checkbox */}
            <div className="pt-2">
              <label
                htmlFor="privacy-consent-checkbox"
                className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                  errors.consent
                    ? 'bg-red-50/70 border-red-300'
                    : consentAgreed
                    ? 'bg-blue-50/50 border-blue-300'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100/70'
                }`}
              >
                <input
                  id="privacy-consent-checkbox"
                  name="privacyConsent"
                  type="checkbox"
                  required
                  checked={consentAgreed}
                  onChange={(e) => {
                    setConsentAgreed(e.target.checked);
                    clearFieldError('consent');
                  }}
                  aria-invalid={errors.consent ? 'true' : 'false'}
                  aria-describedby={errors.consent ? 'consent-error-msg' : undefined}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 focus-visible:outline-2 focus-visible:outline-blue-700"
                />
                <div className="text-xs sm:text-sm text-slate-800 leading-snug">
                  <span className="font-semibold text-slate-900">
                    Saya menyetujui data formulir disimpan untuk proses pengajuan surat kematian. <span className="text-red-700">*</span>
                  </span>
                  <span className="block text-[11px] text-slate-600 mt-1">
                    Nama file dokumen ikut dicatat; isi file belum disimpan pada tahap ini.
                  </span>
                </div>
              </label>

              {errors.consent && (
                <p id="consent-error-msg" role="alert" className="mt-2 text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {errors.consent}
                </p>
              )}
            </div>
          </section>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-600">
              Data akan dikirim dan disimpan ke database setelah Anda mengirim formulir.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              loadingText="Menyimpan pengajuan..."
              className="w-full sm:w-auto shadow-md"
            >
              Kirim Pengajuan ke RT/RW
            </Button>
          </div>
          {submitError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {submitError}
            </p>
          )}
        </form>

        <aside aria-label="Informasi penyimpanan pengajuan" className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Penyimpanan Data
            </h3>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Data formulir disimpan di database setelah pengajuan berhasil. Berkas asli belum disimpan; hanya nama file yang dicatat.
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-950">
              Nomor registrasi dibuat otomatis dan status awal pengajuan tersimpan sebagai antrean RT/RW.
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-center space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Lacak Dokumen Anda
            </h3>
            <p className="text-xs text-slate-600">
              Sudah memiliki Nomor Registrasi? Periksa penerbitan akta di halaman pencarian resmi.
            </p>
            <Link
              href="/unduh"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs"
            >
              🔍 Lacak & Unduh Akta →
            </Link>
          </div>
        </aside>
      </div>

      {/* Success Receipt Modal */}
      {showReceiptModal && submittedReport && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-title"
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-emerald-700 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-full bg-white text-emerald-700 font-bold">✓</span>
                <div>
                  <h2 id="receipt-title" className="text-base font-bold text-white leading-tight">
                    Pengajuan Berhasil Disimpan
                  </h2>
                  <p className="text-xs text-emerald-100">ID: {submittedReport.id}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-600">Almarhum:</span>
                  <strong className="text-slate-900">{submittedReport.deceased.fullName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-600">NIK:</span>
                  <span className="font-mono text-slate-800">{submittedReport.deceased.nik}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-600">RT/RW Tujuan:</span>
                  <span className="text-slate-900 font-medium">{submittedReport.assignedRTRW.officerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <BadgeStatus status={submittedReport.status} size="sm" />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/unduh"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-xs"
                >
                  Buka Katalog Surat →
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

export default function ReporterPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-600">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-700 border-t-transparent rounded-full mb-3" />
          <p className="text-sm font-semibold">Memuat Portal Pelapor...</p>
        </div>
      }
    >
      <ReporterPortalContent />
    </Suspense>
  );
}

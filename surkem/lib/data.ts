import 'server-only';

import type { DeathReport, SuratKematianItem } from '@/types';
import {
  deathReportResponseSchema,
  deathReportsResponseSchema,
} from '@/lib/schemas/death-report-api';

function getReportsUrl() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) throw new Error('BACKEND_API_URL belum dikonfigurasi.');
  return `${backendUrl.replace(/\/$/, '')}/api/reports`;
}

async function fetchReports(): Promise<DeathReport[]> {
  const response = await fetch(getReportsUrl(), {
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Backend daftar pengajuan merespons dengan status ${response.status}.`);
  }

  const result = deathReportsResponseSchema.safeParse(await response.json());
  if (!result.success) throw new Error('Format respons daftar pengajuan tidak valid.');
  return result.data.reports;
}

export async function getAllDashboardReports(): Promise<DeathReport[]> {
  return fetchReports();
}

export async function getAllReports(): Promise<DeathReport[]> {
  return fetchReports();
}

export async function getReportById(id: string): Promise<DeathReport | null> {
  if (!id) return null;

  const response = await fetch(`${getReportsUrl()}/${encodeURIComponent(id)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Backend detail pengajuan merespons dengan status ${response.status}.`);
  }

  const result = deathReportResponseSchema.safeParse(await response.json());
  if (!result.success) throw new Error('Format respons detail pengajuan tidak valid.');
  return result.data.report;
}

export async function getReportByRegistrationId(
  registrationNumber: string
): Promise<DeathReport | null> {
  return getReportById(registrationNumber);
}

export async function getDaftarSurat(): Promise<SuratKematianItem[]> {
  const reports = await fetchReports();
  return reports
    .map((report) => ({
      noRegis: report.id,
      namaAlmarhum: report.deceased.fullName,
      nikAlmarhum: report.deceased.nik,
      jenisKelamin: report.deceased.gender,
      tanggalWafat: report.deceased.dateOfDeath,
      waktuWafat: report.deceased.timeOfDeath,
      tempatWafat: report.deceased.placeOfDeath,
      penyebabWafat: report.deceased.causeOfDeath,
      alamatDuka: report.deceased.address,
      rt: report.deceased.rt,
      rw: report.deceased.rw,
      kelurahan: report.deceased.kelurahan,
      kecamatan: report.deceased.kecamatan,
      kota: report.deceased.city,
      namaPelapor: report.reporter.name,
      hubunganPelapor: report.reporter.relation,
      statusVerifikasi: report.status,
      hashSHA256: 'Belum dibuat pada tahap database',
      tandaTanganEd25519: {
        namaPenandatangan: report.rtRwSignature?.signerName || '',
        jabatan: report.rtRwSignature?.signerRole || '',
        publicKey: report.rtRwSignature?.publicKey || '',
        signatureHex: report.rtRwSignature?.signatureHex || '',
        waktuTtd: report.rtRwSignature?.timestamp || '',
        status: report.rtRwSignature?.verified ? 'TERVERIFIKASI' : 'MENUNGGU',
      },
      penerbitanDukcapil: report.dukcapilIssuance
        ? {
            nomorAkta: report.dukcapilIssuance.certificateNumber,
            namaPejabat: report.dukcapilIssuance.officerName,
            nipPejabat: report.dukcapilIssuance.officerNip,
            tanggalTerbit: report.dukcapilIssuance.issuedAt,
            urlValidasiQR: report.dukcapilIssuance.qrValidationUrl,
          }
        : undefined,
    }));
}

export async function findSuratByNoRegis(
  registrationNumber: string
): Promise<SuratKematianItem | null> {
  const records = await getDaftarSurat();
  return (
    records.find(
      (record) => record.noRegis.toUpperCase() === registrationNumber.trim().toUpperCase()
    ) || null
  );
}

export async function findSuratById(id: string): Promise<SuratKematianItem | null> {
  return findSuratByNoRegis(id);
}

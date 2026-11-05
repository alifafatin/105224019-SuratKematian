'use server';

import { z } from 'zod';
import type { CertificateStatus, DeathReport } from '@/types';
import {
  createDeathReportSchema,
  deathReportResponseSchema,
  deathReportsResponseSchema,
  type CreateDeathReportInput,
} from '@/lib/schemas/death-report-api';

const updateSchema = z.object({
  status: z.enum([
    'DRAFT_ENCRYPTED',
    'AWAITING_RTRW_APPROVAL',
    'ED25519_SIGNED',
    'PROCESSING_DUKCAPIL',
    'CERTIFICATE_ISSUED',
  ]),
  rtRwSignature: z
    .object({
      algorithm: z.literal('Ed25519'),
      signerName: z.string(),
      signerRole: z.enum(['Ketua RT', 'Ketua RW', 'Petugas Dukcapil']),
      signatureHex: z.string(),
      publicKey: z.string(),
      timestamp: z.string(),
      verified: z.boolean(),
    })
    .optional(),
  dukcapilIssuance: z
    .object({
      issuedAt: z.string(),
      officerName: z.string(),
      officerNip: z.string(),
      certificateNumber: z.string(),
      qrValidationUrl: z.string(),
      pbkdf2Salt: z.string(),
      pbkdf2Iterations: z.number(),
    })
    .optional(),
  notes: z.string().max(1000).optional(),
});

type ActionResult<T> = {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function getReportsUrl() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) throw new Error('BACKEND_API_URL belum dikonfigurasi.');
  return `${backendUrl.replace(/\/$/, '')}/api/reports`;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    console.error('Respons backend pengajuan bukan JSON yang valid:', error);
    throw new Error('Respons backend tidak valid.');
  }
}

export async function saveDeathReport(
  input: CreateDeathReportInput
): Promise<ActionResult<DeathReport>> {
  const parsedInput = createDeathReportSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      error: 'Periksa kembali data pada field yang ditandai.',
      fieldErrors: Object.fromEntries(
        parsedInput.error.issues.map((issue) => [
          issue.path[0] === 'documentNames'
            ? 'documents'
            : String(issue.path[0] || 'form'),
          issue.message,
        ])
      ),
    };
  }

  try {
    const response = await fetch(getReportsUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedInput.data),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 400) {
      const payload = await readJson(response);
      const validation = z
        .object({
          error: z.string().optional(),
          fieldErrors: z.record(z.string(), z.string()).optional(),
        })
        .safeParse(payload);
      return {
        error: validation.success
          ? validation.data.error || 'Periksa kembali data pada field yang ditandai.'
          : 'Data pengajuan tidak valid atau belum lengkap.',
        fieldErrors: validation.success ? validation.data.fieldErrors : undefined,
      };
    }
    if (!response.ok) {
      console.error(`Backend pengajuan merespons dengan status ${response.status}.`);
      return { error: 'Pengajuan gagal disimpan. Coba lagi nanti.' };
    }

    const result = deathReportResponseSchema.safeParse(await readJson(response));
    if (!result.success) {
      console.error('Respons backend pengajuan tidak sesuai format.');
      return { error: 'Respons layanan penyimpanan tidak valid.' };
    }
    return { data: result.data.report };
  } catch (error) {
    console.error('Layanan database pengajuan tidak dapat dijangkau:', error);
    return {
      error:
        error instanceof Error && error.message === 'BACKEND_API_URL belum dikonfigurasi.'
          ? 'Layanan penyimpanan belum dikonfigurasi.'
          : 'Layanan database sedang tidak tersedia. Coba lagi nanti.',
    };
  }
}

export async function loadDeathReports(): Promise<ActionResult<DeathReport[]>> {
  try {
    const response = await fetch(getReportsUrl(), {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(`Backend daftar pengajuan merespons dengan status ${response.status}.`);
      return { error: 'Daftar pengajuan gagal dimuat.' };
    }
    const result = deathReportsResponseSchema.safeParse(await readJson(response));
    if (!result.success) {
      console.error('Respons daftar pengajuan tidak sesuai format.');
      return { error: 'Respons daftar pengajuan tidak valid.' };
    }
    return { data: result.data.reports };
  } catch (error) {
    console.error('Layanan daftar pengajuan tidak dapat dijangkau:', error);
    return { error: 'Database sedang tidak dapat dihubungi.' };
  }
}

export async function updateDeathReport(
  id: string,
  input: {
    status: CertificateStatus;
    rtRwSignature?: DeathReport['rtRwSignature'];
    dukcapilIssuance?: DeathReport['dukcapilIssuance'];
    notes?: string;
  }
): Promise<ActionResult<DeathReport>> {
  const parsedInput = updateSchema.safeParse(input);
  if (!parsedInput.success) return { error: 'Perubahan data pengajuan tidak valid.' };

  try {
    const response = await fetch(`${getReportsUrl()}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedInput.data),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) return { error: 'Pengajuan tidak ditemukan di database.' };
    if (!response.ok) {
      console.error(`Backend pembaruan pengajuan merespons dengan status ${response.status}.`);
      return { error: 'Perubahan status gagal disimpan.' };
    }
    const result = deathReportResponseSchema.safeParse(await readJson(response));
    if (!result.success) {
      console.error('Respons pembaruan pengajuan tidak sesuai format.');
      return { error: 'Respons layanan penyimpanan tidak valid.' };
    }
    return { data: result.data.report };
  } catch (error) {
    console.error('Layanan pembaruan pengajuan tidak dapat dijangkau:', error);
    return { error: 'Database sedang tidak dapat dihubungi.' };
  }
}

export async function deleteDeathReport(id: string): Promise<ActionResult<true>> {
  const parsedId = z.string().trim().min(1).max(100).safeParse(id);
  if (!parsedId.success) return { error: 'Nomor registrasi tidak valid.' };

  try {
    const response = await fetch(
      `${getReportsUrl()}/${encodeURIComponent(parsedId.data)}`,
      {
        method: 'DELETE',
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (response.status === 404) return { error: 'Pengajuan tidak ditemukan di database.' };
    if (!response.ok) {
      console.error(`Backend penghapusan pengajuan merespons dengan status ${response.status}.`);
      return { error: 'Pengajuan gagal dihapus.' };
    }
    return { data: true };
  } catch (error) {
    console.error('Layanan penghapusan pengajuan tidak dapat dijangkau:', error);
    return { error: 'Database sedang tidak dapat dihubungi.' };
  }
}

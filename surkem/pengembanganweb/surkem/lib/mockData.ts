import { DeathReport, RTRWOfficer, CertificateStatus } from '@/types';

export const RT_RW_OFFICERS: RTRWOfficer[] = [
  {
    rt: '03',
    rw: '05',
    kelurahan: 'Kelurahan Merdeka',
    kecamatan: 'Kecamatan Sumur Bandung',
    city: 'Kota Bandung',
    officerName: 'Agus Hendrawan, S.E. (Ketua RT 03)',
    officerPhone: '+62 812-3456-7890',
    officerEmail: 'rt03.rw05.merdeka@bandung.go.id',
    publicKeyEd25519: 'ed25519:e4d9c79f83a216e90145bc88ef01d84f90ab3e2154d89fa3bce4918e98341a01',
  },
  {
    rt: '01',
    rw: '02',
    kelurahan: 'Kelurahan Sukamaju',
    kecamatan: 'Kecamatan Cibeunying Kidul',
    city: 'Kota Bandung',
    officerName: 'Drs. H. Mulyadi (Ketua RW 02)',
    officerPhone: '+62 813-9876-5432',
    officerEmail: 'rw02.sukamaju@bandung.go.id',
    publicKeyEd25519: 'ed25519:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
  },
  {
    rt: '04',
    rw: '07',
    kelurahan: 'Kelurahan Melati',
    kecamatan: 'Kecamatan Coblong',
    city: 'Kota Bandung',
    officerName: 'Ir. Bambang Priyono (Ketua RT 04)',
    officerPhone: '+62 857-1122-3344',
    officerEmail: 'rt04.rw07.melati@bandung.go.id',
    publicKeyEd25519: 'ed25519:1029384756afbecd0192837465fabedc9081726354abcedf1234567890abcdef',
  },
  {
    rt: '02',
    rw: '03',
    kelurahan: 'Kelurahan Merdeka',
    kecamatan: 'Kecamatan Sumur Bandung',
    city: 'Kota Bandung',
    officerName: 'Suryanto Wibowo (Ketua RT 02)',
    officerPhone: '+62 821-4455-6677',
    officerEmail: 'rt02.rw03.merdeka@bandung.go.id',
    publicKeyEd25519: 'ed25519:9f8e7d6c5b4a3928170e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
  },
];

export const DEFAULT_OFFICER: RTRWOfficer = {
  rt: '01',
  rw: '01',
  kelurahan: 'Kelurahan Merdeka',
  kecamatan: 'Kecamatan Sumur Bandung',
  city: 'Kota Bandung',
  officerName: 'Supriyadi, S.Sos (Satgas Pelayanan RT/RW)',
  officerPhone: '+62 811-2233-4455',
  officerEmail: 'pelayanan.rtrw@bandung.go.id',
  publicKeyEd25519: 'ed25519:a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
};

export function findRTRWOfficer(kelurahan: string, rt: string, rw: string): RTRWOfficer {
  const normRt = rt.padStart(2, '0');
  const normRw = rw.padStart(2, '0');

  const match = RT_RW_OFFICERS.find(
    (o) =>
      o.kelurahan.toLowerCase() === kelurahan.toLowerCase() &&
      o.rt === normRt &&
      o.rw === normRw
  );

  if (match) return match;

  return {
    rt: normRt || '01',
    rw: normRw || '01',
    kelurahan: kelurahan || 'Kelurahan Merdeka',
    kecamatan: 'Kecamatan Setempat',
    city: 'Kota Bandung',
    officerName: `Petugas Pelayanan RT ${normRt || '01'} / RW ${normRw || '01'}`,
    officerPhone: '+62 811-2000-8899',
    officerEmail: `rtrw.${normRt || '01'}.${normRw || '01'}@bandung.go.id`,
    publicKeyEd25519: `ed25519:${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}11223344`,
  };
}

export const mockReports: DeathReport[] = [
  {
    id: 'SK-2026-00129',
    reporter: {
      name: 'Rian Pratama',
      nik: '3273012508920003',
      email: 'rian.pratama@gmail.com',
      phone: '081223344556',
      relation: 'Anak Kandung',
      authMethod: 'whatsapp',
      isVerified: true,
      verifiedAt: '2026-10-10 09:15 WIB',
    },
    deceased: {
      fullName: 'Bambang Soedjarwo',
      nik: '3273010504500002',
      gender: 'Laki-laki',
      dateOfBirth: '1950-04-05',
      dateOfDeath: '2026-10-09',
      timeOfDeath: '21:30',
      causeOfDeath: 'Penyakit Jantung Kronis (Sakit Alamiah)',
      placeOfDeath: 'RSUD Al-Ihsan Bandung',
      address: 'Jl. Merdeka No. 42, RT 03 / RW 05',
      rt: '03',
      rw: '05',
      kelurahan: 'Kelurahan Merdeka',
      kecamatan: 'Kecamatan Sumur Bandung',
      city: 'Kota Bandung',
    },
    status: 'AWAITING_RTRW_APPROVAL',
    assignedRTRW: RT_RW_OFFICERS[0],
    submittedAt: '2026-10-10 09:30 WIB',
    documents: {
      ktpDeceasedName: 'ktp_bambang_soedjarwo.pdf',
      kkDeceasedName: 'kartu_keluarga_327301.pdf',
      hospitalLetterName: 'surat_kematian_rsud_alihsan_0891.pdf',
      ktpReporterName: 'ktp_rian_pratama.pdf',
      encryptionAlgorithm: 'AES-256-GCM',
      payloadHashAes256Gcm: '9c5a1bf249826a8d7e0129bcfe841280a498dcfa3847291048bce9204821a7df',
      ivHex: '4a9b8c7d6e5f0123456789ab',
      encryptionTimestamp: '2026-10-10T09:28:44Z',
    },
    notes: 'Menunggu peninjauan fisik dan verifikasi berkas oleh Ketua RT 03.',
  },
  {
    id: 'SK-2026-00342',
    reporter: {
      name: 'Dewi Lestari',
      nik: '3273055410940001',
      email: 'dewi.lestari@outlook.com',
      phone: '081399887766',
      relation: 'Pasangan (Istri)',
      authMethod: 'email',
      isVerified: true,
      verifiedAt: '2026-10-08 14:02 WIB',
    },
    deceased: {
      fullName: 'Siti Rahmawati',
      nik: '3273056208650004',
      gender: 'Perempuan',
      dateOfBirth: '1965-08-22',
      dateOfDeath: '2026-10-07',
      timeOfDeath: '04:15',
      causeOfDeath: 'Komplikasi Paru dan Usia Lanjut',
      placeOfDeath: 'Rumah Kediaman Pribadi',
      address: 'Gg. Saluyu IV No. 12, RT 01 / RW 02',
      rt: '01',
      rw: '02',
      kelurahan: 'Kelurahan Sukamaju',
      kecamatan: 'Kecamatan Cibeunying Kidul',
      city: 'Kota Bandung',
    },
    status: 'ED25519_SIGNED',
    assignedRTRW: RT_RW_OFFICERS[1],
    submittedAt: '2026-10-08 14:20 WIB',
    documents: {
      ktpDeceasedName: 'ktp_siti_rahmawati.pdf',
      kkDeceasedName: 'kk_dewi_keluarga.pdf',
      hospitalLetterName: 'surat_pernyataan_saksi_kematian.pdf',
      ktpReporterName: 'ktp_dewi_lestari.pdf',
      encryptionAlgorithm: 'AES-256-GCM',
      payloadHashAes256Gcm: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      ivHex: '9182736450abcdef01928374',
      encryptionTimestamp: '2026-10-08T14:18:10Z',
    },
    rtRwSignature: {
      algorithm: 'Ed25519',
      signerName: 'Drs. H. Mulyadi (Ketua RW 02)',
      signerRole: 'Ketua RW',
      signatureHex: '3045022100d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e202206f5e4d3c2b1a0f9e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a3928170',
      publicKey: 'ed25519:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
      timestamp: '2026-10-09 10:11 WIB',
      verified: true,
    },
    notes: 'Draft telah ditandatangani RT/RW secara digital. Sedang dalam antrean verifikasi akhir Dinas Dukcapil.',
  },
  {
    id: 'SK-2026-00841',
    reporter: {
      name: 'Fajar Nugraha',
      nik: '3273011203880005',
      email: 'fajar.nugraha@gmail.com',
      phone: '085712349876',
      relation: 'Anak Kandung',
      authMethod: 'whatsapp',
      isVerified: true,
      verifiedAt: '2026-10-05 08:30 WIB',
    },
    deceased: {
      fullName: 'Haji Achmad Subagja',
      nik: '3273011405520001',
      gender: 'Laki-laki',
      dateOfBirth: '1952-05-14',
      dateOfDeath: '2026-10-04',
      timeOfDeath: '18:45',
      causeOfDeath: 'Henti Jantung Akut (Cardiac Arrest)',
      placeOfDeath: 'RS Santo Borromeus',
      address: 'Komplek Melati Asri B-9, RT 04 / RW 07',
      rt: '04',
      rw: '07',
      kelurahan: 'Kelurahan Melati',
      kecamatan: 'Kecamatan Coblong',
      city: 'Kota Bandung',
    },
    status: 'CERTIFICATE_ISSUED',
    assignedRTRW: RT_RW_OFFICERS[2],
    submittedAt: '2026-10-05 08:45 WIB',
    documents: {
      ktpDeceasedName: 'ktp_achmad_subagja.pdf',
      kkDeceasedName: 'kk_achmad_subagja.pdf',
      hospitalLetterName: 'surat_kematian_rs_borromeus_2026.pdf',
      ktpReporterName: 'ktp_fajar_nugraha.pdf',
      encryptionAlgorithm: 'AES-256-GCM',
      payloadHashAes256Gcm: '11223344556677889900aabbccddeeff00112233445566778899aabbccddeeff',
      ivHex: 'aabbccddeeff001122334455',
      encryptionTimestamp: '2026-10-05T08:42:19Z',
    },
    rtRwSignature: {
      algorithm: 'Ed25519',
      signerName: 'Ir. Bambang Priyono (Ketua RT 04)',
      signerRole: 'Ketua RT',
      signatureHex: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      publicKey: 'ed25519:1029384756afbecd0192837465fabedc9081726354abcedf1234567890abcdef',
      timestamp: '2026-10-05 13:20 WIB',
      verified: true,
    },
    dukcapilIssuance: {
      issuedAt: '2026-10-06 11:00 WIB',
      officerName: 'H. Dedi Hermawan, M.Si',
      officerNip: '19740512 199903 1 002',
      certificateNumber: '3273-KM-06102026-0084',
      qrValidationUrl: 'https://dukcapil.bandung.go.id/validasi/surkem/3273-KM-06102026-0084',
      pbkdf2Salt: '7f9a8b1c2d3e4f5a6b7c8d9e',
      pbkdf2Iterations: 100000,
    },
    notes: 'surat kematian resmi telah diterbitkan oleh Dinas Dukcapil Kota Bandung.',
  },
  {
    id: 'SK-2026-00915',
    reporter: {
      name: 'Siti Aminah',
      nik: '3273014102990008',
      email: 'siti.aminah@gmail.com',
      phone: '082198765432',
      relation: 'Kerabat Dekat',
      authMethod: 'whatsapp',
      isVerified: true,
      verifiedAt: '2026-10-11 16:10 WIB',
    },
    deceased: {
      fullName: 'Kartini Wulandari',
      nik: '3273015509480006',
      gender: 'Perempuan',
      dateOfBirth: '1948-09-15',
      dateOfDeath: '2026-10-11',
      timeOfDeath: '13:00',
      causeOfDeath: 'Usia Lanjut (Meninggal di Rumah)',
      placeOfDeath: 'Rumah Kediaman',
      address: 'Jl. Merdeka Barat No. 8, RT 02 / RW 03',
      rt: '02',
      rw: '03',
      kelurahan: 'Kelurahan Merdeka',
      kecamatan: 'Kecamatan Sumur Bandung',
      city: 'Kota Bandung',
    },
    status: 'DRAFT_ENCRYPTED',
    assignedRTRW: RT_RW_OFFICERS[3],
    submittedAt: '2026-10-11 16:30 WIB',
    documents: {
      ktpDeceasedName: 'ktp_kartini_wulandari.pdf',
      kkDeceasedName: 'kk_keluarga_kartini.pdf',
      hospitalLetterName: 'surat_keterangan_pemeriksaan_puskesmas.pdf',
      ktpReporterName: 'ktp_siti_aminah.pdf',
      encryptionAlgorithm: 'AES-256-GCM',
      payloadHashAes256Gcm: 'fedcba98765432100123456789abcdefa1b2c3d4e5f60718293a4b5c6d7e8f90',
      ivHex: '1029384756abcdef12345678',
      encryptionTimestamp: '2026-10-11T16:28:02Z',
    },
    notes: 'Draft terenkripsi dengan AES-256-GCM. Siap dikirimkan ke RT/RW setempat.',
  },
];

const STORAGE_KEY = 'websurkem_reports_v1';

export function getStoredReports(): DeathReport[] {
  if (typeof window === 'undefined') {
    return mockReports;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReports));
      return mockReports;
    }
    return JSON.parse(raw);
  } catch {
    return mockReports;
  }
}

export function saveStoredReports(reports: DeathReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports to localStorage:', err);
  }
}

export function addReport(report: DeathReport): DeathReport[] {
  const current = getStoredReports();
  const updated = [report, ...current];
  saveStoredReports(updated);
  return updated;
}

export function updateReportStatus(
  reportId: string,
  newStatus: CertificateStatus,
  extra?: Partial<DeathReport>
): DeathReport[] {
  const current = getStoredReports();
  const updated = current.map((item) => {
    if (item.id === reportId) {
      return {
        ...item,
        status: newStatus,
        ...extra,
      };
    }
    return item;
  });
  saveStoredReports(updated);
  return updated;
}


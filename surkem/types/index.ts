export type CertificateStatus =
  | 'DRAFT_ENCRYPTED'
  | 'AWAITING_RTRW_APPROVAL'
  | 'ED25519_SIGNED'
  | 'PROCESSING_DUKCAPIL'
  | 'CERTIFICATE_ISSUED';

export type AuthMethod = 'whatsapp' | 'email';

export type UserRole = 'pelapor' | 'rtrw' | 'dukcapil';
export type OfficerRole = Extract<UserRole, 'rtrw' | 'dukcapil'>;

export interface OfficerSession {
  role: OfficerRole;
  name: string;
  nipOrNik?: string;
  region?: string;
  token?: string;
}

export interface WargaSession {
  isLoggedIn: true;
  role: 'warga';
  name: string;
  phone: string;
  nik?: string;
}

export type UserSession = OfficerSession | WargaSession;

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: 'Pelapor' | 'Ketua RT/RW' | 'Petugas Dukcapil' | 'Sistem SPBE' | 'Whistle-Blower (Anonim)';
  actorName: string;
  action: string;
  targetReportId: string;
  cryptoHash: string;
  details: string;
}

export interface Reporter {
  name: string;
  nik: string;
  email: string;
  phone: string;
  relation: string;
  authMethod: AuthMethod;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface RTRWOfficer {
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  officerName: string;
  officerPhone: string;
  officerEmail: string;
  publicKeyEd25519: string;
}

export interface DeceasedDetails {
  fullName: string;
  nik: string;
  gender: 'Laki-laki' | 'Perempuan';
  dateOfBirth: string;
  dateOfDeath: string;
  timeOfDeath: string;
  causeOfDeath: string;
  placeOfDeath: string;
  address: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
}

export interface UploadedDocuments {
  ktpDeceasedName?: string;
  kkDeceasedName?: string;
  hospitalLetterName?: string;
  ktpReporterName?: string;
  encryptionAlgorithm?: 'AES-256-GCM';
  payloadHashAes256Gcm?: string;
  ivHex?: string;
  encryptionTimestamp?: string;
  aiVerification?: {
    overallConfidence: number;
    nikMatch: boolean;
    ocrConfidence: number;
    faceClarity: number;
    signatureDetected: boolean;
    status: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';
    notes: string;
  };
}

export interface DigitalSignatureInfo {
  algorithm: 'Ed25519';
  signerName: string;
  signerRole: 'Ketua RT' | 'Ketua RW' | 'Petugas Dukcapil';
  signatureHex: string;
  publicKey: string;
  timestamp: string;
  verified: boolean;
}

export interface DukcapilIssuanceInfo {
  issuedAt: string;
  officerName: string;
  officerNip: string;
  certificateNumber: string;
  qrValidationUrl: string;
  pbkdf2Salt: string;
  pbkdf2Iterations: number;
}

export interface DeathReport {
  id: string;
  reporter: Reporter;
  deceased: DeceasedDetails;
  status: CertificateStatus;
  assignedRTRW: RTRWOfficer;
  submittedAt: string;
  documents: UploadedDocuments;
  rtRwSignature?: DigitalSignatureInfo;
  dukcapilIssuance?: DukcapilIssuanceInfo;
  notes?: string;
}

export interface SuratKematianItem {
  noRegis: string;
  namaAlmarhum: string;
  nikAlmarhum: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tanggalWafat: string;
  waktuWafat?: string;
  tempatWafat: string;
  penyebabWafat: string;
  alamatDuka: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  namaPelapor: string;
  hubunganPelapor: string;
  statusVerifikasi: CertificateStatus;
  hashSHA256: string;
  tandaTanganEd25519: {
    namaPenandatangan: string;
    jabatan: string;
    publicKey: string;
    signatureHex: string;
    waktuTtd: string;
    status: 'TERVERIFIKASI' | 'MENUNGGU';
  };
  penerbitanDukcapil?: {
    nomorAkta: string;
    namaPejabat: string;
    nipPejabat: string;
    tanggalTerbit: string;
    urlValidasiQR: string;
  };
}

declare module 'server-only';

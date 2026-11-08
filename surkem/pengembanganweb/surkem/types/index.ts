export type CertificateStatus =
  | 'DRAFT_ENCRYPTED'
  | 'AWAITING_RTRW_APPROVAL'
  | 'ED25519_SIGNED'
  | 'PROCESSING_DUKCAPIL'
  | 'CERTIFICATE_ISSUED';

export type AuthMethod = 'whatsapp' | 'email';

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
  encryptionAlgorithm: 'AES-256-GCM';
  payloadHashAes256Gcm: string;
  ivHex: string;
  encryptionTimestamp: string;
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


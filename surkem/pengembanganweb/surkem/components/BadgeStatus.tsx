import React from 'react';
import { CertificateStatus } from '@/types';

export interface BadgeStatusProps {
  status: CertificateStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  subLabel?: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}

const STATUS_CONFIG: Record<CertificateStatus, StatusConfig> = {
  DRAFT_ENCRYPTED: {
    label: 'Draft Encrypted',
    subLabel: 'Terenkripsi AES-256',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-800',
    borderClass: 'border-slate-300',
    icon: ({ className = 'w-3.5 h-3.5' }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
  },
  AWAITING_RTRW_APPROVAL: {
    label: 'Awaiting RT/RW Approval',
    subLabel: 'Menunggu Verifikasi RT/RW',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-950',
    borderClass: 'border-amber-300',
    icon: ({ className = 'w-3.5 h-3.5' }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  ED25519_SIGNED: {
    label: 'Ed25519 Signed',
    subLabel: 'Ditandatangani RT/RW',
    bgClass: 'bg-indigo-100',
    textClass: 'text-indigo-950',
    borderClass: 'border-indigo-300',
    icon: ({ className = 'w-3.5 h-3.5' }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
        />
      </svg>
    ),
  },
  PROCESSING_DUKCAPIL: {
    label: 'Processing at Dukcapil',
    subLabel: 'Verifikasi Dinas Dukcapil',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-950',
    borderClass: 'border-blue-300',
    icon: ({ className = 'w-3.5 h-3.5' }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5H4.5V21h15z"
        />
      </svg>
    ),
  },
  CERTIFICATE_ISSUED: {
    label: 'Certificate Issued',
    subLabel: 'Akta Resmi Terbit',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-950',
    borderClass: 'border-emerald-300',
    icon: ({ className = 'w-3.5 h-3.5' }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
        />
      </svg>
    ),
  },
};

export function BadgeStatus({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}: BadgeStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT_ENCRYPTED;
  const Icon = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2 py-0.5 gap-1 font-medium'
      : 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label} - ${config.subLabel}`}
      className={`inline-flex items-center rounded-full border shadow-2xs ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-4 h-4 shrink-0'} />}
      <span>{config.label}</span>
      <span className="hidden sm:inline opacity-80 font-normal">({config.subLabel})</span>
    </span>
  );
}

export default BadgeStatus;


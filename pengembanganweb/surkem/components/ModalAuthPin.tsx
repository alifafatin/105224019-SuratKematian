'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';

export interface ModalAuthPinProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deceasedName: string;
  expectedPin: string; // e.g. last 4 digits of deceased NIK
  reportId: string;
}

function ModalAuthPinDialog({
  onClose,
  onSuccess,
  deceasedName,
  expectedPin,
  reportId,
}: Omit<ModalAuthPinProps, 'isOpen'>) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [hashDetail, setHashDetail] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus input and listen for ESC key
  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN otorisasi harus berupa 4 digit angka.');
      inputRef.current?.focus();
      return;
    }

    setIsHashing(true);
    setHashDetail('Menghasilkan cryptographic salt & komputasi hash PBKDF2 (100.000 iterasi)...');

    // Simulate cryptographic key derivation latency
    setTimeout(() => {
      if (pin === expectedPin) {
        setIsHashing(false);
        setHashDetail('Otorisasi Terverifikasi! Kunci enkripsi dokumen terbuka.');
        setTimeout(() => {
          onSuccess();
        }, 400);
      } else {
        setIsHashing(false);
        setHashDetail(null);
        setError(
          `PIN otorisasi salah. Masukkan 4 digit terakhir NIK almarhum (Petunjuk simulasi: ${expectedPin}).`
        );
        inputRef.current?.focus();
      }
    }, 750);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-pin-title"
        aria-describedby="modal-pin-desc"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-600 text-white" aria-hidden="true">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 id="modal-pin-title" className="text-base font-bold text-white leading-tight">
                Otorisasi Kredensial Pengunduhan
              </h2>
              <p className="text-xs text-slate-300">
                Laporan #{reportId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Tutup jendela otorisasi PIN"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p id="modal-pin-desc" className="text-sm text-slate-700 leading-relaxed">
            Untuk mengunduh surat kematian resmi atas nama{' '}
            <strong className="text-slate-900 font-semibold">{deceasedName}</strong>,
            masukkan <span className="font-semibold text-blue-900">4 digit terakhir NIK</span> almarhum/almarhumah sebagai PIN dekripsi berkas.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
            <div className="flex items-start gap-2">
              <span className="font-bold shrink-0">🔐 Simulasi PBKDF2:</span>
              <span>
                PIN ini diturunkan menggunakan algoritma PBKDF2 dengan salt berkas untuk menghasilkan kunci enkripsi sementara.
                <span className="block mt-1 font-mono text-[11px] text-blue-800">
                  (Petunjuk demonstrasi PIN: <strong className="underline">{expectedPin}</strong>)
                </span>
              </span>
            </div>
          </div>

          {/* PIN Input */}
          <div>
            <label
              htmlFor="auth-pin-input"
              className="block text-sm font-semibold text-slate-800 mb-1"
            >
              PIN Otorisasi (4 Digit Angka) <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="auth-pin-input"
                name="authPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(val);
                  if (error) setError(null);
                }}
                placeholder="••••"
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'pin-error-msg' : undefined}
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 px-4 rounded-lg border border-slate-300 bg-white text-slate-900 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              />
            </div>
            {error && (
              <p id="pin-error-msg" role="alert" className="mt-1.5 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}
          </div>

          {/* Cryptographic Progress indicator */}
          {hashDetail && (
            <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
              {isHashing ? (
                <svg className="animate-spin h-4 w-4 text-blue-700 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span className="text-emerald-700 font-bold" aria-hidden="true">✓</span>
              )}
              <span className="font-mono text-[11px]">{hashDetail}</span>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isHashing}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isHashing}
              loadingText="Memverifikasi PIN..."
              disabled={pin.length !== 4 || isHashing}
              className="w-full sm:w-auto"
            >
              Buka Kunci & Unduh Akta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalAuthPin(props: ModalAuthPinProps) {
  if (!props.isOpen) return null;
  return <ModalAuthPinDialog {...props} />;
}

export default ModalAuthPin;

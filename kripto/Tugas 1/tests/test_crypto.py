"""
Pengujian Otomatis (Unit Testing) - Modul Kriptografi Surat Kematian Digital
==========================================================================
File ini berisi skenario pengujian otomatis menggunakan framework `pytest`
untuk memverifikasi fungsi enkripsi/dekripsi AES-256, tanda tangan digital Ed25519,
serta hashing PBKDF2.

Persyaratan Tugas Kriptografi:
- Minimal 4 skenario uji otomatis.
- Minimal 3 pengujian berhasil (uji positif).
- Minimal 1 pengujian negatif / batas (boundary test).
"""

import pytest  # Impor framework pengujian otomatis pytest
from crypto.crypto_module import KriptoSuratKematian  # Impor kelas utama modul kriptografi yang diuji


@pytest.fixture
def crypto_system():
    """
    Fixture Pytest: Menyediakan instance terisolasi dari KriptoSuratKematian
    untuk digunakan kembali oleh setiap fungsi pengujian secara independen.
    """
    return KriptoSuratKematian()  # Mengembalikan objek baru dari KriptoSuratKematian


# -------------------------------------------------------------
# UJI POSITIF 1: Enkripsi & Dekripsi NIK Almarhum (AES-256-GCM)
# -------------------------------------------------------------
def test_enkripsi_dekripsi_nik_berhasil(crypto_system):
    """
    Skenario Uji Positif 1: Memastikan data NIK sensitif yang dienkripsi
    dapat didekripsi kembali menjadi teks yang sama persis tanpa perubahan.
    """
    # 1. Siapkan data uji berupa NIK almarhum (16 digit string)
    nik_asli = "3171012304560001"
    
    # 2. Jalankan fungsi enkripsi untuk mendapatkan nonce dan ciphertext format hex
    hasil_enkripsi = crypto_system.enkripsi_data_sensitif(nik_asli)
    
    # 3. Jalankan fungsi dekripsi menggunakan nonce dan ciphertext yang dihasilkan
    nik_dekripsi = crypto_system.dekripsi_data_sensitif(
        hasil_enkripsi["nonce"], 
        hasil_enkripsi["ciphertext"]
    )
    
    # 4. Validasi Assert: Hasil dekripsi harus identik dengan NIK asli sebelum dienkripsi
    assert nik_dekripsi == nik_asli


# -------------------------------------------------------------
# UJI POSITIF 2: Tanda Tangan Digital RT/RW (Ed25519)
# -------------------------------------------------------------
def test_tanda_tangan_digital_rtrw_valid(crypto_system):
    """
    Skenario Uji Positif 2: Memastikan tanda tangan digital yang dibubuhi
    menggunakan Private Key RT/RW dapat diverifikasi secara sah menggunakan Public Key RT/RW.
    """
    # 1. Panggil fungsi untuk menghasilkan pasangan kunci baru (Private Key & Public Key)
    priv_key, pub_key = crypto_system.generate_pasangan_kunci_rtrw()
    
    # 2. Siapkan teks sampel berupa draft persetujuan surat kematian dari RT/RW
    draft_surat = "DRAFT-SURAT-KEMATIAN-ID-9921-SETUJU-RT01-RW05"
    
    # 3. RT/RW menandatangani draft surat menggunakan Private Key miliknya
    signature = crypto_system.tanda_tangani_draft(priv_key, draft_surat)
    
    # 4. Sistem memverifikasi keaslian tanda tangan menggunakan Public Key milik RT/RW
    is_valid = crypto_system.verifikasi_tanda_tangan(pub_key, signature, draft_surat)
    
    # 5. Validasi Assert: Nilai is_valid harus bernilai True (Tanda Tangan Asli)
    assert is_valid is True


# -------------------------------------------------------------
# UJI POSITIF 3: Hash Password Unduh Surat (PBKDF2)
# -------------------------------------------------------------
def test_hash_password_unduh_berhasil(crypto_system):
    """
    Skenario Uji Positif 3: Memastikan fungsi hashing PBKDF2 menghasilkan
    format hash SHA-256 (64 karakter hex) dan salt (32 karakter hex) dengan tepat.
    """
    # 1. Siapkan input password unduh berupa 4 digit belakang NIK pelapor
    nik_4digit = "0001"
    
    # 2. Panggil fungsi hashing PBKDF2 untuk mendapatkan salt dan nilai hash
    hasil = crypto_system.hash_password_unduh(nik_4digit)
    
    # 3. Validasi Assert: Panjang hash SHA-256 hex harus tepat 64 karakter (256 bit / 4 bit per hex)
    assert len(hasil["hash"]) == 64
    
    # 4. Validasi Assert: Panjang salt hex harus tepat 32 karakter (16 bytes = 128 bit)
    assert len(hasil["salt"]) == 32


# -------------------------------------------------------------
# UJI NEGATIF (Wajib): Dekripsi Gagal jika Ciphertext Corrupt
# -------------------------------------------------------------
def test_dekripsi_nik_gagal_jika_ciphertext_corrupt(crypto_system):
    """
    Skenario Uji Negatif (Tampering Test): Memastikan sistem melempar Exception
    dan menggagalkan proses dekripsi jika ciphertext NIK dimodifikasi/diubah oleh pihak tak berhak.
    """
    # 1. Siapkan NIK asli dan enkripsi seperti biasa untuk mendapatkan ciphertext yang sah
    nik_asli = "3171012304560001"
    hasil = crypto_system.enkripsi_data_sensitif(nik_asli)
    
    # 2. Simulasi Serangan (Tampering): Ubah 2 karakter terakhir ciphertext menjadi 'ff'
    ciphertext_corrupt = hasil["ciphertext"][:-2] + "ff"
    
    # 3. Validasi Assert (Ekspektasi Error): Pengujian LULUS jika fungsi melemparkan Exception/Error
    with pytest.raises(Exception):
        # Percobaan dekripsi dengan ciphertext yang sudah dirusak/corrupt
        crypto_system.dekripsi_data_sensitif(hasil["nonce"], ciphertext_corrupt)
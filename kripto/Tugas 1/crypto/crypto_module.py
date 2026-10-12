"""
Modul Kriptografi Utama - Layanan Surat Kematian Digital
======================================================
Modul ini menyediakan layanan kriptografi dasar untuk pengamanan data sensitif (NIK),
pembuatan & verifikasi tanda tangan digital persetujuan RT/RW, serta keamanan password unduh.

Pustaka Utama:
- cryptography (AESGCM & Ed25519)
- hashlib (PBKDF2)
- os (Keacakan aman / CSPRNG)
"""

import os  # Mengakses fungsi OS untuk pembangkitan angka acak yang aman (CSPRNG)
import hashlib  # Pustaka bawaan Python untuk fungsi hashing dan KDF (Key Derivation Function)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM  # Algoritma Enkripsi Simetris AES-256-GCM
from cryptography.hazmat.primitives.asymmetric import ed25519  # Algoritma Kriptografi Asimetris Ed25519 (ECC)


class KriptoSuratKematian:
    """
    Kelas pengelola seluruh modul kriptografi untuk aplikasi Surat Kematian Digital.
    
    Attributes:
        key (bytes): Kunci rahasia simetris sepanjang 256 bit (32 bytes).
        aesgcm (AESGCM): Objek mesin enkripsi AES-GCM yang diinisialisasi dengan `key`.
    """

    def __init__(self, master_key: bytes = None):
        """
        Inisialisasi kunci utama aplikasi dan mesin AES-GCM.

        Args:
            master_key (bytes, optional): Kunci rahasia 32-byte kustom. 
                                          Jika None, sistem akan membuat kunci acak baru.
        """
        # Pembangkitan Kunci: Gunakan master_key jika ada, atau buat kunci acak 256-bit baru
        self.key = master_key or AESGCM.generate_key(bit_length=256)
        
        # Inisialisasi cipher AES-GCM menggunakan kunci 256-bit yang telah disiapkan
        self.aesgcm = AESGCM(self.key)

    # =========================================================
    # 1. ENKRIPSI DATA SENSITIF & BERKAS (AES-256-GCM)
    # =========================================================
    
    def enkripsi_data_sensitif(self, plaintext: str) -> dict:
        """
        Mengenkripsi teks biasa (seperti NIK atau nama almarhum) menjadi ciphertext terautentikasi.

        Args:
            plaintext (str): Data teks rahasia yang akan dienkripsi.

        Returns:
            dict: Kamus berisi 'nonce' (hex) dan 'ciphertext' (hex).
        """
        # Hasilkan Nonce (Number Used Once) sepanjang 12 byte (96-bit) yang wajib acak & unik
        nonce = os.urandom(12)  
        
        # Eksekusi Enkripsi: Ubah plaintext ke byte, lalu enkripsi bersama nonce
        ciphertext = self.aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
        
        # Kembalikan hasil dalam format string Hexadecimal agar mudah disimpan di database
        return {
            "nonce": nonce.hex(),         # Nonce unik format string hex
            "ciphertext": ciphertext.hex() # Ciphertext terenkripsi format string hex
        }

    def dekripsi_data_sensitif(self, nonce_hex: str, ciphertext_hex: str) -> str:
        """
        Mendekripsi ciphertext kembali menjadi teks biasa (plaintext) asal.

        Args:
            nonce_hex (str): Nonce acak unik saat enkripsi (format hex).
            ciphertext_hex (str): Data terenkripsi yang akan didekripsi (format hex).

        Returns:
            str: Data asli dalam bentuk string teks biasa.

        Raises:
            cryptography.exceptions.InvalidTag: Jika ciphertext dimodifikasi/rusak (tampered).
        """
        # Konversi string Hexadecimal kembali menjadi bentuk byte mentah
        nonce = bytes.fromhex(nonce_hex)
        ciphertext = bytes.fromhex(ciphertext_hex)
        
        # Eksekusi Dekripsi: Validasi tag otentikasi & dekripsi ciphertext secara simultan
        decrypted_bytes = self.aesgcm.decrypt(nonce, ciphertext, None)
        
        # Konversi deretan byte hasil dekripsi kembali menjadi String Teks (utf-8)
        return decrypted_bytes.decode('utf-8')

    # =========================================================
    # 2. TANDA TANGAN DIGITAL RT/RW (Ed25519 Asymmetric Key)
    # =========================================================
    
    @staticmethod
    def generate_pasangan_kunci_rtrw():
        """
        Menghasilkan sepasang kunci kriptografi asimetris (Private Key & Public Key) berbasis Ed25519.

        Returns:
            tuple: (Ed25519PrivateKey, Ed25519PublicKey)
        """
        # Pembangkitan Kunci Privat Ed25519 berbasis Kurva Eliptik yang aman & efisien
        private_key = ed25519.Ed25519PrivateKey.generate()
        
        # Turunkan Kunci Publik resmi dari Kunci Privat yang baru dibuat
        public_key = private_key.public_key()
        
        # Kembalikan pasangan kunci dalam bentuk tuple
        return private_key, public_key

    @staticmethod
    def tanda_tangani_draft(private_key, data_draft: str) -> str:
        """
        Membubuhi tanda tangan digital pada draft dokumen persetujuan menggunakan Private Key RT/RW.

        Args:
            private_key (Ed25519PrivateKey): Kunci rahasia milik RT/RW.
            data_draft (str): Teks isi draft surat/dokumen yang akan disetujui.

        Returns:
            str: Tanda tangan digital dalam format string hexadecimal.
        """
        # Proses Pembubuhan Tanda Tangan: Tandatangani byte teks data_draft dengan Private Key
        signature = private_key.sign(data_draft.encode('utf-8'))
        
        # Ubah byte tanda tangan digital ke format Hexadecimal untuk penyimpanan/pengiriman
        return signature.hex()

    @staticmethod
    def verifikasi_tanda_tangan(public_key, signature_hex: str, data_draft: str) -> bool:
        """
        Memverifikasi keaslian dan integritas tanda tangan digital menggunakan Public Key RT/RW.

        Args:
            public_key (Ed25519PublicKey): Kunci publik terverifikasi milik RT/RW.
            signature_hex (str): Tanda tangan digital yang akan diuji (format hex).
            data_draft (str): Teks isi draft surat/dokumen asli yang diuji.

        Returns:
            bool: True jika tanda tangan sah & dokumen asli, False jika palsu/rusak.
        """
        try:
            # Konversi string Hexadecimal tanda tangan kembali ke format byte mentah
            signature = bytes.fromhex(signature_hex)
            
            # Verifikasi Matematis: Periksa apakah signature cocok dengan Public Key dan data_draft
            public_key.verify(signature, data_draft.encode('utf-8'))
            
            # Kembalikan True jika verifikasi berhasil tanpa error
            return True
        except Exception:
            # Jika ada error (misal data diubah, kunci salah, signature palsu), kembalikan False
            return False

    # =========================================================
    # 3. PASSWORD AKSES UNDUH SURAT (PBKDF2 + SHA-256)
    # =========================================================
    
    @staticmethod
    def hash_password_unduh(nik_4digit: str, salt: bytes = None) -> dict:
        """
        Meng-hash PIN/4-digit belakang NIK pelapor menggunakan KDF standar PBKDF2-HMAC-SHA256.

        Args:
            nik_4digit (str): 4 digit password pembuka file surat kematian.
            salt (bytes, optional): Salt acak tambahan. Jika None, akan di-generate otomatis.

        Returns:
            dict: Kamus berisi 'salt' (hex) dan 'hash' hasil pengolahan (hex).
        """
        # Cek ketersediaan Salt: Jika tidak diberikan, buat 16 byte acak acak dari OS
        if not salt:
            salt = os.urandom(16)
            
        # Pengecekan KDF: Jalankan algoritma PBKDF2 HMAC SHA-256 dengan 100.000 kali perulangan (iterations)
        key_hash = hashlib.pbkdf2_hmac(
            hash_name='sha256',             # Algoritma hash dasar
            password=nik_4digit.encode('utf-8'), # Password dikonversi ke byte
            salt=salt,                      # Salt acak untuk mencegah serangan Rainbow Table
            iterations=100000               # 100.000 iterasi untuk memperlambat serangan Brute-Force
        )
        
        # Kembalikan pasangan Salt dan nilai Hash dalam format Hexadecimal
        return {
            "salt": salt.hex(),   # Salt unik format hex
            "hash": key_hash.hex() # Hasil hash terproteksi format hex
        }
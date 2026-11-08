# Dokumen Teknis Modul 7 — Debugging dan Telaah Kode
Nama/NIM :
Repositori :
Pull request: (tautan PR praktikum/modul-07)
## 1. Lingkungan dan Konfigurasi Debugger
- Versi Node.js, Next.js, Prisma, peramban; hash commit awal
- Isi .vscode/launch.json dan konfigurasi log Prisma
- Tangkapan layar debugger berhenti di Server Component
## 2. Daftar Galat
| No | Issue | Gejala | Lapisan | Akar penyebab | Commit perbaikan |
|----|-------|--------|---------|---------------|------------------|
## 3. Catatan Penelusuran (satu subbagian per galat, minimal tiga)
- Langkah reproduksi (salin dari issue)
- Bukti sebelum perbaikan: Payload Network, Variables/Debug Console, stack
trace, atau tab Components
- Akar penyebab dan perbaikan (potongan kode)
- Bukti sesudah perbaikan: langkah reproduksi diulang, hasil dan frekuensi
## 4. Keputusan Teknis
- z.stringbool() dibanding alternatif lain
- Aturan hapus item berulasan: transaksi, Cascade, atau tolak, beserta
alasannya
- Nilai turunan saat render dibanding useEffect
- Kapan galat ditangani di Server Action dan kapan diteruskan ke error.tsx
## 5. Telaah Kode
- Tautan PR pasangan dan ringkasan komentar yang Anda berikan (minimal tiga,
format baris | kategori | masalah | perbaikan)
- Komentar yang Anda terima: diterapkan atau ditolak, beserta alasan
## 6. Kendala dan Penyelesaian
## 7. Catatan Pemanfaatan AI
Alat, perintah utama, bagian kode yang dihasilkan AI, galat yang ditemukan,
perubahan yang Anda lakukan, dan cara memverifikasinya.
Tulis "Tidak menggunakan AI" apabila tidak menggunakan AI
# Panduan Surkem - Tugas 2

Surkem melanjutkan alur pelaporan surat kematian dari Milestone 1. Data persisten
menggunakan entitas `WargaProfile` dan `DeathReport`; satu profil dapat memiliki
banyak pengajuan, dan penghapusan profil mempertahankan pengajuan dengan relasi
`reporterProfileId` menjadi `NULL`.

## Konfigurasi lokal

1. Salin `.env.example` menjadi `.env` pada folder aplikasi dan isi `BACKEND_API_URL`
   (default lokal: `http://localhost:5000`).
2. Salin `backend/.env.example` menjadi `backend/.env`, lalu isi `DATABASE_URL` dengan
   koneksi PostgreSQL lokal. Jangan commit file `.env` atau kredensial. Buat
   `ENCRYPTION_KEY_BASE64` dengan CSPRNG dan set sebagai environment variable proses
   (jangan simpan nilainya pada file dalam repository):

   ```powershell
   $env:ENCRYPTION_KEY_BASE64 = node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   ```

   Pertahankan terminal tersebut saat menjalankan backend agar variabel kunci tetap
   tersedia.
3. Jalankan perintah Prisma dari folder `backend`:

   ```powershell
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

   Perintah seed eksplisit juga tersedia sebagai `npx prisma db seed`. Konfigurasi
   `backend/prisma.config.ts` menunjuk ke `backend/prisma/seed.js`.
   Jika database sudah berisi pengajuan lama, jalankan `npm run db:encrypt-existing`
   sebelum backend melayani permintaan.
4. Jalankan backend dengan `npm run dev` dari folder `backend`, lalu jalankan
   aplikasi Next.js dengan `npm run dev` dari folder aplikasi.

Seed membuat profil dan pengajuan sintetis bernomor `SRK-SEED-2026-001`.

## Rencana pengujian

Halaman `/testing` menyajikan 13 skenario lengkap: delapan skenario CRUD untuk profil
warga dan pengajuan, dua skenario relasi, serta tiga skenario penolakan validasi
server. Minimal 12 dari 13 skenario harus lulus untuk memenuhi ambang 90% setelah
pembulatan ke atas. Kolom hasil aktual dan status pada halaman tersebut sengaja berstatus
**Belum dijalankan** sampai diuji pada PostgreSQL yang dikonfigurasi; jangan mengisi
status lulus tanpa bukti eksekusi.

Untuk setiap operasi, verifikasi hasil melalui UI dan database. Gunakan Prisma Studio
(`npx prisma studio` dari `backend`) atau query PostgreSQL pada tabel `WargaProfile`
dan `DeathReport`. Untuk uji relasi, periksa `DeathReport.reporterProfileId` sebelum
dan sesudah penghapusan profil. Untuk uji validasi, kirim input sintetis yang
disebutkan di `/testing`, pastikan tidak ada baris baru, dan simpan bukti pesan
kesalahan yang ditampilkan pada field terkait.

## Bukti yang perlu dilampirkan setelah pengujian

- Tangkapan layar hasil aktual dan status setiap skenario pada `/testing`.
- Tiga tangkapan layar penolakan validasi server untuk nama spasi, nama terlalu
  pendek, dan nomor telepon 16 digit.
- Bukti perubahan database setelah create, update, dan delete; gunakan hanya data
  sintetis.
- Bukti relasi foreign key untuk pengajuan yang dibuat menggunakan profil warga.

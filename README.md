# Praktikum PAW — Surkem

Surkem adalah prototipe aplikasi web untuk pelaporan dan pengelolaan pengajuan
Surat Keterangan Kematian. Repository ini melanjutkan produk Milestone 1; aplikasi
Surkem untuk Milestone 2 berada di folder [`surkem/`](./surkem/).

> **Catatan demo:** autentikasi dan data petugas masih berupa simulasi. Gunakan
> hanya data sintetis; jangan memasukkan data pribadi nyata atau memakai aplikasi
> ini untuk layanan administrasi resmi.

## Perkembangan produk

- **v0.1 — Milestone 1:** antarmuka responsif untuk warga dan petugas, formulir
  pengajuan, dashboard verifikasi, serta alur tanda tangan/penerbitan simulasi.
- **v0.2 — Milestone 2:** backend dan PostgreSQL untuk menyimpan profil warga dan
  pengajuan secara persisten; operasi CRUD profil serta pengajuan; validasi Zod di
  server; Prisma ORM 7, migration, dan seed sintetis; halaman skenario pengujian di
  `/testing`.

## Teknologi

- Next.js 16 App Router, React 19, TypeScript, dan Tailwind CSS
- Next.js Server Actions dan Zod untuk validasi masukan di server
- Express 5 sebagai API backend
- PostgreSQL dan Prisma ORM 7 dengan PostgreSQL driver adapter

## Struktur aplikasi

```text
surkem/
├── app/                 # Halaman Next.js App Router
├── backend/
│   ├── prisma/          # Schema, migration, dan seed
│   ├── src/routes/      # API profil warga, pengajuan, dan autentikasi demo
│   └── server.js
├── components/          # Komponen antarmuka
├── docs/                # Panduan dan dokumentasi pengujian
└── lib/                 # Server Actions, skema Zod, dan utilitas
```

Entitas utama database adalah `WargaProfile` dan `DeathReport`. Satu profil dapat
terkait dengan banyak pengajuan. Jika profil dihapus, pengajuan tetap ada dan
referensi profilnya menjadi `NULL`.

## Persyaratan

- Node.js dan npm
- PostgreSQL yang dapat diakses dari komputer pengembangan

## Menjalankan aplikasi secara lokal

### 1. Siapkan environment

Dari root repository:

```powershell
if (!(Test-Path surkem\.env)) { Copy-Item surkem\.env.example surkem\.env }
if (!(Test-Path surkem\backend\.env)) { Copy-Item surkem\backend\.env.example surkem\backend\.env }
```

Edit `surkem/backend/.env` dan isi `DATABASE_URL` dengan koneksi PostgreSQL lokal,
contohnya:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/surkem?schema=public"
PORT=5000
JWT_SECRET=isi-nilai-lokal-anda
```

Ganti `USER`, `PASSWORD`, dan `JWT_SECRET` dengan nilai lokal Anda. `JWT_SECRET`
digunakan oleh konfigurasi backend; jangan gunakan nilai contoh pada deployment.
Frontend memakai `BACKEND_API_URL` dari `surkem/.env` (default
`http://localhost:5000`). Jangan commit file `.env` atau membagikan kredensial.

### 2. Pasang dependency frontend

```powershell
Set-Location surkem
npm ci
```

### 3. Siapkan database dan data sintetis

Buka terminal dari root repository:

```powershell
Set-Location surkem\backend
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
```

Seed dapat dijalankan secara eksplisit juga dengan `npx prisma db seed`. Seed
membuat profil dan satu pengajuan contoh sintetis (`SRK-SEED-2026-001`). Untuk
melihat isi database, jalankan `npx prisma studio` dari `surkem/backend`.

### 4. Jalankan backend dan frontend

Jalankan keduanya sekaligus dari folder aplikasi:

```powershell
Set-Location surkem
npm run dev
```

Perintah ini menjalankan API backend pada port 5000 dan Next.js pada port 3000.
Jika database atau salah satu server gagal dijalankan, periksa pesan error di
terminal sebelum mencoba login kembali. Hentikan kedua server dengan `Ctrl+C`.

Untuk menjalankan frontend saja (misalnya backend sudah dijalankan terpisah):

```powershell
npm run dev:next
```

Buka alamat yang ditampilkan Next.js (biasanya `http://localhost:3000`).

## Halaman utama

- `/` — beranda Surkem
- `/login-warga` — pembuatan atau pembaruan profil demo
- `/pengajuan` — formulir pengajuan surat kematian
- `/profil-warga` — membaca, memperbarui, dan menghapus profil warga
- `/login-petugas` dan `/dashboard` — alur demo petugas dan pengelolaan pengajuan
- `/testing` — 13 skenario pengujian yang perlu dijalankan dan dilengkapi hasil

## Pengujian dan bukti

Jalankan pemeriksaan frontend dari `surkem/`:

```powershell
npm run lint
npm run build
```

Panduan pengujian dan bukti yang perlu dikumpulkan ada di
[`surkem/docs/panduan-tugas-2.md`](./surkem/docs/panduan-tugas-2.md). Halaman
`/testing` menyediakan 13 skenario: delapan CRUD, dua relasi, dan tiga validasi
server. Skenario belum dianggap lulus sebelum dijalankan. Catat hasil aktual dan
status berdasarkan pengujian antarmuka serta verifikasi database; minimal 12 dari
13 harus lulus. Lampirkan tangkapan layar CRUD, perubahan pada PostgreSQL, dan tiga
penolakan input tidak valid. Seluruh pengujian harus menggunakan data sintetis.

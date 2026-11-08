# Pengujian Akses — `sec-0.2`

Dokumen ini mencatat matriks akses yang diharapkan dan kondisi kode saat ini.
Gunakan akun dan data sintetis saja. Jangan masukkan password, token, NIK, atau
data pengguna nyata ke dokumen maupun tangkapan layar.

## Pemetaan risiko

| Kontrol | ID risiko Tugas 1 | Catatan |
|---|---|---|
| Server memeriksa autentikasi dan peran sebelum mengakses pengajuan | Belum dipetakan | Tambahkan ID risiko yang sesuai dari Tugas 1 sebelum pengumpulan. |
| Kredensial petugas tidak ditanam di kode klien | Belum dipetakan | Tambahkan ID risiko yang sesuai dari Tugas 1 sebelum pengumpulan. |
| Kata sandi akun database disimpan dengan hash lambat | Belum dipetakan | Tambahkan ID risiko yang sesuai dari Tugas 1 sebelum pengumpulan. |

ID risiko sengaja tidak ditebak. Folder Tugas 1 tidak ditemukan dalam workspace
yang diperiksa.

## Matriks akses yang dituju

| Aksi | Pengunjung tanpa login | Warga terautentikasi | Petugas RT/RW | Petugas Dukcapil |
|---|---|---|---|---|
| Membuat pengajuan | Ditolak | Diizinkan untuk pengajuan sendiri | Ditolak | Ditolak |
| Membaca daftar pengajuan | Ditolak | Hanya pengajuan sendiri | Pengajuan dalam lingkup tugas | Pengajuan yang siap diproses Dukcapil |
| Membaca detail pengajuan | Ditolak | Hanya pengajuan sendiri | Hanya pengajuan dalam lingkup tugas | Hanya pengajuan dalam lingkup tugas |
| Mengubah status/persetujuan | Ditolak | Ditolak | Hanya tindakan RT/RW yang diizinkan | Hanya tindakan Dukcapil yang diizinkan |
| Menghapus pengajuan | Ditolak | Ditolak | Ditolak kecuali kebijakan khusus mengizinkan | Ditolak kecuali kebijakan khusus mengizinkan |

Matriks ini adalah target kontrol, bukan klaim bahwa kontrol sudah ditegakkan.
Aturan akses untuk pemilik pengajuan dan penugasan wilayah harus disepakati
sebelum implementasi RBAC.

## Hasil pemeriksaan kode saat ini

| ID | Peran uji | Pengujian akses tidak sah | Hasil yang diharapkan | Hasil saat ini | Status |
|---|---|---|---|---|---|
| AC-01 | Tanpa login | GET `/api/reports` | Ditolak server | Route mengembalikan daftar tanpa middleware autentikasi; belum diuji runtime | Gagal pada pemeriksaan kode |
| AC-02 | Tanpa login | GET `/api/reports/:id` | Ditolak server | Route membaca berdasarkan nomor registrasi tanpa autentikasi; belum diuji runtime | Gagal pada pemeriksaan kode |
| AC-03 | Tanpa login | POST `/api/reports` | Ditolak server | Route hanya memvalidasi payload; belum diuji runtime | Gagal pada pemeriksaan kode |
| AC-04 | Warga | PATCH `/api/reports/:id` | Ditolak server | Route menerima perubahan status tanpa memeriksa sesi/peran; belum diuji runtime | Gagal pada pemeriksaan kode |
| AC-05 | Warga | DELETE `/api/reports/:id` | Ditolak server | Route menghapus berdasarkan nomor registrasi tanpa autentikasi; belum diuji runtime | Gagal pada pemeriksaan kode |
| AC-06 | RT/RW | Mengubah pengajuan di luar lingkup tugas | Ditolak server | Backend tidak mengikat identitas petugas, wilayah, atau transisi status; belum diuji runtime | Gagal pada pemeriksaan kode |
| AC-07 | Dukcapil | Mengubah pengajuan di luar lingkup tugas | Ditolak server | Backend tidak memeriksa peran Dukcapil; belum diuji runtime | Gagal pada pemeriksaan kode |
| AC-08 | Tanpa login | Membuka dashboard petugas | Ditolak tanpa sesi petugas | UI memeriksa sesi di browser; sesi berbasis `localStorage` dapat diubah klien, belum diuji runtime | Belum lulus |

**Kesimpulan:** kontrol akses belum aman untuk deployment. Guard UI bukan
pengganti otorisasi server. Backend `/api/reports` belum menerapkan autentikasi
atau RBAC. Jangan gunakan data produksi dan jangan menandai skenario akses lulus
sebelum middleware server dan pengujian dengan akun terpisah tersedia.

## Rencana uji runtime setelah RBAC server tersedia

Jalankan hanya pada instance lokal/VM milik sendiri dengan database dan data
sintetis. Untuk setiap pengujian negatif, catat status HTTP, respons umum tanpa
data sensitif, dan verifikasi bahwa database tidak berubah.

1. Tanpa cookie/token, coba setiap aksi pada AC-01 sampai AC-07; pastikan server
   mengembalikan `401` atau `403` dan tidak mengubah database.
2. Dengan akun warga uji, coba baca pengajuan warga lain, PATCH, dan DELETE;
   pastikan `403` dan data tetap sama.
3. Dengan akun RT/RW uji, coba aksi Dukcapil dan akses pengajuan di luar wilayah;
   pastikan `403` dan tidak ada perubahan.
4. Dengan akun Dukcapil uji, coba aksi RT/RW dan akses di luar lingkup;
   pastikan `403` dan tidak ada perubahan.
5. Ulangi aksi yang diizinkan untuk tiap peran dan pastikan berhasil hanya pada
   lingkup kewenangannya.

| Tanggal | Lingkungan | Akun uji sintetis | Hasil aktual/bukti | Penguji |
|---|---|---|---|---|
| Belum dijalankan | Belum disiapkan | Belum disiapkan | Isi setelah pengujian runtime benar-benar dilakukan | Belum ditetapkan |

## Bukti hashing kata sandi

Endpoint pendaftaran/login database memakai `bcryptjs`: password diproses
dengan `bcrypt.hash(..., 12)` dan diverifikasi menggunakan `bcrypt.compare` di
`backend/src/routes/auth.js`. Tes otomatis pada
`backend/test/password-hash.test.js` menggunakan password sintetis; hasilnya
membuktikan hash berbeda dari plaintext, format bcrypt menggunakan cost 12,
password yang benar cocok, dan password salah tidak cocok.

Ini **tidak** berlaku untuk login demo petugas: kredensial demo masih berada di
kode klien (`app/login-petugas/page.tsx` dan `lib/mockData.ts`) dan tidak
disimpan sebagai hash. Login petugas tersebut harus diganti dengan autentikasi
server sebelum dijadikan kontrol keamanan atau digunakan di deployment.

Uji otomatis terakhir: `npm test` dari `backend` menghasilkan **8 lulus, 0
gagal**. Ini termasuk uji bcrypt sintetis dan uji kriptografi; bukan pengganti
pengujian otorisasi runtime.

## Batas pengumpulan saat ini

- Dockerfile dan Compose yang menerapkan pengguna non-root, pembuangan
  capability, filesystem read-only, serta port internal sudah disiapkan.
  Belum diverifikasi pada runtime Docker; hasil scan image dan SBOM juga belum
  dibuat. Lihat [`container-hardening.md`](./container-hardening.md).
- Lynis dan konfigurasi SSH perlu diuji pada Linux VM yang dikuasai sendiri.
- Tugas 1 tidak ada di workspace; ID risiko untuk tiap kontrol perlu dipetakan
  dari dokumen Tugas 1.
- Jangan membuat laporan scan, skor, hash commit, atau hasil uji seolah sudah
  dijalankan. Lampirkan bukti aktual setelah kontrol dikerjakan dan diverifikasi.

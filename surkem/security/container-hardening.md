# Pengerasan Container — `sec-0.2`

Status ini hanya mencatat konfigurasi yang ada di repository. Belum ada hasil
runtime Docker, scan image, atau SBOM yang direkam dari mesin ini.

| Kontrol | ID risiko Tugas 1 | Konfigurasi/bukti yang perlu diverifikasi |
|---|---|---|
| Menjalankan Next.js sebagai non-root | Belum dipetakan | `Dockerfile` memakai UID/GID 1001. |
| Menjalankan backend sebagai non-root | Belum dipetakan | `backend/Dockerfile` memakai pengguna `node`. |
| Menjalankan database tanpa root | Belum dipetakan | Service PostgreSQL dikonfigurasi dengan UID/GID 70; verifikasi UID proses pada image yang benar-benar berjalan. |
| Membuang Linux capabilities | Belum dipetakan | Semua service memakai `cap_drop: [ALL]`. |
| Mencegah privilege escalation dan filesystem write | Belum dipetakan | `no-new-privileges:true`; app, backend, dan database memakai filesystem read-only dengan tmpfs terbatas. |
| Tidak mempublikasikan port app/backend/db | Belum dipetakan | `app`, `backend`, dan `db` hanya memakai `expose`; hanya proxy demo yang mengikat `127.0.0.1:8080`. |

ID risiko sengaja belum diisi karena dokumen Tugas 1 tidak tersedia di workspace.
Ganti setiap nilai “Belum dipetakan” dengan ID yang sesuai sebelum pengumpulan.

## Jalankan dan verifikasi di mesin Docker

1. Buat `.env` lokal (jangan commit) dari `.env.example`. Gunakan password
   PostgreSQL acak berupa 64 karakter heksadesimal agar aman dipakai di URL
   koneksi; isi `JWT_SECRET` minimal 32 byte dan kunci enkripsi Base64 32 byte.
2. Dari root repository, validasi dan jalankan stack:

   ```sh
   docker compose config
   docker compose build --pull
   docker compose up -d
   docker compose ps
   ```

3. Buktikan identitas proses dan pemetaan port aktual:

   ```sh
   docker compose exec app id
   docker compose exec backend id
   docker compose exec db id
   docker compose port app 3000
   docker compose port backend 5000
   docker compose port db 5432
   docker compose port proxy 8080
   ```

   Tiga perintah `docker compose port` pertama harus tidak menghasilkan
   pemetaan host; proxy demo hanya boleh terikat ke `127.0.0.1:8080`.
   Catat output aktual, jangan menyalin hasil contoh sebagai hasil uji.

4. Jalankan scanner yang dipilih pada image baseline sebelum perbaikan dan pada
   image hasil build setelah perbaikan. Simpan output mentah sebagai
   `image-scan-before.txt` dan `image-scan-after.txt` di root repository.
   Buat SBOM CycloneDX untuk image aplikasi `surkem-app:sec-0.2` sebagai
   `sbom.cdx.json` di root repository. Jangan membuat file hasil tersebut sebelum
   perintah scanner/SBOM benar-benar berhasil.

   Contoh jika Trivy dan Syft tersedia:

   ```sh
   (trivy image --format table nginx:1.21; trivy image --format table postgres:13) > image-scan-before.txt
   (trivy image --format table surkem-app:sec-0.2; trivy image --format table surkem-backend:sec-0.2; trivy image --format table postgres:16-alpine; trivy image --format table nginxinc/nginx-unprivileged:1.27-alpine) > image-scan-after.txt
   syft docker:surkem-app:sec-0.2 -o cyclonedx-json > sbom.cdx.json
   ```

   File “before” hanya sah jika benar-benar dipindai dari baseline sebelum
   perbaikan; jangan membuatnya secara retrospektif dari versi sesudah.

Compose ini mengotomatisasi `prisma migrate deploy` saat backend mulai.
Pengaturan container bukan pengganti autentikasi dan otorisasi server; jangan
gunakan stack ini untuk data nyata sampai temuan akses pada
[`access-tests.md`](./access-tests.md) diselesaikan.

# Keputusan Kriptografi

## Kebutuhan

NIK pelapor dan almarhum pada pengajuan surat kematian merupakan data sensitif
yang perlu terlindungi dari pembacaan dan perubahan langsung di database.
Perlindungan diterapkan saat data disimpan di `DeathReport`; respons aplikasi
tetap memberikan NIK dalam bentuk semula setelah autentikasi tag berhasil.

## Mekanisme

Gunakan **AES-256-GCM** dari modul `node:crypto` bawaan Node.js melalui helper
`backend/src/security/sensitive-data.js`.

- Kunci: 256 bit (32 byte), dibuat menggunakan CSPRNG `randomBytes(32)`.
  Representasi konfigurasi adalah Base64 di `ENCRYPTION_KEY_BASE64`; berikan
  melalui environment backend atau secret manager di luar repository. Jangan
  menyimpan nilai kunci pada file apa pun di working tree, termasuk `.env`.
- Nonce: 96 bit (12 byte), dibuat baru secara acak untuk setiap enkripsi.
- AAD: label field tetap `DeathReport.reporterNik` atau
  `DeathReport.deceasedNik`; ciphertext tidak dapat dipindahkan antarkolom.
- Tag autentikasi: 128 bit (16 byte), dihasilkan dan diverifikasi oleh GCM.
- Format penyimpanan: `v1.<nonce-base64>.<tag-base64>.<ciphertext-base64>`.

Masukan harus berupa string tidak kosong; konfigurasi kunci, bentuk envelope,
panjang nonce/tag, AAD, dan tag autentikasi divalidasi. Kegagalan konfigurasi,
dekripsi, atau autentikasi diteruskan sebagai kegagalan request (tidak ada
fallback plaintext). Jangan gunakan ulang nonce dengan kunci yang sama dan
jangan menyimpan kunci di repository atau database.

Generate kunci baru dengan perintah berikut dari terminal tepercaya, kemudian
berikan langsung ke environment proses backend atau simpan pada secret manager
di luar repository:

```powershell
$env:ENCRYPTION_KEY_BASE64 = node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Variabel kunci harus tersedia untuk backend sebelum menjalankan server atau
seed. Sebelum mengaktifkan versi ini pada database yang sudah berisi pengajuan,
jalankan `npm run db:encrypt-existing` dari folder `backend`. Migrasi hanya
menerima NIK lama berupa 16 digit, memvalidasi envelope yang sudah terenkripsi,
dan berhenti jika menemukan data invalid atau autentikasi gagal. Migrasi dapat
dijalankan ulang setelah kegagalan parsial.

## Alasan

AES-256-GCM menyediakan kerahasiaan dan autentikasi dalam satu operasi AEAD,
sehingga perubahan ciphertext, tag, atau kunci akan menggagalkan dekripsi.
Nonce acak memenuhi keunikan praktis untuk setiap nilai terenkripsi, sedangkan
AAD mengikat ciphertext ke jenis field. Pustaka kriptografi bawaan Node.js
terpelihara dan menghindari implementasi primitif kriptografi sendiri.

Penerapan saat ini secara sengaja mencakup dua field NIK pada `DeathReport`.
Field lain yang masih disimpan sebagai plaintext belum dilindungi oleh
implementasi ini.

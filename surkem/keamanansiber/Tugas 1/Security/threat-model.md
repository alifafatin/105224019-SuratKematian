# STRIDE Threat Model - Sistem Layanan Surat Kematian Digital

| ID | Elemen | STRIDE | Threat statement | Asset terdampak |
|---|---|---|---|---|
| T-01 | F1 | S | Attacker oportunistik dapat mengaku sebagai Pelapor dengan melakukan OTP Interception pada nomor WA/Email yang tidak tervalidasi ketat, sehingga dapat membuat pengajuan surat kematian palsu. | Data Sensitif Almarhum |
| T-02 | F3 | T | Attacker di jaringan (Man-in-the-Middle) dapat mengubah data NIK almarhum saat pengiriman form jika koneksi tidak memaksakan TLS, sehingga data yang disimpan corrupt/fiktif. | Data Sensitif Almarhum |
| T-03 | DS1 | I | Pihak internal/DBA dapat membaca NIK almarhum secara langsung jika data disimpan dalam bentuk plaintext tanpa enkripsi at-rest, sehingga melanggar UU PDP. | Data Sensitif Almarhum |
| T-04 | P3 | T | Attacker dapat memanipulasi parameter alamat KTP pada request HTTP untuk membypass deteksi otomatis nomor WA RT/RW, sehingga notifikasi verifikasi terkirim ke nomor WA penipu. | Data Sensitif Almarhum, Secret Autentikasi |
| T-05 | P4 | E | Pelapor biasa dapat memanggil endpoint API approval RT/RW (`/api/v1/rtrw/approve`) secara langsung tanpa otorisasi peran (Missing RBAC), sehingga dapat menyetujui draft suratnya sendiri. | Tanda Tangan Digital RT/RW |
| T-06 | P4 | R | RT/RW menyangkal telah menyetujui pembuatan surat kematian fiktif karena sistem tidak mencatat Audit Log terstruktur dan tidak memproteksi Private Key tanda tangan digital. | Tanda Tangan Digital RT/RW, Audit Log |
| T-07 | P1 | D | Botnet dapat membanjiri form pengajuan dan modul WA Gateway secara terus menerus, sehingga kuota API WA habis dan server mengalami crash. | Web Server Application |
| T-08 | DS2 | I | Attacker dapat menebak URL langsung file scan KTP/Surat RS (IDOR pada Object Storage) tanpa autentikasi, sehingga dokumen fisik sensitif bocor ke publik. | Dokumen Pendukung Sensitif |
| T-09 | P5 | S | Pihak yang tidak berhak dapat mendownload Surat Kematian resmi jika verifikasi kepemilikan (4 digit belakang NIK) terlalu lemah dan tanpa rate-limiting. | Data Sensitif Almarhum |
| T-10 | P5 | T | Attacker melakukan manipulasi isi file PDF Surat Kematian yang sudah diterbitkan jika PDF tersebut tidak dibubuhi Digital Signature / Hash Verification dari Dukcapil. | Data Sensitif Almarhum, Tanda Tangan Digital RT/RW |
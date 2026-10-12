Assey Inventory - Sistem Layanan Surat Kematian Digital

|ID Asset | Nama Asset | Kategori | Lokasi | C | I | A | Alasan |
|---|---|---|---|---|---|---|---|
|A-01| Data sensitif Almarhum seperti NIK, Nama, Tanggal wafat, Alamat | Data | PostgreSQL | High | High |Moderate | Tunduk pada UU PDP, kebocoran NIK berisko penyalahgunaan identitas.| 
| A-02| Dokumen pendukung sensitif (Scan KTP/KK Almarhum, Surat RS) | Data | Object Storage | High | High | Low | Memuat file fisik identitas pribadi |
| A-03| Tanda tangan digital RT/RW | Data | PostgreSQL | High | High | Low | Memiliki kekuatan hukum persetujuan | 
| A-04| Kredensial / Secret Autentikasi | Secrets | .env  | High | High | Low | Kebocoran secret memungkinkan pemalsuan sesi dan tanda tangan digital. | 
| A-05| Web Server | Software | Docker  | Low | High | High | Layanan utama antarmuka Pelapor, RT/RW, dan Dukcapil. | 
| A-06| Basis data utama yang menyimpan seluruh data | Software | Docker  | High | High | High | Menyimpan relasi surat, status verifikasi, dan audit log. | 
| A-07| Virtual Machine | Host | Cloud  | High | High | High | Menjalankan seluruh container aplikasi dan basis data. | 
| A-08| Audit log dan history verifikasi berkas | Data | PostgreSQL  | Moderate | High | Moderate | Catatan hukum rantai persetujuan untuk menjamin non-repudiation. | 
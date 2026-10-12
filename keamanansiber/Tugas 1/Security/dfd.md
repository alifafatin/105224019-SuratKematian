 Data Flow Diagram (DFD) - Sistem Surat Kematian Digital

```mermaid
graph TD
    subgraph TB1 [TB1: Public Internet Zone]
        E1[Pelapor / Warga]
        E2[RT / RW]
        E3[Petugas Dukcapil]
    end

    subgraph TB2 [TB2: Application Server Zone]
        P1[P1: Auth Service - OTP WA/Email]
        P2[P2: Module Input & Encryption Data Almarhum]
        P3[P3: Auto-Routing Engine RT/RW by KTP Address]
        P4[P4: Verifikasi & Digital Signing RT/RW Module]
        P5[P5: Dukcapil Verification & Certificate Generator]
    end

    subgraph TB3 [TB3: Secure Storage Zone]
        DS1[(DS1: PostgreSQL - Encrypted Data & Logs)]
        DS2[(DS2: Object Storage - Encrypted Documents)]
        DS3[(DS3: Key Vault - Private Keys & Secrets)]
    end

    E1 -- "F1: Input No WA/Email" --> P1
    P1 -- "F2: Kirim OTP" --> E1
    E1 -- "F3: Form Data Almarhum + Upload Scan KTP/Surat RS" --> P2
    P2 -- "F4: Enkripsi Data (AES-256)" --> DS1
    P2 -- "F5: Simpan File Scan Terenkripsi" --> DS2
    P2 -- "F6: Alamat KTP Almarhum" --> P3
    P3 -- "F7: Match Alamat -> WA Notifikasi RT/RW" --> E2
    
    E2 -- "F8: Login & Cek Dashboard RT/RW" --> P4
    P4 -- "F9: Pull Private Key RT/RW" --> DS3
    P4 -- "F10: Digital Sign Approval + Simpan Draft" --> DS1
    
    P4 -- "F11: Auto Forward Berkas" --> P5
    E3 -- "F12: Petugas Dukcapil Verifikasi Berkas" --> P5
    P5 -- "F13: Terbitkan Surat Kematian Resmi" --> DS1
    
    E1 -- "F14: Sesi Download + Input Auth 4-Digit NIK" --> P5
    P5 -- "F15: Dekripsi & Download Surat Kematian" --> E1
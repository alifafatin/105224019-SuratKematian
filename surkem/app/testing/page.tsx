const scenarios = [
  {
    id: 'P-01',
    category: 'CRUD Profil',
    goal: 'Membuat profil warga dengan data sintetis.',
    steps: 'Buka /login-warga, isi nama dan telepon sintetis, setujui penyimpanan, lalu kirim.',
    expected: 'Profil tersimpan di WargaProfile dan sesi mengarah ke halaman pengajuan.',
  },
  {
    id: 'P-02',
    category: 'CRUD Profil',
    goal: 'Membaca profil yang tersimpan.',
    steps: 'Buka /profil-warga setelah membuat profil.',
    expected: 'Nama dan nomor telepon dimuat kembali dari PostgreSQL.',
  },
  {
    id: 'P-03',
    category: 'CRUD Profil',
    goal: 'Memperbarui profil warga.',
    steps: 'Ubah nama di /profil-warga lalu simpan dan muat ulang halaman.',
    expected: 'Nama baru tetap tersimpan dan ditampilkan setelah halaman dimuat ulang.',
  },
  {
    id: 'P-04',
    category: 'CRUD Profil',
    goal: 'Menghapus profil warga.',
    steps: 'Pilih Hapus Profil dan konfirmasi.',
    expected: 'Profil hilang dari WargaProfile dan sesi warga berakhir.',
  },
  {
    id: 'A-01',
    category: 'CRUD Pengajuan',
    goal: 'Membuat pengajuan surat kematian.',
    steps: 'Isi /pengajuan dengan identitas dan dokumen bernama sintetis, setujui pemrosesan, lalu kirim.',
    expected: 'Pengajuan tersimpan di DeathReport dengan nomor registrasi baru.',
  },
  {
    id: 'A-02',
    category: 'CRUD Pengajuan',
    goal: 'Membaca daftar dan detail pengajuan.',
    steps: 'Buka dashboard petugas dan halaman detail nomor registrasi yang dibuat.',
    expected: 'Data pengajuan berasal dari database dan sesuai dengan input tersimpan.',
  },
  {
    id: 'A-03',
    category: 'CRUD Pengajuan',
    goal: 'Memperbarui status pengajuan.',
    steps: 'Lakukan tindakan persetujuan yang tersedia pada dashboard petugas.',
    expected: 'Status terbaru tersimpan di DeathReport dan tampil pada daftar/detail.',
  },
  {
    id: 'A-04',
    category: 'CRUD Pengajuan',
    goal: 'Menghapus pengajuan.',
    steps: 'Hapus pengajuan sintetis dari dashboard dan konfirmasi.',
    expected: 'Baris dengan nomor registrasi tersebut tidak lagi ada di DeathReport.',
  },
  {
    id: 'R-01',
    category: 'Relasi Data',
    goal: 'Menghubungkan profil warga dengan pengajuan.',
    steps: 'Buat profil warga, lalu kirim pengajuan dengan metode WhatsApp dan nomor yang sama.',
    expected: 'DeathReport.reporterProfileId mengacu pada WargaProfile yang sesuai.',
  },
  {
    id: 'R-02',
    category: 'Relasi Data',
    goal: 'Memastikan penghapusan profil menjaga pengajuan.',
    steps: 'Hapus profil yang sudah terkait dengan pengajuan sintetis.',
    expected: 'Pengajuan tetap tersimpan dan reporterProfileId menjadi NULL (onDelete: SetNull).',
  },
  {
    id: 'V-01',
    category: 'Validasi Server',
    goal: 'Menolak nama profil yang hanya berisi spasi.',
    steps: 'Kirim nama berisi spasi dan telepon sintetis yang valid melalui form login warga.',
    expected: 'Server menolak penyimpanan dan menampilkan “Nama minimal 3 karakter” pada field nama.',
  },
  {
    id: 'V-02',
    category: 'Validasi Server',
    goal: 'Menolak nama profil yang terlalu pendek.',
    steps: 'Kirim nama dua karakter dan telepon sintetis yang valid melalui form login warga.',
    expected: 'Server menolak penyimpanan dan menampilkan pesan minimal nama pada field nama.',
  },
  {
    id: 'V-03',
    category: 'Validasi Server',
    goal: 'Menolak nomor telepon di luar rentang.',
    steps: 'Kirim nama valid dan telepon sintetis 16 digit melalui form login warga.',
    expected: 'Server menolak penyimpanan dan menampilkan “Nomor telepon harus terdiri dari 8–15 digit” pada field telepon.',
  },
] as const;

export default function TestingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
          Surkem · Milestone 2
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
          Skenario Pengujian
        </h1>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-700">
          Skenario berikut mencakup CRUD profil warga dan pengajuan, dua relasi data,
          serta tiga penolakan validasi server. Gunakan hanya data sintetis. Status dan
          hasil aktual belum diisi karena harus dicatat setelah skenario dijalankan pada
          database PostgreSQL yang dikonfigurasi.
        </p>
      </header>

      <section
        aria-label="Status pengujian"
        className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
      >
        <h2 className="font-bold">Status: belum dijalankan</h2>
        <p className="mt-1">
          Catat hasil aktual setiap skenario dan ubah status menjadi Lulus atau Gagal
          setelah verifikasi pada antarmuka serta PostgreSQL. Dari 13 skenario, minimal
          12 harus lulus agar mencapai ambang 90% setelah pembulatan ke atas.
        </p>
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Tujuan, langkah, hasil yang diharapkan, hasil aktual, dan status pengujian Surkem.
          </caption>
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              <th scope="col" className="px-4 py-3">ID / Jenis</th>
              <th scope="col" className="px-4 py-3">Tujuan</th>
              <th scope="col" className="px-4 py-3">Langkah</th>
              <th scope="col" className="px-4 py-3">Hasil yang diharapkan</th>
              <th scope="col" className="px-4 py-3">Hasil aktual</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {scenarios.map((scenario) => (
              <tr key={scenario.id} className="align-top">
                <th scope="row" className="whitespace-nowrap px-4 py-3 font-semibold">
                  <span className="block">{scenario.id}</span>
                  <span className="mt-1 block text-xs font-normal text-slate-600">
                    {scenario.category}
                  </span>
                </th>
                <td className="px-4 py-3">{scenario.goal}</td>
                <td className="px-4 py-3">{scenario.steps}</td>
                <td className="px-4 py-3">{scenario.expected}</td>
                <td className="px-4 py-3 text-slate-600">Belum dijalankan.</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    Belum diuji
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-600">
        Untuk membuktikan persistensi, periksa tabel WargaProfile dan DeathReport pada
        Prisma Studio atau SQL setelah operasi dilakukan; muat ulang halaman untuk
        memastikan data tetap konsisten.
      </p>
    </main>
  );
}

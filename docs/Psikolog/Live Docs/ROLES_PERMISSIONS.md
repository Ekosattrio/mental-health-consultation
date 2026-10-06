# Roles and Permissions

## Hierarki Role

Urutan kewenangan dari paling tinggi:

1. Psikolog / Super Admin / Pengelola
2. Admin
3. Pasien / Pengguna

Catatan penting: psikolog adalah pemilik/pengelola utama company/praktik. Admin bukan role tertinggi; admin lebih fokus ke operasional, verifikasi, dan pemantauan.

## GUEST

Boleh:

- melihat landing page
- melihat daftar psikolog dan paket layanan resmi (nominal tarif disembunyikan sebelum sign in akun)
- membuka modal masuk akun (single email login tanpa form register terpisah / Google SSO)

Tidak boleh:

- melihat nominal tarif paket sebelum masuk akun
- memilih paket konsultasi atau membuat booking final
- mengakses dashboard pasien/psikolog/admin
- melihat data klinis

## PATIENT / PENGGUNA

Boleh:

- melihat dashboard pasien
- melengkapi data diri pasien (Nama, No HP/WA, Tanggal Lahir, Gender, Domisili, Pekerjaan, Kontak Darurat)
- memilih paket konsultasi setelah data diri terverifikasi lengkap (`isProfileComplete: true`)
- mengisi formulir keluhan pre-test sebelum reservasi jadwal
- melakukan booking konsultasi dengan membayar DP sesuai konfigurasi paket
- mencantumkan nama pemilik rekening pengirim transfer (`transferSenderName`), nomor referensi, dan mengunggah bukti transfer
- menyetujui informed consent & kebijakan privasi sebelum booking
- melihat invoice/kwitansi pembayaran miliknya
- melihat status booking dan riwayat mutasi pembayaran miliknya
- mengajukan reschedule mandiri dengan tanggal pengganti minimal H+1
- melihat riwayat konsultasi miliknya
- memberi review ulasan setelah sesi konsultasi selesai

Tidak boleh:

- memilih paket jika data diri belum lengkap (status locked)
- booking untuk hari yang sama (minimal H+1)
- reschedule langsung untuk hari yang sama
- mengambil slot yang sudah tidak tersedia
- melihat data pasien lain
- mengakses dashboard admin atau psikolog

## PSYCHOLOGIST / SUPER ADMIN / PENGELOLA

Boleh:

- melihat dashboard psikolog/pengelola
- mengunggah dan mengganti foto profil wajah psikolog
- mengelola paket konsultasi (CRUD paket, kategori, sesi tunggal vs rawat jalan berkelanjutan)
- melihat analytics dan laporan uang masuk/arus kas
- mengelola profil praktik (STR, SIP, biografi, pendekatan terapi)
- mengatur jadwal mingguan, hari libur praktik, dan jam kerja
- mengatur kuota kapasitas harian dan kuota khusus tanggal tertentu (*custom date override*)
- melihat seluruh data rekam medis pasien (triage risiko, pre-test, profil pasien, riwayat booking)
- mengelola Paket Berjalan / Rencana Terapi untuk paket multi-sesi
- menjadwalkan sesi lanjutan, menandai sesi selesai, tidak hadir, batal, atau menghentikan paket berjalan
- export/backup data klinis dengan perlindungan role dan audit log
- mencetak jadwal dan rekapitulasi keuangan ber-Kop Surat Dinas Resmi (PDF & Excel)
- mengelola CMS landing page dan konten sistem

Tidak boleh:

- membuat perubahan yang melanggar privasi data pasien
- membuka akses data sensitif tanpa kebutuhan operasional/klinis yang sah

## ADMIN

Boleh:

- memantau akun user secara strictly **Read-Only Monitoring** (melihat nama, kontak, dan status registrasi)
- melihat seluruh data reservasi janji temu
- melayani pendaftaran reservasi pasien langsung yang datang ke klinik (walk-in booking)
- membantu pasien melakukan verifikasi bukti transfer DP sesuai paket dan pencatatan mutasi tanpa melihat nominal tagihan
- mencatat nominal pelunasan aktual yang diterima satu kali tanpa melihat harga paket/sisa tagihan; nominal disembunyikan kembali setelah tersimpan
- mengubah status booking dari `PENDING` ke `CONFIRMED`
- membantu reschedule jadwal pasien; identitas admin dan alasan perubahan wajib masuk audit trail
- memantau status `COMPLETED` setelah psikolog menandai sesi selesai
- memoderasi ulasan pasien (menyetujui atau menolak ulasan)

Tidak boleh:

- menjadi role tertinggi di sistem
- membuat, mengedit, menghapus, atau memblokir akun pengguna (admin dilarang melakukan modifikasi akun user di luar reservasi walk-in)
- menandai konsultasi selesai; status selesai hanya dilakukan oleh psikolog/pengelola setelah sesi selesai
- membatalkan, menghapus, menandai no-show, atau menghentikan paket; perubahan jadwal hanya boleh melalui alur reschedule yang tercatat
- mencetak jadwal operasional/rekap dinas resmi
- mengelola CMS utama praktik psikolog
- mengakses atau mengubah laporan uang masuk milik psikolog/owner praktik
- membaca kembali nominal pelunasan dari tabel, detail, atau receipt admin setelah transaksi disimpan
- mengakses data klinis sensitif di luar kebutuhan pemantauan operasional yang diizinkan

## Catatan Akses

- Hak akses laporan mengikuti role.
- Data pre-test, pembayaran, dan booking tersimpan di database dan harus dilindungi.
- Akses admin ke data klinis harus dibatasi berdasarkan kebutuhan operasional dan audit.

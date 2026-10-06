# TODO

## Prioritas 0 - Konfirmasi dan Keputusan

- Rapikan nama package dari `react-example` menjadi nama project. [DONE - frontend package renamed]
- Review isi `tsc_errors.txt`.
- Putuskan backend stack final. Kandidat kuat: Laravel API + React frontend.
- Tentukan database yang dipakai.
- Tentukan strategi Google SSO.
- Finalkan role permission:
  - psikolog/super admin/pengelola sebagai role tertinggi
  - admin sebagai operasional/verifikasi
  - pasien/pengguna sebagai user layanan
- Tentukan mekanisme locking slot booking agar tidak double booking.
- Scope tes sudah diputuskan: hanya pre-test profiling untuk booking, tidak ada test psikolog tambahan aktif. [DONE]
- Konfirmasi apakah review pasien wajib hanya setelah status konsultasi `COMPLETED`.
- Konfirmasi detail format laporan PDF/Excel.
- Konfirmasi apakah pembayaran DP/pelunasan cukup upload bukti manual atau perlu payment gateway.

## Prioritas 1 - Backend dan Database

- Buat schema database awal.
- Pisahkan mock data dari service API (`src/services/api/` sudah disiapkan).
- Buat autentikasi Google SSO dan login email/password via Laravel Sanctum & Socialite.
- Buat authorization berdasarkan role terbaru (Psikolog Owner, Admin Operasional, Pasien).
- Buat endpoint user dan kelengkapan data diri (`/patients/me/profile`).
- Buat endpoint paket layanan dinamis (`/packages`).
- Buat endpoint upload dan kelola foto profil wajah psikolog.
- Buat endpoint booking/appointment.
- Buat validasi booking minimal H+1.
- Buat validasi reschedule minimal H+1 (24 jam sebelum sesi).
- Buat mekanisme anti double booking/slot locking.
- Buat endpoint hari libur dan kuota override psikolog.
- Buat endpoint pre-test keluhan sebagai syarat booking.
- Buat endpoint upload bukti pembayaran transfer DP Flat Rp 100.000 dan pencatatan nama pengirim.
- Tambahkan pencatatan metode/channel bayar dan nomor referensi pembayaran pada endpoint pembayaran.
- Buat endpoint verifikasi pembayaran oleh admin.
- Buat endpoint invoice/kwitansi pembayaran yang bisa dicetak ulang.
- Buat entity dan endpoint `treatment_plans` untuk paket multi-sesi.
- Buat endpoint psikolog untuk menjadwalkan sesi lanjutan per treatment plan dengan idempotency key.
- Buat endpoint psikolog untuk menandai sesi selesai/no-show/batal dan memperbarui progres treatment plan.
- Buat endpoint discontinue paket berjalan oleh psikolog/pengelola.
- Buat endpoint consent/privacy dan simpan persetujuan pasien.
- Buat endpoint notifikasi WhatsApp/email:
  - booking pending
  - pembayaran dikonfirmasi
  - jadwal sesi
  - reschedule
  - reminder harian psikolog berisi jadwal dan ringkasan profil/pre-test pasien
- Buat endpoint export/backup data klinis khusus psikolog/pengelola.
- Buat endpoint perubahan status booking:
  - `PENDING` ke `CONFIRMED`
  - `CONFIRMED` ke `COMPLETED` khusus psikolog/pengelola
  - cancellation jika diperlukan, bukan aksi admin operasional
- Buat endpoint bantuan booking oleh admin untuk pasien datang langsung (walk-in booking).
- Buat endpoint moderasi review.
- Buat endpoint laporan dan export PDF/Excel.
- Buat audit log untuk perubahan penting.

## Prioritas 2 - Frontend Umum

- Audit responsive layout. [DONE - bug horizontal overflow diatasi]
- Audit accessibility dasar. [DONE]
- Pastikan dashboard tiap role tidak saling bocor akses. [DONE]
- Buat sidebar dashboard bisa collapse menjadi ikon. [DONE - pasien, psikolog, admin, dan tersinkronisasi via Navbar]
- Tombol sidebar collapse di Navbar otomatis hilang pada Landing Page Guest. [DONE]
- Rombak seluruh modal ke desain Modern Simple Light. [DONE]
- Ganti switcher akun demo lama menjadi login email/password nyata + Google SSO + chip Akses Cepat Testing. [DONE]
- Eliminasi total halaman Blueprint internal. [DONE]
- Sembunyikan Footer di seluruh dashboard, hanya tampil di Landing Page. [DONE]

## Landing Page

- Hapus klaim organisasi/lembaga yang belum valid dari landing page. [DONE - klaim praktik Kemenkes dihapus]
- Tambahkan carousel pengalaman/testimoni konseling sekitar 10 item. [DONE]
- Buat carousel bisa auto-play dan bisa digerakkan manual. [DONE]
- Sembunyikan nominal harga paket sebelum pengguna sign in akun. [DONE]
- Tampilkan 15 paket resmi klien (Konseling, Asesmen, Psikoterapi). [DONE]
- Tambahkan media sosial/Instagram di footer. [DONE]

## Dashboard Pasien

- Rapikan flow booking terpadu (Jadwal -> Keluhan Pre-Test -> DP Flat Rp 100.000). [DONE]
- Pasien wajib melengkapi data diri sebelum bisa memilih paket (`isProfileComplete`). [DONE]
- Pastikan pasien tidak bisa booking hari yang sama (minimal H+1). [DONE]
- Pengajuan reschedule mandiri minimal H-1 dengan validasi slot. [DONE]
- Upload bukti transfer DP Flat Rp 100.000 dan nama pengirim. [DONE]
- Input nomor referensi pembayaran dan tampilkan di invoice/kwitansi. [DONE]
- Consent & privacy sebelum booking final. [DONE]
- Tampilkan jadwal dan riwayat berformat Data Table rapi dengan modal detail. [DONE]
- Tampilkan invoice/kwitansi pembayaran dari riwayat pasien. [DONE]
- Tab FAQ interaktif mandiri. [DONE]

## Dashboard Psikolog / Pengelola

- Manajemen Paket Layanan (`PackagesTab`) dinamis dengan modal form, preview kartu, dan filter sesi tunggal vs rawat jalan berkelanjutan. [DONE]
- Fitur unggah, edit, dan hapus foto profil wajah psikolog (`ProfileTab`). [DONE]
- UI pengaturan jadwal mingguan, hari libur, jam kerja, dan kuota tanggal tertentu (*Custom Date Override*). [DONE]
- UI CMS management dan konfigurasi Kop Surat Dinas Resmi. [DONE]
- Rekam medis data pasien modern berstandar klinis (`PatientDetailModal`). [DONE]
- Laporan keuangan uang masuk / arus kas dengan filter Bulan & Tahun. [DONE]
- Ekspor Dokumen Cetak Kop Surat Resmi A4 Multi-page PDF dan Excel Spreadsheet. [DONE]
- Aksi Riwayat Sesi psikolog memakai icon button untuk complete sesi dan jadwalkan sesi lanjutan. [DONE]
- Mock logic paket multi-sesi: appointment lanjutan dibuat bertahap oleh psikolog setelah sesi sebelumnya selesai. [DONE]
- Tab khusus Paket Berjalan / Rencana Terapi untuk paket multi-sesi. [DONE]
- Aksi psikolog untuk selesai, no-show, batal, dan jadwalkan sesi lanjutan. [DONE]
- Export data klinis pasien dari tabel pasien psikolog. [DONE]

## Dashboard Admin

- Batasi dashboard admin strictly Read-Only Monitoring untuk akun user (dilarang edit/blokir user). [DONE]
- Monitoring reservasi booking. [DONE]
- Buat alur admin melayani walk-in booking pasien yang datang langsung ke klinik. [DONE]
- Verifikasi bukti transfer DP Flat Rp 100.000 dan pencatatan mutasi kasir. [DONE]
- Cabut aksi cancel/batal/hapus dari dashboard admin; admin hanya konfirmasi pembayaran. [DONE]
- Hak cetak jadwal operasional admin dicabut; cetak/rekap resmi berada di psikolog/pengelola. [DONE]
- Aksi admin ubah booking `PENDING` ke `CONFIRMED`; penyelesaian `COMPLETED` dipindahkan ke psikolog. [DONE]
- Admin tidak memiliki aksi cancel/no-show/discontinue; hanya konfirmasi pembayaran/booking. [DONE]
- Redesain Card Metrik Moderasi Ulasan Terpadu (Rating Breakdown Bar & Status Pills). [DONE]

## Laporan dan Export

- Filter rentang waktu dan periode dinamis. [DONE]
- Dokumen Cetak Kop Surat Dinas Resmi A4 Multi-Page siap cetak. [DONE]
- Ekspor berkas spreadsheet Excel (.xls) dengan formula header. [DONE]
- Buat laporan booking.
- Buat laporan pembayaran.
- Buat laporan pasien/user jika diperlukan.
- Buat export PDF.
- Buat export Excel.
- Pastikan akses laporan mengikuti role.

## Dokumentasi

- Lengkapi API contract setelah backend dipilih.
- Lengkapi database schema setelah database dipilih.
- Update `docs/ROLES_PERMISSIONS.md` jika ada perubahan role.
- Update `docs/BUSINESS_RULES.md` jika ada perubahan aturan booking/pembayaran.
- Update `docs/KNOWN_ISSUES.md` saat menemukan gap dari prototype.
- Update changelog setiap perubahan signifikan.

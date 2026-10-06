# Features

## Landing Page & Footer

- Hero dan informasi kredensial layanan psikolog.
- Daftar paket konsultasi resmi (15 paket: Konseling, Asesmen, Psikoterapi).
- **Penyembunyian Harga Awal**: Nominal tarif disembunyikan sebelum pengguna sign in akun.
- Filter kategori paket (Semua, Konseling, Asesmen, Psikoterapi).
- CTA booking dan pre-test profiling yang terintegrasi dengan auth dan kelengkapan data diri.
- Section pengalaman/testimoni konseling dibuat carousel sekitar 10 item, bergerak otomatis dan bisa dikontrol manual.
- Profil biografi psikolog klinis dengan legalitas STR dan SIP.
- **Kondisional Footer**: Footer hanya muncul di Landing Page (tamu/guest) dan otomatis disembunyikan saat pengguna berada di dalam dashboard.

## Auth

- Autentikasi menggunakan Email dan Kata Sandi nyata.
- Dukungan tombol login Google SSO OAuth (siap Laravel Socialite).
- Tombol chip **Akses Cepat Testing** di modal login (`[🩺 Psikolog]`, `[🛡️ Admin]`, `[👤 Pasien]`) untuk mempermudah pengujian lokal.
- Formulir pendaftaran akun baru dengan data diri lengkap dan persetujuan kerahasiaan medis.

## Dashboard Pasien

- Overview ringkas dengan panduan alur konseling dan FAQ.
- **Verifikasi Data Diri Wajib**: Paket terkunci jika data diri belum lengkap (`isProfileComplete`). Pasien mengisi formulir data diri untuk membuka akses.
- Booking konsultasi dengan formulir keluhan pre-test terintegrasi.
- Upload bukti transfer DP Flat Rp 100.000 dengan wajib mencantumkan nama pemilik rekening transfer (`transferSenderName`).
- Input nomor referensi pembayaran untuk membantu validasi mutasi admin.
- Persetujuan informed consent & kebijakan privasi sebelum booking dikirim.
- Jadwal & Riwayat Konsultasi berformat Data Table rapi dengan modal detail janji temu.
- Invoice/kwitansi pembayaran dari detail riwayat pasien.
- Pengajuan reschedule mandiri minimal H-1 (24 jam sebelum sesi) dengan validasi slot.
- Pemberian rating dan ulasan setelah sesi berstatus `COMPLETED`.
- Tab FAQ interaktif mandiri.

## Dashboard Psikolog

- Overview ringkas profil dan kartu dokter.
- **Upload & Edit Foto Profil Wajah**: Psikolog dapat mengunggah, mengganti, atau menghapus foto profil wajah yang otomatis tampil di seluruh platform.
- **Manajemen Paket Konsultasi (`PackagesTab`)**: Data Table paket layanan dinamis dengan filter, tombol switch on/off status aktif, modal pratinjau kartu paket, serta modal tambah/edit paket (mendukung sesi tunggal maupun rawat jalan berkelanjutan).
- Manajemen Jadwal Mingguan (Senin - Minggu) dengan segmented button buka/libur.
- Penyesuaian kuota kapasitas harian dan cuti dadakan tanggal khusus (*Custom Date Override*).
- Data Pasien berformat tabel rekam medis dengan modal *PatientDetailModal* (triage risiko visual, chips keluhan pre-test, profil pasien, dan riwayat sesi).
- Tab khusus **Paket Berjalan / Rencana Terapi** berbentuk tabel operasional untuk memantau paket multi-sesi, progres sesi, jadwal sesi berikutnya, serta aksi jadwalkan sesi lanjutan.
- Psikolog/pengelola dapat menandai sesi selesai, tidak hadir, batal, atau menghentikan paket berjalan sesuai kebijakan praktik.
- Laporan Keuangan Uang Masuk / Arus Kas dengan filter Bulan & Tahun responsif.
- Ekspor Dokumen Cetak Kop Surat Dinas Resmi (A4 Multi-page PDF) dan Berkas Excel Spreadsheet (.xls).
- Export data klinis pasien untuk owner/psikolog.
- CMS Management konfigurasi teks landing page, kebijakan praktik, dan data kop surat resmi.

## Dashboard Admin

- **Monitoring Akun Pengguna (Strict Read-Only)**: Admin memantau user yang terdaftar tanpa wewenang mengubah atau memblokir akun.
- **Walk-In Booking**: Melayani pembuatan booking langsung bagi pasien yang datang ke klinik secara offline.
- Verifikasi bukti transfer DP Flat Rp 100.000 dan nama pengirim transfer.
- Perubahan status booking dari `PENDING` ke `CONFIRMED`; status `COMPLETED` ditandai manual oleh psikolog.
- Admin tidak memiliki aksi batal/hapus reservasi dari tabel booking.
- **Moderasi Ulasan Terpadu**: Card metrik skor rating 4.7/5.0, rating breakdown progress bar interaktif, filter pills status, serta modal baca ulasan utuh.

## Booking & Alur Reservasi

- Booking minimal H+1 dari tanggal pembuatan booking.
- Reschedule minimal H+1 (24 jam sebelum sesi).
- Penguncian slot dinamis berdasarkan durasi paket dan jam operasional.
- Hari libur psikolog otomatis menutup pemesanan.

## Pembayaran

- Upload bukti transfer pembayaran DP Flat Rp 100.000 (biaya administrasi).
- Wajib mencantumkan nama pemilik rekening pengirim (`transferSenderName`).
- Pelunasan sisa biaya paket dilakukan saat pasien hadir di klinik.
- Verifikasi dan mutasi tercatat pada dashboard admin dan laporan keuangan psikolog.

## UI / UX

- Desain seluruh modal terstandarisasi **Modern Simple Light** (header putih bersih, border soft, icon container pastel teal).
- Tombol **Sidebar Collapse Toggle** di Navbar atas yang tersinkronisasi global, dan otomatis disembunyikan pada Landing Page.
- Tipografi konsisten 100% menggunakan font *Plus Jakarta Sans*.
- Proteksi `overflow-x: hidden` dan wrapper tabel responsif lokal untuk mencegah layar bergeser ke samping.

## Tahap Menuju Backend Produksi

- Setup API RESTful Laravel 12++ (`src/services/api/`).
- Skema database relasional (PostgreSQL 16+ / MySQL 8.0+).
- Autentikasi Laravel Sanctum & Laravel Socialite Google SSO.
- Endpoint upload file bukti transfer ke storage cloud.
- Validasi slot server-side anti-double booking.
- Notifikasi WhatsApp/email untuk booking, pembayaran, jadwal, reschedule, dan reminder harian psikolog.
- Invoice/kwitansi backend serta halaman consent/privacy.

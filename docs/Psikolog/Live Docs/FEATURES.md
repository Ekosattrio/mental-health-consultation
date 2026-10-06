# Features

## Landing Page & Footer

- Hero dan informasi kredensial layanan psikolog.
- Daftar paket konsultasi dinamis berdasarkan paket aktif yang dikelola psikolog (Konseling, Asesmen, Psikoterapi).
- **Penyembunyian Harga Awal**: Nominal tarif disembunyikan sebelum pengguna sign in akun.
- Filter kategori paket (Semua, Konseling, Asesmen, Psikoterapi).
- CTA booking dan pre-test profiling yang terintegrasi dengan auth dan kelengkapan data diri.
- Section pengalaman/testimoni konseling dibuat carousel sekitar 10 item, bergerak otomatis dan bisa dikontrol manual.
- Profil biografi psikolog klinis dengan legalitas STR dan SIP.
- **Kondisional Footer**: Footer hanya muncul di Landing Page (tamu/guest) dan otomatis disembunyikan saat pengguna berada di dalam dashboard.

## Auth

- Login email/password dan Google SSO tersedia sebagai flow frontend; autentikasi nyata menunggu Laravel Sanctum/Socialite.
- Dukungan tombol login Google SSO OAuth (siap Laravel Socialite).
- Tombol chip **Akses Cepat Testing** di modal login (`[🩺 Psikolog]`, `[🛡️ Admin]`, `[👤 Pasien]`) untuk mempermudah pengujian lokal.
- Formulir pendaftaran akun baru dengan data diri lengkap dan persetujuan kerahasiaan medis.

## Dashboard Pasien

- Overview ringkas dengan panduan alur konseling dan FAQ.
- **Verifikasi Data Diri Wajib**: Paket terkunci jika data diri belum lengkap (`isProfileComplete`). Pasien mengisi formulir data diri untuk membuka akses.
- Booking konsultasi dengan formulir keluhan pre-test terintegrasi.
- Upload bukti transfer DP sesuai konfigurasi paket dengan wajib mencantumkan nama pemilik rekening transfer (`transferSenderName`).
- Potongan harga paket dari psikolog/pengelola sebelum pembayaran DP, dengan total tagihan, DP, dan sisa pelunasan yang ikut berubah otomatis.
- Input nomor referensi pembayaran untuk membantu validasi mutasi admin.
- Persetujuan informed consent & kebijakan privasi sebelum booking dikirim.
- Jadwal & Riwayat Konsultasi berformat Data Table rapi dengan modal detail janji temu.
- Invoice/kwitansi pembayaran dari detail riwayat pasien.
- Pengajuan reschedule mandiri dengan tanggal pengganti minimal H+1 dan validasi slot.
- Pemberian rating dan ulasan setelah sesi berstatus `COMPLETED`.
- Tab FAQ interaktif mandiri.

## Dashboard Psikolog

- Overview ringkas profil dan kartu dokter.
- **Upload & Edit Foto Profil Wajah**: Psikolog dapat mengunggah, mengganti, atau menghapus foto profil wajah yang otomatis tampil di seluruh platform.
- **Manajemen Paket Konsultasi (`PackagesTab`)**: Data Table paket layanan dinamis dengan filter, tombol switch on/off status aktif, modal pratinjau kartu paket, serta modal tambah/edit paket (mendukung sesi tunggal maupun rawat jalan berkelanjutan).
- Manajemen Jadwal Mingguan (Senin - Minggu) dengan segmented button buka/libur.
- Penyesuaian kuota kapasitas harian dan cuti dadakan tanggal khusus (*Custom Date Override*).
- Data Pasien berformat tabel rekam medis dengan modal *PatientDetailModal* (triage risiko visual, chips keluhan pre-test, profil pasien, dan riwayat sesi).
- Tab khusus **Paket Berjalan / Rencana Terapi** berbentuk tabel operasional untuk memantau paket multi-sesi, progres sesi, jadwal sesi berikutnya, pembayaran paket, sisa pelunasan, serta aksi jadwalkan sesi lanjutan.
- Psikolog/pengelola dapat menandai sesi selesai, tidak hadir, batal, atau menghentikan paket berjalan sesuai kebijakan praktik.
- Laporan Keuangan Uang Masuk / Arus Kas dengan filter Bulan & Tahun responsif.
- Ekspor Dokumen Cetak Kop Surat Dinas Resmi (A4 Multi-page PDF) dan Berkas Excel Spreadsheet (.xls).
- Export data klinis pasien untuk owner/psikolog.
- CMS Management konfigurasi teks landing page, kebijakan praktik, dan data kop surat resmi.

## Dashboard Admin

- **Monitoring Akun Pengguna (Strict Read-Only)**: Admin memantau user yang terdaftar tanpa wewenang mengubah atau memblokir akun.
- **Walk-In Booking**: Melayani pembuatan booking langsung bagi pasien yang datang ke klinik secara offline.
- Walk-in booking admin mendukung pilihan metode pembayaran cash/bank/QRIS/EDC, nama pengirim, bank, dan nomor referensi tanpa menampilkan nominal harga.
- Field pemilihan psikolog di form admin disembunyikan karena praktik saat ini memakai psikolog/pengelola utama sebagai penanggung jawab default.
- Admin tidak mengatur atau melihat harga paket, potongan, dan sisa tagihan. Admin dapat memasukkan nominal pelunasan yang benar-benar diterima satu kali; setelah disimpan nominal disembunyikan dari portal admin.
- Admin dapat membantu reschedule jadwal pasien memakai tombol ikon kalender, dengan audit siapa yang mengubah jadwal.
- Admin dapat print/screenshot receipt administratif setelah konfirmasi pembayaran tanpa menu kwitansi terpisah dan tanpa menampilkan nominal harga.
- Verifikasi bukti pembayaran dan nama pengirim transfer tanpa menampilkan nominal harga di panel admin.
- Perubahan status booking dari `PENDING` ke `CONFIRMED`; status `COMPLETED` ditandai manual oleh psikolog.
- Admin tidak memiliki aksi batal/hapus reservasi dari tabel booking.
- **Moderasi Ulasan Terpadu**: Card metrik skor rating 4.7/5.0, rating breakdown progress bar interaktif, filter pills status, serta modal baca ulasan utuh.

## Booking & Alur Reservasi

- Booking minimal H+1 dari tanggal pembuatan booking.
- Tanggal baru reschedule minimal H+1 dari hari pengajuan.
- Penguncian slot dinamis berdasarkan durasi paket dan jam operasional.
- Frontend memakai Web Locks API dengan fallback lock LocalStorage per psikolog/tanggal, sinkronisasi antar-tab, dan pengecekan ulang state terbaru saat booking/reschedule/sesi lanjutan. Booking juga memvalidasi ulang durasi serta identitas slot terhadap paket, psikolog, tanggal, dan jam.
- Hari libur psikolog otomatis menutup pemesanan.

## Pembayaran

- Upload bukti transfer pembayaran DP sesuai konfigurasi paket.
- Potongan harga dari psikolog/pengelola dihitung sebelum DP. Sistem menyimpan `subtotalAmount`, `discountCode`, `discountLabel`, `discountAmount`, `totalAmount`, `dpAmount`, dan `remainingAmount`.
- Form tambah/edit paket menyediakan aksi eksplisit untuk menambahkan, mengubah, dan menghapus diskon paket, termasuk pratinjau harga awal, nominal diskon, dan harga akhir.
- Wajib mencantumkan nama pemilik rekening pengirim (`transferSenderName`).
- Pelunasan sisa biaya paket dilakukan saat pasien hadir di klinik.
- Pencatatan pelunasan admin memperbarui status menjadi `PAID` tanpa otomatis mengubah status konsultasi menjadi `COMPLETED`.
- Guard role frontend menolak admin mengubah status sesi selain `CONFIRMED`; status selesai/batal/no-show tetap kewenangan psikolog. Pencatatan pelunasan hanya diterima saat role aktif adalah admin.
- Verifikasi dan mutasi tercatat pada dashboard admin dan laporan keuangan psikolog.

## UI / UX

- Desain seluruh modal terstandarisasi **Modern Simple Light** (header putih bersih, border soft, icon container pastel teal).
- Tombol **Sidebar Collapse Toggle** di Navbar atas yang tersinkronisasi global, dan otomatis disembunyikan pada Landing Page.
- Tipografi konsisten 100% menggunakan font *Plus Jakarta Sans*.
- Proteksi `overflow-x: hidden` dan wrapper tabel responsif lokal untuk mencegah layar bergeser ke samping.

## Tahap Menuju Backend Produksi

- Service client REST Laravel 12+ sudah tersedia di `src/services/api/`; implementasi backend masih menunggu.
- Skema database produksi menggunakan MySQL 8.0+.
- Autentikasi Laravel Sanctum & Laravel Socialite Google SSO.
- Endpoint upload file bukti transfer ke storage cloud.
- Validasi slot server-side anti-double booking.
- Notifikasi WhatsApp sebagai kanal utama untuk booking, pembayaran, jadwal, reschedule, dan reminder harian psikolog; email opsional untuk fallback/dokumen.
- Invoice/kwitansi backend serta halaman consent/privacy.

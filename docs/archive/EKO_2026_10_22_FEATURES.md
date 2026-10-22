# Arsip Eko Sebelum Integrasi - FEATURES.md

Histori prototype, bukan aturan aktif. Gunakan [keputusan final](../KEPUTUSAN_FINAL_2026_10_22.md), [kontrak web](../WEB_CONTRACT.md) dan dokumen utama di docs/.

# Features

## Pilih Layanan - 22 Oktober 2026

- Kartu layanan satu baris horizontal dengan scroll-snap, swipe, dan ikon panah. Kategori berikon/aksen, harga efektif, durasi/metode, manfaat ringkas, serta indikator pilihan tersedia.
- Notes tampil penuh tanpa membuka rincian. Notes kosong menampilkan empty state, bukan ketentuan baru. Rincian lengkap memakai dialog sehingga tidak menambah deretan kartu ke bawah.
- Pencarian nama/deskripsi/notes, filter kategori, pengurutan, dan pagination enam layanan dipertahankan. Harga/DP dan flow booking tidak berubah.
- TypeScript exit 0 dan 25/25 tes terfokus lolos; tiga tes baru berupa render statis. QA visual/interaksi browser belum dilakukan.

## Konfirmasi Manual - 22 Oktober 2026

- Keterlambatan/ketidakhadiran ditindaklanjuti manual oleh psikolog, tanpa auto-cancel. Jadwal pengganti minimal H+1 sesuai hasil konfirmasi, memakai sesi yang sama tanpa DP kedua atau tambahan jatah.
- Ikon jadwal pengganti tersedia di Riwayat Sesi dan pada sesi `NO_SHOW` di Paket Berjalan psikolog. Histori ketidakhadiran, alasan/pelaku, DP, cicilan, dan saldo tetap tersimpan; hanya psikolog yang menangani boleh memulihkan `NO_SHOW -> CONFIRMED`.
- Checkpoint terbaru: TypeScript 0 error dan 22/22 tes terfokus lolos. QA browser dan implementasi API Laravel tetap belum dilakukan.

## Perbaikan Audit FE - 21 Oktober 2026

- Mutasi workflow diserialkan, persistensi snapshot dilakukan sebelum UI sukses, dan kegagalan storage terlihat. Upgrade array lama tidak menggandakan key penyimpanan.
- Reservasi lokal sebelum rekening, pemulihan reservasi setelah refresh, pelepasan dengan konfirmasi belum membayar, dan pencocokan pembayaran setelah expiry/quote berubah. Pasien dan admin dapat melihat kasus yang belum diproses; admin menghubungkannya ke booking pengganti H+1.
- Verifikasi FULL walk-in dan tanggal penerimaan aktual, header CSRF Sanctum, jam reschedule stabil, modal/receipt terbaru berdasarkan ID, serta encoding ekspor per format.
- Checkpoint audit 21 Oktober: 17 tes regresi logika dan TypeScript checker lolos. Aturan no-show kemudian ditetapkan pada 22 Oktober (lihat pembaruan di atas); UAT browser/mobile serta integrasi Laravel tetap diperlukan.

## Pembaruan Katalog dan Flow - 21 Oktober 2026

- Pemilihan layanan: pencarian, filter Konseling/Asesmen/Psikoterapi, urutan nama/harga, pagination enam item, pilihan radio, dan rincian manfaat/notes. Harga psikoterapi tetap per sesi; proyeksi rencana awal ditampilkan pada checkout.
- Detail pasien/Paket Berjalan psikolog menampilkan terbayar dari total, sisa, dan indikator pembayaran. Admin tidak menerima akses baca nominal tersimpan.
- Walk-in memakai input penerimaan DP/FULL aktual. Verifikasi dan pembayaran lanjutan memiliki tanggal penerimaan tersendiri.
- Laporan dan export menghitung setiap penerimaan pada tanggal kas, bukan tanggal konsultasi. Data tanggal legacy tidak pasti ditandai estimasi.
- Guard harga berubah, konflik perubahan jadwal praktik termasuk hold aktif, dan audit sesi lanjutan terpisah tersedia pada mock. Service slot hold server masih kontrak; reservasi lokal prototype sudah aktif.

## Landing Page & Footer

- Hero dan informasi kredensial layanan psikolog.
- Daftar paket konsultasi dinamis berdasarkan paket aktif yang dikelola psikolog (Konseling, Asesmen, Psikoterapi), termasuk mode tatap muka dan telelayanan.
- **Penyembunyian Harga Awal**: Nominal tarif disembunyikan sebelum pengguna sign in akun.
- Filter kategori paket (Semua, Konseling, Asesmen, Psikoterapi).
- CTA booking dan pre-test profiling yang terintegrasi dengan auth dan kelengkapan data diri.
- Section pengalaman/testimoni konseling dibuat carousel sekitar 10 item, bergerak otomatis dan bisa dikontrol manual.
- Profil biografi psikolog klinis dengan legalitas STR dan SIP.
- **Kondisional Footer**: Footer hanya muncul di Landing Page (tamu/guest) dan otomatis disembunyikan saat pengguna berada di dalam dashboard.

## Auth

- Login Google masih simulasi dan akses cepat hanya untuk pengujian. Login produksi mengikuti Google SSO; tidak ada form login email/password aktif.
- Dukungan tombol login Google SSO OAuth (siap Laravel Socialite).
- Tombol chip **Akses Cepat Testing** di modal login (`[🩺 Psikolog]`, `[🛡️ Admin]`, `[👤 Pasien]`) untuk mempermudah pengujian lokal.
- Formulir pendaftaran akun baru dengan data diri lengkap dan persetujuan kerahasiaan medis.

## Dashboard Pasien

- Overview ringkas dengan panduan alur konseling dan FAQ.
- **Verifikasi Data Diri Wajib**: Paket terkunci jika data diri belum lengkap (`isProfileComplete`). Pasien mengisi formulir data diri untuk membuka akses.
- Booking konsultasi dengan formulir keluhan pre-test terintegrasi.
- Upload bukti transfer DP flat Rp100.000 dengan wajib mencantumkan nama pemilik rekening transfer (`transferSenderName`).
- Potongan harga paket dari psikolog/pengelola sebelum pembayaran DP, dengan total tagihan, DP, dan sisa pelunasan yang ikut berubah otomatis.
- Persetujuan informed consent & kebijakan privasi sebelum booking dikirim.
- Jadwal & Riwayat Konsultasi berformat Data Table rapi dengan modal detail janji temu.
- Invoice/kwitansi pembayaran dari detail riwayat pasien.
- Pengajuan reschedule mandiri dengan tanggal pengganti minimal H+1 dan validasi slot.
- Pemberian rating dan ulasan setelah sesi berstatus `COMPLETED`.
- Tab FAQ interaktif mandiri.

## Dashboard Psikolog

- Overview ringkas profil dan kartu dokter.
- **Upload & Edit Foto Profil Wajah**: Psikolog dapat mengunggah, mengganti, atau menghapus foto profil wajah yang otomatis tampil di seluruh platform.
- **Manajemen Paket Konsultasi (`PackagesTab`)**: Data Table paket layanan dinamis dengan filter, tombol switch on/off status aktif, modal pratinjau kartu paket, serta modal tambah/edit paket (mendukung tatap muka/telelayanan, sesi tunggal, dan rawat jalan berkelanjutan).
- Manajemen Jadwal Mingguan (Senin - Minggu) dengan segmented button buka/libur.
- Penyesuaian kuota kapasitas harian dan cuti dadakan tanggal khusus (*Custom Date Override*).
- Data Pasien berformat tabel rekam medis dengan modal *PatientDetailModal* (triage risiko visual, chips keluhan pre-test, profil pasien, dan riwayat sesi).
- Tab khusus **Paket Berjalan / Rencana Terapi** berbentuk tabel operasional untuk memantau rencana awal empat sesi, progres, jadwal berikutnya, dan pembayaran. Psikolog menjadwalkan sesi ke-2 sampai ke-4; setelah itu pasien membuat booking psikoterapi baru bila perlu.
- Psikolog/pengelola dapat menandai sesi selesai, tidak hadir, batal, atau menghentikan paket berjalan sesuai kebijakan praktik.
- Laporan Keuangan Uang Masuk / Arus Kas dengan filter Bulan & Tahun responsif.
- Ekspor Dokumen Cetak Kop Surat Dinas Resmi (A4 Multi-page PDF) dan Berkas Excel Spreadsheet (.xls).
- Export data klinis pasien untuk owner/psikolog.
- CMS Management konfigurasi teks landing page, kebijakan praktik, dan data kop surat resmi.

## Dashboard Admin

- **Monitoring Akun Pengguna (Strict Read-Only)**: Admin memantau user yang terdaftar tanpa wewenang mengubah atau memblokir akun.
- **Walk-In Booking**: Melayani pembuatan booking langsung bagi pasien yang datang ke klinik secara offline.
- Walk-in booking admin mendukung pilihan metode pembayaran cash/bank/QRIS/EDC, nama pengirim, dan bank/channel tanpa menampilkan nominal harga.
- Field pemilihan psikolog di form admin disembunyikan karena praktik saat ini memakai psikolog/pengelola utama sebagai penanggung jawab default.
- Admin tidak mengatur atau melihat harga paket, potongan, dan sisa tagihan. Admin dapat mencatat uang masuk setelah DP secara bertahap; nominal yang sudah disimpan disembunyikan dari portal admin.
- Admin dapat membantu reschedule jadwal pasien memakai tombol ikon kalender, dengan audit siapa yang mengubah jadwal.
- Admin dapat print/screenshot receipt administratif setelah konfirmasi pembayaran tanpa menu kwitansi terpisah dan tanpa menampilkan nominal harga.
- Modal verifikasi bukti pembayaran dengan preview gambar, tombol buka PDF, data pengirim, catatan opsional, dan audit admin tanpa checklist tambahan maupun nominal harga. Nomor referensi transaksi tidak dipakai.
- Konfirmasi booking hanya terjadi setelah verifikasi pembayaran berhasil; tidak ada jalur konfirmasi langsung yang melewati pemeriksaan bukti.
- Perubahan status booking dari `PENDING` ke `CONFIRMED`; status `COMPLETED` ditandai manual oleh psikolog.
- Admin tidak memiliki aksi batal/hapus reservasi dari tabel booking.
- **Moderasi Ulasan Terpadu**: Card metrik skor rating 4.7/5.0, rating breakdown progress bar interaktif, filter pills status, serta modal baca ulasan utuh.

## Booking & Alur Reservasi

- Booking minimal H+1 dari tanggal pembuatan booking.
- Tanggal baru reschedule minimal H+1 dari hari pengajuan.
- Penguncian slot dinamis berdasarkan durasi paket dan jam operasional.
- Frontend memakai Web Locks API dengan fallback lock LocalStorage per psikolog/tanggal, sinkronisasi antar-tab, dan pengecekan ulang state terbaru saat booking/reschedule/sesi lanjutan. Booking juga memvalidasi ulang durasi serta identitas slot terhadap paket, psikolog, tanggal, dan jam.
- Hari libur psikolog otomatis menutup pemesanan.
- Paket telelayanan memakai availability engine yang sama dan menampilkan metode sesi sebagai pengganti alamat klinik pada konfirmasi serta riwayat booking.

## Pembayaran

- Upload bukti transfer pembayaran DP flat Rp100.000.
- Potongan harga dari psikolog/pengelola dihitung sebelum total tagihan. Sistem menyimpan snapshot `subtotalAmount`, `discountCode`, `discountLabel`, `discountAmount`, `totalAmount`, DP flat pada `dpAmount`, dan `remainingAmount`.
- Form tambah/edit paket menyediakan aksi eksplisit untuk menambahkan, mengubah, dan menghapus diskon paket, termasuk pratinjau harga awal, nominal diskon, dan harga akhir.
- Wajib mencantumkan nama pemilik rekening pengirim (`transferSenderName`).
- Psikoterapi bertarif per sesi, rencana awal minimal empat sesi, dan DP Rp100.000 mengurangi biaya rencana awal. Sisa dapat dibayar sekaligus setelah sesi pertama atau bertahap sesuai kesepakatan. Bila perlu terapi lanjutan setelah sesi keempat, pasien booking lagi; tidak ada aksi tambah sesi di plan lama.
- Admin mencatat tiap pembayaran setelah DP sebagai record terpisah. Status menjadi `PAID` hanya ketika saldo nol; status konsultasi tetap diubah manual oleh psikolog.
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

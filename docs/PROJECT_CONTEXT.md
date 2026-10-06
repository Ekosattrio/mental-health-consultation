# Project Context

## Nama Project

JiwaSehat - Platform Booking Konsultasi Psikologi.

## Gambaran Umum

JiwaSehat adalah aplikasi untuk membantu pasien melakukan booking konsultasi psikologi secara terjadwal. Fokus utama aplikasi adalah booking, pre-test, pembayaran, pemantauan admin, pengelolaan jadwal oleh psikolog/pengelola, dan laporan.

Aplikasi ini bukan platform konsultasi online/chat di web. Konsultasi dilakukan berdasarkan jadwal yang dibooking, sedangkan web dipakai untuk alur administratif dan persiapan konsultasi.

## Role Utama

Hierarki role terbaru:

1. Psikolog / Super Admin / Pengelola
2. Admin
3. Pasien / Pengguna

Psikolog adalah role tertinggi karena dianggap sebagai owner/pengelola company atau praktik. Admin bukan pemilik sistem; admin bertugas membantu operasional, verifikasi, pemantauan booking, dan moderasi.

## Tujuan Produk

Membangun sistem yang mendukung:

- calon pasien melihat layanan, profil psikolog, informasi praktik, dan pengalaman/testimoni
- pengguna login/register menggunakan SSO Google
- pengguna mengisi general info saat mendaftar
- pasien mengisi pre-test sebelum bisa mengirim booking
- pasien melakukan booking minimal H+1, bukan booking hari yang sama
- pasien mengajukan reschedule minimal H+1
- admin membantu booking pasien yang datang langsung
- admin membantu pasien mengajukan reschedule jika pasien tidak paham alurnya
- admin memverifikasi pembayaran dan mengubah status booking
- psikolog/pengelola mengatur hari libur, jam kerja, dan batas jumlah pertemuan harian
- psikolog/pengelola melihat analytics keuntungan/keuangan
- psikolog/pengelola mengelola CMS
- sistem membuat laporan dan export data ke PDF/Excel

## Scope Fitur Utama

### Booking

- Pasien wajib melengkapi data diri (`isProfileComplete`) sebelum diizinkan memilih paket konsultasi.
- Pasien wajib mengisi formulir keluhan pre-test sebelum reservasi jadwal.
- Booking tidak bisa dilakukan untuk hari yang sama (minimal H+1).
- Reschedule tidak bisa dilakukan untuk hari yang sama (minimal H-1 / 24 jam sebelum sesi).
- Slot yang sudah digunakan harus mengurangi ketersediaan slot secara dinamis.
- Sistem harus mencegah double booking pada slot yang tidak tersedia.
- Psikolog dapat menentukan hari libur yang otomatis menutup booking.
- Psikolog dapat menentukan jam kerja dan kuota pasien tanggal tertentu (*Custom Date Override*).

### Pre-Test

- Pre-test keluhan terintegrasi langsung dalam wizard pemesanan konsultasi.
- Scope tes saat ini hanya **pre-test profiling** untuk membantu psikolog memahami keluhan awal pasien. Tidak ada test psikolog tambahan/DASS-21 yang aktif di portal pasien.
- Hasil pre-test hanya bisa diakses oleh psikolog penanggung jawab.

### Pembayaran

- Pasien wajib mengunggah bukti pembayaran transfer.
- Pasien wajib mencantumkan nama pemilik rekening pengirim (`transferSenderName`).
- Admin melihat dan memverifikasi bukti transfer dan nama pengirim.
- Skema pembayaran resmi: **Wajib DP Flat Rp 100.000** sebagai biaya administrasi penguncian jadwal, dan sisa biaya paket dilunasi saat hadir di klinik tatap muka.
- Riwayat pembayaran dan mutasi kas tersimpan di sistem.
- Sistem membutuhkan invoice/kwitansi yang memuat DP Rp 100.000, sisa pelunasan, metode bayar, channel bank/QRIS/cash, nama pengirim, nomor referensi, dan bukti pembayaran.

### Paket Multi-Sesi

- Paket berkelanjutan memakai halaman khusus **Paket Berjalan / Rencana Terapi** di portal psikolog.
- Isi minimum halaman: pasien, nama paket, total sesi, sesi selesai, sesi berikutnya, tombol jadwalkan sesi berikutnya, dan status aktif/selesai/dihentikan.
- Sesi ke-2 dan seterusnya dijadwalkan oleh psikolog/pengelola, bukan dibuat sekaligus saat pasien membeli paket.
- Psikolog/pengelola berwenang menandai sesi selesai, tidak hadir, dibatalkan, atau menghentikan paket.

### Notifikasi

- Notifikasi WhatsApp/email adalah tanggung jawab backend produksi.
- Event yang perlu didukung: booking pending, pembayaran dikonfirmasi, jadwal sesi, reschedule, dan reminder jadwal harian psikolog.
- Reminder ke psikolog perlu berisi nama pasien, jam mulai-selesai, keluhan/profil ringkas dari pre-test, dan tautan ke halaman detail di web.

### Consent, Privacy, dan Backup Data

- Pasien wajib menyetujui informed consent dan kebijakan privasi sebelum booking dikirim.
- Sistem perlu halaman consent/privacy yang menjelaskan kerahasiaan data, penggunaan pre-test untuk profiling awal, dan disclaimer bahwa pre-test bukan diagnosis otomatis.
- Backup/export data klinis diperlukan untuk owner/psikolog dan harus role-protected.

### Landing Page & Footer

- Landing page menampilkan informasi 15 paket resmi, profil kredensial psikolog, dan biografi.
- **Penyembunyian Tarif Awal**: Nominal harga paket disembunyikan untuk pengunjung yang belum sign in akun.
- Section pengalaman konseling dibuat carousel sekitar 10 item, bisa bergerak otomatis dan manual.
- **Kondisional Footer**: Komponen Footer hanya ditampilkan pada Landing Page (`GUEST`), dan disembunyikan sepenuhnya saat user masuk ke akun dashboard mana pun.

### Dashboard Pasien

- Panduan alur konseling dan FAQ interaktif.
- Verifikasi kelengkapan profil data diri sebelum memilih paket konsultasi.
- Pemesanan jadwal konsultasi dengan formulir keluhan pre-test dan upload DP Flat Rp 100.000.
- Jadwal & Riwayat Konsultasi berformat Data Table rapi dengan modal detail janji temu.
- Pengajuan reschedule mandiri minimal H-1 dengan validasi slot.
- Pemberian review ulasan setelah sesi konsultasi selesai.

### Dashboard Psikolog / Pengelola

- Upload dan ganti foto profil wajah psikolog yang tampil di seluruh platform.
- Manajemen Paket Konsultasi (`PackagesTab`) dinamis (CRUD paket, kategori, sesi tunggal vs rawat jalan berkelanjutan).
- Mengelola jadwal mingguan, hari libur praktik, jam kerja, dan kuota tanggal tertentu.
- Melihat laporan keuangan uang masuk / arus kas dan ekspor dokumen kop dinas resmi (PDF & Excel).
- Mengelola CMS landing page dan kop surat resmi.
- Rekam medis pasien terstandarisasi (`PatientDetailModal`).
- Halaman khusus Paket Berjalan untuk memantau rencana terapi/paket multi-sesi.
- Export data klinis pasien untuk owner/psikolog dengan perlindungan role.
- Tidak ada ruang chat konsultasi online di web.

### Dashboard Admin

- Memantau akun pengguna secara strictly **Read-Only Monitoring** (tanpa wewenang edit/blokir akun user).
- Melayani pembuatan walk-in booking bagi pasien yang hadir langsung ke klinik.
- Verifikasi bukti transfer DP Flat Rp 100.000 dan nama pengirim transfer.
- Mengubah status booking dari `PENDING` ke `CONFIRMED`; status `COMPLETED` ditandai oleh psikolog/pengelola setelah sesi selesai.
- Moderasi ulasan pasien dengan antarmuka card metrik skor terpadu.

## Kondisi Project Saat Ini

Project saat ini berupa frontend React/Vite dengan data lokal:

- UI utama berada di `src/components`
- state global berada di `src/context/AppContext.tsx`
- tipe domain berada di `src/types/index.ts`
- mock data berada di `src/data/mockData.ts`
- domain model berada di `src/models`
- controller facade berada di `src/controllers`

Belum ada backend dan database nyata yang terhubung. Frontend prototype sudah mulai disesuaikan dengan requirement terbaru, tetapi implementasi produksi masih perlu backend untuk authorization, booking lock, upload pembayaran, Google SSO, laporan, dan penyimpanan data sensitif.

## Arah Teknis

Laravel bisa digunakan bersama React.

Arah yang disarankan:

- Laravel sebagai backend API.
- React/Vite tetap sebagai frontend.
- Laravel menangani database, auth Google SSO, authorization, upload bukti pembayaran, laporan PDF/Excel, validasi booking, dan anti double booking.
- React mengonsumsi API dari Laravel.

Alternatif lain adalah Laravel + Inertia React, tetapi untuk kondisi project saat ini Laravel API + React frontend lebih mudah dilakukan secara bertahap.

## Prinsip Produk

- Aman untuk konteks kesehatan mental.
- Role dan akses harus jelas mengikuti hierarki terbaru.
- Data pre-test, pembayaran, dan data klinis harus dianggap sensitif.
- Setiap fitur klinis harus memisahkan informasi edukatif dari diagnosis medis resmi.
- Alur booking harus mudah, jelas, dan transparan soal jadwal, slot, biaya, status pembayaran, dan status booking.
- UI/UX harus nyaman untuk mobile dan desktop, termasuk sidebar yang bisa dikecilkan menjadi ikon.

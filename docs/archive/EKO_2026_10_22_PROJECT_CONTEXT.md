# Arsip Eko Sebelum Integrasi - PROJECT_CONTEXT.md

Histori prototype, bukan aturan aktif. Gunakan [keputusan final](../KEPUTUSAN_FINAL_2026_10_22.md), [kontrak web](../WEB_CONTRACT.md) dan dokumen utama di docs/.

# Project Context

## Nama Project

JiwaSehat - Platform Booking Konsultasi Psikologi.

## Gambaran Umum

JiwaSehat adalah aplikasi untuk membantu pasien melakukan booking konsultasi psikologi secara terjadwal. Fokus utama aplikasi adalah booking, pre-test, pembayaran, pemantauan admin, pengelolaan jadwal oleh psikolog/pengelola, dan laporan.

Aplikasi ini bukan platform chat konsultasi. Konsultasi dilakukan berdasarkan jadwal yang dibooking dan dapat berupa tatap muka atau telelayanan; web dipakai untuk alur administratif dan persiapan konsultasi, bukan sebagai ruang chat.

## Role Utama

Keputusan flow terbaru (21 Oktober 2026): pembatalan oleh psikolog menghentikan seluruh sisa rencana dan wajib setelah pembayaran lunas. Admin dapat mencatat pelunasan penghentian; tidak dapat membatalkan. Tidak ada fitur permintaan unggah ulang bukti. Reschedule terbayar dikonfirmasi ulang tanpa DP kedua; setiap booking baru menyimpan snapshot pre-test dan consent versi aktif.

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
- psikolog/pengelola melihat analytics arus kas dan uang masuk dari paket
- psikolog/pengelola mengelola CMS
- sistem membuat laporan dan export data ke PDF/Excel

## Scope Fitur Utama

### Booking

- Pasien wajib melengkapi data diri (`isProfileComplete`) sebelum diizinkan memilih paket konsultasi.
- Pasien wajib mengisi formulir keluhan pre-test sebelum reservasi jadwal.
- Booking tidak bisa dilakukan untuk hari yang sama (minimal H+1).
- Tanggal baru reschedule tidak bisa hari yang sama; minimal keesokan hari (H+1).
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
- Admin melihat dan memverifikasi bukti transfer dan nama pengirim tanpa melihat nominal harga/tagihan.
- Skema pembayaran resmi: DP ditetapkan sistem secara flat Rp100.000 dan tidak boleh melebihi total setelah diskon. Psikoterapi ditarifkan per sesi dengan rencana awal empat sesi; DP mengurangi biaya pertemuan dan sisa proyeksi dapat dibayar bertahap. Jika terapi perlu dilanjutkan setelah sesi keempat, pasien booking lagi dengan DP dan ledger baru.
- Admin mencatat nominal pelunasan yang benar-benar diterima tanpa melihat harga paket atau nominal tagihan yang seharusnya. Setelah disimpan, nominal pelunasan tidak dapat dibaca kembali dari portal admin dan hanya masuk ke laporan uang masuk psikolog.
- Status sesi `COMPLETED` dan status pembayaran `PAID` adalah dua proses terpisah: psikolog menyelesaikan sesi, admin mencatat pelunasan.
- Riwayat pembayaran dan mutasi kas tersimpan di sistem.
- Sistem membutuhkan invoice/kwitansi yang memuat DP flat Rp100.000, sisa pelunasan, metode bayar, channel bank/QRIS/cash, nama pengirim, status, dan bukti pembayaran. Nomor referensi transaksi tidak digunakan.

### Paket Multi-Sesi

- Paket berkelanjutan memakai halaman khusus **Paket Berjalan / Rencana Terapi** di portal psikolog.
- Isi minimum halaman: pasien, nama paket, total sesi, sesi selesai, sesi berikutnya, tombol jadwalkan sesi berikutnya, dan status aktif/selesai/dihentikan.
- Sesi ke-2 dan seterusnya dijadwalkan oleh psikolog/pengelola, bukan dibuat sekaligus saat pasien membeli paket.
- Untuk psikoterapi, psikolog menjadwalkan sesi ke-2 sampai ke-4 dalam rencana awal. Tidak ada fitur tambah jatah; pertemuan klinis ke-5 dan seterusnya memakai booking baru serta dicatat sebagai lanjutan pada rekam medis eksternal.
- Psikolog/pengelola berwenang menandai sesi selesai, tidak hadir, dibatalkan, atau menghentikan paket.
- Keterlambatan dikonfirmasi manual oleh psikolog, tanpa auto-cancel. Sesuai hasil konfirmasi, sesi dapat dijadwalkan ulang minimal H+1; DP hanya di awal booking/rencana, tidak dibayar lagi saat reschedule. Pemulihan `NO_SHOW` memakai appointment dan nomor sesi yang sama dengan histori pembayaran tetap utuh.

### Notifikasi

- WhatsApp menjadi kanal utama notifikasi operasional. Email bersifat opsional sebagai fallback dan pengiriman dokumen/receipt bila dibutuhkan.
- Pengiriman notifikasi adalah tanggung jawab backend produksi.
- Event yang perlu didukung: booking pending, pembayaran dikonfirmasi, jadwal sesi, reschedule, dan reminder jadwal harian psikolog.
- Reminder ke psikolog perlu berisi nama pasien, jam mulai-selesai, keluhan/profil ringkas dari pre-test, dan tautan ke halaman detail di web.

### Consent, Privacy, dan Backup Data

- Pasien wajib menyetujui informed consent dan kebijakan privasi sebelum booking dikirim.
- Sistem perlu halaman consent/privacy yang menjelaskan kerahasiaan data, penggunaan pre-test untuk profiling awal, dan disclaimer bahwa pre-test bukan diagnosis otomatis.
- Backup/export data klinis diperlukan untuk owner/psikolog dan harus role-protected.

### Landing Page & Footer

- Landing page menampilkan paket tatap muka dan telelayanan aktif yang dikelola psikolog, profil kredensial psikolog, dan biografi.
- **Penyembunyian Tarif Awal**: Nominal harga paket disembunyikan untuk pengunjung yang belum sign in akun.
- Section pengalaman konseling dibuat carousel sekitar 10 item, bisa bergerak otomatis dan manual.
- **Kondisional Footer**: Komponen Footer hanya ditampilkan pada Landing Page (`GUEST`), dan disembunyikan sepenuhnya saat user masuk ke akun dashboard mana pun.

### Dashboard Pasien

- Panduan alur konseling dan FAQ interaktif.
- Verifikasi kelengkapan profil data diri sebelum memilih paket konsultasi.
- Pemesanan jadwal konsultasi dengan formulir keluhan pre-test dan upload bukti DP flat Rp100.000.
- Jadwal & Riwayat Konsultasi berformat Data Table rapi dengan modal detail janji temu.
- Pengajuan reschedule mandiri dengan tanggal pengganti minimal H+1 dan validasi slot.
- Pemberian review ulasan setelah sesi konsultasi selesai.

### Dashboard Psikolog / Pengelola

- Upload dan ganti foto profil wajah psikolog yang tampil di seluruh platform.
- Manajemen Paket Konsultasi (`PackagesTab`) dinamis (CRUD paket, kategori, sesi tunggal vs rawat jalan berkelanjutan).
- Mengelola jadwal mingguan, hari libur praktik, jam kerja, dan kuota tanggal tertentu.
- Melihat laporan keuangan uang masuk / arus kas dan ekspor dokumen kop dinas resmi (PDF & Excel).
- Mengelola CMS landing page dan kop surat resmi.
- Detail pasien terstandarisasi (`PatientDetailModal`) untuk profil, pre-test, dan riwayat sesi tanpa SOAP.
- Halaman khusus Paket Berjalan untuk memantau rencana terapi/paket multi-sesi.
- Export data klinis pasien untuk owner/psikolog dengan perlindungan role.
- Tidak ada ruang chat konsultasi di web. Paket telelayanan memakai media sesi yang diinformasikan setelah booking dikonfirmasi.

### Dashboard Admin

- Memantau akun pengguna secara strictly **Read-Only Monitoring** (tanpa wewenang edit/blokir akun user).
- Melayani pembuatan walk-in booking bagi pasien yang hadir langsung ke klinik.
- Verifikasi bukti transfer DP flat Rp100.000 dan nama pengirim transfer tanpa menampilkan rincian harga paket kepada admin.
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

Belum ada backend dan database nyata yang terhubung. Fitur dan flow utama frontend prototype sudah disesuaikan dengan requirement terbaru, sedangkan implementasi produksi masih memerlukan backend untuk authorization, booking lock, upload pembayaran, Google SSO, laporan, dan penyimpanan data sensitif.

## Arah Teknis Final

- Laravel 12+ digunakan sebagai REST API terpisah.
- MySQL 8+ digunakan sebagai database produksi.
- React/Vite tetap menjadi SPA frontend dan mengonsumsi API Laravel.
- Laravel menangani auth Google SSO, authorization, upload bukti pembayaran, laporan PDF/Excel, validasi booking, transaction/row lock, dan audit log.
- Service integrasi frontend tersedia di `src/services/api/`; runtime masih memakai mock/LocalStorage sampai backend tersedia.

## Prinsip Produk

- Aman untuk konteks kesehatan mental.
- Role dan akses harus jelas mengikuti hierarki terbaru.
- Data pre-test, pembayaran, dan data klinis harus dianggap sensitif.
- Setiap fitur klinis harus memisahkan informasi edukatif dari diagnosis medis resmi.
- Alur booking harus mudah, jelas, dan transparan soal jadwal, slot, biaya, status pembayaran, dan status booking.
- UI/UX harus nyaman untuk mobile dan desktop, termasuk sidebar yang bisa dikecilkan menjadi ikon.

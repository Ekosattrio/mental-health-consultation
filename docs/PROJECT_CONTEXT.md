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

- Pasien wajib mengisi pre-test sebelum booking.
- Booking tidak bisa dilakukan untuk hari yang sama.
- Reschedule tidak bisa dilakukan untuk hari yang sama.
- Slot yang sudah digunakan harus mengurangi ketersediaan slot.
- Sistem harus mencegah double booking pada slot yang tidak tersedia.
- Psikolog dapat menentukan hari libur yang otomatis menutup booking.
- Psikolog dapat menentukan jam kerja.
- Psikolog dapat menentukan batas jumlah pertemuan per hari.

### Pre-Test

- Pre-test menjadi pengganti intake form terpisah.
- Hasil pre-test tersimpan di database.
- Hasil pre-test bisa diakses sesuai hak akses.
- Test/assessment tambahan dari psikolog masih perlu dikonfirmasi ke client.

### Pembayaran

- Pasien mengunggah bukti pembayaran.
- Admin melihat dan memverifikasi bukti pembayaran.
- Skema pembayaran adalah DP 50% di awal dan 50% setelah konsultasi selesai.
- Riwayat pembayaran tersimpan di database.

### Landing Page

- Landing page menampilkan informasi layanan dan psikolog.
- Hindari klaim organisasi/lembaga yang belum valid, misalnya klaim resmi Kemenkes jika tidak ada dasar legal.
- Section pengalaman konseling dibuat carousel, sekitar 10 item, bisa bergerak otomatis dan manual.
- Footer perlu memuat Instagram atau media sosial lain.

### Dashboard Pasien

- Fokus pada booking, pre-test, status booking, upload pembayaran, reschedule, riwayat, dan review.
- Tidak ada ruang chat konsultasi online di web.
- UI/UX harus lebih nyaman untuk pengguna mobile.

### Dashboard Psikolog / Pengelola

- Mengelola jadwal, hari libur, jam kerja, dan kapasitas harian.
- Melihat analytics keuntungan/keuangan.
- Mengelola CMS.
- Melihat data booking dan kebutuhan operasional praktik.
- Tidak ada ruang chat konsultasi online di web.

### Dashboard Admin

- Memantau user.
- Melihat dan memantau booking.
- Membantu booking pasien yang datang langsung.
- Membantu reschedule pasien.
- Verifikasi bukti pembayaran.
- Mengubah status booking dari `PENDING` ke `CONFIRMED`.
- Mengubah status booking dari `CONFIRMED` ke `COMPLETED`.
- Moderasi review.

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

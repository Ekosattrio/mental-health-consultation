# SYSTEM DESIGN SPECIFICATION
## Website Manajemen Praktik Psikologi

> Dokumen ini adalah **baseline desain sistem aplikasi** untuk AI coding agent/developer.
> Fokus: fitur, aturan bisnis, alur sistem, aktor, data utama, halaman, dan tech stack.
> Tidak membahas hardware, VPS, hosting, atau pricing.
> Status: **working baseline** dan dapat direvisi jika stakeholder serta tim pengembang menyepakati perubahan.

---

# 1. Gambaran Umum

Aplikasi adalah website manajemen praktik psikologi untuk **satu psikolog** yang sekaligus merupakan **owner/pemilik praktik**.

Seluruh konsultasi dilakukan **tatap muka/offline di lokasi praktik**. Tidak ada konsultasi online, realtime chat, video call, atau voice call di dalam website.

Aktor utama:
1. Guest / Pengunjung
2. Pasien / User
3. Admin
4. Psikolog / Owner

Tujuan sistem:
- publikasi profil praktik dan layanan;
- registrasi pasien;
- pemilihan paket konsultasi;
- reservasi jadwal;
- formulir awal/pre-consultation form;
- pembayaran DP dan pelunasan;
- verifikasi pembayaran;
- reschedule;
- operasional kedatangan pasien;
- pembuatan bukti pembayaran PDF;
- export jadwal Excel;
- notifikasi operasional WhatsApp ke owner;
- rating/ulasan;
- CMS;
- pembukuan sederhana owner;
- video tutorial dan interactive tour.

---

# 2. Aturan Bisnis Utama

1. Hanya ada **satu psikolog/owner**.
2. Variasi layanan berasal dari **paket konsultasi**, bukan pilihan psikolog.
3. Konsultasi **100% offline/tatap muka**.
4. Booking normal paling lambat **H-1 berdasarkan hari kalender**, batas **23:59 WIB** pada hari sebelumnya.
5. Booking yang dibuat admin juga mengikuti H-1, kecuali ada **schedule exception** yang disetujui psikolog/owner.
6. Pasien wajib mengisi **pre-test/form awal sebelum pembayaran**.
7. Pembayaran awal minimal **50% dari harga final paket**.
8. Pasien boleh langsung membayar 100%.
9. Nominal aktual pembayaran dicatat/diverifikasi oleh admin.
10. Pelunasan dapat dilakukan saat pasien datang.
11. Tidak menggunakan payment gateway.
12. Tidak ada refund otomatis. Kebijakan client saat ini: **tidak ada pengembalian dana**.
13. Reschedule pasien maksimal **3 kali**.
14. Reschedule normal dikunci mulai **2 jam sebelum konsultasi**.
15. Setelah sesi terlewat dan pasien tidak hadir, admin menandai `NO_SHOW`.
16. Setelah `NO_SHOW`, pasien dapat mengajukan reschedule maksimal **4 hari kalender** sejak jadwal yang terlewat, selama kuota reschedule masih ada.
17. Jika melewati batas 4 hari tanpa pengajuan yang sah, seluruh pembayaran yang sudah masuk dianggap hangus sesuai kebijakan praktik.
18. Perubahan jadwal karena permintaan psikolog/owner adalah **pengecualian** dan tidak mengurangi kuota reschedule pasien.
19. WhatsApp hanya untuk operasional praktik/owner, bukan media konsultasi.
20. Sistem keuangan memakai **basis kas sederhana**, bukan akuntansi penuh.
21. Semua perhitungan waktu memakai timezone `Asia/Jakarta`.

---

# 3. Aktor dan Hak Akses

## 3.1 Guest
Dapat:
- melihat landing page;
- melihat profil praktik;
- melihat profil psikolog;
- melihat paket, harga, harga diskon;
- melihat lokasi;
- melihat rating/ulasan publik;
- melihat FAQ;
- melihat kontak/hotline;
- login;
- register;
- login Google.

Tidak dapat:
- booking final;
- mengisi pre-test;
- melihat data pasien;
- melihat transaksi;
- mengakses dashboard internal.

## 3.2 Pasien
Dapat:
- mengelola profil;
- memilih paket;
- memilih tanggal/slot;
- booking untuk diri sendiri;
- mendaftarkan orang lain sebagai pasien;
- review/edit data pasien;
- mengisi pre-test untuk pasien yang benar-benar berkonsultasi;
- melihat instruksi pembayaran;
- upload bukti pembayaran bila diperlukan;
- melihat status pembayaran dan sisa tagihan;
- melihat status booking;
- mengajukan reschedule;
- memilih jadwal baru setelah pengajuan disetujui;
- melihat riwayat booking;
- melihat ringkasan pembayaran;
- download bukti pembayaran selama masa akses;
- memberi rating setelah konsultasi selesai;
- melihat hotline admin.

## 3.3 Admin
Dapat:
- melihat jadwal praktik;
- melihat slot tersedia;
- membuat booking pasien;
- menambah/mencari data pasien;
- membuat booking untuk pasien yang datang langsung/menghubungi praktik;
- memastikan slot belum terisi;
- melihat data pasien sesuai kewenangan;
- memeriksa bukti pembayaran;
- mencatat nominal aktual dan metode pembayaran;
- approve/reject pembayaran;
- mencatat DP/pelunasan;
- check-in pasien;
- menandai hadir, in consultation, completed, no-show;
- memproses reschedule;
- approve/reject reschedule;
- memproses schedule exception dengan persetujuan owner;
- mengelola CMS/paket sesuai hak akses;
- export jadwal;
- melihat laporan operasional.

## 3.4 Psikolog / Owner
Dapat:
- melihat jadwal;
- melihat pasien yang akan ditangani;
- membaca pre-test;
- melihat riwayat konsultasi relevan;
- memberi/menyetujui schedule exception;
- melihat laporan keuangan;
- melihat pendapatan/pengeluaran/surplus sederhana;
- mencatat/mengelola pengeluaran;
- melihat rating;
- menerima ringkasan jadwal WhatsApp;
- menerima reminder H-2 jam;
- export jadwal;
- mengelola profil praktik bila diberi akses.

---

# 4. Halaman Public / Guest

## Landing Page
Bagian yang disarankan:
1. Navbar
2. Hero/Jumbotron
3. CTA booking
4. Profil praktik
5. Profil psikolog
6. Paket konsultasi
7. Harga normal & diskon
8. Informasi layanan
9. Lokasi praktik
10. Rating/testimonial
11. FAQ
12. Kontak/hotline
13. Footer

## Halaman Paket
Minimal:
- nama paket;
- deskripsi;
- durasi;
- harga normal;
- harga diskon;
- benefit/cakupan;
- lokasi;
- CTA booking.

## Authentication
- Login
- Register
- Google Sign-In
- Forgot Password
- Reset Password

---

# 5. Profil Pasien

Data minimal:
- nama lengkap;
- tempat lahir;
- tanggal lahir;
- alamat;
- jenis kelamin;
- pekerjaan;
- nomor telepon;
- email bila diperlukan.

Konsep penting:
**akun pemesan tidak selalu sama dengan pasien yang berkonsultasi**.

Pilihan pada booking:
- `Untuk Saya`
- `Daftarkan Orang Lain`

Jika `Untuk Saya`:
- tampilkan data profil;
- user dapat review/edit;
- data digunakan sebagai identitas pasien.

Jika `Daftarkan Orang Lain`:
- pemilik akun tetap tercatat sebagai `booked_by_user`;
- identitas pasien dibuat terpisah;
- pre-test dijawab berdasarkan pasien tersebut;
- booking tetap dapat dilihat pemilik akun.

Konsep:
```text
User Account
 ├── Own Patient Profile
 └── Booking
      └── Booking Patient
           ├── bisa diri sendiri
           └── bisa orang lain
```

---

# 6. Paket Konsultasi

Karena hanya satu psikolog, paket tidak perlu memiliki pilihan psikolog.

Data minimal:
- nama;
- slug;
- deskripsi;
- durasi;
- harga normal;
- harga diskon;
- status diskon;
- status aktif;
- benefit;
- gambar opsional;
- urutan tampil.

Aturan harga:
- harga final disalin/snapshot saat booking dibuat;
- perubahan harga paket setelah booking tidak mengubah transaksi lama;
- harga promo ditampilkan dengan gimmick harga normal dicoret.

---

# 7. Jadwal dan Slot

Sistem jadwal terdiri dari:
- availability praktik;
- durasi paket;
- buffer antar sesi;
- slot yang telah dibooking;
- hari libur;
- schedule exception.

Contoh:
```text
Availability: 09:00 - 17:00
Durasi: 60 menit
Buffer: 15 menit

Slot:
09:00 - 10:00
10:15 - 11:15
11:30 - 12:30
...
```

Aturan:
- slot terpakai tidak boleh dipilih user lain;
- booking pasien/admin menggunakan sumber slot yang sama;
- backend wajib revalidate availability;
- double booking harus dicegah dengan transaksi/locking/constraint;
- schedule exception dicatat terpisah.

---

# 8. Booking Pasien

Flow:
```text
Login
 ↓
Pilih Paket
 ↓
Pilih Tanggal
 ↓
Pilih Slot Tersedia
 ↓
Untuk Saya / Orang Lain
 ↓
Review/Edit Data Pasien
 ↓
Konfirmasi
 ↓
Isi Pre-Test
 ↓
Submit Pre-Test
 ↓
Booking / Slot Dilindungi
 ↓
Pembayaran
 ↓
Verifikasi
 ↓
Confirmed
```

Batas:
```text
Tanggal konsultasi : 20 Oktober
Batas booking      : 19 Oktober 23:59 WIB
```

Tidak harus tepat 24 jam sebelum sesi.

---

# 9. Slot Hold

Slot dapat di-hold maksimal 24 jam, tetapi tidak boleh melewati deadline H-1.

Konsep:
```text
hold_until = waktu yang lebih awal antara:
- booked_at + 24 jam
- deadline H-1 23:59
```

Detail implementasi boleh disesuaikan.

---

# 10. Booking oleh Admin

Use case:
- pasien datang untuk meminta jadwal;
- pasien menghubungi hotline;
- pasien kesulitan menggunakan web.

Flow:
```text
Admin Login
 ↓
Booking Baru
 ↓
Cari Pasien Lama / Tambah Pasien
 ↓
Pilih Paket
 ↓
Pilih Tanggal
 ↓
Tampilkan Hanya Slot Tersedia
 ↓
Isi/Konfirmasi Data Pasien
 ↓
Pre-Test
 ↓
Catat Pembayaran
 ↓
Simpan Booking
```

Aturan:
- normalnya tetap H-1;
- admin tidak boleh mengambil slot yang sudah dibooking;
- same-day hanya lewat schedule exception owner.

---

# 11. Schedule Exception Owner

Dipakai untuk:
- menerima pasien di luar aturan H-1;
- perubahan jadwal karena psikolog;
- membuka slot khusus;
- memindahkan pasien atas kebutuhan praktik.

Data minimal:
- booking terkait;
- tipe exception;
- alasan;
- jadwal lama;
- jadwal baru;
- peminta;
- bukti/persetujuan owner;
- admin pemroses;
- timestamp.

Aturan:
- tidak mengurangi kuota reschedule pasien;
- dapat melewati batas normal bila owner menyetujui;
- tidak boleh menabrak booking lain;
- harus ada audit trail.

---

# 12. Pre-Test / Form Awal

Pre-test **bukan diagnosis otomatis**.

Tujuan:
memberikan informasi awal kepada psikolog sebelum konsultasi.

Flow:
```text
Review Data Pasien
 ↓
Isi Pre-Test
 ↓
Submit
 ↓
Validasi
 ↓
Baru lanjut pembayaran
```

Dapat mendukung:
- template;
- pertanyaan aktif/nonaktif;
- urutan pertanyaan;
- text;
- textarea;
- radio;
- checkbox;
- select;
- date;
- number jika diperlukan.

Tidak ada:
- scoring diagnosis;
- AI diagnosis;
- rekomendasi medis otomatis.

Psikolog dapat membaca hasilnya sebelum konsultasi.

---

# 13. Pembayaran

Tidak menggunakan payment gateway.

Metode:
- transfer;
- QR;
- tunai.

## DP
Minimal:
```text
50% dari harga final
```

Contoh:
```text
Harga        Rp300.000
Min DP       Rp150.000
Bayar 150k   valid
Bayar 200k   valid
Bayar 300k   langsung lunas
Bayar 100k   tidak memenuhi minimum
```

## Multi Payment
Satu booking dapat memiliki banyak transaksi.

```text
Booking #1001
Harga: 300.000

Payment 1
DP = 150.000

Payment 2
Pelunasan = 150.000
```

Rumus:
```text
total_paid = SUM(valid/verified payments)
remaining  = final_price - total_paid
```

Jangan menimpa satu kolom pembayaran lama.

---

# 14. Verifikasi Pembayaran

Admin:
1. buka transaksi;
2. lihat bukti bila ada;
3. cocokkan nominal;
4. input nominal aktual;
5. pilih metode;
6. approve/reject;
7. sistem hitung sisa tagihan.

---

# 15. SLA Verifikasi Admin

SLA: **12 jam operasional**, hari libur/non-operasional tidak dihitung.

Jika SLA terlewati:
- reservasi dapat terlindungi/auto-confirm dengan marker khusus;
- pembayaran jangan langsung dianggap uang terverifikasi;
- gunakan konsep seperti:
  - booking: `CONFIRMED_AUTO_SLA`
  - payment: `PENDING_RECONCILIATION`

Tujuan:
- pasien tidak kehilangan jadwal karena admin terlambat;
- laporan kas tetap akurat;
- admin wajib rekonsiliasi.

Hari konsultasi, admin tetap mengecek pembayaran ketika pasien check-in.

---

# 16. Alur Hari Konsultasi

```text
Pasien datang
 ↓
Admin cocokkan identitas
 ↓
Admin cek booking
 ↓
Admin cek pembayaran awal
 ↓
Check-In
 ↓
Pasien menunggu
 ↓
Jam konsultasi tiba
 ↓
Admin panggil pasien
 ↓
Konsultasi offline
 ↓
Selesai
 ↓
Admin minta pelunasan bila ada
 ↓
Admin catat pembayaran
 ↓
Completed
 ↓
Hasil pemeriksaan diberikan OFFLINE
```

Hasil pemeriksaan tidak wajib disimpan/dikirim via sistem pada scope saat ini.

---

# 17. Status Booking Konseptual

Nama teknis boleh berubah, tetapi sistem minimal membedakan konsep:

```text
DRAFT
HELD
WAITING_PAYMENT
WAITING_VERIFICATION
CONFIRMED
CONFIRMED_AUTO_SLA
CHECKED_IN
IN_CONSULTATION
COMPLETED
NO_SHOW
CANCELLED
EXPIRED
```

---

# 18. Reschedule

## Normal
Maksimal:
```text
3 kali
```

Yang mengurangi kuota:
- disetujui admin;
- jadwal baru berhasil disimpan.

Pengajuan ditolak tidak mengurangi kuota.

## H-2 Lock
Mulai 2 jam sebelum sesi:
- tombol reschedule disabled;
- backend menolak reschedule normal.

## Setelah No-Show
Jika sesi terlewat:
1. admin tandai `NO_SHOW`;
2. bila kuota masih ada, reschedule dapat dibuka;
3. pasien isi alasan;
4. admin approve/reject;
5. bila approve, pilih slot baru.

Batas:
```text
maksimal 4 hari kalender setelah jadwal terlewat
```

Jika lewat:
- hak reschedule berakhir;
- seluruh pembayaran hangus sesuai kebijakan;
- tidak ada refund.

## Owner Exception
Perubahan karena owner:
- tidak mengurangi kuota pasien;
- membutuhkan persetujuan/bukti owner;
- diproses admin;
- harus audit;
- slot baru tetap harus valid.

---

# 19. PDF Pembayaran

Dua jenis PDF:

## Bukti DP
Minimal:
- nomor transaksi;
- nomor booking;
- identitas pasien secukupnya;
- paket;
- jadwal;
- harga final;
- jumlah diterima;
- sisa tagihan;
- tanggal;
- metode;
- status.

## Bukti Pelunasan
Minimal:
- nomor booking;
- harga final;
- riwayat pembayaran;
- total dibayar;
- sisa `0`;
- status lunas;
- tanggal pelunasan.

## Masa Download
- sampai 7 hari setelah konsultasi selesai;
- jika booking batal secara sah: 7 hari sejak pembatalan.

Setelah itu:
- tombol download hilang/nonaktif;
- ringkasan transaksi tetap terlihat;
- data transaksi tetap disimpan.

---

# 20. WhatsApp Owner

WhatsApp bukan konsultasi.

## Ringkasan Harian
Kirim ke owner:
- tanggal;
- jumlah konsultasi;
- waktu;
- nama pasien;
- paket;
- status.

Untuk keluhan/pre-test, lebih aman gunakan link dashboard daripada isi klinis detail.

## Reminder H-2 Jam
Kirim:
- waktu;
- nama pasien;
- paket;
- status;
- link detail/pre-test.

## Perubahan Jadwal
Boleh kirim update operasional jika booking confirmed berubah.

Arsitektur:
```text
Application Event
 ↓
Queue Job
 ↓
WhatsApp Service
 ↓
Provider/API
```

---

# 21. Excel Export

Admin/owner dapat export jadwal.

Filter:
- tanggal;
- rentang tanggal;
- status booking.

Kolom minimal:
- tanggal;
- jam;
- nama pasien;
- paket;
- kontak;
- status booking;
- status pembayaran.

Pengiriman file Excel otomatis ke WhatsApp bukan requirement wajib MVP.

---

# 22. Hotline Admin

Ditampilkan di halaman terkait booking.

Bentuk:
- nomor telepon;
- WhatsApp;
- email.

Untuk:
- pertanyaan reservasi;
- pembayaran;
- perubahan administrasi;
- bantuan website.

Bukan media konsultasi psikologis.

---

# 23. Rating & Ulasan

Aturan:
- hanya setelah `COMPLETED`;
- rating 1–5;
- komentar opsional;
- satu booking maksimal satu review;
- pasien boleh tampil nama/anonim;
- internal tetap punya relasi ke booking/pasien;
- agregat rating dapat tampil di landing page.

---

# 24. CMS

Kelola:
- hero/jumbotron;
- CTA;
- profil praktik;
- profil psikolog;
- alamat;
- kontak/hotline;
- FAQ;
- informasi layanan;
- paket;
- harga;
- diskon;
- gambar;
- footer;
- konten pendukung.

Tidak perlu generic page builder; CRUD/form terstruktur cukup.

---

# 25. Keuangan Owner

Basis kas sederhana, bukan akuntansi penuh.

## Pendapatan
Hanya dari transaksi yang benar-benar terverifikasi/diterima.

DP dan pelunasan dihitung pada tanggal penerimaan masing-masing.

## Pengeluaran
Data:
- tanggal;
- kategori;
- deskripsi;
- nominal;
- catatan;
- lampiran opsional.

Kategori contoh:
- sewa;
- listrik;
- internet;
- perlengkapan;
- operasional;
- staff;
- lainnya.

## Dashboard
Minimal:
- pendapatan hari ini;
- pendapatan bulan ini;
- pendapatan periode;
- pengeluaran;
- surplus/laba sederhana;
- jumlah transaksi;
- jumlah konsultasi;
- filter tanggal.

Rumus:
```text
Surplus / Profit Sederhana
=
Verified Cash In
-
Recorded Expenses
```

---

# 26. Dashboard Pasien

```text
Dashboard
├── Booking Aktif
├── Paket
├── Booking Baru
├── Booking Saya
├── Pre-Test
├── Pembayaran
├── Reschedule
├── Riwayat
├── Bukti Pembayaran
├── Rating
└── Profil
```

Home:
- booking terdekat;
- status pre-test;
- status pembayaran;
- sisa tagihan;
- jadwal;
- hotline.

---

# 27. Dashboard Admin

```text
Dashboard
├── Jadwal Hari Ini
├── Booking
│   ├── Semua Booking
│   ├── Booking Baru
│   └── No Show
├── Pasien
├── Pembayaran
│   ├── Menunggu Verifikasi
│   ├── DP
│   └── Pelunasan
├── Reschedule
├── Schedule Exception
├── Paket
├── CMS
├── Export
└── Laporan Operasional
```

Home:
- jadwal hari ini;
- pasien menunggu;
- pembayaran pending;
- reschedule pending;
- jumlah konsultasi;
- quick action booking.

---

# 28. Dashboard Owner/Psikolog

```text
Dashboard
├── Jadwal Hari Ini
├── Kalender/Jadwal
├── Pasien
├── Pre-Test
├── Riwayat Konsultasi
├── Schedule Exception
├── Rating
├── Keuangan
│   ├── Ringkasan
│   ├── Pendapatan
│   ├── Pengeluaran
│   └── Laporan
├── Export Jadwal
└── Profil Praktik
```

Home:
- jadwal;
- pasien berikutnya;
- ringkasan pre-test;
- jumlah sesi;
- pendapatan hari ini;
- pendapatan bulan ini;
- pengeluaran;
- surplus.

---

# 29. Video Tutorial dan Interactive Tour

## Video Tutorial
Pasien:
- register/login;
- Google login;
- pilih paket;
- booking;
- pre-test;
- pembayaran;
- reschedule;
- download PDF.

Admin:
- booking pasien;
- kelola pasien;
- payment;
- check-in;
- pelunasan;
- reschedule;
- exception;
- export.

Owner:
- jadwal;
- baca pre-test;
- exception;
- laporan keuangan;
- input expense;
- export.

## Interactive Tour
- berbeda per role;
- dapat di-skip;
- dapat diulang dari menu bantuan;
- progress disimpan per user.

---

# 30. Authentication

Pasien:
- email/password;
- Google Sign-In;
- logout;
- forgot/reset password.

Google flow:
```text
Sign in with Google
 ↓
Email sudah ada?
 ├── Ya → login/link account
 └── Tidak → buat akun → lengkapi profil
```

Jangan membuat duplicate user untuk email sama.

---

# 31. Role & Permission

Minimal:
```text
PATIENT
ADMIN
OWNER
```

`OWNER` = psikolog.

Authorization final wajib backend.

Frontend hanya untuk UX/visibility.

---

# 32. Entity Concept

Disarankan:

```text
users
patient_profiles
patients
packages
availability_rules
schedule_exceptions
bookings
booking_patients
booking_slots
pretest_templates
pretest_questions
pretest_submissions
pretest_answers
payments
payment_proofs
reschedule_requests
booking_events
reviews
expenses
financial_transactions
cms_contents
notifications
audit_logs
interactive_tour_progress
```

Nama tabel tidak wajib sama persis.

---

# 33. Relasi Konseptual

```text
User
 ├── PatientProfile
 ├── Bookings
 │    ├── BookingPatient
 │    ├── Package
 │    ├── Slot
 │    ├── PreTestSubmission
 │    │    └── Answers
 │    ├── Payments
 │    ├── Reschedules
 │    └── Review
 └── TourProgress

Owner
 ├── Availability
 ├── ScheduleExceptions
 └── Financial Reports

Payments
 └── FinancialTransactions

Expenses
 └── FinancialTransactions
```

---

# 34. Audit Trail

Wajib untuk aktivitas sensitif:
- verification payment;
- perubahan nominal;
- reschedule;
- perubahan jadwal;
- schedule exception;
- no-show;
- owner approval;
- perubahan data penting;
- perubahan/hapus expense.

Minimal:
```text
actor
action
entity
entity_id
old_value optional
new_value optional
reason optional
timestamp
```

---

# 35. Validasi Backend Kritis

Backend wajib memvalidasi:
1. slot tersedia;
2. tidak double booking;
3. H-1;
4. exception valid;
5. pre-test selesai sebelum payment;
6. DP minimal 50%;
7. nilai pembayaran valid;
8. total pembayaran benar;
9. reschedule <= 3;
10. H-2 lock;
11. `NO_SHOW` sebelum post-session reschedule;
12. post-no-show <= 4 hari;
13. exception hanya role sah;
14. PDF authorization;
15. PDF belum expired;
16. review hanya completed;
17. satu booking satu review;
18. role/ownership authorization;
19. laporan kas hanya transaksi terverifikasi.

---

# 36. Concurrency / Double Booking

Jangan hanya:
```text
if slot.available
```

Gunakan database transaction/locking/unique constraint atau mekanisme aman setara.

Target:
```text
Patient A pilih 09:00
Patient B pilih 09:00 hampir bersamaan
→ hanya satu booking yang berhasil.
```

---

# 37. File Storage

Private:
- bukti pembayaran;
- dokumen internal.

Tidak boleh expose direct public path.

Download lewat authorization.

PDF dapat:
- dibuat saat transaksi confirmed; atau
- digenerate on-demand dari data transaksi.

Yang penting hasil konsisten.

---

# 38. Search & Filter

## Paket
- nama;
- harga;
- durasi opsional.

Tidak ada filter psikolog.

## Admin Booking
- tanggal;
- status;
- payment;
- pasien;
- paket.

## Riwayat Pasien
- status;
- tanggal;
- paket.

---

# 39. Notification

Channel:
- in-app;
- WhatsApp owner;
- email bila diperlukan.

In-app:
- reschedule approve/reject;
- status booking;
- status payment;
- schedule exception;
- info operasional.

---

# 40. Tech Stack

## Backend
```text
Laravel 13
PHP 8.3+
```

Komponen:
- Eloquent ORM;
- Validation;
- Policies/Gates/Middleware;
- Queue;
- Scheduler;
- Notifications jika cocok;
- private storage;
- PDF library;
- Excel export.

## Frontend
```text
React 19
TypeScript
Inertia.js 3
Tailwind CSS 4
shadcn/ui
```

UI:
- dialog;
- form;
- table;
- tabs;
- calendar;
- toast;
- dropdown;
- pagination;
- sheet.

Form:
- Inertia Form atau React Hook Form jika diperlukan.

## Database
```text
MySQL 8
```

Gunakan:
- foreign keys;
- indexes;
- unique constraints;
- transactions;
- timestamps;
- soft deletes bila relevan.

## Cache / Queue
```text
Redis
```

Untuk:
- queue;
- cache;
- rate limiting;
- short-lived locks;
- background jobs.

## Google Login
```text
Laravel Socialite
Google OAuth 2.0
```

## WhatsApp
Gunakan provider/API resmi yang disepakati.

## PDF
Boleh:
```text
dompdf / Browsershot / library setara
```

## Excel
Disarankan:
```text
maatwebsite/excel
```
atau setara.

## Interactive Tour
Boleh:
```text
driver.js
shepherd.js
intro.js
```
atau setara.

---

# 41. Application Architecture

Monolith terstruktur.

```text
Browser
 ↓
React + Inertia
 ↓
Laravel
 ├── Controllers / Actions
 ├── Services
 ├── Policies
 ├── Jobs
 ├── Notifications
 ├── Models
 └── Domain/Business Rules
       ↓
      MySQL
       ↓
      Redis
```

Tidak perlu microservices untuk MVP.

---

# 42. Suggested Backend Modules

```text
app/
├── Domain/
│   ├── Auth/
│   ├── Patient/
│   ├── Package/
│   ├── Booking/
│   ├── Scheduling/
│   ├── PreTest/
│   ├── Payment/
│   ├── Reschedule/
│   ├── Finance/
│   ├── Review/
│   ├── CMS/
│   └── Notification/
├── Http/
├── Models/
├── Policies/
├── Jobs/
├── Notifications/
└── Services/
```

Tidak wajib persis.

---

# 43. Suggested Frontend Structure

```text
resources/js/
├── pages/
│   ├── public/
│   ├── auth/
│   ├── patient/
│   ├── admin/
│   └── owner/
├── components/
│   ├── ui/
│   ├── booking/
│   ├── payment/
│   ├── schedule/
│   └── finance/
├── layouts/
├── hooks/
├── types/
└── lib/
```

---

# 44. UI/UX Principles

1. Responsive/mobile-first.
2. Booking harus sederhana.
3. Hindari istilah teknis untuk pasien.
4. Status booking harus jelas.
5. Pembayaran tampilkan:
   - harga;
   - DP minimal;
   - sudah dibayar;
   - sisa.
6. Sebelum pembayaran tampilkan kebijakan utama:
   - DP 50%;
   - no refund;
   - max 3 reschedule;
   - lock H-2;
   - no-show;
   - batas 4 hari.
7. Admin dashboard fokus operasional.
8. Owner dashboard fokus jadwal, pre-test, finansial.
9. Jangan expose data sensitif berlebihan.
10. Tindakan sensitif perlu confirmation dialog.

---

# 45. Out of Scope MVP

Tidak termasuk:
- multi-psikolog;
- marketplace psikolog;
- konsultasi online;
- realtime chat;
- video/voice call;
- AI diagnosis;
- payment gateway;
- refund otomatis;
- e-prescription;
- hasil pemeriksaan digital;
- rekam medis penuh;
- mobile native app;
- full accounting;
- payroll;
- tax calculation;
- multi-branch;
- CRM kompleks.

---

# 46. End-to-End Flow Guest

```text
Guest buka website
 ↓
Landing Page
 ↓
Profil Psikolog
 ↓
Paket
 ↓
Klik Booking
 ↓
Belum login?
 ├── Login
 ├── Register
 └── Google Sign-In
 ↓
Patient Dashboard
```

---

# 47. End-to-End Flow Pasien

```text
Login
 ↓
Dashboard
 ↓
Pilih Paket
 ↓
Pilih Tanggal & Slot
 ↓
Untuk Saya / Orang Lain
 ↓
Review/Edit Data
 ↓
Pre-Test
 ↓
Booking + Hold
 ↓
Lihat Tagihan & Ketentuan
 ↓
Bayar >=50% / Full
 ↓
Upload Bukti bila perlu
 ↓
Menunggu Verifikasi
 ↓
Confirmed
 ↓
Menunggu Hari Konsultasi
 ↓
Jika >2 jam → boleh ajukan reschedule
Jika <=2 jam → lock
 ↓
Datang ke Praktik
 ↓
Check-In
 ↓
Konsultasi Offline
 ↓
Pelunasan bila ada
 ↓
Completed
 ↓
Download Bukti
 ↓
Rating
```

---

# 48. End-to-End Flow Admin

```text
Login
 ↓
Dashboard Hari Ini
 ↓
Lihat Jadwal
 ↓
Pasien Datang
 ↓
Cari Booking
 ↓
Cocokkan Identitas
 ↓
Periksa Pembayaran
 ↓
Check-In
 ↓
Panggil Pasien
 ↓
In Consultation
 ↓
Selesai
 ↓
Ada Sisa?
 ├── Ya → catat pelunasan
 └── Tidak
 ↓
Completed
 ↓
Aktifkan/Generate Bukti Pelunasan
```

Admin Booking:
```text
Booking Baru
 ↓
Cari/Tambah Pasien
 ↓
Pilih Paket
 ↓
Slot Tersedia
 ↓
Data Pasien
 ↓
Pre-Test
 ↓
Pembayaran
 ↓
Booking
```

---

# 49. End-to-End Flow Owner

```text
Login Owner
 ↓
Dashboard
 ↓
Jadwal Hari Ini
 ↓
Pasien Berikutnya
 ↓
Buka Pre-Test
 ↓
Persiapkan Konsultasi
 ↓
Terima Pasien Offline
 ↓
Konsultasi
 ↓
Selesai
```

Owner juga punya:
```text
Keuangan
├── Pendapatan
├── Pengeluaran
├── Surplus
└── Filter Periode

Schedule
├── Availability
├── Exception
└── Approval

Reports
├── Jadwal
└── Excel
```

---

# 50. End-to-End Reschedule

## Normal
```text
Confirmed Booking
 ↓
Klik Reschedule
 ↓
Check:
- belum H-2?
- count < 3?
 ↓
Isi Alasan
 ↓
Submit
 ↓
Admin Review
 ├── Reject
 └── Approve
      ↓
   Pilih Slot Baru
      ↓
   Atomic Update
      ↓
   reschedule_count + 1
```

## No-Show
```text
Sesi Terlewat
 ↓
Admin → NO_SHOW
 ↓
Masih <=4 hari?
 ↓
Kuota tersedia?
 ↓
Patient Ajukan
 ↓
Admin Approve/Reject
```

## Owner Exception
```text
Owner minta perubahan
 ↓
Approval/Bukti
 ↓
Admin proses
 ↓
Pilih slot valid
 ↓
Update
 ↓
Tidak mengurangi kuota pasien
```

---

# 51. Definition of Done MVP

MVP dianggap siap bila:
1. Guest dapat akses halaman public.
2. Pasien dapat register/login/Google login.
3. Profil pasien dapat dipakai saat booking.
4. User dapat mendaftarkan orang lain.
5. Paket dapat dikelola/dipilih.
6. Slot dapat dihitung.
7. Double booking dicegah.
8. H-1 berjalan.
9. Pre-test wajib sebelum payment.
10. DP min 50% berjalan.
11. Admin dapat verify/input nominal pembayaran.
12. Pelunasan dapat dicatat.
13. PDF DP & full tersedia sesuai rule.
14. Reschedule max 3 berjalan.
15. H-2 lock berjalan.
16. No-show + 4-day rule berjalan.
17. Owner exception berjalan.
18. Admin dapat booking pasien.
19. Check-in/lifecycle konsultasi berjalan.
20. WhatsApp schedule/reminder owner berjalan.
21. Excel export berjalan.
22. Rating berjalan.
23. CMS berjalan.
24. Finance owner berjalan.
25. Role/authorization aman.
26. Private file aman.
27. Interactive tour tersedia.
28. Video tutorial disiapkan.
29. UI responsif.
30. Alur kritis lulus UAT.

---

# 52. Guidance untuk AI Coding Agent

1. Jangan menambah scope tanpa requirement eksplisit.
2. Jangan ubah business rule tanpa konfirmasi.
3. Jika ada konflik requirement, tandai dan minta keputusan.
4. Prioritaskan correctness pada scheduling, payment, reschedule, authorization.
5. Gunakan DB transaction pada operasi kritis.
6. Jangan gunakan floating point untuk uang.
7. Gunakan integer/decimal untuk currency.
8. Simpan snapshot harga pada booking.
9. Gunakan timezone `Asia/Jakarta`.
10. Jangan hard-delete transaksi penting.
11. Gunakan audit trail.
12. External API/background task sebaiknya lewat queue.
13. Pisahkan domain logic dari UI.
14. Frontend tidak boleh menjadi satu-satunya security gate.
15. Jangan simpan data sensitif di localStorage tanpa kebutuhan.
16. Gunakan policy/authorization konsisten.
17. Migration/seeder harus reproducible.
18. Buat test untuk business rule kritis.
19. Implementasi teknis boleh berubah selama behavior bisnis tetap sama.

---

# 53. Urutan Implementasi

## Phase 1 — Foundation
- project setup;
- auth;
- Google SSO;
- roles;
- profile;
- layouts;
- authorization.

## Phase 2 — Public & CMS
- landing;
- profile practice;
- package;
- pricing/discount;
- CMS.

## Phase 3 — Scheduling
- availability;
- slot generation;
- duration;
- buffer;
- conflict prevention.

## Phase 4 — Booking & Patient
- booking;
- self/other patient;
- patient confirmation;
- H-1;
- slot hold.

## Phase 5 — Pre-Test
- template;
- questions;
- submission;
- answers;
- owner view.

## Phase 6 — Payment
- DP;
- proof;
- verification;
- multi-payment;
- balance;
- PDF.

## Phase 7 — Operations
- admin booking;
- check-in;
- consultation lifecycle;
- no-show;
- completion.

## Phase 8 — Reschedule
- request;
- approval;
- max 3;
- H-2 lock;
- no-show 4-day;
- owner exception.

## Phase 9 — Owner
- owner schedule;
- finance;
- expenses;
- reports;
- Excel.

## Phase 10 — Integration
- WhatsApp;
- notifications;
- rating;
- interactive tour.

## Phase 11 — QA
- tests;
- UAT;
- security review;
- role review;
- responsive test;
- tutorial recording.

---

# 54. Final Note

Dokumen ini mendefinisikan **desain produk dan aturan bisnis**, bukan kontrak teknis kaku.

AI agent/developer boleh:
- mengganti library;
- mengubah struktur folder;
- mengubah nama tabel;
- mengubah nama status;
- memakai design pattern lain;
- mengoptimalkan arsitektur;

selama:
- fitur tetap tersedia;
- business rule tidak berubah;
- keamanan tidak berkurang;
- behavior user tetap konsisten;
- perubahan tidak menciptakan scope baru tanpa persetujuan.

# Session Handoff

## Tanggal

2026-10-02

## Instruksi Aktif Developer

- Gunakan Bahasa Indonesia.
- AI dilarang melakukan operasi Git.
- Jangan jalankan `npm run dev`.
- Jangan jalankan `npm run build`.

## Kondisi Project

- Repo sudah berada di `C:\laragon\www\psikolog`.
- Project adalah React/Vite TypeScript.
- Dokumen MoU (`docs/MoU WEBSITE.pdf`) telah di-review menyeluruh bersama developer.
- Developer mengonfirmasi:
  - Garansi seumur hidup (*lifetime bug warranty*) dipertahankan secara sadar untuk *relationship building* / retensi klien (tetap dengan batas Pasal 20 ayat 2).
  - Kuota revisi disepakati maksimal 3 (tiga) kali pada ruang lingkup awal.
  - Termin pembayaran disepakati aman.
  - Nilai proyek dan durasi pengerjaan diisi secara mandiri oleh developer.
- Data aplikasi masih mock data dan LocalStorage (`jiwasehat_v2_`).
- Dokumentasi telah diselaraskan di `docs/DECISIONS.md`, `docs/BUSINESS_RULES.md`, `docs/CHANGELOG.md`, dan `docs/SESSION_HANDOFF.md`.
- Sesi 2026-10-02 telah menyelesaikan overhaul besar pada UI/UX ketiga portal (Pasien, Admin, Psikolog):
  1. Sidebar kecil mode collapse desktop (ikon terpusat + tooltip) & drawer collapsible mobile pada ketiga dashboard.
  2. Alur Pre-Test terintegrasi langsung ke dalam Booking Konsultasi (Wizard 3-Langkah: Jadwal -> Pre-Test -> DP 50%), menghapus tab intake terpisah.
  3. Halaman Asesmen DASS-21 diubah default menjadi Stepper kartu soal tanpa scroll panjang.
  4. Halaman Overview Pasien diubah menjadi Panduan Pasien & FAQ interaktif, riwayat/jadwal dipisah ke tab tersendiri.
  5. Moderasi review Admin dibersihkan dari banner dokter tunggal, diubah menjadi Data Table dengan rating rata-rata, filter bintang 5-1, dan pagination standar.
  6. Portal Psikolog: Data Pasien menjadi tabel bersih bebas scroll bertumpuk dengan modal Detail Pasien (Pre-test, DASS-21, Riwayat Booking) tanpa SOAP.
  7. Standarisasi Font Universal (Plus Jakarta Sans): Seluruh elemen dan form 100% dipaksa menggunakan `Plus Jakarta Sans` via `@theme` Tailwind CSS v4 dan CSS global, serta membersihkan kelas `font-mono`.
  8. Desain Rapat & Ergonomis Panduan Pasien & FAQ (`OverviewTab`): Dirombak menjadi layout 2-kolom berdampingan yang rapat tanpa scroll panjang.
  9. Penyederhanaan Tab Jadwal Praktik Psikolog (`ScheduleTab`):
     - Kolom "Skema Waktu" dan "Fitur Cek Waktu" (simulator slot) dihapus untuk menjaga kemudahan operasional dan mencegah tampilan berantakan.
     - Status buka/libur harian menggunakan segmented pill dua arah `[ 🟢 Buka ] [ 🔴 Libur ]` yang sangat jelas bagi pengguna awam.
     - Penyesuaian kuota tanggal tertentu dan cuti khusus ditata padat agar muat dalam layar tanpa scroll berlebih.
  10. Redesain Laporan Keuangan & Uang Masuk (`AnalyticsTab`):
     - Filter periode dirombak menjadi segmented control modern (`Semua`, `Bulan Ini`, `Bulan Lalu`, `Tahun 2026`) plus dropdown bulan.
     - Kartu arus kas dan rata-rata per sesi dipadatkan dengan gaya SaaS modern.
     - Tabel mutasi dilengkapi pagination ringkas (8 item per halaman).
  11. CMS Konten Berbasis Accordion Eksklusif (`CmsTab`):
     - Bagian konfigurasi Landing Page, Pasien, dan Dokter diubah menjadi accordion satu-terbuka (*single-open exclusive*) guna menghemat 70% ruang vertikal.
  12. Penghapusan Header Bar Tambahan di Dashboard & Integrasi Menu Profil di Navbar:
     - Header bar putih tambahan pada Dashboard Pasien, Psikolog, dan Admin dihapus secara total agar tampilan tidak mubazir dan konten tab langsung berada di posisi paling atas tanpa membuang ruang vertikal.
     - Dropdown profil pada Navbar atas (di samping tombol logout) disempurnakan menjadi pusat pengelolaan akun lengkap: memuat avatar, nama, role, ID, status pre-test / SIP klinis, menu pintasan tab navigasi, modal pop-up edit profil pengguna yang interaktif, dan tombol logout.
     - Khusus portal Pasien, data profil, status pre-test, dan kontak darurat juga tetap dapat diakses melalui tab mandiri "Profil Saya" (`profile`).
  13. Penyempurnaan UI/UX, Aksesibilitas, dan Alur Bisnis Pasien/Psikolog:
     - **Tata Letak FAQ Paling Bawah**: Tab FAQ diletakkan di urutan paling bawah sidebar navigasi Pasien dan di posisi paling bawah Landing Page sebelum Footer.
     - **Pembersihan Hotline Krisis & Normalisasi Tab Pasien**: Box hotline krisis diperbaiki dari teks berulang; margin atas seluruh tab pasien disamaratakan sejajar presisi dengan sidebar navigasi.
     - **Penghapusan Tips Harian & Export Pasien**: Widget tips 4-7-8 dihapus dari Overview Pasien; tombol export yang tidak dibutuhkan pasien dihapus dari tab riwayat.
     - **Alur Reschedule Mandiri Pasien (`RescheduleModal.tsx`)**: Implementasi modal pengajuan reschedule mandiri berteknologi React Portal, validasi H+1, pilihan slot operasional, opsi alasan, dan update reaktif context.
     - **Indikator Status Praktik Bersih**: Tombol status harian pada jadwal psikolog hanya menyala dengan warna solid & pulsing dot jika ON; tombol OFF polos transparan tanpa dot warna.
     - **Laporan Keuangan Responsif & Stabil**: Filter diubah menjadi pemilih Bulan & Tahun responsif; grid section bulanan yang berulang dihapus; ukuran kartu dikunci dengan `h-full min-h-[125px]` sehingga tidak melompat saat filter diubah.
     - **Penghapusan Tarif Mulai Psikolog**: Input tarif sesi online/offline dan teks "Tarif Sesi Mulai Rp 250.000" dihapus dari profil praktik karena berbasis paket.
     - **Standarisasi Icon Button & Tooltip Interaktif (`Tooltip.tsx`)**: Mengubah seluruh tombol aksi teks yang lebar (pemicu modal ekspor, reset filter, export CSV, cetak, lihat detail pasien, approve ulasan) menjadi icon button yang ringkas dengan animasi hover tooltip dinamis yang rapi, modern, dan minimalis.
     - **Ruang Ekspor & Pratinjau Khusus Tanpa Sidebar Utama (`ExportFinancePage.tsx`)**:
       - Mengubah tema warna tombol printer menjadi lembut senada brand (`bg-teal-50 border-teal-200 text-teal-700`).
       - Mengalihkan ekspor dari modal pop-up berat menjadi Halaman Penuh Khusus yang diakses melalui tombol cetak di tab Keuangan, tanpa menu di sidebar dashboard.
       - Menyediakan sidebar panel pengaturan format (PDF Kop Resmi vs Excel Spreadsheet), rentang tanggal, ringkasan data, dan Accordion FAQ bantuan cetak A4.
       - Live Preview ganda: Kop Surat Dinas Resmi (PDF) dan Live Table Viewer Excel interaktif bergaya spreadsheet asli dengan ekspor berkas `.xls`.
     - **Arsitektur Service Layer Siap Laravel 12++**: Direktori modular `src/services/api/` (`client.ts`, `authService.ts`, `appointmentService.ts`, `scheduleService.ts`, `financeService.ts`, `intakeService.ts`, `reviewService.ts`, `cmsService.ts`) dan dokumentasi spesifikasi komprehensif di `docs/LARAVEL_API_SPEC.md`.
  14. Verifikasi kompilasi TypeScript (`npx.cmd tsc --noEmit`) berhasil lolos dengan 0 error (exit code 0).

   15. Pengayaan Data Dummy Menyeluruh & Eliminasi Total Livechat:
      - 100% residu istilah livechat dan room virtual (`Room-Live-JS0X`) dibersihkan dan diganti dengan nama ruangan klinik tatap muka fisik di Senopati (`Klinik Ruang Lavender Lt. 2`, `Klinik Ruang Magnolia Lt. 3`, `Klinik Ruang Cempaka Lt. 2`, `Klinik Ruang Teratai Lt. 1`).
      - Penyesuaian tombol "Hubungi WhatsApp Admin" dan pengumuman CMS menjadi "konsultasi klinis privat".
      - Penambahan 12 data pasien baru (`user-pat-9` s/d `user-pat-20`) dengan profil lengkap, avatar realistis, dan nomor telepon.
      - Pengisian data lengkap Pre-Test Intake dan hasil asesmen DASS-21 untuk seluruh 20 pasien dengan variasi keluhan klinis (burnout, insomnia, imposter syndrome, kecemasan, dll).
      - Perluasan data transaksi dan janji temu dari 9 menjadi 33 transaksi riil lintas periode (November-Desember 2025 dan Juni-Oktober 2026) dengan status pembayaran bervariasi (`COMPLETED`, `CONFIRMED`, `PENDING`, `CANCELLED`, `PAID`, `DP_PAID`, `DP_PENDING_VERIFICATION`, `REFUNDED`).
      - Penambahan variasi ulasan pasien (bintang 5 dan 4, anonim dan terbuka, status pending dan approved).
      - Pembaruan `STORAGE_PREFIX` di `AppContext.tsx` ke `'jiwasehat_v3_'` sehingga browser pengguna langsung menikmati set data dummy baru yang kaya tanpa perlu pembersihan cache manual.
   16. Penyempurnaan Sistem Cetak PDF A4 Multi-Page, Pratinjau Excel 10 Baris, & CMS Kop Surat:
      - Sistem partisi lembar A4 otomatis (*Automatic Multi-Page Chunking*): Halaman 1 (Kop Dinas Lengkap + 10 transaksi + penomoran halaman), Halaman sambungan (Kop Ringkas + 15 transaksi), Halaman terakhir (Rekap Total Akumulasi + Blok Tanda Tangan Resmi Penanggung Jawab Praktik).
      - Toolbar navigasi halaman A4 interaktif pada layar: Tombol Prev/Next Page, Indikator `Halaman X dari Y`, serta toggle mode `[Per Halaman A4]` / `[Semua Halaman]`.
      - Penanganan CSS cetak `@media print` (`page-break-after: always; break-after: page;`) untuk memisahkan lembaran dokumen A4 secara rapi tanpa baris tabel atau tanda tangan terpotong.
      - Pratinjau tabel spreadsheet Excel dipaginasi menjadi 10 baris per tampilan layar dengan tombol navigasi Prev/Next, sementara tombol "Download Berkas Excel (.xls)" tetap mengekspor 100% dari seluruh 33 transaksi.
      - Formulir CMS Kop Surat Resmi di Tab Dokter (`CmsTab.tsx` Accordion 3): Nama Klinik/Praktik, Nama Psikolog & Gelar, No. SIP, No. STR, Alamat, No. Telp, Email, Website, Kota, dan Jabatan Penandatangan, yang terhubung langsung ke dokumen PDF dan berkas Excel.
      - Eliminasi total bug templating atas/bawah: menambahkan `print:hidden` pada Navbar dan Footer website agar tidak terbawa saat cetak PDF, serta membungkus ruang kerja ekspor dengan full-screen overlay `fixed inset-0 z-50 bg-slate-100 overflow-y-auto` agar Navbar tidak melayang di tengah tabel dan Footer website tidak tampak saat scrolling.
   17. Eliminasi Total Foto Manusia/Avatar & Standarisasi Ikon Peran Resmi:
       - 100% elemen tag `<img>` foto manusia di seluruh aplikasi telah dihapus dan digantikan oleh ikon resmi Lucide.
       - Pada Navbar (tombol akun, menu dropdown, dan modal pop-up edit profil), foto diganti dengan wadah ikon peran resmi yang elegan (Pasien: `User` hijau emerald, Dokter: `Stethoscope` biru langit, Admin: `Shield` ungu).
       - Profil akun terstandardisasi menggunakan ikon peran resmi sistem tanpa fitur upload foto yang membebani.
       - Pada tabel data pengguna (`UsersTab`) dan tabel pasien (`PatientsTab`), foto pengguna dihapus total sehingga baris tabel menjadi bersih, rapi, dan langsung menampilkan nama, ID, serta kontak tanpa pemborosan ruang visual.
       - Pada Landing Page publik (kartu hero, section Tentang Psikolog, dan modal bio), foto diganti dengan kartu kredensial klinis resmi berikon `Stethoscope` dengan kutipan visi klinis dan lencana legalitas STR/SIP.
   18. Pembersihan Akun Demo Tidak Valid (Obsolete Accounts Cleanup):
       - Menghapus akun demo `Dr. Adrian Pratama, M.Psi.` (`user-psy-2`) dari daftar akun demo (*3-dots menu*) di Navbar.
       - Memperbarui ulasan pasien `rev-3` di mock data agar merujuk ke dokter tunggal `dr. Sarah Jenkins, M.Psi., Psikolog` (`user-psy-1`).
       - Memastikan seluruh akun demo di sistem 100% valid dan terdaftar nyata di database sistem.

## File Yang Dibuat/Diubah pada Sesi Ini

- `src/data/mockData.ts` (pengayaan data dummy: 20 pasien, 33 appointment multi-periode 2025-2026, 20 DASS-21 & intake, reviews, dan eliminasi Room-Live)
- `src/context/AppContext.tsx` (bump STORAGE_PREFIX ke jiwasehat_v3_)
- `src/components/common/Tooltip.tsx` (komponen baru: Tooltip universal berbasis Tailwind CSS)
- `src/components/admin/tabs/ExportFinancePage.tsx` (komponen baru: Ruang Pratinjau & Ekspor Halaman Penuh PDF Kop Resmi & Excel Spreadsheet)
- `src/components/layout/Navbar.tsx` (React Portal modal profil, tooltip tombol close)
- `src/components/patient/tabs/FaqTab.tsx` (komponen baru: Tab FAQ mandiri interaktif)
- `src/components/patient/tabs/OverviewTab.tsx` (hapus tips 4-7-8, perbaikan hotline krisis & panduan kehadiran klinik)
- `src/components/patient/tabs/BookingTab.tsx` (perataan margin atas)
- `src/components/patient/tabs/HistoryTab.tsx` (hapus export yang tidak penting, tombol pemicu RescheduleModal)
- `src/components/patient/RescheduleModal.tsx` (komponen baru: Modal Reschedule mandiri pasien ber-portal, tooltip tombol close)
- `src/components/patient/tabs/TestsTab.tsx` (perataan margin atas)
- `src/components/patient/PatientDashboard.tsx` (tab FAQ diletakkan di urutan paling bawah)
- `src/components/landing/LandingPage.tsx` (section FAQ interaktif di urutan paling bawah sebelum footer)
- `src/components/psychologist/tabs/ScheduleTab.tsx` (status aktif ber-dot warna, non-aktif polos)
- `src/components/psychologist/tabs/ProfileTab.tsx` (penghapusan input tarif sesi online/offline & tarif mulai)
- `src/components/psychologist/PsychologistDashboard.tsx` (integrasi ExportFinancePage, penyembunyian sidebar utama saat mode ekspor)
- `src/components/psychologist/tabs/PatientsTab.tsx` (tombol Lihat Detail Pasien menjadi icon + tooltip, tooltip tombol close)
- `src/components/admin/tabs/AnalyticsTab.tsx` (penyelarasan warna tema tombol ekspor, trigger onOpenExportPage)
- `src/components/admin/tabs/ExportFinanceModal.tsx` (Modal Ekspor Keuangan dengan live preview kop surat resmi, icon bar atas & footer dengan tooltip)
- `src/components/admin/tabs/ReservationsTab.tsx` (tombol export CSV & cetak menjadi icon button dengan tooltip)
- `src/components/admin/tabs/ReviewsTab.tsx` (tombol reset filter & aksi persetujuan menjadi icon button dengan tooltip)
- `src/components/admin/tabs/UsersTab.tsx` (penghapusan total avatar dari tabel pengguna)
- `src/components/admin/tabs/CmsTab.tsx` (penggantian foto dokter dengan icon Stethoscope klinis resmi)
- `src/components/auth/LoginModal.tsx` (penyelarasan teks pemisah email dan tip demo)
- `src/context/AppContext.tsx` (method `rescheduleAppointment`, penambahan tipe tab 'faq' pasien)
- `src/services/api/client.ts` (API client Fetch standar Laravel 12)
- `src/services/api/authService.ts` (Sanctum Auth client)
- `src/services/api/appointmentService.ts` (Booking & Reservasi client)
- `src/services/api/scheduleService.ts` (Jadwal & Kuota Praktik client)
- `src/services/api/financeService.ts` (Keuangan & Mutasi Kas client)
- `src/services/api/intakeService.ts` (Pre-test DASS-21 client)
- `src/services/api/reviewService.ts` (Testimoni & Moderasi client)
- `src/services/api/cmsService.ts` (CMS Konten client)
- `src/services/api/index.ts` (Export API barrel)
- `docs/LARAVEL_API_SPEC.md` (Dokumen spesifikasi arsitektur Laravel 12++)
- `docs/BUSINESS_RULES.md` (Aturan reschedule H-1 & spesifikasi ekspor kop resmi)
- `docs/API.md` (Pembaruan status integrasi API)
- `docs/DECISIONS.md`
- `docs/CHANGELOG.md`
- `docs/SESSION_HANDOFF.md`

## Lanjut Berikutnya

- Setup backend Laravel 12 di direktori backend terpisah atau submodule (`backend/` / Laravel 12 install via Composer).
- Jalankan migrasi database sesuai skema di `docs/LARAVEL_API_SPEC.md`.
- Pasang Laravel Sanctum dan Socialite Google SSO.
- Integrasikan endpoint `src/services/api/` secara bertahap menggantikan mock data di `src/context/AppContext.tsx`.
- Lakukan pengujian manual di browser untuk seluruh alur user (Booking -> Pre-test -> Konfirmasi Admin -> Keuangan).

# Session Handoff

## Tanggal

2026-10-06

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
- Data aplikasi masih mock data dan LocalStorage.
- Storage aktif frontend saat ini memakai prefix LocalStorage `jiwasehat_v3_`.
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
    19. Penyelarasan Paket Layanan Resmi Klien (`docs/paket untuk website.pdf`):
        - 15 paket resmi: 5 Konseling (Offline, Telelayanan, Anak/Remaja, Dewasa, Pasangan/Keluarga), 9 Asesmen (Dasar, Lengkap include laporan resmi SIP, Tes IQ, Kepribadian Standar/Lengkap, Asesmen Anak/Remaja Standar/Lengkap, Asesmen Dewasa Standar/Lengkap), dan 1 Psikoterapi (Intensif 4 sesi).
    20. Penyembunyian Harga di Awal Laman (Landing Page) & Filter Kategori:
        - Harga nominal disembunyikan untuk pengunjung yang belum sign in; digantikan banner ajakan masuk akun.
        - Ditambahkan filter tab kategori (Semua, Konseling, Asesmen, Psikoterapi).
    21. Penguncian Pemilihan Paket Berbasis Kelengkapan Data Diri Pasien (`isProfileComplete`):
        - Pasien yang belum mengisi data diri lengkap dilarang memilih paket (kartu terkunci dengan ikon gembok).
        - Modal interaktif "Lengkapi Data Diri Pasien" disediakan untuk mengisi Nama, No HP, Tanggal Lahir, Gender, Domisili, Pekerjaan, Kontak Darurat.
        - Setelah data diri tersimpan (`updateUserProfile`), paket terbuka dan dapat dipilih.
    22. Transisi ke Sistem Pembayaran DP Flat Rp 100.000 & Nama Pengirim Wajib:
        - Sistem pembayaran DP diubah dari persentase 50% menjadi DP Flat Rp 100.000 untuk biaya administrasi penguncian jadwal.
        - Input wajib Nama Pengirim / Pemilik Rekening Transfer (`transferSenderName`) dan unggah bukti transfer.
        - Pelunasan sisa biaya paket dilakukan saat hadir di klinik.
    23. Resolusi Tuntas Bug Horizontal Overflow Halaman Psikolog:
        - Mengatasi bug pergeseran horizontal layar dengan menambahkan proteksi `overflow-x: hidden` pada `index.css`, root App, dan `PsychologistDashboard`.
        - Membungkus seluruh wadah tabel (`AnalyticsTab`, `PatientsTab`, `ScheduleTab`, `HistoryTab`, `ReservationsTab`, `UsersTab`) dengan `w-full max-w-full overflow-x-auto custom-scrollbar` dan `min-w-[...]` pada tabel.
    24. Rekonstruksi & Standarisasi Manajemen Paket (`PackagesTab.tsx`):
        - Mengatasi error syntax export `PackagesTab.tsx`.
        - Menulis ulang `PackagesTab` menjadi Data Table responsif lengkap dengan filter pencarian, filter kategori, filter jenis konsultasi (Sesi Tunggal vs Perawatan Berkelanjutan/Rawat Jalan), switch on/off status aktif, modal preview kartu paket, serta modal tambah/edit paket dinamis.
    25. Standarisasi Templating Print Dinas Resmi (`OfficialPrintModal.tsx`):
        - Komponen cetak resmi universal dengan Kop Surat Klinik (SIP, STR, Alamat, Telp, Email dari `psychologistCms`), garis ganda dinas, tabel bergaris rapi yang ramah kertas A4, dan kolom tanda tangan penanggung jawab.
    26. Redesain Riwayat Janji Temu Pasien Menjadi Format Tabel (`HistoryTab.tsx`):
        - Mengubah tampilan bertumpuk kartu besar menjadi Data Table terstandarisasi.
        - Dilengkapi Modal Detail Janji Temu interaktif (detail rincian paket, lokasi klinik offline, pembayaran DP Rp 100.000 & pelunasan, rating ulasan, dan tombol reschedule mandiri).
    27. Redesain Modal Data Pasien Berstandar Klinis Modern (`PatientDetailModal.tsx` & `PatientsTab.tsx`):
        - Mengganti modal pasien lama yang kaku/monoton menjadi komponen modal rekam medis modern & reusable (`PatientDetailModal.tsx`).
        - Memuat triage tingkat stres (bar progres visual berwarna) dan kualitas tidur, kartu identitas & kontak darurat, chips fokus keluhan, callout box quote deskripsi pasien, kartu 3 pilar asesmen DASS-21, dan tabel riwayat konsultasi.
    28. Pembuatan Alur Walk-In Booking Langsung Admin (`ReservationsTab.tsx`):
        - Mengaktifkan tombol "Buat Booking Pasien Langsung" dengan modal formulir walk-in (dukungan pasien terdaftar maupun pasien baru, pilihan dokter/psikolog, pilihan paket konsultasi, tanggal & jam sesi, metode lunas kasir vs DP administrasi, auto-confirm appointment).
        - Menghubungkan tombol cetak jadwal dengan `OfficialPrintModal` kop dinas resmi.
    29. Perapian Tabel Moderasi Review Pasien (`ReviewsTab.tsx`):
        - Teks ulasan pasien di baris tabel di-truncate rapi dalam satu baris dengan tombol "Baca" / icon `Eye`.
        - Membuka modal "Detail Ulasan Pasien" yang menampilkan ulasan utuh, rating bintang, dan tombol moderasi langsung (Setujui / Tolak).
    30. Verifikasi Kompilasi TypeScript:
        - `npx.cmd tsc --noEmit` lolos 100% dengan 0 error (exit code 0).
    31. Rombak Seluruh Modal ke Desain Modern Simple Light:
        - Seluruh modal ber-header gradient gelap pekat (`slate-900`, `sky-950`, `purple-950`) dirombak menjadi gaya Modern Simple Light (header putih bersih `bg-white border-b border-slate-100`, kontainer ikon soft pastel `bg-teal-50 text-teal-600`, tombol aksi teal modern).
        - Diaplikasikan ke: `PackagesTab.tsx` (tambah/edit paket & preview kartu), `PatientDetailModal.tsx` (rekam medis pasien), `OfficialPrintModal.tsx` (top bar kontrol cetak dinas), `ReservationsTab.tsx` (walk-in booking), dan `ReviewsTab.tsx` (detail baca ulasan).
    32. Pembersihan Total Blueprint & Switcher Akun Demo, Transisi ke Tombol Sidebar Collapse Global:
        - Menghapus menu titik 3 demo dan mode blueprint dari Navbar.
        - Navbar kini menampilkan tombol **Sidebar Collapse Toggle** (`PanelLeftClose`/`PanelLeftOpen`) yang tersinkronisasi dua arah via `AppContext` dan **TIDAK DITAMPILKAN** di Landing Page (Guest).
        - Otentikasi dialihkan ke kredensial nyata (Email/Username dan Password) serta simulasi Google SSO OAuth siap integrasi Laravel Socialite.
    33. Alur Kelengkapan Data Diri Pasien & Pre-Test Intake:
        - Pasien wajib mengisi data diri lengkap sebelum diizinkan memilih paket konsultasi.
        - Saat proses pemesanan konsultasi, pasien wajib mengisi formulir keluhan (pre-test intake).
    34. REST API CRUD Paket Konsultasi Siap Backend (`packageService.ts`):
        - Dibuat service `packageService.ts` (`getAll`, `getById`, `create`, `update`, `delete`, `toggleStatus`) via `apiClient` (`client.ts`), dengan fallback reaktif ke JSON/LocalStorage.
    35. Pembatasan Hak Akses Admin (Strict Read-Only Monitoring):
        - Admin dilarang melakukan aksi Create, Update, Delete di luar reservasi walk-in pasien.
        - Tombol blokir / buka blokir / edit akun user di `UsersTab` dihapus dan diganti status badge informatif.
    36. Redesain Total Summary Moderasi Review Admin (`ReviewsTab.tsx`):
        - Bagian ringkasan ulasan diubah menjadi Card Metrik Terpadu: Skor besar 4.7/5.0, progress bar distribusi bintang 5-1 interaktif, dan filter pills status Menunggu/Disetujui.
    37. Fitur Unggah & Edit Foto Profil Wajah Psikolog (`ProfileTab.tsx`):
        - Psikolog dapat mengunggah dan mengganti foto profil wajah (FileReader DataURL) yang tersimpan ke `PsychologistProfile.avatarUrl` dan `User.avatar`.
        - Foto wajah psikolog tampil secara dinamis pada kartu preview profil, overview dashboard, landing page, dan pill profil navbar.
    38. Eliminasi Footer pada Dashboard Masuk & Akses Cepat Login Testing (`App.tsx`, `Footer.tsx`, `LoginModal.tsx`):
        - Komponen Footer disembunyikan total saat user masuk ke akun dashboard (`currentRole !== 'GUEST'`), hanya tampil di Landing Page.
        - Footer dibersihkan dari simulasi peran demo dan blueprint, diganti navigasi resmi.
        - Pada modal login, ditambahkan chip Akses Cepat Testing (`[🩺 Psikolog]`, `[🛡️ Admin]`, `[👤 Pasien]`) agar pengembang/klien dapat login dengan satu klik ke peran masing-masing tanpa harus menghafal email.
    39. Sticky Navbar dengan Animasi Elevasi & Hamburger Sidebar Toggle (`Navbar.tsx`):
        - Mengimplementasikan deteksi scroll window (`isScrolled`) untuk transisi bayangan elevasi halus (`shadow-md shadow-slate-900/5`), transisi tinggi, dan efek blur transparan.
        - Tombol collapse sidebar diubah menjadi ikon **Hamburger** (`Menu` dari `lucide-react`) yang rapi dan seragam.
        - Logo JiwaSehat terhubung dinamis ke `landingCms.logoUrl` dengan fallback ikon `HeartHandshake`.
    40. Standarisasi Universal Tata Letak Seluruh Tabel & Pagination:
        - Seluruh tabel di sistem (`UsersTab.tsx`, `ReservationsTab.tsx`, `PackagesTab.tsx`, `HistoryTab.tsx` Psikolog, `HistoryTab.tsx` Pasien) distandarisasi seragam: Search di Kiri, Filter di Kanan, dan Pagination bar modern di Bawah.
        - Menghindari penumpukan baris dengan membatasi 6-8 item per halaman lengkap dengan kontrol halaman Previous, Next, dan tombol nomor halaman.
    41. Pencabutan Hak Cetak Jadwal dari Admin & Pembatasan Aksi Booking (`ReservationsTab.tsx`):
        - Hapus fitur cetak jadwal operasional dinas dan modal print dari dashboard Admin (hanya Psikolog/Pengelola yang berhak mencetak laporan).
        - Admin hanya boleh melakukan verifikasi/konfirmasi pembayaran booking. Aksi pembatalan, penghapusan, dan penandaan selesai konsultasi dicabut dari tabel reservasi admin.
    42. Pembersihan Banner Profil Dokter di Overview Psikolog & Eliminasi SOAP (`OverviewTab.tsx`, `HistoryTab.tsx`):
        - Menghapus kartu banner identitas dokter ("Praktik Mandiri Aktif... SIP... dr. Sarah Jenkins... Status Layanan: Siap Melayani Pasien") di atas dashboard Psikolog agar langsung menampilkan KPI dan ringkasan operasional.
        - Seluruh istilah medis SOAP dibersihkan dari tombol dan tabel riwayat, diganti menjadi "Rekam Medis Pasien".
    43. CMS Media & Gambar Branding Website (`CmsTab.tsx`):
        - Menambahkan Accordion 4 "Media & Gambar Branding Website" pada CMS Landing Page untuk pengelolaan gambar: Logo JiwaSehat, Banner Hero, Foto Fasilitas Ruang Klinik, dan Barcode QRIS Pembayaran DP Rp 100.000, lengkap dengan tombol preset sampel gambar dan pratinjau instan.
    44. Perbaikan Z-Index Tooltip Universal (`Tooltip.tsx`):
        - Menaikkan z-index tooltip menjadi `z-[99999]` dan container `hover:z-[9999]` agar tooltip melayang di atas seluruh kartu dan baris tabel tanpa pernah tertutup.
    45. Eliminasi Card Mobile "Pilih Menu ▾" & Pemusatan Navigasi ke Hamburger Navbar:
        - Menghapus blok card dropdown mobile `[Pilih Menu ▾]` dari `AdminDashboard.tsx`, `PsychologistDashboard.tsx`, dan `PatientDashboard.tsx`.
        - Tombol Hamburger di Navbar kini membuka slide-down Mobile Navigation Drawer yang memuat tab menu peran aktif (Admin, Psikolog, Pasien) lengkap dengan ikon dan badge. Di layar desktop (`>= lg`), tombol tetap mengontrol collapse sidebar utama.
    46. Perbaikan Sticky Navbar & Animasi Halus Saat Scrolling:
        - Memperbaiki kegagalan `position: sticky` dengan menghapus `overflow-x-hidden` dari container root di `src/App.tsx`, dan menerapkan `overflow-x: clip` di `src/index.css`.
        - Navbar dinaikkan ke level `z-[60]` dengan animasi transisi yang mulus: tinggi mengecil dari `h-16` ke `h-14`, background `bg-white/95 backdrop-blur-md`, border bawah beraksen teal lembut, dan garis indikator glow dinamis.
    47. Tooltip Bebas Clipping Menggunakan React Portal (`Tooltip.tsx`):
        - Komponen tooltip ditulis ulang menggunakan `createPortal(..., document.body)` dengan koordinat `fixed` dinamis dari `getBoundingClientRect()` dan `z-index: 999999`.
        - Tooltip 100% tidak akan pernah terpotong oleh `overflow-x: auto` tabel manapun.
    48. Autentikasi Email Tunggal di Landing Page (Tanpa Tab Register):
        - Form pendaftaran kata sandi terpisah dihapus total (*"gaada register"*). Autentikasi disederhanakan murni berbasis input Alamat Email (dan Google SSO).
        - Sistem mengecek email: jika sudah terdaftar, langsung masuk ke akun; jika belum, otomatis dibuatkan akun pasien baru dengan status `isProfileComplete: false`.
    50. Halaman Khusus Form Data Diri Pasien Baru (`PatientProfileCompletionPage.tsx`) Tanpa Sidebar:
        - Pasien baru atau pasien yang belum melengkapi data diri diarahkan ke Halaman Penuh Khusus di luar menu sidebar.
        - Drawer menu dan hamburger dinonaktifkan hingga profil disimpan.
        - Menyediakan helper pengujian "Isi Otomatis Data Sampel".
    51. Standarisasi Universal Seluruh Modal Menggunakan React Portal & Z-Index `z-[999999]`:
        - Seluruh modal (`PatientDetailModal`, `LoginModal`, `ProfileModal`, `BioModal`, `ReservationsTab`, `ReviewsTab`, `PackagesTab`, `HistoryTab`, `RescheduleModal`, `OfficialPrintModal`, `BookingTab`, `ExportFinanceModal`, `PatientMandatoryProfileModal`) dibungkus `createPortal(..., document.body)` dengan `z-[999999]`.
        - Menjamin modal tidak pernah tertutup oleh sticky Navbar (`z-[60]`).
    52. Pembersihan Biaya Awal / Nominal DP dari Kartu Profil Publik:
        - Tampilan nominal "DP Awal 50% Rp 187.500" pada kartu profil psikolog publik di Landing Page dihapus dan diganti badge status operasional "Praktik Tatap Muka Terjadwal".
    53. Resolusi Tuntas Bug Asinkron Login Email Pengguna Baru:
        - Memperbaiki penanganan `nextUsers` di `AppContext.tsx` sehingga pendaftaran email baru langsung terautentikasi tanpa error 404 *"Pengguna tidak ditemukan dalam sistem"*.
    54. Penyesuaian Visibilitas Tombol Hamburger Navbar (`lg:hidden`):
        - Tombol hamburger navigasi di samping profil akun disembunyikan pada layar besar/desktop (`lg:hidden`) karena fungsi perkecil/perluas menu sudah ada langsung di sidebar masing-masing dashboard.
        - Pada layar kecil/mobile (`< lg`), tombol hamburger langsung ditampilkan untuk membuka drawer navigasi menu mobile.
    55. Ornamen SVG Wave Pembatas Section di Landing Page:
        - Gelombang lengkung SVG Wave di bawah Hero Section (transisi ke background terang `bg-slate-50`) dan di atas Section Call to Action (transisi ke background gelap `bg-slate-900`).
        - Antarmuka landing page dijaga tetap bersih, rapi, dan ringan tanpa elemen floating dock yang berlebihan (*"wave aja cukup"*).
    56. Penayangan Foto Dinamis Psikolog di Landing Page & Kesiapan Backend:
        - Kartu identitas Hero dan Modal Bio Dokter menayangkan foto resmi psikolog dr. Sarah Jenkins secara dinamis (`soloPsychologist?.avatarUrl || soloUser?.avatar`), terhubung ke data `INITIAL_PSYCHOLOGISTS` dan siap disinkronkan ke endpoint backend.
    57. Best Practice Paket Multi-Sesi / Treatment Plan:
        - Appointment paket berkelanjutan sekarang menyimpan `treatmentPlanId`.
        - Psikolog dapat menandai sesi selesai dari Riwayat Sesi memakai icon button.
        - Setelah sesi selesai, psikolog dapat menjadwalkan sesi berikutnya memakai icon kalender dari kolom Aksi Psikolog.
        - Appointment lanjutan dibuat bertahap per pertemuan dan tidak menggandakan nominal pendapatan paket.
        - Dokumentasi backend diperbarui untuk `treatment_plans`, idempotency key, unique constraint sesi, index jadwal, dan transaction anti double booking.
    58. Penyesuaian Scope Booking-First:
        - Portal pasien tidak lagi menampilkan test psikolog tambahan; scope tes saat ini hanya pre-test profiling sebelum booking.
        - Booking pasien mewajibkan informed consent & kebijakan privasi sebelum submit.
        - Invoice/kwitansi pasien menampilkan DP Rp 100.000, sisa pelunasan, metode/channel bayar, nama pengirim, nomor referensi, status pembayaran, dan bukti pembayaran.
        - Psikolog memiliki tab khusus `Paket Berjalan` untuk memantau paket multi-sesi serta menjadwalkan sesi lanjutan.
        - Tab `Paket Berjalan` memakai tabel operasional, bukan card-grid, agar pengelola lebih mudah scan pasien, paket, progres, sesi berikutnya, status, dan aksi.
        - Psikolog dapat menandai sesi `COMPLETED`, `NO_SHOW`, atau `CANCELLED`; admin tetap hanya konfirmasi pembayaran/booking.
        - Dashboard psikolog mendapat export data klinis pasien. Backend produksi tetap perlu audit log dan role protection.
        - Notifikasi WhatsApp/email dicatat sebagai kebutuhan backend produksi untuk booking, pembayaran, jadwal, reschedule, dan reminder harian psikolog.

## File Yang Dibuat/Diubah pada Sesi Ini

- `src/components/patient/PatientProfileCompletionPage.tsx` (halaman khusus form data diri pasien baru di luar sidebar)
- `src/components/layout/Navbar.tsx` (sticky scroll transition, hamburger drawer, profile modal z-[999999])
- `src/components/common/Tooltip.tsx` (React Portal, fixed positioning dinamis, z-[999999])
- `src/components/common/PatientDetailModal.tsx` (React Portal, z-[999999])
- `src/components/common/OfficialPrintModal.tsx` (React Portal, z-[999999])
- `src/components/common/PatientMandatoryProfileModal.tsx` (React Portal, z-[999999])
- `src/components/auth/LoginModal.tsx` (single email auth flow, hapus register tab, React Portal z-[999999])
- `src/components/landing/LandingPage.tsx` (penghapusan biaya awal DP di kartu profil publik, bio modal React Portal z-[999999])
- `src/components/admin/tabs/ReservationsTab.tsx` (walk-in modal React Portal z-[999999])
- `src/components/admin/tabs/ReviewsTab.tsx` (review modal React Portal z-[999999])
- `src/components/admin/tabs/ExportFinanceModal.tsx` (z-[999999])
- `src/components/psychologist/PsychologistDashboard.tsx` (export finance z-[999999])
- `src/components/psychologist/tabs/PackagesTab.tsx` (preview, form, delete modal React Portal z-[999999])
- `src/components/patient/tabs/HistoryTab.tsx` (detail modal & review modal React Portal z-[999999])
- `src/components/patient/tabs/BookingTab.tsx` (profile fallback modal React Portal z-[999999])
- `src/components/patient/RescheduleModal.tsx` (z-[999999])
- `src/context/AppContext.tsx` (perbaikan closure asinkron `loginWithEmail` dengan parameter `userList`)
- `src/types/index.ts` (field `treatmentPlanId` pada appointment)
- `src/api/patientEndpoints.ts` (pembuatan `treatmentPlanId` untuk paket berkelanjutan)
- `src/components/psychologist/tabs/HistoryTab.tsx` (icon action complete sesi dan jadwalkan sesi lanjutan)
- `src/components/psychologist/tabs/TreatmentPlansTab.tsx` (tab khusus Paket Berjalan / Rencana Terapi)
- `src/components/psychologist/tabs/PatientsTab.tsx` (export data klinis pasien)
- `src/components/patient/PatientDashboard.tsx` (hapus tab test psikolog dari portal pasien)
- `src/components/patient/tabs/OverviewTab.tsx` (hapus CTA test tambahan)
- `src/components/patient/tabs/BookingTab.tsx` (consent/privacy dan nomor referensi pembayaran)
- `src/components/patient/tabs/HistoryTab.tsx` (invoice/kwitansi pembayaran)
- `src/components/layout/Navbar.tsx` (hapus nav assessment pasien, tambah nav Paket Berjalan psikolog)
- `src/components/layout/Footer.tsx` (copy pre-test profiling)
- `src/App.tsx` (pengalihan otomatis pasien belum lengkap data diri ke `PatientProfileCompletionPage`)
- `src/index.css` (penambahan `overflow-x: clip` pada html, body)
- `docs/DECISIONS.md` (pencatatan keputusan 74-82)
- `docs/CHANGELOG.md` (pencatatan riwayat revisi 2026-10-05)
- `docs/SESSION_HANDOFF.md` (pembaruan status dan progres implementasi terkini)

## Lanjut Berikutnya

- Setup backend Laravel 12 di direktori backend terpisah atau submodule (`backend/` / Laravel 12 install via Composer).
- Jalankan migrasi database sesuai skema di `docs/LARAVEL_API_SPEC.md`.
- Pasang Laravel Sanctum dan Socialite Google SSO.
- Integrasikan endpoint `src/services/api/` secara bertahap menggantikan mock data di `src/context/AppContext.tsx`.
- Lakukan pengujian manual di browser untuk seluruh alur user (Landing Page -> Sign In -> Lengkapi Data Diri Pasien -> Pilih Paket -> Pre-test -> Transfer DP Rp 100.000 -> Konfirmasi Admin -> Keuangan).


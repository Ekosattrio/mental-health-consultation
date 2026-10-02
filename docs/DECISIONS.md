# Decisions

## 2026-10-01

- Project menggunakan React, TypeScript, dan Vite.
- Dokumentasi utama dibuat di folder `docs/`.
- AI tidak boleh melakukan operasi Git.
- Untuk sesi ini, AI tidak boleh menjalankan `npm run dev` dan `npm run build`.
- Data aplikasi saat ini tetap menggunakan mock data dan LocalStorage sampai backend ditentukan.
- Requirement terbaru menetapkan hierarki role: psikolog/super admin/pengelola sebagai role tertinggi, lalu admin, lalu pasien/pengguna.
- Konsultasi online melalui chat web tidak masuk scope saat ini.
- Form intake terpisah akan diganti/digabung menjadi pre-test sebelum booking.
- Admin fokus pada monitoring, verifikasi pembayaran, approval booking, bantuan booking/reschedule, dan moderasi review.
- Psikolog/pengelola memegang analytics keuangan dan CMS.
- Laravel + React dinilai memungkinkan; kandidat arsitektur yang disarankan adalah Laravel API + React frontend.

## 2026-10-02

- Garansi lifetime dipertahankan secara sadar oleh developer untuk tujuan membangun hubungan jangka panjang / retensi klien (dengan batasan tetap sesuai Pasal 20 ayat 2: hanya mencakup bug pengembang pihak kedua dan fungsi yang tidak sesuai spesifikasi, tidak mencakup fitur baru atau perubahan bisnis).
- Batas kuota revisi disepakati maksimal 3 (tiga) kali dalam lingkup kerja awal.
- Sidebar menu ketiga dashboard diperbarui: mode kecil (collapse) dengan ikon terpusat + hover tooltip, dan mode mobile dilengkapi drawer menu collapsible yang nyaman untuk jempol.
- Alur Pre-Test dilebur ke dalam Halaman Booking Konsultasi sebagai Wizard 3 langkah (Jadwal -> Pre-Test -> Konfirmasi & DP 50%), menghapus tab pre-test intake yang berdiri sendiri.
- Asesmen psikologi mandiri (DASS-21) diubah default-nya menjadi mode Stepper Soal per Soal dengan opsi kartu responsif tanpa scroll panjang.
- Halaman awal pasien dirombak menjadi "Panduan & FAQ" interaktif (5 langkah konseling + Accordion FAQ), memisahkan data jadwal dan riwayat ke tab tersendiri agar beranda bersih dan tidak menumpuk.
- Moderasi ulasan admin dibersihkan dari banner dokter tunggal yang berulang, diubah menjadi Data Table ulasan dengan rating rata-rata, filter rating bintang (5-1), dan pagination terstandarisasi.
- Jadwal psikolog diubah menjadi konfigurasi mingguan fleksibel (Senin-Minggu) + cuti khusus dengan format tabel padat dan modern yang jelas terbaca bagi orang tua tanpa tumpukan card berlebih.
- Format rekam medis SOAP medis dihapus sepenuhnya dari sistem karena tidak pernah diminta oleh klien; data pasien fokus murni pada profil identitas, kontak darurat, formulir pre-test keluhan awal, hasil asesmen DASS-21, dan riwayat konsultasi.
- Laporan keuangan psikolog disederhanakan murni mencatat "Uang Masuk / Arus Kas Pasien" per bulan dan 1 tahun terakhir dengan filter periode; menghapus skema bagi hasil 70-30, slip honor, dan kartu audit dokter yang tidak relevan untuk praktisi tunggal.
- Standarisasi Tipografi Universal: Seluruh elemen web (heading, body, input, select, button, tabel, angka nominal, kode booking) diseragamkan mutlak menggunakan font 'Plus Jakarta Sans' via `@theme` Tailwind CSS v4 dan rules global CSS. Seluruh kelas `font-mono` yang sebelumnya memicu pergantian ke font monospace (Consolas/Courier) pada angka/kode/label telah dibersihkan demi konsistensi visual yang rapi dan elegan.
- Desain Rapat & Ergonomis Panduan Pasien & FAQ: Halaman panduan pasien dirombak menjadi layout 2 kolom berdampingan yang rapat tanpa scroll berlebih; alur 5 langkah konseling di kolom kiri dan accordion FAQ terpadu di kolom kanan bersama kotak hotline darurat yang ringkas.
- Status Praktik Ramah Orang Awam & Lansia: Mengganti badge toggle single button menjadi segmented button eksplisit dua arah `[🟢 Buka] [🔴 Libur]` pada tabel mingguan agar pengguna awam langsung paham bahwa status operasional dapat diubah dengan sekali klik.
- Penyesuaian Kuota Tanggal Tertentu (*Custom Date Quota Override*): Menyediakan fitur khusus bagi psikolog untuk menentukan kuota pasien maksimal pada tanggal tertentu (contoh: tanggal X hanya menerima 2 pasien karena ada seminar), atau menandai tanggal tertentu sebagai libur dadakan di luar pola mingguan.
- Skema Waktu Dinamis & Simulator Ketersediaan Real-Time: Durasi sesi konsultasi tidak lagi dikunci kaku 60 menit, melainkan otomatis mengikuti durasi paket yang dipilih pasien (60, 75, 90 menit).
- Penyederhanaan Tab Jadwal Praktik Psikolog: Kolom "Skema Waktu" dan "Fitur Cek Waktu" (simulator booking slot) dihapus untuk menjaga kesederhanaan operasional dan menghilangkan kebutuhan scrolling berlebih; pengaturan hari praktik menggunakan segmented pill `[ 🟢 Buka ] [ 🔴 Libur ]` yang sangat jelas bagi pengguna awam.
- Penghapusan Header Bar Tambahan di Dashboard & Integrasi Menu Profil di Navbar Atas: Header bar tambahan di ketiga dashboard dihapus sepenuhnya agar tampilan dashboard bersih dan konten tab langsung berada di posisi paling atas tanpa membuang ruang layar vertikal. Seluruh pengelolaan dan informasi profil pengguna dipusatkan di Navbar atas (di samping tombol logout), memuat ringkasan identitas lengkap (avatar, ID, role, WhatsApp, status pre-test / SIP), tombol pintasan tab dashboard, modal pop-up detail & edit profil interaktif, dan tombol keluar (logout).
- Pemisahan Data Profil Pasien ke Tab Mandiri ("Profil Saya"): Data akun, email, ID pasien, status pre-test, kontak darurat, dan preferensi dipindahkan ke tab menu tersendiri agar tata letak tidak menumpuk.
- Modernisasi Filter & Kartu Laporan Keuangan Psikolog: Filter periode diganti menjadi segmented button SaaS (`Semua`, `Bulan Ini`, `Bulan Lalu`, `Tahun 2026`) plus dropdown bulan, kartu metrik arus kas dipercantik dengan aksen gradien halus, dan tabel mutasi dilengkapi pagination 8 item per halaman.
- Sistem Accordion Eksklusif (Single-Open) pada CMS Konten: Seluruh bagian formulir CMS (Landing Page, Portal Pasien, Portal Psikolog) diubah menjadi accordion eksklusif di mana hanya satu section yang terbuka pada satu waktu untuk menghemat 70% tinggi layar dan mencegah scrolling panjang.
- Pembersihan Hotline Krisis & Normalisasi Perataan Tab Pasien: Bug teks dobel dan referensi kata keliru pada kotak bantuan krisis diperbaiki. Margin dan padding atas seluruh tab pasien (`BookingTab`, `HistoryTab`, `TestsTab`) dinormalisasi seragam tanpa `py-*` berlebih agar rata sempurna dengan sidebar.
- Pemisahan Tab FAQ Mandiri Pasien: Tab `faq` dipisahkan menjadi tab independen dengan pencarian interaktif, filter kategori, dan tombol WhatsApp admin.
- Pembersihan Redundansi Profil di Sidebar: Tab profil di sidebar pasien dan psikolog dihapus; pengelolaan akun dipusatkan di Navbar atas via avatar dan Modal Profil Lengkap berteknologi React Portal `createPortal(..., document.body)` dengan `z-[9999]`. Menu pintasan di dropdown navbar juga dibersihkan.
- Penyempurnaan Indikator Status Praktik: Pada tab jadwal psikolog, hanya tombol status yang aktif (ON) yang memiliki warna solid dan pulsing dot (hijau untuk Buka, merah untuk Libur); tombol non-aktif polos transparan tanpa dot warna.
- Penyederhanaan Laporan Keuangan Arus Kas: Section rekap bulanan berulang dihapus; filter periode diubah menjadi dropdown Bulan dan Tahun yang responsif dan langsung mengkalkulasi metrik arus kas secara dinamis.
- Penghapusan Tarif Sesi Mulai di Profil Psikolog: Input tarif sesi online/offline dan label "Tarif Sesi Mulai Rp 250.000" dihapus dari form dan kartu pratinjau karena psikolog beroperasi dengan sistem paket konsultasi.
- Fitur Ekspor CSV dan Cetak Terintegrasi: Ditambahkan fitur unduh CSV dan Cetak (`window.print()`) pada Laporan Keuangan, Reservasi Admin, dan Riwayat Pasien.
- Penempatan Bagian FAQ di Urutan Terbawah: Pada Dashboard Pasien, tab `faq` ("FAQ & Bantuan") diposisikan paling bawah di sidebar navigasi. Pada Landing Page publik, section FAQ interaktif diletakkan di bagian terbawah tepat sebelum Call to Action dan Footer.
- Penghapusan Fitur Ekspor yang Tidak Relevan bagi Pasien: Tombol ekspor CSV dan cetak pada tab riwayat pasien dihapus karena pasien tidak membutuhkan fungsi pembukuan data administratif; riwayat cukup dilihat langsung di portal.
- Alur Reschedule Mandiri Pasien (Reschedule Flow & Modal): Disediakan modal khusus pengajuan reschedule mandiri berteknologi React Portal (`createPortal`) dengan validasi minimal H+1, pemilihan slot waktu operasional, pengisian alasan & catatan, perbandingan jadwal lama vs baru, serta pembaharuan status konsultasi menjadi `RESCHEDULED` secara reaktif di LocalStorage.
- Penghapusan Tips Kesehatan Mental Harian (Tips 4-7-8): Widget tips harian di Overview Pasien dihapus untuk membuat beranda lebih bersih, langsung ke inti panduan kedatangan, dan tidak memuat konten statis yang tidak diminta klien.
- Stabilisasi Layout Kartu Metrik Keuangan (`AnalyticsTab`): Kartu metrik uang masuk dikunci tingginya menggunakan `h-full min-h-[125px] flex flex-col justify-between` agar layout tetap kokoh, seimbang, dan tidak bergeser atau berubah ukuran saat filter periode diganti.
- Modal Ekspor & Cetak Laporan Keuangan Ber-Kop Surat Resmi (`ExportFinanceModal`): Fitur ekspor keuangan dilengkapi filter fleksibel (Bulan/Tahun, Rentang Tanggal Spesifik, Semua Data), live preview dokumen kop surat dinas klinik resmi (No. SIP, No. STR, Alamat, Tanda Tangan Penanggung Jawab), penangkapan 100% data tanpa terpotong pagination, serta opsi unduh Excel/CSV (UTF-8 BOM) dan Cetak/Simpan PDF (`window.print()`).
- Standarisasi Tombol Aksi Minimalis & Tooltip Interaktif (`Tooltip.tsx`): Seluruh tombol aksi pada toolbar dan tabel (seperti tombol cetak/ekspor, reset filter, unduh CSV, dan lihat detail pasien) disederhanakan dari tombol teks lebar menjadi icon button yang ringkas dan modern. Setiap tombol dibungkus dengan komponen `Tooltip` universal (`src/components/common/Tooltip.tsx`) berbasis Tailwind CSS dengan animasi fade/scale halus, arrow caret dinamis, serta atribut aksesibilitas (`aria-label`) agar tampilan tetap bersih, tidak sesak, dan ramah pengguna.
- Penyelarasan Tema Warna Tombol Ekspor & Transisi ke Halaman Penuh Khusus (`ExportFinancePage.tsx`):
  - Mengubah tombol printer dari hitam gelap (`bg-slate-900`) menjadi warna tema yang lembut dan senada (`bg-teal-50 border-teal-200 text-teal-700`) sehingga harmonis dengan toolbar.
  - Mengganti modal pop-up yang berat menjadi Halaman Penuh Khusus (*Dedicated Full-Width Workspace*) tanpa sidebar utama dashboard untuk memberikan ruang visual yang lega dan mencegah lag saat memproses data besar.
  - Halaman ini tidak dicantumkan di menu sidebar reguler dan hanya dapat diakses melalui tombol cetak di tab Keuangan, dilengkapi tombol kembali.
  - Menghadirkan Sidebar Kontrol Khusus di dalam halaman (Pilihan format PDF Kop Resmi vs Excel Spreadsheet, rentang tanggal, ringkasan metrik, dan Accordion FAQ panduan cetak A4/Excel).
  - Menyediakan Live Preview ganda: Dokumen PDF ber-Kop Surat Dinas Resmi dan Live Table Viewer Excel interaktif bergaya spreadsheet asli dengan ekspor file `.xls` yang langsung kompatibel dengan Microsoft Excel dan Google Sheets.
54. Pengayaan Data Dummy Komprehensif (Multi-Tahun & Multi-Bulan) & Eliminasi Total Livechat:
  - Menghapus seluruh residu terminologi dan identitas virtual `Room-Live-JS0X` dari sistem dan menggantinya dengan nama ruang klinik tatap muka fisik (`Klinik Ruang Lavender Lt. 2`, `Klinik Ruang Magnolia Lt. 3`, `Klinik Ruang Cempaka Lt. 2`, `Klinik Ruang Teratai Lt. 1`).
  - Menyesuaikan label "Chat WhatsApp Admin" menjadi "Hubungi WhatsApp Admin" serta pengumuman CMS dari "telekonsultasi" menjadi "konsultasi klinis privat".
  - Menambahkan 12 data profil pasien baru (`user-pat-9` s/d `user-pat-20`) dengan latar belakang profesi, avatar, no WhatsApp, dan keluhan psikologis yang realistis.
  - Melengkapi formulir Pre-Test Intake dan hasil asesmen psikologis DASS-21 untuk seluruh 20 pasien, sehingga fitur triage klinis dan pratinjau rekam pre-test terisi penuh tanpa data kosong.
  - Memperkaya riwayat janji temu dan transaksi dari 9 menjadi 33 data transaksi mencakup November 2025, Desember 2025, Juni 2026, Juli 2026, Agustus 2026, September 2026, dan Oktober 2026 dengan ragam status (`COMPLETED`, `CONFIRMED`, `PENDING`, `CANCELLED`, `PAID`, `DP_PAID`, `DP_PENDING_VERIFICATION`, `REFUNDED`).
  - Menambah ragam ulasan pasien (rating 5 dan 4, anonim dan teridentifikasi, serta status pending moderasi admin).
  - Meningkatkan `STORAGE_PREFIX` di `AppContext.tsx` menjadi `'jiwasehat_v3_'` agar browser pengguna secara instan memuat set data dummy baru yang kaya tanpa perlu membersihkan cache LocalStorage manual.
55. Multi-Page PDF Pagination A4, Pratinjau Excel 10 Baris, Konfigurasi Kop Surat di CMS, & Isolasi Cetak:
  - Mengimplementasikan sistem partisi halaman A4 otomatis (*Automatic Multi-Page Chunking*): Halaman 1 memuat Kop Lengkap + Judul + 10 transaksi pertama + Footer Nomor Halaman (`Halaman 1 dari N`); Halaman sambungan memuat Kop Ringkas + 15 transaksi; Halaman terakhir memuat Rekap Total Akumulasi Dana Masuk + Blok Tanda Tangan Resmi Penanggung Jawab Praktik.
  - Menyediakan toolbar navigasi halaman A4 interaktif pada layar: Tombol `[Sebelumnya]`, Indikator `Halaman X dari Y`, Tombol `[Selanjutnya]`, serta opsi beralih mode pratinjau `[Per Halaman A4]` atau `[Semua Lembar A4]`.
  - Menerapkan CSS cetak `@media print` dengan atribut `page-break-after: always; break-after: page;` sehingga cetak ke kertas A4/PDF otomatis terpisah per lembar tanpa teks atau tanda tangan terpotong.
  - Membatasi pratinjau tabel spreadsheet Excel menjadi 10 baris per halaman dengan kontrol navigasi Prev/Next dan info baris data, sementara tombol "Download Berkas Excel (.xls)" tetap mengekspor 100% data transaksi secara utuh.
  - Menyediakan form konfigurasi Kop Surat Resmi di CMS Konten Dokter (`CmsTab.tsx` Accordion 3): Nama Klinik/Instansi, Nama Dokter & Gelar, No. SIP, No. STR, Alamat, No. Telp, Email, Website, Kota, dan Jabatan Penandatangan, yang otomatis terhubung reaktif ke dokumen PDF dan Excel.
  - Menghilangkan bug templating atas/bawah: menambahkan `print:hidden` pada Navbar dan Footer website agar tidak ikut tercetak, serta membungkus ruang kerja ekspor dengan overlay layar penuh `fixed inset-0 z-50 bg-slate-100 overflow-y-auto` agar Navbar tidak melayang di tengah tabel dan Footer website tidak tampak saat scrolling.
- **56. Eliminasi Total Foto Manusia/Avatar & Standarisasi Ikon Peran Resmi (Profile Tanpa Upload & Tabel Bersih)**:
  - Menghapus 100% elemen tag `<img>` foto manusia di seluruh aplikasi.
  - Pada Navbar (tombol akun atas, menu dropdown profil, dan modal pop-up edit profil), foto diganti menjadi wadah ikon peran resmi yang elegan (Pasien: `User` hijau emerald, Psikolog: `Stethoscope` biru langit, Admin: `Shield` ungu).
  - Profil pengguna tidak menyediakan/memerlukan upload foto; avatar akun terstandardisasi menggunakan ikon peran resmi sistem.
  - Pada tabel data (`UsersTab` admin dan `PatientsTab` psikolog), foto avatar dihapus sepenuhnya sehingga tabel menjadi bersih, rapi, dan langsung menampilkan nama, ID, serta kontak tanpa pemborosan ruang visual.
  - Pada Landing Page publik (kartu hero, section Tentang Psikolog, dan modal bio), foto diganti dengan kartu kredensial klinis resmi berikon `Stethoscope` dengan kutipan visi klinis dan lencana legalitas STR/SIP.
- **57. Pembersihan Akun Demo Tidak Valid (Obsolete Accounts Cleanup)**:
  - Menghapus akun demo `Dr. Adrian Pratama, M.Psi.` (`user-psy-2`) dari daftar pilihan akun demo cepat (*3-dots dropdown*) di Navbar atas, karena platform beroperasi sebagai praktik psikolog mandiri tunggal dengan penanggung jawab klinis tunggal `dr. Sarah Jenkins, M.Psi., Psikolog` (`user-psy-1`).
  - Memperbarui relasi ulasan `rev-3` di mock data agar merujuk ke `user-psy-1` sebagai entitas psikolog resmi.
  - Memastikan seluruh akun demo di sistem 100% sinkron dan terhubung nyata ke data pengguna aktif (`user-pat-1`, `user-pat-2`, `user-psy-1`, `user-adm-1`).

## Pending Decisions

- Backend stack final disepakati menggunakan Laravel 12++ API + React Vite SPA.
- Database engine disarankan PostgreSQL 16+ / MySQL 8.0+.
- Strategi Google SSO via Laravel Socialite.
- Provider payment gateway (Midtrans / Xendit / Manual Transfer DP 50%).
- Deployment target (VPS Ubuntu / Laravel Forge / Shared Hosting Laragon).

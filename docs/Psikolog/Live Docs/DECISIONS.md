# Decisions

## 2026-10-22 - Perbaikan Audit Role dan Sambungan CMS

- Profil akun memakai allowlist nama/telepon/kontak darurat dan hanya pemilik akun. Email SSO/role tidak dapat diedit melalui form. Persistensi harus sukses sebelum toast atau modal ditutup. Profil Praktik ditambahkan ke navigasi desktop/mobile; penyimpanan profil praktik juga persist-before-success.
- Reschedule membawa `expected_version`; versi appointment diperiksa terhadap state terbaru di dalam lock sebelum perubahan. Form usang ditolak, bukan menimpa jadwal aktor lain. Versi bertambah setiap reschedule; data legacy memakai jumlah histori sebagai versi awal. Backend wajib menerapkan conditional update dan HTTP 409; lock lokal bukan jaminan antarperangkat.
- Pilihan jam admin yang hilang dikosongkan, bukan diganti otomatis dengan jam pertama. Tooltip diukur, dibungkus, dibalik posisinya bila perlu, dan dibatasi viewport. Admin diberi label Admin Operasional, bukan Super Admin.
- Hanya hold HELD yang belum kedaluwarsa dapat dipulihkan/menghalangi reservasi baru. Record expired tetap disimpan agar bukti dari tab lama masuk rekonsiliasi. Tidak mengembalikan panel lanjutkan/lepaskan atau membuat auto-cancel appointment.
- Detail dan receipt pasien menampilkan seluruh histori reschedule beserta aktor, asal/tujuan, waktu, dan alasan; legacy tanpa array tetap memiliki ringkasan terakhir.
- CMS owner tersambung ke footer, carousel, media landing, banner/tip/pengumuman pasien, rekening DP, QRIS kasir, dan logo kop. Pengaturan rekening disnapshot saat hold dibuat; perubahan CMS tidak mengubah instruksi transfer hold lama.
- Resource CMS publik tidak memuat rekening/QRIS kasir. Konfigurasi lengkap owner memiliki endpoint baca tersendiri; server menentukan instruksi rekening pada hold, bukan payload pasien.
- CMS menyimpan sebelum memperbarui state/toast, dengan validasi dasar dan sinkronisasi antar-tab. Jam informasi/badge tidak mengubah availability. Harga/diskon, kalender, dan profil profesional tetap di menu masing-masing. FAQ, legal berversi, SEO, branding menyeluruh, dan upload nyata belum menjadi CMS penuh.
- Verifikasi memakai izin checker/tes terfokus sebelumnya: TypeScript exit 0 dan 36/36 tes. Tidak menjalankan Git/dev/build; QA browser/backend tetap diperlukan. Rincian field: `CMS_AUDIT.md`.

## 2026-10-22 - Panduan Fitur dan Aksi per Role

- Developer meminta penjelasan aksi pembatalan setelah lunas dan reschedule psikolog, serta MD berisi fitur/fungsi/cara kerja tiap role. Dibuat `PANDUAN_FITUR_PER_ROLE.md` berdasarkan pembacaan source, bukan menambah aturan bisnis baru.
- Panduan membedakan penghentian satu booking/rencana, reschedule sesi yang sama, pembuatan appointment sesi berikutnya, dan booking rencana baru. Cakupan batal bukan seluruh layanan semua pasien; pembayaran/audit tidak dihapus.
- Fitur prototype, simulasi login, kontrak backend, placeholder profil, ekspor ringkasan vs backup penuh, dan timeline audit yang belum lengkap diberi batasan eksplisit. Temuan baru dicatat di KNOWN_ISSUES/TODO untuk ditindaklanjuti terpisah.
- Sesi dokumentasi ini tidak mengubah source aplikasi dan tidak menjalankan Git, dev server, build, test, atau checker baru.

## 2026-10-22 - Hapus Panel Reservasi Sebelumnya

- Developer tidak menginginkan banner Reservasi sebelumnya maupun aksi Lanjutkan reservasi/Lepaskan, belum membayar pada dashboard pasien. Panel dan action facade pelepasan manual pasien dihapus.
- Penguncian slot sementara, expiry, pemulihan data di alur Booking Konsultasi, serta pencocokan bukti tetap dipertahankan sebagai mekanisme internal. Tidak menghapus hold, booking, atau pembayaran tersimpan sebagai efek penghapusan panel.
- Pesan guard booking tidak lagi mengarahkan pengguna ke tombol pelepasan yang sudah dihapus. Perubahan ini tidak menambahkan pembatalan otomatis appointment atau mengubah DP.

## 2026-10-22 - Formulir Pre-Test Lebih Padat

- Layout langkah 2 booking dipadatkan tanpa menghapus field atau mengubah payload/validasi/snapshot pre-test dan proses reservasi berikutnya.
- Empat field pekerjaan/kontak darurat tersusun satu baris pada desktop lebar, responsif dua kolom dengan pekerjaan/telepon lebar penuh pada ponsel. Pilihan keluhan tetap multi-select, memakai checkbox pada grid dua/empat kolom.
- Deskripsi keluhan dan harapan konsultasi berdampingan pada layar memadai; textarea lebih pendek dan tetap dapat diperbesar. Slider stres, dropdown tidur, serta footer memakai jarak lebih rapat dan kontrol tinggi 40 px; target pilihan keluhan minimal 44 px.
- Padding langkah 2 dan heading diperkecil. Indikator wizard menampilkan label langkah aktif saja pada ponsel, seluruh label pada layar lebih besar; nomor langkah tetap tampil. Tombol kembali memakai ikon ber-tooltip pada ponsel.
- Verifikasi memakai izin checker/tes sebelumnya; QA visual/keyboard/perangkat tetap diperlukan. Tidak menjalankan Git, dev server, atau build.

## 2026-10-22 - Pemilihan Layanan Horizontal dan Notes Terbuka

- Sesuai arahan developer, kartu layanan booking ditampilkan satu baris horizontal dengan scroll-snap, swipe/trackpad, dan ikon panah; tidak lagi menumpuk menjadi beberapa baris kartu. Lebar kartu mengikuti ruang yang tersedia.
- Kartu membedakan kategori lewat ikon/aksen warna, menampilkan nama lengkap, harga efektif per layanan/sesi, durasi, metode, badge, dan dua manfaat awal. Rincian lengkap dibuka dalam dialog, bukan memperpanjang daftar ke bawah.
- Catatan layanan selalu memiliki area sendiri pada kartu, tanpa klik rincian dan tanpa pemotongan teks. Field kosong menampilkan "Tidak ada catatan tambahan"; tidak mengarang notes atau mengubah paket custom/legacy.
- Pencarian mencakup notes, filter kategori/urutan dan pagination enam layanan dipertahankan. Pemilihan radio, penguncian profil, tarif/diskon, serta flow booking/pembayaran tidak diubah.
- Verifikasi: TypeScript exit 0 dan 25/25 tes regresi, termasuk tiga tes render statis katalog. Belum QA visual/swipe/dialog browser; tidak menjalankan Git, dev server, atau build.

## 2026-10-22 - Konfirmasi Manual Keterlambatan dan Reschedule Tanpa DP Kedua

- Pasien terlambat/tidak hadir ditindaklanjuti melalui konfirmasi manual oleh psikolog yang menangani. Tidak ada batas menit yang otomatis mengubah status, menghanguskan sesi, atau membatalkan booking.
- Sesuai hasil konfirmasi, psikolog dapat melanjutkan konsultasi pada booking terkonfirmasi atau menetapkan jadwal pengganti minimal H+1 dengan slot/kuota yang valid. Pembatalan tetap manual oleh psikolog, dengan syarat pelunasan yang sudah ditetapkan sebelumnya.
- Jika sudah `NO_SHOW`, psikolog dapat memindahkan appointment yang sama menjadi `CONFIRMED` pada jadwal pengganti. Tidak membuat sesi tambahan atau mengubah nomor/jatah rencana; histori ketidakhadiran dan alasan tetap tersimpan. Admin/pasien tidak dapat membuka kembali `NO_SHOW` sendiri.
- DP Rp100.000 hanya pada awal booking/rencana dan mengurangi total. Reschedule mempertahankan DP, cicilan, saldo, dan audit verifikasi; tidak memerlukan DP, bukti, atau tagihan baru. Booking rencana baru setelah empat sesi tetap transaksi baru, bukan reschedule.
- Aksi ikon jadwal pengganti tersedia di Riwayat Sesi psikolog serta Paket Berjalan untuk sesi `NO_SHOW`. Service kontrak `PATCH /psychologist/appointments/:id/reschedule` disiapkan; backend belum tersedia.
- Verifikasi lanjutan memakai izin checker/tes terfokus sebelumnya: TypeScript exit 0 dan 22/22 tes lolos. Belum QA browser; tidak menjalankan Git, dev server, atau build.

## 2026-10-21 - Perbaikan Tujuh Temuan FE

- Atas permintaan developer, mutasi workflow prototype diserialkan dengan satu Web Lock lintas-tab, bukan lock per tanggal. Browser tanpa Web Locks menolak mutasi sensitif. Jaminan antarperangkat tetap tugas Laravel/MySQL.
- Appointment, hold, pasien walk-in baru, dan kasus pencocokan pembayaran memakai snapshot atomik pada key appointment. Simpan dilakukan sebelum state/toast sukses; controller booking/pre-test tidak mempublikasikan hasil sebelum facade melakukan persistensi.
- Hold lokal aktif sebelum instruksi rekening. Default sementara 15 menit melalui env prototype; TTL produksi belum final. Reservasi dapat dilanjutkan setelah refresh dan hanya dapat dilepas dengan konfirmasi belum transfer.
- Transfer setelah expiry atau perubahan quote menyimpan bukti sebagai kasus OPEN sekali per hold. Admin membantu booking pengganti minimal H+1 dan memverifikasi penerimaan aktual. Tidak meminta transfer ulang, tidak auto-cancel/refund, dan tidak menambah uang masuk hanya karena ada bukti.
- Informed consent harus disetujui sebelum rekening ditampilkan dan sebelum booking final. Quote baru tidak boleh diam-diam mengganti snapshot hold.
- FULL walk-in tetap menunggu verifikasi; ledger baru menjadi kas setelah verifier tersimpan. Tanggal diterima dicatat terpisah dari waktu input, termasuk untuk pencocokan pembayaran lama.
- Cookie Sanctum di-URL-decode ke header CSRF; mutasi menyiapkan cookie jika belum ada. Pilihan jam memakai identitas stabil; modal/receipt membaca entity terbaru berdasarkan ID; encoding ekspor dibedakan per format.
- Developer mengizinkan tes terfokus, memperluas izin checker sebelumnya: 17/17 tes logika lolos dan TypeScript exit 0. Tidak menjalankan Git, dev server, build, atau E2E browser.
- Kebijakan no-show belum dijawab; tidak ada perubahan otomatis jatah, status completed, atau fitur sesi pengganti pada revisi ini.

## 2026-10-21 - Izin Verifikasi TypeScript

- Developer mengizinkan `npx tsc --noEmit` secara eksplisit. Perintah dijalankan dan selesai dengan exit code 0, tanpa error; tidak memerlukan perubahan source.
- Izin ini hanya untuk TypeScript checker, tidak mengizinkan Git, dev server, build, atau test runtime. Kelulusan tipe tidak menutup isu flow/concurrency/storage atau menggantikan QA browser.

## 2026-10-21 - Tindak Lanjut Audit Flow

- Pasien dan psikolog melihat jumlah terbayar dari total serta sisa tagihan berdasarkan ledger appointment pertama. Admin tetap tidak membaca tarif/nominal tersimpan; input penerimaan hanya satu arah.
- Walk-in wajib memasukkan nominal aktual dan fase DP/FULL. Fase FULL tidak otomatis menciptakan kas sebesar harga paket. Psikoterapi tetap dimulai dengan DP, bukan FULL awal.
- Laporan/CSV/Excel/PDF mengikuti setiap event uang diterima, bukan tanggal konsultasi. `receivedAt` berbeda dari `recordedAt`; data historis tanpa tanggal penerimaan diberi label estimasi. Reschedule tidak memindahkan periode kas.
- Katalog booking memakai pencarian, kategori, urutan nama/harga, pagination enam layanan, dan rincian. Paket custom tidak dihapus. Harga lintas-tab disinkronkan; perubahan total membutuhkan persetujuan ulang dan validasi expected total saat submit.
- Perubahan jam/libur/kuota ditahan jika berbenturan dengan booking aktif. Penyelesaian bentrok melalui reschedule appointment, bukan pembatalan otomatis.
- Sesi baru mempertahankan referensi plan/snapshot yang relevan, tetapi tidak mewarisi histori reschedule, status, atau penerimaan awal sesi sebelumnya.
- Reservasi sementara **server-side** sebelum menampilkan instruksi transfer adalah arah integrasi. Service `/slot-holds` baru kontrak, belum aktif pada mock. Masa berlaku dan rekonsiliasi uang yang ditransfer setelah expiry belum ditentukan; jangan menghapus bukti/uang masuk karena slot kedaluwarsa.
- Snapshot LocalStorage yang dapat tertimpa mutasi paralel dan kegagalan quota storage tetap isu terbuka. Produksi memerlukan API sebagai sumber data, transaction + row lock kapasitas/ledger, revalidasi, serta idempotency; bukan sekadar menambahkan URL backend.
- Tidak menjalankan Git, dev server, build, test, atau TypeScript checker pada revisi ini tanpa izin developer.

## 2026-10-01

- Project menggunakan React, TypeScript, dan Vite.
- Dokumentasi utama dikelola di vault Obsidian `docs/Psikolog`, dengan dokumen aktif di folder `Live Docs`.
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

## 2026-10-05

- **58. Restrukturisasi Paket Layanan Resmi dari Dokumen Klien (`docs/paket untuk website.pdf`)**:
  - Mengintegrasikan 15 paket resmi:
    1. **Konseling (5 paket)**: Konsultasi Offline (Rp 900.000 / 60m), Konsultasi Telelayanan (Rp 750.000 / 60m), Konsultasi Anak & Remaja (Rp 900.000 / 60m), Konsultasi Dewasa (Rp 900.000 / 60m), Konsultasi Pasangan & Keluarga (Rp 1.500.000 / 60m). Catatan: Kelebihan waktu dihitung prorata 25% per 15 menit, surat laporan terpisah Rp 200.000.
    2. **Asesmen (9 paket)**: Asesmen Psikologis Dasar (Rp 350.000 / 90m), Asesmen Psikologis Lengkap (Rp 1.500.000 / 180m pengerjaan tes 2-4 jam include laporan resmi bertanda tangan SIP), Tes Intelegensi IQ (Rp 750.000 / 90m), Tes Kepribadian Standar (Rp 500.000) & Lengkap (Rp 900.000), Asesmen Anak & Remaja Standar (Rp 500.000) & Lengkap (Rp 900.000), Asesmen Dewasa Standar (Rp 500.000) & Lengkap (Rp 900.000).
    3. **Psikoterapi (1 layanan)**: Psikoterapi Rp500.000 per sesi, 60 menit; minimum empat sesi per booking. Rp2.000.000 adalah proyeksi empat sesi sebelum diskon.
  - Paket lama dinonaktifkan (`isActive: false`) demi menjaga integritas data demo historis tanpa merusak relasi `packageId`.
- **59. Penyembunyian Harga di Awal Laman (Landing Page) & Pembatasan Akses Pasien**:
  - Sesuai permintaan keluarga psikolog / klien, di awal laman (Landing Page publik) hanya menampilkan nama paket, deskripsi, durasi, dan fasilitas. Nominal harga disembunyikan untuk pengunjung yang belum sign in.
  - Kartu paket menampilkan banner informatif: `🔒 Rincian Tarif & Jadwal Tersedia setelah Sign In Akun`.
  - Tombol CTA mengarahkan pengunjung ke modal Sign In / Pendaftaran. Setelah pasien masuk akun, nominal harga resmi ditampilkan.
  - Ditambahkan filter tab kategori (Semua, Konseling, Asesmen, Psikoterapi) di Landing Page dan Portal Pasien.
- **60. Penguncian Pemilihan Paket Berbasis Kelengkapan Data Diri Pasien (`isProfileComplete`)**:
  - Pasien yang belum mengisi data diri lengkap (Nama, No HP/WA, Tanggal Lahir, Jenis Kelamin, Domisili/Kota, Pekerjaan, Kontak Darurat) dilarang memilih paket.
  - Kartu paket berstatus terkunci (`locked`), dan mengklik kartu paket akan membuka modal "Lengkapi Data Diri Pasien".
  - Setelah data diri diisi dan disimpan via `updateUserProfile`, status profil terverifikasi lengkap (`isProfileComplete: true`), paket otomatis terbuka (unlocked), dan pasien dapat memilih paket serta jadwal konsultasi.
- **61. Transisi ke Sistem Pembayaran DP Flat Rp 100.000 (Biaya Administrasi) & Nama Pengirim Wajib**:
  - Skema pembayaran DP diubah dari persentase 50% menjadi **DP Flat Rp 100.000** sebagai biaya administrasi dan penguncian jadwal reservasi klinik.
  - Sisa pembayaran (`harga paket - 100.000`) dilunasi saat pasien hadir di klinik / setelah sesi konsultasi.
  - Menambahkan input wajib: Nama Pemilik Rekening / Nama yang Transfer (`transferSenderName`) dan unggah bukti transfer DP Rp 100.000 (`paymentProofUrl`) untuk memudahkan rekonsiliasi mutasi rekening bank oleh tim administrasi.
- **62. Resolusi Tuntas Bug Horizontal Overflow Lebar Halaman Dashboard Psikolog**:
  - Memasang `html, body { overflow-x: hidden; max-width: 100vw; width: 100%; }` pada `index.css`.
- **63. Rombak Desain Seluruh Modal Menjadi Modern Simple Light**:
  - Mengeliminasi seluruh modal ber-header gradient gelap pekat (`slate-900`, `sky-950`, `purple-950`) yang kaku dan dinilai jelek oleh user.
  - Menerapkan desain **Modern Simple Light**: header putih bersih (`bg-white border-b border-slate-100`), kontainer ikon soft pastel (`bg-teal-50 text-teal-600`), tipografi tebal minimalis, tombol aksi terstandarisasi warna teal, dan form input bersih.
  - Berlaku pada: Form Tambah/Edit Paket (`PackagesTab`), Pratinjau Kartu Paket, Detail Pasien & Rekam Pre-test (`PatientDetailModal`), Modal Cetak Kop Resmi (`OfficialPrintModal`), Form Booking Walk-In (`ReservationsTab`), dan Modal Baca Ulasan (`ReviewsTab`).
- **64. Eliminasi Total Blueprint & Menu Switcher Akun Demo, Penggantian Menjadi Tombol Sidebar Collapse Global**:
  - Menghapus menu titik 3 ("Pilih Akun Demo (Testing)") dan Blueprint Mode.
  - Otentikasi dialihkan ke login nyata (Email/Username dan Password) serta simulasi Google SSO OAuth siap Laravel Socialite.
  - Tombol switcher di Navbar diganti menjadi tombol **Sidebar Collapse Toggle** (`PanelLeftClose`/`PanelLeftOpen`) yang tersinkronisasi global melalui `AppContext` (`isSidebarCollapsed`, `toggleSidebar`), dan secara otomatis **TIDAK DITAMPILKAN** di Landing Page (Guest).
- **65. Pembatasan Ketat Hak Akses Admin (Strict Read-Only User Monitoring) & Redesain Moderasi Ulasan**:
  - Admin dilarang melakukan operasi Create, Update, Delete data di luar reservasi pelanggan yang walk-in.
  - Tombol blokir / buka blokir / modifikasi akun pasien dan dokter di `UsersTab` dihapus; admin hanya memiliki hak pemantauan *Read-Only Monitoring*.
  - Redesain bagian ringkasan ulasan di `ReviewsTab`: menghadirkan Card Metrik Terpadu (Skor 4.7/5.0, progress bar distribusi rating 5-1 bintang interaktif, dan filter pills status Menunggu/Disetujui yang rapi).
- **66. Fitur Unggah & Edit Foto Wajah Profil Psikolog**:
  - Menyediakan input upload foto wajah (`FileReader` DataURL) di `ProfileTab.tsx` lengkap dengan tombol ganti dan hapus foto.
  - Foto wajah psikolog terhubung ke `PsychologistProfile.avatarUrl` dan `User.avatar`, serta ditampilkan di seluruh sistem: Live Preview Card, Overview Dashboard, Landing Page, dan Avatar Navbar.
- **67. Eliminasi Footer pada Seluruh Dashboard Masuk & Penyediaan Akses Cepat Login**:
  - Komponen `<Footer />` kini hanya dirender pada Landing Page publik (`currentRole === 'GUEST'`), sehingga area dashboard Pasien, Psikolog, dan Admin tampil bersih, luas, dan profesional tanpa distraksi footer di bawah.
  - Pada `LoginModal.tsx`, selain mendukung input email/password riil dan Google SSO, disediakan chip **Akses Cepat Testing** (`[🩺 Psikolog]`, `[🛡️ Admin]`, `[👤 Pasien]`) yang sekali klik otomatis mengisi kredensial resmi pengujian.
- **68. Navbar Sticky dengan Animasi Transisi & Tombol Hamburger Sidebar Collapse**:
  - Menambahkan event listener scroll window untuk mendeteksi `isScrolled` (> 15px) dengan elevasi bayangan halus (`shadow-md shadow-slate-900/5`), transisi tinggi/padding mulus, dan latar belakang blur semitransparan.
  - Mengubah tombol toggle collapse sidebar di Navbar dari ikon panel menjadi **Hamburger Icon** (`Menu` dari `lucide-react`) dengan rotasi halus saat aktif.
- **69. Standarisasi Universal Tata Letak Tabel & Paginasi (Search di Kiri, Filter di Kanan, Pagination di Bawah)**:
  - Seluruh tabel di seluruh peran (`UsersTab`, `ReservationsTab`, `PackagesTab`, `HistoryTab` Psikolog, `HistoryTab` Pasien) distandarisasi secara seragam:
    - Sisi Kiri: Input teks pencarian fleksibel dengan ikon Search.
    - Sisi Kanan: Segmented pills status / dropdown filter kategori.
    - Sisi Bawah: Baris navigasi pagination yang menampilkan nomor item, tombol Previous/Next, dan nomor halaman.
- **70. Penghapusan Hak Cetak Jadwal dari Admin & Pembatasan Aksi Booking Admin**:
  - Hak cetak jadwal operasional dinas resmi dicabut dari dashboard Admin; Admin dilarang/tidak perlu mencetak jadwal (hanya boleh diekspor oleh Psikolog/Pengelola).
  - Admin hanya boleh melakukan verifikasi/konfirmasi pembayaran booking. Aksi pembatalan, penghapusan, dan penandaan selesai konsultasi dicabut dari tabel reservasi admin.
- **71. Pembersihan Banner Profil Dokter di Overview Psikolog & Terminologi SOAP**:
  - Menghapus kartu banner identitas dokter ("Praktik Mandiri Aktif... SIP... dr. Sarah Jenkins... Status Layanan: Siap Melayani Pasien") di bagian atas `OverviewTab.tsx` agar dashboard psikolog langsung menampilkan ringkasan data dan KPI operasional.
  - Seluruh terminologi medis SOAP dibersihkan dari sistem dan diganti menjadi "Rekam Medis Pasien".
- **72. Penyiapan CMS Media & Gambar Branding Website (Logo JiwaSehat, Banner Hero, Foto Klinik, QRIS DP)**:
  - Menambahkan Accordion 4 pada CMS Landing Page (`CmsTab.tsx`) untuk pengelolaan gambar branding: Logo Website JiwaSehat (terhubung ke Navbar dengan fallback ikon HeartHandshake), Gambar Hero Banner, Foto Ruang Fasilitas Klinik, dan Barcode QRIS Pembayaran DP Rp 100.000, lengkap dengan tombol preset sampel gambar dan pratinjau instan.
- **73. Perbaikan Z-Index Tooltip Universal**:
  - Memastikan popover Tooltip menggunakan `z-[99999]` dan kontainer hover menggunakan `hover:z-[9999]` agar tooltip tidak pernah tertutup oleh baris tabel, modal, atau kartu lain.

- **74. Eliminasi Total Card Mobile "Pilih Menu ▾" di Seluruh Dashboard & Pemusatan Navigasi ke Hamburger Navbar**:
  - Seluruh elemen card dropdown navigasi mobile (`[Pilih Menu ▾]`) pada `AdminDashboard.tsx`, `PsychologistDashboard.tsx`, dan `PatientDashboard.tsx` dihapus sepenuhnya.
  - Navigasi mobile diintegrasikan langsung ke tombol Hamburger di Navbar atas. Saat di mobile (`< lg`), mengklik tombol hamburger akan memunculkan Mobile Navigation Drawer (slide-down) yang bersih, menampilkan daftar tab menu peran aktif (Admin, Psikolog, Pasien) lengkap dengan ikon dan badge. Saat di desktop (`>= lg`), tombol hamburger tetap mengontrol perluasan/pengecilan sidebar utama dashboard.
- **75. Perbaikan Sticky Navbar & Animasi Scroll Transisi Halus**:
  - Masalah terhentinya `position: sticky` Navbar akibat batasan W3C CSS stacking context diperbaiki dengan menghapus properti `overflow-x-hidden` dari container root di `src/App.tsx`, dan menerapkan aturan `overflow-x: clip` pada `html, body` di `src/index.css`.
  - Header Navbar dinaikkan ke level elevasi `z-[60]` dengan animasi transisi yang mulus saat scrolling: tinggi mengecil dari `h-16` ke `h-14`, background `bg-white/95 backdrop-blur-md` dengan border teal lembut dan glow indicator line di dasar header.
- **76. Pembaruan Komponen Tooltip Menggunakan React Portal & Fixed Positioning Anti-Clipping**:
  - Komponen `src/components/common/Tooltip.tsx` dirombak total menggunakan `createPortal(..., document.body)` dengan koordinat `fixed` dinamis dari `getBoundingClientRect()` dan `z-index: 999999`.
  - Hal ini menjamin bahwa tooltip tidak akan pernah terpotong (*clipped*) oleh kontainer tabel berkursif `overflow-x: auto` atau tertutup oleh elemen bertingkat stacking context manapun.
- **77. Alur Autentikasi Email Tunggal di Landing Page (Tanpa Tab Register)**:
  - Form pendaftaran kata sandi terpisah dihapus total (*"gaada register"*). Autentikasi disederhanakan murni berbasis input Alamat Email (dan opsi Google SSO).
  - Alur cerdas pengecekan email:
    - Jika email sudah terdaftar: langsung masuk ke akun (`loginAs`).
    - Jika email belum terdaftar: otomatis dibuatkan akun pasien baru dengan status `isProfileComplete: false`, dan langsung login.
- **78. Modal Pengisian Form Data Diri Pasien Wajib (`PatientMandatoryProfileModal`)**:
  - Pasien baru atau pasien yang belum melengkapi data diri (`isProfileComplete !== true`) wajib mengisi data diri lengkap terlebih dahulu sebelum dapat memilih paket, memesan jadwal, atau mengikuti tes asesmen (*"harus melakukan isi form itu baru bisa ngapa ngapain"*).
  - Modal ini bersifat imperatif dan tidak dapat ditutup sebelum seluruh form lengkap diisi (Nama Lengkap, Nomor HP/WhatsApp, Tanggal Lahir, Jenis Kelamin, Kota Domisili, Pekerjaan, dan Kontak Darurat Kerabat).
  - Setelah data diri disimpan, profil diperbarui ke `isProfileComplete: true` dan pasien langsung diarahkan ke pemilihan paket/booking.
- **79. Halaman Khusus Form Data Diri Pasien Baru (`PatientProfileCompletionPage.tsx`) Tanpa Sidebar**:
  - Pasien baru atau pasien yang belum melengkapi profil (`!currentUser.isProfileComplete`) langsung diarahkan ke Halaman Penuh Khusus (*Dedicated Full-Width Page*) untuk melengkapi data diri (Nama Lengkap, WhatsApp, Tanggal Lahir, Jenis Kelamin, Kota Domisili, Pekerjaan, Kontak Darurat Kerabat).
  - Halaman ini berada di luar sistem sidebar navigasi pasien dan drawer menu di Navbar disembunyikan sampai data diri tuntas disimpan, sehingga pengguna tidak dapat melewati alur ini sebelum melengkapi data.
  - Disediakan tombol helper pengujian "Isi Otomatis Data Sampel" untuk mempermudah testing.
- **80. Standarisasi Universal React Portal & Level Elevasi Z-Index Modal (`z-[999999]`)**:
  - Semua modal dan overlay dialog di seluruh aplikasi (`PatientDetailModal`, `LoginModal`, modal edit profil di `Navbar`, modal bio di `LandingPage`, form walk-in `ReservationsTab`, modal review di `ReviewsTab`, seluruh modal di `PackagesTab`, modal detail & review di `HistoryTab`, `RescheduleModal`, `OfficialPrintModal`, modal profil cadangan di `BookingTab`, dan `ExportFinanceModal`) dibungkus menggunakan `createPortal(..., document.body)` dan dinaikkan ke level `z-[999999]`.
  - Hal ini memecahkan masalah stacking context dan menjamin 100% modal tidak pernah tertabrak atau tertutup oleh sticky Navbar (`z-[60]`).
- **81. Pembersihan Biaya Awal / Nominal DP dari Kartu Profil Publik di Landing Page**:
  - Menghapus tampilan biaya awal ("DP Awal 50% Rp 187.500") dari kartu profil psikolog publik di Landing Page sebelum login.
  - Digantikan dengan lencana status operasional ramah pasien: *"Praktik Tatap Muka Terjadwal"*.
- **82. Resolusi Asinkron State Bug Login Pasien Baru (`loginWithEmail`)**:
  - Memperbaiki masalah `setUsers` asinkron pada `AppContext.tsx` saat pasien baru mendaftar dengan email baru.
  - Objek array pengguna terbaru (`nextUsers`) langsung dioper ke `loginAs('PATIENT', newId, nextUsers)` sehingga `authController.loginAs` tidak lagi melempar ApiError 404 (*"Pengguna tidak ditemukan dalam sistem"*).
- **83. Visibilitas Responsif Tombol Hamburger Navbar (`lg:hidden`)**:
  - Tombol hamburger navigasi di Navbar dihilangkan pada layar besar/desktop (`lg:hidden`) karena fungsi perkecil/perluas menu sudah tersedia langsung di dalam sidebar dashboard masing-masing.
  - Pada layar kecil/mobile (`< lg`), tombol hamburger langsung ditampilkan untuk membuka slide-down Mobile Navigation Drawer.
- **84. Ornamen SVG Wave Organik & Integrasi Foto Dinamis Psikolog di Landing Page**:
  - Menambahkan ornamen gelombang SVG Wave lengkung pada batas bawah Hero section (transisi ke `bg-slate-50`) dan batas atas CTA footer (transisi ke `bg-slate-900`) untuk estetika visual organik, bersih, dan elegan khas layanan kesehatan mental.
  - Sesuai instruksi developer/klien, fitur floating scroll bar dan auto-scroll dihilangkan agar antarmuka tetap simpel, ringan, dan tidak berlebihan (*"wave aja cukup"*).
  - Mengintegrasikan penayangan foto psikolog resmi dr. Sarah Jenkins secara dinamis (`soloPsychologist?.avatarUrl || soloUser?.avatar`) di kartu Hero dan Modal Bio Dokter dengan bingkai elegan dan status dot aktif, siap tersinkronisasi dua arah ke backend Laravel.

## 2026-10-06

- Best Practice Paket Multi-Sesi / Treatment Plan:
  - Paket berisi banyak sesi diputuskan memakai model `treatment_plan` sebagai induk program, bukan membuat seluruh appointment sekaligus di awal.
  - Appointment dibuat bertahap per pertemuan. Pasien memulai dari sesi pertama, lalu psikolog menjadwalkan sesi berikutnya setelah sesi sebelumnya selesai atau sesuai keputusan klinis.
  - Psikolog/pengelola menjadi satu-satunya role yang boleh menandai sesi `COMPLETED` dan menjadwalkan sesi lanjutan. Admin tetap hanya konfirmasi pembayaran/booking dan moderasi review.
  - Backend wajib menggunakan transaction, unique constraint `(treatment_plan_id, continuous_session_number)`, index jadwal, dan idempotency key pada endpoint pembuatan sesi lanjutan untuk mencegah double booking/double click.
  - Pembayaran paket multi-sesi tidak dihitung berulang di setiap appointment lanjutan; pembayaran melekat ke treatment plan/invoice, sementara appointment lanjutan hanya jadwal pertemuan dan rekam progres.
- Scope tes dikunci menjadi **pre-test profiling** saja untuk kebutuhan booking dan persiapan sesi. Test psikolog tambahan/asesmen mandiri tidak aktif di portal pasien pada scope sekarang.
- Psikolog/pengelola membutuhkan tab khusus **Paket Berjalan / Rencana Terapi** untuk memantau progres paket multi-sesi, sesi selesai, sesi berikutnya, dan status aktif/selesai/dihentikan.
- Notifikasi WhatsApp/email diputuskan sebagai tanggung jawab backend produksi, termasuk reminder jadwal harian ke psikolog yang memuat jam sesi, nama pasien, ringkasan pre-test/profil, dan tautan detail web.
- Invoice/kwitansi wajib memuat DP flat Rp100.000, sisa pelunasan, metode/channel pembayaran, nama pengirim, status pembayaran, dan bukti pembayaran. Identitas transaksi memakai nomor invoice/booking; nomor referensi transfer tidak dipakai.
- Kebijakan no-show/telat/cancel dikelola oleh psikolog/pengelola. Admin tetap tidak boleh cancel, hapus, no-show, discontinue, atau menandai sesi selesai.
- Consent & privacy perlu tersedia sebagai halaman/kebijakan dan harus disetujui pasien sebelum booking final. Pre-test wajib diberi disclaimer sebagai profiling awal, bukan diagnosis otomatis.
- Backup/export data klinis diperlukan untuk owner/psikolog dengan role protection dan audit log.
- Potongan harga ditambahkan sebagai layer perhitungan sebelum DP dan hanya diatur oleh psikolog/pengelola dari Manajemen Paket. Pasien tidak memakai kode promo, dan admin tidak mengatur potongan.
- Data appointment menyimpan harga sebelum potongan, label potongan, nominal potongan, total setelah potongan, DP, dan sisa pelunasan agar invoice tetap audit-able.
- Admin walk-in tidak lagi memilih psikolog yang melayani dan tidak melihat nominal harga. Booking admin memakai psikolog/pengelola utama sebagai default karena scope praktik saat ini satu owner/psikolog utama; admin hanya mengurus data pasien, bukti/metode pembayaran, dan konfirmasi status.
- Tab **Paket Berjalan** menampilkan pembayaran paket di tabel supaya psikolog bisa melihat real case manajemen paket: total setelah potongan, nominal potongan, DP, dan sisa pelunasan tanpa membuka invoice pasien.
- Guard sesi lanjutan dipertegas: psikolog hanya bisa menjadwalkan sesi berikutnya jika sesi terakhir sudah `COMPLETED`, belum ada sesi aktif berikutnya, dan paket belum selesai.
- Scope test psikolog/DASS dinonaktifkan pada tahap awal, lalu seluruh model/type/controller/state legacy dihapus dari source aktif. Scope booking-first hanya memakai pre-test profiling.
- Wording marketing terkait klaim legalitas layanan yang terlihat di UI publik dibersihkan agar landing page tidak memakai klaim lembaga/organisasi yang tidak diminta klien.
- Admin diperbolehkan membantu reschedule pasien, tetapi tidak diberi akses batal/hapus/complete. Semua reschedule menyimpan audit pelaku (`rescheduledByName`, `rescheduledByRole`, `rescheduledAt`, `rescheduleReason`) dan tampil di detail jadwal serta receipt.
- Kwitansi tidak dibuat sebagai menu admin terpisah. Setelah DP/konfirmasi pembayaran, admin hanya mendapat modal receipt administratif untuk screenshot atau Print / Simpan PDF tanpa menampilkan nominal harga.
- Pengelolaan diskon ditempatkan langsung pada form tambah/edit paket dengan kondisi aktif/nonaktif yang jelas. Psikolog dapat menambahkan, mengubah jenis/nilai/label, atau menghapus diskon; pasien tidak memasukkan voucher atau kode promo.
- `docs/Psikolog/Live Docs` menjadi satu-satunya sumber dokumentasi aktif. Hardlink lama di root `docs/` dan snapshot usang `docs/Psikolog/Project Docs` dihapus agar tidak ada tiga versi dokumentasi yang membingungkan.
- Laporan keuangan dibatasi menjadi arus kas/uang masuk murni dari paket. Frontend tidak mengelola biaya operasional, pengeluaran, atau laba bersih.
- Admin menjadi pencatat pelunasan aktual: admin memasukkan nominal yang diterima tanpa melihat target tagihan, dan nominal tidak ditampilkan kembali setelah submit. Psikolog tetap dapat melihat agregasinya pada laporan uang masuk.
- Status pembayaran dan status konsultasi dipisahkan. Admin mengubah `DP_PAID` menjadi `PAID` melalui pencatatan pelunasan, sedangkan psikolog menandai sesi `COMPLETED`.
- WhatsApp dipilih sebagai kanal notifikasi utama untuk event operasional. Email hanya fallback/pengiriman dokumen dan keduanya baru dikirim melalui backend/provider resmi.
- Frontend menggunakan Web Locks API dengan fallback lock LocalStorage per psikolog/tanggal serta validasi ulang appointment terbaru untuk booking/reschedule. Backend tetap wajib memakai transaction/constraint karena locking frontend tidak dapat memberi jaminan produksi.
- Backend final ditetapkan menggunakan Laravel 12+ REST API, sedangkan frontend tetap berupa React/Vite TypeScript SPA terpisah.
- Database final ditetapkan menggunakan MySQL 8+.
- Architecture Blueprint internal, mode demo `PLATFORM/BLUEPRINT`, dan seluruh modul DASS/test psikolog legacy dihapus dari source aktif.
- Keputusan penghapusan telelayanan lama dibatalkan oleh data katalog terbaru. Scope aktif mendukung tatap muka dan telelayanan terjadwal, tetap tanpa ruang chat; pre-test profiling tetap menjadi syarat booking dan bukan diagnosis.
- `src/services/api/` menjadi kontrak integrasi frontend ke Laravel. Selama backend belum tersedia, AppContext tetap memakai mock/LocalStorage agar prototype dapat digunakan.
- Halaman dashboard role dimuat secara lazy dan penulisan LocalStorage didebounce sebagai optimasi awal. Profiling browser dan QA perangkat nyata tetap diperlukan.
- Paket Berjalan memakai tabel pada desktop dan kartu khusus pada ponsel. Psikolog dapat menghentikan paket dengan alasan, dan paket yang dihentikan tidak dapat dijadwalkan kembali.
- Review hanya dapat dikirim untuk appointment `COMPLETED` dan satu appointment hanya boleh memiliki satu review aktif.
- Harga layanan hanya bersumber dari paket. Field tarif online/offline pada profil psikolog dihapus dari seluruh kontrak frontend.
- Catatan SOAP tidak termasuk scope sistem booking dan dihapus total dari state, model, mock, endpoint, serta UI frontend.
- Booking walk-in admin dipisahkan dari booking mandiri pasien hanya untuk pendaftaran pasien dan kewajiban pre-test awal. Tanggal konsultasi untuk semua booking, termasuk walk-in admin, tetap wajib minimal H+1 serta tunduk pada jam praktik, hari libur, kuota, overlap, dan durasi paket.
- Semua reschedule wajib memilih tanggal pengganti minimal H+1 dari hari pengajuan; tidak ada reschedule ke hari yang sama.
- Harga, diskon, total akhir, dan DP tidak dipercaya dari payload UI. Prototype menghitung ulang seluruh nominal dari paket aktif; backend Laravel wajib menerapkan prinsip yang sama.
- Pasien yang melakukan reschedule pada booking terkonfirmasi mengembalikan status ke `PENDING` untuk konfirmasi admin, sedangkan reschedule yang dibantu admin mempertahankan status sebelumnya.
- Guard frontend wajib memeriksa role, kepemilikan resource, serta transisi status. Guard ini untuk konsistensi UX dan bukan pengganti Laravel Policy/middleware.
- Admin wajib memeriksa bukti pembayaran melalui modal verifikasi. Satu aksi mengubah pembayaran menjadi `DP_PAID` dan booking menjadi `CONFIRMED`, disertai audit admin; jalur konfirmasi langsung tanpa verifikasi dihapus.
- Penjadwalan sesi berikutnya hanya tersedia setelah pembayaran awal terverifikasi dan sesi terakhir selesai. Psikolog memilih slot aktual minimal H+1 dari availability engine, bukan memasukkan jam bebas.
- Appointment hanya dapat ditandai selesai setelah waktu sesi berakhir. Sesi terakhir yang selesai mengubah treatment plan menjadi `COMPLETED`.
- Modal verifikasi pembayaran admin tidak memakai checkbox deklarasi pemeriksaan. Aksi verifikasi dilakukan langsung setelah admin melihat bukti; catatan tetap opsional dan audit verifier tetap disimpan.
- Katalog dummy terbaru memakai 15 paket resmi: 5 Konseling, 9 Asesmen, dan 1 Psikoterapi. Konsultasi Telelayanan aktif dengan durasi 60 menit dan harga Rp750.000.
- Psikoterapi memakai tarif dasar Rp500.000 per sesi dengan rencana awal minimal 4 sesi. Rp2.000.000 adalah proyeksi empat pertemuan sebelum diskon, bukan tarif satu paket yang wajib dilunasi di muka.
- Telelayanan adalah metode sesi terjadwal melalui media yang dikonfirmasi setelah booking, bukan chat internal. Pemilihan provider dan penerbitan tautan aman menjadi pekerjaan backend.
- Nomor referensi pembayaran dihapus dari form pasien, walk-in, pelunasan, modal verifikasi, receipt, type, payload API, serta rancangan database. Bukti pembayaran, nama pengirim, metode/channel, nomor booking, dan nomor invoice sudah cukup untuk kebutuhan verifikasi manual saat ini.
- Toast pada ponsel ditempatkan dalam alur halaman di bawah navbar agar tidak menutupi kartu dashboard. Pada layar `sm` ke atas toast tetap fixed di kanan bawah.
- Tabel Manajemen Paket, Data Pasien, Jadwal Mingguan, Monitoring User, Moderasi Review, dan Transaksi memakai kartu/form mobile khusus; tabel desktop tetap dipertahankan. Footer modal utama dan receipt menumpuk vertikal pada ponsel agar tombol tidak terpotong.
- Audit mobile statis tidak dianggap sebagai pengganti QA perangkat nyata. Workspace pratinjau/ekspor dokumen tetap mempertahankan format kertas dan wajib diuji pada lebar 320/375/430 px.
- Ownership CRUD paket pada mock/controller dipindahkan dari `AdminController` ke `PsychologistController`. Route kontrak tetap `/api/v1/packages` dan backend wajib melindunginya dengan Policy psikolog/pengelola.

## Keputusan Klien - 19 Oktober 2026: Psikoterapi per Sesi dan Booking Ulang

- Katalog dipisah menjadi tiga kategori: Konseling, Asesmen, dan Psikoterapi. Paket asesmen adalah layanan yang dapat dipesan; mesin tes asesmen di web belum termasuk keputusan ini.
- Konseling telelayanan tetap dibooking di JiwaSehat. Pertemuan berlangsung lewat pihak ketiga, misalnya Google Meet; penyedia media dipilih sesuai kebutuhan psikolog. Website tidak menyediakan ruang chat atau video internal.
- Ketentuan kelebihan waktu dan biaya surat laporan cukup ditampilkan sebagai notes di detail paket saat ini. Otomasi tagihan tambahan belum diputuskan.
- Psikoterapi bertarif Rp500.000 **per sesi**, dengan rencana awal minimal empat pertemuan. Tarif katalog dan editor paket adalah nominal per sesi; proyeksi empat sesi dihitung hanya untuk transparansi saldo dan pembayaran bertahap.
- Diskon psikoterapi nominal/persentase berlaku pada tarif tiap sesi; migrasi paket resmi lama membagi diskon nominal paket empat sesi menjadi nilai per sesi agar total potongan tidak melonjak.
- Tidak ada fitur menambah jatah sesi di plan yang sama. Setelah sesi keempat selesai, jika psikolog menganjurkan terapi lanjutan, pasien melakukan booking baru untuk layanan psikoterapi dan memilih jadwal yang cocok. Booking baru memiliki kode, DP, dan ledger pembayaran baru; rekam medis klinis di luar web dapat melanjutkan penomoran sebagai sesi ke-5 dan seterusnya.
- Psikolog tetap menjadwalkan sesi ke-2 sampai ke-4 pada rencana awal secara bertahap. Admin memverifikasi DP, mencatat uang masuk, dan dapat membantu reschedule appointment yang sudah ada, tetapi tidak menambah sesi.
- DP flat Rp100.000 dibayar sekali per booking/rencana awal dan **mengurangi biaya pertemuan**, bukan biaya administrasi di luar tarif. Empat sesi bernilai proyeksi Rp2.000.000 sebelum diskon, sehingga saldo proyeksi setelah DP Rp1.900.000. Booking ulang memiliki DP baru yang mengurangi biaya rencana baru.
- Sisa dapat dibayar sekaligus setelah sesi pertama atau dicicil menurut kesepakatan pasien dan psikolog. Status `PAID` hanya jika seluruh saldo lunas; progres klinis dan progres pembayaran terpisah.
- Booking walk-in psikoterapi tidak memakai opsi lunas otomatis. Admin hanya mengonfirmasi DP awal; uang berikutnya dicatat setelah sesi pertama selesai sesuai kesepakatan.
- Appointment sesi ke-2 sampai ke-4 dibuat bertahap satu per satu, dengan tanggal minimal H+1 dan pemeriksaan ketersediaan slot. Booking ulang juga mengikuti H+1 dan validasi slot biasa.
- Audit flow memakai UML activity diagram PlantUML dengan swimlane di [[ACTIVITY_DIAGRAMS]], menggantikan flowchart Mermaid pada [[FEATURE_FLOWS]].

## Keputusan Developer - 21 Oktober 2026: Pembatalan dan Perbaikan Flow

- Pembatalan oleh psikolog menghentikan seluruh rencana terkait dan membatalkan seluruh sisa appointment. Sesi yang telah selesai serta histori uang masuk tetap dipertahankan.
- Pembatalan/penghentian hanya boleh dilakukan setelah tagihan rencana awal lunas (`PAID` dan saldo nol). Sistem tidak otomatis melakukan refund atau membuat sesi pengganti.
- Admin dapat mencatat pelunasan untuk penghentian sebelum sesi pertama dengan tujuan `CANCELLATION_SETTLEMENT`; kewenangan pembatalan tetap hanya psikolog. Cicilan biasa psikoterapi tetap setelah sesi pertama selesai.
- Tidak menambahkan fitur minta unggah ulang bukti maupun status `REUPLOAD_REQUIRED`. Bukti belum dapat dicocokkan tetap pending untuk pemeriksaan manual; nama file legacy harus dicocokkan dengan mutasi/catatan penerimaan.
- Konfirmasi jadwal setelah reschedule dipisahkan dari verifikasi pembayaran. `PENDING + DP_PAID/PAID` dapat dikonfirmasi admin tanpa DP kedua dan tanpa menimpa audit verifikasi pembayaran awal.
- Pre-test dibuat sebagai draft, kemudian snapshot dengan versi form diikat ke appointment saat booking berhasil. Pengisian baru tidak mengubah booking lama. Consent menyimpan pasien, versi consent/privacy, dan waktu persetujuan.
- Histori reschedule dan perubahan status disimpan sebagai daftar event. Hari minimal H+1 dan waktu penyelesaian sesi mengikuti WIB (`Asia/Jakarta`).
- Service API menyediakan DTO admin dengan allowlist field administratif; Laravel wajib menerapkan serializer yang sama. Mock/LocalStorage masih dapat diperiksa melalui developer tools.
- Kebijakan sesi pengganti atau konsumsi jatah untuk no-show belum diputuskan. No-show tetap pencatatan terpisah; tidak otomatis membatalkan rencana atau membuat sesi baru.

## Pending Decisions Terkini

- Strategi autentikasi Sanctum: session cookie atau bearer token.
- Login produksi mengikuti arahan Google SSO via Laravel Socialite; detail session dan provider menunggu backend.
- Provider payment gateway (Midtrans / Xendit / transfer manual dengan DP flat Rp100.000).
- Provider WhatsApp resmi dan email fallback.
- Paket asesmen hanya menjual serta menjadwalkan layanan tatap muka atau memerlukan mesin tes di web; scope aktif tetap pre-test profiling saja.
- Format teknis kesepakatan cicilan: jatuh tempo, bukti persetujuan pasien secara independen, dan aturan jika pembayaran tertunda.
- Kebijakan sesi pengganti/konsumsi jatah untuk no-show serta koreksi/refund berotorisasi. Aturan cancel sudah ditetapkan pada keputusan 21 Oktober 2026.
- Deployment target (VPS Ubuntu / Laravel Forge / Shared Hosting Laragon).



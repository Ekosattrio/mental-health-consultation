# Arsip Eko Sebelum Integrasi - KNOWN_ISSUES.md

Histori prototype, bukan aturan aktif. Gunakan [keputusan final](../KEPUTUSAN_FINAL_2026_10_22.md), [kontrak web](../WEB_CONTRACT.md) dan dokumen utama di docs/.

# Known Issues

## Status Terbaru - Audit Role dan CMS, 22 Oktober 2026

- Selesai pada prototype: persistensi profil navbar, label Admin Operasional, menu Profil Praktik desktop/mobile, tooltip wrap/flip/clamp, pilihan jam admin tanpa fallback otomatis, serta hold expired yang tidak lagi menghalangi reservasi baru. Histori/bukti hold lama tetap tersedia untuk rekonsiliasi.
- Reschedule sekarang membawa expected version dan menolak form usang dalam lock sebelum commit. Timeline lengkap tampil pada detail/receipt pasien. Backend tetap wajib versi server, conditional update/409, dan transaksi; ini bukan jaminan antarperangkat.
- CMS disambungkan ke footer/kontak/Instagram, carousel, gambar landing, banner/tip/pengumuman pasien, rekening DP, QRIS kasir dan logo kop. CMS/profil praktik menulis storage sebelum sukses. Rekening disnapshot pada hold, bukan berubah mengikuti edit CMS berikutnya.
- Batas editor CMS yang masih terbuka: FAQ CRUD, privacy/consent berversi, SEO/metadata, branding/copyright menyeluruh, upload aset permanen dan audit revisi server. Rincian: [CMS_AUDIT](CMS_AUDIT.md).
- Kontak, gambar, rekening, kredensial, dan isi klinis demo harus diverifikasi pengelola; aplikasi tidak memverifikasi izin atau penyedia bantuan. Jam/badge informasi tidak menutup slot kalender.
- Verifikasi: TypeScript exit 0 dan 36/36 tes terfokus. Belum QA browser/mobile/print/interaksi, backend/SSO nyata, keamanan data produksi, atau notifikasi otomatis. Tidak menjalankan Git/dev/build.

## Audit Awal Panduan Fitur per Role - Historis, 22 Oktober 2026

Tabel berikut menyimpan temuan sebelum perbaikan, bukan daftar bug yang masih terbuka. Penyelesaian prototype ada pada status terbaru di atas. Panduan lengkap: [PANDUAN_FITUR_PER_ROLE](PANDUAN_FITUR_PER_ROLE.md).

| Temuan | Bukti dan dampak | Pekerjaan tersisa |
|---|---|---|
| Profil navbar sukses semu | `src/components/layout/Navbar.tsx`, submit modal profil hanya `showToast` dan menutup modal; tidak memanggil penyimpanan profil. | Hubungkan submit ke action profil dengan validasi/role dan persist-before-success. Form kelengkapan profil pasien adalah jalur terpisah yang tidak terdampak temuan ini. |
| Label admin tidak sesuai hierarki | Navbar admin masih menampilkan Super Admin, walaupun dashboard/facade membatasi admin operasional. | Selaraskan label; ini temuan copy UI, bukan bukti admin benar-benar mendapat kewenangan owner. |
| Profil psikolog tidak ada entry point sidebar | `ProfileTab` dirender bila tab `profile`, tetapi array menu psikolog tidak mempunyai item tersebut; avatar membuka modal profil generik. | Tentukan dan hubungkan jalur profil yang digunakan. Jangan menyatakan komponen yang ada sebagai fitur menu yang sudah dapat dibuka. |
| Tooltip terpotong | Screenshot developer menunjukkan teks terpotong. `Tooltip.tsx` memakai posisi berbasis trigger dan `whitespace-nowrap` tanpa penjagaan tepi viewport. | Lebar maksimum, wrap, dan clamp/penyesuaian posisi sesuai layar. |
| Admin reschedule berganti jam otomatis | Effect pada `ReservationsTab.tsx` memilih `rescheduleTimeOptions[0]` jika pilihan lama hilang. | Kosongkan pilihan yang hilang dan minta pilih ulang; validasi slot akhir tidak sama dengan persetujuan jam baru. |
| Hold expired menghambat booking baru | `reserveBookingSlot` masih menolak setiap `ownHold` berstatus HELD yang tidak cocok/aktif. `BookingTab` memulihkan HELD tanpa memfilter expiry. Setelah pelepasan manual dihapus, hold expired tanpa booking/bukti dapat menahan alur. | Tangani expiry/penggantian hold dengan histori dan bukti tetap utuh. Tidak boleh memecah kasus pembayaran yang sudah ditransfer atau meminta DP kedua. |
| Audit reschedule pasien belum berupa timeline lengkap | Array `rescheduleHistory` ada, tetapi detail/receipt hanya menampilkan pelaku/waktu/alasan terakhir. | Dokumentasikan batasan; UI timeline lengkap memerlukan scope tersendiri bila disepakati. |

Expected version sudah diterapkan pada prototype setelah audit ini. Privacy LocalStorage, sinkronisasi antarperangkat, notifikasi, dan ekspor `.xlsx` asli tetap membutuhkan backend/QA; tidak ada klaim semua fitur aman produksi.

## Pembaruan 22 Oktober 2026 - Panel Reservasi Dihapus

- Dashboard pasien tidak lagi menyediakan banner reservasi terdahulu atau tombol melanjutkan/melepas hold. Hold internal tidak dihapus; pemulihan masih berada di alur Booking Konsultasi.
- Penghapusan panel sendiri tidak menyelesaikan batasan hold/versi. Perbaikan lokal expiry/version dilakukan sesudahnya sesuai status terbaru; lintas perangkat dan QA browser tetap diperlukan. Jangan menghapus data pembayaran untuk membersihkan hold.

## Pembaruan 22 Oktober 2026 - Formulir Pre-Test

- Layout langkah 2 sudah dipadatkan: grid identitas/kontak, checkbox keluhan, textarea berdampingan, padding, dan footer ringkas. Indikator wizard kini menyembunyikan label langkah nonaktif hanya pada ponsel agar lebih hemat ruang.
- Perlu QA browser pada 320/375/430 px dan desktop: label kontak panjang, pilihan keluhan multi-select/keyboard, teks panjang pada input, slider, dropdown tidur, textarea resize, dan tombol lanjut/kembali. Tes regresi yang tersedia belum menguji tampilan atau interaksi pre-test secara langsung.

## Pembaruan 22 Oktober 2026 - Katalog Horizontal

- Notes yang sebelumnya tersembunyi di accordion rincian kini tampil penuh pada setiap kartu. Katalog menjadi satu baris horizontal; rincian lengkap dibuka sebagai dialog. Paket legacy/custom tanpa notes tidak diisi dengan asumsi baru, melainkan empty state.
- TypeScript exit 0 dan 25/25 tes terfokus lolos. Tiga tes katalog memakai render statis, bukan browser: masih perlu QA lebar 320/375/430 px, swipe, panah, keyboard/radio, dialog/Escape/fokus, notes panjang, dan pagination.
- Saat revisi katalog, guard expected version belum ada. Kini guard lokal sudah diterapkan sesuai status terbaru; integrasi backend tetap memerlukan conditional update dan penanganan konflik server.

## Pembaruan 22 Oktober 2026 - Tindak Lanjut No-show

- Celah rencana tersangkut setelah `NO_SHOW` ditangani: psikolog yang menangani dapat reschedule sesi yang sama ke H+1, tanpa DP/tagihan/jatah tambahan. Alasan, histori no-show, dan seluruh audit pembayaran dipertahankan.
- Keputusan developer: pasien terlambat dikonfirmasi manual oleh psikolog; tidak ada pembatalan otomatis. Ketentuan manual ini menggantikan status "menunggu keputusan pengganti/jatah" dalam audit historis di bawah.
- TypeScript exit 0 dan 22/22 tes terfokus lolos, termasuk hak akses pemulihan no-show, DP/ledger tetap utuh, status terminal, alasan/durasi, dan H+1. QA browser untuk aksi baru belum dilakukan; backend/privacy/locking antarperangkat tetap belum selesai.

## Status Terbaru - Perbaikan Tujuh Temuan FE (21 Oktober 2026)

Tujuh temuan audit di bawah telah ditangani pada prototype, bukan klaim aman produksi. Verifikasi terbaru: `npx tsc --noEmit` exit 0 dan `npx tsx --test tests/frontend-regressions.test.ts` 17/17 lolos. Tes lock memakai antrean simulasi browser; belum UAT/E2E browser atau uji antarperangkat.

| Temuan | Perbaikan saat ini |
|---|---|
| Snapshot transaksi tertimpa | Semua mutasi workflow memakai satu Web Lock lintas-tab. Appointment tidak lagi dipersistenkan lewat debounce atau snapshot controller. Jadwal/paket berbagi urutan lock untuk operasi terkait. |
| Transfer sebelum reservasi | Mock hold kini aktif sebelum rekening ditampilkan. Hold dihitung pada overlap/kuota, dapat dilanjutkan setelah refresh, dan tidak dilepas diam-diam saat pasien memilih layanan lain. Booking ulang dari hold terkonversi mengembalikan appointment yang sudah ada. |
| Storage gagal/sukses semu | Appointment, hold, identitas pasien walk-in baru, dan kasus pencocokan disimpan dalam satu snapshot sebelum state/toast sukses. Array lama di-upgrade in-place; gagal simpan mempertahankan snapshot lama dan menampilkan error. Controller hanya menyiapkan booking/pre-test. |
| CSRF Sanctum cookie | Header `X-XSRF-TOKEN` memakai cookie yang di-URL-decode; mutasi menyiapkan cookie bila belum ada. Session Laravel nyata belum diuji karena backend belum tersedia. |
| Jam reschedule bergeser | Pemilihan memakai pasangan jam stabil, tanpa fallback ke indeks/jam lain. Jika slot hilang, pengguna wajib memilih ulang. |
| Modal usang | Detail, reschedule, verifikasi, pembayaran, dan receipt terkait kini di-resolve dari ID terhadap data terbaru, bukan salinan object lama. |
| Ekspor | Encoder CSV dan HTML terpisah; kutip/newline/markup di-escape, formula spreadsheet dinetralisasi, unduhan CSV memakai Blob sehingga karakter `#` tidak memotong data URL. |

### Batasan yang Tetap Berlaku

- Mock hold default 15 menit melalui `VITE_MOCK_HOLD_MINUTES`, sementara untuk prototype dan belum keputusan TTL produksi/klien. Browser tanpa Web Locks ditolak untuk mutasi sensitif; tidak memakai fallback lease yang tidak memberi jaminan transaksi.
- Transfer setelah expiry/quote tidak valid menyimpan bukti sekali per hold pada kasus `OPEN`. Admin mencocokkan bukti, menginput penerimaan aktual/tanggal, lalu membuat jadwal pengganti H+1 melalui alur operasional. Kasus menjadi `BOOKED` beserta referensi appointment; uang masuk baru dihitung setelah verifikasi. Tidak ada auto-refund, cancel, atau permintaan transfer kedua.
- Reload seluruh tab saat memperbarui versi prototype: schema key `jiwasehat_v3_appointments` kini envelope workflow, bukan array langsung. `workflow_v1` eksperimental tetap didukung bila sudah ada. Jangan membuka versi aplikasi lama yang masih menulis schema array bersamaan dengan versi baru.
- LocalStorage tetap bukan storage produksi untuk bukti/data klinis. Jaminan antarperangkat, backend authorization, transaction/row lock DB, signed proof URL, serta ledger/invoice permanen tetap belum tersedia.
- QA visual mobile, A4/Excel nyata, sesi Sanctum nyata, dan E2E per role belum dijalankan. No-show tidak otomatis completed/cancelled; tindak lanjut manual psikolog sudah ditetapkan pada 22 Oktober 2026.

## Audit Sebelum Perbaikan (Historis)

## Audit Ulang FE - 21 Oktober 2026 (Setelah Checker)

Audit hanya membaca source. Tidak mengubah kode aplikasi dan tidak menjalankan dev server, build, atau test runtime. Hasil TypeScript sebelumnya tetap 0 error, bukan bukti semua flow benar.

### Temuan yang Masih Terbuka

1. **P1 - Mutasi mock dapat menimpa data transaksi lain.** `src/context/AppContext.tsx:800` membaca seluruh appointment sebelum await controller, lalu `:865` mempersistenkan snapshot tersebut setelah await. `src/controllers/PatientController.ts:84` juga mengutamakan object snapshot lama daripada object terbaru. Booking tanggal A dapat menimpa pembayaran/perubahan status atau booking tanggal B yang selesai selama await. Masih membutuhkan jalur commit tunggal yang diserialkan atau penggantian penuh oleh mutation API yang transaksional.
2. **P1 - Transfer masih mendahului reservasi.** `src/components/patient/tabs/BookingTab.tsx:1178` menampilkan rekening dan meminta bukti; lock baru saat submit akhir pada `src/context/AppContext.tsx:799`. Slot dapat hilang sesudah transfer, tanpa record kasus pembayaran tersendiri. Service hold baru kontrak; belum penyelesaian runtime.
3. **P1 - Penyimpanan gagal dapat menghasilkan state parsial atau sukses semu.** Controller mengubah state dan memberi toast sukses sebelum persistensi final (`src/controllers/PatientController.ts:73`, `:93`); beberapa key kemudian ditulis terpisah (`src/context/AppContext.tsx:857`, `:863`, `:869`). Debounced storage pada `:207` tidak menangani kegagalan. Catch booking pasien (`src/components/patient/tabs/BookingTab.tsx:393`) hanya console, sehingga pengguna tidak mendapat penjelasan pemulihan yang konsisten. Handler pre-test/reschedule/sesi lanjutan juga belum seluruhnya memakai catch/finally untuk memulihkan loading jika dependency melempar error.
4. **P1 untuk integrasi Sanctum cookie - Header CSRF belum diterapkan pada FE.** `src/services/api/client.ts:78` tidak menyalin cookie `XSRF-TOKEN` yang di-URL-decode ke `X-XSRF-TOKEN`, walau `initCsrf` tersedia dan `.env.example` mengaktifkan mode cookie. `credentials: include` saja tidak menggantikan header. Request mutasi ke Laravel dengan proteksi standar dapat gagal 419. Belum berdampak pada mock/bearer-only. Rujukan: [Laravel Sanctum 12 - CSRF Protection](https://laravel.com/docs/12.x/sanctum#csrf-protection).
5. **P2 - Jam reschedule dapat bergeser tanpa pemilihan ulang.** `src/components/patient/RescheduleModal.tsx:71` menghitung ulang array slot ketika appointments berubah, tetapi pilihan hanya berupa indeks (`:99`); reset (`:93`) tidak mengikuti perubahan daftar slot. Jika booking lain menghilangkan slot sebelumnya dalam array, indeks yang sama dapat menunjuk jam lain dan submit menggunakan jam baru itu. Simpan identitas jam stabil dan minta pilih ulang jika sudah tidak tersedia. Modal penjadwalan/reschedule di luar BookingTab juga belum berlangganan perubahan pengaturan praktik secara konsisten; guard akhir masih menolak slot usang.
6. **P2 - Modal detail/receipt pasien memakai snapshot object yang usang.** `src/components/patient/tabs/HistoryTab.tsx:74` dan `:75` menyimpan appointment utuh. `selectedBilling` memang di-resolve terbaru, tetapi tanggal/status detail (`:539`) masih dari object lama; receipt balance (`:166`) juga dari snapshot lama. Bila admin reschedule/mencatat pelunasan dari tab lain saat modal terbuka, jadwal/status/sisa pada modal atau hasil print bisa tertinggal. Gunakan ID terpilih dan resolve data terbaru, atau tandai snapshot dokumen immutable secara eksplisit.
7. **P2 - Escaping ekspor belum konsisten.** `src/components/admin/tabs/ExportFinancePage.tsx:288` memasukkan nama pasien/paket ke template HTML Excel tanpa HTML escaping; `:396` memasukkannya ke CSV tanpa meloloskan tanda kutip. Nama/paket dengan markup atau kutip dapat mengubah struktur hasil ekspor. Nilai yang diawali karakter formula juga belum dinetralisasi pada exporter spreadsheet. Terapkan encoding per format, bukan memakai satu escaping untuk semua output.

### Keputusan Produk yang Tetap Dibutuhkan

- No-show mempertahankan plan ACTIVE, tetapi sesi berikutnya mensyaratkan sumber COMPLETED (`src/context/AppContext.tsx:1383`, `src/components/psychologist/tabs/TreatmentPlansTab.tsx:203`). Reschedule menolak NO_SHOW (`src/context/AppContext.tsx:1635`). Rencana dapat tersangkut setelah no-show; belum ada keputusan sesi pengganti/konsumsi jatah. Jangan mengubah NO_SHOW menjadi COMPLETED untuk mengakalinya.
- TTL hold serta rekonsiliasi transfer setelah expiry tetap belum final. Ini dibedakan dari bug kode yang dapat diperbaiki tanpa mengubah kebijakan bisnis.
- QA visual desktop/mobile, hasil cetak, dan pengujian lintas-tab masih belum dilakukan. Audit statis ini tidak menyatakan bebas overflow atau lag.

## Catatan Dasar dan Riwayat Audit

- Belum ada backend dan database nyata.
- Auth masih berupa simulasi client-side.
- Data tersimpan di LocalStorage, sehingga tidak aman untuk data produksi.
- Data klinis belum memiliki authorization server-side.
- Migrasi LocalStorage cleanup v5 membersihkan state test/SOAP, field appointment lama, tarif profil lama, dan paket telelayanan legacy. Migrasi v7 kemudian menyinkronkan 15 paket resmi terbaru sambil mempertahankan status aktif, diskon, dan paket custom.
- Migrasi `flat_dp_cleanup_v6` menghapus `dpAmount` lama dari paket LocalStorage agar nominal DP tidak dapat dikonfigurasi per paket.
- Paket telelayanan sudah dapat dipesan sebagai prototype, tetapi provider video, pembuatan tautan sesi aman, masa berlaku tautan, dan pengiriman tautan masih menunggu backend.
- Pre-test baru memiliki snapshot per appointment; draft/prefill terbaru tetap di `intakeForms` per pasien. Data booking legacy tidak mempunyai snapshot historis dan tidak direkonstruksi otomatis.
- Modul, type, model, controller, endpoint, dan seed test psikolog/DASS sudah dihapus dari source aktif. Hanya catatan historis pada changelog lama yang masih menyebut implementasi tersebut.
- Payment status masih simulasi.
- Payment sudah disimulasikan sebagai DP flat Rp100.000, pencatatan nama pemilik rekening pengirim (`transferSenderName`), dan pelunasan, tetapi verifikasi berkas transfer masih berupa simulasi client-side tanpa storage privat / payment gateway nyata.
- File bukti pembayaran prototype disimpan sebagai data URL di LocalStorage dengan batas 1,5 MB. Ini hanya untuk demo; produksi wajib memakai storage privat, signed URL sementara, validasi MIME/ukuran server-side, dan malware scanning bila tersedia.
- Pelunasan aktual sudah disembunyikan dari UI admin setelah submit, tetapi masih tersimpan di LocalStorage dan dapat diperiksa melalui developer tools. Privasi role yang sebenarnya baru aman setelah backend memakai policy dan serializer admin yang tidak mengembalikan nominal.
- Invoice/kwitansi masih berupa tampilan frontend dari data appointment; backend produksi perlu menyimpan invoice sebagai record permanen.
- Consent/privacy kini tersimpan sebagai snapshot versi/pasien/waktu di appointment prototype. Record permanen serta metadata IP/user agent server masih memerlukan backend.
- Notifikasi WhatsApp/email belum ada karena membutuhkan backend dan provider resmi.
- Export data klinis masih client-side CSV; produksi perlu role protection, audit log, dan pembatasan data yang diekspor.
- Frontend memakai satu Web Lock lintas-tab untuk mutasi workflow dan snapshot atomik lokal. Fallback lease LocalStorage dihapus; browser tanpa Web Locks menolak mutasi sensitif. Ini tidak menggantikan locking server-side/database transaction untuk produksi.
- Service CRUD Laravel sudah tersedia di `src/services/api/`, tetapi `AppContext` masih memakai facade mock/LocalStorage. Integrasi runtime baru dapat dilakukan setelah response API backend tersedia dan sesuai kontrak.
- Error CSP `script-src 'none'` saat preview di simulator/iframe bukan berasal dari konfigurasi project saat ini. `index.html` tidak memasang CSP tersebut; Vite membutuhkan script `@vite/client` dan `src/main.tsx`, sehingga parent simulator yang memaksa `script-src 'none'` akan memblokir aplikasi. Buka app di browser normal/preview tanpa CSP tersebut atau ubah CSP parent preview.
- Role permission frontend sudah diarahkan ke hierarki terbaru, tetapi belum ada authorization server-side.
- File `tsc_errors.txt` tetap ada sebagai artefak historis. Checkpoint terbaru `npx tsc --noEmit` pada 21 Oktober 2026 setelah izin developer: exit code 0, tanpa error; mencakup source terkini, bukan hasil test runtime.
- Folder `dist/` pernah terbentuk dari build sebelumnya dan diabaikan oleh `.gitignore`.
- AI tidak menjalankan build atau dev server. Tersedia 17 tes regresi logika terfokus; belum ada E2E browser/QA visual. TypeScript checker lolos.
- Audit statis mobile sudah memperbaiki overlay toast, dropdown profil, padding dashboard, footer modal, serta tampilan mobile Manajemen Paket, Data Pasien, Jadwal, Monitoring User, Moderasi Review, dan Transaksi. Hasil visual belum diverifikasi melalui runtime karena dev server tidak diizinkan.
- Workspace pratinjau/ekspor laporan mempertahankan kanvas dokumen/tabel untuk kebutuhan cetak. Kontrolnya tetap perlu QA sentuh pada 320/375/430 px.
- Aturan prorata kelebihan waktu konsultasi belum final: saat ini baru berupa note paket, belum menjadi timer atau tagihan otomatis.
- Paket asesmen saat ini hanya katalog/booking layanan dan bukan mesin tes asesmen dalam web; keputusan klien masih ditunggu.
- Psikoterapi kini menggunakan tarif per sesi dan booking ulang setelah empat sesi. Pembayaran bertahap masih berupa ledger LocalStorage; jatuh tempo cicilan dan penanganan tunggakan belum ditentukan. Backend perlu ledger terpisah, transaksi atomik, idempotency, dan receipt immutable.
- Hubungan episode terapi lama/baru tidak disimpan di sistem booking. Psikolog hanya dapat meneruskan penomoran klinis pada rekam medis eksternal; tidak ada rekam medis dalam scope web.
- Nominal awal empat sesi masih disimpan sebagai proyeksi saldo pada appointment pertama agar pembayaran bertahap dapat dihitung. Ini bukan kewajiban bayar di muka; UI dan backend harus selalu menampilkan tarif per sesi terlebih dahulu.
- Data demo LocalStorage yang pernah memakai fitur tambah sesi belum dimigrasikan ke booking terpisah karena histori uang/sesi tidak aman dipecah otomatis. Perlu penanganan manual bila data lama itu hendak dipakai lagi.
- Rencana multi-sesi legacy tanpa `treatmentPlanId` tidak dibatalkan secara tebakan; ID rencana harus diperbaiki dahulu agar pembatalan tidak mengenai episode terapi yang salah.
- Cancel/discontinue menghentikan seluruh sisa jadwal setelah pembayaran lunas. No-show tidak otomatis menghentikan rencana atau menghabiskan jatah; psikolog dapat menetapkan jadwal pengganti pada sesi yang sama tanpa DP baru (keputusan 22 Oktober 2026).
- Tidak ada fitur permintaan unggah ulang bukti sesuai keputusan developer. Jika bukti belum cocok, admin menahan konfirmasi dan melakukan pencocokan transaksi manual. Batas kedaluwarsa pending masih perlu keputusan.
- DTO admin pada service API sudah dibatasi, tetapi runtime LocalStorage tetap memakai state bersama; backend wajib serializer/Policy yang benar-benar tidak mengirim nominal atau data klinis ke admin.
- Perubahan 21 Oktober 2026 ditinjau statis, lolos TypeScript checker, dan 17 tes regresi setelah izin eksplisit developer. Test browser, build, dan dev server tidak dijalankan.
- Diagram UML memakai PlantUML dan 23 SVG swimlane sudah disediakan agar langsung terlihat di Obsidian. Perubahan pada blok sumber harus di-render ulang agar gambar tetap sinkron.

## Status Audit Lanjutan - 21 Oktober 2026

Setelah arahan developer, temuan 3-7 telah ditangani pada prototype: sinkronisasi katalog dan guard harga, laporan per penerimaan pembayaran, input nominal awal walk-in, guard perubahan jadwal, serta histori sesi baru yang terpisah. TypeScript checker lolos pada 21 Oktober 2026; belum diverifikasi runtime. Rincian di bawah adalah kondisi saat audit awal, bukan seluruhnya status terbuka saat ini.

| Temuan | Status terkini |
|---|---|
| 1. Snapshot store paralel | Ditangani prototype melalui satu Web Lock dan commit workflow terpusat. Produksi tetap memerlukan transaction, lock DB, dan penggantian runtime mock. |
| 2. Transfer sebelum reservasi | Mock hold sudah aktif sebelum rekening, dengan rekonsiliasi bukti setelah expiry. Service server masih kontrak; TTL produksi belum final. |
| 3. Harga lintas-tab | Sinkronisasi packages dan penolakan expected total yang berbeda telah diterapkan pada mock; consent direset saat harga berubah. Backend wajib memvalidasi versi penawaran. |
| 4. Periode laporan | Sudah memakai event penerimaan DP/pelunasan terpisah. Data lama tanpa tanggal penerimaan ditandai estimasi, bukan ditebak dari tanggal konsultasi. |
| 5. Walk-in FULL | Admin wajib input nominal diterima; validasi terhadap fase DP/FULL tanpa membocorkan target. Ledger awal menjadi sumber uang masuk setelah verifikasi. |
| 6. Perubahan jadwal | Save ditolak bila libur/jam/kuota baru berbenturan dengan booking aktif. Pindahkan appointment terlebih dahulu; tidak auto-cancel. Backend wajib guard transaksi yang sama. |
| 7. Audit sesi baru | Histori reschedule/status sesi sumber dibersihkan; sesi baru menyimpan konfirmasi dan event penciptaannya sendiri, tanpa ledger awal duplikat. |
| 8. Persistensi LocalStorage | Workflow kritis memakai satu snapshot sebelum publish. Gagal quota/storage diuji mempertahankan data lama. Key sekunder/CMS dan keamanan produksi tetap bukan transaksi database. |

Katalog pasien kini memiliki pencarian, filter kategori, urutan, pagination enam item, dan rincian layanan. Pembayaran pasien/psikolog menampilkan terbayar dari total dan sisa; admin tetap write-only. QA mobile dan seluruh kombinasi perubahan masih diperlukan.

### Temuan Awal (Historis)

Audit awal membaca source setelah perbaikan flow sebelumnya tanpa menjalankan aplikasi, checker, test, dev server, atau build. Status penyelesaiannya mengikuti tabel di atas.

1. **P1 - Snapshot seluruh appointment dapat menimpa transaksi paralel.** `AppContext.tsx:791` mengunci per tanggal, membaca seluruh appointment, lalu menunggu controller mock. `AppContext.tsx:857` menulis ulang array dari snapshot sebelum await; controller juga mengutamakan snapshot lama (`PatientController.ts:84`). Booking pada tanggal berbeda atau pencatatan pembayaran selama await dapat hilang/tertindih. Perlu satu jalur mutasi store yang diserialkan untuk prototype dan transaction backend; kunci per tanggal saja belum cukup.
2. **P1 - Pasien diminta transfer sebelum slot direservasi.** `BookingTab.tsx:1182` meminta bayar/unggah terlebih dulu; lock baru berjalan pada submit akhir (`AppContext.tsx:791`). Jika slot terambil selama pasien mengisi pre-test/transfer, booking gagal setelah uang dikirim dan tidak ada record transaksi pending yang dapat ditindaklanjuti. Perlu keputusan reservasi sementara atau create pending sebelum bayar, termasuk kebijakan masa berlaku dan penanganan uang yang sudah masuk.
3. **P1 - Harga ditampilkan dapat berbeda dari harga yang dibukukan.** UI memakai packages dari state tab pasien, tetapi sinkronisasi storage hanya membaca appointments/schedules (`AppContext.tsx:369`). Submit membaca packages terbaru (`AppContext.tsx:794`) dan menghitung ulang tarif tanpa validasi versi penawaran (`patientEndpoints.ts:169`). Perubahan harga/diskon oleh psikolog di tab lain dapat mengubah total tanpa persetujuan ulang pasien. Perlu sinkronisasi katalog dan validasi versi harga sebelum submit.
4. **P1 - Periode laporan uang masuk mengikuti jadwal konsultasi.** `AnalyticsTab.tsx:69` dan `ExportFinancePage.tsx:133` memfilter `appointment.date`, lalu menjumlah seluruh uang masuk appointment. DP Oktober untuk jadwal November masuk laporan November; reschedule memindahkan periode uang yang telah diterima. Pembayaran/cicilan harus dipetakan sebagai event bertanggal penerimaan/verifikasi, bukan tanggal konsultasi.
5. **P1 - Lunas walk-in nonpsikoterapi belum berdasarkan nominal aktual.** `ReservationsTab.tsx:355` mengirim fase FULL tanpa input jumlah diterima. `patientEndpoints.ts:186` langsung menetapkan PAID dan saldo nol, lalu `getRecordedCashIn` mengasumsikan harga paket sebagai kas masuk. Perlu pencatatan aktual write-only/ledger yang sama dengan pembayaran lanjutan; tidak cukup memilih status lunas.
6. **P2 - Hari libur/jam baru tidak memeriksa appointment aktif.** `ScheduleTab.tsx:143` hanya memvalidasi format jam/kuota sebelum menyimpan, tanpa membaca props appointments. Booking terkonfirmasi pada hari yang kemudian diliburkan tetap aktif. Diagram aktivitas #6 sudah menggambarkan pemeriksaan dampak, tetapi guard tersebut belum diimplementasikan. Tahan perubahan yang berbenturan atau sediakan penyelesaian jadwal secara eksplisit sesuai keputusan developer.
7. **P2 - Sesi lanjutan mewarisi audit sesi sebelumnya.** `AppContext.tsx:1485` menyalin seluruh `latestSource`; rescheduledAt/rescheduleHistory/statusHistory/scheduleConfirmedAt tidak direset. Sesi kedua dapat terlihat pernah di-reschedule atau diselesaikan pada event sesi pertama. Appointment baru perlu histori status/jadwal sendiri; hanya snapshot klinis/consent rencana dan referensi pembayaran yang boleh diwariskan sesuai relasi.
8. **P2 - Gagal LocalStorage dapat terlihat berhasil.** Bukti disimpan sebagai data URL; controller mengubah state dan mengirim toast sukses sebelum persistensi final. `AppContext.tsx:861` dan penulisan debounce tidak menangani kegagalan quota/storage; `BookingTab.tsx:361` hanya menulis error ke console. Jika storage penuh, booking bisa tampak sukses di memori tetapi hilang setelah reload. Perlu urutan commit yang konsisten, penanganan error yang terlihat, serta media storage yang sesuai.

Keputusan yang masih dibutuhkan: durasi/penanganan slot pending (jangan otomatis menghapus transaksi yang sudah benar-benar ditransfer), kebijakan sesi pengganti/jatah no-show, dan apakah booking psikoterapi baru boleh dibuat saat saldo rencana lama belum lunas. Aturan cancel setelah lunas tetap berlaku dan tidak diubah oleh audit ini.

## Risiko Produk

- Fitur psikologi harus berhati-hati agar tidak dianggap diagnosis otomatis.
- Crisis/hotline information harus diverifikasi sebelum dipakai produksi.
- Nomor STR/SIP psikolog butuh validasi resmi pada implementasi nyata.

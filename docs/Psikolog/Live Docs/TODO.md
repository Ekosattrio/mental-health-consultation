# TODO Project JiwaSehat

Dokumen ini adalah status kerja aktif berdasarkan source frontend saat ini.

## Legenda

- `[x]` selesai pada prototype frontend
- `[~]` sudah ada, tetapi masih perlu QA atau backend
- `[ ]` belum dikerjakan
- `[?]` menunggu keputusan developer/klien

## Keputusan Teknis Final

- [x] Frontend tetap React/Vite TypeScript SPA.
- [x] Backend menggunakan Laravel 12+ REST API.
- [x] Database menggunakan MySQL 8+.
- [x] Scope konsultasi mendukung tatap muka dan telelayanan terjadwal; tidak ada ruang chat konsultasi di web.
- [x] Scope screening hanya pre-test profiling sebelum booking, bukan DASS/diagnosis.
- [x] Harga layanan hanya berasal dari paket, bukan tarif pada profil psikolog.
- [x] Tiga kategori katalog: Konseling, Asesmen, dan Psikoterapi. Telelayanan memakai platform pertemuan pihak ketiga; website mengurus booking.
- [x] DP Rp100.000 mengurangi biaya rencana awal; psikoterapi ditarifkan per sesi dengan minimum empat sesi per booking. Lanjutan setelah sesi keempat melalui booking baru, bukan tambah jatah.

## Frontend Selesai

### Fondasi

- [x] Role Psikolog/Pengelola, Admin Operasional, dan Pasien.
- [x] Dashboard tiap role, sidebar collapse desktop, dan drawer mobile.
- [x] Architecture Blueprint dan state mode demo dihapus.
- [x] Modul DASS/test psikolog legacy dihapus dari type, model, context, controller, endpoint, dan mock.
- [x] Paket telelayanan resmi tersedia sebagai tipe paket `ONLINE_TELE`; tarif tetap berasal dari paket dan tidak disimpan pada profil psikolog.
- [x] SOAP/catatan medis lama dihapus dari state, model, endpoint, mock, dan UI.
- [x] Migrasi LocalStorage cleanup v5 untuk membuang data legacy.
- [x] Migrasi LocalStorage v6 membuang nominal DP per paket; DP sekarang berasal dari konstanta sistem Rp100.000.
- [x] Migrasi LocalStorage v7 menyinkronkan 15 paket resmi, menambahkan telelayanan, dan menormalkan psikoterapi 4 sesi sambil mempertahankan status aktif, diskon, dan paket custom.
- [x] Migrasi LocalStorage v8 membuang field nomor referensi pembayaran lama dari appointment tersimpan.
- [x] Migrasi LocalStorage v9 mengubah paket resmi psikoterapi menjadi Rp500.000 per sesi, mempertahankan status aktif, dan mengonversi diskon nominal empat sesi lama menjadi nilai per sesi.
- [x] Lazy loading halaman role dan debounce persistence LocalStorage.
- [x] Logo, avatar, dan preview CMS memiliki fallback saat URL gambar rusak.

### Landing dan Auth

- [x] Landing page paket, profil psikolog, CTA booking, FAQ, dan footer media sosial.
- [x] Carousel sekitar 10 testimoni dengan autoplay dan kontrol manual.
- [x] Harga paket disembunyikan sebelum login.
- [x] Klaim organisasi/legalitas marketing yang tidak diminta sudah dihapus.
- [x] Registrasi dan form kelengkapan data pasien.
- [~] UI Google SSO dan quick-login pengujian tersedia; autentikasi Google nyata menunggu Laravel. Tidak ada form email/password aktif.

### Pasien

- [x] Profil wajib lengkap sebelum booking.
- [x] Layout pre-test lebih padat: grid responsif pekerjaan/kontak, checkbox keluhan, textarea berdampingan, slider/tidur rapat, indikator langkah dan footer mobile ringkas. Field dan validasi tetap dipertahankan.
- [ ] QA browser pre-test pada ponsel/desktop: multi-select keluhan, label/input panjang, resize textarea, slider/tidur, navigasi keyboard, tombol kembali, dan lanjut ke langkah konfirmasi.
- [x] Pemilihan layanan horizontal dengan panah/scroll-snap, notes penuh langsung terlihat, ringkasan manfaat, dialog rincian, dan filter/search/sort/pagination enam layanan.
- [x] Tes render statis katalog: notes tanpa klik, pagination katalog 15 item, harga diskon per sesi, dan pemilihan terkunci; checkpoint 25/25 tes regresi dan TypeScript exit 0 pada 22 Oktober 2026.
- [ ] QA browser katalog horizontal pada ponsel/desktop: overflow, swipe, radio/keyboard, panah, dialog/fokus/Escape, notes panjang, dan pagination.
- [x] Pre-test profiling terintegrasi ke booking.
- [x] Booking minimal H+1 dan slot mengikuti durasi paket.
- [x] Upload file bukti DP flat Rp100.000, nama pengirim, dan metode/channel tanpa nomor referensi transaksi.
- [x] Consent/privacy wajib sebelum booking.
- [x] Riwayat appointment, detail, invoice/receipt, dan print/save PDF.
- [x] Reschedule dengan validasi slot dan audit pelaku/alasan.
- [x] Review hanya setelah `COMPLETED` dan satu review per appointment.

### Psikolog/Pengelola

- [x] CRUD paket, metode tatap muka/telelayanan, status aktif, fasilitas dinamis, jumlah sesi, dan diskon tanpa voucher.
- [x] Jadwal mingguan, jam kerja, hari libur, dan kuota tanggal khusus.
- [x] Paket Berjalan: tabel desktop, kartu mobile, progres, pembayaran, dan jadwal berikutnya.
- [x] Sesi lanjutan dibuat bertahap setelah sesi sebelumnya selesai.
- [x] Jadwal sesi lanjutan memakai pilihan slot aktual minimal H+1, bukan input jam bebas.
- [x] Guard paket selesai, sesi aktif duplikat, dan paket dihentikan.
- [x] Psikolog hanya menjadwalkan sesi ke-2 sampai ke-4 dalam rencana awal; tidak ada aksi tambah jatah sesi.
- [x] Setelah sesi keempat selesai, pasien dapat booking psikoterapi kembali sebagai rencana dan transaksi baru; plan lama tidak diaktifkan ulang.
- [x] Aksi complete, no-show, cancel, jadwalkan sesi, dan discontinue hanya untuk psikolog.
- [x] Data pasien dan pre-test.
- [x] CMS dan konfigurasi kop surat.
- [x] Laporan uang masuk serta export PDF/Excel/CSV dan data klinis.

### Admin Operasional

- [x] Monitoring user read-only tanpa ubah status akun.
- [x] Modal pemeriksaan bukti DP dengan preview gambar/tombol buka PDF, catatan opsional, dan audit verifikasi tanpa checklist konfirmasi tambahan.
- [x] Verifikasi DP dan konfirmasi booking berjalan atomik dari `PENDING` ke `CONFIRMED`.
- [x] Walk-in booking tanpa pilihan psikolog dan tanpa menampilkan harga.
- [x] Bantuan reschedule dengan audit trail.
- [x] Pencatatan pelunasan aktual satu arah tanpa target tagihan.
- [x] Pencatatan pembayaran bertahap setelah DP; status lunas hanya saat saldo nol.
- [x] Nominal pelunasan tidak dapat dibaca ulang dari UI admin setelah submit.
- [x] Receipt administratif untuk print/screenshot tanpa menu kwitansi terpisah.
- [x] Moderasi review.
- [x] Admin tidak memiliki complete, cancel, no-show, delete, atau discontinue.

### Logic Bersama

- [x] Status pembayaran dipisahkan dari status konsultasi.
- [x] Sesi lanjutan paket tidak menggandakan uang masuk.
- [x] Booking/reschedule menolak H+0, hari libur, luar jam kerja, kuota penuh, dan overlap.
- [x] Reschedule mempertahankan durasi sesi asli.
- [x] Lock sementara per psikolog/tanggal, validasi ulang state, dan sinkronisasi antar-tab.
- [x] Konfirmasi UI untuk complete, no-show, cancel, dan discontinue.
- [x] Sesi tidak dapat ditandai `COMPLETED` sebelum waktu konsultasi berakhir; treatment plan selesai otomatis setelah seluruh sesi selesai.
- [~] Lock frontend mengurangi double submit, tetapi jaminan produksi tetap membutuhkan transaction/row lock MySQL.

## API Frontend Selesai

- [x] HTTP client dengan base URL env, timeout, abort signal, Laravel validation error, pagination, upload, dan Blob download.
- [x] Dukungan bearer token dan Sanctum cookie/CSRF opsional.
- [x] `authService`: login, register, logout, profil aktif, Google redirect.
- [x] `userService`: profil pasien/psikolog, avatar, monitoring admin.
- [x] `packageService`: CRUD paket, diskon, dan status.
- [x] `appointmentService`: booking, walk-in, status sesi, reschedule, pembayaran, receipt.
- [x] `scheduleService`: jadwal mingguan, hari libur, override, slot tersedia.
- [x] `intakeService`: CRUD pre-test.
- [x] `treatmentPlanService`: list/detail, sesi lanjutan idempotent, discontinue. Tidak ada endpoint tambah sesi.
- [x] `financeService`: summary, transaksi, PDF/XLSX/CSV, export klinis.
- [x] `reviewService`, `cmsService`, dan `notificationService`.
- [~] Service belum menjadi sumber runtime karena backend belum tersedia; AppContext masih memakai mock/LocalStorage.

## Perbaikan Flow - 21 Oktober 2026

- [x] Konfirmasi ulang reschedule terbayar terpisah dari verifikasi DP; audit pembayaran awal dipertahankan.
- [x] Snapshot pre-test/consent per booking, draft ber-ID, dan pemilih histori pre-test di detail pasien.
- [x] Cancel/discontinue seluruh sisa rencana hanya setelah lunas; histori completed dan uang masuk tetap tersimpan.
- [x] Admin mencatat pembayaran untuk penghentian sebelum sesi pertama melalui purpose khusus, tetap tanpa hak cancel.
- [x] Alasan dan audit perubahan status serta daftar histori reschedule.
- [x] Persistensi pasien walk-in ditunda sampai booking berhasil; cache slot dibebaskan bila appointment telah dipindah/dibatalkan.
- [x] DTO service admin membatasi field administratif dan kontrak binding draft/consent diselaraskan.
- [ ] QA semua perbaikan 21 Oktober: cancel belum lunas/lunas, plan dengan sesi aktif, no-show, dua booking dengan pre-test berbeda, dan reconfirm tanpa DP kedua.

## Frontend Masih Perlu QA

### Tindak Lanjut Audit Flow 21 Oktober

- [x] Katalog layanan dengan pencarian, filter kategori, urutan nama/harga, pagination enam item, dan rincian manfaat/notes.
- [x] Progres terbayar dari total dan sisa pada detail pasien serta Paket Berjalan psikolog; admin tetap tanpa akses nominal tersimpan.
- [x] Input nominal awal aktual walk-in dan validasi DP/FULL; ledger awal tidak dihitung sebagai kas sebelum diverifikasi.
- [x] Tanggal penerimaan terpisah dari waktu pencatatan untuk verifikasi DP dan pembayaran lanjutan.
- [x] Laporan/pratinjau/CSV/Excel/PDF berbasis event penerimaan, bukan tanggal appointment; tanggal historis yang tidak tersedia ditandai estimasi.
- [x] Sinkronisasi katalog lintas-tab, reset consent saat harga berubah, dan expected-total guard di mock booking.
- [x] Guard libur/jam/kuota terhadap booking aktif sebelum menyimpan jadwal; gagal simpan tidak menampilkan sukses.
- [x] Audit status/reschedule sesi lanjutan berdiri sendiri tanpa duplikasi ledger awal.
- [x] Hold prototype aktif sebelum transfer, dipakai pada kuota/overlap, dapat dilanjutkan setelah refresh, dan booking dari hold terkonversi bersifat idempotent.
- [x] Satu Web Lock untuk mutasi workflow lintas-tab; tidak ada lagi commit appointment dari snapshot controller/debounce. Browser tanpa Web Locks menolak mutasi sensitif.
- [x] Snapshot atomik appointment/hold/pasien walk-in baru/kasus pembayaran; storage gagal tidak mempublikasikan state/toast sukses. Migrasi array lama dilakukan in-place.
- [x] Kasus pembayaran setelah expiry menyimpan bukti tanpa unggah ulang/transfer ulang; admin dapat memproses jadwal pengganti H+1 dan verifikasi dengan tanggal penerimaan aktual.
- [x] CSRF cookie di-decode menjadi header; mutasi menyiapkan cookie Sanctum jika belum tersedia.
- [x] Reschedule memakai identitas jam stabil dan modal/receipt membaca entity terbaru berdasarkan ID.
- [x] Encoding CSV/HTML dan penetralan formula spreadsheet; Blob download untuk CSV.
- [x] Tes regresi logika terfokus 17/17 lolos setelah izin developer; bukan E2E browser.
- [~] `/slot-holds` dan `/payment-reconciliations` tersedia sebagai kontrak API. Runtime masih mock; hold server dan locking antarperangkat menunggu Laravel.
- [?] TTL produksi dan kebijakan rekonsiliasi final. Default 15 menit saat ini hanya konfigurasi prototype.
- [ ] QA pembayaran lintas bulan, reschedule tidak menggeser kas, FULL nominal keliru, cicilan, harga berubah, jadwal berbenturan, dan histori sesi kedua.

- [x] TypeScript checker `npx tsc --noEmit` dijalankan dengan izin eksplisit developer pada 21 Oktober 2026: exit code 0, tanpa error. `tsc_errors.txt` tetap artefak historis.
- [ ] QA end-to-end seluruh role tanpa mengubah mock secara manual.
- [~] Audit statis mobile sudah memperbaiki toast yang menutupi konten, dropdown profil, padding dashboard, footer modal, serta kartu mobile Paket, Pasien, Jadwal, Monitoring User, Moderasi Review, dan Transaksi. QA visual pada 320 px, 375 px, 430 px, tablet, dan desktop tetap diperlukan.
- [ ] Audit thumb reach, overflow tabel/modal/form, tooltip, dan `aria-label` pada perangkat nyata.
- [ ] Uji workspace pratinjau/ekspor dokumen dan hasil cetak pada ponsel nyata; area ini memang mempertahankan format kertas/tabel untuk kebutuhan dokumen.
- [ ] Uji empty state, data panjang, nama panjang, transaksi besar, dan URL gambar rusak.
- [ ] Verifikasi receipt serta laporan print/save PDF pada A4 di browser nyata.
- [ ] Profiling halaman berat setelah data berasal dari API; optimasi awal lazy loading/debounce sudah ada.
- [ ] Audit loading, error, disabled, retry, dan submitting state saat integrasi API async dilakukan.
- [ ] QA booking telelayanan dari pemilihan paket sampai detail riwayat pada desktop dan mobile.

## Menunggu Keputusan Developer/Klien

- [?] Sanctum SPA session cookie atau bearer token.
- [x] Login produksi mengikuti Google SSO; UI saat ini simulasi/quick-login tanpa form email/password.
- [?] Pembayaran manual atau payment gateway.
- [?] Provider WhatsApp resmi dan email fallback.
- [?] Provider/media telelayanan dan format tautan sesi aman yang dikirim setelah konfirmasi booking.
- [x] Ketentuan kelebihan durasi dan laporan psikologis ditampilkan sebagai notes pada detail paket; otomasi tagihan tidak termasuk scope saat ini.
- [?] Paket asesmen hanya untuk pembelian/jadwal asesmen tatap muka atau memerlukan mesin tes asesmen di dalam web; scope aktif saat ini hanya pre-test profiling.
- [x] Psikoterapi minimal 4 sesi; sisa setelah DP dibayar sekaligus setelah sesi pertama atau bertahap sesuai kesepakatan pasien dan psikolog.
- [?] Format jatuh tempo cicilan, bukti persetujuan pasien secara independen, dan penanganan cicilan tertunda.
- [x] Cancel menghentikan seluruh sisa rencana setelah pembayaran lunas; tidak ada fitur minta unggah ulang bukti.
- [x] Keterlambatan/ketidakhadiran dikonfirmasi manual psikolog, tanpa cancel otomatis. Jadwal pengganti memakai sesi yang sama, minimal H+1, tanpa DP tambahan; histori dan pembayaran tetap utuh.
- [x] Aksi jadwal pengganti di Riwayat Sesi/Paket Berjalan psikolog dan service kontrak backend disiapkan. TypeScript exit 0 dan 22/22 tes regresi terfokus lolos pada 22 Oktober 2026.
- [ ] QA browser: pasien terlambat, pemulihan no-show, slot bentrok, reschedule berulang, histori receipt, dan pembayaran tanpa DP kedua.
- [?] Prosedur koreksi/refund berotorisasi terpisah; tidak ada refund otomatis.
- [?] Batas jumlah/tenggat reschedule pasien.
- [?] Format final nomor invoice/receipt, tanda tangan, dan stempel digital.
- [?] Retensi, penghapusan, backup, serta restore data klinis.
- [?] Data nyata psikolog, rekening, alamat, logo, dan kop surat.

## Temuan Audit Panduan Role - 22 Oktober 2026

- [x] Membuat `PANDUAN_FITUR_PER_ROLE.md` berdasarkan source: menu/fitur, fungsi, cara kerja, syarat/dampak aksi, contoh, dan batasan tiap role.
- [x] Profil navbar memakai allowlist/ownership/validasi dan persist-before-success; email SSO read-only.
- [x] Label Admin Operasional, bukan Super Admin; navbar membaca kontak/kredensial aktual.
- [x] Menu Profil Praktik tersedia pada sidebar desktop dan menu ponsel; penyimpanan menunggu persistensi dan tombol terkunci saat proses.
- [x] Tooltip diukur, dibungkus, dibalik bila perlu, dan dijaga pada tepi viewport.
- [x] Pilihan jam reschedule/walk-in admin yang hilang dikosongkan; wajib memilih ulang, bukan memakai jam pertama.
- [x] Hold expired tidak dipulihkan/memblokir reservasi baru; histori tetap utuh untuk rekonsiliasi bukti tab lama tanpa transfer ulang.
- [x] Expected version reschedule diperiksa dalam lock terbaru; form aktor lain yang usang ditolak, bukan menimpa.
- [x] Timeline seluruh reschedule tampil pada detail/receipt pasien dengan fallback data legacy.
- [ ] QA browser profil, menu desktop/mobile, tooltip tepi layar, pilihan jam hilang, dua form reschedule paralel, dan expiry/bukti terlambat.

## Audit CMS - 22 Oktober 2026

- [x] Menulis `CMS_AUDIT.md`: daftar field, komponen pembaca, cara simpan, batasan dan kebutuhan backend.
- [x] Footer membaca logo/nama/kontak/alamat/jam/Instagram dari CMS.
- [x] Carousel membaca judul/subjudul/autoplay/interval; hero/tentang membaca URL gambar.
- [x] Banner/tip/pengumuman serta judul/keterangan bantuan pasien membaca CMS.
- [x] Rekening DP dapat diedit owner dan disnapshot pada hold; QRIS kasir dibaca modal admin, bukan metode DP mandiri baru.
- [x] Logo kop dibaca pratinjau/print laporan dengan fallback; tidak diklaim tertanam di Excel.
- [x] CMS persist-before-success, validasi dasar, defaults kompatibel, dan sinkron lintas-tab.
- [x] Kontrak CMS publik tidak membawa rekening/QRIS; endpoint baca konfigurasi lengkap owner dan snapshot penerima hold disiapkan.
- [x] TypeScript exit 0 dan 36/36 tes regresi terfokus, termasuk CMS, profil, versi reschedule, hold expired, dan timeline.
- [ ] QA setiap field CMS di browser, termasuk gambar rusak, reset, storage penuh, autoplay mati, cetak, dan hold lama saat rekening berubah.
- [ ] Ganti/verifikasi semua konten/kontak/rekening/QRIS/kredensial demo sebelum publikasi.
- [?] FAQ CRUD jika pengelola perlu mengubah pertanyaan/jawaban tanpa developer.
- [?] Editor legal/consent berversi, SEO/metadata dan branding menyeluruh; saat ini masih source/configuration, bukan fitur CMS yang sudah ada.

## Backend Belum Dikerjakan

- [ ] Setup Laravel 12+ dan koneksi MySQL 8+.
- [ ] Migration, model, relation, seeder, API Resource, Form Request, Policy, dan middleware role.
- [ ] Sanctum dan Google Socialite.
- [ ] Endpoint sesuai [[API]] dan [[LARAVEL_API_SPEC]].
- [ ] Transaction, row lock, overlap validation, unique constraint, dan idempotency booking/sesi.
- [ ] Implementasi slot hold server dan quote version; lock kapasitas psikolog/tanggal yang sama pada hold, booking, perubahan jadwal, dan reschedule.
- [ ] Storage privat bukti pembayaran dan dokumen.
- [ ] Transaction atomik verifikasi pembayaran + konfirmasi booking beserta audit admin.
- [ ] Payment ledger, snapshot tarif per sesi, dan endpoint booking ulang psikoterapi melalui alur booking standar yang idempotent. Tidak ada endpoint amendment sesi.
- [ ] Serializer admin yang tidak mengekspos harga/tagihan/pelunasan.
- [ ] Audit log permanen untuk pembayaran, reschedule, status sesi, consent, dan export.
- [ ] Queue notifikasi WhatsApp, retry, idempotency, dan log pengiriman.
- [ ] Export PDF/Excel backend untuk data besar.
- [ ] Backup/restore MySQL dan export data yang role-protected.
- [ ] Unit, integration, concurrency, security, dan end-to-end test.
- [ ] Staging, monitoring, logging, deployment, dan backup terjadwal.

## Catatan

- `npm run dev` dan `npm run build` tidak dijalankan. Developer mengizinkan checker dan tes terfokus: checkpoint terbaru `npx tsc --noEmit` 0 error, `npx tsx --test tests/frontend-regressions.test.ts` 36/36 lolos. Jumlah tes pada bagian historis adalah checkpoint saat itu. QA browser tetap belum dilakukan.
- `tsc_errors.txt` dan `dist/` tidak dihapus tanpa konfirmasi developer.
- Error CSP `script-src 'none'` berasal dari parent simulator/iframe, bukan `index.html` project.
- PDF MoU tetap berada di `docs/Psikolog/Live Docs/MoU WEBSITE.pdf` sebagai attachment Obsidian.
- UML activity diagram per fitur ada di [[ACTIVITY_DIAGRAMS]] sebagai SVG berswimlane yang dapat dibuka langsung di Obsidian; sumber PlantUML tetap disimpan untuk revisi.

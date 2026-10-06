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
- [x] Scope konsultasi hanya tatap muka; tidak ada chat atau telekonsultasi web.
- [x] Scope screening hanya pre-test profiling sebelum booking, bukan DASS/diagnosis.
- [x] Harga layanan hanya berasal dari paket, bukan tarif pada profil psikolog.

## Frontend Selesai

### Fondasi

- [x] Role Psikolog/Pengelola, Admin Operasional, dan Pasien.
- [x] Dashboard tiap role, sidebar collapse desktop, dan drawer mobile.
- [x] Architecture Blueprint dan state mode demo dihapus.
- [x] Modul DASS/test psikolog legacy dihapus dari type, model, context, controller, endpoint, dan mock.
- [x] Paket/logic telelayanan dan field tarif online/offline dihapus.
- [x] SOAP/catatan medis lama dihapus dari state, model, endpoint, mock, dan UI.
- [x] Migrasi LocalStorage cleanup v5 untuk membuang data legacy.
- [x] Lazy loading halaman role dan debounce persistence LocalStorage.
- [x] Logo, avatar, dan preview CMS memiliki fallback saat URL gambar rusak.

### Landing dan Auth

- [x] Landing page paket, profil psikolog, CTA booking, FAQ, dan footer media sosial.
- [x] Carousel sekitar 10 testimoni dengan autoplay dan kontrol manual.
- [x] Harga paket disembunyikan sebelum login.
- [x] Klaim organisasi/legalitas marketing yang tidak diminta sudah dihapus.
- [x] Registrasi dan form kelengkapan data pasien.
- [~] Flow email/password dan Google SSO tersedia di frontend; autentikasi nyata menunggu Laravel.

### Pasien

- [x] Profil wajib lengkap sebelum booking.
- [x] Pre-test profiling terintegrasi ke booking.
- [x] Booking minimal H+1 dan slot mengikuti durasi paket.
- [x] Upload bukti DP sesuai konfigurasi paket, nama pengirim, metode/channel, dan nomor referensi.
- [x] Consent/privacy wajib sebelum booking.
- [x] Riwayat appointment, detail, invoice/receipt, dan print/save PDF.
- [x] Reschedule dengan validasi slot dan audit pelaku/alasan.
- [x] Review hanya setelah `COMPLETED` dan satu review per appointment.

### Psikolog/Pengelola

- [x] CRUD paket, status aktif, fasilitas dinamis, jumlah sesi, dan diskon tanpa voucher.
- [x] Jadwal mingguan, jam kerja, hari libur, dan kuota tanggal khusus.
- [x] Paket Berjalan: tabel desktop, kartu mobile, progres, pembayaran, dan jadwal berikutnya.
- [x] Sesi lanjutan dibuat bertahap setelah sesi sebelumnya selesai.
- [x] Guard paket selesai, sesi aktif duplikat, dan paket dihentikan.
- [x] Aksi complete, no-show, cancel, jadwalkan sesi, dan discontinue hanya untuk psikolog.
- [x] Data pasien dan pre-test.
- [x] CMS dan konfigurasi kop surat.
- [x] Laporan uang masuk serta export PDF/Excel/CSV dan data klinis.

### Admin Operasional

- [x] Monitoring user read-only tanpa ubah status akun.
- [x] Monitoring booking, verifikasi DP, dan konfirmasi `PENDING` ke `CONFIRMED`.
- [x] Walk-in booking tanpa pilihan psikolog dan tanpa menampilkan harga.
- [x] Walk-in memiliki jalur khusus admin dan dapat mendaftarkan pasien baru tanpa pre-test awal, tetapi tanggal konsultasi tetap wajib minimal H+1.
- [x] Bantuan reschedule dengan audit trail.
- [x] Pencatatan pelunasan aktual satu arah tanpa target tagihan.
- [x] Nominal pelunasan tidak dapat dibaca ulang dari UI admin setelah submit.
- [x] Receipt administratif untuk print/screenshot tanpa menu kwitansi terpisah.
- [x] Moderasi review.
- [x] Admin tidak memiliki complete, cancel, no-show, delete, atau discontinue.

### Logic Bersama

- [x] Status pembayaran dipisahkan dari status konsultasi.
- [x] Sesi lanjutan paket tidak menggandakan uang masuk.
- [x] Semua booking dan reschedule, termasuk walk-in admin, menolak H+0 serta tetap memvalidasi hari libur, jam kerja, kuota, durasi, dan overlap.
- [x] Reschedule mempertahankan durasi sesi asli.
- [x] Lock sementara per psikolog/tanggal, validasi ulang state, dan sinkronisasi antar-tab.
- [x] Web Locks API dipakai sebagai lock lintas-tab utama dengan fallback LocalStorage pada browser lama.
- [x] Guard role, kepemilikan data, dan transisi status diterapkan pada booking, reschedule, review, CMS, paket, jadwal, moderasi, serta sesi lanjutan.
- [x] Harga, diskon, dan DP booking dihitung ulang dari paket aktif; payload komponen tidak menjadi sumber nominal tepercaya.
- [x] Penyimpanan pre-test ditunggu sampai berhasil sebelum pasien masuk ke tahap konfirmasi pembayaran.
- [x] Dropdown walk-in dan reschedule hanya menampilkan slot aktual yang tersedia, bukan daftar jam hardcoded.
- [x] Pengaturan jadwal memiliki validasi jam/kuota, migrasi key, sinkronisasi lintas-tab, dan ikut terhapus saat reset data demo.
- [x] Riwayat pasien, reservasi admin, dan riwayat aksi psikolog memiliki tampilan kartu mobile terpisah dari tabel desktop.
- [x] Konfirmasi UI untuk complete, no-show, cancel, dan discontinue.
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
- [x] `treatmentPlanService`: list/detail, sesi lanjutan idempotent, discontinue.
- [x] `financeService`: summary, transaksi, PDF/XLSX/CSV, export klinis.
- [x] `reviewService`, `cmsService`, dan `notificationService`.
- [~] Service belum menjadi sumber runtime karena backend belum tersedia; AppContext masih memakai mock/LocalStorage.

## Frontend Masih Perlu QA

- [x] TypeScript checker `npx tsc --noEmit` dijalankan ulang setelah hardening frontend dan lolos 0 error pada 2026-10-06.
- [ ] QA end-to-end seluruh role tanpa mengubah mock secara manual.
- [ ] QA responsif pada 320 px, 375 px, 430 px, tablet, dan desktop.
- [ ] Audit thumb reach, overflow tabel/modal/form, tooltip, dan `aria-label` pada perangkat nyata.
- [ ] Uji empty state, data panjang, nama panjang, transaksi besar, dan URL gambar rusak.
- [ ] Verifikasi receipt serta laporan print/save PDF pada A4 di browser nyata.
- [ ] Profiling halaman berat setelah data berasal dari API; optimasi awal lazy loading/debounce sudah ada.
- [ ] Audit loading, error, disabled, retry, dan submitting state saat integrasi API async dilakukan.

## Menunggu Keputusan Developer/Klien

- [?] Sanctum SPA session cookie atau bearer token.
- [?] Login produksi hanya Google SSO atau tetap menyediakan email/password.
- [?] Pembayaran manual atau payment gateway.
- [?] Provider WhatsApp resmi dan email fallback.
- [?] Kebijakan no-show, cancel, keterlambatan, refund, dan jatah sesi paket.
- [?] Batas jumlah/tenggat reschedule pasien.
- [?] Format final nomor invoice/receipt, tanda tangan, dan stempel digital.
- [?] Retensi, penghapusan, backup, serta restore data klinis.
- [?] Data nyata psikolog, rekening, alamat, logo, dan kop surat.

## Backend Belum Dikerjakan

- [ ] Setup Laravel 12+ dan koneksi MySQL 8+.
- [ ] Migration, model, relation, seeder, API Resource, Form Request, Policy, dan middleware role.
- [ ] Sanctum dan Google Socialite.
- [ ] Endpoint sesuai [[API]] dan [[LARAVEL_API_SPEC]].
- [ ] Transaction, row lock, overlap validation, unique constraint, dan idempotency booking/sesi.
- [ ] Storage privat bukti pembayaran dan dokumen.
- [ ] Serializer admin yang tidak mengekspos harga/tagihan/pelunasan.
- [ ] Audit log permanen untuk pembayaran, reschedule, status sesi, consent, dan export.
- [ ] Queue notifikasi WhatsApp, retry, idempotency, dan log pengiriman.
- [ ] Export PDF/Excel backend untuk data besar.
- [ ] Backup/restore MySQL dan export data yang role-protected.
- [ ] Unit, integration, concurrency, security, dan end-to-end test.
- [ ] Staging, monitoring, logging, deployment, dan backup terjadwal.

## Catatan

- AI tidak menjalankan `npm run dev` atau `npm run build`. TypeScript checker dijalankan untuk verifikasi perubahan dan lolos 0 error.
- `tsc_errors.txt` dan `dist/` tidak dihapus tanpa konfirmasi developer.
- Error CSP `script-src 'none'` berasal dari parent simulator/iframe, bukan `index.html` project.
- PDF MoU tetap berada di `docs/Psikolog/Live Docs/MoU WEBSITE.pdf` sebagai attachment Obsidian.

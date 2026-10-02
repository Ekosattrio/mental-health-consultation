# TODO

## Prioritas 0 - Konfirmasi dan Keputusan

- Rapikan nama package dari `react-example` menjadi nama project. [DONE - frontend package renamed]
- Review isi `tsc_errors.txt`.
- Putuskan backend stack final. Kandidat kuat: Laravel API + React frontend.
- Tentukan database yang dipakai.
- Tentukan strategi Google SSO.
- Finalkan role permission:
  - psikolog/super admin/pengelola sebagai role tertinggi
  - admin sebagai operasional/verifikasi
  - pasien/pengguna sebagai user layanan
- Tentukan mekanisme locking slot booking agar tidak double booking.
- Konfirmasi ke client soal test/assessment tambahan setelah pre-test.
- Konfirmasi apakah review pasien wajib hanya setelah status konsultasi `COMPLETED`.
- Konfirmasi detail format laporan PDF/Excel.
- Konfirmasi apakah pembayaran DP/pelunasan cukup upload bukti manual atau perlu payment gateway.

## Prioritas 1 - Backend dan Database

- Buat schema database awal.
- Pisahkan mock data dari service API.
- Buat autentikasi Google SSO.
- Buat authorization berdasarkan role terbaru.
- Buat endpoint user dan general info saat pendaftaran.
- Buat endpoint psikolog/pengelola.
- Buat endpoint admin.
- Buat endpoint booking/appointment.
- Buat validasi booking minimal H+1.
- Buat validasi reschedule minimal H+1.
- Buat mekanisme anti double booking/slot locking.
- Buat endpoint hari libur psikolog.
- Buat endpoint jam kerja psikolog.
- Buat endpoint batas jumlah pertemuan harian psikolog.
- Buat endpoint pre-test sebagai syarat booking.
- Buat endpoint upload bukti pembayaran.
- Buat endpoint verifikasi pembayaran oleh admin.
- Buat model pembayaran DP 50% dan pelunasan 50%.
- Buat endpoint perubahan status booking:
  - `PENDING` ke `CONFIRMED`
  - `CONFIRMED` ke `COMPLETED`
  - cancellation jika diperlukan
- Buat endpoint bantuan booking oleh admin untuk pasien datang langsung.
- Buat endpoint request reschedule ke admin.
- Buat endpoint moderasi review.
- Buat endpoint laporan dan export PDF/Excel.
- Buat audit log untuk perubahan penting.

## Prioritas 2 - Frontend Umum

- Audit responsive layout.
- Audit accessibility dasar.
- Pastikan dashboard tiap role tidak saling bocor akses.
- Buat sidebar dashboard bisa collapse menjadi ikon. [DONE - pasien, psikolog, admin]
- Rapikan mode mobile agar nyaman untuk jempol. [PARTIAL - dashboard utama dirapikan]
- Rapikan layout agar nyaman dipakai dengan mouse dan sentuhan jempol.
- Ganti auth prototype menjadi alur Google SSO. [PARTIAL - tombol SSO demo, backend belum ada]
- Tambahkan form general info setelah pendaftaran/login pertama. [PARTIAL - form register frontend]

## Landing Page

- Hapus klaim organisasi/lembaga yang belum valid dari landing page. [DONE - klaim praktik Kemenkes dihapus]
- Tambahkan carousel pengalaman/testimoni konseling sekitar 10 item. [DONE]
- Buat carousel bisa auto-play dan bisa digerakkan manual. [DONE]
- Tambahkan media sosial/Instagram di footer. [DONE]
- Pastikan CTA booking mengarah ke flow pre-test lalu booking.

## Dashboard Pasien

- Rapikan flow booking. [PARTIAL - flow utama frontend sudah disesuaikan]
- Ubah intake form menjadi pre-test di flow booking. [DONE - UI dan guard simulasi]
- Pastikan pasien tidak bisa kirim booking sebelum pre-test selesai. [DONE - frontend + endpoint simulasi]
- Pastikan pasien tidak bisa booking hari yang sama. [DONE - frontend + endpoint simulasi]
- Pastikan pasien tidak bisa reschedule hari yang sama. [PARTIAL - CTA diarahkan ke reschedule H+1, backend belum ada]
- Tambahkan form bantuan reschedule ke admin. [PARTIAL - CTA/panel UI, form produksi belum ada]
- Rapikan flow pembayaran upload bukti DP dan pelunasan. [PARTIAL - simulasi nama bukti DP]
- Tampilkan status booking dan status pembayaran dengan jelas. [DONE - riwayat dan admin table]
- Hapus ruang chat dari UI karena konsultasi online via web tidak masuk scope. [DONE - navigasi dan file halaman lama dihapus]
- Rapikan flow test dan interpretasi hasil jika fitur assessment lanjut disetujui.
- Rapikan riwayat konsultasi dan review.

## Dashboard Psikolog / Pengelola

- Pindahkan analytics keuntungan/keuangan ke dashboard psikolog/pengelola. [DONE]
- Buat UI pengaturan hari libur. [DONE - simulasi frontend]
- Buat UI pengaturan jam kerja. [DONE - simulasi frontend]
- Buat UI batas jumlah pertemuan per hari. [DONE - simulasi frontend]
- Buat UI CMS management di dashboard psikolog/pengelola. [DONE]
- Hapus ruang chat dari dashboard psikolog. [DONE - navigasi utama]
- Rapikan tampilan jadwal dan appointment. [PARTIAL]

## Dashboard Admin

- Batasi dashboard admin ke fungsi operasional. [DONE]
- Buat monitoring user. [DONE]
- Buat monitoring booking. [DONE]
- Buat flow admin membuat booking untuk pasien datang langsung. [PARTIAL - tombol/panel UI]
- Buat flow admin membantu reschedule pasien. [PARTIAL - tombol/panel UI]
- Buat verifikasi bukti pembayaran. [PARTIAL - status/action UI]
- Buat aksi ubah booking `PENDING` ke `CONFIRMED`. [DONE]
- Buat aksi ubah booking `CONFIRMED` ke `COMPLETED`. [DONE]
- Buat moderasi review. [DONE - fitur existing dipertahankan]
- Hapus CMS management dari admin jika sudah dipindahkan ke psikolog/pengelola. [DONE]
- Hapus analytics keuntungan sebagai fitur admin. [DONE]
- Hapus file tab admin lama yang tidak lagi dipakai (`PackagesTab`, `TestsTab`). [DONE]

## Laporan dan Export

- Tentukan daftar laporan yang dibutuhkan.
- Buat laporan booking.
- Buat laporan pembayaran.
- Buat laporan pasien/user jika diperlukan.
- Buat export PDF.
- Buat export Excel.
- Pastikan akses laporan mengikuti role.

## Dokumentasi

- Lengkapi API contract setelah backend dipilih.
- Lengkapi database schema setelah database dipilih.
- Update `docs/ROLES_PERMISSIONS.md` jika ada perubahan role.
- Update `docs/BUSINESS_RULES.md` jika ada perubahan aturan booking/pembayaran.
- Update `docs/KNOWN_ISSUES.md` saat menemukan gap dari prototype.
- Update changelog setiap perubahan signifikan.

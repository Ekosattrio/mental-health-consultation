# TODO

## Prioritas Awal

- Rapikan nama package dari `react-example` menjadi nama project.
- Review isi `tsc_errors.txt`.
- Putuskan backend stack, kandidat kuat: Laravel API + React frontend.
- Tentukan database.
- Buat schema database awal.
- Tentukan strategi Google SSO.
- Finalkan role permission: psikolog/super admin/pengelola, admin, pasien.
- Pisahkan mock data dari service API.
- Tentukan mekanisme locking slot booking agar tidak double booking.
- Konfirmasi ke client soal test/assessment tambahan setelah pre-test.

## Frontend

- Audit responsive layout.
- Audit accessibility dasar.
- Rapikan flow booking.
- Ubah intake form menjadi pre-test di flow booking.
- Hapus ruang chat dari UI jika no-online-consultation sudah final.
- Buat sidebar dashboard bisa collapse menjadi ikon.
- Rapikan mode mobile agar nyaman untuk jempol.
- Tambahkan carousel pengalaman konseling di landing page.
- Tambahkan media sosial/Instagram di footer.
- Hapus klaim organisasi/lembaga yang belum valid dari landing page.
- Rapikan flow pembayaran upload bukti DP dan pelunasan.
- Rapikan flow test dan interpretasi hasil jika fitur assessment lanjut disetujui.
- Pastikan dashboard tiap role tidak saling bocor akses.

## Backend

- Buat endpoint auth.
- Integrasi Google SSO.
- Buat endpoint user dan role.
- Buat endpoint psikolog, jadwal, appointment.
- Buat endpoint hari libur, jam kerja, dan batas pertemuan harian psikolog.
- Buat endpoint pre-test, test result, clinical note.
- Buat endpoint upload dan verifikasi bukti pembayaran.
- Buat endpoint laporan dan export PDF/Excel.
- Buat endpoint review moderation.
- Buat audit log.

## Dokumentasi

- Lengkapi API contract setelah backend dipilih.
- Lengkapi database schema setelah database dipilih.
- Update changelog setiap perubahan signifikan.

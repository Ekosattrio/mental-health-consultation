# API

## Status Saat Ini

Struktur API client layer telah diimplementasikan lengkap di `src/services/api/` dan siap dipetakan 100% ke backend **Laravel 12++**.
Dokumentasi spesifikasi lengkap RESTful endpoint, skema database Eloquent, dan route mapping dapat dilihat di [`LARAVEL_API_SPEC.md`](file:///c:/laragon/www/psikolog/docs/LARAVEL_API_SPEC.md).

- Semua endpoint harus tervalidasi di server.
- Semua endpoint yang mengakses data user wajib membutuhkan autentikasi.
- Authorization harus berbasis role dan kepemilikan resource.
- Response error harus konsisten.

## Endpoint Target

### Auth

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/google/redirect`
- `GET /auth/google/callback`

Catatan: login target menggunakan SSO Google. Register tetap perlu menyimpan general info pengguna.

### Pasien

- `GET /patients/me`
- `PUT /patients/me`
- `PUT /patients/me/profile` (lengkapi data diri wajib sebelum pilih paket)
- `POST /pre-tests` (formulir keluhan sebelum booking)
- `GET /pre-tests/me`
- `POST /appointments`
- `GET /appointments`
- `POST /appointments/:id/reschedule-requests`
- `POST /appointments/:id/payment-proofs` (upload bukti transfer DP Rp 100.000, nama pengirim, metode/channel bayar, dan nomor referensi)
- `GET /appointments/:id/invoice`
- `POST /reviews`

### Paket Layanan (Packages)

- `GET /packages` (daftar paket resmi, filter kategori)
- `GET /packages/:id`
- `POST /packages` (tambah paket baru oleh psikolog)
- `PUT /packages/:id` (edit paket)
- `DELETE /packages/:id` (hapus paket)
- `PATCH /packages/:id/toggle-status` (aktifkan/nonaktifkan paket)

### Psikolog

- `GET /psychologists`
- `GET /psychologists/:id`
- `PUT /psychologists/me`
- `POST /psychologists/me/avatar` (upload foto profil wajah)
- `DELETE /psychologists/me/avatar` (hapus foto profil wajah)
- `GET /psychologists/me/appointments`
- `PATCH /psychologists/me/appointments/:id/complete` (menandai sesi selesai, khusus psikolog/pengelola)
- `PATCH /psychologists/me/appointments/:id/no-show` (menandai pasien tidak hadir, khusus psikolog/pengelola)
- `PATCH /psychologists/me/appointments/:id/cancel` (pembatalan sesi oleh psikolog/pengelola sesuai kebijakan)
- `GET /psychologists/me/treatment-plans`
- `PATCH /psychologists/me/treatment-plans/:id/discontinue`
- `GET /psychologists/me/clinical-export` (export/backup data klinis, role-protected)
- `POST /psychologists/me/schedules`
- `PUT /psychologists/me/working-hours`
- `POST /psychologists/me/holidays`
- `DELETE /psychologists/me/holidays/:id`
- `PUT /psychologists/me/daily-capacity`
- `GET /psychologists/me/finance-analytics`
- `PUT /psychologists/me/cms`
- `DELETE /psychologists/me/schedules/:id`

### Treatment Plan / Paket Multi-Sesi

- `POST /treatment-plans` (membuat rencana terapi paket berkelanjutan)
- `GET /treatment-plans/:id`
- `POST /treatment-plans/:id/sessions` (jadwalkan sesi berikutnya)
- `PATCH /treatment-plans/:id/discontinue` (hentikan rencana terapi bila diperlukan oleh psikolog)

Catatan: appointment sesi lanjutan dibuat per kebutuhan jadwal, bukan semua sesi dibuat sekaligus ketika pasien membeli paket.

### Admin

- `GET /admin/users` (Strictly Read-Only User Monitoring)
- `GET /admin/appointments`
- `POST /admin/appointments` (Walk-in booking reservasi pasien langsung)
- `PATCH /admin/appointments/:id/confirm`
- `GET /admin/payments`
- `PATCH /admin/payments/:id/verify` (verifikasi bukti transfer DP Rp 100.000)
- `PATCH /admin/reviews/:id/approve`
- `PATCH /admin/reviews/:id/reject`

### Invoice, Consent, dan Notifikasi

- `GET /invoices/:appointmentId`
- `POST /consents` (simpan persetujuan informed consent & privacy saat booking)
- `GET /privacy-policy`
- `GET /notifications/templates`
- `POST /notifications/appointments/:id/send-confirmation`
- `POST /notifications/appointments/:id/send-reschedule`
- `POST /notifications/booking-reminders/send-daily` (reminder jadwal harian ke psikolog)
- `GET /notifications/logs`

### Reports

- `GET /reports`
- `GET /reports/export/pdf` (cetak kop surat resmi dinas A4)
- `GET /reports/export/excel` (ekspor spreadsheet .xls)
- `GET /reports/clinical-export` (khusus psikolog/pengelola)

Catatan: endpoint chat dihapus dari target karena tidak ada konsultasi online via web pada scope saat ini.

## Belum Diputuskan

- Format autentikasi Google SSO: session cookie atau token.
- Provider pembayaran.
- Provider WhatsApp/email.
- Mekanisme locking slot booking.

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
- `PUT /patients/me/general-info`
- `POST /pre-tests`
- `GET /pre-tests/me`
- `POST /appointments`
- `GET /appointments`
- `POST /appointments/:id/reschedule-requests`
- `POST /appointments/:id/payment-proofs`
- `POST /test-results`
- `POST /reviews`

### Psikolog

- `GET /psychologists`
- `GET /psychologists/:id`
- `PUT /psychologists/me`
- `GET /psychologists/me/appointments`
- `POST /psychologists/me/schedules`
- `PUT /psychologists/me/working-hours`
- `POST /psychologists/me/holidays`
- `DELETE /psychologists/me/holidays/:id`
- `PUT /psychologists/me/daily-capacity`
- `GET /psychologists/me/finance-analytics`
- `PUT /psychologists/me/cms`
- `DELETE /psychologists/me/schedules/:id`
- `POST /clinical-notes`

### Admin

- `GET /admin/users`
- `PATCH /admin/users/:id/status`
- `GET /admin/appointments`
- `POST /admin/appointments`
- `PATCH /admin/appointments/:id/confirm`
- `PATCH /admin/appointments/:id/complete`
- `PATCH /admin/appointments/:id/reschedule`
- `GET /admin/payments`
- `PATCH /admin/payments/:id/verify`
- `PATCH /admin/payments/:id/reject`
- `PATCH /admin/reviews/:id/approve`
- `PATCH /admin/reviews/:id/reject`

### Reports

- `GET /reports`
- `GET /reports/export/pdf`
- `GET /reports/export/excel`

Catatan: endpoint chat dihapus dari target karena tidak ada konsultasi online via web pada scope saat ini.

## Belum Diputuskan

- Format autentikasi Google SSO: session cookie atau token.
- Provider pembayaran.
- Mekanisme locking slot booking.
- Detail endpoint pre-test vs assessment lanjutan dari psikolog.

# API

## Status

Frontend menyediakan HTTP client dan service CRUD di `src/services/api/` untuk backend Laravel 12+ dengan MySQL 8+. Service ini belum menjadi sumber data runtime karena backend belum tersedia; prototype masih menggunakan facade mock dan LocalStorage.

HTTP client telah menangani:

- base URL dari `VITE_API_BASE_URL`
- bearer token atau Sanctum cookie
- CSRF cookie opsional
- timeout dan pembatalan request
- normalisasi Laravel Resource dan pagination
- validation error Laravel
- upload `FormData`
- download Blob untuk PDF/Excel/CSV

Kontrak detail backend tersedia di [[LARAVEL_API_SPEC]].

## Konvensi

- Prefix endpoint: `/api/v1`.
- Semua endpoint privat wajib memakai authentication dan policy berdasarkan role/kepemilikan data.
- Payload request memakai `snake_case`; API Resource harus mengembalikan kontrak entity yang disepakati frontend.
- Error validasi memakai status `422` dengan `{ message, errors }`.
- Operasi booking, pembayaran, dan sesi lanjutan wajib idempotent dan menggunakan database transaction.
- Response admin tidak boleh mengekspos harga paket, target tagihan, atau nominal pelunasan yang sudah dicatat.

## Service Frontend

| Service | Cakupan |
|---|---|
| `authService` | login, register, logout, profil aktif, Google redirect |
| `userService` | profil pasien, monitoring user, profil/foto psikolog |
| `packageService` | CRUD paket, diskon, status aktif |
| `appointmentService` | booking, walk-in, status sesi, reschedule, pembayaran, receipt |
| `scheduleService` | jadwal mingguan, override tanggal, hari libur, slot tersedia |
| `intakeService` | CRUD pre-test profiling |
| `treatmentPlanService` | daftar paket berjalan, sesi lanjutan, discontinue |
| `financeService` | ringkasan uang masuk dan export laporan |
| `reviewService` | review pasien dan moderasi admin |
| `cmsService` | konten landing/CMS dan upload aset |
| `notificationService` | log dan trigger notifikasi WhatsApp |

## Endpoint Auth

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /auth/me`
- `PUT /auth/profile`
- `GET /auth/google/redirect`
- `GET /auth/google/callback`

## Endpoint User dan Profil

- `GET /admin/users` - monitoring read-only.
- `GET /psychologist/users/:id`
- `GET /patients/me/profile`
- `PUT /patients/me/profile`
- `GET /psychologists/:id/profile`
- `PUT /psychologists/:id/profile`
- `POST /psychologists/me/avatar`
- `DELETE /psychologists/me/avatar`

## Endpoint Paket

- `GET /packages`
- `GET /packages/:id`
- `POST /packages`
- `PUT /packages/:id`
- `PATCH /packages/:id/status`
- `DELETE /packages/:id`

Paket mendukung harga murni per paket, DP yang dapat dikonfigurasi, diskon `NONE/PERCENT/FIXED`, fasilitas dinamis, durasi, jumlah sesi, dan status aktif. Diskon hanya dikelola psikolog; tidak ada voucher pasien.

## Endpoint Appointment dan Pembayaran

- `GET /appointments`
- `GET /appointments/:id`
- `POST /appointments`
- `POST /admin/appointments/walk-in`
- `PATCH /admin/appointments/:id/confirm`
- `PATCH /psychologist/appointments/:id/complete`
- `PATCH /psychologist/appointments/:id/no-show`
- `PATCH /psychologist/appointments/:id/cancel`
- `POST /appointments/:id/reschedule`
- `PATCH /admin/appointments/:id/reschedule`
- `POST /appointments/:id/payment-proof`
- `POST /admin/appointments/:id/verify-payment`
- `POST /admin/appointments/:id/final-payment`
- `GET /appointments/:id/receipt`
- `GET /admin/appointments/:id/receipt`

Admin hanya dapat mengonfirmasi booking, memverifikasi DP, mencatat pelunasan satu arah, membantu reschedule, serta mencetak receipt administratif. Complete, no-show, cancel, dan discontinue hanya milik psikolog.

Backend wajib mengabaikan nominal subtotal, diskon, total, dan DP dari client lalu menghitung ulang semuanya dari paket aktif. Semua booking, termasuk walk-in admin, wajib memilih tanggal minimal H+1. Walk-in admin boleh membuat pasien baru tanpa pre-test awal, tetapi tetap wajib menolak paket nonaktif, durasi tidak sesuai, hari libur, kuota penuh, dan overlap slot.

## Endpoint Jadwal

- `GET /psychologists/:id/schedules`
- `GET /psychologists/:id/schedules/weekly`
- `PUT /psychologists/:id/schedules/weekly`
- `POST /psychologists/:id/schedules/day-off`
- `DELETE /psychologists/:id/schedules/day-off/:dayOffId`
- `PUT /psychologists/:id/schedules/date-overrides/:date`
- `DELETE /psychologists/:id/schedules/date-overrides/:date`
- `GET /schedules/available-slots?psychologist_id=&date=&duration_minutes=`

## Endpoint Pre-Test

- `GET /patient/pre-tests`
- `GET /patient/pre-tests/:id`
- `POST /patient/pre-tests`
- `PUT /patient/pre-tests/:id`
- `GET /psychologist/patients/:patientId/pre-test`

Pre-test hanya untuk profiling keluhan awal dan bukan diagnosis. Tidak ada endpoint DASS atau tes psikolog mandiri dalam scope aktif.

## Endpoint Paket Berjalan

- `GET /treatment-plans`
- `GET /treatment-plans/:id`
- `POST /treatment-plans/:id/sessions`
- `PATCH /treatment-plans/:id/discontinue`

Appointment sesi berikutnya dibuat bertahap. Endpoint penjadwalan menerima idempotency key, menolak sesi duplikat, mempertahankan durasi paket, dan memvalidasi slot ulang dalam transaction.

## Endpoint Laporan, CMS, Review, dan Notifikasi

- `GET /finance/summary`
- `GET /finance/transactions`
- `GET /finance/export/pdf`
- `GET /finance/export/xlsx`
- `GET /finance/export/csv`
- `GET /finance/export/clinical?format=xlsx|csv`
- `GET /cms/:section`
- `PUT /cms/:section`
- `POST /cms/assets`
- `GET /reviews`
- `GET /reviews/:id`
- `POST /reviews`
- `PATCH /admin/reviews/:id/moderate`
- `GET /notifications/logs`
- `POST /notifications/:id/resend`
- `POST /notifications/appointments/:id/send`
- `POST /notifications/reminders/daily`

## Keputusan yang Masih Dibutuhkan

- Sanctum session cookie atau bearer token.
- Login produksi hanya Google SSO atau tetap menyediakan email/password.
- Provider WhatsApp resmi dan email fallback.
- Kebijakan final no-show, cancel, refund, serta jatah sesi paket.

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

## Pending Decisions

- Backend stack final.
- Database engine.
- Strategi Google SSO.
- Strategi authorization detail untuk data klinis.
- Provider pembayaran.
- Mekanisme locking slot booking.
- Detail pre-test dan assessment tambahan dari psikolog.
- Deployment target.

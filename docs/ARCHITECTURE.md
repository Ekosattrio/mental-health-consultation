# Architecture

## Ringkasan

Aplikasi menggunakan React dengan TypeScript dan Vite. State aplikasi dikelola di `AppContext`, lalu diekspos ke komponen dashboard dan halaman publik.

## Lapisan Utama

- `src/App.tsx`: root aplikasi, menampilkan Landing Page untuk GUEST dan dashboard untuk role terautentikasi (PATIENT, PSYCHOLOGIST, ADMIN).
- `src/context/AppContext.tsx`: global state, action facade, dan sinkronisasi LocalStorage/API.
- `src/services/api/`: service layer API terstandarisasi untuk koneksi ke backend Laravel 12++ (`client.ts`, `authService.ts`, `appointmentService.ts`, `packageService.ts`, `scheduleService.ts`, `financeService.ts`, `reviewService.ts`, `cmsService.ts`).
- `src/components`: UI modular berdasarkan domain dan role (landing, patient, psychologist, admin, common, layout, auth).
- `src/types`: kontrak TypeScript untuk entity, request/response, dan state.
- `src/data/mockData.ts`: data awal untuk simulasi offline.

## Mode Tampilan

Aplikasi berjalan pada satu mode platform terintegrasi. Mode *Blueprint* internal dan menu demo telah dieliminasi sepenuhnya untuk transisi ke otentikasi login nyata dan integrasi backend Laravel 12.

## Role Aplikasi

- `GUEST`: Pengunjung landing page publik.
- `PATIENT`: Pasien terdaftar untuk konsultasi klinis.
- `ADMIN`: Petugas administrasi klinik untuk walk-in booking, verifikasi transfer DP, dan moderasi ulasan.
- `PSYCHOLOGIST`: Psikolog klinis penanggung jawab praktik sekaligus pengelola utama (owner).

Role tertinggi adalah psikolog/super admin/pengelola. Admin berfokus pada verifikasi operasional dan melayani reservasi walk-in.

## Persistence Saat Ini

Data sementara disimpan di `localStorage` dengan prefix `jiwasehat_v3_` dengan fallback dinamis dari service API `src/services/api/`.

## Arah Backend

Laravel memungkinkan dipakai bersama React.

Opsi arsitektur yang masuk akal:

- Laravel sebagai backend API, React tetap menjadi frontend Vite terpisah.
- Laravel melayani API, auth, database, upload bukti pembayaran, laporan PDF/Excel, dan authorization.
- React mengonsumsi API dari Laravel.
- Alternatif lain: Laravel + Inertia React jika ingin aplikasi React lebih menyatu dengan Laravel.

Untuk project ini, opsi yang paling aman secara bertahap adalah Laravel API + React frontend, karena project React sudah ada dan bisa dipertahankan.

## Target Arsitektur Berikutnya

- Pisahkan state client dari API service.
- Tambahkan backend, kemungkinan Laravel, dengan autentikasi, authorization, database, upload file, laporan, audit log, dan validasi server-side.
- Jadikan frontend hanya consumer API, bukan sumber kebenaran data.
- Pertahankan scope tanpa ruang chat konsultasi online di web.

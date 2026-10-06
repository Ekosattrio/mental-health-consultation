# Architecture

## Ringkasan

Aplikasi menggunakan React dengan TypeScript dan Vite. State aplikasi dikelola di `AppContext`, lalu diekspos ke komponen dashboard dan halaman publik.

## Lapisan Utama

- `src/App.tsx`: root aplikasi, menampilkan Landing Page untuk GUEST dan dashboard untuk role terautentikasi (PATIENT, PSYCHOLOGIST, ADMIN).
- `src/context/AppContext.tsx`: global state, action facade, dan sinkronisasi LocalStorage/API.
- `src/services/api/`: HTTP client dan service CRUD untuk backend Laravel 12+ (`auth`, `user`, `package`, `appointment`, `schedule`, `intake`, `treatment plan`, `finance`, `review`, `CMS`, dan `notification`).
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

Data prototype disimpan di `localStorage` dengan prefix `jiwasehat_v3_`. Service API sudah tersedia, tetapi belum dipasang sebagai sumber data runtime sampai backend tersedia.

## Backend Final

- Laravel 12+ menjadi REST API terpisah.
- MySQL 8+ menjadi database utama.
- React/Vite tetap menjadi SPA frontend dan mengonsumsi endpoint `/api/v1`.
- Laravel menangani autentikasi, authorization, validasi, transaction/locking booking, upload bukti pembayaran, audit log, notifikasi, serta export PDF/Excel.
- Tidak menggunakan Inertia pada arsitektur yang disepakati saat ini.

## Target Arsitektur Berikutnya

- Pisahkan state client dari API service.
- Implementasikan backend Laravel 12+ dan schema MySQL 8+ dengan autentikasi, authorization, upload file, laporan, audit log, serta validasi server-side.
- Jadikan frontend hanya consumer API, bukan sumber kebenaran data.
- Pertahankan scope tanpa ruang chat konsultasi online di web.

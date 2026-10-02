# Architecture

## Ringkasan

Aplikasi menggunakan React dengan TypeScript dan Vite. State aplikasi dikelola di `AppContext`, lalu diekspos ke komponen dashboard dan halaman publik.

## Lapisan Utama

- `src/App.tsx`: root aplikasi, memilih view berdasarkan role dan mode.
- `src/context/AppContext.tsx`: global state, action facade, persistence LocalStorage.
- `src/components`: UI berdasarkan domain dan role.
- `src/models`: representasi domain object.
- `src/controllers`: class controller untuk operasi domain.
- `src/types`: kontrak TypeScript untuk entity dan state.
- `src/data/mockData.ts`: data awal untuk simulasi.
- `src/api`: placeholder/facade endpoint untuk integrasi API.

## Mode Tampilan

- `PLATFORM`: aplikasi utama.
- `BLUEPRINT`: halaman blueprint arsitektur.

## Role Aplikasi

- `GUEST`
- `PATIENT` / pengguna
- `ADMIN`
- `PSYCHOLOGIST` / super admin / pengelola

Role tertinggi adalah psikolog/super admin/pengelola karena role ini dianggap sebagai owner company/praktik. Admin berada di bawah psikolog dan berfokus pada verifikasi serta pemantauan operasional.

## Persistence Saat Ini

Data disimpan di `localStorage` dengan prefix `jiwasehat_v2_`. Ini hanya cocok untuk simulasi/prototype, bukan produksi.

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

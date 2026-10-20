# JiwaSehat — Laravel, Inertia dan React

Satu proyek Laravel 13 + Inertia 3 + React 19/TypeScript. Routing halaman dan autentikasi dikelola Laravel melalui routes/web.php; React mengerjakan tampilan. Satu domain/deployment, tanpa backend REST terpisah untuk navigasi web.

## Mulai membaca

- [Perubahan arsitektur dan konteks untuk Eko](docs/PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md).
- [Panduan menyeluruh Eko](docs/EKO_PROJECT_GUIDE.md) dan [indeks dokumentasi](docs/README.md).
- [Setup lokal](docs/SETUP.md) dan [panduan kerja agent](docs/AGENTS.md).
- [Aturan bisnis](docs/BUSINESS_RULES.md), [kontrak web](docs/WEB_CONTRACT.md), [hak akses](docs/ROLES_PERMISSIONS.md), dan [database](docs/DATABASE_ARCHITECTURE.md).

## Struktur

```text
app/                 Controller, request, middleware dan model Laravel
bootstrap/           Bootstrap serta registrasi middleware
config/              Konfigurasi Laravel/Inertia dan placeholder publik
database/            Fondasi migration; schema domain masih target docs
docs/                Dokumentasi proyek, fitur, pelaku, journey dan arsip
public/              Document root web server dan hasil Vite
resources/js/pages/  Halaman web Inertia serta preview lokal Eko
resources/js/layouts/Layout web berbasis sesi Laravel
resources/js/components/ Komponen tampilan Eko yang digunakan bertahap
resources/js/legacy/ HTTP client terdahulu sebagai referensi, bukan jalur web
resources/css/       Stylesheet Tailwind
resources/views/     Blade pemuat Inertia/Vite
routes/web.php       Route halaman dan action web
storage/             File privat, log, sesi dan cache
tests/               Kerangka pengujian, belum dijalankan dalam sesi ini
```

## Status implementasi

Fondasi sudah memuat beranda publik dari Laravel, form login email/password berbasis sesi, logout dan workspace dashboard dengan pembatasan role server. Login nyata memerlukan database/users yang sesuai; sesi ini tidak membuat database atau akun. Seluruh booking, ledger, upload, Google SSO, Baileys dan fitur klinis belum otomatis menjadi backend operasional.

Desain lengkap Eko tetap di resources/js, dapat dipratinjau melalui /preview/eko hanya pada lingkungan local dan flag aktif. Preview menggunakan mock/LocalStorage; aksi di sana tidak menyimpan transaksi ke database praktik. Halaman web utama tidak mengambil data dari AppContext mock.

Dependency terpasang dan pemeriksaan statis dijalankan; browser, dev server, build, test suite, migration/seeding tidak dijalankan. Tanpa aset Vite yang tersedia, halaman belum dapat ditampilkan. Langkah operator dan batas validasi ada di [SETUP](docs/SETUP.md).

Git dikelola developer. Agent wajib mengikuti [AGENTS](docs/AGENTS.md); larangan dev server/build/test tanpa izin tetap berlaku.

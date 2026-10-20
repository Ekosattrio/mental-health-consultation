# Setup Laravel 13, Inertia 3 dan React

Diperbarui 20 Oktober 2026 setelah persetujuan developer. Laravel berada di root, React di resources/js, stylesheet di resources/css dan Blade di resources/views. Perubahan untuk Eko dirinci di [catatan migrasi](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md).

## Kebutuhan lokal

- PHP minimal8.3 dengan openssl, curl, mbstring, fileinfo, PDO MySQL dan ekstensi standar Laravel.
- Composer2.10+; archive dist dan source-fallback=false dipakai agar instalasi tidak beralih ke Git.
- Node sesuai package.json: ^20.19.0 atau >=22.12.0; setup ini memakai Node24.
- MySQL8 untuk data aplikasi. Database/tabel/akun tidak dibuat oleh sesi setup.

PHP CLI yang dipakai adalah C:/laragon/bin/php/php-8.3.30-Win32-vs16-x64/php.exe. PHP8.3.33 yang ditemukan belum memuat php.ini/openssl CLI; jangan mengubah konfigurasi global tanpa kebutuhan. Web server/terminal Laragon harus memakai PHP dan ekstensi yang sesuai.

Versi terkunci saat migrasi: Laravel13.37.0, inertia-laravel3.5.1, @inertiajs/react3.9.1, React19.3.0 dan Vite8.3.4. Versi adapter PHP dan React tidak harus memiliki angka minor sama. Lockfile adalah acuan instalasi ulang.

## Instalasi dari checkout baru

Panduan operator; bukan pernyataan semua perintah ini boleh/dijalankan agent. Jalankan dari root:

```powershell
$env:COMPOSER_ROOT_VERSION = '1.0.0'
composer install --prefer-dist --no-scripts --no-plugins --no-interaction
npm ci --ignore-scripts
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item -LiteralPath .env.example -Destination .env
}
php artisan package:discover --ansi
```

Generate APP_KEY hanya jika .env baru dan kuncinya belum diisi; jangan merotasi kunci aplikasi yang telah digunakan. Setup sebelumnya sudah membuat kunci lokal. Composer/npm lockfile disimpan; file dependency vendor/node_modules tetap mengikuti struktur paket, bukan dipindahkan ke docs.

## Konfigurasi lingkungan

- APP_URL sesuai origin Laravel. Default localhost:8000; domain Laragon boleh digunakan dengan konfigurasi web server yang sesuai.
- DB_CONNECTION=mysql dan kredensial diisi operator. Jangan menampilkan .env/kredensial dalam laporan.
- SESSION_DRIVER=file, SESSION_ENCRYPT=true, CACHE_STORE=file untuk bootstrap tanpa tabel sesi/cache; storage tetap privat. Target database session/cache dapat diaktifkan setelah tabel/konfigurasinya siap.
- QUEUE_CONNECTION=database adalah target; jangan menjalankan worker sebelum migration/tabel jobs dan konfigurasi DB siap.
- ENABLE_LEGACY_PREVIEW=false default. .env lokal sesi ini true untuk melihat desain Eko. Middleware tetap mensyaratkan APP_ENV=local; mengaktifkan flag di production tetap404. Jangan pakai APP_ENV=local pada deployment publik.
- INERTIA_ENCRYPT_HISTORY=true. Fitur menggunakan Web Crypto dan membutuhkan secure context (HTTPS atau localhost). Untuk http://nama-proyek.test lokal, gunakan HTTPS atau matikan flag ini hanya pada lokal bila diperlukan. Produksi wajib HTTPS. Enkripsi history bukan pengganti policy.
- Produksi: APP_ENV=production, APP_DEBUG=false, SESSION_SECURE_COOKIE=true; host/session/cache/proxy sesuai deployment. SSR dan devtools Inertia disabled di config/inertia.php.
- MAIL_MAILER=log hanya lokal. Google OAuth, provider email dan Baileys belum diaktifkan.

VITE_API_BASE_URL/TIMEOUT, VITE_USE_SANCTUM/SANCTUM_STATEFUL_DOMAINS bukan konfigurasi web aktif. Sanctum sudah dilepas; jangan memanggil /sanctum/csrf-cookie. Inertia memakai CSRF sesi Laravel. Variabel VITE_* terlihat browser; jangan berisi rahasia.

Tidak ada migrate/migrate:fresh/seed/storage:link otomatis. Migration users/cache/jobs hanya fondasi awal, bukan seluruh46tabel domain. users memakai UUIDv4/password_hash, enum role/status dan row_version; FK sessions sesuai UUID. remember_token adalah kolom teknis Laravel. Belum ada provisioning satu owner maupun akun demo. Login nyata menunggu DB/users yang sesuai, bukan tombol role mock.

## Entry dan route

- main.tsx menjalankan createInertiaApp, lazy resolver pages/**/*.tsx dan stylesheet. Instalasi client manual, tanpa kewajiban plugin @inertiajs/vite tambahan.
- app.blade.php memakai @viteReactRefresh, @vite dan komponen Blade head/app Inertia3.
- routes/web.php mendaftarkan /, /login, /logout, /dashboard dan workspace per role; tidak ada shell catch-all atau api.php aktif. /up adalah health bawaan.
- Home memakai data publik whitelist dari config/jiwasehat.php sementara CMS/katalog DB belum tersedia. Tidak ada harga publik, review palsu atau paket bookable.
- Auth/Login memakai useForm; LoginRequest memeriksa kredensial/status, field tidak didukung dan rate limit; sukses regenerate session, logout invalidate/regenerate CSRF serta clear history. Workspace diperiksa backend auth+active+role.
- /preview/eko memuat App.tsx lama dengan data demo/LocalStorage; akses hanya lokal+flag. Client HTTP terdahulu di resources/js/legacy/api adalah referensi, bukan data layer halaman baru. Modul resources/js/api adalah mock lokal lama, bukan route PHP.
- Alias @ -> resources/js. Hasil build kelak di public/build; root index.html tidak lagi menjadi entry. Private disk tidak membuka download/upload otomatis.

Web server wajib document root public/. Sebelum Vite dev server atau manifest build tersedia, halaman dapat gagal dengan ViteManifestNotFoundException; aset belum dibuat dalam sesi ini. Memasang dependency tidak sama dengan menjalankan aplikasi. Jangan mengandalkan npm run preview sebagai server aplikasi Laravel.

## Pemeriksaan dan lanjutan

Pemeriksaan sesi ini terbatas pada struktur/link/import, integritas pemindahan komponen, typecheck TypeScript, syntax PHP, metadata dependency/platform dan daftar route. Hasil final tercatat di [SESSION_HANDOFF](SESSION_HANDOFF.md).

Tidak menjalankan browser/dev server/build/test suite, migration/seeding atau Git. Belum ada klaim login nyata, transaksi domain, render visual, provider eksternal atau deployment sudah teruji. Berikutnya pengembang menyiapkan database/provisioning aman, menyelesaikan domain per fitur, lalu menjalankan pemeriksaan integrasi/render setelah developer mengizinkan.

Referensi resmi: [Laravel frontend](https://laravel.com/docs/13.x/frontend#inertia), [autentikasi Laravel](https://laravel.com/docs/13.x/authentication), [setup server Inertia3](https://inertiajs.com/docs/v3/installation/server-side-setup), [setup client manual](https://inertiajs.com/docs/v3/installation/client-side-setup), [form Inertia](https://inertiajs.com/docs/v3/the-basics/forms).

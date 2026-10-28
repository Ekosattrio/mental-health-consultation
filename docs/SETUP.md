# Setup lokal Laravel13, Inertia3 dan React

Status26 Oktober2026: backend domain, controller, workspace React, PDF, ekspor, scheduler dan adapter notifikasi telah dibuat. [Hasil implementasi](IMPLEMENTASI_WEB_2026-10-26.md) menjelaskan alur dan pembatasan akses. [Handoff](SESSION_HANDOFF.md) menyimpan hasil pemeriksaan terbaru.

## Kebutuhan

PHP8.3+ dengan PDO MySQL, openssl, mbstring, fileinfo, curl, DOM/XML, zip dan ekstensi standar Laravel. MySQL8.0.16+; lingkungan lokal memakai8.4.3. Node sesuai package.json, dan22.13+ bila bridge Baileys dijalankan. Composer serta npm memakai lockfile proyek.

CLI lokal yang dipakai: C:/laragon/bin/php/php-8.3.30-Win32-vs16-x64/php.exe. Versi dependency terkunci diperiksa melalui composer.lock dan package-lock.json; tidak perlu menyamakan angka minor adapter PHP dengan adapter React.

## Instalasi baru

1. Dari root, composer install --prefer-dist --no-interaction dan npm ci --ignore-scripts. Konfigurasi Composer source-fallback=false menjaga penggunaan dist.
2. Salin .env.example hanya jika .env belum ada. Isi DB, APP_URL dan APP_KEY. Jalankan key:generate hanya pada instalasi baru yang belum memiliki kunci; jangan mengganti kunci data lama.
3. Buat database kosong milik aplikasi lalu php artisan migrate. Jangan memakai migrate:fresh pada data yang perlu dipertahankan.
4. php artisan practice:install membuat owner dan konfigurasi awal tanpa pasien/appointment demo. Untuk tiga akun yang ditetapkan pengguna pada lingkungan ini, lihat [akun awal](AKUN_AWAL_DAN_CARA_MASUK.md).
5. npm run build menyiapkan aset public/build. Jalankan Laravel dengan document root public/ atau php artisan serve. npm run preview bukan server aplikasi.
6. Jalankan php artisan queue:work database --timeout=150 dan php artisan schedule:work pada lokal bila menguji otomasi. DB_QUEUE_RETRY_AFTER=180 lebih besar daripada timeout worker.

## Lingkungan dan data

Session Laravel memakai cookie/CSRF pada origin yang sama; tidak ada bearer token atau bootstrap Sanctum. SESSION_ENCRYPT=true, INERTIA_ENCRYPT_HISTORY=true. Gunakan localhost atau HTTPS untuk Web Crypto. Produksi wajib HTTPS dan SESSION_SECURE_COOKIE=true.

Default QUEUE_CONNECTION=database, CACHE_STORE=file, FILESYSTEM_DISK=local dan SESSION_DRIVER=file. Direktori storage/app/private tidak dipublikasikan dengan storage:link. Download melalui controller berizin. Cache/file harus dapat ditulis proses aplikasi.

ENABLE_LEGACY_PREVIEW=false mematikan prototype LocalStorage. Bila Eko sengaja membukanya di lingkungan lokal, perilaku prototype yang lama tidak menjadi aturan produksi. Route preview tetap404 pada APP_ENV=production.

MAIL_MAILER=log hanya untuk lokal. Google SSO menunggu Client ID, WhatsApp menunggu penautan ponsel dan nomor tujuan owner. Kode integrasi sudah tersedia; lihat [panduan WhatsApp dan Google](INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md). Rincian pairing, supervisor, cron, backup/restore dan produksi: [operasional satu VPS](OPERASIONAL_VPS_DAN_INTEGRASI.md).

## Verifikasi

- npm run lint: TypeScript.
- npm test: regresi komponen/prototype dan integritas import.
- npm run build: aset produksi.
- php vendor/bin/phpunit: smoke Laravel.
- php vendor/bin/phpunit -c tests/phpunit-domain.xml: alur domain pada MySQL acak; mencakup konkurensi dua proses.
- php tests/database-foundation.php: constraint, migration, rollback/remigrate pada MySQL acak.

Jangan menganggap smoke SQLite menggantikan pengujian constraint MySQL. Tidak ada perintah Git yang dijalankan agent. Referensi arsitektur resmi tersimpan pada [catatan Inertia](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md).

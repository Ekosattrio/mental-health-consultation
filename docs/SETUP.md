# Setup lokal Laravel13, Inertia3 dan React

## Mode aktif setelah audit build30Oktober2026

Build produksi berhasil setelah izin Eko. Laravel pada127.0.0.1:8000 kini memakai public/build; public/hot dicadangkan ke storage/app/vite-hot-before-production-20261030.txt tanpa mematikan terminal Vite/PHP atau Laragon. Hard refresh browser sebelum menguji/mengulang Lighthouse. Tidak perlu membuka npm run preview.

Untuk kembali mengedit dengan HMR, hentikan lalu jalankan ulang satu terminal npm run dev existing agar marker hot ditulis kembali. Jangan membuat instance kedua pada port5173. Alternatifnya pulihkan backup marker jika Vite existing masih merespons. Selama memakai build, perubahan source berikutnya membutuhkan build ulang atau kembali ke mode dev. Ini pengaturan aset lokal, bukan perpindahan APP_ENV/database ke produksi.

## Urutan menjalankan project

1. Kelola MySQL lewat menu Start/Stop MySQL di Laragon. Aktifkan Apache dari Laragon bila ingin membuka phpMyAdmin. Backend PHP dan Vite tidak menyalakan kedua layanan tersebut secara otomatis.
2. Di folder project, jalankan `php artisan serve --host=127.0.0.1 --port=8000`.
3. Pada terminal lain di folder yang sama, jalankan `npm run dev` oleh developer.
4. Buka `http://127.0.0.1:8000`, bukan alamat Vite.

Vite lokal menggunakan host eksplisit127.0.0.1 dan port5173 dengan strictPort. Ini menyamakan loopback dengan artisan serve dan menghindari variasi resolusi localhost IPv4/IPv6 di Windows. Jangan menjalankan instance kedua jika port terpakai. Jika halaman putih/loading, periksa respons HTML Laravel dan file `@vite/client`/main.tsx dari alamat pada public/hot secara terpisah. Pada30Oktober HTML merespons200 sementara aset Vite sempat timeout walaupun terminal menulis ready. Setelah pulih dan host dibuat eksplisit, public/hot memakai http://127.0.0.1:5173 dan67modul frontend berhasil diambil. Refresh tab lama agar URL modul di HTML ikut diperbarui. Jika konfigurasi belum diterapkan otomatis, developer me-restart satu terminal Vite yang sama.

Jika console masih menyebut `http://[::1]:5173` dan `Failed to fetch dynamically imported module`, lakukan Ctrl+Shift+R pada alamat Laravel127.0.0.1:8000 untuk membuang module graph tab lama. Ini dapat muncul setelah login sudah diterima; jangan reset password/database berdasarkan error aset tersebut. Resolver terbaru menyediakan tombol muat ulang saat impor halaman gagal, tanpa mengirim ulang login/mutasi. Pesan Download React DevTools bukan error autentikasi.

Jika muncul SQLSTATE2002 connection refused ke127.0.0.1:3306, periksa bahwa MySQL aktif/listen pada port3306 sebelum mengubah konfigurasi aplikasi. Pada29Oktober2026 Laragon/MySQL sempat tidak berjalan sementara PHP dan Vite sudah aktif. MySQL dipulihkan memakai executable/my.ini dan folder data lama `C:/laragon/data/mysql-8.4`; database tidak dibuat ulang atau direset.

Aturan terbaru30Oktober2026: pemulihan manual29Oktober adalah histori, bukan cara menjalankan berikutnya. Jangan menjalankan mysqld langsung atau membuat auto-start di luar Laragon. Bila port3306 terpakai, identifikasi proses pemilik dan asalnya terlebih dahulu; jangan jalankan instance tambahan, membunuh proses atau mengganti port secara otomatis. Dua proses mysqld dapat berupa parent/child satu instance; periksa listener dan rantai proses, bukan hanya jumlah nama executable.

Pemeriksaan30Oktober menemukan satu listener3306 dengan rantai proses berawal dari Laragon; proses manual29Oktober sudah tidak ada. Tidak ditemukan auto-start MySQL pada script project, Windows Run atau scheduled task terkait. .env memakai127.0.0.1:3306 dan tidak diubah. Menutup jendela Laragon tidak selalu menghentikan layanan; gunakan menu Stop untuk menghentikannya. phpMyAdmin adalah antarmuka melalui Apache/PHP, bukan pengelola MySQL tersendiri.

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

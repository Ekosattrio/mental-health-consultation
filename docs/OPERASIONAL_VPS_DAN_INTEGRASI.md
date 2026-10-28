# Operasional satu VPS dan integrasi

Gunakan bersama [setup](SETUP.md), [akun awal](AKUN_AWAL_DAN_CARA_MASUK.md) dan [hasil implementasi](IMPLEMENTASI_WEB_2026-10-26.md). Contoh berikut untuk operator; deployment publik belum dilakukan dari sesi pengembangan ini.

## Layanan dalam satu VPS

- Nginx/Apache mengarah ke direktori public/ Laravel, PHP-FPM8.3+ dan MySQL8.0.16+.
- React dibangun Vite menjadi public/build; Node tidak perlu menjalankan server frontend produksi.
- Satu worker Laravel database queue dan scheduler setiap menit. Redis bukan persyaratan.
- Bridge Baileys Node22.13+ sebagai proses tambahan pada loopback127.0.0.1:3210, hanya setelah aktivasi.

## Instalasi dan pembaruan

1. Siapkan .env dari .env.example, isi DB, APP_URL HTTPS, APP_ENV=production, APP_DEBUG=false, SESSION_SECURE_COOKIE=true, ENABLE_LEGACY_PREVIEW=false. Jangan mengganti APP_KEY yang sudah mengenkripsi data.
2. Pasang dependensi dari composer.lock/package-lock.json: composer install --prefer-dist --no-dev --no-interaction dan npm ci. Composer source-fallback=false mencegah fallback ke Git.
3. Buat database kosong hanya untuk instalasi pertama. Jalankan php artisan migrate --force; pembaruan tidak memakai migrate:fresh/reset.
4. Instalasi baru menggunakan php artisan practice:install. Perintah practice:initial-accounts khusus akun awal yang diminta pengguna; tidak mereset akun lama. Ganti kredensial awal sebelum penggunaan publik.
5. Jalankan npm run build, php artisan config:cache, php artisan view:cache. Jika memakai route:cache, verifikasi hasilnya karena sebagian route memakai closure.
6. storage/ dan bootstrap/cache/ harus dapat ditulis user proses web. File .env, storage/app/private, database dan session Baileys tidak dilayani Nginx.
7. Restart worker setelah pembaruan melalui php artisan queue:restart. Periksa /up, login, satu alur booking pada lingkungan uji dan status queue.

## Worker dan scheduler

Worker dikelola systemd/Supervisor dengan WorkingDirectory root aplikasi dan perintah:

```sh
php artisan queue:work database --sleep=1 --tries=3 --timeout=150 --max-time=3600
```

DB_QUEUE_RETRY_AFTER=180 harus lebih besar daripada timeout worker/job. GenerateExport mempunyai timeout120detik; SendNotification30detik. Queue memakai after_commit agar worker tidak membaca data yang belum tersimpan.

Cron operator, dengan path PHP/aplikasi yang sesuai:

```cron
* * * * * cd /srv/jiwasehat && /usr/bin/php artisan schedule:run >> /var/log/jiwasehat-scheduler.log 2>&1
```

practice:tick memeriksa hold, jendela koreksi, SLA12jam kerja, hak no-show empat hari, reminder owner dan pasien T−2jam, ringkasan harian dan outbox. practice:purge-files berjalan01.30WIB. withoutOverlapping memakai cache bersama pada VPS. Scheduler/worker harus hidup untuk otomasi; HTTP tidak menggantikan keduanya. Pantau queue:failed, log, kapasitas disk dan status pengiriman melalui workspace.

## WhatsApp dan Google

Langkah aktivasi, konfigurasi privat, menu penautan Superadmin, nomor tujuan owner, persetujuan pasien, Client ID Google Cloud, origin/redirect localhost dan domain produksi dijelaskan lengkap pada [panduan WhatsApp dan Google](INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md).

Pengirim WhatsApp lokal sudah ditetapkan pengguna; tujuan owner berasal dari users.phone akun Superadmin, bukan variabel WHATSAPP_OWNER_PHONE. Jalankan bridge loopback, worker dan scheduler sebagai tiga proses dengan supervisor pada VPS yang sama. Google One Tap dasar hanya membutuhkan Client ID; Client Secret server dipakai bila mengaktifkan redirect/People API tambahan.

## Email

Reset kata sandi memakai Laravel password broker. MAIL_MAILER=log adalah pengaturan lokal; produksi perlu SMTP/provider email, sender dan kredensial nyata di .env. Tautan reset mengandung token sehingga log lokal juga harus privat. Respons permintaan reset tidak mengungkap apakah email terdaftar.

## Backup dan restore

Backup harus mencakup dump MySQL konsisten, storage/app/private, session SQLite Baileys, konfigurasi privat dan APP_KEY yang sesuai. Menyimpan database tanpa APP_KEY tidak cukup untuk memulihkan jawaban klinis terenkripsi. Jangan membagikan backup melalui public/storage.

Gunakan mysqldump --single-transaction --routines --triggers dengan option file privat0600 milik operator, bukan password pada command line. Saat menyalin SQLite Baileys, gunakan mekanisme SQLite backup atau hentikan bridge sejenak; jangan menyalin file WAL secara sembarang. Bekukan perubahan saat membuat snapshot file dan database yang harus konsisten. Simpan arsip terenkripsi, batasi akses dan masa simpan maksimal satu tahun sesuai kebijakan; backup perlu salinan di luar disk VPS agar kerusakan disk tidak menghilangkan seluruh salinan.

Restore diuji pada database/direktori terpisah: pulihkan dump dan blob, gunakan APP_KEY yang sama, cocokkan checksum file, periksa login/akses, invoice, saldo dan histori. Jangan menimpa database aktif untuk mencoba restore. Backup/restore produksi dan tujuan penyimpanan belum diaktifkan otomatis karena VPS/penyimpanan nyata belum diberikan pengguna.

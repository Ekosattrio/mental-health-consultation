# Arsitektur JiwaSehat

Keputusan aktif 20 Oktober 2026: Laravel 13 + Inertia 3 + React 19/TypeScript/Vite dalam satu proyek dan domain. Developer menyetujui migrasi dari fondasi REST sebelumnya. [Catatan untuk Eko](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md) membedakan perubahan nyata dari fitur target.

## Alur web

Browser -> HTTPS/web server (document root public/) -> routes/web.php -> controller -> Inertia page props -> halaman React. Form React memakai useForm/router, action Laravel memvalidasi dan menyimpan, lalu redirect ke halaman hasil. Inertia tetap memakai HTTP dan data; tidak membutuhkan aplikasi API terpisah.

Route hanya menghubungkan URL, controller dan middleware. FormRequest memvalidasi input; middleware memeriksa sesi/status/role; policy memeriksa akses objek. Domain service/action mengelola perhitungan, state transition dan unit transaksi. Eloquent memetakan tabel; tidak perlu repository interface per tabel tanpa kebutuhan nyata.

Pisahkan service Calendar, Booking, Billing/Ledger, Reschedule, Assessment, TreatmentPlan, Reporting dan Notifications sesuai kebutuhan implementasi. Ini target domain; belum seluruh class/service dibuat.

## Autentikasi dan kontrak data

Browser memakai session Laravel web dan CSRF. Tidak ada bearer token, bootstrap Sanctum atau base URL REST untuk halaman utama. Login/logout email-password telah dibuat; register, Google SSO/linking, reset, revoke-all dan provisioning akun masih target F01. Akun BLOCKED ditolak saat login; middleware active memutus sesi tidak aktif pada workspace. Aturan satu Superadmin dan pencabutan semua sesi harus ditegakkan saat manajemen akun dibangun.

[WEB_CONTRACT](WEB_CONTRACT.md) mengatur props, form, JSON pendukung, error dan proyeksi per role. Shared props hanya identitas sesi sendiri, URL navigasi, nama aplikasi, flash/errors. Data domain diambil per halaman sesuai policy. Guest tidak menerima harga; Admin tidak menerima saldo/agregat penerimaan/jawaban klinis. Menyembunyikan CSS bukan kontrol akses.

Request JSON kecil untuk availability/autosave/status kirim kelak diperbolehkan melalui route web terotorisasi. Endpoint itu tidak dijadikan kunjungan Inertia. Kode409 domain dibedakan dari409 protokol Inertia; form mengembalikan errors/redirect yang dapat ditangani UI.

## Sumber kebenaran dan transaksi

Database/backend adalah otoritas harga, saldo, permission, deadline dan okupansi. React menyimpan state interaksi/draft non-sensitif; tidak mengesahkan uang atau mengubah role melalui Context. Idempotency, expected_version, unique constraint dan transaction/locking tetap wajib walau tidak memakai REST terpisah.

[DATABASE_ARCHITECTURE](DATABASE_ARCHITECTURE.md) menjadi kamus domain: UUID CHAR36, Rupiah integer, timestamp UTC/tanggal WIB. Okupansi hanya appointment; billing tidak mempunyai FK melingkar; invoice/receipt/event terbit immutable. Migration/model domain kini tersedia; aturan transaksi/policy/lock/scheduler tetap tahap berikutnya.

## Satu VPS

Satu VPS menjalankan web server, PHP sesuai Laravel13, MySQL8, private storage, scheduler/queue Laravel dan worker Node Baileys. Database queue/cache cukup sebagai pilihan awal; tidak mewajibkan Redis atau VPS kedua. Instalasi/deployment worker belum dilakukan.

Telelayanan: Admin menempel link Google Meet eksternal; save revisi+outbox dalam satu commit; worker mengecek attempt/versi/penerima/status dan mengirim WA. Link, pengiriman pesan dan kehadiran/pembayaran adalah fakta terpisah. Jaringan eksternal tidak dijanjikan exactly-once.

File privat di luar webroot; tidak ada route upload/download generik tanpa policy. HTTPS, cookie Secure, APP_DEBUG=false, backup/restore dan retensi mengikuti F15. Kredensial DB/Google/Baileys tidak masuk props, log atau frontend.

## Batas implementasi

Halaman utama Home/Auth/Login/Dashboard memakai Inertia. Preview Eko local terisolasi masih memakai App.tsx/AppContext/mock. Tidak boleh menjalankan mutasi mock dan backend untuk intent yang sama. Migrasi dilakukan per fitur dengan satu sumber data.

SSR dan devtools Inertia dinonaktifkan. Belum ada render HTML penuh untuk konten React/SEO; bila dibutuhkan, evaluasi Blade publik atau SSR secara terpisah. Enkripsi history membutuhkan HTTPS/secure context dan tidak menggantikan authorization. Bukti tes database tahap terbaru pada [handoff](FONDASI_DATABASE_DAN_MODEL_2026-10-24.md); browser/build/integrasi controller belum dikerjakan.

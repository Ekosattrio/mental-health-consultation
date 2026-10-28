# F01 — Autentikasi dan akun
## Latar belakang dan tujuan
Membedakan pengunjung, pasien dan petugas; menyediakan register, email/password, Google, reset password dan sesi yang dapat dicabut tanpa akun ganda.
## Aktor dan authorization
Guest register/login. Publik selalu mendapat PATIENT. Superadmin menyediakan akun internal ADMIN; tidak ada pendaftaran publik PSYCHOLOGIST. Akun blocked tidak dapat masuk melalui metode apa pun.
## Kolom/isian dan validasi
| Isian | Wajib | Validasi |
|---|---|---|
| name | Register | 1–150 karakter |
| email | Ya | format email, trim/lowercase, unik |
| password | Login lokal/register | kebijakan password server; hash, tidak pernah dikembalikan |
| Google subject/email_verified | Callback | issuer/audience/state/nonce diperiksa backend |
| reset token | Reset | sekali pakai, berlaku terbatas, disimpan hash |
Tidak ada role/status/google_subject yang boleh ditentukan lewat form register.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Browser membuka GET /login (page Auth/Login) dan mengirim form Inertia dengan session/CSRF Laravel; tidak memanggil endpoint Sanctum.
2. Server autentikasi, memeriksa status ACTIVE dan merotasi session; redirect /dashboard sesuai role server. Shared auth.user hanya identitas sesi sendiri; permission objek diperiksa server, bukan dari pilihan role di frontend.
3. Google dengan subject yang sudah terhubung memakai akun yang sama. Email verified yang cocok dapat dihubungkan hanya setelah bukti penguasaan akun lokal (login/reautentikasi atau tautan verifikasi); email sama saja bukan otorisasi.
4. Logout mencabut sesi; reset password mencabut sesi lama dan mengharuskan login ulang. Satu domain menggunakan session Laravel web.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Register / Guest | email belum ada | satu PATIENT ACTIVE |
| Login / akun aktif | kredensial valid | sesi baru |
| Block / Superadmin | ACTIVE | BLOCKED dan semua sesi dicabut |
| Reset / pemilik token | token sah | hash baru, token terpakai, sesi lama dicabut |
## Alur gagal dan pemulihan
Email terdaftar tidak membuat akun kedua. Login/reset gagal memberi pesan generik dan rate limit. Callback Google gagal tidak membuat akun setengah jadi. Reset expired meminta token baru. Request tanpa CSRF ditolak; UI memuat ulang sesi bila 401/419.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /account | ManagementController@account |
| GET / HEAD | /auth/google/callback | Auth\GoogleController@callback |
| GET / HEAD | /auth/google/complete | Auth\GoogleController@form |
| POST | /auth/google/complete | Auth\GoogleController@complete |
| POST | /auth/google/credential | Auth\GoogleController@credential |
| GET / HEAD | /auth/google/redirect | Auth\GoogleController@redirect |
| GET / HEAD | /forgot-password | Auth\AccountController@forgotForm |
| POST | /forgot-password | Auth\AccountController@forgot |
| GET / HEAD | /login | Auth\AuthenticatedSessionController@create |
| POST | /login | Auth\AuthenticatedSessionController@store |
| POST | /logout | Auth\AuthenticatedSessionController@destroy |
| GET / HEAD | /register | Auth\AccountController@registerForm |
| POST | /register | Auth\AccountController@register |
| POST | /reset-password | Auth\AccountController@reset |
| GET / HEAD | /reset-password/{token} | Auth\AccountController@resetForm |
| POST | /superadmin/users | ManagementController@user |
| POST | /superadmin/users/{user} | ManagementController@user |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Dua register bersamaan untuk email sama hanya membuat satu akun UUID.
- Register dengan role ADMIN ditolak sebagai field tidak diizinkan.
- Akun blocked tidak masuk dari Google; reset token tidak dapat dipakai dua kali.
## Hubungan fitur
F03 profil, F15 sesi/audit, F16 tutorial.

## Implementasi Google Identity Services

One Tap dan tombol resmi memakai Client ID. Backend memverifikasi ID token, signature, aud/iss/exp, email_verified dan nonce session. Callback redirect opsional memakai state/PKCE. Subject yang tertaut login akun sama; email lokal yang cocok memerlukan kata sandi untuk linking. Akun baru PATIENT dan melengkapi nomor/alamat/consent; Google tidak menjamin data nomor/alamat. Remember cookie30hari mendukung login ulang, logout eksplisit menghentikan auto-select. Konfigurasi, field dan alur gagal pada [panduan integrasi](../INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md).

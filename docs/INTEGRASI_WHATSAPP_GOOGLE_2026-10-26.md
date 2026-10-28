# Integrasi WhatsApp dan Google — 26 Oktober 2026

Dokumen perubahan untuk Eko. Arsitektur tetap satu aplikasi Laravel + Inertia + React, session web dan CSRF. Implementasi terdapat di app/Domain/GoogleIdentity.php, WhatsAppBridge.php, Notifications.php, Clockwork.php, controller terkait, serta services/whatsapp/. [Kontrak web](WEB_CONTRACT.md), [database](DATABASE_ARCHITECTURE.md), [status pengujian](SESSION_HANDOFF.md).

## WhatsApp: pengirim dan penerima berbeda

Pengguna menetapkan nomor pengirim **08558589536**, dinormalisasi menjadi **+628558589536**. Nomor ini tersimpan di konfigurasi privat Laravel dan bridge. Menuliskan nomor belum menautkan perangkat; pemilik harus menyelesaikan penautan di aplikasi WhatsApp pada ponselnya.

Nomor tujuan owner menggunakan **users.phone akun Superadmin**, diubah melalui Akun dan keamanan → Nomor WhatsApp tujuan pengingat owner. Nomor ini privat, terpisah dari kontak publik praktik di practice_identity. Kolom owner_settings.wa_owner_phone adalah peninggalan schema dan tidak lagi dibaca sebagai sumber tujuan; migration menyalin nilainya hanya jika nomor akun owner masih kosong. Tidak menebak bahwa nomor pengirim juga nomor penerima owner.

| Peristiwa | Penerima | Syarat |
|---|---|---|
| Booking standar/custom/lanjutan baru | Owner | Nomor privat owner terisi |
| Dua jam sebelum sesi | Owner | Jadwal aktif, tidak perlu reschedule; minimum awal terpenuhi atau bukti awal tepat waktu belum ditolak |
| Dua jam sebelum sesi | Pasien/penanggung jawab | Syarat jadwal sama; nomor dan persetujuan WhatsApp untuk booking tersebut tersedia |
| Jadwal dipindah, jam klinik berubah, pembatalan | Owner dan penerima pasien yang setuju | Attempt jadwal sesuai dan hak penerima masih berlaku |
| Ringkasan harian | Owner | Scheduler aktif; tautan dashboard, bukan isi klinis |
| Link Google Meet disimpan Admin | Nomor penerima link yang dikonfirmasi | Link dan attempt terbaru; mengganti link membuat versi baru |

Pengingat T−2 jam adalah dua jam waktu biasa sebelum start_at; berbeda dengan lead booking180menit kerja. Bukti transfer tepat waktu boleh belum diverifikasi saat pengingat, dan tidak dianggap uang terverifikasi. Scheduler terlambat yang baru bekerja sesudah sesi mulai membatalkan reminder lama. In-app tetap tersedia bila WhatsApp tidak dipilih atau gagal.

Booking menyediakan reminder_recipient_phone dan reminder_wa_accepted. Persetujuan Telelayanan sekaligus mencakup link, pengingat dan perubahan jadwal. Petugas hanya mencatat persetujuan nyata penerima. Pasien atau petugas dapat mengubah nomor/mencabut persetujuan pada tombol Pengingat WhatsApp di jadwal mendatang. Memerlukan expected_version dan akses pasien; pergantian nomor profil umum tidak diam-diam mengganti penerima booking. Lanjutan rangkaian mewarisi konteks pengingat dan dapat diubah kembali.

Pesan hanya memuat administrasi: kode booking, waktu WIB, nama secukupnya untuk owner, serta tautan dashboard/Meet sesuai tujuan. Tidak memuat keluhan, diagnosis, jawaban profiling, saldo atau laporan psikologis. Nomor dan payload tidak dikembalikan dalam daftar pengiriman Admin. Google Meet adalah tautan eksternal; host mengelola akses peserta di Google Meet.

## Penautan dan menjalankan WhatsApp

1. Dependensi Node di services/whatsapp/ dipasang dari package-lock.json. Gunakan Node22.13+ yang mendukung node:sqlite. Jalankan `npm start` dari direktori service. Ini proses tambahan pada VPS yang sama, bukan server frontend terpisah.
2. Konfigurasi bridge privat: WHATSAPP_ENABLED=true, WHATSAPP_PAIRING_PHONE=+628558589536, WHATSAPP_BRIDGE_PORT=3210 dan WHATSAPP_BRIDGE_SECRET acak minimal32karakter. Laravel memakai WHATSAPP_DRIVER=baileys, WHATSAPP_SENDER_PHONE yang sama, WHATSAPP_BRIDGE_URL=http://127.0.0.1:3210 dan secret yang sama. Konfigurasi lokal sudah disiapkan; secret tidak ditulis di dokumentasi.
3. Login Superadmin → Pengaturan praktik → Koneksi WhatsApp → Periksa koneksi. Saat NEEDS_PAIRING, pilih Tautkan nomor pengirim. Kode hanya muncul pada respons privat Superadmin, tidak disimpan di log/aplikasi publik. Kode berumur singkat; minta kembali jika kedaluwarsa.
4. Di ponsel nomor pengirim: WhatsApp → Perangkat tertaut → Tautkan perangkat → Tautkan dengan nomor telepon; masukkan kode. Periksa kembali hingga CONNECTED. Tidak ada OTP yang dikirim atau dibaca otomatis oleh website.
5. Isi nomor tujuan owner melalui profil privatnya. Pasien memilih nomor dan persetujuan pengingat pada booking. Setelah provider tersambung, event nyata dikirim oleh worker.
6. Jalankan Laravel worker database queue dan scheduler setiap menit mengikuti [panduan VPS](OPERASIONAL_VPS_DAN_INTEGRASI.md). Simpan session bridge di services/whatsapp/storage/; direktori ini harus privat dan persisten. Jangan menautkan nomor yang sama ke beberapa bridge dengan session terpisah.

Port3210 hanya loopback. HMAC mencakup timestamp dan body; request tanpa secret ditolak bahkan untuk status/pairing. GET /health hanya menyatakan siap/tidak. Endpoint website status dan pairing khusus Superadmin, tidak menerima nomor arbitrer dari browser. Root Laravel dan service mempunyai .env berbeda; keduanya tidak boleh diunggah ke repositori atau disajikan sebagai file publik.

Pengiriman menyimpan payload terenkripsi sebelum percobaan pertama. Retry menggunakan ID dan body yang sama, sehingga tidak berubah jika teks sumber diedit. Jurnal SQLite mengembalikan ACK lama tanpa mengirim ulang. Respons tanpa ACK tidak menjadi SENT. Hasil tidak pasti setelah timeout/crash perlu diperiksa di WhatsApp; tidak otomatis diberi ID baru. Nomor yang berubah setelah percobaan membatalkan retry lama. Persetujuan dicabut atau versi jadwal/link menjadi usang membatalkan pengiriman yang belum dimulai; pesan yang sudah diserahkan ke provider tidak dapat ditarik kembali oleh aplikasi.

Baileys adalah integrasi tidak resmi WhatsApp Web. Tidak memerlukan biaya pesan API Meta dalam desain ini; kestabilan sesi dan kebijakan WhatsApp tetap bergantung layanan WhatsApp. Biaya VPS, koneksi dan nomor tetap ada. Bukan layanan broadcast.

## Google Identity Services dan One Tap

Pilihan aktif: tombol resmi Sign in with Google dan One Tap. Google yang sudah tertaut dikenali melalui **provider + subject Google (sub)**. Alur tidak memeriksa seluruh akun Google di browser atau menyimpan kata sandi Google. Browser/FedCM dapat meminta pemilihan akun/konfirmasi; otomatis masuk hanya bila syarat Google dan browser terpenuhi.

| Kondisi | Hasil |
|---|---|
| Subject sudah tertaut dan akun ACTIVE | Login akun yang sama; tidak membuat profil/akun baru |
| Subject baru, email belum terdaftar | Form nama terisi; lengkapi nomor, alamat dan persetujuan privasi; akun baru selalu PATIENT |
| Subject baru, email akun lokal cocok | Wajib kata sandi akun lokal sebelum menautkan; role dan data lama dipertahankan |
| Akun BLOCKED | Ditolak, termasuk Google yang pernah tertaut |
| Token/state/nonce salah atau kedaluwarsa | Ditolak; ulangi login, tidak membuat akun setengah jadi |
| Logout eksplisit | Session dicabut dan auto-select dihentikan agar tidak langsung login kembali |

Nama dan email diambil dari token Google yang diverifikasi server. Nomor HP/alamat tidak dijamin tersedia pada login dasar. Pengguna melengkapinya satu kali; data tersimpan di akun dan profil administrasi. Jalur opsional Coba isi nomor dan alamat dari Google meminta scope People API tambahan, memerlukan Client Secret server serta konfigurasi People API; hasil kosong/izin tidak diberikan tetap dapat dilengkapi manual. Access/refresh token People API tidak disimpan.

Laravel memverifikasi tanda tangan dengan SDK google/auth, audience Client ID, issuer Google, masa berlaku, email_verified dan nonce sekali pakai dalam session. JS mengirim credential melalui fetch same-origin dengan CSRF Laravel; ini berbeda dari direct POST mode GIS. OAuth redirect opsional menggunakan state, nonce dan PKCE; endpoint token dan People API ditetapkan server. Constraint unik provider/subject dan user/provider mencegah tautan ganda; akun baru dan relasinya dibuat dalam satu transaksi. Login memakai remember cookie30hari, selama tidak dicabut/reset/diblokir; browser bisa menghapus cookie lebih awal.

## Mengisi Google Cloud untuk lokal dan produksi

1. Gunakan project Google Cloud milik praktik. Atur Google Auth Platform/consent branding dan buat OAuth client jenis **Web application**. Isi nama aplikasi, email dukungan serta URL privasi/ketentuan sesuai domain praktik. Akun testing perlu dimasukkan sebagai test user bila aplikasi masih Testing.
2. Untuk pengembangan, gunakan origin **http://localhost:8026** (atau port lokal yang benar), dan daftarkan juga **http://localhost**. Buka aplikasi dengan host/port yang sama; jangan mencampur localhost,127.0.0.1 dan domain .test. Di produksi gunakan domain HTTPS milik praktik, misalnya https://praktik.example, sebagai contoh saja, bukan domain yang sudah dibuat.
3. Authorized JavaScript origins berisi origin tanpa path. Jika memakai redirect/People API, tambahkan Authorized redirect URI tepat **http://localhost:8026/auth/google/callback**, dan padanannya pada domain HTTPS produksi. Skema, host, port dan path harus cocok.
4. Isi GOOGLE_ENABLED=true dan GOOGLE_CLIENT_ID pada .env Laravel. One Tap/tombol dasar membutuhkan Client ID; **Client Secret tidak dibutuhkan oleh browser**. GOOGLE_CLIENT_SECRET hanya server untuk redirect/People API opsional. Jangan gunakan VITE_* untuk secret dan jangan kirim secret di chat.
5. Sesuaikan APP_URL, jalankan `php artisan config:clear` pada lokal atau `php artisan config:cache` pada produksi, dan restart worker. Server Google harus dapat dihubungi untuk mengambil kunci verifikasi. Bila menambah CSP/COOP di Nginx, izinkan origin/frame/script Google sesuai dokumentasi resmi.
6. Uji akun baru, login ulang, email lokal yang sama, logout, akun blocked, dan browser dengan beberapa akun Google. One Tap dapat dibatasi browser; tombol resmi dan login email tetap tersedia.

SSO dasar ini memakai Google Identity Services, tanpa Firebase/Identity Platform berbayar atau SMS OTP. Domain produksi, Client ID dan Client Secret opsional belum diberikan; kode tidak mengarang kredensial atau mengklaim Google aktif sebelum konfigurasi nyata.

## Referensi resmi

- [Setup GIS dan origin lokal](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).
- [Automatic sign-in, FedCM dan logout](https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out).
- [Verifikasi ID token dan subject](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).
- [People API people.get](https://developers.google.com/people/api/rest/v1/people/get).
- [Baileys dan dokumentasinya](https://github.com/WhiskeySockets/Baileys).

## Keadaan konfigurasi terakhir

Nomor pengirim pengguna sudah dikonfigurasi dan bridge berhasil mencapai NEEDS_PAIRING. Nomor tujuan owner telah disimpan di profil privat melalui website, bukan pada sumber kode. Pengguna memilih menautkan ponsel sendiri nanti melalui menu Superadmin. Tidak ada pesan pengujian yang dikirim ke nomor nyata. Google masih menunggu Client ID; jangan mengisi Client ID contoh sebagai kredensial nyata. Hasil akhir:40tes MySQL/239assertion,34pemeriksaan schema,87regresi frontend,4tes bridge,2smoke Laravel, lint dan build lulus.

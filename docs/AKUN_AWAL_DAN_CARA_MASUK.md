# Akun awal dan cara masuk

Akun berikut dibuat sesuai permintaan Desman pada24–25Oktober2026. Username pendek diterjemahkan ke email akun yang sama; keduanya menggunakan verifikasi kata sandi Laravel, bukan pemilihan role mock.

| Peran | Username | Email | Kata sandi awal |
|---|---|---|---|
| Admin | admin | admin@jiwasehat.test | admin123 |
| Superadmin/owner | superadmin | superadmin@jiwasehat.test | superadmin123 |
| Pasien | pasien | pasien@jiwasehat.test | pasien123 |

## Masuk

Buka aplikasi Laravel, pilih Masuk atau kunjungi `/login`. Isikan username atau email tabel di atas dan kata sandinya. Server menentukan peran dari akun; tidak ada tombol ganti role yang memberikan kewenangan.

Superadmin masuk ke Pengelolaan Praktik. Admin masuk ke Administrasi Praktik. Pasien masuk ke Ruang Pasien. Akun Pasien awal tidak berisi jawaban klinis atau tanggal lahir buatan; lengkapi profil sebelum mencoba booking online.

## Pembuatan ulang pada instalasi baru

Setelah database dan `.env` siap, dari root proyek:

```powershell
php artisan migrate
php artisan practice:initial-accounts
```

Perintah tidak melakukan reset/fresh, tidak menghapus transaksi, dan tidak mengubah kata sandi akun yang sudah ada. Konfigurasi awal dibuat hanya jika praktik belum terpasang. Akun/nomor/rekening operasional dapat diatur dari workspace sesuai kewenangan.

Pilihan instalasi dengan identitas owner lain: `php artisan practice:install`; kata sandi diminta secara tersembunyi di terminal. Jangan menjalankan instalasi owner kedua pada database yang sudah memiliki owner.

## Pengaturan akun

Menu Akun & keamanan menyediakan perubahan nama/kontak, email, kata sandi, dan pencabutan sesi lain. Perubahan sensitif memerlukan kata sandi sekarang. Bila email akun awal diubah, gunakan email baru saat login; alias username pendek tetap menunjuk alamat awal yang tercantum di tabel.

Kata sandi pada tabel adalah akun awal yang diminta untuk pengembangan. Sebelum dipakai oleh petugas sungguhan, pemilik akun dapat menggantinya dari menu tersebut. Google SSO telah diimplementasikan dan memerlukan Client ID; WhatsApp memakai pengirim pengguna dan memerlukan pairing ponsel. Nomor tujuan owner diubah melalui akun Superadmin. Lihat [panduan WhatsApp dan Google](INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md). Login lokal tetap berfungsi.

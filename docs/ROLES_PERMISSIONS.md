# Roles and Permissions

## Hierarki Role

Urutan kewenangan dari paling tinggi:

1. Psikolog / Super Admin / Pengelola
2. Admin
3. Pasien / Pengguna

Catatan penting: psikolog adalah pemilik/pengelola utama company/praktik. Admin bukan role tertinggi; admin lebih fokus ke operasional, verifikasi, dan pemantauan.

## GUEST

Boleh:

- melihat landing page
- melihat daftar psikolog dan paket yang tampil publik
- membuka login/register SSO Google

Tidak boleh:

- membuat booking final
- mengakses dashboard pasien/psikolog/admin
- melihat data klinis

## PATIENT / PENGGUNA

Boleh:

- melihat dashboard pasien
- mengisi general info saat mendaftar
- mengisi pre-test sebelum booking
- melakukan booking konsultasi setelah pre-test lengkap
- melihat status booking miliknya
- mengunggah bukti pembayaran
- melihat status pembayaran miliknya
- mengajukan reschedule sesuai aturan minimal H+1
- meminta bantuan admin untuk reschedule melalui form jika tidak paham alurnya
- melihat riwayat konsultasi miliknya
- memberi review sesuai aturan sistem

Tidak boleh:

- booking untuk hari yang sama
- reschedule langsung untuk hari yang sama
- mengambil slot yang sudah tidak tersedia
- melihat data pasien lain
- melihat catatan klinis internal psikolog
- mengakses ruang chat konsultasi online, karena konsultasi online via web tidak masuk scope saat ini
- mengakses dashboard admin atau psikolog

## PSYCHOLOGIST / SUPER ADMIN / PENGELOLA

Boleh:

- melihat dashboard psikolog/pengelola
- melihat analytics dan keuntungan keuangan
- mengelola profil psikolog/praktik
- mengatur hari libur agar tidak bisa dibooking
- mengatur jam kerja
- mengatur batas jumlah pertemuan per hari
- melihat dan mengelola jadwal konsultasi
- melihat appointment yang terkait dengan layanan/praktik
- mengelola CMS landing page dan konten sistem
- menentukan atau menugaskan assessment/test lanjutan untuk pasien jika fitur ini disetujui

Tidak boleh:

- membuat perubahan yang melanggar privasi data pasien
- membuka akses data sensitif tanpa kebutuhan operasional/klinis yang sah

## ADMIN

Boleh:

- memantau user
- melihat data booking
- membantu booking pasien yang datang langsung
- membantu pasien mengajukan reschedule
- memverifikasi bukti pembayaran
- mengubah status pembayaran berdasarkan hasil verifikasi
- mengubah status booking dari `PENDING` ke `CONFIRMED`
- mengubah status booking dari `CONFIRMED` ke `COMPLETED`
- memoderasi review

Tidak boleh:

- menjadi role tertinggi di sistem
- mengelola CMS utama jika kewenangan tersebut sudah ditetapkan untuk psikolog/pengelola
- mengelola analytics keuntungan sebagai owner
- mengakses data klinis di luar kebutuhan pemantauan yang diizinkan

## Catatan Akses

- Hak akses laporan mengikuti role.
- Data pre-test, pembayaran, dan booking tersimpan di database dan harus dilindungi.
- Akses admin ke data klinis harus dibatasi berdasarkan kebutuhan operasional dan audit.

# Features

## Landing Page

- Hero dan informasi layanan.
- Daftar psikolog.
- Paket konsultasi.
- CTA booking dan tes.
- Konten CMS dasar.
- Tidak memakai klaim organisasi/lembaga yang belum valid.
- Section pengalaman/testimoni konseling dibuat carousel sekitar 10 item, bergerak otomatis dan bisa dikontrol manual.
- Footer menampilkan Instagram atau media sosial.

## Auth

- Login menggunakan SSO Google.
- Saat mendaftar, pengguna wajib mengisi general info seperti nama, pekerjaan, dan data dasar lain.
- Simulasi login berdasarkan role masih hanya kondisi prototype lama dan perlu diganti.

## Dashboard Pasien

- Overview.
- Booking konsultasi dengan pre-test sebagai syarat.
- Pre-test menggantikan intake form terpisah.
- Pengajuan reschedule minimal H+1.
- Form bantuan reschedule ke admin.
- Upload bukti pembayaran.
- Status booking dan pembayaran.
- Tes/assessment tambahan jika ditugaskan psikolog, masih perlu konfirmasi client.
- Riwayat.
- Tidak ada ruang chat konsultasi online di web.

## Dashboard Psikolog

- Overview.
- Jadwal.
- Pengaturan hari libur.
- Pengaturan jam kerja.
- Batas jumlah pertemuan per hari.
- Daftar pasien/appointment.
- Analytics keuntungan/keuangan.
- CMS management.
- Riwayat.
- Profil.
- Tidak ada ruang chat konsultasi online di web.

## Dashboard Admin

- Monitoring user.
- Monitoring booking.
- Membantu booking pasien yang datang langsung.
- Membantu request reschedule pasien.
- Verifikasi bukti pembayaran.
- Approval booking dari `PENDING` ke `CONFIRMED`.
- Penyelesaian booking dari `CONFIRMED` ke `COMPLETED`.
- Review moderation.

## Booking

- Booking tidak bisa untuk hari yang sama.
- Reschedule tidak bisa untuk hari yang sama.
- Slot harus berkurang saat digunakan.
- Slot yang tidak tersedia tidak boleh bisa dipilih.
- Hari libur psikolog tidak bisa dibooking.

## Pembayaran

- Upload bukti pembayaran.
- Verifikasi admin.
- Riwayat pembayaran.
- Skema DP 50% di awal dan 50% setelah konsultasi selesai.

## Laporan dan Export

- Generate laporan.
- Export PDF.
- Export Excel.
- Hak akses laporan mengikuti role.

## UI/UX

- Sidebar dashboard bisa ditutup/dikecilkan menjadi ikon.
- Layout harus nyaman untuk pengguna mouse dan jempol di mobile.
- Mode HP perlu diprioritaskan dan dirapikan.

## Blueprint

- Halaman blueprint arsitektur internal.

## Belum Produksi

- Backend API nyata.
- Database nyata.
- Auth aman.
- Payment gateway.
- Audit log.

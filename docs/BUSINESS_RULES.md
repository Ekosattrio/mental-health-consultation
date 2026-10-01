# Business Rules

## Booking Konsultasi

- Pengguna dapat melakukan booking setelah mengisi pre-test yang diwajibkan.
- Pasien memilih psikolog, paket, tanggal, dan slot jadwal.
- Sistem mencatat jadwal booking ke database.
- Sistem menyesuaikan ketersediaan slot.
- Slot yang telah digunakan akan mengurangi jumlah slot yang tersedia.
- Data booking tersimpan dalam database.
- Admin/pengelola dapat melihat data booking.
- Sistem mencegah penggunaan slot yang tidak tersedia.
- Psikolog/pengelola dapat memilih hari libur; booking tidak boleh tersedia pada hari libur tersebut.
- Psikolog/pengelola dapat membatasi jumlah pertemuan dalam satu hari.
- Psikolog/pengelola dapat membuat dan mengubah jam kerja.
- Pasien tidak boleh booking untuk hari yang sama. Minimal booking adalah keesokan hari.
- Pasien tidak boleh reschedule langsung untuk hari yang sama. Minimal reschedule adalah keesokan hari.
- Admin dapat melayani pasien yang datang langsung dan membuatkan booking untuk pasien tersebut.
- Pasien dapat mengajukan reschedule ke admin melalui form jika tidak memahami cara reschedule mandiri.
- Perubahan jadwal harus memperbarui database.
- Slot yang sudah ter-booking tidak boleh tersedia untuk booking lain.
- Appointment memiliki status:
  - `PENDING`
  - `CONFIRMED`
  - `COMPLETED`
  - `CANCELLED`
- Payment status saat ini:
  - `PENDING`
  - `DP_PAID`
  - `PAID`
  - `REFUNDED`

## Locking Slot Booking

- Saat pasien mengirim booking, sistem perlu mencegah slot yang sama diambil pengguna lain.
- Mekanisme final belum dipilih.
- Kandidat mekanisme:
  - temporary hold dengan expiry saat pasien mengisi pembayaran
  - database transaction dengan unique constraint pada slot aktif
  - status booking `PENDING` langsung mengunci slot sampai expired/dibatalkan
- Keputusan ini perlu dibuat saat desain backend/database.

## Psikolog

- Psikolog wajib memiliki profil profesional.
- Nomor STR dan SIP perlu disimpan dan nantinya divalidasi.
- Psikolog adalah role tertinggi sekaligus pengelola/owner praktik.
- Psikolog dapat mengelola jadwal, hari libur, batas pertemuan harian, jam kerja, CMS, analytics keuangan, riwayat, dan profil.
- Tidak ada ruang chat konsultasi online di web pada scope saat ini.

## Pasien

- Pasien mengisi general info saat registrasi.
- Pasien wajib mengisi pre-test sebelum booking.
- Form intake terpisah tidak diperlukan; kebutuhan awal digabung ke pre-test/booking flow.
- Pasien dapat mengerjakan test/assessment tambahan jika ditugaskan oleh psikolog.
- Pasien dapat melihat riwayat konsultasi.
- Pasien dapat memberi review setelah sesi selesai.

## Pre-Test dan Tes Psikologi

- Pengguna dapat mengisi pre-test.
- Hasil pre-test tersimpan dalam database.
- Hasil pre-test dapat diakses pengguna sesuai hak akses.
- Admin/pengelola dapat melihat hasil sesuai kewenangan.
- Data pre-test menjadi bagian dari data sistem dan dikelola sesuai ketentuan keamanan data.
- Tes yang tersedia saat ini: DASS-21, PHQ-9, GAD-7.
- Hasil tes adalah screening awal, bukan diagnosis final.
- Interpretasi klinis harus disajikan secara hati-hati.
- Mekanisme assessment/test tambahan oleh psikolog masih perlu dikonfirmasi ke client.

## Pembayaran

- Pengguna dapat mengunggah bukti pembayaran.
- Bukti pembayaran tersimpan dalam sistem.
- Admin dapat melihat bukti pembayaran.
- Admin dapat melakukan verifikasi pembayaran.
- Status pembayaran dapat diperbarui berdasarkan hasil verifikasi.
- Riwayat pembayaran disimpan dalam database.
- Skema pembayaran: DP 50% di awal dan pelunasan 50% setelah konsultasi selesai.
- Status pembayaran perlu mendukung minimal:
  - belum bayar
  - bukti DP diunggah
  - DP terverifikasi
  - bukti pelunasan diunggah
  - lunas
  - ditolak/refund jika diperlukan

## Laporan dan Export Data

- Sistem dapat menghasilkan laporan.
- Data dapat diekspor ke PDF.
- Data dapat diekspor ke Excel.
- Data laporan mengikuti data yang tersimpan dalam database.
- Hak akses terhadap laporan mengikuti hak akses pengguna.

## Review

- Review dari pasien harus dimoderasi admin.
- Review dapat dibuat anonim.
- Review yang belum disetujui tidak seharusnya tampil publik.

## Catatan Klinis

- Catatan klinis menggunakan format SOAP.
- Catatan klinis hanya boleh diakses psikolog terkait dan admin yang berwenang.
- Data klinis tidak boleh dipaparkan ke publik.

## Landing Page

- Landing page tidak boleh memakai klaim organisasi/lembaga yang tidak valid, misalnya teks seperti `Praktik Mandiri Berizin Resmi Kemenkes RI` jika tidak ada dasar legal yang jelas.
- Bagian pengalaman konseling bersama psikolog perlu dibuat carousel, menampilkan sekitar 10 item, auto-play, dan bisa digerakkan manual.
- Footer perlu memuat Instagram atau media sosial lain.

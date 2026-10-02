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
- Skema Waktu Dinamis: Durasi slot yang dihasilkan pada sistem booking tidak dipatok kaku 60 menit, melainkan mengikuti durasi riil paket yang dipilih pasien (misal 60, 75, atau 90 menit). Slot dihitung dari jam buka klinik dengan interval fleksibel, mengecualikan waktu istirahat (12:00 - 13:00) dan bentrok dengan sesi yang sudah terdaftar.
- Penyesuaian Kuota Tanggal Tertentu (*Custom Date Quota Override*): Psikolog dapat menetapkan kuota maksimal pasien atau status libur pada tanggal spesifik (contoh: tanggal tertentu hanya menerima 2 pasien). Aturan tanggal khusus ini diprioritaskan di atas jadwal mingguan standar.
- Deteksi Ketersediaan Real-Time: Pasien lain hanya diperbolehkan memesan jika sisa kuota pasien hari tersebut masih tersedia (> 0) DAN terdapat rentang waktu luang yang cukup untuk menampung durasi paket yang diminta tanpa bertabrakan dengan jadwal pasien lain.
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

## Reschedule Jadwal Konsultasi

- Pasien dapat mengajukan perubahan jadwal (reschedule) secara mandiri melalui menu Jadwal & Riwayat di portal pasien.
- **Batas Waktu Pengajuan**: Pengajuan reschedule wajib dilakukan minimal **H-1 (24 jam sebelum jadwal sesi lama dimulai)**. Sistem memblokir pemilihan tanggal hari-H atau masa lalu.
- **Perlakuan Pembayaran**: Pembayaran uang muka (DP 50%) atau biaya pelunasan yang sudah tercatat otomatis dialihkan 100% ke jadwal pengganti tanpa potongan biaya administrasi.
- **Pemilihan Jadwal Baru**: Pasien memilih tanggal baru dan slot waktu yang tersedia dari jadwal operasional aktif psikolog.
- **Pencatatan Alasan**: Pasien wajib memilih alasan reschedule (Kondisi Kesehatan, Pekerjaan/Dinas Mendadak, Keperluan Keluarga, Transportasi, atau Lainnya) serta catatan opsional untuk dokter.
- **Pembaruan Sistem**: Jadwal pada kalender psikolog dan admin langsung diperbarui, dan status janji temu ditandai sebagai jadwal ter-reschedule.

## Laporan dan Export Data

- **Fleksibilitas Filter**: Laporan keuangan kas nyata dapat difilter berdasarkan:
  - Pilihan Bulan dan Tahun spesifik
  - Rentang Tanggal Spesifik (*Start Date* s/d *End Date*)
  - Seluruh Riwayat Transaksi Praktik
- **Kelengkapan Data 100%**: Fitur ekspor menangkap seluruh data baris yang lolos kriteria filter secara utuh tanpa terpotong oleh batasan pagination tabel antarmuka.
- **Kop Surat Resmi Praktik Mandiri**:
  - Pratinjau dokumen dan hasil cetak PDF wajib dilengkapi Kop Surat Resmi Klinik JiwaSehat (Nama Praktik Mandiri, Praktisi Penanggung Jawab, Nomor SIP & STR, Alamat Resmi Klinik, dan Kontak Hotline).
  - Dilengkapi ringkasan eksekutif kas nyata, tabel rincian transaksi lengkap, serta lembar tanda tangan basah/legal psikolog penanggung jawab.
- **Format Ekspor**:
  - Cetak Langsung / Unduh PDF ber-Kop Surat Resmi (`@media print` siap cetak).
  - Unduh Spreadsheet CSV / Excel dengan encoding UTF-8 BOM agar terbaca sempurna di Microsoft Excel.

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

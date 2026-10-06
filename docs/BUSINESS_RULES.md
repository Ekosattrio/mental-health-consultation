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
- Psikolog/pengelola mengelola kebijakan no-show, keterlambatan, pembatalan, dan penghentian paket berjalan.
- Pasien tidak boleh booking untuk hari yang sama. Minimal booking adalah keesokan hari.
- Pasien tidak boleh reschedule langsung untuk hari yang sama. Minimal reschedule adalah keesokan hari.
- Admin dapat melayani pasien yang datang langsung dan membuatkan booking untuk pasien tersebut.
- Admin hanya memverifikasi pembayaran dan mengonfirmasi booking; admin tidak membatalkan, menghapus, atau menandai selesai konsultasi. Status konsultasi selesai ditandai manual oleh psikolog/pengelola setelah sesi benar-benar selesai.
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
  - `NO_SHOW`
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

- Pasien mengisi kredensial saat registrasi.
- **Kelengkapan Data Diri Wajib**: Pasien wajib melengkapi data diri (Nama, No HP/WA, Tanggal Lahir, Jenis Kelamin, Domisili/Kota, Pekerjaan, Kontak Darurat) sebelum diizinkan memilih paket konsultasi. Bila profil belum lengkap, paket berstatus terkunci (*locked*).
- Pasien wajib mengisi pre-test keluhan sebelum booking.
- Form intake terpisah tidak diperlukan; kebutuhan awal digabung ke pre-test/booking flow.
- Pasien dapat melihat riwayat konsultasi.
- Pasien dapat memberi review setelah sesi selesai.

## Pre-Test Profiling

- Pengguna dapat mengisi pre-test.
- Hasil pre-test tersimpan dalam database.
- Hasil pre-test dapat diakses pengguna sesuai hak akses.
- Admin/pengelola dapat melihat hasil sesuai kewenangan.
- Data pre-test menjadi bagian dari data sistem dan dikelola sesuai ketentuan keamanan data.
- Scope saat ini hanya pre-test profiling untuk kebutuhan booking dan persiapan sesi.
- Tidak ada test psikolog tambahan atau asesmen mandiri aktif pada portal pasien.
- Hasil pre-test adalah informasi awal, bukan diagnosis final.
- Interpretasi klinis tetap menjadi wewenang psikolog saat sesi.

## Pembayaran

- Pengguna wajib mengunggah bukti pembayaran transfer.
- Pengguna wajib mencantumkan nama pemilik rekening pengirim transfer (`transferSenderName`).
- Pengguna dapat mencantumkan nomor referensi/kode transaksi pembayaran.
- Bukti pembayaran tersimpan dalam sistem.
- Admin dapat melihat bukti pembayaran, nama pengirim transfer, metode/channel bayar, dan nomor referensi.
- Admin dapat melakukan verifikasi pembayaran.
- Status pembayaran dapat diperbarui berdasarkan hasil verifikasi.
- Riwayat pembayaran disimpan dalam database.
- **Skema Pembayaran Resmi**: Wajib **DP Flat Rp 100.000** sebagai biaya administrasi penguncian slot jadwal, dan sisa biaya paket dilunasi saat pasien hadir di klinik.
- Status pembayaran mendukung:
  - `PENDING` (belum bayar)
  - `DP_PENDING_VERIFICATION` (bukti transfer DP diunggah, menunggu verifikasi admin)
  - `DP_PAID` (DP Rp 100.000 telah diverifikasi admin)
  - `PAID` (lunas, sisa tagihan telah diselesaikan di klinik)
  - `REFUNDED` (pengembalian dana jika diperlukan)

## Invoice / Kwitansi

- Sistem perlu menghasilkan invoice/kwitansi pembayaran untuk setiap booking.
- Minimal informasi invoice: kode invoice, kode booking, nama pasien, paket, tanggal sesi, total biaya paket, DP Rp 100.000, sisa pelunasan, metode pembayaran, channel pembayaran, nama pengirim, nomor referensi, status pembayaran, dan bukti pembayaran.
- Invoice pasien dapat dilihat dari riwayat booking.
- Backend produksi wajib menyimpan invoice sebagai data terstruktur agar bisa dicetak ulang dan diaudit.

## Reschedule Jadwal Konsultasi

- Pasien dapat mengajukan perubahan jadwal (reschedule) secara mandiri melalui menu Jadwal & Riwayat di portal pasien.
- **Batas Waktu Pengajuan**: Pengajuan reschedule wajib dilakukan minimal **H-1 (24 jam sebelum jadwal sesi lama dimulai)**. Sistem memblokir pemilihan tanggal hari-H atau masa lalu.
- **Perlakuan Pembayaran**: Pembayaran uang muka administrasi (DP Flat Rp 100.000) yang sudah tercatat otomatis dialihkan 100% ke jadwal pengganti tanpa potongan biaya administrasi.
- **Pemilihan Jadwal Baru**: Pasien memilih tanggal baru dan slot waktu yang tersedia dari jadwal operasional aktif psikolog.
- **Pencatatan Alasan**: Pasien wajib memilih alasan reschedule (Kondisi Kesehatan, Pekerjaan/Dinas Mendadak, Keperluan Keluarga, Transportasi, atau Lainnya) serta catatan opsional untuk dokter.
- **Pembaruan Sistem**: Jadwal pada kalender psikolog dan admin langsung diperbarui, dan status janji temu ditandai sebagai jadwal ter-reschedule.

## Paket Layanan & Konsultasi Berkelanjutan (Rawat Jalan)

- Terdapat 15 paket resmi: 5 Konseling (Offline, Telelayanan, Anak/Remaja, Dewasa, Pasangan/Keluarga), 9 Asesmen (Dasar, Lengkap include laporan resmi SIP, Tes IQ, Kepribadian Standar/Lengkap, Asesmen Anak/Remaja Standar/Lengkap, Asesmen Dewasa Standar/Lengkap), dan 1 Psikoterapi Intensif 4 Sesi.
- Mendukung dua jenis konsultasi: Sesi Tunggal (*Single Session*) dan Konsultasi Berkelanjutan (*Continuous Care* / Rawat Jalan bertahap).
- Pada paket rawat jalan, sistem mendukung pencatatan nomor sesi ke-N (misal sesi 1 dari 4 sesi) dan catatan rekomendasi rencana perawatan.
- Psikolog dapat menambah, mengedit, dan mengaktifkan/menonaktifkan paket secara dinamis.

## Logic Multi-Sesi / Treatment Plan

- Paket berisi banyak sesi (misal 4, 5, 8, atau 10 sesi) dianggap sebagai satu `treatment_plan`, bukan 10 booking terpisah yang dibuat sekaligus.
- Sesi adalah satu pertemuan nyata antara pasien dan psikolog. Contoh: paket 10 sesi berarti pasien punya 10 pertemuan yang dijalankan bertahap.
- Saat pasien membeli/memesan paket berkelanjutan, sistem membuat rencana terapi dan appointment sesi pertama (`Sesi 1 dari N`).
- Sesi ke-2 dan seterusnya dijadwalkan bertahap oleh psikolog setelah sesi sebelumnya selesai atau sesuai kesepakatan klinis. Ini mencegah kalender terkunci terlalu jauh, mengurangi risiko data berat, dan lebih aman untuk perubahan rencana terapi.
- Psikolog/pengelola adalah pihak yang menandai sesi `COMPLETED` setelah pertemuan selesai. Setelah itu psikolog dapat membuat jadwal sesi berikutnya.
- Psikolog/pengelola juga menjadi pihak yang menandai `NO_SHOW`, `CANCELLED`, atau `DISCONTINUED` pada paket berjalan jika pasien tidak hadir, terlambat melewati batas kebijakan, atau paket dihentikan.
- Admin tidak boleh melakukan cancel/no-show/discontinue; admin hanya konfirmasi pembayaran/booking.
- Backend wajib menyimpan `treatment_plan_id`, `continuous_session_number`, dan `continuous_session_total` pada appointment agar progres seperti `Sesi 3 dari 10` selalu bisa dilacak.
- Backend tidak boleh menghitung pendapatan paket berkali-kali untuk setiap sesi lanjutan. Pembayaran paket dicatat pada invoice/treatment plan, sedangkan appointment lanjutan hanya mencatat jadwal pertemuan.
- Untuk mencegah double click atau request ganda saat menjadwalkan sesi berikutnya, endpoint backend perlu mendukung idempotency key.
- Untuk mencegah bentrok jadwal, pembuatan sesi lanjutan wajib berjalan dalam database transaction dengan validasi overlap slot aktif.

## Notifikasi WhatsApp / Email

- Pengiriman WhatsApp/email dilakukan oleh backend produksi melalui provider resmi.
- Trigger minimum: booking pending, pembayaran dikonfirmasi, jadwal sesi, perubahan jadwal/reschedule, sesi dibatalkan oleh psikolog, dan reminder jadwal harian.
- Reminder ke psikolog pada hari-H memuat nama pasien, jam mulai-selesai, paket/sesi ke berapa, ringkasan keluhan/profil dari pre-test, dan tautan ke detail pasien di web.
- Semua notifikasi perlu dicatat di `notification_logs` agar bisa diaudit dan retry saat gagal.

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
- Export data klinis pasien hanya boleh dilakukan oleh psikolog/pengelola/owner dan harus tercatat di audit log.

## Review

- Review dari pasien harus dimoderasi admin.
- Review dapat dibuat anonim.
- Review yang belum disetujui tidak seharusnya tampil publik.
- Halaman moderasi admin menampilkan ringkasan skor terpadu, rating breakdown bar 5-1 bintang, dan filter pills.

## Catatan Klinis & Rekam Medis Pasien

- Format SOAP lama ditiadakan karena tidak diminta klien.
- Rekam medis pasien difokuskan pada: profil identitas lengkap, kontak darurat, keluhan utama pre-test, tingkat stres, kualitas tidur, tujuan pasien, serta tabel riwayat janji temu.
- Catatan klinis hanya boleh diakses psikolog penanggung jawab.
- Data klinis tidak boleh dipaparkan ke publik dan dilindungi kerahasiaan medis.

## Consent dan Privacy

- Pasien wajib menyetujui informed consent dan kebijakan privasi sebelum booking dikirim.
- Halaman consent/privacy harus menjelaskan kerahasiaan data, tujuan pemrosesan data, penggunaan pre-test sebagai profiling awal, dan disclaimer bahwa pre-test bukan diagnosis otomatis.
- Persetujuan pasien perlu tersimpan sebagai record consent yang bisa diaudit.

## Landing Page & Footer

- Landing page tidak boleh memakai klaim organisasi/lembaga yang tidak valid.
- Bagian pengalaman konseling bersama psikolog perlu dibuat carousel, menampilkan sekitar 10 item, auto-play, dan bisa digerakkan manual.
- **Penyembunyian Harga Awal**: Nominal harga paket disembunyikan untuk pengunjung yang belum sign in; rincian tarif dan jadwal terbuka penuh setelah pasien masuk akun.
- **Kondisional Footer**: Komponen Footer hanya ditampilkan pada Landing Page (`GUEST`). Saat pengguna sudah masuk ke akun dashboard (Pasien, Psikolog, Admin), Footer disembunyikan sepenuhnya agar tampilan dashboard bersih, profesional, dan fokus pada operasional.


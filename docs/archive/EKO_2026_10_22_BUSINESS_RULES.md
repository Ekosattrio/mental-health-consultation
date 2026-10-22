# Arsip Eko Sebelum Integrasi - BUSINESS_RULES.md

Histori prototype, bukan aturan aktif. Gunakan [keputusan final](../KEPUTUSAN_FINAL_2026_10_22.md), [kontrak web](../WEB_CONTRACT.md) dan dokumen utama di docs/.

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
- Selama mode frontend/LocalStorage, proses booking dan reschedule memakai Web Locks API dengan fallback lock LocalStorage per psikolog dan tanggal, membaca ulang appointment terbaru, serta memvalidasi overlap, kuota, hari libur, jam praktik, dan durasi sebelum menyimpan.
- Psikolog/pengelola dapat memilih hari libur; booking tidak boleh tersedia pada hari libur tersebut.
- Psikolog/pengelola dapat membatasi jumlah pertemuan dalam satu hari.
- Psikolog/pengelola dapat membuat dan mengubah jam kerja.
- Psikolog/pengelola mengelola kebijakan no-show, keterlambatan, pembatalan, dan penghentian paket berjalan.
- Pasien tidak boleh booking untuk hari yang sama. Minimal booking adalah keesokan hari.
- Pasien tidak boleh reschedule langsung untuk hari yang sama. Minimal reschedule adalah keesokan hari.
- Admin dapat melayani pendaftaran pasien yang datang langsung melalui jalur walk-in, tetapi tanggal konsultasi tetap wajib minimal keesokan hari (H+1). Walk-in admin dapat mendaftarkan pasien baru tanpa pre-test awal dan tetap mematuhi jam praktik, kuota, durasi paket, hari libur, serta overlap.
- Admin hanya memverifikasi pembayaran dan mengonfirmasi booking; admin tidak membatalkan, menghapus, atau menandai selesai konsultasi. Status konsultasi selesai ditandai manual oleh psikolog/pengelola setelah sesi benar-benar selesai.
- Admin dapat membantu reschedule jadwal pasien, tetapi setiap perubahan wajib mencatat siapa yang melakukan reschedule, role pelaku, waktu perubahan, dan alasan/catatan.
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
- Rincian payment status ada pada bagian Pembayaran; `IN_PROGRESS` dan `FINAL_PENDING_VERIFICATION` masih tipe legacy yang belum mempunyai aksi aktif.

## Locking Slot Booking

- Saat pasien mengirim booking, sistem perlu mencegah slot yang sama diambil pengguna lain.
- Frontend memakai Web Locks API lintas-tab dengan fallback lock LocalStorage untuk mengurangi double submit pada prototype.
- Booking berstatus `PENDING`, `CONFIRMED`, atau `IN_PROGRESS` ikut mengunci rentang waktu dari perhitungan slot.
- Backend produksi wajib memakai database transaction, row lock/constraint overlap, dan idempotency key; lock frontend bukan jaminan produksi.

## Psikolog

- Psikolog wajib memiliki profil profesional.
- Nomor STR dan SIP perlu disimpan dan nantinya divalidasi.
- Psikolog adalah role tertinggi sekaligus pengelola/owner praktik.
- Psikolog dapat mengelola jadwal, hari libur, batas pertemuan harian, jam kerja, CMS, analytics keuangan, riwayat, dan profil.
- Tidak ada ruang chat konsultasi di web. Telelayanan merupakan jenis jadwal konsultasi, bukan fitur chat internal.

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
- Potongan harga hanya diatur oleh psikolog/pengelola dari manajemen paket.
- Pasien tidak mengetik kode promo apa pun; pasien hanya melihat potongan aktif bila psikolog mengaktifkannya pada paket.
- Admin tidak mengatur atau melihat harga paket, potongan, DP yang ditagihkan, maupun sisa tagihan. Admin hanya melihat status pembayaran, bukti/metode pembayaran, dan nama pengirim untuk verifikasi.
- Untuk pembayaran setelah DP, admin memasukkan nominal yang benar-benar diterima tanpa melihat target. Pembayaran dapat dicatat bertahap; setiap nominal yang tersimpan tidak dapat dibaca kembali pada tabel/detail/receipt admin.
- Seluruh transaksi pembayaran disimpan untuk laporan uang masuk psikolog dan audit backend. Status `PAID` hanya saat saldo tagihan nol.
- Untuk psikoterapi, potongan dihitung dari tarif per sesi lalu dikalikan empat sesi awal; untuk layanan lain, potongan dihitung dari harga paket. Total proyeksi dan DP dihitung setelah potongan.
- Potongan dapat berupa nominal tetap atau persentase.
- Diskon melekat pada paket layanan dan dapat ditambahkan, diubah, atau dihapus hanya oleh psikolog/pengelola melalui form Manajemen Paket.
- Perubahan atau penghapusan diskon baru berlaku setelah perubahan paket disimpan. Booking yang sudah dibuat tetap memakai snapshot nominal saat transaksi agar riwayat pembayaran tidak berubah.
- Bukti pembayaran tersimpan dalam sistem.
- Admin dapat melihat bukti pembayaran, nama pengirim transfer, serta metode/channel bayar.
- Admin wajib membuka dan memeriksa bukti pembayaran sebelum booking dapat dikonfirmasi.
- Verifikasi pembayaran dan konfirmasi booking berlangsung dalam satu aksi atomik: `DP_PENDING_VERIFICATION -> DP_PAID` dan `PENDING -> CONFIRMED`.
- Aksi verifikasi menyimpan waktu verifikasi, identitas admin, serta catatan opsional. Admin tidak memiliki aksi penolakan/cancel dari flow ini.
- Tidak ada alur unggah ulang bukti. Jika bukti belum dapat dicocokkan, admin menahan konfirmasi dan memeriksa transaksi secara manual.
- Untuk pelunasan penghentian sebelum sesi pertama, admin memilih tujuan `CANCELLATION_SETTLEMENT`. Admin tetap tidak dapat membatalkan layanan.
- Status pembayaran dapat diperbarui berdasarkan hasil verifikasi.
- Status konsultasi `COMPLETED` tidak otomatis membuat pembayaran `PAID`; pelunasan harus dicatat admin sebagai transaksi terpisah.
- Riwayat pembayaran disimpan dalam database.
- **Skema Pembayaran**: DP ditetapkan flat Rp100.000 oleh sistem, dibayar sekali, dan mengurangi total keseluruhan. Jika total akhir paket setelah diskon kurang dari Rp100.000, DP dibatasi sebesar total akhir. Untuk psikoterapi, sisa dapat dilunasi setelah sesi pertama atau dicicil sesuai kesepakatan pasien dan psikolog; admin hanya mencatat uang masuk.
- Jika DP telah mencakup seluruh total akhir (misalnya tarif setelah diskon kurang dari Rp100.000), verifikasi langsung menandai `PAID` sehingga tidak ada pelunasan nol atau pembatalan yang buntu.
- Booking walk-in psikoterapi selalu mulai dari DP awal, tidak langsung berstatus `PAID`. Setelah sesi pertama selesai, admin mencatat uang masuk berikutnya lewat alur pembayaran yang sudah ada.
- Status pembayaran mendukung:
  - `PENDING` (belum bayar)
  - `DP_PENDING_VERIFICATION` (bukti transfer DP diunggah, menunggu verifikasi admin)
  - `DP_PAID` (DP flat Rp100.000 telah diverifikasi admin)
  - `PAID` (lunas, sisa tagihan telah diselesaikan di klinik)
  - `REFUNDED` (pengembalian dana jika diperlukan)

## Invoice / Kwitansi

- Sistem perlu menghasilkan invoice/kwitansi pembayaran untuk setiap booking.
- Minimal informasi invoice: kode invoice, kode booking, nama pasien, paket, tanggal sesi, harga paket sebelum potongan, nama potongan dari psikolog/pengelola, nominal potongan, total setelah potongan, DP, sisa pelunasan, metode pembayaran, channel pembayaran, nama pengirim, status pembayaran, dan bukti pembayaran.
- Invoice pasien dapat dilihat dari riwayat booking.
- Receipt admin bukan menu kwitansi terpisah; setelah DP/konfirmasi pembayaran admin dapat memilih Print / Simpan PDF atau screenshot dari modal receipt administratif.
- Karena admin tidak boleh melihat harga, receipt admin hanya menampilkan data administratif: booking, pasien, paket, jadwal, status pembayaran, metode/channel, nama pengirim/kasir, bukti pembayaran, dan audit reschedule.
- Backend produksi wajib menyimpan invoice sebagai data terstruktur agar bisa dicetak ulang dan diaudit.

## Reschedule Jadwal Konsultasi

- Pasien dapat mengajukan perubahan jadwal (reschedule) secara mandiri melalui menu Jadwal & Riwayat di portal pasien.
- **Tanggal Pengganti**: Tanggal baru hasil reschedule wajib minimal keesokan hari (H+1). Sistem memblokir tanggal hari ini dan masa lalu.
- **Perlakuan Pembayaran**: DP flat Rp100.000 yang sudah tercatat otomatis dialihkan 100% ke jadwal pengganti tanpa biaya administrasi tambahan.
- DP dibayar sekali di awal booking/rencana, bukan setiap pindah jadwal atau sesi lanjutan pada rencana yang sama. Seluruh pembayaran, saldo, bukti, dan audit verifikasi tetap berlaku; reschedule tidak membuat tagihan/DP baru.
- **Pemilihan Jadwal Baru**: Pasien memilih tanggal baru dan slot waktu yang tersedia dari jadwal operasional aktif psikolog.
- **Pencatatan Alasan**: Pasien wajib memilih alasan reschedule (Kondisi Kesehatan, Pekerjaan/Dinas Mendadak, Keperluan Keluarga, Transportasi, atau Lainnya) serta catatan opsional untuk dokter.
- **Pembaruan Sistem**: Jadwal pada kalender psikolog dan admin langsung diperbarui. Reschedule mandiri pasien mengembalikan status ke `PENDING` untuk konfirmasi ulang admin; bantuan reschedule oleh admin mempertahankan status booking sebelumnya.
- Konfirmasi ulang memakai aksi khusus persetujuan jadwal untuk `PENDING + DP_PAID/PAID`, mempertahankan DP dan audit verifikasi pembayaran awal. Seluruh reschedule dicatat pada `rescheduleHistory`, bukan hanya perubahan terakhir.
- **Audit Pelaku**: Reschedule dari pasien/admin/psikolog wajib tersimpan di appointment sebagai `rescheduledAt`, `rescheduledByName`, `rescheduledByRole`, dan `rescheduleReason`; data ini tampil di detail jadwal dan receipt.

## Keterlambatan dan Ketidakhadiran

- Keterlambatan dikonfirmasi manual oleh psikolog yang menangani. Tidak ada auto-cancel, auto-no-show, batas tunggu otomatis, atau sesi otomatis hangus.
- Berdasarkan hasil konfirmasi dengan pasien, psikolog dapat melanjutkan sesi yang masih terkonfirmasi atau memilih jadwal pengganti minimal H+1. Tidak ada perubahan durasi, kuota, atau biaya otomatis akibat keterlambatan.
- `NO_SHOW` hanya dicatat manual oleh psikolog setelah waktu mulai, dengan alasan. Status tersebut tidak dihitung sebagai sesi selesai.
- Psikolog dapat reschedule appointment `NO_SHOW` miliknya yang pembayarannya sudah terverifikasi, mengubahnya menjadi `CONFIRMED` tanpa membuat appointment atau nomor sesi baru. Riwayat `CONFIRMED -> NO_SHOW -> CONFIRMED`, jadwal lama/baru, pelaku, waktu, dan hasil konfirmasi tetap diaudit.
- Admin/pasien tidak dapat membuka kembali `NO_SHOW` sendiri; admin tetap dapat membantu reschedule booking aktif sesuai kewenangan sebelumnya. Rencana selesai/dihentikan atau sesi dibatalkan tidak dapat dibuka kembali lewat reschedule.
- DP awal dan seluruh cicilan tetap melekat. Reschedule, termasuk setelah konfirmasi ketidakhadiran, tidak memerlukan pembayaran DP lagi. Pembatalan tetap manual oleh psikolog dan wajib lunas sesuai aturan cancel.

## Paket Layanan & Konsultasi Berkelanjutan (Rawat Jalan)

- Katalog paket bersifat dinamis dan memuat layanan tatap muka serta telelayanan dalam kategori Konseling, Asesmen, atau Psikoterapi.
- Paket telelayanan memiliki `package_type = ONLINE_TELE`; detail media sesi diberikan setelah booking dikonfirmasi dan tidak membuka ruang chat di web.
- Katalog dummy resmi terdiri dari 5 paket Konseling, 9 paket Asesmen, dan 1 layanan Psikoterapi bertarif Rp500.000 per sesi dengan rencana awal minimal 4 sesi. Rp2.000.000 adalah proyeksi empat pertemuan sebelum diskon, bukan harga satu sesi atau kewajiban bayar di muka.
- Mendukung dua jenis konsultasi: Sesi Tunggal (*Single Session*) dan Konsultasi Berkelanjutan (*Continuous Care* / Rawat Jalan bertahap).
- Pada paket rawat jalan, sistem mendukung pencatatan nomor sesi ke-N (misal sesi 1 dari 4 sesi) dan catatan rekomendasi rencana perawatan.
- Psikolog dapat menambah, mengedit, dan mengaktifkan/menonaktifkan paket secara dinamis.

## Logic Multi-Sesi / Treatment Plan

- Pembatalan/penghentian oleh psikolog wajib didahului pelunasan seluruh tagihan rencana awal. Sistem memeriksa `PAID` dan saldo nol pada appointment pembayaran pertama.
- Pembatalan menandai rencana `DISCONTINUED` dan seluruh sisa appointment `CANCELLED`, sehingga slot dilepas. Appointment `COMPLETED` serta transaksi pembayaran tetap menjadi histori. Tidak ada refund otomatis atau sesi pengganti setelah cancel.
- No-show memerlukan alasan dan baru dapat dicatat setelah waktu mulai sesi (WIB). Tidak otomatis membatalkan/menghabiskan jatah; psikolog dapat menjadwalkan ulang sesi yang sama setelah konfirmasi manual, tanpa DP tambahan.

- Paket berisi banyak sesi (misal 4, 5, 8, atau 10 sesi) dianggap sebagai satu `treatment_plan`, bukan 10 booking terpisah yang dibuat sekaligus.
- Sesi adalah satu pertemuan nyata antara pasien dan psikolog. Contoh: paket 10 sesi berarti pasien punya 10 pertemuan yang dijalankan bertahap.
- Saat pasien membeli/memesan paket berkelanjutan, sistem membuat rencana terapi dan appointment sesi pertama (`Sesi 1 dari N`).
- Sesi ke-2 dan seterusnya dijadwalkan bertahap oleh psikolog setelah sesi sebelumnya selesai. Admin dapat membantu reschedule appointment yang sudah ada, tetapi tidak membuat sesi lanjutan baru.
- Jatah rencana awal psikoterapi tetap 4 sesi; tidak ada amendment/penambahan sesi di plan yang sama.
- Jika terapi perlu dilanjutkan sesudah sesi keempat, pasien membuat booking psikoterapi baru minimal H+1. Sistem membuat rencana, kode booking, DP Rp100.000, dan ledger pembayaran baru. Rekam medis di luar sistem booking dapat menyebut pertemuan berikutnya sebagai sesi ke-5, tetapi nomor sesi di booking baru dimulai lagi dari 1/4. Plan lama tetap `COMPLETED` dan pembayarannya tidak dipindahkan.
- Psikolog/pengelola adalah pihak yang menandai sesi `COMPLETED` setelah pertemuan selesai. Setelah itu psikolog dapat membuat jadwal sesi berikutnya.
- Status `COMPLETED` tidak boleh diberikan sebelum waktu selesai appointment terlewati.
- Sistem tidak boleh membuat sesi lanjutan dalam plan jika pembayaran awal belum `DP_PAID/PAID`, sesi terakhir belum `COMPLETED`, jatah empat sesi sudah terpakai, atau sudah ada sesi berikutnya yang masih aktif.
- Tanggal sesi lanjutan minimal H+1. Psikolog memilih dari slot hasil availability engine; jam bebas di luar jam kerja, hari libur, kuota, durasi paket, atau yang overlap tidak dapat dikirim.
- Ketika seluruh sesi berstatus `COMPLETED`, status treatment plan otomatis menjadi `COMPLETED`.
- Psikolog/pengelola menandai `NO_SHOW`, `CANCELLED`, atau `DISCONTINUED` secara manual sesuai hasil konfirmasi; keterlambatan tidak memicu perubahan otomatis. Cancel/discontinue tetap wajib lunas.
- Admin tidak boleh melakukan cancel/no-show/discontinue; admin hanya konfirmasi pembayaran/booking.
- Backend wajib menyimpan `treatment_plan_id`, `continuous_session_number`, dan `continuous_session_total` pada appointment agar progres seperti `Sesi 3 dari 10` selalu bisa dilacak.
- Backend tidak boleh menghitung pendapatan paket berkali-kali untuk setiap sesi lanjutan. Pembayaran paket dicatat pada invoice/treatment plan, sedangkan appointment lanjutan hanya mencatat jadwal pertemuan.
- Halaman **Paket Berjalan** wajib menampilkan ringkasan pembayaran paket: total setelah potongan, nominal potongan bila ada, DP, sisa pelunasan, dan status pembayaran.
- Untuk mencegah double click atau request ganda saat menjadwalkan sesi berikutnya, endpoint backend perlu mendukung idempotency key.
- Untuk mencegah bentrok jadwal, pembuatan sesi lanjutan wajib berjalan dalam database transaction dengan validasi overlap slot aktif.

## Notifikasi WhatsApp / Email

- WhatsApp adalah kanal utama untuk notifikasi operasional yang sensitif waktu.
- Email bersifat opsional sebagai fallback serta pengiriman receipt/dokumen jika alamat email tersedia.
- Pengiriman WhatsApp/email dilakukan oleh backend produksi melalui provider resmi.
- Trigger minimum: booking pending, pembayaran dikonfirmasi, jadwal sesi, perubahan jadwal/reschedule, sesi dibatalkan oleh psikolog, dan reminder jadwal harian.
- Reminder ke psikolog pada hari-H memuat nama pasien, jam mulai-selesai, paket/sesi ke berapa, ringkasan keluhan/profil dari pre-test, dan tautan ke detail pasien di web.
- Semua notifikasi perlu dicatat di `notification_logs` agar bisa diaudit dan retry saat gagal.

## Laporan dan Export Data

- Scope laporan frontend adalah arus kas/uang masuk murni dari pembayaran paket. Sistem tidak menghitung biaya operasional, pengeluaran, atau laba bersih.
- Uang masuk dihitung dari DP terverifikasi ditambah nominal pelunasan aktual yang dicatat admin. Appointment sesi lanjutan paket multi-sesi tidak menambah pendapatan baru.
- Setiap penerimaan DP/cicilan/pelunasan menjadi event/baris tersendiri dengan tanggal uang diterima (`receivedAt`), bukan tanggal konsultasi. `recordedAt` tetap menyimpan waktu input untuk audit. Reschedule tidak mengubah periode kas.
- Data lama yang tidak memiliki tanggal penerimaan pasti diberi label estimasi dari audit verifikasi/pencatatan atau tanggal pembuatan. Jangan mengarang histori penerimaan dari jadwal konsultasi.
- Pasien dan psikolog melihat terbayar dari total serta sisa tagihan berdasarkan ledger appointment pertama. Admin hanya menginput nominal yang diterima tanpa melihat target atau membaca kembali jumlah tersimpan.
- Walk-in memerlukan input nominal aktual DP/FULL. FULL harus cocok dengan total; DP mengikuti Rp100.000 (atau total jika lebih kecil). Kegagalan validasi tidak membocorkan target nominal kepada admin. Psikoterapi tetap DP awal, pembayaran lanjutan setelah sesi pertama atau purpose penghentian yang telah diizinkan.

## Pengaman Katalog, Jadwal, dan Sesi

- Reservasi slot harus berhasil sebelum rekening tampil; informed consent disetujui sebelum instruksi transfer. Hold sementara memakan kuota dan interval slot. Prototype default 15 menit, dapat diatur melalui env dan bukan keputusan TTL produksi.
- Reservasi belum terkonversi dipulihkan di alur Booking Konsultasi setelah refresh. Sesuai keputusan 22 Oktober, tidak ada panel Reservasi sebelumnya atau aksi pelepasan manual oleh pasien. Jangan melepas hold atau menghapus bukti diam-diam saat pasien memilih paket lain. Hold terkonversi yang dikirim ulang mengembalikan booking yang sama.
- Jika sudah transfer tetapi hold expired atau quote/durasi berubah, simpan bukti sebagai kasus pencocokan sekali per hold. Pasien dilarang diarahkan transfer kedua. Admin mencocokkan transaksi, memasukkan penerimaan/tanggal aktual, serta membantu jadwal pengganti H+1. Bukti yang sama digunakan pada booking pengganti, bukan diminta unggah ulang.
- Kasus pencocokan tidak otomatis berarti kas masuk/booking confirmed. FULL walk-in juga pending sampai admin memverifikasi penerimaan. Bukti, verifier, ledger, dan tanggal penerimaan menjadi dasar laporan; bukan sekadar pilihan status.
- Semua mutasi workflow prototype memakai satu Web Lock lintas-tab dan persist-before-publish. Browser tanpa Web Locks menolak mutasi sensitif. Backend tetap wajib transaksi dan idempotency antarperangkat.
- Jam reschedule diikat ke waktu mulai/selesai, bukan nomor urutan opsi. Jika slot hilang, pasien memilih ulang; tidak dialihkan diam-diam ke jam lain. Receipt/detail membaca entity terkini berdasarkan ID.

- Pasien dapat mencari, memfilter kategori, mengurutkan, serta berpindah halaman katalog. Layanan nonaktif tidak dapat dipesan; paket custom tidak dihapus otomatis.
- Perubahan harga/diskon saat wizard terbuka memperbarui penawaran dan mereset consent. Submit membandingkan expected total dengan hasil kalkulasi terbaru; backend juga wajib memvalidasi versi penawaran.
- Jam/libur/kuota baru tidak boleh membentur booking aktif. Sistem menahan Save dan menunjukkan booking terdampak, bukan membatalkannya secara otomatis.
- Appointment sesi baru memiliki histori status/reschedule sendiri. Snapshot rencana dapat dirujuk; penerimaan awal dan histori sesi sebelumnya tidak disalin sebagai transaksi/audit baru.
- Produksi wajib hold server sebelum instruksi transfer. Prototype sudah memakai hold lokal serta pencocokan bukti; TTL dan kebijakan produksi final tetap perlu keputusan dan bukan alasan menghapus uang masuk/bukti.

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
- Prototype menyimpan snapshot `consent` di appointment: versi dokumen/privasi, pasien, dan waktu persetujuan. Backend menambahkan IP/user agent dari request, tidak mempercayainya dari client.
- Pre-test terbaru per pasien hanya untuk draft/prefill. Histori booking memakai `preTestId` dan `preTestSnapshot` yang tidak ditimpa pengisian selanjutnya. Field klinis yang tidak ditanyakan tidak diisi dengan jawaban negatif palsu.

## Landing Page & Footer

- Landing page tidak boleh memakai klaim organisasi/lembaga yang tidak valid.
- Bagian pengalaman konseling bersama psikolog perlu dibuat carousel, menampilkan sekitar 10 item, auto-play, dan bisa digerakkan manual.
- **Penyembunyian Harga Awal**: Nominal harga paket disembunyikan untuk pengunjung yang belum sign in; rincian tarif dan jadwal terbuka penuh setelah pasien masuk akun.
- **Kondisional Footer**: Komponen Footer hanya ditampilkan pada Landing Page (`GUEST`). Saat pengguna sudah masuk ke akun dashboard (Pasien, Psikolog, Admin), Footer disembunyikan sepenuhnya agar tampilan dashboard bersih, profesional, dan fokus pada operasional.


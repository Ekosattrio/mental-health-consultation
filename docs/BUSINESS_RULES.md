# Aturan bisnis kanonik JiwaSehat
Diperbarui 22 Oktober 2026. Otoritas terbaru: [keputusan final integrasi](KEPUTUSAN_FINAL_2026_10_22.md). Dokumen ini adalah target implementasi, bukan pernyataan bahwa aplikasi sudah dibuat atau diuji. Keputusan terbaru developer mengalahkan catatan audit/histori lama.

## 1. Aktor dan batas layanan
Guest membaca profil praktik tanpa harga. PATIENT adalah akun login/penanggung jawab. ADMIN mengurus administrasi, jadwal dan penerimaan pembayaran. PSYCHOLOGIST adalah role teknis untuk satu Superadmin/owner/praktisi.
Harga hanya tersedia sesudah login. Admin melihat harga, diskon dan total tagihan; **saldo pasien tidak dikirim pada DTO Admin**. Nominal input/bukti yang sedang diverifikasi dapat diperiksa Admin; ini tidak memberikan akses laporan kas praktik. Agregat pembayaran/saldo dan receipt lengkap tersedia untuk pasien berwenang dan Superadmin. Pembatasan field bukan janji bahwa operator tidak dapat menghitung perkiraan dari informasi yang sudah diketahuinya.
Admin dapat mendaftarkan pasien, membuat booking, menjadwalkan lanjutan sesuai rencana praktisi, mengubah jam klinik, memasukkan biaya dan diskon individual. Walk-in tidak memerlukan approval object Superadmin dalam sistem. Admin tidak mengarang diagnosis atau isi hasil pemeriksaan.

## 2. Katalog dan harga
Tiga kategori: COUNSELING, ASSESSMENT, PSYCHOTHERAPY. Daftar paket dan harga baseline ada di F04.
Paket memiliki versi immutable. Booking mengambil satu versi harga normal, promo, harga final, durasi dan benefit. Pembaruan katalog hanya memengaruhi booking baru.
Admin dan Superadmin dapat mengelola promo global dengan alasan/audit. Satu harga promo aktif per versi; 0 < promo_price < normal_price. Promo memiliki awal dan akhir opsional; interval [awal,akhir). Harga normal dicoret hanya ketika promo efektif. Harga Guest tetap disaring dari JSON, HTML metadata dan konten publik.
Diskon khusus pasien adalah adjustment terpisah pada billing account, dicatat Admin/Superadmin dengan alasan. Diskon tidak ditumpuk diam-diam: server menampilkan preview total akhir dan menyimpan semua komponen. CUSTOM_CHARGE tetap bernilai positif; diskon menggunakan jenis PERSONAL_DISCOUNT dengan direction=MINUS sesuai kamus data. Dasar layanan net tetap >0 pada scope paket berbayar; tidak ada diskon100% implisit.
Diskon tidak menghapus kas yang sudah diterima. Pengurangan yang menyebabkan total kewajiban lebih kecil daripada uang terverifikasi ditahan untuk penanganan selisih; tidak menjadi refund/credit otomatis.

## 3. Pemesanan dan kalender
Satu kalender operasional kanonik untuk jam klinik sekaligus jam Admin. Waktu server disimpan UTC; aturan tanggal, hari, H+1 dan empat hari kalender memakai Asia/Jakarta.
Pasien online: tanggal paling cepat H+1 dan mulai sesi paling cepat setelah enam jam operasional sejak pemesanan. Keduanya harus terpenuhi. Istirahat/tutup/libur tidak dihitung.
Seluruh booking, termasuk walk-in/bantuan Admin dan owner, minimal H+1 WIB pada interval bebas dan jam buka sah. Tidak ada pengecualian hari yang sama. Guard tabrakan dan kuota tetap wajib.
Paket bookable harus mempunyai durasi positif. Asesmen Lengkap default 240 menit, deskripsi 2–4 jam. Paket lain yang belum memiliki durasi tetap non-bookable sampai Admin mengisinya.
Okupansi berasal hanya dari appointment aktif pada interval [start_at,end_at). Tidak ada flag isBooked sebagai sumber kebenaran kedua. Satu praktisi tidak dapat melayani dua appointment overlap walaupun kuota harian masih tersisa.
Kalender tanggal khusus menggantikan seluruh interval mingguan hari itu; penutupan khusus menghasilkan interval kosong. Hari libur hanya dapat dibuka dengan override tanggal eksplisit beserta alasan. Versi kalender dicatat agar keputusan lama bisa ditelusuri.

## 4. Hold, bukti dan SLA
payment_deadline_at = hold_expires_at = min(created_at + 24 jam, start_at). Bukan 23:59; deadline aktual tampil sebelum konfirmasi.
Bukti lengkap yang diterima server paling lambat deadline melindungi reservasi: WAITING_VERIFICATION. Upload tidak mengakui uang.
SLA adalah 12 jam operasional sejak bukti pertama lengkap. Upload koreksi tidak mengulang SLA. Deadlines memakai versi kalender yang disnapshot; perubahan jam tidak diam-diam menggeser SLA lama.
Job auto-confirm hanya untuk bukti tepat waktu, belum ditolak, appointment masih WAITING_VERIFICATION, belum terminal/check-in. Hasil CONFIRMED_AUTO_SLA; payment tetap PENDING_RECONCILIATION, bukan VERIFIED/PAID.
Bukti ditolak boleh diperbaiki. Alur, batas perlindungan dan kondisi setelah sesi dijelaskan F08. Bukti ditolak tidak mendapat auto-confirm dari SLA lama.

## 5. Pembayaran dan kedatangan
Metode TRANSFER, QR, CASH, tanpa payment gateway. DP flat Rp100.000 sekali pada booking/rangkaian baru, mengurangi kewajiban dan bukan tambahan biaya. required_initial_amount = min(100000, effective_base_due) untuk awal; sesi lanjutan dalam plan/case yang sama memakai 0 setelah verifikasi DP awal. Reschedule tidak membuat DP atau verifikasi awal baru. Pembayaran langsung penuh diperbolehkan. Promo/diskon dasar hanya membatasi DP jika dasar net kurang dari Rp100.000; tidak ada rumus persentase. initial_minimum_due menyimpan snapshot. Add-on tidak membuat DP kedua.
Ledger append-only: hanya penerimaan VERIFIED dan koreksinya yang dihitung sebagai kas. Status transaksi berbeda dari status tagihan.
Saldo = max(total kewajiban - penerimaan bersih terverifikasi,0). Lebih bayar = max(penerimaan bersih terverifikasi - total kewajiban,0).
PAID hanya jika kewajiban terpenuhi. Tidak ada nominal positif yang otomatis melunasi. Tagihan Rp900.000, DP Rp100.000, tambahan pembayaran Rp1 tetap belum lunas.
Ketika pasien datang, Admin wajib memeriksa identitas dan pembayaran: uang terbukti diterima wajib dicatat/disetujui; jika belum memenuhi DP, Admin menagih di luar sistem saat itu dan mencatat uang yang benar-benar diterima. Sistem tidak memproses transfer/tunai.
Check-in membutuhkan minimum DP terverifikasi, bukan wajib seluruh tagihan lunas. Pelunasan ditagih setelah layanan; layanan selesai dan pembayaran lunas adalah dua fakta terpisah.
Jika hold teknis telah EXPIRED dan slot diberikan kepada orang lain, kedatangan tidak merebutnya kembali: Admin membantu memilih booking H+1 di interval bebas atau melakukan rekonsiliasi. Tidak ada booking hari ini sebagai jalan pintas.
Tidak ada fitur refund. Penyelesaian lebih bayar nyata di luar sistem; aplikasi tetap mencatat penerimaan aktual dan perhitungan tagihan, tanpa status/tiket resolusi atau kewajiban mengisi keputusan. Selisih bukan biaya baru, dompet, credit antarbooking atau hangus otomatis.
Pembatalan/discontinue wajib lunas untuk seluruh tagihan sah yang sudah terbentuk pada layanan/rangkaian terkait. Di bawah transaction dan lock, tolak jika ada sisa; jangan menerbitkan adjustment pelepasan sisa atau mengubah kewajiban menjadi nol agar lolos. Setelah lunas, batalkan seluruh sisa appointment dan hentikan plan/case terkait secara atomik; completed dan histori uang tetap, rangkaian lain tidak berubah. Sesi belum dipesan tidak otomatis ditagih. Expiry hold teknis tidak membatalkan layanan berbayar otomatis atau memutihkan tagihan. Bukti/uang terlambat direkonsiliasi tanpa merebut slot.

## 6. Dokumen dan tambahan biaya
Invoice terbit dan receipt penerimaan immutable. Tambahan setelah invoice terbit membuat ADDENDUM bertaut billing account yang sama; tidak menambah BASE_SERVICE kedua.
Receipt lama tetap membuktikan penerimaan pada saat terbit. Saldo terkini dihitung dari seluruh invoice/addendum/adjustment dan ledger, bukan dengan menimpa receipt.
Additional time formula hanya kategori Konseling; dibulatkan dari total menit tambahan aktual satu usaha sesi. Detail formula dan contoh di F08. Asesmen/psikoterapi tidak memakai otomatis tarif Konseling.
Admin/Superadmin memilih additional_time_price_basis pada versi paket Konseling: NORMAL_PRICE atau FINAL_PRICE (setelah promo global saat booking). Pilihan wajib sebelum bookable dan berlaku untuk booking baru; booking lama memakai snapshot versinya. Tarif tidak mengambil total tagihan terkini/diskon individual sesudah booking. Perubahan pilihan/promo tidak mengubah basis revisi menit sesi lama. Lihat F04/F08.
Laporan semua paket Asesmen sudah termasuk. Laporan Konseling atas permintaan Rp200.000, diinput Admin. Penyerahan hasil boleh offline; upload hasil klinis bukan kewajiban scope ini.

## 7. Reschedule dan no-show
Permintaan mempunyai status sendiri. Kelayakan normal dibekukan saat submit: sebelum H-2 jam, maksimal tiga reschedule yang benar-benar APPLIED per appointment. Tepat pada H-2 sudah terkunci.
Setelah NO_SHOW, request boleh dikirim sampai 23:59:59.999999 WIB pada tanggal sesi +4 hari kalender, jika kuota tersisa. Pemrosesan Admin setelah batas tersebut tidak membatalkan pengajuan yang tepat waktu.
REQUESTED/APPROVED tidak memindahkan sesi atau mengubah pembayaran. Slot lama dilepas hanya ketika apply berhasil; penguncian interval lama/baru dilakukan dalam satu transaction.
Request tepat waktu yang belum diputuskan tidak otomatis menjadi kesalahan/no-show pasien karena keterlambatan Admin. Perlu penyelesaian administratif; tidak otomatis menandai hadir.
Sesudah NO_SHOW, apply memulihkan appointment menjadi status reservasi aktif sesuai pembayaran. Event no-show, jadwal lama, attempt_number dan pembayaran tetap ditautkan. Bukan menciptakan tagihan layanan baru.
Perubahan karena klinik/owner tidak menggunakan kuota pasien dan tidak tunduk lock pasien; tujuan tetap minimal H+1 WIB. Perubahan jam menghasilkan daftar appointment terdampak, notifikasi dan permintaan pemilihan ulang, bukan memindahkan diam-diam. Reschedule mempertahankan pembayaran awal tanpa DP baru.
Berakhirnya hak reschedule tidak menghapus kas, melunasi tagihan atau membatalkan layanan otomatis. Request tepat waktu diselesaikan dahulu; keputusan pembatalan manual tetap membutuhkan pelunasan.

## 8. Operasional dan layanan berkelanjutan
Admin mencatat kedatangan, mulai, selesai, dan no-show sebagai fakta administratif berdasarkan kejadian/instruksi praktisi; Superadmin mengelola keputusan dan isi klinis. Ini mengikuti §3.3 dokumen ide, menggantikan pembatasan operasional lama.
Grace period awal 15 menit adalah default operasional yang dapat diubah Superadmin. Keterlambatan/no-show dikonfirmasi manual; tidak ada auto-no-show atau auto-cancel. Request sah/konflik klinik tidak boleh dianggap kesalahan pasien.
Psikoterapi Rp500.000 per sesi, rangkaian awal empat sesi. Booking pertama membuat plan ACTIVE empat unit + appointment/billing/invoice sesi pertama atomik. Tidak mengisi diagnosis, tidak menagih atau menjadwalkan sesi2-4 otomatis. Admin menjadwalkan lanjutan H+1 sesuai arahan praktisi dan kesepakatan pasien. Maksimal satu plan ACTIVE per pasien/paket; retry tidak menduplikasi. Setiap sesi yang dipesan mempunyai billing sendiri; DP100.000 hanya awal dan dikreditkan ke sesi pertama. Sesi berikutnya tidak meminta DP baru. Sesi belum dipesan tidak menjadi utang.
Plan diakhiri/discontinue dengan alasan dan guard pelunasan seluruh tagihan terbentuk, lalu seluruh sisa appointment plan dihentikan bersama. Tidak ada extend/tambah jatah atau sesi kelima pada plan lama. Setelah empat sesi selesai pasien booking kembali dengan plan/ledger baru dan DP awal baru; rekam medis dapat menautkan episode sebelumnya tanpa memperpanjang jatah lama. Harga baru tidak mengubah snapshot sesi terdahulu.
Asesmen satu case satu harga untuk cakupan paket yang disepakati, dapat beberapa appointment testing/evaluation/follow-up. Owner menentukan kebutuhan/penutupan case; Admin mengatur jadwal. Setelah case CLOSED, kebutuhan tes baru menjadi case baru; reopen hanya koreksi beralasan.

## 9. Profil, pre-test dan review
Akun penanggung jawab tidak sama dengan pasien aktual. Default penanggung jawab dari session; walk-in boleh tanpa akun. Klaim riwayat ke akun baru memerlukan verifikasi Admin, bukan pencocokan otomatis nama/telepon.
Pre-test profiling mempunyai draft mandiri dan versi submission per appointment; tidak menimpa histori pasien. Jawaban tidak ditanyakan disimpan null/absent, bukan false. Tidak ada DASS atau diagnosis otomatis dalam scope.
Keputusan developer: pasien offline mengisi profiling di kertas yang langsung diserahkan kepada Superadmin. Admin hanya pendataan administratif/jadwal/pembayaran, tanpa input/baca/upload jawaban kertas. Booking offline boleh tanpa pre-test digital dengan profiling_mode=PAPER; label itu tidak menyatakan jawaban sudah lengkap/tersimpan. PATIENT_ONLINE wajib DIGITAL dan submission sah dari pasien/penanggung jawab. Kertas tidak wajib didigitalisasi; aturan retensi file aplikasi tidak otomatis mengatur arsip kertas di luar aplikasi.
Satu review per billing account layanan: satu per sesi konseling/psikoterapi; satu per rangkaian asesmen setelah case selesai. Edit mengulang moderasi. Publik hanya APPROVED dengan anonimisasi.

## 10. Laporan, notifikasi dan penyimpanan
Laporan kas Superadmin berdasarkan received_at transaksi terverifikasi; reschedule tidak memindahkan periode kas. Verifikasi terlambat/koreksi dapat menghasilkan revisi berjejak pada laporan periode penerimaan; export lama tetap snapshot dengan as_of.
Pengeluaran dan surplus masuk scope sesuai §25 ide. Surplus = penerimaan bersih terverifikasi - pengeluaran sah. Bukan laba akuntansi penuh.
Admin dan Superadmin dapat export jadwal operasional; tidak menyertakan keluhan klinis atau saldo. Hak export laporan kas hanya Superadmin.
WhatsApp Baileys untuk owner: ringkasan harian, H-2 jam, perubahan penting. Pasien memperoleh notifikasi in-app; khusus Telelayanan, tautan Google Meet dan pembaruan jadwal dikirim otomatis ke WA pasien/penanggung jawab yang dipilih pada booking. Nomor/tujuan pengiriman dikonfirmasi dalam form booking, bukan persetujuan marketing. Gagal notifikasi tidak membatalkan transaksi.
Hak download PDF pasien berakhir tujuh hari setelah layanan selesai/batal secara sah; ringkasan transaksi tetap tersedia. Untuk satu asesmen, anchor penutupan case, bukan appointment pertama.
File bukti/operasional disimpan satu tahun sejak upload; backup satu tahun sejak dibuat. Hapus file kedaluwarsa dengan tombstone/audit; restore harus menerapkan ulang tombstone dan hak akses. Record transaksi, consent dan audit tidak otomatis dihapus setahun.

## 11. Telelayanan Google Meet
COUNSELING_TELE_SERVICE Rp750.000/60 menit menggunakan Google Meet. Admin/Superadmin menyiapkan tautan di luar aplikasi, memasukkannya pada booking aktif, lalu save memicu pengiriman otomatis Baileys ke nomor pasien/penanggung jawab. Paket tidak lagi ditunda sebagai katalog saja. Ketentuan harga, DP, SLA, H+1/enam jam kerja dan satu kalender praktisi tetap berlaku; link bukan bukti bayar atau bukti hadir.
Nomor WA dan penerimaan pengiriman tersimpan pada booking. Link memiliki revisi per appointment+attempt, antrean memeriksa versi dan status. Reschedule menonaktifkan pengiriman lama dan membutuhkan konfirmasi tautan untuk jadwal baru. Admin mencatat kehadiran online dan memeriksa pembayaran secara manual; tidak ada room creation, rekaman atau attendance webhook otomatis. Detail F20.

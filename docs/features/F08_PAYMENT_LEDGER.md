# F08 — Tagihan, bukti dan ledger pembayaran
## Latar belakang dan tujuan
Memisahkan kewajiban, uang masuk dan status reservasi. Satu field pelunasan tidak cukup untuk DP, koreksi, diskon dan biaya susulan.
## Aktor dan authorization
Pasien melihat saldo/riwayat sendiri dan mengirim bukti. Admin melihat harga/diskon/total, memeriksa bukti dan nominal input aktif, mencatat uang nyata; **tidak menerima saldo/agregat paid**. Operasional pembayaran pasien khusus ADMIN, termasuk verify/reject/koreksi penerimaan; Superadmin melihat ledger/laporan tanpa aksi input/verifikasi pembayaran pasien. Ini penegasan developer 22 Oktober 2026, bukan kewajiban bayar penuh di awal. Tanpa gateway/refund.
## Kolom/isian dan validasi
| Isian | Wajib | Validasi |
|---|---|---|
| billing_account_id | Ya | relasi pasien/layanan sah |
| amount/actual_amount | Pembayaran | integer Rupiah>0, aktual diverifikasi |
| method | Ya | TRANSFER/QR/CASH |
| received_at | Sebelum VERIFIED | tanggal uang diterima, bukan sesi |
| reference/sender_name/proof | Sesuai metode | cash tidak memerlukan bank/file |
| proof file/version | Transfer upload | private PDF/JPEG/PNG<=10MiB |
| reason,reference entry | Reject/correction/discount/custom | wajib dan tertaut |
| total_additional_minutes | Additional time | total aktual satu usaha sesi + expected_revision |
Status payment: PENDING_VERIFICATION/PENDING_RECONCILIATION/VERIFIED/REJECTED. Tagihan UNPAID/PARTIAL/PAID derived dari kewajiban dan penerimaan VERIFIED. Pembatalan adalah status layanan terpisah, pelepasan bagian belum diberikan berjejak; bukan pembayaran PAID atau penghapusan kas. OVERPAID indikator aritmetika terpisah, bukan fitur resolusi.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
Ketentuan terbaru: cicilan atau penuh di awal diperbolehkan, wajib lunas paling lambat hari sesi terakhir. Psikoterapi baru memakai snapshot kesepakatan empat sesi dan alokasi penerimaan ke invoice berurutan. Dana untuk sesi belum dijadwalkan adalah prabayar pada rangkaian itu, bukan overpayment salah transfer, invoice baru atau kas kedua. Lewat kesepakatan total tetap selisih lebih bayar untuk penanganan eksternal. Pembatalan hanya mengurangi bagian belum diberikan, dengan referensi invoice terbentuk dan tanpa mengubah kas. [Alur lengkap, contoh, batas FE dan handoff backend](../ALUR_PEMBAYARAN_SESI.md) menggantikan penafsiran larangan semua prabayar pada catatan lama.
1. Billing account dimiliki satu appointment atau satu case. BASE memakai harga normal PLUS/promo MINUS. Minimum awal dihitung dari initial_payment_policy_snapshot: FIXED=min(fixed_amount,dasar_net), PERCENT=min(dasar_net,ceil(dasar_net*basis_points/10000)); lanjutan0 setelah DP asal terverifikasi. Default PERCENT 5000 basis poin sesuai ide pemilik; contoh FIXED 100000 hanya skenario konfigurasi opsional.
2. Pasien mengirim nominal klaim/bukti, belum menambah kas. Admin mencocokkan uang, memasukkan actual_amount/method/received_at lalu verify.
3. Penerimaan net VERIFIED = RECEIPT minus REVERSAL. Jika >=minimum DP, booking CONFIRMED. PAID hanya jika memenuhi seluruh kewajiban.
4. Saat datang, Admin wajib approve uang yang terbukti diterima. Bila DP belum cukup, tagih di luar sistem dan catat penerimaan aktual; check-in setelah minimum terpenuhi. Pelunasan dapat setelah layanan.
5. Bukti ditolak boleh diperbaiki, alasan/versi asal tetap. Koreksi pada submission sama, bukan penerimaan baru. Sebelum sesi: correction_deadline = min(start_at,max(hold_expires_at,rejected_at+proof_correction_hours)). Default operasional24jam dapat diubah owner untuk kejadian baru; bukan keputusan angka baru dari developer.
6. Reupload tepat waktu kembali WAITING_VERIFICATION; SLA dari bukti pertama lengkap, tidak reset. Selama bukti terakhir REJECTED, auto-confirm tidak berlaku. Jika SLA asal lewat ketika koreksi lengkap, perlindungan AUTO_SLA boleh berlaku, uang tetap belum VERIFIED.
7. Jika correction_deadline sebelum sesi lewat tanpa koreksi, EXPIRED dan slot dilepas. Jika batas tepat awal sesi, pemeriksaan kedatangan tersedia sampai grace; Admin memeriksa/menagih. Sesudah grace tanpa hadir/pembayaran, keputusan NO_SHOW hanya jika F10 terpenuhi. Expiry dan no-show tidak boleh berjalan saling menimpa.
8. Transfer ditemukan setelah slot dilepas tetap direkonsiliasi ke ledger dan NEEDS_MANUAL_RESOLUTION; tidak merebut slot pasien lain atau memindah uang otomatis.
9. Penerimaan verified membuat receipt immutable. Tambahan invoice ADDENDUM; diskon/koreksi ADJUSTMENT. Receipt lama tidak ditimpa.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Submit proof / pemilik | dalam deadline | PENDING_VERIFICATION; booking WAITING_VERIFICATION |
| Reject / Admin | belum VERIFIED | REJECTED + alasan; correction window bila masih tersedia |
| Correct upload / pemilik | REJECTED, window sah | proof versi baru, submission pending |
| Verify / Admin | uang nyata cocok | VERIFIED + receipt; booking sesuai DP |
| SLA / job | bukti aktif belum ditolak | PENDING_RECONCILIATION; booking AUTO_SLA |
| Correct input / Admin | VERIFIED salah input | asal tetap + reversal + replacement |
| Charge / Admin | data sah | ADDENDUM; kewajiban bertambah |
| Discount / Admin | potongan sah | ADJUSTMENT MINUS; receipt tetap |
## Alur gagal dan pemulihan
Rp1 tidak otomatis melunasi. Retry satu key tidak menambah kas dua kali. Salah ketik600000 padahal uang450000 memakai reversal/replacement, bukan refund. Dua transfer nyata tetap dicatat meski lebih bayar. Reupload tidak reset SLA atau menghidupkan slot expired.
Diskon tidak boleh menyebabkan total negatif atau menurunkan kewajiban di bawah uang diterima tanpa penanganan selisih. CUSTOM_CHARGE negatif ditolak.
Penyelesaian lebih bayar nyata dilakukan di luar sistem sesuai keputusan developer. Ledger tetap mencatat uang yang benar-benar diterima; tidak membuat status/tiket resolusi, formulir keputusan, refund, credit atau proses hangus otomatis. Selisih hitungan hanya informasi, bukan dompet pasien atau fitur penyelesaian.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /admin/appointments/{appointment}/additional-time | BillingController@time |
| POST | /admin/appointments/{appointment}/payments | BillingController@record |
| POST | /admin/billing-accounts/{billing}/{action} | BillingController@change |
| POST | /appointments/{appointment}/payment-submissions | BillingController@submit |
| GET / HEAD | /invoices/{invoice}/download | FileController@invoice |
| POST | /payments/{payment}/{action} | BillingController@payment |
| GET / HEAD | /receipts/{receipt}/download | FileController@receipt |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
Contoh bernilai DP 100000 di bawah mengasumsikan mode FIXED opsional; default aktif50% tidak menghasilkan minimum100000 untuk paket900000.
- Tagihan900000, DP 100000 dan pembayaran1: diterima100001, sisa799999, belum lunas tetapi DP minimum100000 sudah terpenuhi; booking boleh CONFIRMED setelah verifikasi.
- DP450000 lalu transfer600000 untuk900000: diterima1050000, selisih150000 tidak hilang.
- Sudah bayar900000 lalu biaya225000: receipt utuh, addendum225000, total1125000.
- Tambahan5menit lalu total10menit hanya satu blok; total40menit tiga blok, selisih dua blok sesudah satu blok sebelumnya.
- Admin response tidak membawa remaining_amount/verified_received/overpaid_amount/receipt penuh.
## Hubungan fitur
F04 harga, F06 deadline/SLA, F09 reschedule, F10 kedatangan, F14 laporan, F15 file.

## Pembatalan dan Expiry
Pembatalan/discontinue sebelum layanan dimulai melepaskan sisa yang belum diberikan melalui adjustment beralasan; uang terverifikasi tetap utuh. Rangkaian sebagian dilayani memerlukan penetapan bagian belum diberikan oleh owner. Lihat BUSINESS_RULES dan F08; tidak ada refund otomatis.
Contoh layanan belum dimulai: invoice900000, kas450000; adjustment pelepasan450000 menghasilkan CLOSED_UNSERVED tanpa refund, tanpa receipt baru dan tanpa mengubah kas450000.
Expiry tanpa bukti tepat waktu menutup bagian belum diberikan melalui adjustment CLOSED_UNSERVED yang berjejak, tanpa menghapus kas atau berpura-pura PAID. Request sah tetap diselesaikan. Uang terlambat direkonsiliasi tanpa merebut slot; keputusan kehadiran/no-show mengikuti F10.
Koreksi fakta salah input tetap berjejak; bukan sarana menghapus kewajiban sah agar lolos cancel. Histori legacy tidak diubah diam-diam.

## Formula additional time Konseling
Tambahan = waktu layanan aktual di luar durasi dasar; bukan waktu tunggu, keterlambatan atau administrasi.
billed_blocks = ceil(total_additional_minutes/15).
calculated_total = ceil(base_rate_snapshot*2500*billed_blocks/10000) Rupiah.
Pembulatan Rupiah dilakukan sekali pada calculated_total, bukan membulatkan tarif per blok lalu mengalikannya. Karena harga kustom/promo dapat bernilai ganjil, line ADDITIONAL_TIME memakai quantity=1 dan unit_amount=nilai selisih tagihan positif; billed_blocks dan formula total tetap pada metadata. Koreksi turun memakai line CORRECTION arah MINUS, bukan unit_amount negatif. Ini menjaga amount=quantity*unit_amount sesuai kamus database.
Tagih hanya selisih terhadap revisi terakhir. Koreksi turun merujuk salah input. end_at jadwal, actual_ended_at dan menit tagihan adalah fakta berbeda; pasien berikutnya tidak bergeser otomatis.
Harga900000 dan40menit menjadi3blok, biaya675000. Input5lalu5lagi harus mengirim total10, biaya225000, bukan450000.

**Basis tarif dapat dikonfigurasi oleh Admin atau Superadmin pada versi paket (F04).** additional_time_price_basis=NORMAL_PRICE memakai harga normal versi booking; FINAL_PRICE memakai harga paket setelah promo global yang efektif saat booking. Pilihan tidak mengambil saldo, total tagihan terbaru, biaya lain atau diskon individual sesudah booking. Tanpa promo saat booking, nominal kedua pilihan sama.

Server membaca pilihan dari package_version_id appointment; client input menit tidak boleh menggantinya. Simpan rate_basis dan base_rate_snapshot pada additional_time_entries, lalu gunakan basis yang sama untuk semua revisi total menit pada usaha sesi tersebut. Perubahan katalog/promo setelah booking tidak menghitung ulang tagihan lama. Konfigurasi yang belum diisi harus diselesaikan di editor paket sebelum Konseling menjadi bookable, bukan ditebak saat penagihan.

Contoh normal Rp900.000, promo Rp800.000 dan tambahan 40 menit (3 blok): NORMAL_PRICE menghasilkan Rp675.000; FINAL_PRICE menghasilkan Rp600.000. Revisi 5 menjadi 10 menit tetap satu blok, sesuai basis yang sudah tersimpan.

## Diskon individual dan minimum DP
Setiap potongan merujuk reference_line_id (form target_line_id adalah alias kontrak yang dinormalisasi server). Promo/diskon BASE mengubah dasar net; rumus minimum memakai parameter snapshot asal, bukan owner_settings terbaru. Minimum awal dihitung dari initial_payment_policy_snapshot: FIXED=min(fixed_amount,dasar_net), PERCENT=min(dasar_net,ceil(dasar_net*basis_points/10000)); lanjutan0 setelah DP asal terverifikasi. Contoh100000 hanya konfigurasi kompatibilitas preview, bukan ketentuan nominal yang tidak dapat diubah.
Contoh paket900000 diberi diskon dasar200000 sebelum pembayaran: dasar net700000, DP tetap100000. Jika dasar net75000, DP75000. Biaya tambahan bukan bagian hitungan DP dasar. Potongan tidak membuat dasar negatif atau menghilangkan uang terverifikasi. Invoice/receipt lama tetap utuh, perubahan melalui ADJUSTMENT.

## Pemeriksaan duplikasi penerimaan manual
Idempotency mengatasi retry, bukan dua input petugas dengan key berbeda. Sebelum VERIFY, backend mencari kandidat bukti checksum sama dan kecocokan referensi/metode/waktu/nominal pada penerimaan yang sudah diverifikasi. Ini sinyal pemeriksaan, bukan unique global referensi bank atau alasan menghapus uang nyata yang berbeda.
Jika ada kandidat, response petugas meminta duplicate_review_acknowledged dan alasan hasil pencocokan; tanpa itu tolak409 POSSIBLE_DUPLICATE_PAYMENT. Satu transfer yang diajukan ulang tidak dicatat lagi: tolak submission duplikat dengan referensi/audit ke transaksi yang benar. Jika terbukti dua transfer nyata, petugas mencatat keduanya dengan alasan dan selisih ditangani di luar sistem. Pasien tidak menerima identitas/nominal transaksi milik orang lain dari pemeriksaan ini. Gateway bank tidak ada, sehingga kebenaran uang nyata tetap bergantung pemeriksaan petugas.
## Koreksi uang yang sebenarnya tidak diterima
Pembayaran baru wajib positif; correct_amount pada koreksi boleh0. Jika Admin keliru mencatat uang masuk padahal tidak ada uang, append REVERSAL penuh yang merujuk transaksi salah, tanpa replacement atau receipt0. Net penerimaan kembali benar, bukti salah tetap berjejak dan ditandai dikoreksi pada tampilan. Layanan/kehadiran yang benar-benar terjadi tidak dihapus akibat koreksi uang; saldo ditindaklanjuti sesuai fakta. Koreksi uang tidak menghapus layanan nyata; cancel memakai aturan bagian belum diberikan yang berbeda dari reversal kas.
## Guard waktu dan nominal klaim
Additional time hanya IN_CONSULTATION/COMPLETED dan menit layanan tambahan yang sudah terjadi, bukan perkiraan pada WAITING_PAYMENT/CHECKED_IN. Simpan claimed_amount pasien terpisah dari amount aktual yang disahkan; selisih hasil pemeriksaan muncul pada histori berizin. Uang VERIFIED tidak ditimpa oleh pengunggahan ulang.

## Arti kelebihan bayar dan contoh

Kelebihan bayar berarti uang yang benar-benar diterima dan diverifikasi lebih besar daripada seluruh kewajiban tagihan yang sah. Ini berbeda dari sisa tagihan yang masih harus dibayar pasien.

Contoh: total tagihan Rp900.000, DP terverifikasi Rp100.000, sehingga pasien seharusnya melunasi Rp800.000. Pasien keliru mentransfer Rp950.000. Penerimaan nyata menjadi Rp1.050.000: tagihan Rp900.000 terpenuhi, selisih Rp150.000 diselesaikan petugas/pasien di luar sistem. Tidak ada status UNRESOLVED atau kewajiban mencatat cara penyelesaiannya dalam aplikasi. Jangan mengubah penerimaan menjadi Rp900.000 atau menciptakan biaya palsu untuk menghabiskan selisih.

Jika tagihan sah termasuk tambahan biaya sehingga totalnya Rp1.050.000, penerimaan Rp1.050.000 bukan kelebihan bayar. Jika hanya tombol verifikasi diklik dua kali untuk transfer yang sama, itu retry/duplikat pencatatan yang dicegah, bukan dua penerimaan nyata. Jika Admin salah mengetik Rp600.000 padahal uang diterima Rp450.000, itu koreksi salah input, bukan kelebihan bayar nyata.

Pencatatan kas mempertahankan seluruh uang nyata; selisih tidak otomatis dianggap biaya/pendapatan jasa tambahan. Penyelesaian eksternal tidak membentuk transaksi refund/credit/hangus di aplikasi, dan bukan pertanyaan bisnis yang masih menunggu keputusan. Detail saldo/selisih tidak dikirim pada DTO Admin; akses informasi perhitungan tetap sesuai policy pasien/Superadmin.

## Penolakan terlambat, konfigurasi DP dan penutupan belum diberikan
Penolakan bukti sesudah start_at tetap menyimpan REJECTED dan alasan; correction_deadline_at=null bila tidak ada jendela masa depan. Sistem tidak melempar error hanya karena correction window berakhir. Admin memeriksa/menagih saat datang dan mencatat uang nyata.
Formula DP FIXED: min(fixed_amount,effective_base_due). PERCENT: min(effective_base_due,ceil(effective_base_due*basis_points/10000)). Nilai/mode disnapshot pada transaksi dan tidak dipilih client. Default adalah PERCENT 5000 basis poin sesuai ide pemilik; fixed100000 bukan aturan aktif. Lanjutan setelah awal verified tetap0.
CLOSED_UNSERVED berbeda dari CLOSED_PAID. Jika belum dilayani, invoice900000/kas450000 dibatalkan: append ADJUSTMENT MINUS450000 beralasan dengan reference_line_id asal, tutup koleksi, pertahankan kas450000 dan receipt awal. Ini bukan diskon/refund/pembayaran baru. Jika belum ada uang, bagian belum diberikan dapat dilepaskan seluruhnya; tidak membuat receipt0. Bagian yang sudah diberikan tidak dihapus otomatis.
PaymentAgreement, PaymentAllocation dan AppointmentBillingLink mempunyai tabel/relasi eksplisit; alokasi bukan uang baru. FK saja tidak membatasi sum alokasi/diskon atau memastikan seluruh referensi satu pasien: action transaksi wajib mengunci dan memeriksanya sebelum controller aktif.

## Penyesuaian kewajiban belum diberikan
Pelepasan sisa memakai invoice ADJUSTMENT dan line kind=CORRECTION,direction=MINUS,reference_line_id asal,reason wajib serta metadata.reason_code=UNSERVED_RELEASE. CORRECTION di sini adalah kategori penyesuaian kewajiban terbit; INPUT_ERROR dan UNSERVED_RELEASE mempunyai alasan berbeda. Ini tidak membuat payment REVERSAL, karena uang nyata tidak dikembalikan. Pengurangan dibatasi bagian belum diberikan dan sisa yang boleh ditutup, diperiksa action di bawah lock.

# Kalender, deadline bukti dan pengingat
Otoritas: [keputusan aktif](KEPUTUSAN_AKTIF_2026-10-24.md). Seluruh perhitungan server; timestamp disimpan UTC, kalender/tanggal ditafsirkan Asia/Jakarta.

## Fungsi waktu dan masukan
addWorkingMinutes(anchor,180,calendar_version) mengonsumsi interval buka satu per satu. Jika anchor di luar jam buka, maju ke interval berikut. Kurangi menit yang tersedia sampai akhir interval, lalu lanjut setelah istirahat/hari tutup. Keberhasilan tepat ujung interval belum berarti layanan muat; availability tetap mencari interval utuh sesuai durasi. Batas pencarian kalender harus terbatas dan mengembalikan NO_OPERATING_WINDOW jika tidak ada jadwal, bukan loop tanpa akhir.

| Nilai | Rumus/anchor | Makna |
|---|---|---|
| earliest_online_start | addWorkingMinutes(reservation_created_at,180) | batas online, termasuk same-day |
| reminder_at | start_at − 120 menit waktu nyata | notifikasi owner, bukan jam kerja |
| hold_expires_at | min(reservation_created_at+24h,reminder_at) | tenggat bukti pertama online |
| verification_due_at | addWorkingMinutes(first_complete_proof_at,720) | SLA auto-protect, bukan pengesahan kas |
| correction_deadline_at | min(start_at,max(hold_expires_at,rejected_at+window)) jika masih sebelum sesi | koreksi tidak mengulang SLA awal |

Preview adalah estimasi tanpa lock slot. Anchor final adalah waktu create reservasi persisten. Server menghitung ulang saat submit; slot yang hanya valid pada preview lama dapat menghasilkan 409/422 dan pilihan ulang, tanpa menyimpan booking parsial. Refresh/upload bukti tidak menggeser anchor. Idempotency retry mengembalikan booking asal.

## Studi kasus
1. Klinik 08.00–16.00 tanpa jeda, booking Jumat23.55: Sabtu11.00 paling cepat. Deadline bukti sesi11.00 adalah Sabtu09.00, bukan23.55. Bukti08.50 melindungi slot; owner menerima reminder09.00 meski Admin belum memverifikasi.
2. Booking05.00 pada hari buka: hari yang sama11.00. Bukti09.00 tepat diterima. Scheduler dan upload menggunakan dedupe key appointment+attempt+REMINDER sehingga tidak mengirim dua kali.
3. Booking10.30, interval08.00–12.00 dan13.00–16.00: tiga jam kerja selesai14.30. Reminder/deadline paling lambat12.30 (waktu nyata), walau klinik sedang jeda. Pembayaran lewat transfer boleh saat jeda; verifikasi Admin dapat saat pasien datang.
4. Booking Senin08.00 untuk Rabu14.00: hold berakhir Selasa08.00 karena24jam lebih cepat daripada Rabu12.00. Bukti tepat waktu mempertahankan reservasi; reminder tetap Rabu12.00, tidak dikirim saat upload dua hari sebelumnya.
5. Tidak ada bukti sebelum deadline: expiry melepaskan interval. Transfer yang ditemukan kemudian dicatat rekonsiliasi, tidak memulihkan slot otomatis.

## Penolakan dan kedatangan
Sebelum sesi, koreksi boleh pada jendela tersisa; rejection menyimpan alasan/versi. Upload ulang tidak memperpanjang SLA. Setelah waktu sesi, rejection tetap sah dan correction_deadline_at=null untuk kasus yang tidak memiliki jendela masa depan. Admin menyelesaikan pemeriksaan/penagihan saat kedatangan; uang aktual dicatat. Reminder yang sudah terkirim tidak dihapus; perubahan penting mengirim pembaruan berjejak, bukan reminder mundur.

## Offline, included dan reschedule
ADMIN_WALK_IN/ADMIN_ASSISTED/OWNER_EXTERNAL yang benar-benar offline boleh hari ini/sekarang dengan slot kosong, durasi muat dan alasan. Pengingat untuk booking kurang dari120 menit dikirim segera dengan label tambahan manual terlambat, tidak dibuat seolah sudah dikirim T−2. Tidak ada hold online24jam atau bukti yang dipaksa bertenggat masa lalu.
Lanjutan INCLUDED menggunakan billing asal dan tidak membuat pembayaran awal baru. NOT_REQUIRED tidak mempunyai hold bayar/bukti/receipt.
Reschedule tidak mengulang DP/SLA kas asal. Pasien memilih target yang memenuhi tiga jam kerja sejak selection diajukan; petugas offline/asal klinik dapat menata target lebih dekat sesuai kesepakatan. Kelayakan request asal tetap requested_at; APPLY tidak menggeser anchor demi menolak request yang Admin telat proses, tetapi target harus masih di masa depan dan bebas.

## Perubahan kalender dan race
Kalender tanggal khusus menggantikan interval mingguan tanggal itu; CLOSED menutup, OPEN eksplisit dapat membuka hari libur dengan alasan. Tidak ada dua override pada versi/tanggal sama.
Publish perubahan mengunci resource tanggal dan appointment terdampak, membuat versi/impact/requestCLINIC/outbox atomik. Deadline lama menyimpan kalender snapshot. Ketidaklayakan jadwal menandai requires_reschedule, bukan diam-diam mengubah jam/kuota pasien atau menghukum no-show.
Booking/reschedule/expiry/verify/check-in mengambil lock resource praktisi+tanggal WIB yang sama. Interval setengah terbuka [start,end); cek overlap start_existing<end_new AND end_existing>start_new. Unique tanggal resource tidak menggantikan pemeriksaan overlap. Version guard menangani edit form usang; transaction menangani beberapa tabel. Keduanya wajib pada tahap action/controller.

Koreksi bukti yang sah diterima setelah reminder_at tetapi sebelum correction_deadline_at mengantrekan pemberitahuan segera dengan label terlambat/koreksi; tidak mencatat seolah sudah dikirim T−2. Gunakan event reminder yang sama bila belum pernah terkirim, atau event pembaruan bila reminder sebelumnya sudah SENT. Payment tetap belum VERIFIED sampai Admin memeriksa.

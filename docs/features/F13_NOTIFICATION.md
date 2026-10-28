# F13 — Notifikasi dan antrean pengiriman
## Latar belakang dan tujuan
Memberi kabar administratif yang dapat dipantau tanpa mengubah keberhasilan transaksi ketika kanal gagal.
## Aktor dan authorization
Owner menerima WhatsApp Baileys. Pasien/penanggung jawab menerima in-app dan pengingat WhatsApp atas layanan sendiri bila nomor serta persetujuan booking tersedia. Admin melihat antrean tugas dan status kirim, tidak membaca payload klinis.
Khusus Telelayanan Google Meet, pasien/penanggung jawab menerima tautan dan pembaruan sesi otomatis lewat WhatsApp. Pengiriman memakai nomor yang dikonfirmasi saat booking, termasuk penerima booking bantuan tanpa akun; bukan broadcast/promosi.
## Kolom/isian dan validasi
| Event | Penerima | Kanal default | Isi |
|---|---|---|---|
| Ringkasan harian | Owner | WhatsApp | tautan ringkasan jadwal di dashboard berizin |
| H-2 jam | Owner | WhatsApp | jadwal terbaru + link dashboard/pre-test berizin |
| Booking/pembayaran/bukti ditolak | penanggung jawab | In-app | status, alasan administratif, tindakan berikutnya |
| Perubahan jam/reschedule | pasien terdampak + Admin/owner | In-app; WA owner dan pasien yang setuju | alasan dari klinik + link pilih ulang |
| Mendekati sesi belum terverifikasi | Admin + owner | tugas in-app; WA owner bila eskalasi | prioritas pemeriksaan |
| Admin menyimpan/mengganti link Meet | WA pasien/penanggung jawab booking | WhatsApp Baileys + detail berizin di web | praktik,kode booking,jadwal WIB,link Meet aktif |
| Reschedule Telelayanan APPLIED | Admin + pasien | tugas/in-app dahulu | siapkan/konfirmasi link usaha baru, lalu kirim WA jadwal baru |
WhatsApp pasien untuk semua kategori layanan diaktifkan melalui konfirmasi nomor dan tujuan pengiriman dalam booking (F20). Penerima dan tujuan jelas; tidak memperluas izin ke marketing atau pesan klinis. Email fallback membutuhkan konfigurasi provider; tidak diasumsikan berhasil. Record notifications: outbox_id (FK notification_outbox, bukan kolom event_id), recipient_user_id nullable khusus WA kontak, recipient_phone_snapshot, tele_service_link_id, channel, template_key, status, deduplication_key, attempt_count, next_retry_at, sent_at, last_error.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Transaksi bisnis membuat outbox di transaction yang sama.
2. Worker mengambil event, memeriksa hak penerima dan versi jadwal terkini.
3. Kirim dengan deduplication key; simpan hasil/provider reference.
4. Jika sesi Baileys terputus, retry terbatas/backoff dan antrean manual; status bukan SENT.
5. Jadwal yang berubah membatalkan reminder versi lama dan membuat reminder versi baru.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Enqueue / server | event commit | QUEUED |
| Claim / worker | QUEUED/RETRY, waktunya tiba | SENDING |
| Success / worker | provider mengakui | SENT |
| Failure / worker | gangguan sementara | RETRY; setelah batas FAILED |
| Stale schedule / worker | versi berubah/cancelled | CANCELLED |
## Alur gagal dan pemulihan
Exactly-once pengiriman eksternal tidak dijanjikan: provider dapat menerima sebelum timeout. Dedupe lokal dan pemeriksaan provider mengurangi duplikat; petugas melihat kondisi ambigu. Link detail website tetap memerlukan login/policy; link Google Meet adalah tautan eksternal dengan akses pertemuan dikelola host, bukan session Laravel. Tidak ada keluhan, diagnosis atau jawaban pre-test di pesan.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /admin/notification-deliveries/{notification}/retry | NotificationController@retry |
| POST | /appointments/{appointment}/reminder-contact | NotificationController@contact |
| POST | /notifications/{notification}/read | NotificationController@read |
| POST | /superadmin/whatsapp/pairing | NotificationController@pairing |
| GET / HEAD | /superadmin/whatsapp/status | NotificationController@status |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Reschedule tidak mengirim reminder jam lama.
- Nomor owner placeholder tidak dicoba kirim sampai valid.
- Gagal WhatsApp tidak membatalkan booking/pembayaran.
- Save link Meet membuat outbox otomatis; worker memeriksa versi link, attempt, nomor dan status. Link/jadwal lama tidak dikirim dari antrean yang sudah kedaluwarsa. SENT bukan tanda dibaca atau hadir.
## Hubungan fitur
F06, F08, F09, F15, worker Baileys pada satu VPS.

## Pengingat owner24 Oktober
REMINDER_OWNER pada start_at−120 menit waktu nyata dikirim jika ada bukti awal tepat waktu dan tidak ditolak, atau minimum terverifikasi, atau INCLUDED/NOT_REQUIRED sah. Pending verifikasi tidak membatalkannya. Tidak pernah mengubah payment VERIFIED. Dedupe key appointment+attempt+event; upload tepat reminder_at ikut enqueue sesudah commit. Bukti ditolak sesudah pesan terkirim menghasilkan pembaruan, bukan menghapus histori. Booking offline <120 menit mengirim segera bertanda tambahan manual.

Koreksi bukti yang sah diterima setelah reminder_at tetapi sebelum correction_deadline_at mengantrekan pemberitahuan segera dengan label terlambat/koreksi; tidak mencatat seolah sudah dikirim T−2. Gunakan event reminder yang sama bila belum pernah terkirim, atau event pembaruan bila reminder sebelumnya sudah SENT. Payment tetap belum VERIFIED sampai Admin memeriksa.

## Kontak dan aktivasi aktual

Owner menerima melalui users.phone privat, dapat diubah pada Akun dan keamanan; bukan kontak publik praktik. Pasien memberi reminder_recipient_phone dan reminder_wa_accepted saat booking, dapat mengubah/mencabut melalui reminder-contact dengan expected_version. Lanjutan mewarisi konteks dan dapat diperbarui. Queue memakai dedupe per event/audience, payload terenkripsi dibekukan saat percobaan pertama, ACK valid wajib. Retry tidak mengganti ID; hasil tidak pasti perlu rekonsiliasi. Reminder yang lewat awal sesi/attempt berubah dibatalkan. Status dan pairing hanya Superadmin. Rincian field/transisi/operasional: [panduan integrasi](../INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md).

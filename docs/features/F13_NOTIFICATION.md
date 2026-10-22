# F13 — Notifikasi dan antrean pengiriman
## Latar belakang dan tujuan
Memberi kabar administratif yang dapat dipantau tanpa mengubah keberhasilan transaksi ketika kanal gagal.
## Aktor dan authorization
Owner menerima WhatsApp Baileys. Pasien/penanggung jawab menerima in-app atas layanan sendiri. Admin melihat antrean tugas dan status kirim, tidak membaca payload klinis.
Khusus Telelayanan Google Meet, pasien/penanggung jawab menerima tautan dan pembaruan sesi otomatis lewat WhatsApp. Pengiriman memakai nomor yang dikonfirmasi saat booking, termasuk penerima booking bantuan tanpa akun; bukan broadcast/promosi.
## Kolom/isian dan validasi
| Event | Penerima | Kanal default | Isi |
|---|---|---|---|
| Ringkasan harian | Owner | WhatsApp | jumlah, waktu, identitas secukupnya, paket, status, link |
| H-2 jam | Owner | WhatsApp | jadwal terbaru + link dashboard/pre-test berizin |
| Booking/pembayaran/bukti ditolak | penanggung jawab | In-app | status, alasan administratif, tindakan berikutnya |
| Perubahan jam/reschedule | pasien terdampak + Admin/owner | In-app; WA owner | alasan dari klinik + link pilih ulang |
| Mendekati sesi belum terverifikasi | Admin + owner | tugas in-app; WA owner bila eskalasi | prioritas pemeriksaan |
| Admin menyimpan/mengganti link Meet | WA pasien/penanggung jawab booking | WhatsApp Baileys + detail berizin di web | praktik,kode booking,jadwal WIB,link Meet aktif |
| Reschedule Telelayanan APPLIED | Admin + pasien | tugas/in-app dahulu | siapkan/konfirmasi link usaha baru, lalu kirim WA jadwal baru |
WhatsApp pasien untuk Telelayanan diaktifkan melalui konfirmasi nomor dan tujuan pengiriman dalam booking (F20). Penerima dan tujuan jelas; tidak memperluas izin ke marketing atau pesan klinis. Email fallback membutuhkan konfigurasi provider; tidak diasumsikan berhasil. Record notifications: outbox_id (FK notification_outbox, bukan kolom event_id), recipient_user_id nullable khusus WA kontak, recipient_phone_snapshot, tele_service_link_id, channel, template_key, status, deduplication_key, attempt_count, next_retry_at, sent_at, last_error.
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
enqueueOutbox, dispatchNotifications, retryFailed, listOwnNotifications. GET /notifications; PATCH /notifications/{id}/read; GET /admin/notification-deliveries; POST /admin/notification-deliveries/{id}/retry. Endpoint delivery dibatasi role, bukan sekadar login.
Target path relatif root domain memakai route web/session Laravel. Kontrak props/form/JSON pendukung dan daftar route yang sudah dibuat ada di [WEB_CONTRACT](../WEB_CONTRACT.md). Kode409/422 di uraian fitur adalah kondisi domain/JSON; form Inertia memetakannya ke redirect/errors sesuai kontrak.
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

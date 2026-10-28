# F20 — Telelayanan Google Meet dan WhatsApp pasien

## Latar belakang dan tujuan

Telelayanan dilaksanakan melalui Google Meet. Pasien mengambil paket Konsultasi Telelayanan, kemudian Admin menghubungi pasien dan memasukkan tautan Meet pada booking agar dikirim otomatis ke WhatsApp pasien melalui Baileys. Web mengelola administrasi, jadwal dan pengiriman tautan; pertemuan berlangsung di Google Meet.

Paket COUNSELING_TELE_SERVICE tetap kategori COUNSELING, baseline Rp750.000 dan durasi 60 menit. Pelaksanaan tidak lagi ditunda sebagai katalog saja. Admin/Superadmin dapat mengaktifkan bookable setelah pengaturan harga, basis additional time dan kalender valid. Nomor penerima WA wajib valid pada masing-masing booking, bukan satu nomor pasien pada katalog.

## Aktor dan authorization

- Pasien/penanggung jawab memesan, memeriksa nomor WhatsApp, menerima tautan dan mengikuti sesi.
- Admin menjadi petugas utama yang menghubungi pasien, membuat/memperoleh tautan Meet di luar aplikasi, memasukkannya, memperbaiki nomor/tautan, serta memantau pengiriman. Superadmin juga memiliki kemampuan ini.
- Superadmin/praktisi menyelenggarakan layanan dan mengendalikan akses ruang Meet melalui Google Meet. Tidak ada pembuatan ruang otomatis atau integrasi Google Calendar/Meet API dalam scope ini.
- Tautan hanya dapat dibaca pasien/penanggung jawab berizin pada appointment terkait dan petugas. Guest/pasien lain tidak dapat membaca tautan atau nomor penerima.

## Kolom/isian dan validasi

| Isian | Wajib | Validasi |
|---|---|---|
| appointment_id | Ya | booking berizin dengan delivery_mode=TELE_SERVICE |
| meeting_url | Saat Admin menyimpan tautan | HTTPS, host tepat meet.google.com, path ruang nonkosong; tolak credentials dalam URL, URL pembuat ruang /new, javascript dan domain lain |
| recipient_phone | Booking Telelayanan dan saat kirim | nomor WA pasien/penanggung jawab yang dikonfirmasi; normalisasi internasional, misalnya +62; bukan placeholder |
| recipient_user_id | Bila ada akun | diturunkan server dari akses/penanggung jawab, bukan akun bebas dari form |
| wa_delivery_accepted | Saat konfirmasi booking | boolean penerimaan nyata; naskah menjelaskan pengiriman tautan/jadwal ke nomor yang dipilih, bukan marketing; timestamp dicatat server |
| expected_appointment_version, expected_link_version | Mutasi | cegah dua tab/petugas saling menimpa |
| reason | Ubah/kirim ulang | alasan administratif tanpa keluhan/diagnosis |
| recipient_confirmed | Jika nomor diperbaiki | true hanya setelah konfirmasi kontak nyata; server mencatat recipient_confirmed_at |

Nomor default berasal dari kontak WA penanggung jawab booking dan dapat diperbaiki Admin setelah konfirmasi. Untuk anak/booking orang lain, tautan dikirim ke satu kontak penanggung jawab yang ditunjuk, bukan seluruh peserta. Booking bantuan Admin tanpa akun tetap dapat menerima WA.
Validasi format URL tidak membuktikan ruang sudah aktif atau milik praktisi; Admin memastikan tautan yang diperoleh di luar aplikasi memang untuk sesi terkait sebelum menyimpannya. Tidak ada pemanggilan Google API untuk memeriksa atau membuat ruang pada scope ini.

Data terperinci ada di [kamus database](../DATABASE_ARCHITECTURE.md): appointments menyimpan snapshot kontak/tujuan pengiriman; tele_service_links menyimpan revisi tautan per appointment dan attempt_number; notifications menyimpan hasil kirim.
expected_appointment_version adalah row_version appointment terkini; expected_link_version adalah version konten tele_service_links. Pembayaran boleh menaikkan row_version appointment tanpa mengganti tautan; worker memeriksa attempt/link_version/status, bukan membatalkan pesan hanya karena row_version berubah.
Nomor di appointments adalah snapshot saat booking. Sesudah perbaikan kontak, tele_service_links revisi aktif adalah sumber nomor pengiriman, lalu disalin ke notifications sebagai bukti tujuan kirim; jangan membandingkannya dengan nomor snapshot awal dan menganggap koreksi sah sebagai konflik.
Mapping booking: recipient_phone ke appointments.tele_service_recipient_phone, penerimaan pengiriman ke appointments.tele_service_wa_accepted_at. wa_delivery_accepted=true adalah input penerimaan nyata, bukan timestamp bebas client. Revisi link memakai recipient_confirmed_at dari penerimaan booking atau konfirmasi nomor baru yang dicatat server.

## Alur normal

1. Pasien login, memilih paket Telelayanan dan interval kosong. H+1, lead enam jam kerja, durasi, hold/DP, profiling dan consent tetap mengikuti aturan umum.
2. Form menampilkan nomor tujuan dan pemberitahuan: “Tautan Google Meet dan informasi sesi akan dikirim ke WhatsApp ini.” Pilihan nomor/penerimaan tersimpan bersama booking; Admin mendapat tugas menyiapkan tautan.
3. Admin menghubungi pasien melalui proses administrasi, membuat/memperoleh tautan Google Meet di luar aplikasi, lalu membuka detail booking Telelayanan.
4. Admin menempelkan tautan dan memeriksa nomor serta jadwal. Server memvalidasi dan menyimpan revisi tautan + outbox dalam transaction; setelah commit, worker otomatis mengirim WA. Menyimpan tautan menjadi pemicu kirim, tidak perlu Admin membuka WhatsApp secara manual untuk mengirim pesan itu.
5. Pesan berisi nama praktik, kode booking, tanggal/jam WIB dan tautan Meet. Jangan memuat keluhan, jawaban profiling, diagnosis, saldo atau data peserta lain. Pasien juga dapat membaca tautan pada detail booking berizin yang masih aktif.
6. Admin melihat QUEUED/SENDING/SENT/RETRY/FAILED. SENT berarti provider mengakui pengiriman; bukan bukti pasien membaca atau hadir.
7. Link boleh disiapkan/dikirim setelah reservasi aktif dibuat, tidak harus menunggu pelunasan. Pengiriman tidak mengubah status pembayaran atau mengesahkan uang. Pada waktu sesi, Admin mencocokkan identitas dan memeriksa/menagih pembayaran seperti operasional biasa melalui komunikasi jarak jauh; check-in setelah minimum DP terverifikasi.
8. Admin mencatat kehadiran online, mulai dan selesai berdasarkan kejadian/informasi praktisi. Membuka tautan/WA bukan check-in otomatis. Pelunasan/additional time mengikuti ledger dan kategori Konseling.

## Status dan transisi

Kesiapan tautan adalah informasi terpisah dari status appointment. NEEDS_LINK/READY berasal dari ada/tidaknya revisi tautan untuk attempt_number aktif; tidak menjadi status baru appointment.

| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Booking Telelayanan / server | reservasi valid | NEEDS_LINK + tugas Admin |
| Simpan tautan / Admin atau Superadmin | appointment aktif, kontak dan tautan valid | revisi baru, READY + outbox QUEUED |
| Dispatch / worker | revisi/attempt/penerima masih berlaku | SENDING lalu SENT atau RETRY/FAILED |
| Ubah tautan/nomor / Admin | versi cocok | revisi baru + kirim versi terbaru; antrean versi lama dibatalkan |
| Kirim ulang / Admin | versi aktif, alasan ada | delivery attempt baru dengan idempotency/dedupe; bukan membuat booking baru |
| Reschedule APPLIED / server | attempt_number bertambah | kiriman lama dibatalkan, NEEDS_LINK untuk usaha baru |
| Konfirmasi ulang / Admin | jadwal baru valid | input/konfirmasi tautan untuk usaha baru; URL sama boleh dipakai setelah dipastikan masih sesuai, kirim jadwal baru |
| Cancel/expire/terminal / server | booking tak aktif lagi | hentikan kiriman tertunda dan aksi gabung; histori tetap |

## Alur gagal dan pemulihan

- Nomor salah/kosong: jangan mengirim ke nomor akun Admin atau nomor cadangan diam-diam; minta perbaikan kontak. Nomor valid secara format tidak membuktikan pemiliknya; Admin memastikan kontak yang ditunjuk.
- Baileys terputus/gagal: booking, pembayaran dan link tetap tersimpan; retry terbatas dan tugas Admin. Admin dapat menyampaikan tautan lewat komunikasi langsung di luar sistem bila perlu; jangan menandainya SENT jika worker belum berhasil.
- Link sudah terkirim ke nomor lama: sistem tidak dapat menjanjikan penarikan pesan. Tampilkan riwayat, perbaiki nomor, gunakan tautan baru bila diperlukan dan kirim pembaruan. Histori link versi lama tidak ditampilkan sebagai tautan aktif.
- Reschedule/perubahan jam klinik: worker memeriksa attempt_number, link_version, kontak terbaru, requires_reschedule dan status sebelum mengirim. Tunda/batalkan pesan tidak berlaku; jangan mengirim tautan lama bersama jadwal baru secara otomatis tanpa konfirmasi Admin.
- Klik simpan/retry ganda: satu idempotency key menghasilkan satu revisi/delivery. Tombol kirim ulang sengaja merupakan aksi tersendiri dengan alasan dan pembatasan laju. Timeout provider tetap dapat menghasilkan kondisi ambigu; jangan menjanjikan exactly-once di jaringan eksternal.
- Save biasa dengan URL/nomor sama seperti revisi aktif tidak membuat revisi/pesan baru; gunakan action resend untuk pengiriman ulang yang disengaja.
- Sesi mendekat tetapi link belum siap/WA gagal: tampilkan prioritas tugas Admin/owner; tidak otomatis membatalkan booking atau menandai pasien NO_SHOW karena kendala dari praktik. Request perubahan dari klinik memakai F09 dan tidak memotong kuota pasien.
- Telelayanan dan tatap muka menggunakan praktisi/kalender yang sama; tidak boleh overlap karena berbeda kanal. Tidak ada pemindahan jadwal diam-diam.

## Function dan route web

getAuthorizedTeleService, saveAndDispatchLink, replaceLinkOrRecipient, resendCurrentLink, reconcileOnlineAttendance. Path relatif root domain melalui routes/web.php; kontrak transport Inertia/JSON pendukung mengikuti WEB_CONTRACT.md.

- GET /appointments/{id}/tele-service: pemilik/petugas; tautan aktif, jadwal dan nomor tersaring sesuai akses.
- POST /admin/appointments/{id}/tele-service-links: Admin/Superadmin menyimpan revisi dan memicu outbox otomatis; mengirim meeting_url, recipient_phone, expected versions dan reason.
- POST /admin/appointments/{id}/tele-service-links/{link_id}/resend: hanya revisi/attempt aktif; idempotency key dan reason wajib.
- Check-in/start/complete tetap endpoint operasional F10, bukan webhook dari klik tautan.

Sukses penyimpanan mengembalikan 201 dengan delivery_status=QUEUED, bukan janji WA telah diterima. Konflik versi/status 409, non-Telelayanan/URL/nomor invalid 422, tidak berwenang 403/404. Server menurunkan recipient_user_id/actor/attempt/version, tidak menerima override bebas dari client.

## Data, audit dan notifikasi

Simpan URL privat dalam encrypted-at-rest field; audit mencatat perubahan versi, actor, alasan dan tujuan kontak yang dimasking, bukan URL lengkap atau credential. Outbox menautkan link_id agar worker mengambil versi berizin; jangan menaruh URL rahasia dalam log generik.
Unique appointment+attempt+version, booking lock dan idempotency mencegah revisi ganda. Delivery mengacu revisi dan recipient_phone_snapshot; perubahan kontak menghasilkan revisi baru, bukan menimpa pesan yang telah terbit. Untuk penerima tanpa akun, notifications boleh mempunyai recipient_user_id null khusus kanal WhatsApp dengan phone snapshot; in-app tetap membutuhkan akun.
Tautan Google Meet merupakan tautan eksternal, bukan signed URL Laravel. Login website melindungi halaman detail; izin masuk pertemuan dikelola host di Google Meet. Aplikasi tidak mengklaim dapat mencegah penerima meneruskan tautan. Tidak ada rekaman atau isi konsultasi otomatis disimpan di web.

## Acceptance criteria

- COUNSELING_TELE_SERVICE dapat bookable setelah konfigurasi wajib terisi; harga baseline Rp750.000 dan durasi 60 menit.
- Admin simpan link valid pada booking aktif menghasilkan satu revisi dan outbox otomatis; response awal QUEUED, bukan SENT.
- WA mengarah ke nomor pasien/penanggung jawab yang ditunjuk, termasuk booking bantuan tanpa akun; tidak pernah fallback diam-diam ke nomor Admin.
- Booking offline dan pasien lain tidak dapat memakai endpoint atau membaca link tersebut.
- Perubahan jadwal/nomor/link tidak mengirim versi lama yang masih mengantre. Revisi baru mempunyai jejak dan pesan pembaruan; pesan yang sudah terkirim tidak diklaim dapat ditarik kembali.
- Gagal WA tetap menampilkan tugas petugas; tidak memalsukan sukses, membatalkan kas atau menandai no-show otomatis.
- Pengiriman link/membuka Meet tidak mengubah payment atau attendance; penggunaan praktisi tetap mencegah tabrakan dengan sesi offline.

## Hubungan fitur

[F04 katalog](../features/F04_PACKAGE_CATALOG.md), F05 kalender, F06 booking, F08 pembayaran, F09 reschedule, F10 operasional, [F13 notifikasi](../features/F13_NOTIFICATION.md), F15 privacy dan F17 ruang kerja Admin. Kontrak HTTP di [WEB_CONTRACT](../WEB_CONTRACT.md).

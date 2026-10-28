# F06 — Booking dan perlindungan reservasi

> Semua booking/reschedule/sesi lanjutan minimal H+1 WIB untuk seluruh role, termasuk Admin/owner; tidak ada DP baru pada lanjutan/reschedule setelah DP awal terverifikasi. [Keputusan final](../KEPUTUSAN_FINAL_2026_10_22.md).

## Latar belakang dan tujuan
Mengikat pasien, versi paket, consent, interval dan tagihan tanpa memulai dari status pembayaran yang ambigu.
## Aktor dan authorization
Pasien membuat booking milik pasien yang diaksesnya. Admin membuat walk-in/assisted. Superadmin mempunyai akses operasional. Actor diambil session. Approval Superadmin untuk walk-in dilakukan di luar aplikasi.
## Kolom/isian dan validasi
patient_id, package_version_id, start_at wajib; sumber PATIENT_ONLINE/ADMIN_WALK_IN/ADMIN_ASSISTED; responsible snapshot dan consent sesuai template. profiling_mode DIGITAL/PAPER: PATIENT_ONLINE wajib DIGITAL dengan pretest_submission_id SUBMITTED milik pasien berizin. Admin dapat memilih PAPER untuk pendaftaran offline (walk-in/assisted) tanpa pretest_submission_id; kertas langsung ke Superadmin, bukan diinput Admin. PAPER menolak ID submission digital agar jalur tidak bercampur. Pada DIGITAL, Admin hanya menautkan submission sah yang diisi pasien, tanpa akses answers. end_at, deadline, billing account dan harga dihitung server. DRAFT adalah form/pretest mandiri; reservasi persisten mulai WAITING_PAYMENT, tidak memakai HELD sebagai status paralel.
Khusus TELE_SERVICE, form wajib mengonfirmasi tele_service_recipient_phone (nomor WA pasien/penanggung jawab) serta tujuan pengiriman link/jadwal. Server mencatat tele_service_wa_accepted_at dari penerimaan nyata, bukan timestamp bebas client. Sesudah booking terbentuk, tugas Admin NEEDS_LINK dibuat melalui outbox; link Meet baru dimasukkan Admin pada F20.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Lengkapi identitas dan consent. Online: pasien mengisi/submit profiling digital. Offline: Admin memilih PAPER; pasien mengisi kertas untuk Superadmin dan booking tidak menunggu submission digital. Consent aplikasi yang dicatat Admin tetap penerimaan nyata penanggung jawab, berbeda dari jawaban profiling.
2. Tampilkan preview server harga normal/promo/final, DP dan deadline.
3. Submit memakai idempotency key. Server lock resource hari, validasi versi kalender dan paket, buat appointment, billing account atau assessment case, invoice dasar, tautkan submission/consent dalam transaction. Khusus booking Psikoterapi pertama, buat treatment_plan ACTIVE empat unit dalam transaction yang sama lalu tautkan appointment sesi1; tanpa approval owner sebelumnya. Hanya sesi1 dijadwalkan/ditagih. Plan aktif yang sudah ada diarahkan ke Admin untuk lanjutan, bukan auto-create kedua; detail guard/retry dan kebutuhan setelah plan terminal mengikuti F11.
4. Status WAITING_PAYMENT melindungi interval sampai min(created_at+24h,start_at).
5. Bukti tepat waktu menghasilkan WAITING_VERIFICATION, pembayaran diverifikasi menghasilkan CONFIRMED jika DP terpenuhi.
6. Job SLA dapat membuat CONFIRMED_AUTO_SLA; check-in tetap memerlukan pemeriksaan uang.
7. Appointment included lanjutan Asesmen memakai pembayaran/SLA case asal, bukan WAITING_PAYMENT atau hold24jam baru. Verifikasi case mengevaluasi ulang appointment yang menunggu tanpa menimpa terminal/kehadiran. Anchor adalah TESTING assessment_sequence=1; clock bukti pertama/hold asal tidak diperpanjang follow-up. Detail F18.
8. Expiry hold teknis tidak membuat status PAID, tidak melepaskan sisa tagihan atau membatalkan layanan berbayar otomatis. Uang/bukti terlambat direkonsiliasi. Pembatalan manual seluruh sisa layanan wajib lunas sesuai F08/F11.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Create / pasien atau Admin | form sah, interval bebas | WAITING_PAYMENT + invoice |
| Proof lengkap / pemilik | <= deadline | WAITING_VERIFICATION, SLA pertama dimulai |
| Verify / Admin | jumlah terverifikasi >= minimum DP | CONFIRMED |
| SLA / job | bukti sah menunggu 12 jam kerja | CONFIRMED_AUTO_SLA; bukan pengakuan uang |
| Expiry / job | deadline lewat tanpa bukti tepat waktu | EXPIRED, interval dilepas |
| Reject/correction / Admin/pasien | bukti diperiksa | mengikuti F08; tidak membuat PAID |
## Alur gagal dan pemulihan
Slot telah diambil memberi 409 dan data form tetap. Versi paket berubah meminta preview baru. Retry key sama+payload sama mengembalikan hasil yang sama; key sama+payload beda ditolak. Bukti terlambat tidak menghidupkan slot expired; uang nyata tetap dicatat untuk rekonsiliasi.
## Function dan route web
previewBooking, createBooking, getBooking, listOwnBookings. POST /appointments/preview, /appointments; GET /appointments, /appointments/{id}. Cash/walk-in memakai ledger F08 dan tetap lock resource.
Target path relatif root domain memakai route web/session Laravel. Kontrak props/form/JSON pendukung dan daftar route yang sudah dibuat ada di [WEB_CONTRACT](../WEB_CONTRACT.md). Kode409/422 di uraian fitur adalah kondisi domain/JSON; form Inertia memetakannya ke redirect/errors sesuai kontrak.
## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Tidak ada dua status HELD dan WAITING_PAYMENT yang menafsirkan okupansi secara berbeda.
- Deadline selalu min24h dan waktu sesi; bukti dengan received_at tepat deadline diterima.
- Identitas/benefit/harga lama tidak berubah ketika katalog/profil diedit.
## Hubungan fitur
F03, F04, F05, F07, F08, F15.

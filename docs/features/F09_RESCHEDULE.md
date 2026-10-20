# F09 — Permintaan pindah jadwal
## Latar belakang dan tujuan
Mencegah booking buntu, slot ganda dan hilangnya riwayat no-show; kelayakan pasien ditentukan saat mengajukan.
## Aktor dan authorization
Pasien mengajukan atas booking sendiri; Admin menilai, membantu memilih dan menerapkan interval; Superadmin menangani exception. Perubahan asal klinik dicatat sebagai CLINIC, tidak mengurangi kuota.
## Kolom/isian dan validasi
appointment_id dan reason wajib; reason_code opsional (klasifikasi), requested_start_at opsional. Tidak ada field note wajib kedua dengan arti sama. Server menyimpan requested_at, eligibility_checked_at, appointment_version (snapshot row_version), appointment_attempt_number, old interval, origin PATIENT/CLINIC/OWNER, owner_authorization_note bila OWNER, quota_effect, approved_at, selection_expires_at, applied_at. Satu request aktif per appointment. expected_version mengacu row_version request saat review; apply juga menerima expected_appointment_version terkini.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Saat submit, server memeriksa kuota <3 dan waktu: normal sebelum start_at-2h; setelah NO_SHOW paling lambat akhir tanggal start_at+4 hari kalender WIB. Snapshot kelayakan disimpan.
2. Request REQUESTED tidak mengubah status pembayaran/interval. Jika sesi lama lewat saat Admin terlambat memproses request tepat waktu, tampil NEEDS_RESOLUTION; jangan otomatis menandai kesalahan pasien.
3. Admin reject dengan alasan atau approve. Jika belum ada slot, SLOT_SELECTION_REQUIRED; masa pemilihan default 24 jam sejak approval, konfigurabel Superadmin. Ini default operasional, bukan mengulang hold pembayaran.
4. Pilihan baru dicek availability lagi. Approval tidak menjamin interval baru telah dipesan.
5. Apply mengunci resource hari lama/baru dahulu, lalu appointment, request dan billing jika diperlukan sesuai urutan global di kamus database; ubah interval, append event, naikkan attempt_number. quota_effect=1 hanya untuk asal PATIENT saat APPLIED; reschedule_count DTO adalah SUM efek request APPLIED, bukan counter kedua. Pembayaran/billing account tetap.
6. Jika sebelumnya NO_SHOW, event no-show lama tetap utuh. Status kembali CONFIRMED bila DP terpenuhi atau CONFIRMED_AUTO_SLA bila perlindungan SLA sah; jika bukti sah masih menunggu, WAITING_VERIFICATION. WAITING_PAYMENT hanya bila hold asal masih berlaku, deadline=min(hold_expires_at_lama,start_baru); tidak memberikan24jam baru. Jika hold asal telah habis tanpa perlindungan bukti, tidak boleh menghidupkannya lewat reschedule; gunakan penanganan expired/booking baru. Umur SLA dan verifikasi uang tidak reset.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Submit / pasien | eligible pada requested_at | REQUESTED |
| Review / Admin | REQUESTED | REJECTED beralasan atau APPROVED |
| Need slot / Admin | APPROVED tanpa interval | SLOT_SELECTION_REQUIRED |
| Apply / Admin | APPROVED atau SLOT_SELECTION_REQUIRED, slot bebas | APPLIED + pindah + lepas lama |
| Selection timeout / job | approval window berakhir | EXPIRED request + requires_resolution=true; appointment/hak tidak dihapus otomatis |
| Cancel request / pemohon | belum APPLIED | CANCELLED; kuota tetap |
## Alur gagal dan pemulihan
Slot baru terambil memberi 409, request tetap dapat memilih lagi selama window. Jika pemilihan expired, Admin menyelesaikan manual; hak pengajuan yang telah tepat waktu tidak otomatis hangus karena Admin. Request ditolak setelah sesi lewat perlu keputusan administratif/no-show beralasan, bukan memundurkan requested_at. Kuota habis/normal H-2 ditolak; exception owner melalui jalur terpisah beralasan.
## Resolusi pengajuan yang melewati sesi/jendela
Badge NEEDS_RESOLUTION adalah derived dari requires_resolution, bukan status appointment baru. Pengajuan tepat waktu yang jendela pemilihannya habis ditandai requires_resolution=true sampai Admin memutuskan tindak lanjut beralasan; unique active_guard tetap mencakup request ini. Job penutupan hak memeriksa flag tersebut, bukan hanya statusREQUESTED, agar EXPIRED teknis tidak menyebabkan pelepasan hak diam-diam.
Admin dapat membuka kembali pemilihan pada request yang sama dengan kelayakan awal, mengembalikan ke jadwal lama jika masih sah, atau menutup setelah pengajuan dibatalkan/ditolak beralasan dan tidak ada layanan. Setiap keputusan mencatat event dan mematikan flag hanya sesudah guard terpenuhi. Tidak ada pemindahan slot/penutupan uang dari perubahan flag saja.
## Function dan route web
requestReschedule, reviewRequest, selectSlot, applyRequest, resolveRequest. POST /admin/reschedule-requests/{id}/resolve; POST /appointments/{id}/reschedule-requests; POST /admin/reschedule-requests/{id}/approve, /reject, /apply; PATCH /reschedule-requests/{id}/selection.
Target path relatif root domain memakai route web/session Laravel. Kontrak props/form/JSON pendukung dan daftar route yang sudah dibuat ada di [WEB_CONTRACT](../WEB_CONTRACT.md). Kode409/422 di uraian fitur adalah kondisi domain/JSON; form Inertia memetakannya ke redirect/errors sesuai kontrak.
## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Perubahan row_version karena pembayaran tidak membatalkan eligibility yang dibekukan saat submit. Apply memeriksa interval+attempt belum diganti, memuat row_version terbaru, dan tetap mengecek slot/kuota di bawah lock; payload stale mendapat409 tanpa menghilangkan hak pengajuan.
- Submit pukul11:00 untuk sesi14:00 tetap eligible meski Admin memproses15:00.
- NO_SHOW lalu apply menghasilkan jadwal aktif, event lama tetap ada, base charge tidak berulang.
- Pembayaran DP terverifikasi tidak berubah menjadi pending hanya karena reschedule.
- Slot lama tersedia lagi setelah apply, tidak sebelum apply.
## Hubungan fitur
F05 okupansi, F06 lifecycle, F08 ledger, F10 kedatangan.

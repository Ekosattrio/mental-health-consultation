# F11 — Rencana psikoterapi
> Keputusan developer: pilihan B. Pasien dapat langsung booking sesi psikoterapi pertama; sistem membuat rangkaian administratif awal empat unit bersamaan dengan satu appointment dan satu tagihan sesi pertama. Tidak ada prasyarat approval atau pembuatan rencana manual oleh Superadmin untuk booking pertama.

Label yang lebih jelas untuk pengguna adalah “Rangkaian Sesi Psikoterapi”: pengelompokan jadwal/tagihan sesi. Isi/tujuan/metode klinis tetap kewenangan praktisi, bukan hasil otomatis dari minimum4unit administratif.
## Latar belakang dan tujuan
Mengelompokkan minimum empat sesi psikoterapi sambil tetap menagih per sesi, bukan bundle otomatis.
## Aktor dan authorization
Pasien memulai rangkaian administratif melalui booking pertama. Superadmin menentukan tujuan/metode klinis, perubahan target, perpanjangan dan penghentian. Admin menjadwalkan lanjutan sesuai arahan praktisi dan kesepakatan pasien; pasien melihat jadwal/tagihan sendiri. Isi clinical_objective tidak masuk DTO Admin. Pembuatan administratif otomatis tidak mengisi diagnosis/clinical_objective atau menyimpulkan kebutuhan terapi secara klinis.
## Kolom/isian dan validasi
patient_id, package_id kategori PSYCHOTHERAPY, planned_sessions >=4 awal; status ACTIVE/COMPLETED/DISCONTINUED; clinical_objective opsional khusus owner; appointment mempunyai treatment_plan_id dan session_number positif untuk unit dalam plan; unique plan_session_guard hanya untuk unit yang belum dilepas. planned_sessions adalah jumlah unit sesi dalam rencana, bukan jumlah layanan yang sudah diberikan. completed_sessions hanya appointment COMPLETED; resolved_sessions adalah unit COMPLETED atau CLOSED_UNSERVED berkomitmen yang hak layanannya berakhir, hanya yang unitnya belum dilepas, masing-masing sekali. Keduanya derived, bukan input bebas. UI memisahkan “dilayani”, “ditutup tanpa layanan”, dan “belum dipesan”.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Pasien memilih paket Psikoterapi, jadwal, profiling dan consent pada wizard F06. Preview menampilkan harga/DP/deadline sesi pertama serta keterangan rangkaian awal empat unit yang dibayar per sesi.
2. POST /appointments membuat plan ACTIVE dengan planned_sessions=4, clinical_objective=null, praktisi tunggal dari konfigurasi server, lalu appointment session_number=1, billing account dan invoice sesi pertama dalam satu transaction. Semua validasi/lock slot dan pembayaran F06 tetap berlaku. Preview tidak membuat plan. Kegagalan transaction tidak meninggalkan plan tanpa booking. Admin assisted/walk-in dapat memulai lewat alur yang sama sesuai izin F06.
   Jika ada plan ACTIVE untuk patient_id dan package_id yang sama, jangan membuat plan kedua: arahkan sesi berikutnya ke Admin melalui endpoint scheduleSession. Pasien tidak perlu mengulang wizard pertama. Jika rangkaian sebelumnya sudah COMPLETED/DISCONTINUED, kebutuhan berikutnya ditinjau owner untuk extend atau membuat rangkaian baru eksplisit; wizard tidak membuat rangkaian baru untuk melewati batas sesi. Owner tetap dapat menyiapkan rangkaian manual untuk kebutuhan operasional, tanpa menjadikannya prasyarat seluruh pasien.
3. Setiap sesi baru mempunyai session_number dan snapshot harga katalog saat booking.
4. No-show yang di-reschedule adalah usaha baru sesi yang sama: session_number/tagihan tidak berulang, attempt_number bertambah.
5. Setelah seluruh unit rencana selesai/ditutup, owner meninjau lalu menandai COMPLETED administratif atau memperpanjang kebutuhan. Sistem tidak menyimpulkan keberhasilan klinis dari no-show. session_number tidak boleh melebihi planned_sessions; sesi5 perlu extend ke setidaknya5. Unit berbayar yang ditutup tetap terpakai/resolved, tidak ditagih ulang. Reservasi batal/expired tanpa uang dan tanpa layanan melepas unit dengan plan_unit_released_at; booking baru dapat memakai nomor unit itu dengan appointment/billing baru, sedangkan invoice reservasi lama sudah ditutupnet0. Ini mencegah empat hold gagal menghabiskan rencana terapi tanpa satu layanan pun.
6. Jika pasien berhenti setelah dua sesi, owner DISCONTINUED dengan alasan. Dua sesi belum dipesan tidak menjadi utang. Booking aktif lain harus diberi keputusan masing-masing; discontinue tidak otomatis membatalkannya.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Booking pertama / pasien atau Admin | kategori sah, belum ada rangkaian paket itu | ACTIVE empat unit + appointment sesi1 + invoice sesi1, atomik |
| Create manual / owner | kategori sah, tidak ada plan ACTIVE pasangan pasien/paket | ACTIVE, target minimal4; belum ada invoice sebelum sesi dipesan |
| Schedule / Admin | ACTIVE, session_number belum terpakai | appointment + invoice sesi |
| Complete plan / owner | seluruh unit resolved, tanpa booking aktif menggantung | COMPLETED administratif; completed_sessions tetap jumlah layanan nyata |
| Extend / owner | ACTIVE/COMPLETED | target bertambah + ACTIVE, audit |
| Stop / owner | ACTIVE | DISCONTINUED; daftar booking aktif perlu penyelesaian |
## Alur gagal dan pemulihan
Retry scheduling session_number sama mengembalikan appointment sama untuk idempotency key sama; request berbeda ditolak409. Retry booking pertama dengan key/payload sama mengembalikan plan/appointment/invoice semula. Dua permintaan berbeda bersamaan tidak membuat dua plan ACTIVE: unique active_plan_guard pada pasangan pasien/paket dan pemeriksaan ulang transaksi menjadi pengaman. Konflik menghasilkan409 TREATMENT_PLAN_EXISTS dan arahan hubungi Admin, bukan mengubah request menjadi sesi2 diam-diam. Rangkaian sebelumnya terminal menghasilkan409 TREATMENT_PLAN_REVIEW_REQUIRED; owner menentukan extend/rangkaian baru. Paket Asesmen tidak boleh memiliki treatment_plan. Harga plan lama tidak dipakai untuk menimpa sesi baru tanpa janji harga eksplisit.
## Function dan route web
createFirstBookingWithPlan melalui POST /appointments; createPlan, scheduleSession, extendPlan, completePlan, discontinuePlan, getProgress. POST /superadmin/treatment-plans/{id}/complete untuk review penutupan owner; POST /superadmin/treatment-plans untuk rangkaian manual; POST /admin/treatment-plans/{id}/sessions untuk lanjutan; POST /superadmin/treatment-plans/{id}/extend, /discontinue. ID plan/nomor sesi pertama/target otomatis ditetapkan server, bukan input bebas pasien.
Target path relatif root domain memakai route web/session Laravel. Kontrak props/form/JSON pendukung dan daftar route yang sudah dibuat ada di [WEB_CONTRACT](../WEB_CONTRACT.md). Kode409/422 di uraian fitur adalah kondisi domain/JSON; form Inertia memetakannya ke redirect/errors sesuai kontrak.
## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Pasien baru memesan sesi1 Rp500.000 -> satu plan empat unit, satu appointment, satu invoice Rp500.000; tidak ada invoice atau jadwal otomatis untuk sesi2–4 dan tidak ada utang Rp2.000.000.
- Klik ulang dengan key sama tidak menggandakan data. Dua submit berbeda untuk pasien/paket sama hanya menghasilkan satu rangkaian ACTIVE; slot gagal tidak meninggalkan plan yatim.
- Lanjutan dijadwalkan Admin. Auto-create tidak mengisi keputusan klinis dan tidak melewati extend sesi5.
- Reservasi unit1 expired tanpa uang -> unit dilepas, tidak menaikkan completed/resolved. Booking berikutnya dapat mengisi unit1; tidak terblokir unique lama atau otomatis memaksa extend.
- Contoh4unit:3COMPLETED dan1CLOSED_UNSERVED menampilkan3layanan nyata,1unit ditutup. Owner dapat menyelesaikan rencana atau extend ke5untuk kebutuhan berikutnya; sesi baru ditagih sendiri, invoice/unit lama tetap.
- Sesi1 dan2 mempunyai dua invoice terpisah; sesi3/4 yang belum dipesan tidak memiliki invoice.
- Sesi5 hanya setelah extend, harga baru disnapshot tanpa mengubah sesi1.
- No-show tidak menaikkan completed_sessions.
## Hubungan fitur
F04 paket, F06 booking, F08 billing, F09 recovery.

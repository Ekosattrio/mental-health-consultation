# F11 - Rangkaian Sesi Psikoterapi

Aturan terbaru: [keputusan aktif24 Oktober 2026](../KEPUTUSAN_AKTIF_2026-10-24.md). Ini kontrak target backend, bukan klaim seluruh preview telah dimigrasikan.

## Latar Belakang dan Tujuan
Mengelompokkan empat sesi awal tanpa menagih sesi yang belum dipesan. Harga Rp500.000 per sesi; bukan wajib membeli bundle Rp2.000.000 di awal. Keputusan terbaru memperbolehkan prabayar penuh empat sesi atau cicilan, wajib lunas pada hari sesi terakhir. Snapshot tarif disepakati pada awal rangkaian baru. Detail [alokasi dan pelunasan](../ALUR_PEMBAYARAN_SESI.md).

## Aktor dan Authorization
Pasien memulai melalui booking pertama. Admin menjadwalkan sesi berikutnya menurut arahan psikolog dan kesepakatan pasien. Psikolog menentukan isi/tujuan klinis dan penutupan rencana. DTO Admin tidak membawa clinical_objective, saldo atau agregat penerimaan. Admin mengikuti hak operasional Desman dengan policy server.

## Kolom dan Validasi
- planned_sessions tetap 4, ditetapkan server; tidak dapat ditambah lewat form atau endpoint extend.
- status ACTIVE/AWAITING_SETTLEMENT/COMPLETED/DISCONTINUED; session_number hanya 1..4. clinical_objective khusus praktisi.
- Satu plan ACTIVE/AWAITING_SETTLEMENT per pasien/paket. Unique active_plan_guard dan plan_session_guard mencegah duplikasi.
- completed_sessions hanya layanan COMPLETED. Cancel/no-show bukan completed; tampil terpisah dari sesi belum dipesan.
- Tagihan per sesi yang benar-benar dipesan. Sesi pertama memakai initial_payment_policy_snapshot; sesi lanjutan 0 setelah DP awal terverifikasi.
- Minimum awal 0 pada lanjutan bukan berarti invoice sudah lunas. Saldo tetap dihitung per billing/ledger.
- Semua jadwal sesuai batas kalender F05, slot valid, tanpa overlap, kuota tersedia, expected_version dan idempotency wajib.

## Alur Normal
1. Pasien memilih psikoterapi, jadwal sesuai batas kalender F05, profiling dan consent. Preview menampilkan tarif per sesi, empat sesi awal, minimum awal dari konfigurasi dan total sesi pertama; default minimum50% pada500.000 adalah250.000, dengan sisa250.000.
2. POST /appointments secara atomik membuat plan ACTIVE empat unit, appointment sesi1, billing dan invoice500.000. Preview tidak menulis data. Kegagalan rollback seluruhnya; retry key/payload sama mengembalikan resource semula.
3. Admin memverifikasi nominal aktual. Minimum default50% sesi pertama500.000 adalah250.000; uang itu mengurangi tagihan, bukan biaya tambahan atau DP baru per sesi.
4. Setelah sesi sebelumnya selesai, Admin menyepakati jadwal sesuai batas kalender F05 untuk sesi berikutnya. Buat satu appointment/invoice500.000 sesi itu saja; tidak meminta DP/bukti awal baru. Pembayaran pelunasan tetap boleh dicatat menurut kesepakatan dengan praktisi.
5. Reschedule/no-show recovery memakai appointment, session_number dan billing yang sama. Tidak membuat invoice dasar atau DP kedua. Periksa versi terbaru agar form lama tidak menimpa jadwal baru.
6. Setelah empat sesi benar-benar selesai dan seluruh tagihan sah lunas, plan dapat ditutup administratif. Bila belum lunas, fakta pertemuan tetap selesai tetapi finansial Menunggu pelunasan; tidak boleh menganggap layanan selesai dan lunas atau memesan ulang paket yang sama untuk melewati sisa. Bila masih diperlukan terapi setelah penutupan sah, pasien booking kembali memakai plan/ledger baru dan minimum awal konfigurasi baru. Catatan klinis dapat merujuk rangkaian terdahulu; plan lama tidak mendapat sesi5.

## Status dan Transisi
| Aksi | Guard | Hasil |
|---|---|---|
| Booking pertama | tidak ada plan ACTIVE/AWAITING_SETTLEMENT, slot sesuai batas kalender F05 sah | plan4 + sesi1 + invoice sesi1 atomik |
| Jadwalkan lanjutan | ACTIVE, sesi sebelumnya selesai, DP awal verified, belum ada sesi berikutnya, nomor <=4 | satu appointment/invoice baru, DP0 |
| Selesai rencana | empat sesi COMPLETED, tidak ada appointment aktif, seluruh tagihan sah lunas | selesai administratif; bukan klaim keberhasilan klinis |
| Sesi terakhir selesai belum lunas | fakta pertemuan tetap COMPLETED | plan AWAITING_SETTLEMENT; pembayaran tetap dapat dicatat |
| Hentikan/batalkan | bagian belum diberikan ditetapkan dan adjustment sah, alasan/versi valid | sisa appointment CANCELLED + plan DISCONTINUED; kas/completed tetap |
| Booking kembali | plan sebelumnya terminal, tidak ada ACTIVE/AWAITING_SETTLEMENT lain | plan baru empat unit dan ledger/DP awal baru |

## Alur Gagal dan Pemulihan
- ACTIVE sudah ada:409 TREATMENT_PLAN_EXISTS, arahkan ke jadwal lanjutan Admin; jangan membuat plan kedua.
- Sesi5 pada plan lama:422 SESSION_LIMIT_REACHED, arahkan booking rangkaian baru setelah penutupan sah.
- Pembatalan sebelum layanan tidak menagih sisa yang belum diberikan. Owner menentukan cakupan belum diberikan jika sebagian telah dilayani; kas terverifikasi tidak dihapus.
- Cancel/discontinue membatalkan semua sisa layanan pada rangkaian terkait, mempertahankan completed, histori dan rangkaian lain. Sesi belum dipesan tidak dibuatkan utang demi pelunasan.
- Expiry hold teknis bukan pembatalan otomatis layanan berbayar. Bukti/uang terlambat masuk rekonsiliasi, tidak merebut slot.
- Duplikasi/slot bentrok/versi lama menggagalkan transaction. Koreksi data legacy harus eksplisit; jangan mengubah harga/tagihan lama diam-diam.

## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /admin/appointments/{appointment}/next | BookingController@next |
| POST | /superadmin/treatment-plans/{plan}/{action} | ClinicalAdministrationController@planAction |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, Audit dan Notifikasi
Lock resource hari -> plan -> appointment/request -> billing secara konsisten. Lock seluruh invoice cakupan sebelum menentukan bagian belum diberikan dan menerbitkan adjustment. Actor/waktu/nomor sesi ditetapkan server. Simpan alasan, versi, jadwal sebelum/sesudah dan event; outbox hanya sesudah commit. Jangan menyalin seluruh jawaban klinis ke audit.

## Acceptance Criteria
Contoh DP 100000 berikut adalah simulasi mode FIXED opsional. Default PERCENT50% pada sesi500000 adalah250000.
- Booking pertama500.000, DP100.000 verified -> sisa400.000; tidak ada utang sesi2-4.
- Booking sesi2 -> invoice500.000, DP0; DP sesi1 tidak dihitung ulang pada sesi2.
- Sebelum layanan dimulai, tagihan500000 dengan kas100000 dapat ditutup dengan adjustment pelepasan400000; penerimaan100000 tetap utuh, bukan receipt baru.
- Cancel hanya menghentikan cakupan plan terkait; completed/receipt/kas dan plan lain tetap.
- Empat sesi selesai -> plan baru saat booking ulang, DP awal baru; sesi5 plan lama selalu ditolak.
- Retry tidak menduplikasi; dua submit paralel hanya menghasilkan satu plan ACTIVE.
- Reschedule semua role sesuai batas kalender F05, tanpa DP baru; form stale ditolak.

## Hubungan Fitur
F04 katalog, F06 booking, F08 ledger, F09 reschedule, F10 lifecycle. Preview LocalStorage menagih per sesi untuk booking baru dengan billingMode=PER_SESSION; record lama mempertahankan ledger gabungan. Policy/transaction/database server tetap target backend.

## Guard penutupan dan struktur DB24 Oktober
Status plan ACTIVE/AWAITING_SETTLEMENT/COMPLETED/DISCONTINUED. Empat pertemuan selesai tetapi kewajiban sah belum tertutup menghasilkan AWAITING_SETTLEMENT; jangan menyimpan COMPLETED lalu hanya menyamarkannya pada UI. ACTIVE dan AWAITING_SETTLEMENT sama-sama memakai unique active_plan_guard pasien+paket. COMPLETED menandai layanan resolved dan administrasi selesai, bukan mengarang penerimaan.
Pembatalan sebelum layanan melepaskan bagian belum diberikan melalui adjustment; uang nyata tetap. Sebagian layanan diberikan: owner menentukan cakupan belum diberikan, bukan menghapus seluruh kewajiban. Minimum empat sesi tidak menagih sesi belum dipesan. PaymentAgreement menyimpan kesepakatan dan anchor, PaymentAllocation menaut penerimaan ke invoice per sesi tanpa kas kedua. Penjadwalan lanjutan tetap oleh Admin pada slot sah; tidak ada controller extend pada tahap ini.

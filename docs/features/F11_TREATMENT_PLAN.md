# F11 - Rangkaian Sesi Psikoterapi

Aturan terbaru: [keputusan final 22 Oktober 2026](../KEPUTUSAN_FINAL_2026_10_22.md). Ini kontrak target backend, bukan klaim seluruh preview telah dimigrasikan.

## Latar Belakang dan Tujuan
Mengelompokkan empat sesi awal tanpa menagih sesi yang belum dipesan. Harga Rp500.000 per sesi; bukan pembelian bundle Rp2.000.000 di awal.

## Aktor dan Authorization
Pasien memulai melalui booking pertama. Admin menjadwalkan sesi berikutnya menurut arahan psikolog dan kesepakatan pasien. Psikolog menentukan isi/tujuan klinis dan penutupan rencana. DTO Admin tidak membawa clinical_objective, saldo atau agregat penerimaan. Admin mengikuti hak operasional Desman dengan policy server.

## Kolom dan Validasi
- planned_sessions tetap 4, ditetapkan server; tidak dapat ditambah lewat form atau endpoint extend.
- status ACTIVE/COMPLETED/DISCONTINUED; session_number hanya 1..4. clinical_objective khusus praktisi.
- Satu plan ACTIVE per pasien/paket. Unique active_plan_guard dan plan_session_guard mencegah duplikasi.
- completed_sessions hanya layanan COMPLETED. Cancel/no-show bukan completed; tampil terpisah dari sesi belum dipesan.
- Tagihan per sesi yang benar-benar dipesan. Sesi pertama required_initial_amount=min(100000,dasar_net); sesi lanjutan 0 setelah DP awal terverifikasi.
- Minimum awal 0 pada lanjutan bukan berarti invoice sudah lunas. Saldo tetap dihitung per billing/ledger.
- Semua jadwal minimal H+1 WIB, slot valid, tanpa overlap, kuota tersedia, expected_version dan idempotency wajib.

## Alur Normal
1. Pasien memilih psikoterapi, jadwal H+1, profiling dan consent. Preview menampilkan tarif per sesi, empat sesi awal, DP100.000 dan sisa sesi pertama400.000.
2. POST /appointments secara atomik membuat plan ACTIVE empat unit, appointment sesi1, billing dan invoice500.000. Preview tidak menulis data. Kegagalan rollback seluruhnya; retry key/payload sama mengembalikan resource semula.
3. Admin memverifikasi DP aktual. Rp100.000 mengurangi tagihan sesi pertama, bukan biaya di luar layanan dan bukan DP baru per sesi.
4. Setelah sesi sebelumnya selesai, Admin menyepakati jadwal H+1 untuk sesi berikutnya. Buat satu appointment/invoice500.000 sesi itu saja; tidak meminta DP/bukti awal baru. Pembayaran pelunasan tetap boleh dicatat menurut kesepakatan dengan praktisi.
5. Reschedule/no-show recovery memakai appointment, session_number dan billing yang sama. Tidak membuat invoice dasar atau DP kedua. Periksa versi terbaru agar form lama tidak menimpa jadwal baru.
6. Setelah empat sesi benar-benar selesai, plan dapat ditutup administratif. Bila masih diperlukan terapi, pasien booking kembali memakai plan/ledger baru dan DP awal100.000 baru. Catatan klinis dapat merujuk rangkaian terdahulu; plan lama tidak mendapat sesi5.

## Status dan Transisi
| Aksi | Guard | Hasil |
|---|---|---|
| Booking pertama | tidak ada plan ACTIVE, slot H+1 sah | plan4 + sesi1 + invoice sesi1 atomik |
| Jadwalkan lanjutan | ACTIVE, sesi sebelumnya selesai, DP awal verified, belum ada sesi berikutnya, nomor <=4 | satu appointment/invoice baru, DP0 |
| Selesai rencana | empat sesi COMPLETED, tidak ada appointment aktif | COMPLETED; bukan klaim keberhasilan klinis |
| Hentikan/batalkan | seluruh tagihan sah yang telah terbentuk lunas, alasan dan versi valid | seluruh sisa appointment terkait CANCELLED + plan DISCONTINUED atomik |
| Booking kembali | plan sebelumnya terminal, tidak ada ACTIVE lain | plan baru empat unit dan ledger/DP awal baru |

## Alur Gagal dan Pemulihan
- ACTIVE sudah ada:409 TREATMENT_PLAN_EXISTS, arahkan ke jadwal lanjutan Admin; jangan membuat plan kedua.
- Sesi5 pada plan lama:422 SESSION_LIMIT_REACHED, arahkan booking rangkaian baru setelah penutupan sah.
- Masih ada saldo pada invoice terbentuk:409 PAYMENT_REQUIRED_BEFORE_CANCELLATION; tidak menghapus sisa melalui adjustment.
- Cancel/discontinue membatalkan semua sisa layanan pada rangkaian terkait, mempertahankan completed, histori dan rangkaian lain. Sesi belum dipesan tidak dibuatkan utang demi pelunasan.
- Expiry hold teknis bukan pembatalan otomatis layanan berbayar. Bukti/uang terlambat masuk rekonsiliasi, tidak merebut slot.
- Duplikasi/slot bentrok/versi lama menggagalkan transaction. Koreksi data legacy harus eksplisit; jangan mengubah harga/tagihan lama diam-diam.

## Function dan Route Web
createFirstBookingWithPlan: POST /appointments; scheduleSession: POST /admin/treatment-plans/{id}/sessions; completePlan: POST /superadmin/treatment-plans/{id}/complete; discontinuePlan: POST /superadmin/treatment-plans/{id}/discontinue; getProgress: GET /treatment-plans/{id}.
Tidak ada route extend atau mutasi target menjadi lebih dari4. Pembuatan manual bila diperlukan juga tetap4 dan memeriksa unique ACTIVE. Semua route bisnis ini target; cek [WEB_CONTRACT](../WEB_CONTRACT.md) untuk batas scaffold yang benar-benar tersedia.

## Data, Audit dan Notifikasi
Lock resource hari -> plan -> appointment/request -> billing secara konsisten. Lock seluruh invoice cakupan pembatalan sebelum memeriksa lunas. Actor/waktu/nomor sesi ditetapkan server. Simpan alasan, versi, jadwal sebelum/sesudah dan event; outbox hanya sesudah commit. Jangan menyalin seluruh jawaban klinis ke audit.

## Acceptance Criteria
- Booking pertama500.000, DP100.000 verified -> sisa400.000; tidak ada utang sesi2-4.
- Booking sesi2 -> invoice500.000, DP0; DP sesi1 tidak dihitung ulang pada sesi2.
- Dua sesi telah dipesan total1.000.000, bayar600.000 -> cancel ditolak sampai sisa400.000 lunas, bukan menagih sesi3-4.
- Setelah lunas, cancel menghentikan semua sisa plan itu, bukan plan lain; completed dan receipt tetap.
- Empat sesi selesai -> plan baru saat booking ulang, DP awal baru; sesi5 plan lama selalu ditolak.
- Retry tidak menduplikasi; dua submit paralel hanya menghasilkan satu plan ACTIVE.
- Reschedule semua role minimal H+1, tanpa DP baru; form stale ditolak.

## Hubungan Fitur
F04 katalog, F06 booking, F08 ledger, F09 reschedule, F10 lifecycle. Preview LocalStorage menagih per sesi untuk booking baru dengan billingMode=PER_SESSION; record lama mempertahankan ledger gabungan. Policy/transaction/database server tetap target backend.

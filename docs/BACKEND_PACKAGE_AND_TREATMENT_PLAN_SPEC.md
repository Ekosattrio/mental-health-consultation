# Spesifikasi kategori dan rangkaian layanan
Sumber aktif: [F04 katalog](features/F04_PACKAGE_CATALOG.md), [F08 tagihan](features/F08_PAYMENT_LEDGER.md), [F11 psikoterapi](features/F11_TREATMENT_PLAN.md), [F18 asesmen](features/F18_ASSESSMENT_CASE.md).
## Model
COUNSELING: satu appointment satu billing account. Additional time25%/15menit hanya kategori ini; akumulasi per usaha sesi. Laporan permintaan200000.
ASSESSMENT: satu case satu billing account dan BASE_SERVICE; banyak appointment TESTING/EVALUATION/FOLLOW_UP sesuai scope. Semua termasuk hasil laporan yang boleh diserahkan offline. Tidak otomatis membuat treatment plan.
PSYCHOTHERAPY: pilihan B; booking pertama membuat plan administratif ACTIVE4unit beserta appointment/billing/invoice sesi1 atomik, tanpa prasyarat plan manual/approval. 500000/sesi; satu appointment satu billing account. Belum dipesan tidak ditagih/terjadwal. Sesi lanjutan diatur Admin sesuai praktisi. Satu ACTIVE per pasien/paket dengan unique active_plan_guard; retry sama tidak menggandakan. Plan sudah ada mengikuti F11; sesi5 perlu extend owner, bukan auto-create rangkaian baru.
## Relasi
case/plan diinsert sebelum appointment dalam transaction (urutan FK, bukan kewajiban manusia membuat plan lebih dahulu). Appointment mengacu keduanya secara eksklusif; billing_accounts mengacu appointment ATAU case, bukan FK balik ganda. Untuk pertemuan asesmen lanjutan, lookup billing melalui case tanpa membuat tagihan dasar baru.
session_number untuk unit belum dilepas unik melalui plan_session_guard; hold gagal tanpa uang/layanan melepas unit tanpa menghapus histori; assessment_sequence unik per case; attempt_number menandai usaha sesudah pindah jadwal tanpa menambah sesi berbayar.
## Referensi kontrak
Nama kolom/type/null/index hanya DATABASE_ARCHITECTURE.md; route/DTO hanya WEB_CONTRACT.md. Contoh kode/migration legacy di sini digantikan agar tidak menawarkan schema kedua.

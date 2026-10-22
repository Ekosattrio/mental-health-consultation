# Keputusan Final Integrasi - 22 Oktober 2026

Instruksi developer terbaru mengalahkan ketentuan berbeda pada dokumen Desman, prototype Eko, audit, dan lampiran historis. DP 50% tidak disetujui dalam integrasi ini.

## Aturan yang Ditetapkan

| Bagian | Keputusan final |
|---|---|
| Arsitektur | Laravel 13 + Inertia 3 + React, satu proyek/domain; MySQL 8. |
| DP | Flat Rp100.000, mengurangi kewajiban, bukan biaya tambahan/persentase. Jika biaya net lebih kecil, DP dibatasi biaya net. |
| Waktu DP | Sekali pada booking/rangkaian baru. Sesi lanjutan pada rangkaian yang sama dan reschedule tidak meminta DP, bukti, atau verifikasi awal baru. |
| Pelunasan hari terakhir | Boleh cicilan atau penuh di awal. Wajib lunas paling lambat hari pertemuan terakhir; fakta sesi selesai terpisah dari penutupan administratif. Rangkaian yang pertemuannya selesai tetapi belum lunas tampil Menunggu pelunasan. |
| Prabayar psikoterapi | Kesepakatan empat sesi dengan snapshot tarif per sesi; satu ledger penerimaan rangkaian dialokasikan berurutan tanpa kas ganda. Invoice tetap dibuat hanya untuk sesi dijadwalkan. Tidak ada dompet lintas booking/refund otomatis. Lihat [alur pembayaran](ALUR_PEMBAYARAN_SESI.md). |
| Petugas pembayaran | Operasional pembayaran pasien sepenuhnya Admin: memeriksa/verifikasi atau menolak bukti, mencatat penerimaan DP/cicilan/pelunasan serta koreksi berjejak. Psikolog memantau ledger/laporan, bukan petugas input/verifikasi pembayaran pasien. Aplikasi mencatat uang yang benar-benar diterima, bukan memindahkan uang atau payment gateway. Ini pembagian role, bukan kewajiban membayar penuh di awal. |
| Jadwal | Seluruh booking, reschedule dan sesi lanjutan minimal H+1 WIB, termasuk Admin/owner/walk-in. Tidak ada same-day atau exception yang melonggarkannya. Lead enam jam operasional pasien mengikuti Desman sebagai syarat tambahan, bukan pengganti H+1. |
| Psikoterapi | Rp500.000 per sesi, rangkaian awal empat sesi. Tagihan per sesi yang dipesan mengikuti Desman; sesi belum dipesan tidak otomatis menjadi utang. DP awal dikreditkan pada sesi pertama, bukan dihitung ulang/dipindahkan setiap sesi. |
| Setelah empat sesi | Pasien booking kembali sebagai rangkaian/transaksi baru. Tidak ada extend, tambah jatah, atau sesi kelima pada plan lama. Rangkaian baru mempunyai DP awal sendiri. |
| Sesi berikutnya | Admin menjadwalkan sesuai arahan praktisi dan kesepakatan pasien; tetap slot valid H+1 dan batas empat sesi. |
| Pre-test setiap konteks baru | Developer memilih konfirmasi/perbarui jawaban untuk setiap booking atau sesi baru karena konteks keluhan dapat berubah, termasuk saat memesan Konseling kembali. Jawaban lama boleh ditawarkan sebagai salinan, tetapi tidak otomatis dianggap jawaban terbaru. Simpan submission/snapshot baru per appointment tanpa menimpa histori. Reschedule sesi yang sama bukan booking/sesi baru dan tidak otomatis meminta pre-test ulang. |
| Pembatalan | Wajib melunasi seluruh tagihan sah yang sudah terbentuk pada cakupan pembatalan terlebih dahulu. Sesi belum dipesan tidak dibuatkan utang baru demi pembatalan. Tidak ada pelepasan/pemutihan sisa atau refund otomatis. |
| Cakupan batal | Menghentikan seluruh sisa layanan booking/rangkaian terkait. Appointment completed dan histori uang tetap; rangkaian lain tidak ikut batal. Discontinue tidak melewati syarat lunas. |
| Reschedule | Mengikuti Desman: maksimum tiga APPLIED asal pasien per appointment, normal sebelum dua jam menjelang sesi; setelah NO_SHOW dapat mengajukan sampai akhir WIB tanggal sesi + empat hari. Waktu pengajuan menentukan kelayakan. |
| Asal klinik/owner | Audit/alasan wajib; tidak memakai kuota pasien, tetapi tujuan tetap H+1. |
| Bukti ditolak | Mengikuti Desman: alasan penolakan, koreksi/unggah ulang berversi, SLA asal tidak reset. Tidak menghapus penerimaan VERIFIED. |
| Hak Admin | Mengikuti Desman: harga/diskon/total, CMS administratif, kalender, jadwal lanjutan, verifikasi dan lifecycle administratif termasuk complete/no-show/cancel dengan guard. Tidak saldo/agregat penerimaan, receipt penuh, klinis, atau laporan kas owner. |
| Scope lain | Asesmen, expense/surplus owner, tutorial, pasien tanggungan, Google Meet/Baileys, retensi dan dokumen mengikuti target Desman. Bukan klaim source/backend sudah tersedia. |

## Contoh

- Konseling Rp900.000: DP Rp100.000, sisa Rp800.000 setelah verifikasi. Bukan DP Rp450.000.
- Psikoterapi: sesi pertama Rp500.000, DP Rp100.000, sisa sesi pertama Rp400.000. Sesi kedua yang dipesan ditagih Rp500.000 tanpa DP baru. Jika empat sesi semuanya dipesan total Rp2.000.000; DP tetap satu kali Rp100.000.
- Setelah empat sesi selesai, booking berikutnya mempunyai plan/ledger baru dan DP awal Rp100.000 sendiri.
- Dua sesi sudah dipesan total Rp1.000.000, uang terverifikasi Rp600.000: pembatalan menunggu pelunasan Rp400.000. Dua sesi belum dipesan tidak ditambahkan sebagai utang.
- Expiry teknis hold/jendela bukan pelunasan dan tidak boleh memutihkan sisa tagihan layanan yang telah terbentuk atau membatalkan layanan berbayar otomatis. Bukti/uang terlambat tetap direkonsiliasi.

## Batas Implementasi

- Fondasi web dan preview adalah jalur berbeda. Backend bisnis masih target; jangan memindahkan transaksi LocalStorage ke database secara otomatis.
- Preview Eko kini menagih per sesi untuk psikoterapi baru dan mempertahankan ledger gabungan pada record lama tanpa billingMode. Menu Admin, request pasien/review Admin, koreksi proof dan pemilihan ulang SLOT_SELECTION_REQUIRED sudah tersedia. Fase APPROVED/selection-window penuh, clock operasional6/12/24jam, DTO/ledger/policy server dan domain lain masih target backend; tidak otomatis selesai karena docs disepakati. Lihat [perbaikan audit FE](PERBAIKAN_AUDIT_FE_2026_10_22.md).
- DP flat, H+1, pembatalan setelah lunas, larangan sesi kelima dan guard versi/slot dipertahankan pada preview. Tagihan legacy tidak diubah diam-diam.
- Perbaikan isi/letak file tidak menandai index Git resolved. Staging/commit/push tetap developer; agent tidak menjalankan Git.

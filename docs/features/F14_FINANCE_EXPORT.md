# F14 — Laporan kas dan export jadwal
## Latar belakang dan tujuan
Memisahkan laporan keuangan owner dari kebutuhan Admin mengunduh jadwal; periode kas tidak mengikuti tanggal konsultasi.
## Aktor dan authorization
Superadmin melihat kas masuk, pengeluaran, surplus dan export finansial. Admin/Superadmin export jadwal operasional. Pasien hanya dokumen miliknya. Export bukan cara melewati authorization.
## Kolom/isian dan validasi
Filter wajib rentang tanggal dan timezone WIB; finance berdasarkan received_at/expense_date, status VERIFIED, as_of. Jadwal berdasarkan start_at, status, pasien/paket opsional. Kolom jadwal: tanggal, jam, nama pasien, paket, kontak, status booking, status pembayaran administratif; tanpa saldo/keluhan. Export request menyimpan filters, requested_by, kind, as_of, dataset_snapshot dan expires_at; nama kolom mengikuti export_jobs, bukan requester/type/file_expiry sebagai kolom terpisah.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Owner memilih periode penerimaan; server menjumlah ledger VERIFIED plus koreksi berjejak.
2. Gabungkan pengeluaran sah F19; surplus adalah kas bersih masuk dikurangi pengeluaran.
3. Setiap baris menautkan payment/expense ID dan appointment/case berizin.
4. Verifikasi terlambat diberi marker late_verified; laporan dapat direvisi dengan as_of baru, export terbit tidak diubah.
5. Export jadwal Admin memakai DTO khusus administratif, bukan dataset finance. Export mengambil seluruh hasil filter, tidak hanya halaman UI.
6. as_of adalah cutoff data, bukan sekadar judul: sertakan hanya penerimaan/reversal VERIFIED dengan verified_at<=as_of dan expense/reversal dengan created_at<=as_of, tetap memfilter periode received_at/expense_date. Reversal yang baru dibuat sesudah cutoff tidak masuk laporan lama. Identitas transaksi memakai snapshot dokumen, bukan nama profil terkini.
7. Saat request export, consistent read membekukan dataset hasil filter+role dalam export_jobs.dataset_snapshot dan as_of. Worker hanya memformat snapshot itu; tidak mengambil ulang jadwal/nama/status hidup beberapa menit kemudian. File/data snapshot tidak masuk DTO umum atau log dan tidak mengalahkan pengecekan akses saat download.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Request export / berizin | filter valid | QUEUED atau READY untuk kecil |
| Generate / worker | QUEUED | READY + private file |
| Expire / job | file melewati file_expiry | EXPIRED; metadata tetap |
| Revision / owner | data kas dikoreksi | laporan versi/as_of baru, file lama immutable |
## Alur gagal dan pemulihan
Rentang terlalu besar ditangani async/batas operasional. Job gagal menjadi FAILED dengan retry. Data pengguna lain tidak boleh masuk dari filter patient_id bebas. XLSX/CSV menetralkan formula injection pada nama/catatan.
## Function dan route web
cashSummary, cashTransactions, exportFinance, exportSchedule. GET /superadmin/finance; POST /superadmin/finance/exports; POST /admin/schedule-exports; GET /exports/{id}/download.
Target path relatif root domain memakai route web/session Laravel. Kontrak props/form/JSON pendukung dan daftar route yang sudah dibuat ada di [WEB_CONTRACT](../WEB_CONTRACT.md). Kode409/422 di uraian fitur adalah kondisi domain/JSON; form Inertia memetakannya ke redirect/errors sesuai kontrak.
## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- DP Oktober untuk sesi November tetap Oktober setelah dipindah Desember.
- Bukti Oktober yang baru diverifikasi November masuk laporan Oktober dengan marker revisi dan tautan transaksi.
- Admin tidak bisa memanggil endpoint finance, meski boleh export jadwal.
## Hubungan fitur
F08 ledger, F19 expense, F15 private export.

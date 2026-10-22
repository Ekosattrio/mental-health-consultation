# Perbaikan Audit FE - 22 Oktober 2026

Kelanjutan atas permintaan developer untuk mengerjakan TODO frontend. Sumber pekerjaan: AUD-01 sampai AUD-06 di [TODO](TODO.md). Perubahan berlaku pada FE preview lokal, bukan implementasi transaksi Laravel/database.

## Cakupan

AUD-02, AUD-03, AUD-04, AUD-05 dan AUD-06 diperbaiki di preview. AUD-01 belum selesai: Dashboard aplikasi utama masih placeholder. Preview tidak dibuka ke produksi dan mutasi mock tidak dipasang sebagai fallback database.

## Pembayaran Aktual

1. Admin membuka Verifikasi Bukti Pembayaran dan memeriksa bukti/pengirim.
2. Admin memasukkan nominal aktual serta tanggal uang diterima; nominal tidak otomatis diisi dengan biaya layanan atau DP yang diharapkan.
3. Setelah verifikasi, penerimaan awal disimpan. Rp1/Rp99.999 tetap tercatat sebagai uang masuk tetapi tidak memenuhi DP Rp100.000; booking tetap PENDING.
4. Admin mencatat kekurangan melalui Catat pembayaran. Minimum yang terpenuhi mengonfirmasi booking; hanya seluruh kewajiban terpenuhi yang menghasilkan PAID.
5. DP dibatasi biaya bersih jika lebih kecil dari Rp100.000. Layanan tanpa tagihan tidak menghasilkan penerimaan fiktif. Ini tidak menambah fitur diskon gratis pada katalog.
6. Bukti/penerimaan yang terverifikasi tidak ditimpa. Kwitansi dan progres pembayaran memakai jumlah aktual, bukan menganggap DP sudah diterima penuh.

Nominal sebelumnya tidak ditampilkan ulang pada input verifikasi Admin. Ringkasan kas/saldo lengkap tetap milik pasien berwenang dan psikolog; perlindungan data sesungguhnya memerlukan DTO/authorization backend.

## Penerimaan Setelah Lunas

Aksi Catat pembayaran tetap tersedia untuk tagihan yang lunas. Transfer nyata kedua dicatat sebagai penerimaan baru walaupun nominal/tanggal/metodenya sama dengan transfer pertama. Uang yang benar-benar masuk tidak dibuang hanya karena status tagihan sudah PAID.

Setiap pembukaan form pencatatan mendapat idempotency key baru; retry pada form yang sama menggunakan key yang sama. Key sama dan payload sama tidak menggandakan ledger. Key sama dengan payload berbeda ditolak. Identitas operasi bukan nomor referensi bank dan bukan input tambahan pasien.

Penerimaan tambahan tidak mengubah layanan CANCELLED/DISCONTINUED menjadi aktif. Nilai legacy yang dulu hanya tersirat pada status PAID dipertahankan ketika ledger penerimaan tambahan mulai digunakan. Selisih lebih bayar tetap diselesaikan di luar aplikasi; tidak ada refund, dompet atau kredit baru.

## Asal Reschedule

Pelaksana dan asal permintaan adalah dua data berbeda. Form petugas menyediakan asal PATIENT atau CLINIC/OWNER sesuai role. Perubahan atas permintaan pasien tetap memakai kuota maksimal tiga APPLIED dan batas waktu pasien, sekalipun Admin yang membantu. Perubahan klinik/pengelola tidak mengurangi kuota pasien tetapi wajib mempunyai alasan. Pasien tidak dapat mengirim asal klinik/pengelola.

Seluruh tujuan jadwal tetap H+1 WIB. Pembayaran, nomor sesi dan tagihan tidak dibuat ulang karena reschedule. Histori menyimpan pelaksana beserta asal perubahan.

## Pemilihan Ulang Slot

1. Request pasien berstatus REQUESTED; appointment masih menempati jadwal aktif.
2. Admin dapat memakai ikon kalender pada Pengajuan Reschedule untuk meminta pasien memilih ulang.
3. Persetujuan memeriksa ulang target dari request terbaru dalam lock workflow. Jika target telah diambil atau tanggalnya tidak lagi H+1, request berubah menjadi SLOT_SELECTION_REQUIRED, bukan ditolak final.
4. Pasien membuka Riwayat > Detail booking > reschedule, lalu memilih tujuan baru. ID dan requestedAt pertama tetap, sedangkan revision dan lastSubmittedAt diperbarui.
5. Admin memeriksa usulan terbaru. Versi appointment dan revisi request yang sudah berubah menggugurkan form/persetujuan lama.
6. Apply yang berhasil memindahkan sesi yang sama, menambah hitungan reschedule pasien satu kali dan mempertahankan DP. Penolakan/pemilihan ulang tidak mengurangi kuota.
7. Pembatalan layanan setelah lunas menutup request REQUESTED maupun SLOT_SELECTION_REQUIRED; request tidak dapat menghidupkan kembali layanan terminal.

Kelayakan pasien dibekukan pada requestedAt pertama: sebelum H-2 jam untuk request normal, atau sampai akhir tanggal sesi +4 hari WIB untuk NO_SHOW. Penanganan Admin yang terlambat tidak mengubah pengajuan tepat waktu menjadi pengajuan baru. Tidak ada auto-no-show/auto-cancel.

Subset preview ini belum memodelkan seluruh fase APPROVED dan selection-window terkonfigurasi pada kontrak target. Clock kalender operasional6/12/24jam, snapshot kalender, SLA, dan job notifikasi masih membutuhkan implementasi server. Mempertahankan requestedAt bukan klaim bahwa job SLA sudah berjalan.

## Kalender

Resolver tanggal bersama digunakan availability, ringkasan dan pemeriksaan konflik. Override eksplisit menggantikan status libur/mingguan; alasan membuka hari libur wajib diisi pada form dan pemeriksaan simpan kalender. Buka/tutup khusus tidak mengabaikan kapasitas, jam praktik, istirahat atau booking aktif. Ringkasan hari tutup memiliki nol menit operasional; istirahat tidak dihitung sebagai waktu tersedia.

## Berkas Utama

- [paymentWorkflow](../resources/js/utils/paymentWorkflow.ts): transisi penerimaan aktual dan idempotency.
- [payments](../resources/js/utils/payments.ts): kas terverifikasi dan laporan, termasuk DP kurang.
- [reschedulePolicy](../resources/js/utils/reschedulePolicy.ts): asal permintaan, revisi dan pemilihan ulang.
- [rescheduleApproval](../resources/js/utils/rescheduleApproval.ts): approval target terbaru dan pemulihan slot tidak tersedia.
- [AppContext](../resources/js/context/AppContext.tsx): wiring form ke transisi di bawah workflow lock lokal.
- [ReservationsTab](../resources/js/components/admin/tabs/ReservationsTab.tsx): input nominal aktual, penerimaan tambahan dan asal reschedule.
- [RescheduleRequestsTab](../resources/js/components/admin/tabs/RescheduleRequestsTab.tsx): permintaan pemilihan ulang dan review berversi.
- [RescheduleModal](../resources/js/components/patient/RescheduleModal.tsx): form pemilihan ulang dan guard form lama.
- [scheduleConfig](../resources/js/data/scheduleConfig.ts), [scheduleConflicts](../resources/js/utils/scheduleConflicts.ts): kebijakan tanggal yang sama.

## Verifikasi

`npm run lint` lolos. `npm test` 74/74 lolos: 71 tes FE dan tiga pemeriksaan sumber/import/lockfile. Tes baru mencakup nominal Rp1/Rp99.999/Rp100.000, biaya di bawah DP, penerimaan lebih, top-up tanpa verifikasi ulang, dua transfer nyata setelah PAID, retry paralel, storage gagal, batas kuota/waktu/asal, slot direbut, revisi usulan lama, approval paralel dan override libur.

Belum ada pengujian visual/E2E desktop/mobile atau integrasi database/provider. Dev server, build, migration, PHPUnit dan Git tidak dijalankan pada pengerjaan FE ini. Lulus tes lokal bukan jaminan keamanan produksi atau concurrency lintas perangkat.

## Handoff Backend

- Hitung kewajiban dan minimum DP dari snapshot server; terima uang aktual ke ledger append-only dengan authorization role/objek.
- Terapkan idempotency key secara persisten, payload hash dan lock transaksi; jangan mempercayai key/role/nominal/status yang dikirim FE.
- Simpan versi appointment serta revision request. Eligibility memakai requestedAt asli; perubahan tujuan tidak mereset deadline/SLA asal.
- Lock appointment, interval lama/baru dan kapasitas dalam transaksi yang sama sebelum apply; database tetap sumber kebenaran.
- Gunakan DTO Admin yang tidak membawa saldo atau ledger penuh. Preview LocalStorage bukan batas authorization.
- Selesaikan migrasi halaman utama dan fase/clock target sebelum menyatakan aplikasi siap operasional.

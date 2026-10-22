# Pekerjaan berikutnya

## Pelunasan Sesi Terakhir - 22 Oktober 2026
- [x] FE baru: DP sekali Rp100.000, boleh cicilan sebelum/sesudah sesi atau penuh di awal, wajib lunas paling lambat hari sesi terakhir.
- [x] Snapshot tarif empat sesi psikoterapi baru, alokasi FIFO pada satu ledger rangkaian, prabayar dipisahkan dari invoice terjadwal/lebih bayar, tanpa duplikasi kas/DP/receipt.
- [x] Pilihan DP atau penuh di Booking pasien/walk-in Admin; ringkasan/receipt pasien dan Paket Berjalan psikolog menampilkan status, uang diterima, alokasi, sisa dan jatuh tempo sesuai hak akses. Status Admin tanpa saldo/agregat nominal.
- [x] Pertemuan selesai tetap dicatat; jika belum lunas tampil Menunggu pelunasan administratif. Pemesanan ulang psikoterapi paket yang sama ditahan sampai tagihan lama lunas. Cancel tetap hanya menuntut invoice terbentuk, bukan utang sesi belum dipesan.
- [x] Batasi penolakan bukti ke Admin pada helper/facade dan tambahkan regresi penolakan role psikolog.
- [ ] Verifikasi visual/interaksi browser desktop/mobile untuk pilihan penuh, pencatatan dari sesi lanjutan, receipt rangkaian dan penutupan belum lunas. Tidak menjalankan dev server/build.
- [ ] Backend: model/migration agreement dan alokasi receipt-invoice, lock transaksi, DTO redacted, idempotency persisten, guard close administratif dan nominal tagihan/adjustment sah. Skema dokumen lama masih perlu amendment rinci; jangan menyalin model FE menjadi tabel produksi tanpa review.
- [ ] Putuskan migrasi data lama secara eksplisit bila tarif tetap/prabayar lintas sesi diperlukan untuk rangkaian yang sudah ada tanpa agreement; jangan mengubah histori uang diam-diam.

Rincian: [alur pembayaran sesi](ALUR_PEMBAYARAN_SESI.md). Status ini hanya FE preview lokal, bukan kesiapan produksi atau seluruh TODO selesai.
Verifikasi pengerjaan ini: `npm run lint` lolos, `npm test` 87/87 (84 FE +3integrasi sumber). Tambahan13tes meliputi pembayaran baru, role, isolasi, paralel dan penyimpanan gagal.

## Penegasan Pre-Test - 22 Oktober 2026
- [x] Catat pilihan developer: konfirmasi/perbarui jawaban untuk setiap booking atau sesi baru, termasuk memesan Konseling kembali; bukan memakai pre-test awal rangkaian selamanya.
- [ ] Selaraskan FE sesi lanjutan yang masih mewarisi `preTestId`/`preTestSnapshot` dari sesi sebelumnya: sediakan konfirmasi/perbarui oleh pasien dan kaitkan submission baru ke appointment terkait, tanpa menganggap penjadwalan Admin sebagai konfirmasi jawaban pasien. Penegasan ini docs-only; belum mengubah source.
- [ ] Tambahkan regresi konteks Konseling ulang berbeda, konfirmasi salinan, histori antarappointment dan reschedule sesi yang sama tanpa pre-test ulang otomatis. Pertahankan jalur PAPER offline serta batas Admin tanpa akses isi jawaban.

## Penegasan Pembayaran - 22 Oktober 2026
- [x] Catat keputusan: operasional pembayaran pasien khusus Admin; psikolog membaca ledger/laporan, bukan petugas input/verifikasi pembayaran pasien. Penolakan akses psikolog pada verify/record bukan celah FE.
- [x] Guard reject bukti di FE (`paymentProof.ts` dan facade AppContext) sudah ADMIN saja, dengan tes penolakan role psikolog pada pengerjaan pelunasan sesi terakhir.
- [ ] Terapkan pembatasan mutasi pembayaran pasien yang sama pada policy/route backend; akses harga/diskon dan expense owner tetap terpisah.

## Tindak Lanjut Audit Keras - 22 Oktober 2026

Status terbaru: developer meminta kelanjutan pekerjaan FE. AUD-02 sampai AUD-06 sudah diperbaiki pada FE preview dan diuji regresi. AUD-01 tetap terbuka karena migrasi aplikasi utama membutuhkan domain/DTO backend. Kotak selesai di bagian ini hanya mencakup FE preview, bukan kesiapan produksi; uraian temuan mencatat kondisi sebelum perbaikan.

Rincian alur, berkas, hasil uji, dan batas integrasi: [handoff perbaikan audit FE](PERBAIKAN_AUDIT_FE_2026_10_22.md).

Merge sebagai checkpoint fondasi integrasi berbeda dari rilis FE siap pakai. Aplikasi belum dapat dinyatakan siap pakai sebelum blocker dan verifikasi terkait diselesaikan.

### AUD-01 - P1: Halaman utama masih placeholder
- [ ] Sediakan pengalaman aplikasi utama sesuai cakupan integrasi yang disepakati, bukan hanya pratinjau lokal.

Temuan: Dashboard Laravel masih placeholder, sedangkan FE lengkap berada di `/preview/eko` yang dibatasi untuk lingkungan lokal.

Kriteria selesai: halaman dan alur setiap role tersedia melalui entry aplikasi yang ditetapkan, tanpa bergantung pada preview lokal. Jangan membuka mock/LocalStorage ke produksi atau melepas guard preview sebagai jalan pintas. Jika integrasi dilakukan bertahap, dokumentasikan halaman yang belum tersedia dan batas kesiapan rilis.

Referensi: [Dashboard](../resources/js/pages/Dashboard.tsx), [middleware preview](../app/Http/Middleware/EnsureLegacyPreview.php).

### AUD-02 - P1: Verifikasi DP belum memeriksa nominal aktual
- [x] FE: validasi kecukupan DP dari uang masuk aktual sebelum menandai persyaratan pembayaran terpenuhi.

Hasil: Admin mengisi nominal aktual, tanpa mengasumsikan DP diterima penuh. Penerimaan di bawah minimum tetap masuk ledger dengan booking PENDING; kekurangan dicatat melalui penerimaan tambahan, tanpa menimpa bukti/penerimaan pertama. Minimum yang terpenuhi baru mengonfirmasi booking. Kwitansi/ringkasan menggunakan nominal aktual.

Temuan: verifikasi dapat menandai `initialRequirementMet` tanpa membandingkan nominal aktual dengan kebutuhan DP. Reproduksi audit memakai record pending Rp1 di memori menghasilkan `DP_PAID`; ini bukan bukti transaksi bank atau input walk-in nyata.

Kriteria selesai: nominal yang benar-benar diterima dicatat dan dibandingkan dengan DP Rp100.000, dibatasi biaya bersih jika lebih rendah. Pembayaran kurang belum memenuhi syarat; kelebihan uang masuk tetap tercatat. Unggah bukti saja tidak berarti terverifikasi. Tambahkan tes Rp1, Rp99.999, Rp100.000, dan layanan dengan biaya bersih di bawah DP.

Referensi: [AppContext](../resources/js/context/AppContext.tsx).

### AUD-03 - P2: Reschedule bantuan Admin melewati kuota pasien
- [x] FE: bedakan asal permintaan reschedule dari role yang mengeksekusi perubahan.

Hasil: form bantuan petugas memiliki pilihan asal permintaan. PATIENT tetap tunduk pada batas waktu/kuota meskipun dieksekusi Admin; CLINIC/OWNER memerlukan alasan dan role sesuai. Histori menampilkan pelaksana dan asal permintaan secara terpisah.

Temuan: perubahan langsung oleh Admin selalu diberi asal `CLINIC`, termasuk jika dilakukan atas permintaan pasien, sehingga tidak mengurangi batas reschedule pasien. Persetujuan melalui request formal pasien sudah memiliki jalur penghitungan tersendiri.

Kriteria selesai: bantuan Admin atas permintaan pasien dihitung sebagai asal `PATIENT`, satu kali ketika perubahan berhasil `APPLIED`. Perubahan murni dari klinik/pengelola tidak mengurangi kuota pasien, dengan alasan dan kewenangan yang tervalidasi. Pasien tidak dapat memilih asal klinik untuk melewati batas tiga kali. Semua jadwal tetap minimal H+1 dan tidak ada DP ulang.

Referensi: [reschedulePolicy](../resources/js/utils/reschedulePolicy.ts).

### AUD-04 - P2: Request reschedule buntu ketika slot tujuan tidak tersedia
- [x] FE: lengkapi pemilihan ulang slot tanpa kehilangan kelayakan permintaan awal.

Hasil: Admin dapat meminta pemilihan ulang; persetujuan dengan target terambil atau sudah lewat membuka SLOT_SELECTION_REQUIRED. Pasien memilih ulang melalui Riwayat > Detail > reschedule. ID/requestedAt asal dipertahankan, revisi usulan diperiksa, slot lama tidak dilepas sebelum apply, dan kuota hanya terpotong sekali saat berhasil. Fase APPROVED, selection-window terkonfigurasi, clock/SLA server tetap terpisah dan belum selesai.

Temuan: Admin hanya dapat menyetujui/menolak, sedangkan pasien tidak dapat mengubah request berstatus `REQUESTED`. Jika slot tujuan sudah diambil, persetujuan gagal; mengajukan ulang setelah penolakan dapat terkena batas H-2 meskipun permintaan pertama tepat waktu.

Kriteria selesai: gunakan waktu pengajuan asli untuk kelayakan request yang tepat waktu. Sediakan transisi pemilihan ulang slot yang jelas; jadwal lama tetap berlaku sampai perubahan berhasil diterapkan secara atomik. Jangan mereset SLA, menghitung kuota dua kali, atau meminta DP lagi. Uji slot bentrok, request kedaluwarsa, versi booking berubah, dan penanganan Admin yang terlambat.

Referensi: [RescheduleRequestsTab](../resources/js/components/admin/tabs/RescheduleRequestsTab.tsx), [reschedulePolicy](../resources/js/utils/reschedulePolicy.ts).

### AUD-05 - P2: Transfer nyata tambahan setelah lunas tidak dapat dicatat
- [x] FE: sediakan pencatatan penerimaan tambahan setelah PAID, terpisah dari retry transaksi yang sama.

Hasil: aksi Catat pembayaran tetap tersedia setelah lunas, termasuk penerimaan nyata pada layanan yang telah dihentikan tanpa mengaktifkannya kembali. Ledger lama dipertahankan; idempotency key per operasi mencegah retry ganda dan menolak payload berbeda pada key sama. Tidak ada fitur refund/dompet baru.

Temuan: jalur pencatatan pembayaran menolak status `PAID` dan UI menyembunyikan aksinya. Dua transfer nyata berbeda harus dibedakan dari klik ganda atau retry.

Kriteria selesai: petugas berwenang dapat menambahkan penerimaan nyata ke ledger tanpa mengubah riwayat sebelumnya. Idempotency mencegah retry tercatat ganda, tetapi tidak menghapus transfer kedua yang benar-benar diterima. Seluruh uang masuk aktual tetap terlapor; penanganan kelebihan bayar tetap di luar aplikasi sesuai keputusan, tanpa menambah fitur refund, kredit, atau dompet.

Referensi: [AppContext](../resources/js/context/AppContext.tsx).

### AUD-06 - P2: Override membuka hari libur tidak berlaku
- [x] FE: samakan prioritas override tanggal pada ketersediaan, ringkasan, dan pemeriksaan konflik.

Hasil: resolver tanggal bersama memprioritaskan override eksplisit di atas libur/jadwal mingguan; alasan membuka hari libur wajib di form kalender. Kuota, jam, istirahat dan bentrok tetap diperiksa. Ringkasan hari tutup tidak lagi melaporkan waktu operasional tersedia.

Temuan: pemeriksaan hari libur berjalan sebelum override tanggal, sehingga override `isOpen: true` tetap menghasilkan nol slot pada hari libur.

Kriteria selesai: override eksplisit untuk membuka tanggal beserta alasannya dapat mengalahkan status libur bawaan. Jam kerja, kapasitas, bentrok booking, dan aturan minimal H+1 tetap berlaku. Availability, guard konflik, dan ringkasan jadwal memakai kebijakan yang sama. Uji libur tanpa override, buka/tutup eksplisit, dan tanggal yang sudah memiliki booking.

Referensi: [scheduleConfig](../resources/js/data/scheduleConfig.ts), [scheduleConflicts](../resources/js/utils/scheduleConflicts.ts).

### Verifikasi dan Pekerjaan Tersisa
- [x] TypeScript melalui `npm run lint` tanpa error; `npm test` 74/74 lolos (71 FE dan tiga pemeriksaan integrasi sumber). Termasuk regresi lima temuan, persetujuan slot paralel, retry penerimaan dan penyimpanan gagal.
- [ ] Verifikasi visual/interaksi browser desktop dan mobile; belum dijalankan pada pengerjaan ini.
- [ ] Migrasi halaman role utama menggunakan props/form Inertia dan DTO backend, tanpa fallback transaksi mock di produksi (AUD-01).
- [ ] Implementasikan transaksi database, authorization server, idempotency persisten, expected_version, kalender berversi dan selection-window/SLA backend. Lock browser hanya untuk simulasi lokal, bukan jaminan antarpengguna/perangkat.

Pemeriksaan PHP 2/2 pada audit sebelumnya hanya tes kesehatan/dasar, bukan cakupan domain. Tidak menjalankan ulang PHPUnit pada perubahan FE ini. Dev server, build, dan operasi Git tidak dijalankan.

## Prioritas Integrasi - 22 Oktober 2026
Panduan developer: [merge integrasi lalu main tanpa force](PANDUAN_MERGE_INTEGRASI.md). Pemeriksaan sumber tersedia melalui npm run lint dan npm test.
- [x] Putuskan DP flat Rp100.000 sekali di awal, bukan50%; seluruh booking/reschedule H+1; tanpa extend; cancel wajib lunas.
- [x] Selaraskan BUSINESS_RULES, kontrak web, schema dan fitur aktif; simpan [keputusan final](KEPUTUSAN_FINAL_2026_10_22.md).
- [x] Satukan konflik isi file dan pertahankan perbaikan FE terbaru; arsipkan dokumen legacy, perbaiki import tes.
- [x] Pasang dependency locked tanpa script, periksa TypeScript, jalankan npm test58/58 (55FE +3integrasi sumber).
- [x] Developer telah commit dan push branch integrasi (`c4a90a3`) berdasarkan log yang diberikan; agent tidak menjalankan Git. Merge ke `main` belum dikonfirmasi.
- [x] Psikoterapi baru di preview memakai invoice per sesi tanpa DP lanjutan; record legacy tidak diubah diam-diam.
- [x] Lengkapi menu/hak operasional Admin preview, request reschedule3kali/H-2/+4hari dan koreksi bukti berversi; tambah tes policy.
- [x] Lengkapi pemilihan ulang slot pada FE preview dengan histori/revisi request dan waktu pengajuan asal.
- [ ] Lengkapi fase APPROVED/selection-window target dan clock kalender/SLA6/12/24jam pada backend; jangan menyamakan subset preview dengan seluruh kontrak.
- [ ] Implementasikan domain Laravel/DB, authorization field/objek, lock/idempotency dan seluruh route target.
- [ ] Verifikasi browser/mobile serta integrasi DB/notification setelah diizinkan.

Checklist lama di bawah mencatat fondasi/target, bukan bukti semua fitur Desman sudah berjalan.

## Fondasi20Oktober2026
- [x] Flatten dokumen dan perbarui link, README serta lokasi AGENTS.
- [x] Inisialisasi Laravel13 dan pindahkan React ke resources dengan Laravel-Vite.
- [x] Dependency/lockfile, env/key lokal, UUID akun dan bootstrap/route awal disiapkan.
- [x] Periksa struktur/link/import/hash, syntax PHP dan bootstrap tanpa server/build/migrasi/test.
- [ ] Implementasikan backend bisnis, policy/ownership/expected_version, provisioning owner dan46tabel sesuai kontrak.
- [x] Sesuaikan fondasi menjadi Inertia3: page resolver, controller/props, login/logout sesi, middleware role, preview mock lokal.
- [x] Selaraskan WEB_CONTRACT/panduan dan tulis catatan perubahan untuk Eko.
- [ ] Migrasikan seluruh fitur domain dari mock ke controller/props/form web; jangan campur mutasi dua sumber.
- [ ] Konfigurasikan database/provider nyata dan jalankan migration/build/test setelah diizinkan.

## Dokumentasi
- [x] Koreksi terbaru dimasukkan ke fitur, actor/journey, akses, API dan database.
- [x] F01–F20 mempunyai template teknis lengkap, termasuk alur gagal dan transisi.
- [x] Schema domain memiliki tipe/key/null/default/index dan insert/lock policy tunggal.
- [x] Pisahkan akses PDF7hari dari retensi file1tahun; laporan asesmen boleh offline.
- [x] Expense/surplus owner dan export jadwal Admin masuk scope.
- [x] Basis25% menjadi pengaturan versi paket oleh Admin/Superadmin; pilihan normal/setelah promo, snapshot booking lama tetap.
- [x] Penyelesaian lebih bayar di luar sistem; hapus kebutuhan status/tiket resolusi, pertahankan ledger aktual.
- [x] Telelayanan Google Meet ditetapkan: Admin mengisi link, otomatis kirim WA pasien via Baileys; API/schema/akses/alur gagal diperbarui.
- [x] Psikoterapi pilihan B: booking pertama langsung membuat plan administratif4unit dan tagihan sesi1 saja, lanjutan Admin; unique/idempotency terdokumentasi.
- [x] Profiling offline kertas langsung ke Superadmin; Admin administrasi/pembayaran, booking PAPER tanpa submission digital. Selaraskan API, role, journey dan schema.
- [ ] Isi data praktik dan durasi paket yang belum tersedia sebelum bookable.
## Implementasi kelak oleh pengembang
- [ ] Terapkan kontrak Laravel/React, schema, DTO dan state transitions.
- [ ] Bangun ledger/fileprivate/lock/idempotency/outbox dan policy per role.
- [ ] Verifikasi concurrency, kalkulasi, authorization dan batas waktu setelah developer mengizinkan pengujian.
Kotak FE yang selesai hanya mencakup implementasi/pengujian preview yang dijelaskan di atas, bukan seluruh aplikasi atau backend produksi.

# Audit integrasi dokumentasi — 19 Oktober 2026

## Kesimpulan dan batas penilaian

Audit ini memeriksa hubungan aturan, aktor/journey,20fitur,API dan kamus database. Pemeriksaan ulang menemukan kekurangan yang tidak terlihat dari pengecekan heading/link saja. Pernyataan sebelumnya bahwa tidak ada konflik besar yang tersisa terlalu pasti.

Temuan integrasi di bawah telah diperbaiki pada kontrak dokumen. Keputusan sisa tagihan sesudah pembatalan sebelum layanan dikonfirmasi langsung developer: **sisa tidak ditagih, penerimaan aktual tetap tercatat**. Tidak ada perubahan source, operasi Git, aplikasi, test atau build.

Hasil ini berarti ada acuan yang lebih tegas dan saling tertaut untuk implementasi, bukan bukti aplikasi/database berjalan bebas kesalahan atau jaminan semua kemungkinan bug telah dieliminasi.

## Temuan dan perbaikan lintas kontrak

| ID | Celah yang ditemukan | Hasil perbaikan / rujukan |
|---|---|---|
| I01 | API meminta expected_version pada objek yang schema belum punya versi; versi konten bercampur versi row | row_version common untuk domain mutable; versi konten/kalender/link/revision/attempt dibedakan; API menjelaskan mapping |
| I02 | Arah diskon DECREASE pada aturan, tetapi enum data PLUS/MINUS | direction=MINUS seragam; nilai nominal/qty tetap positif |
| I03 | amount_claimed,claim_amount,claimed_amount dipakai bergantian | request/kolom canonical claimed_amount; actual_amount tetap hasil pemeriksaan petugas |
| I04 | Form consent menyebut assisted_actor_id/scope yang tidak ada; Admin dapat tercatat sebagai penerima tanpa membedakan pencatat | identitas penerima nyata, nama snapshot dan recorded_by dipisahkan; penerima tanpa akun nullable |
| I05 | Cutoff PDF menyebut completed_at/cancelled_at appointment yang tak didefinisikan | cutoff billing service_terminal_at/download_until, mengambil terminal appointment atau penutupan seluruh case |
| I06 | Follow-up asesmen berisiko menjadi WAITING_PAYMENT/hold baru walaupun paket telah dibayar | mewarisi billing/DP/proof/clock asal; status awal dihitung case; tidak invoice/bukti baru |
| I07 | Counter reschedule row berpotensi bersaing dengan histori APPLIED | counter hanya derived dari efek request APPLIED, dihitung di bawah lock |
| I08 | Reschedule unpaid belum menetapkan apakah hold boleh diperpanjang | deadline=min(hold_asal,start_baru), tidak ada24jam baru atau resetSLA |
| I09 | Request EXPIRED teknis dapat dianggap haknya selesai padahal perlu resolusi | requires_resolution menahan penutupan hak; active_guard mencakupnya; keputusan resolve beralasan |
| I10 | Urutan lock F09 dan schema tidak sama; verifikasi uang dapat memulai dari billing | urutan global resource-hari -> plan bila perlu alokasi unit -> appointment terurut -> request -> billing -> payment/sequence; jalur uang tidak membaliknya |
| I11 | Sisa invoice layanan batal/expired dapat tetap tampil sebagai utang atau net0 menjadi PAID | CLOSED_UNSERVED + adjustment pelepasan sisa tanpa uang keluar; receipt/kas lama tetap; status berbeda dari lunas |
| I12 | Progres plan dapat menyamakan unit no-show/tertutup dengan layanan nyata | completed vs resolved vs belum dipesan dipisahkan; owner meninjau complete/extend, unit tertutup tidak ditagih ulang |
| I13 | Case CLOSED sebelum tes dapat lolos review hanya karena status case | harus ada appointment case COMPLETED; layanan CLOSED_UNSERVED tidak eligible |
| I14 | as_of hanya label; worker export dapat mengambil data yang berubah sesudah request | cutoff verified_at/created_at dan dataset_snapshot sesuai role dibekukan; worker memformat snapshot |
| I15 | Satu invoice BASE belum mencegah dua line BASE; CMS satu published hanya bergantung lock | unique generated base_service_guard dan published_guard; mutasi tetap transaction/guard |
| I16 | UI memerlukan detail profil/plan/case, settings, audit dan upload expense tetapi daftarAPI belum memuat jalurnya | endpoint/policy read/write dilengkapi; penutupan plan owner dan scope asesmen eksplisit |
| I17 | Nomor WA awal dan koreksi link/nomor dapat dibaca sebagai dua sumber aktif; perubahan uang menaikkan versi tanpa pindah jadwal | booking contact adalah snapshot awal, revisi link aktif sumber tujuan kini, delivery snapshot histori; worker memakai attempt/link_version/status |
| I18 | Peta baca tersebar dan README root masih menyebut target prototype lama | docs/README dan EKO_PROJECT_GUIDE menjadi pintu baca; arsip/target/runtime dibedakan, root tidak diedit di luar scope |
| I19 | Unique nomor sesi lama dapat menghabiskan rencana oleh hold gagal tanpa uang/layanan | pelepasan unit bertimestamp, unique generated hanya unit belum dilepas; histori/tagihan net0 tetap, booking baru boleh mengisi unit |
| I20 | Koreksi uang tidak diterima dapat dipaksa membuat replacement positif palsu | correct_amount0 memakai reversal saja, bukan receipt0/refund; uang nyata dan koreksi dibedakan |
| I21 | Versi naskah consent hanya disebut secara logis tanpa relasi ke konten sebenarnya | FK komposit ke section/version CMS dan pemeriksaan published saat penerimaan, histori archived tetap valid |
| I22 | Key idempotency berbeda masih dapat menggandakan satu bukti transfer secara manual | kandidat checksum/referensi/nominal diperiksa petugas dengan acknowledgment beralasan; bukan unique global yang menolak dua transfer nyata |
| I23 | Evaluasi hasil dapat terjadwal/dimulai sebelum tes yang menjadi prasyarat, termasuk akibat reschedule | dependency scope divalidasi saat schedule/start/apply;409 jika membalik urutan, tanpa pemindahan diam-diam |
| I24 | Booking Psikoterapi pertama belum menjelaskan siapa memulai rangkaian; istilah rencana dapat disalahartikan sebagai keputusan klinis otomatis | DITUTUP: developer memilih B; booking pertama otomatis membuat plan administratif4unit + appointment/bill sesi1 atomik. Lanjutan Admin, klinis owner, retry/unique active_plan_guard mencegah duplikasi |
| I25 | Profiling assisted oleh Admin berbenturan dengan larangan akses jawaban klinis; walk-in tanpa akun berisiko buntu | DITUTUP lewat jawaban developer: offline kertas langsung ke Superadmin, Admin administrasi/pembayaran. PAPER tanpa submission/upload kertas, DIGITAL online oleh pasien; F06/F07/API/schema/role/journey/guide diselaraskan |
| I26 | Beberapa fitur memakai nama kolom yang tidak ada pada kamus: effective_from/until mingguan, event_id notifikasi, no_show_at dan alias minimum | F05 memakai calendar_versions.effective_at dan header limit; F13 outbox_id; F10 memakai kolom/event dan nama DTO yang didefinisikan. Template invoice menyertakan UNSERVED_BALANCE_RELEASE dan cutoff terminal kanonik |
| I27 | Aksi revisi profiling, revoke akses pasien dan withdraw consent ada di fitur tetapi endpoint belum tercantum; revisi bisa bercabang | Endpoint/policy/request dicantumkan; revisi linear UNIQUE(supersedes_id), draft penerus belum mengganti jawaban submitted; revoke/withdraw tidak menghapus histori atau kas |

I01–I27 ditangani pada spesifikasi. I24 ditutup setelah developer memilih B; I25 setelah penjelasan bahwa profiling offline menggunakan kertas langsung ke Superadmin. Tidak ada pertanyaan bisnis tertunda dari audit ini. Tambahan skenario inspeksi: booking pertama hanya satu invoice, key sama tidak membuat ulang, key berbeda bersamaan dibatasi satu plan ACTIVE, slot gagal rollback plan, sesi2–4 belum dipesan tidak ditagih, dan sesi5 tetap perlu extend. Unique/lock/guard pada tabel dokumen tidak bekerja otomatis sebelum migration/service dibuat dengan benar.

## Hubungan sumber data yang disengaja

- Akun dan profil pasien aktual berbeda; patient_accesses menjelaskan kewenangannya.
- Package version, identitas booking dan invoice/receipt menyimpan histori pada waktu berbeda; perubahan master tidak menyunting bukti transaksi lama.
- Appointment menyimpan status/jadwal terkini; events menyimpan perubahan. Hanya appointment aktif sumber okupansi, tanpa flag isBooked lain.
- Billing account dimiliki appointment non-asesmen atau satu case. Follow-up case tidak menjadi tagihan baru.
- Invoice/ledger/request adalah sumber angka total/penerimaan/counter; angka UI derived, bukan nilai bebas dari React.
- Link Meet revisi aktif berbeda dari nomor/link yang sudah dikirim pada delivery lama. Export snapshot adalah bukti satu hasil, bukan transaksi baru.

## Skenario penelusuran dokumen

| Skenario | Hasil yang harus diwujudkan |
|---|---|
| Dua petugas menyimpan profil/keputusan dari versi sama | satu update, yang stale409; row_version naik, tidak silent overwrite |
| Dua booking overlap pada praktisi yang sama, kanal berbeda | satu menang transaction; Google Meet tidak menambah kapasitas praktisi |
| Retry verifikasi transfer yang sama | satu penerimaan/receipt; dua transfer nyata tetap dua penerimaan |
| Diskon baru pada katalog | booking lama tetap versi asal; basis additional time tidak berubah |
| AsesmenDP175000 lalu evaluasi tambahan | case/billing sama; evaluasi mengikuti DP asal, bukan invoice350000 kedua |
| Request sebelumH-2 diproses setelah waktu sesi | eligibility requested_at; tidak kehilangan hak karena Admindelay |
| Jendela pilih habis dan request EXPIRED | requires_resolution menahan penutupan sepihak sampai keputusan administratif |
| Tagihan900000, DP450000, batal sebelum layanan | uang450000 tetap; pelepasan sisa450000; CLOSED_UNSERVED, bukan utang/lunas layanan |
| Booking expired tanpa uang | pelepasan sisa, kas0; tidak tampilPAID dari pembagian0/0 atau total0 |
| Tes sudah diberikan, evaluasi dibatalkan | tidak otomatis menghapus seluruh sisa tagihan case |
| Case ditutup sebelum satu layanan pun diberikan | tidak boleh memberi review seolah telah menjalani tes |
| Export antre lalu verifikasi/jadwal berubah | file lama dari dataset request; laporan baru memakai cutoff baru, snapshot lama utuh |
| NomorWA/link diperbaiki atau reschedule | revisi/attempt baru, antrean lama diperiksa/dibatalkan; pesan terkirim tidak dijanjikan bisa ditarik |

Tabel ini adalah penelusuran hasil yang tertulis pada kontrak, bukan laporan menjalankan test aplikasi.

## Panduan untuk Eko dan pekerjaan tersisa

Mulai dari [EKO_PROJECT_GUIDE](../EKO_PROJECT_GUIDE.md), kemudian aturan/permission, aktor/journey dan fitur terkait. Gunakan [API](../API.md) untuk nama payload/enum dan [kamus database](../DATABASE_ARCHITECTURE.md) untuk PK/FK/null/index dan invariant. Jangan menerapkan rekomendasi pada bagian arsip log sebagai aturan aktif.

Identitas praktik, rekening/QR, nomor Baileys dan durasi paket lain yang belum ditetapkan tetap perlu diisi sebelum aktivasi. Default grace/window tetap dilabeli sebagai konfigurasi operasional. README root masih deskripsi prototype di luar scope perubahan; docs menjelaskan target Laravel13 terbaru.

Implementasi dan pembuktian perilaku konkurensi, authorization, data migrasi, job dan integrasi jaringan dikerjakan kemudian setelah diizinkan. Penambahan fitur/aturan baru tetap harus melewati pemeriksaan lintas dokumen yang sama.

## Pemeriksaan statis akhir
Inspeksi ulang sesudah keputusan PAPER: 61 file Markdown dalam docs terinventarisasi; 20 fitur tetap memiliki seluruh10bagian wajib; tidak ditemukan tautan lokal rusak yang targetnya di dalam docs. Tujuh referensi lokal menuju luar docs (lampiran/source historis) tidak diperiksa pada sesi ini. Kamus tetap46tabel domain, tanpa judul tabel/kolom ganda atau target FK baris kolom tak terdefinisi. profiling_mode dan constraint rantai revisi telah tercantum. Penelusuran aturan membedakan log historis dari kontrak aktif. Data praktik/durasi yang belum ada tetap pekerjaan sebelum aktivasi, bukan angka yang diisi diam-diam.

Hasil inspeksi teks setelah perbaikan:20dokumen fitur mempunyai seluruh10bagian template; semua tautan Markdown lokal yang diperiksa tersedia;46tabel domain dengan targetFKkolom terdefinisi, tanpa nama kolom ganda di definisi tabel; seluruh FK domain yang dinyatakan dalam baris kolom bertipeCHAR36; nama alias lama klaim/arah diskon tidak dipakai sebagai request endpoint. row_version common telah didefinisikan. Ini inspeksi definisi, bukan eksekusi constraint SQL/migration atau bukti concurrency/authorization runtime.

# Migrasi Inertia disetujui — 20 Oktober 2026

Fondasi arsitektur telah disesuaikan setelah persetujuan developer. [Catatan untuk Eko](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md), [WEB_CONTRACT](WEB_CONTRACT.md) dan [SETUP](SETUP.md) adalah rujukan aktif; status REST/Sanctum pada arsip di bawah bukan kondisi sekarang.

## Batas yang masih aktif

- Backend baru mencakup Home publik, login/logout dan workspace ber-role. Seluruh booking/ledger/slot/reschedule/profiling/upload/terapi/asesmen/report/outbox masih target; komponen prototype bukan implementasi transaksi server.
- Database/tabel/akun belum disiapkan atau dimigrasikan. Kode sesi login ada, namun belum diuji terhadap DB/users; tidak ada akun demo, provisioning owner, Google/register/reset atau revoke-all. Struktur users/cache/jobs bukan seluruh46tabel domain.
- Preview Eko tetap mock/LocalStorage dan lokal saja. Jangan memasukkan data nyata ke preview atau menyambungkannya sebagai fallback transaksi web. Client lama legacy/api tidak dipakai halaman baru; diadaptasi/dihapus per fitur saat backend siap.
- Dev server/build/browser/test suite tidak dijalankan. Manifest/aset Vite belum dibuat dalam sesi ini; render visual dan alur login nyata belum diverifikasi. Typecheck/syntax/route listing tidak membuktikan integrasi bisnis.
- SSR disabled: belum ada HTML penuh konten React untuk kebutuhan SEO. History encryption memerlukan secure context; http domain Laragon khusus mungkin perlu HTTPS atau flag lokal false sesuai SETUP. Devtools disabled.
- Placeholder identitas praktik, rekening, kontak, SIP/STR dan durasi layanan yang belum tersedia tetap perlu diisi sebelum aktivasi. Katalog config saat ini non-bookable; review publik kosong sampai CMS/moderasi nyata.
- Baileys/email/Google/backup/deployment belum dikonfigurasi atau diuji. Privasi, permission objek, concurrency, immutable ledger dan recovery outbox harus diterapkan/diuji saat fitur domain dibangun; middleware role saja belum mencukupi itu.

## Pemeriksaan fondasi

Composer validate/platform dan npm graph sesuai; typecheck TypeScript serta syntax34filePHP lolos. Route listing10entry hanya web terdaftar dan /up, tanpa Sanctum/devtools/API placeholder/catch-all. Struktur70dokumen docs, link/import/nama page valid;76fileasal React tetap terlacak dengan perubahan yang direncanakan. Tidak ditemukan tautan lokal putus atau perubahan source asal di luar daftar migrasi. Ini inspeksi statis, bukan jaminan bebas bug runtime.

---

## Arsip sebelum persetujuan migrasi Inertia

Bagian berikut mempertahankan keadaan/keputusan pada saat dicatat. Rujukan transport dan status setup terdahulu digantikan bagian terbaru di atas; keputusan bisnis tetap mengikuti kontrak aktif.

# Status aktif setelah setup — 20 Oktober 2026

Pertimbangan arsitektur terbaru: developer meminta analisis route web versus API. [Laporan rekomendasi Inertia](audits/ANALISIS_ARSITEKTUR_WEB_2026-10-20.md) membedakan fakta source dan penilaian kecocokan. Ini usulan perubahan adapter, bukan defect aturan bisnis yang menuntut migrasi otomatis. API/shell saat ini belum diganti; memilih Inertia kelak memerlukan penyelarasan props, auth, form/error dan navigasi Eko.

- Struktur docs/root dan fondasi Laravel selesai. README root, docs/README dan SETUP.md menjadi pintu masuk; AGENTS aktif di docs/AGENTS.md.
- Frontend masih mock/LocalStorage. routes/api.php baru tempat registrasi kontrak /api/v1; endpoint bisnis/auth belum dibuat. Sanctum cookie/CSRF terpasang, belum berarti login nyata telah tersedia.
- Baru migration fondasi users/cache/jobs; database tidak dibuat, di-migrate atau di-seed. Kontrol role/status/expected_version dan46tabel domain belum seluruhnya diimplementasikan. Google OAuth/provider email/Baileys belum dikonfigurasi.
- Vite dev server dan build tidak dijalankan sesuai larangan. public/build/manifest.json belum tersedia, sehingga halaman React memerlukan dev server/build yang kelak diizinkan. Jangan mengklaim halaman telah diuji di browser; health/bootstrap/route terpisah dari render aset.
- PHP8.3.30 Laragon dipakai karena ekstensi tersedia; PHP8.3.33 yang ditemukan belum memuat php.ini. Pilihan binary ini tidak mengubah konfigurasi PHP global/web server.
- Pemeriksaan setup: Composer valid/platform sesuai, npm dependency graph valid (audit instalasi0vulnerability), modul build dapat diimport,25filePHP lolos syntax, route bootstrap tersedia,66dokumen di docs tanpa link lokal/importReact putus atau perubahan komponen tak direncanakan. Ini bukan test suite/bukti implementasi domain.
- Data praktik/rekening/kontak dan durasi paket yang belum ada masih perlu diisi sebelum aktivasi sesuai keputusan sebelumnya.

---
# Catatan audit aturan — 19 Oktober 2026
## Hasil audit integrasi tambahan
Audit ulang setelah pilihan B menemukan I25–I27; seluruhnya ditangani pada spesifikasi. I25 dikonfirmasi developer: offline profiling kertas langsung ke Superadmin, Admin hanya pendataan administratif dan pembayaran. PAPER tidak membutuhkan submission digital dan tidak memberi akses klinis Admin. I26 menyelaraskan nama field/cutoff; I27 melengkapi endpoint aksi yang sudah didesain dan constraint revisi linear. Tidak ada pertanyaan aturan yang masih tertunda dari audit integrasi ini; kelengkapan sebelum aktivasi di bawah tetap berlaku. Hasilnya acuan implementasi, bukan jaminan bebas seluruh kemungkinan bug.
Celah I01–I23 dan perbaikannya dicatat di [AUDIT_INTEGRASI_DOKUMEN_2026-10-19](audits/AUDIT_INTEGRASI_DOKUMEN_2026-10-19.md). Dokumen sebelumnya masih memiliki ketidaksamaan versi/field, penutupan tagihan, follow-up, rekap, export dan beberapa endpoint; itu telah diselaraskan pada kontrak. Penelusuran mendalam tidak sama dengan jaminan bebas semua bug.
I24 ditutup: developer memilih B. Pasien langsung booking pertama; plan administratif empat unit dan satu appointment/tagihan sesi1 terbentuk atomik. Lanjutan Admin, isi klinis tetap owner. F11/F06/API/database/guide menjelaskan idempotency, unique plan ACTIVE, rollback dan batas sesi; implementasi belum dinilai. Tidak ada lagi konfirmasi tertunda untuk titik masuk ini.
Keputusan pembatalan sudah dijawab: sisa tidak ditagih sebelum layanan, uang masuk tetap. CLOSED_UNSERVED/adjustment tertaut mencegah utang atau status lunas semu. Panduan Eko sekarang [EKO_PROJECT_GUIDE](EKO_PROJECT_GUIDE.md).
Kelengkapan masih berupa data praktik/nomor/durasi paket dan implementasi/verifikasi kemudian. Sejak setup20Oktober, README root menjelaskan Laravel13 dan React resources/js; dokumen prototype lama berada di archive/. Catatan audit19Oktober merekam keadaan sebelum setup tersebut.

## Masih membutuhkan keputusan bisnis
Tidak ada konfirmasi aturan tertunda yang teridentifikasi pada audit integrasi sampai I27. Kelebihan bayar di luar sistem, Telelayanan Google Meet/WA, Psikoterapi pilihan B dan profiling offline kertas telah diputuskan developer. Angka grace/window tetap default operasional konfigurabel, bukan angka yang diklaim disetujui eksplisit. Ini penutupan pertanyaan scope, bukan klaim implementasi bebas bug.
## Ditutup: penyelesaian lebih bayar dan Telelayanan
Penerimaan aktual tetap di ledger; selisih aritmetika tidak menjadi tiket/status resolusi atau fitur refund/credit/hangus. Kolom overpayment_resolution dihapus dari schema target. Petugas/pasien menyelesaikan di luar sistem tanpa wajib mengisi keputusan pada aplikasi.
Telelayanan kini F20: Admin/Superadmin mengisi link Meet dan nomor WA booking, save memicu outbox/Baileys, status kirim terpisah dari attendance/payment, reschedule memerlukan konfirmasi link untuk usaha baru. Paket bukan lagi ditunda sebagai katalog saja.
## Ditutup: dasar tarif ketika promo
Developer meminta dijadikan fitur pengaturan. Admin/Superadmin memilih additional_time_price_basis pada versi paket Konseling: NORMAL_PRICE atau FINAL_PRICE setelah promo global saat booking. Pilihan wajib sebelum bookable, tersimpan lewat versi booking dan rate snapshot; tidak mengubah transaksi lama. F04/F08, permission, API dan kamus database telah diperbarui. Belum berarti fitur runtime telah diimplementasikan.
## Kelengkapan sebelum aktivasi
Durasi paket lain yang belum ditetapkan, identitas praktik, rekening/QR, kontak dan nomor Baileys masih placeholder. Paket tanpa durasi positif non-bookable. Telelayanan memakai baseline60menit dan Google Meet; link/nomor pasien disiapkan per booking, bukan placeholder global.
Default grace15menit dan dua window24jam adalah pilihan operasional perancang yang dilabeli/configurable, bukan keputusan angka manusia.
## Defect dokumentasi yang ditangani
F01–F20, kamus database, contoh API/roleDTO, harga/promo/diskon, paymentrejection, arrival, requested_at, recoveryNO_SHOW, addendum, kalenderdampak, retensi7hari/1tahun, laporanasesmenoffline, expense/surplus, exportjadwal, scope kelebihan bayar dan Meet/WA telah diperbarui. Lihat AUDIT_PENYELARASAN_ATURAN_2026-10-19.md.
Implementasi tidak dinilai. Semua catatan bug runtime di bawah adalah histori audit sebelumnya; sesi ini tidak mengonfirmasi kondisi kode sekarang.

---
# Arsip isu sebelum penyelarasan terakhir
Status lama di bawah tidak mengalahkan daftar aktif di atas; beberapa telah selesai pada kontrak, belum berarti kode diperbaiki.

# Known Issues

## Audit khusus aturan dokumen — rujukan terbaru

[AUDIT_ATURAN_DOKUMEN_2026-10-19](audits/AUDIT_ATURAN_DOKUMEN_2026-10-19.md) memuat R01–R32: konflik aturan, kasus batas yang belum ditentukan, kontrak API/database yang belum seragam, dan kelengkapan fitur. Tidak adanya aplikasi tidak dihitung sebagai masalah pada audit ini. Jangan menggunakan temuan runtime di bawah untuk menjawab pertanyaan apakah aturan dokumen sudah konsisten.

- **R01 diselesaikan:** developer memilih deadline pembayaran `min(booking_created_at + 24 jam, start_at)`. F06, kalender, journey pasien, alur umum, dan checklist Eko diperbarui.
- **R10/R15 menunggu jawaban:** cakupan kategori additional time serta apakah nominal biaya tambahan boleh terlihat oleh Admin mengingat formula 25% dapat mengungkap harga dasar.
- **Alur masih terbuka:** bukti ditolak; check-in sebelum SLA; request reschedule yang melewati sesi lama; transisi sesudah no-show; expiry hak empat hari; batas follow-up asesmen dan stop/perpanjangan terapi.
- **Kontrak uang masih terbuka:** invoice/addendum setelah biaya tambahan; akumulasi menit additional time; koreksi nominal versus diskon; penyelesaian overpayment; transparansi transaksi yang terlambat diverifikasi.
- **Kontrak informasi masih terbuka:** cakupan notifikasi owner/pasien; retensi file versus hak download; laporan asesmen offline versus upload; pengeluaran/surplus dan export jadwal Admin.
- **Kontrak teknis belum final:** semua tipe/null/default/FK belum dirinci seragam; contoh schema/API lama masih berbeda dari aturan terbaru; sebagian F01–F17 belum memenuhi template alur normal/gagal dan tabel transisi.
- Klaim terdahulu “dokumen aman sebagai baseline desain” terlalu luas. Status sekarang: keputusan utama jelas, tetapi dokumen belum bebas kontradiksi dan belum lengkap untuk semua kasus batas.

## Saat Ini

- Belum ada backend dan database nyata.
- Auth masih berupa simulasi client-side.
- Data tersimpan di LocalStorage, sehingga tidak aman untuk data produksi.
- Data klinis belum memiliki authorization server-side.
- Migrasi LocalStorage cleanup v5 membersihkan state test/SOAP, field appointment lama, tarif profil lama, dan paket telelayanan. State lama lain yang tidak dikenali masih mungkin memerlukan reset data demo.
- Pre-test masih memakai struktur data lama `IntakeForm` di TypeScript dan LocalStorage, walaupun label dan alurnya sudah diubah menjadi pre-test.
- Modul, type, model, controller, endpoint, dan seed test psikolog/DASS sudah dihapus dari source aktif. Hanya catatan historis pada changelog lama yang masih menyebut implementasi tersebut.
- Payment status masih simulasi.
- Payment sudah disimulasikan sebagai DP yang mengikuti konfigurasi paket, pencatatan nama pemilik rekening pengirim (`transferSenderName`), dan pelunasan di klinik, tetapi verifikasi berkas transfer masih berupa simulasi client-side tanpa storage privat / payment gateway nyata.
- Pelunasan aktual sudah disembunyikan dari UI admin setelah submit, tetapi masih tersimpan di LocalStorage dan dapat diperiksa melalui developer tools. Privasi role yang sebenarnya baru aman setelah backend memakai policy dan serializer admin yang tidak mengembalikan nominal.
- Invoice/kwitansi masih berupa tampilan frontend dari data appointment; backend produksi perlu menyimpan invoice sebagai record permanen.
- Consent/privacy sudah diwajibkan di UI booking, tetapi belum tersimpan sebagai audit record backend.
- Notifikasi WhatsApp/email belum ada karena membutuhkan backend dan provider resmi.
- Export data klinis masih client-side CSV; produksi perlu role protection, audit log, dan pembatasan data yang diekspor.
- Frontend sudah memakai Web Locks API lintas-tab dengan fallback lock LocalStorage per psikolog/tanggal, sinkronisasi state, dan validasi ulang booking/reschedule/sesi lanjutan. Mekanisme ini mengurangi double submit tetapi belum menggantikan locking server-side/database transaction untuk produksi.
- Service CRUD Laravel sudah tersedia di `resources/js/legacy/api/`, tetapi `AppContext` masih memakai facade mock/LocalStorage. Integrasi runtime baru dapat dilakukan setelah response API backend tersedia dan sesuai kontrak.
- Error CSP `script-src 'none'` saat preview di simulator/iframe bukan berasal dari konfigurasi project saat ini. `index.html` tidak memasang CSP tersebut; Vite membutuhkan script `@vite/client` dan `resources/js/main.tsx`, sehingga parent simulator yang memaksa `script-src 'none'` akan memblokir aplikasi. Buka app di browser normal/preview tanpa CSP tersebut atau ubah CSP parent preview.
- Role permission frontend sudah diarahkan ke hierarki terbaru, tetapi belum ada authorization server-side.
- File `tsc_errors.txt` tetap ada sebagai artefak historis; kondisi source terbaru telah diperiksa dengan `npx tsc --noEmit` dan lolos 0 error pada 2026-10-06.
- Folder `dist/` pernah terbentuk dari build sebelumnya dan diabaikan oleh `.gitignore`.
- AI tidak menjalankan build atau dev server. Belum tersedia automated unit/integration/E2E test; verifikasi terbaru terbatas pada TypeScript checker dan audit statis.

## Risiko Produk

## Audit ulang setelah koreksi Admin dan katalog — 2026-10-19

### P0 — Runtime belum mengikuti kontrak dokumentasi

Dokumentasi sudah memodelkan Laravel 13, ledger pembayaran, assessment case, line item kustom, override jam klinik, dan `is_bookable`. Source masih memakai mock/LocalStorage, flag `isBooked`, satu field pelunasan, status lama, dan belum mempunyai tabel/transaction backend. Kontrak ini aman sebagai target desain, tetapi belum aman disebut implementasi produksi.

### Diputuskan — Billing psikoterapi per sesi

Setiap sesi mempunyai appointment, billing account, dan invoice sendiri. Treatment plan hanya melacak progres. Requirement sudah diputuskan; runtime dan migration belum dibangun.

### P1 — Line item kustom Admin dapat menjadi celah finansial

Admin diberi fleksibilitas memasukkan `CUSTOM_CHARGE`, adjustment, dan surat formal. Jika tidak ada batas nominal, reason code, audit, dan visibility Superadmin, Admin dapat membuat tagihan yang tidak sesuai policy. Dokumentasi sudah mewajibkan audit, tetapi masih perlu keputusan apakah biaya kustom langsung efektif atau menunggu review Superadmin.

### Diputuskan — Jam klinik sama dengan jam kerja Admin

Gunakan satu kalender operasional untuk jam buka, istirahat, libur, cutoff enam jam, dan SLA 12 jam. Deadline yang sudah dihitung menyimpan versi kalender agar perubahan jam tidak mengulang SLA lama secara diam-diam.

### P1 — Hold dan bukti pembayaran yang menunggu verifikasi belum memiliki batas akhir

Bukti tepat waktu melindungi reservasi; setelah SLA 12 jam operasional booking otomatis `CONFIRMED_AUTO_SLA`, payment tetap `PENDING_RECONCILIATION` sesuai §15 dokumen ide. Sesi dapat dimulai sebelum 12 jam karena cutoff booking hanya enam jam: Admin memeriksa saat check-in. Jam SLA, job, dan row lock belum diimplementasikan. Bukti ditolak sesudah hold habis tetap memerlukan jalur penyelesaian operasional; jangan menggantinya dengan kas terverifikasi otomatis.

### Diputuskan — Penanggung jawab sederhana

Default penanggung jawab adalah akun login. Booking untuk orang lain tetap menyimpan pasien aktual dan relasi penanggung jawab sederhana, tanpa akun/consent digital setiap peserta. Walk-in memakai nama/kontak penanggung jawab. Akses histori tidak otomatis pindah hanya karena kontak diperbarui.

### P1 — Reschedule sudah mempunyai batas, tetapi exception lock belum lengkap

Dokumen menetapkan maksimal tiga kali, lock dua jam, dan jendela empat hari setelah `NO_SHOW`. Belum dikunci apakah Admin boleh langsung menerapkan reschedule setelah lock, apakah perlu persetujuan Superadmin, dan siapa memilih slot final ketika pasien meminta bantuan.

### P2 — Penyelesaian overpayment nyata belum dipilih

Tidak ada refund dan tidak ada diskon. Overpayment nyata dicatat sebagai selisih lebih bayar, tanpa otomatis menjadi hangus, biaya tambahan, atau credit. Kebijakan memakai selisih masih perlu jawaban developer setelah studi kasus. Salah ketik adalah koreksi, klik ganda adalah deduplikasi; keduanya bukan uang masuk tambahan.

### P2 — Policy DP antar kategori belum seragam

Dokumen ide §2 dan §13 sudah menetapkan pembayaran awal minimum 50% dan boleh langsung 100%, bukan hanya untuk Psikoterapi. Gunakan aturan sumber ini; jangan meminta keputusan yang sama lagi. Harga ganjil memakai pembulatan ke atas ke Rupiah penuh untuk minimum DP sebagai aturan teknis target.

### P2 — Metode pembayaran manual perlu dikunci per kanal

Dokumen ide §13 menyebut transfer, QR, dan tunai. Pertahankan tiga metode manual ini; tanpa gateway. Transfer/QR memakai bukti/referensi bila tersedia dan tunai memakai penerimaan yang dicatat Admin. Belum ada implementasi penyimpanan privat maupun rekonsiliasi server.

### P2 — Telelayanan tampil sebagai katalog tetapi tidak dapat dibooking

Ini keputusan sengaja: paket Telelayanan dimasukkan dari PDF, tetapi `is_bookable=false` sampai service pelaksanaannya dibuat. Frontend harus menampilkan label “belum tersedia” agar pasien tidak mengira paket dapat dipesan.

## Ambiguitas katalog PDF yang masih harus dikunci

- PDF mencantumkan Konsultasi Telelayanan Rp750.000. Keputusan terbaru: paket tetap masuk katalog; detail service/kanal pelaksanaan ditunda dan belum boleh diasumsikan oleh frontend/backend.
- Asesmen Psikologis Dasar Rp350.000 sudah diputuskan sebagai satu harga yang mencakup testing dan evaluasi; appointment dapat dipisah dan Admin dapat menambahkan waktu lanjutan pada assessment case yang sama.
- Asesmen Psikologis Lengkap default penjadwalannya 4 jam, dengan deskripsi publik 2–4 jam.
- Formula additional time sudah diputuskan: 25% per blok 15 menit dan selalu dibulatkan ke atas.
- “Hasil laporan” yang termasuk pada Asesmen Lengkap dibedakan dari “surat laporan formal” Rp200.000; surat formal hanya ditambahkan bila diminta pasien. Format dan approval penerbitan tetap perlu implementasi.
- Jam klinik dan jam kerja Admin sudah dikonfirmasi sama; satu kalender operasional dipakai untuk keduanya.

- Fitur psikologi harus berhati-hati agar tidak dianggap diagnosis otomatis.
- Crisis/hotline information harus diverifikasi sebelum dipakai produksi.
- Nomor STR/SIP psikolog butuh validasi resmi pada implementasi nyata.

## Audit perbandingan desain — 2026-10-18

Laporan lengkap: [AUDIT_PERBANDINGAN_DESAIN_2026-10-18](audits/AUDIT_PERBANDINGAN_DESAIN_2026-10-18.md). Status awal temuan berasal dari audit statis, bukan hasil menjalankan aplikasi/test/build. Pembaruan setelah tanggapan developer dicatat pada setiap temuan terkait dan bagian tindak lanjut di bawah.

- **B01, B09, B12 — integritas pembayaran:** nominal pelunasan positif berapa pun langsung menjadi `PAID` dengan saldo nol; DP sebesar total belum otomatis menjadi lunas; sesi lanjutan non-billable dapat mewarisi `DP_PAID` dan menerima pelunasan pada appointment anak.
- **B02, B11 — konfirmasi reschedule:** reschedule pasien dapat menghasilkan `PENDING + DP_PAID` yang ditolak guard konfirmasi admin. Receipt admin tetap dibuat sebagai confirmed tanpa menunggu hasil action.
- **B03 — okupansi slot:** availability memakai appointment aktif, tetapi endpoint booking juga memeriksa flag slot tersimpan. Reschedule/cancel tidak membebaskan flag slot lama sehingga slot yang tampak tersedia dapat ditolak saat dipesan ulang.
- **B04 — periode kas:** laporan dan export memfilter tanggal konsultasi, bukan penerimaan pembayaran. Reschedule dapat menggeser uang masuk antarperiode.
- **B05 — pre-test:** satu record per pasien ditimpa saat pengisian berikutnya; belum ada submission/snapshot per booking. Beberapa jawaban klinis dikirim sebagai nilai default tetap.
- **B07 — diperbaiki pada source, belum diuji runtime:** akun pasien baru memakai helper UUID v4 pada login email, registrasi mock, dan walk-in. Helper login pasien baru tidak lagi memakai email contoh yang berulang setiap satu detik. Data lama tidak dimigrasikan dan relasi yang sudah telanjur ambigu tidak diperbaiki otomatis; backend tetap membutuhkan ID server/constraint unik.
- **B08, B10, B13–B16, B19 — alur lain:** tombol booking gratis tetap meminta field pembayaran tersembunyi; complete/no-show belum memeriksa waktu sesi; penghentian plan tidak menentukan nasib sesi aktif; pasien walk-in disimpan sebelum booking tervalidasi; audit reschedule menimpa perubahan sebelumnya; tombol edit review berujung guard duplikasi; helper tanggal besok tidak seragam terhadap timezone.
- **B17–B18 — kontrak integrasi:** client native fetch belum mengirim header XSRF untuk mode Sanctum cookie standar. Enum/nama payload, contoh response, DTO admin, upload proof, relasi pre-test, dan lokasi idempotency key belum satu kontrak. Backend belum tersedia sehingga dampak integrasi belum diuji.
- **D01–D05 — dokumentasi:** `LARAVEL_API_SPEC.md` aktif masih memuat tabel DASS, bertentangan dengan scope profiling dan pernyataan bahwa residu hanya ada pada catatan historis. Klaim sinkron 100% perlu dibaca bersama mismatch auth, status, endpoint, dan schema yang dirinci laporan.
- **K/H/P — keputusan requirement:** Desain developer dan baseline Eko berbeda pada arsitektur, DP, reschedule, role, pemesan/pasien, paket multi-sesi, keuangan, PDF, dan notifikasi. PDF paket juga memerlukan keputusan tentang harga psikoterapi per sesi/minimum empat, evaluasi asesmen terpisah, overtime, dan surat laporan.
- **Q01–Q07 — hipotesis belum direproduksi:** potensi lost update lintas tanggal/tab, race sesi lanjutan per plan, mutasi status bersamaan, fallback lock, data stale, retry/double submit, dan kegagalan storage. Jangan dilabeli sebagai hasil concurrency test.

Audit tidak menetapkan ide developer otomatis menggantikan keputusan Eko atau sebaliknya. Seluruh perubahan aturan dan implementasi perlu mengacu keputusan bersama berikutnya.

Pembaruan 2026-10-19: Laravel 13 dipilih; harga psikoterapi/minimum sesi, harga publik setelah login, Baileys, retensi awal satu tahun, dan batas reschedule dari dokumen ide sudah dicatat sebagai requirement. Detail payment timing psikoterapi, inclusion evaluasi asesmen, format receipt, dan permission final no-show/cancel masih memerlukan spesifikasi implementasi.

## Tindak lanjut tanggapan developer — 2026-10-18

- Requirement B01/B03/B04/B05 disetujui untuk diperbaiki: kurang bayar tetap memiliki saldo, slot lama dilepas saat reschedule efektif, kas tidak berpindah periode, dan pre-test tidak menimpa riwayat. Relasi/penjelasan ke transaksi dan booking tetap tersedia. Kode fitur-fitur tersebut belum diubah pada sesi ini.
- B02 dan konflik hold/SLA masih dijelaskan melalui studi kasus/rekomendasi; belum ada keputusan mengganti seluruh lifecycle.
- Definisi Guest, Pasien, Admin pekerja, dan satu Superadmin stakeholder ditegaskan. Penggantian enum role maupun migrasi arsitektur tidak dilakukan.
- Referensi alur/perbandingan dan status implementasi: [ALUR_PENGGUNA_DAN_PENYELARASAN_SISTEM](ALUR_PENGGUNA_DAN_PENYELARASAN_SISTEM.md).

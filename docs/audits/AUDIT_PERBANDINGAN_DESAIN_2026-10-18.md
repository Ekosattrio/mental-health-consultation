> **ARSIP AUDIT SEBELUM KOREKSI TERAKHIR.** Temuan dan rekomendasi berikut merekam kondisi ketika audit ditulis, bukan kontrak aktif. Lihat [hasil penyelarasan terbaru](AUDIT_PENYELARASAN_ATURAN_2026-10-19.md), [isu aktif](../KNOWN_ISSUES.md), dan keputusan manusia terbaru. Sesi penyelarasan ini hanya docs dan tidak memeriksa aplikasi.

# Audit perbandingan desain JiwaSehat — 18 Oktober 2026

Status: laporan analisis, belum merupakan persetujuan perubahan requirement atau implementasi perbaikan.

Pembaruan setelah tanggapan developer 2026-10-18: B07 telah diperbaiki pada source untuk akun baru menggunakan UUID v4 (belum diuji runtime). B01/B03/B04/B05 disetujui sebagai target perbaikan dan requirement aktif telah diperbarui; runtime fitur tersebut belum diubah. Penjelasan, keputusan role, dan saran arsitektur/reschedule/hold ada pada [ALUR_PENGGUNA_DAN_PENYELARASAN_SISTEM](../ALUR_PENGGUNA_DAN_PENYELARASAN_SISTEM.md). Isi audit di bawah mempertahankan bukti snapshot awal, bukan klaim bahwa semua temuan masih berstatus sama.

## 1. Kesimpulan utama

JiwaSehat dipahami sebagai sistem administrasi praktik psikologi tatap muka milik satu psikolog: publikasi layanan, identitas pasien, pre-test awal, reservasi, pembayaran manual, pengelolaan kedatangan dan sesi, perubahan jadwal, serta laporan owner. Website bukan tempat berlangsungnya konsultasi klinis daring.

Ide developer dan rancangan Eko memiliki fondasi produk yang sama, tetapi **belum menjadi satu spesifikasi yang konsisten dan dapat langsung diimplementasikan bersama**. Perbedaannya mencakup pihak yang boleh mengubah status, besaran DP, cara reschedule, identitas pasien, unit pembelian paket, ruang lingkup keuangan, dan arsitektur aplikasi. Sebagian merupakan pilihan produk yang sah; sebagian lain sudah menyebabkan alur kode buntu atau data salah.

Temuan paling mendesak:

1. Nominal pelunasan positif berapa pun mengubah pembayaran menjadi lunas dan sisa tagihan nol.
2. Booking dengan DP terverifikasi dapat buntu setelah reschedule pasien karena guard konfirmasi admin menolak `DP_PAID`.
3. Ada dua sumber kebenaran ketersediaan: appointment dan flag slot. Reschedule/pembatalan tidak membebaskan flag slot lama.
4. Laporan uang masuk mengikuti tanggal konsultasi, sehingga reschedule dapat memindahkan uang antarperiode tanpa ada transaksi uang baru.
5. Pre-test tersimpan satu per pasien dan ditimpa saat pengisian berikutnya, sehingga konteks historis sesi lama hilang.
6. Pembayaran dilakukan sebelum booking final berhasil, sementara pilihan slot belum dilindungi hold; pasien berpotensi sudah transfer ketika slot direbut orang lain.
7. Dokumen developer juga masih menyisakan konflik waktu antara hold H-1, SLA 12 jam operasional, dan konsultasi esok pagi; dokumen itu belum cukup untuk menentukan perilaku semua kasus batas.

Rekomendasi utama: satukan keputusan bisnis dan invariant data terlebih dahulu, lalu perbaiki alur kritis dan bekukan kontrak integrasi. Memindahkan frontend saat ini ke backend tanpa menyelesaikan kontradiksi tersebut akan memindahkan masalah yang sama ke database permanen.

## 2. Cakupan, metode, dan batas kepastian

### 2.1 Sumber yang dibaca

Urutan awal: `AGENTS.md`, `README.md`, kemudian seluruh file yang ditemukan di `docs`, lalu perbandingan dengan dokumen ide developer dan penelusuran source yang relevan. Nama `REAME.md` dipahami sebagai README; file yang tersedia adalah `README.md`.

Inventaris `docs` sebelum laporan ini dibuat: **26 file**, terdiri dari **19 Markdown, 2 PDF, dan 5 JSON konfigurasi Obsidian**.

Markdown yang dibaca seluruh isinya:

- `docs/Psikolog/JiwaSehat Project Index.md`.
- Di `docs/`: `AGENTS.md`, `README.md`, `WORKFLOW.md`, `CODING_RULES.md`, `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `BUSINESS_RULES.md`, `ROLES_PERMISSIONS.md`, `FEATURES.md`, `DATABASE.md`, `API.md`, `LARAVEL_API_SPEC.md`, `BACKEND_PACKAGE_AND_TREATMENT_PLAN_SPEC.md`, `DECISIONS.md`, `CHANGELOG.md`, `KNOWN_ISSUES.md`, `TODO.md`, `SESSION_HANDOFF.md`.

Lampiran:

- `SYSTEM_DESIGN_PRAKTIK_PSIKOLOGI.md` di Downloads, 1.819 baris: ide developer, selanjutnya disebut **Desain Anda**.
- `MoU WEBSITE.pdf`: 20 halaman, dibaca teks seluruh halamannya dan ditinjau render halamannya.
- `paket untuk website.pdf`: 1 halaman, dibaca teks dan rendernya.
- `.obsidian/app.json`, `appearance.json`, `core-plugins.json`, `graph.json`, dan `workspace.json`: konfigurasi vault, bukan aturan bisnis aplikasi.

Dokumentasi dalam repository disebut **dokumen Eko** sesuai penamaan developer. Atribusi ini tidak berarti setiap baris atau keputusan historis dapat dipastikan ditulis sendiri oleh Eko.

Instruksi di dokumen ide dan PDF diperlakukan sebagai **bahan yang dianalisis**, bukan instruksi baru untuk mengubah aplikasi, memutuskan konflik, atau menjalankan perintah. Aturan kerja mengikuti instruksi developer dan `AGENTS.md`.

### 2.2 Cara membaca temuan

- **Terbukti statis**: percabangan, tipe, atau aliran data terlihat langsung dalam source/dokumen. Belum berarti telah direproduksi di browser.
- **Konflik requirement**: dua sumber memberi perilaku yang berbeda. Belum dipilih mana yang berlaku.
- **Hipotesis risiko**: skenario masuk akal yang membutuhkan keputusan atau pengujian runtime/concurrency untuk memastikan dampaknya.
- **Keterbatasan prototype yang sudah diketahui**: mock, auth simulasi, LocalStorage, dan belum adanya backend. Tidak otomatis merupakan kesalahan implementasi prototype.

Prioritas: **P1** untuk integritas uang/data, akses, benturan jadwal, atau alur utama terhenti; **P2** untuk konsistensi operasional dan kontrak integrasi; **P3** untuk perapihan dokumentasi/UX. Prioritas bukan klaim bahwa kerugian produksi sudah terjadi.

Tidak menjalankan Git, aplikasi, dev server, build, TypeScript checker, unit test, integration test, atau E2E. Pengujian dalam laporan ini berupa penelusuran statis dan eksperimen skenario di atas aturan/kode. Klaim checker lolos pada 6 Oktober di dokumen lama tidak diverifikasi ulang dalam sesi ini.

### 2.3 Referensi sumber utama

Nomor baris source dan dokumen lama merujuk snapshot saat dibaca, sebelum catatan audit ditambahkan.

| Kode | Sumber |
|---|---|
| A | [Desain Anda](../references/SYSTEM_DESIGN_PRAKTIK_PSIKOLOGI.md) — salinan referensi dari Downloads, dipindahkan sebagai rujukan portabel20Oktober2026 |
| E-BR | [Business Rules Eko](<C:/laragon/www/mental-health-consultation/docs/BUSINESS_RULES.md>) |
| E-CTX | [Project Context Eko](<C:/laragon/www/mental-health-consultation/docs/PROJECT_CONTEXT.md>) |
| E-R | [Role dan permission](<C:/laragon/www/mental-health-consultation/docs/ROLES_PERMISSIONS.md>) |
| E-DB | [Database](<C:/laragon/www/mental-health-consultation/docs/DATABASE.md>) |
| E-API | [Ringkasan API](<C:/laragon/www/mental-health-consultation/docs/API.md>) |
| E-L | [Spesifikasi Laravel](<C:/laragon/www/mental-health-consultation/docs/LARAVEL_API_SPEC.md>) |
| E-TP | [Spesifikasi paket dan treatment plan](<C:/laragon/www/mental-health-consultation/docs/BACKEND_PACKAGE_AND_TREATMENT_PLAN_SPEC.md>) |
| E-D | [Keputusan dan riwayat revisi](<C:/laragon/www/mental-health-consultation/docs/DECISIONS.md>) |
| C | [AppContext](C:/laragon/www/mental-health-consultation/resources/js/context/AppContext.tsx) |
| P | [Endpoint mock pasien](C:/laragon/www/mental-health-consultation/resources/js/api/patientEndpoints.ts) |
| S | [Perhitungan jadwal](C:/laragon/www/mental-health-consultation/resources/js/data/scheduleConfig.ts) |
| B | [Wizard booking pasien](C:/laragon/www/mental-health-consultation/resources/js/components/patient/tabs/BookingTab.tsx) |
| R | [Reservasi admin](C:/laragon/www/mental-health-consultation/resources/js/components/admin/tabs/ReservationsTab.tsx) |
| F | [Analytics uang masuk](C:/laragon/www/mental-health-consultation/resources/js/components/admin/tabs/AnalyticsTab.tsx) |

Untuk sumber lain di bawah, path ditulis relatif terhadap `C:/laragon/www/mental-health-consultation/` agar mudah dicari dalam editor.

## 3. Pemahaman produk dan hal yang sudah selaras

### 3.1 Kesamaan yang kuat

- Satu praktik dengan psikolog sebagai owner/pengelola tertinggi; admin membantu operasional.
- Konsultasi berlangsung offline. Tidak ada kebutuhan marketplace, chat konsultasi, video call, atau voice call.
- Paket menjadi sumber harga, durasi, dan penawaran layanan.
- Booking normal tidak untuk hari yang sama. **H-1 kalender pada Desain Anda dan H+1 tanggal tujuan pada dokumen Eko pada dasarnya sejalan**, selama menggunakan tanggal WIB dan bukan selisih 24 jam.
- Pre-test merupakan informasi awal untuk psikolog, bukan diagnosis otomatis.
- Pembayaran manual dan verifikasi admin; harga lama perlu snapshot.
- Appointment dan pembayaran perlu dipisahkan, walaupun penjelasan lifecycle belum seragam.
- Database transaction, validasi ulang availability, authorization backend, private storage, audit, dan idempotency dibutuhkan untuk produksi.
- MySQL adalah target database pada kedua arah desain.

### 3.2 Apa yang benar-benar ada saat ini

Source merupakan prototype React/Vite yang berfungsi melalui `AppContext -> controller -> resources/js/api/*` mock, dengan persistence LocalStorage. Ada lapisan HTTP lain di `resources/js/legacy/api/*`, tetapi belum menjadi runtime aplikasi. Dua lapisan itu mempunyai kontrak dan tanggung jawab berbeda.

Tidak ditemukan backend Laravel yang terhubung pada konteks ini. Keberadaan service HTTP tidak membuktikan migrasi, policy, storage privat, queue, anti-double-booking lintas perangkat, atau laporan transaksi produksi sudah tersedia. Dokumentasi Eko sendiri mengakui keterbatasan tersebut.

Hal positif pada rancangan Eko: pemisahan portal, pemisahan status pembayaran/sesi, snapshot harga, perhatian pada jadwal/overlap/kuota, sesi lanjutan bertahap, role guard facade, dan dokumentasi pekerjaan backend yang belum selesai. Kekurangan berikut harus dibaca bersama fondasi tersebut.

## 4. Matriks perbandingan aturan dan scope

Semua baris merupakan bahan keputusan; tidak ada aturan yang otomatis diganti oleh audit.

| ID | Topik | Desain Anda | Dokumen/kode Eko | Konsekuensi |
|---|---|---|---|---|
| K01 | Arsitektur | Laravel 13 + React/Inertia 3, monolith; A §40–43 | Snapshot awal Eko: Laravel 12+ REST API + React/Vite SPA; keputusan 2026-10-19 sekarang menetapkan Laravel 13 REST API | Kontrak final adalah React/Vite SPA melalui API Laravel 13 pada satu VPS; Inertia tidak dipilih pada sesi ini. |
| K02 | DP awal | Minimal 50% harga final; bisa lebih atau 100%; A §13 | Nominal DP dikonfigurasi per paket, bisa kurang dari 50%; E-BR:97 | Paket Rp900 ribu dengan DP Rp100 ribu sah menurut model Eko dan tidak memenuhi aturan Anda. Catatan DP 50%, flat Rp100 ribu, dan configurable adalah urutan sejarah, bukan tiga aturan aktif sekaligus. |
| K03 | Verifikasi uang | Admin input/verifikasi nominal aktual, melihat sisa; A §14, §27 | Admin tidak melihat target harga/DP/sisa, input pelunasan satu arah; E-BR:84–86 | Operasional kas perlu mekanisme verifikasi mismatch dan koreksi. Menyembunyikan target bukan alasan untuk menandai semua nominal sebagai lunas. |
| K04 | Reschedule pasien | Request alasan -> approve/reject admin -> pilih slot -> perubahan atomik; maksimal tiga; A §18, §50 | Pasien langsung memilih dan memindahkan slot, lalu booking menjadi `PENDING`; E-BR:119–122 | Approval sebelum perpindahan berbeda dari konfirmasi setelah perpindahan. Slot lama dan baru mempunyai nasib berbeda. |
| K05 | Batas reschedule/no-show | Lock dua jam, kuota tiga, pemulihan maksimal empat hari setelah no-show; A §2, §18 | Belum ditetapkan dalam TODO; kode hanya status `PENDING/CONFIRMED` dan tanggal baru H+1 | Tidak bisa menganggap Eko telah mengimplementasikan kebijakan Anda. Tidak adanya kuota di kode belum melanggar kebijakan final Eko yang masih pending. |
| K06 | Same-day exception | Admin boleh lewat persetujuan owner; A §10–11 | Semua booking/reschedule wajib H+1; E-API:97, E-D:225–226 | Override hari/jam pada Eko bukan approval pengecualian bisnis yang dapat melewati H+1. |
| K07 | Pre-test walk-in | Wajib sebelum payment; flow admin juga melalui pre-test; A §2, §10 | Walk-in boleh tanpa pre-test awal; E-BR:20 | Definisikan apakah pengecualian berlaku untuk booking, pembayaran, atau juga sebelum konsultasi. Jangan diam-diam mengisi jawaban default sebagai pengganti. |
| K08 | Pemesan vs pasien | Booking untuk diri sendiri/orang lain; identitas terpisah; A §5 | `patientId` langsung user pemilik akun; C:643–645, 775–780 | Fitur booking anak/kerabat tidak tersedia dengan model yang sama. Memakai akun orang tua sebagai pasien akan mencampur profil dan pre-test. |
| K09 | Lifecycle dan peran admin | Admin check-in, in-consultation, complete, no-show; A §3, §16 | Complete/cancel/no-show hanya psikolog; E-R:95–96 | Harus diputuskan siapa melakukan aksi, kapan, dan apakah owner mewarisi izin admin. Role tertinggi tidak otomatis mewarisi semua endpoint. |
| K10 | Paket multi-sesi | Tidak dijelaskan sebagai domain treatment plan terpisah | Eko memakai induk treatment plan, sesi bertahap, satu pembayaran paket; E-BR:131–145 | Desain Anda belum memetakan domain utama yang sudah dirancang Eko. Ini gap desain, bukan alasan menghapus treatment plan. |
| K11 | Keuangan | Kas masuk, pengeluaran, surplus sederhana; A §25 | Hanya uang masuk, eksplisit tanpa biaya/laba; E-BR:158 | CRUD expense, hak koreksi, dan rumus laporan adalah tambahan scope terhadap baseline Eko. |
| K12 | Harga publik | Guest melihat harga/diskon; A §3–4 | Harga disembunyikan sebelum sign-in; E-CTX:94, E-R:18–23 | Jika harga dianggap rahasia, resource publik juga harus menyaring harga, bukan hanya menyembunyikan teks UI. |
| K13 | CMS dan export admin | Admin mengelola CMS/paket sesuai hak dan export jadwal; A §3, §21, §27 | CMS owner; admin dilarang cetak jadwal resmi; E-R:97–98 | Jangan menganggap akses admin pada Desain Anda sudah sesuai batas Eko. Export jadwal dan export klinis perlu dibedakan. |
| K14 | Receipt/PDF | Bukti DP dan lunas, akses sampai tujuh hari setelah selesai/batal; A §19 | Receipt frontend tanpa masa akses, satu representasi invoice appointment; E-BR:105–112 | Ada gap state/waktu, endpoint authorization, dan jenis dokumen. Menyembunyikan tombol tidak membatalkan file yang sudah diunduh. |
| K15 | WhatsApp | Operasional owner, link untuk detail pre-test; A §20 | Event pasien/admin/owner serta reminder berisi keluhan/profil ringkas; E-CTX:80–83, E-BR:153 | Penerima, payload, dan ruang lingkup integrasi berbeda. Minimalisasi data klinis perlu diputuskan eksplisit. |
| K16 | Login | Password, Google, register, forgot/reset; A §30 | UI saat ini tombol simulasi; role docs menyebut email tunggal; service HTTP memakai password; E-API:151–152 masih pending | Belum satu flow auth yang dapat diterima sebagai requirement final. |
| K17 | Panduan penggunaan | Video tutorial dan interactive tour per user; A §29 | Ada FAQ/panduan; katalog fitur/TODO belum memetakan tour/video sebagai deliverable setara | FAQ bukan bukti interactive tour atau video telah terpenuhi. |

## 5. Temuan source yang dapat dibuktikan secara statis

### B01 — P1: kurang bayar langsung menjadi lunas

**Bukti:** C:950–993. Syarat nominal hanya finite dan `> 0`; syarat transaksi hanya `paymentStatus === DP_PAID`. Sesudah itu selalu `PAID`, `remainingAmount: 0`, dan `finalPaymentAmount: Math.round(amount)`.

**Skenario:** total Rp900.000, DP Rp100.000, admin mencatat Rp1. Status menjadi lunas walaupun baru menerima Rp100.001. Angka positif kurang dari Rp0,50 juga lolos validasi awal kemudian dibulatkan menjadi nol.

**Dampak:** piutang hilang dari UI dan receipt, status pembayaran salah, koreksi tidak tersedia. Overpayment juga tidak dibedakan. E-TP:239–240 bahkan mengarahkan pola yang sama: input pelunasan -> langsung `PAID`.

**Usulan:** simpan setiap penerimaan terverifikasi; hitung `paid_total` dan saldo dari ledger. Kurang bayar tetap punya saldo. Putuskan penanganan kelebihan bayar dan pembulatan. Resource admin boleh tetap dibatasi sesuai keputusan bisnis, tetapi perhitungan server harus benar.

### B02 — P1: reschedule DP terverifikasi membuat konfirmasi ulang buntu

**Bukti:** C:923–927 hanya mengizinkan konfirmasi `DP_PENDING_VERIFICATION` atau `PAID`. C:1315–1324 mengubah reschedule pasien menjadi `PENDING` tanpa mengubah `DP_PAID`.

**Skenario:** `CONFIRMED + DP_PAID -> pasien reschedule -> PENDING + DP_PAID -> admin confirm -> ditolak`.

**Dampak:** jalur konfirmasi ulang resmi terhenti. Psikolog juga hanya boleh memproses sesi `CONFIRMED` (C:935–939). Pelunasan sebelum konfirmasi bisa mengubah kombinasi status, tetapi itu bukan penyelesaian yang benar untuk masalah ini.

**Usulan:** pisahkan approval perubahan jadwal dari verifikasi DP. DP yang telah terverifikasi tidak perlu diubah menjadi belum terverifikasi hanya untuk membuka guard konfirmasi.

### B03 — P1: slot lama tetap dianggap dipesan setelah pindah/batal

**Bukti:** S:237–243 menghitung availability dari appointment aktif. `PatientController.bookAppointment` menandai `ScheduleSlot.isBooked` dan menyimpannya ke state. P pada awal `bookAppointment` menolak slot yang `isBooked` atau tidak available. C:1315–1328 hanya mengubah appointment saat reschedule; endpoint update status juga hanya mengubah appointment.

**Skenario:** pesan slot dinamis X -> pindah ke Y atau dibatalkan -> appointment tidak lagi memakai X -> engine menampilkan X available -> booking ulang memakai ID X -> endpoint menemukan flag `isBooked` lama -> ditolak.

**Batas:** terutama berlaku untuk slot yang mempunyai record tersimpan dengan ID sama. Tidak semua kandidat interval akan terkena.

**Usulan:** satu sumber kebenaran okupansi. Jika record slot tetap dipertahankan, perpindahan dan pelepasan slot harus satu operasi konsisten dengan appointment, termasuk semua interval yang overlap.

### B04 — P1: laporan kas bergerak mengikuti reschedule

**Bukti:** F:65–76 memfilter berdasarkan `appointment.date`; `ExportFinancePage.tsx:127–151` melakukan hal serupa. `utils/payments.ts` menggabungkan DP dan pelunasan ke satu nilai appointment, bukan satu baris per penerimaan.

**Skenario:** DP diterima 31 Oktober, sesi 2 November, pelunasan 2 November. Laporan saat ini mengakui seluruh nilai di November. Jika sesi dipindah ke Desember, nilai ikut pindah ke Desember. Tidak ada perpindahan uang yang mendasarinya.

**Dampak:** tidak memenuhi basis kas pada Desain Anda; juga tidak tepat disebut riwayat mutasi kas nyata tanpa keterangan bahwa pengelompokan memakai tanggal sesi. Jumlah transaksi dan rata-rata per transaksi sebenarnya menghitung appointment berbayar, bukan jumlah transaksi pembayaran.

**Usulan:** pisahkan `received_at`, `verified_at`, dan `consultation_at`; laporan kas memakai tanggal penerimaan yang terverifikasi. Tanggal verifikasi berbeda dari tanggal uang diterima.

### B05 — P1: pre-test berikutnya menimpa riwayat pasien

**Bukti:** C:216 bertipe `Record<patientId, IntakeForm>`. `PatientController.submitIntakeForm` menyimpan `[patientId]: savedIntake` dan mengubah `hasIntakeForm` pada seluruh appointment pasien. `PatientsTab.tsx:43,63,117` membaca pre-test dari pasien, bukan appointment.

**Skenario:** keluhan untuk booking A disimpan, kemudian pasien mengisi keluhan berbeda untuk booking B. Record A tidak mempunyai versi jawaban tersendiri yang dapat direkonstruksi dari state ini.

**Dampak:** riwayat sesi lama kehilangan konteks; `hasIntakeForm` tidak membuktikan bahwa formulir yang relevan untuk sesi itu selesai.

**Temuan terkait:** B:284–301 mengirim `previousTherapy: false`, `currentMedications: 'Tidak ada'`, dan `suicideRiskFlag: false` secara tetap, serta fallback tanggal lahir/gender. Data yang tidak ditanyakan berisiko dicatat sebagai jawaban negatif atau identitas nyata. Ini temuan kualitas data, bukan penilaian klinis pasien.

**Usulan:** submission/version per pasien aktual dan booking/session, snapshot pertanyaan/jawaban; nilai belum diketahui harus dibedakan dari jawaban “tidak”.

### B06 — P1 untuk produksi, keterbatasan yang diakui: login belum autentikasi nyata

**Bukti:** C:530–568 langsung memilih akun berdasarkan email. `LoginModal.tsx` hanya menyediakan tombol Google simulasi dan akses cepat; tombol Google memilih email mock tetap. Tidak terlihat form email/password aktif pada modal ini. Tidak ada pembuktian kepemilikan email atau login Google nyata dalam jalur tersebut.

**Dampak:** boleh untuk demonstrasi data dummy, tidak layak menjadi kontrol akses produksi. Guard role dalam JavaScript dan seluruh data pada browser bukan batas keamanan.

**Nuansa dokumentasi:** bukan penemuan bahwa “backend diam-diam tidak aman”; backend belum tersedia dan simulasi sudah diakui. Yang tidak konsisten adalah klaim fitur email/password tersedia sebagai flow pada beberapa dokumen, sementara modal aktif tidak menampilkan flow itu.

### B07 — P1: ID akun baru berulang setiap 10 detik

**Bukti:** C:550 memakai `Date.now().toString().slice(-4)` untuk ID user baru.

**Skenario:** dua pendaftaran pada waktu t dan t+10.000 milidetik mempunyai empat digit akhir timestamp sama, sehingga ID sama walaupun email berbeda.

**Dampak:** lookup berdasarkan ID menjadi ambigu; appointment, intake, dan profil dapat terkait akun yang salah. Ini bukan sekadar kemungkinan acak pada skala besar; konstruksi ID mempunyai periode 10 detik.

**Usulan:** UUID/ULID atau ID server unik; email dinormalisasi dan diberi constraint unik. ID appointment berbasis timestamp dan booking code acak juga perlu constraint/retry di backend.

### B08 — P2: booking gratis tidak dapat dikirim lewat tombol normal

**Bukti:** B:188 memakai `requiresPayment = payableAmount > 0`; field bukti/pengirim hanya muncul saat perlu pembayaran. Namun B:1289 tetap menonaktifkan tombol jika `!proofName || !transferSenderName` tanpa memeriksa `requiresPayment`.

**Skenario:** paket harga nol atau diskon 100%, consent sudah dicentang, tidak ada field pembayaran -> tombol tetap disabled.

**Usulan:** selaraskan kondisi tombol dengan validasi submit dan keputusan apakah paket gratis memang diizinkan.

### B09 — P2: DP sama dengan total tetap berlabel belum lunas

**Bukti:** P menghitung `dpAmount = min(configuredDpAmount, payableAmount)`, tetapi `isFullPayment` hanya benar untuk paket gratis atau kode `FULL` walk-in. `AdminController.updateAppointmentStatus` mengubah konfirmasi non-PAID menjadi `DP_PAID`.

**Skenario:** setelah diskon total Rp100.000, DP Rp100.000. Sisa nol, tetapi setelah verifikasi status `DP_PAID`; aksi pelunasan tambahan tetap tersedia.

**Dampak:** kewajiban nol diperlakukan belum lunas; input pelunasan positif dapat menciptakan kelebihan bayar. Usulan: status dihitung dari jumlah penerimaan terverifikasi terhadap harga final.

### B10 — P1/P2: sesi masa depan bisa selesai atau no-show

**Bukti:** C:932–940 memeriksa role, pemilik, status awal, dan target; tidak memeriksa waktu sesi. `psychologist/tabs/HistoryTab.tsx` menampilkan aksi atas sesi terkonfirmasi berdasarkan status.

**Skenario:** sesi minggu depan berstatus confirmed dapat ditandai complete/no-show hari ini melalui aksi tersebut.

**Dampak:** progres paket dan hak review muncul sebelum layanan berlangsung; no-show prematur mengubah hak pasien. Usulan: tetapkan batas waktu dan mekanisme koreksi/override dengan alasan; cancellation memang dapat terjadi sebelum sesi sehingga atur terpisah.

### B11 — P1/P2: receipt sukses dibuat sebelum hasil konfirmasi diketahui

**Bukti:** R:156–162 memanggil `updateAppointmentStatus` lalu langsung membuat salinan receipt `CONFIRMED/DP_PAID`. Facade C:914 bertipe void dan tidak mengembalikan promise hasil controller. Controller update status berjalan async.

**Skenario:** pada kasus B02 guard menolak konfirmasi, tetapi modal receipt tetap menyatakan terkonfirmasi. Saat request gagal pada integrasi nanti, pola UI ini juga berisiko menyatakan sukses lebih dahulu.

**Usulan:** action mengembalikan hasil yang dapat ditunggu; receipt berasal dari data transaksi/booking yang benar-benar berhasil tersimpan.

### B12 — P1: sesi lanjutan nol rupiah bisa menerima “pelunasan” baru

**Bukti:** C:1147–1167 menyalin appointment sumber, mengosongkan total/DP/sisa dan field final-payment, tetapi mempertahankan `paymentStatus`. Jika sumber `DP_PAID`, anak juga demikian. C:969–983 menerima pelunasan pada semua appointment `DP_PAID` tanpa guard bahwa appointment adalah induk tagihan atau mempunyai saldo.

**Skenario:** sesi 1 completed tetapi belum lunas -> jadwalkan sesi 2 dengan total nol dan `DP_PAID` -> admin melihat tombol pelunasan pada sesi 2 -> input nominal -> uang dicatat pada sesi anak. Induk tetap mempunyai saldo lama.

**Dampak:** split tagihan dan status pembayaran paket tidak konsisten; laporan dapat menerima uang tambahan pada entitas yang seharusnya non-billable.

**Usulan:** tagihan/payment melekat pada satu induk pembelian; appointment mengacu status tagihan tersebut dan tidak menduplikasi kewajiban.

### B13 — P2: penghentian paket tidak menyelesaikan nasib slot aktif

**Bukti:** C:1215–1228 hanya mengubah `treatmentPlanStatus`, tidak mengubah `Appointment.status`. S:237–243 tetap menganggap appointment `CONFIRMED/PENDING/IN_PROGRESS` mengunci slot. `TreatmentPlansTab.tsx:60–77` dapat tetap memiliki `nextAppointment` walaupun plan dihentikan.

**Skenario:** owner menghentikan paket yang punya sesi berikutnya -> sesi tersebut tetap confirmed dan memblokir kapasitas.

**Status penilaian:** efek kode terbukti; apakah slot harus dilepas langsung atau dipertahankan sementara merupakan keputusan bisnis yang belum ada. UI perlu memberi konsekuensi yang jelas, bukan meninggalkan sesi aktif tanpa tindak lanjut.

### B14 — P2: pembuatan pasien walk-in terjadi sebelum booking tervalidasi

**Bukti:** C:655–683 menyimpan pasien baru sebelum lock/validasi slot dan paket pada C:699–731.

**Skenario:** admin mengisi pasien baru, slot ternyata penuh -> booking gagal -> akun pasien tetap tersimpan. Pengulangan dengan email sama dapat ditolak sebagai duplikat.

**Usulan:** pilih secara eksplisit: registrasi pasien merupakan langkah independen yang tetap sah dan harus diberitahu ke admin, atau pasien+booking dibuat atomik. Jangan menampilkan satu operasi seolah seluruhnya rollback.

### B15 — P2: audit reschedule hanya menyimpan perubahan terakhir

**Bukti:** C:1321–1324 menimpa empat field reschedule pada appointment. Tidak ada daftar event lama atau nomor urut perubahan dalam model runtime.

**Skenario:** pasien pindah A->B, admin pindah B->C -> alasan dan pelaku perpindahan A->B hilang dari state tersebut.

**Dampak:** field ini bukan audit trail lengkap dan tidak cukup untuk kuota tiga reschedule, pemisahan owner exception, sengketa jadwal, atau rekonstruksi kejadian.

**Usulan:** request dan event append-only berisi actor ID, role saat aksi, jadwal lama/baru, reason, jenis, dan timestamp; snapshot nama hanya tambahan.

### B16 — P2: “Edit Ulasan Saya” tidak punya jalur update

**Bukti:** `patient/tabs/HistoryTab.tsx:640–641` menyediakan tombol edit, mengisi form dari ulasan lama, tetapi submit pada :138–148 selalu memakai `submitReview`. C:806–808 menolak jika review/`reviewId` sudah ada.

**Dampak:** tombol menawarkan aksi yang akan ditolak. Reject admin menghapus review dari array (`api/adminEndpoints.ts`), tetapi `appointment.reviewId` tidak dibersihkan; keputusan apakah review boleh diajukan ulang menjadi tidak eksplisit.

**Usulan:** tentukan satu review selamanya atau review dapat direvisi; implementasikan update/moderasi ulang jika diperbolehkan. Desain Anda juga menyebut komentar opsional, sementara C:811 mewajibkan komentar.

### B17 — P1 untuk integrasi cookie: persiapan CSRF belum lengkap

**Bukti:** `services/api/client.ts` memanggil `/sanctum/csrf-cookie`, tetapi `buildHeaders` tidak membaca cookie `XSRF-TOKEN` dan tidak mengirim `X-XSRF-TOKEN`. Client memakai native fetch, bukan library yang menambahkan header tersebut otomatis.

**Penilaian:** kandidat kegagalan integrasi bila memilih Sanctum SPA cookie dengan perlindungan CSRF standar; bukan bug runtime mock yang sudah diuji. Mode bearer mempunyai konsekuensi berbeda.

**Usulan:** lengkapi alur sesuai mode auth yang dipilih. Rujukan primer: [Laravel Sanctum, CSRF Protection](https://laravel.com/framework/docs/13.x/sanctum#csrf-protection) menjelaskan bahwa nilai cookie perlu di-URL-decode dan dikirim melalui header tersebut. Tidak perlu mematikan CSRF untuk mengatasi masalah ini.

### B18 — P1/P2 untuk integrasi: payload dan response tidak satu kontrak

**Bukti yang berbeda dari sekadar snake_case/camelCase:**

- E-TP memakai kategori `COUNSELING/ASSESSMENT/PSYCHOTHERAPY`; `types/index.ts` dan `packageService.ts` memakai `KONSELING/ASESMEN/PSIKOTERAPI`.
- E-TP memakai `session_type: CONTINUOUS_CARE` dan `total_sessions`; service memakai `is_continuous_care` dan `session_count`.
- Contoh response E-L:26–30 memakai `booking_code/payment_status/total_amount`; service mengklaim hasil sebagai `Appointment` camelCase. `normalizeResponse` hanya membuka envelope, tidak memetakan field. Helper `mapApiResponse` tersedia tetapi tidak dipakai pada service tersebut.
- E-TP:194 menyebut `/toggle-status`; service/ringkasan API memakai `/status`.
- E-TP:216 mensyaratkan header `Idempotency-Key`; `treatmentPlanService.ts` mengirim `idempotency_key` di body, dan public method client tidak menerima custom header.
- Request pre-test pada service tidak mempunyai appointment ID; skema E-L:207 membutuhkan relasi appointment. Urutan create/link harus ditentukan agar tidak memerlukan booking dan pre-test yang saling menunggu.
- Upload bukti memakai endpoint setelah appointment ada, sedangkan E-TP:254 mewajibkan file dalam request pembuatan. `CreateAppointmentPayload` berupa JSON tanpa file.
- Resource admin dituntut tidak mengembalikan harga, tetapi `Appointment` yang digunakan bersama mengharuskan `totalAmount`; tidak ada kontrak DTO admin terpisah. `AppointmentReceipt` admin juga menggunakan tipe appointment lengkap.

**Dampak:** jika backend dibangun mengikuti contoh dokumen dan frontend mengikuti service, validasi gagal atau UI menerima `undefined` walaupun TypeScript tampak lolos. Ini ketidakcocokan kontrak yang terlihat, bukan bukti response backend nyata sudah salah.

**Usulan:** satu schema request/response per role, contoh payload tersanitasi, mapping eksplisit, dan contract test. Jangan memakai type assertion sebagai transformasi data.

### B19 — P2: “besok” dapat menjadi hari ini pada dini hari WIB

**Bukti:** `TreatmentPlansTab.tsx:26–29` menambah tanggal lokal satu hari lalu langsung `toISOString().slice(0,10)`. Helper pada `psychologist/tabs/HistoryTab.tsx:15–19` sudah mengoreksi offset, sehingga dua layar berbeda.

**Skenario:** 18 Oktober pukul 01:00 WIB -> tanggal lokal ditambah menjadi 19 Oktober 01:00 WIB -> ISO UTC masih 18 Oktober -> form terisi hari ini -> facade menolak H+0.

**Temuan terkait:** tanggal pada sebagian guard menggunakan timezone browser, bukan dipaksa `Asia/Jakarta`; timestamp audit memakai UTC lalu menghapus penanda timezone. Hindari menampilkan timestamp tersebut seolah WIB. Gunakan waktu server dan format/offset eksplisit.

## 6. Ambiguitas dalam Desain Anda yang perlu diselesaikan

Dokumen Anda lebih eksplisit pada banyak batas bisnis, tetapi belum cukup deterministik untuk seluruh kasus berikut. Ini bukan alasan memilih aturan Eko secara otomatis.

### H01 — P1: hold H-1 bertabrakan dengan SLA verifikasi

A §9 membatasi hold hingga deadline H-1, sedangkan §15 memberi SLA 12 jam operasional.

Contoh: sesi 20 Oktober 09:00; booking 19 Oktober 23:58; hold berakhir 23:59. Bukti dikirim 23:58:30, admin baru mulai kerja esok pagi. Jika hold dibebaskan saat deadline, slot dapat ditawarkan lagi walaupun pasien sudah membayar. Jika menunggu 12 jam operasional, perlindungan SLA bahkan dapat datang setelah jam konsultasi.

Perlu aturan terpisah untuk batas membuat booking, batas mengirim bukti, perlindungan setelah bukti terkirim, dan SLA pemeriksaan. Tentukan status apa yang tetap mengunci slot. Auto-confirm booking tidak boleh otomatis menghasilkan uang masuk/receipt penerimaan terverifikasi.

### H02 — P1: pasien transfer sebelum berhasil memiliki booking

Pada flow Anda, pre-test diikuti booking+hold sebelum payment; ini arahnya membantu. Namun hold baru dimulai setelah pre-test, jadi slot yang dipilih sebelum formulir panjang belum tentu masih tersedia saat selesai. Kode Eko lebih berisiko: pembayaran/instruksi transfer terjadi sebelum final submit yang baru membuat appointment.

Perlu quote/booking draft yang mempunyai identitas dan expiry, serta revalidasi slot sebelum menampilkan instruksi pembayaran. Tentukan penanganan transfer masuk setelah hold expired, bukti palsu, bank terlambat, dan pembayaran tanpa referensi. Uang yang benar-benar diterima tidak boleh hilang hanya karena slot sudah dilepas.

### H03 — P1: approval reschedule belum menjelaskan kapan slot dipindah

A §18/§50: admin approve dahulu, pasien kemudian memilih slot. Belum jelas apakah approval berlaku tanpa batas, apakah slot lama tetap milik pasien, dan apa yang terjadi ketika pemilihan baru baru dilakukan sesudah batas dua jam atau setelah sesi lama terlewat.

Tetapkan expiry approval, versi jadwal yang disetujui, satu request aktif, kapan kelayakan diperiksa, dan apakah request pending membekukan slot lama. Atomic update harus gagal tanpa menghilangkan slot lama jika slot baru sudah tidak tersedia.

### H04 — P1: batas empat hari belum punya definisi timestamp final

“Empat hari kalender sejak jadwal terlewat” dapat berarti hari keempat pukul 23:59 WIB atau tepat 96 jam sesudah jam sesi. Itu berbeda. Tentukan dihitung dari `scheduled_start`, `scheduled_end`, atau tanggal sesi; jangan memakai waktu admin menekan no-show kecuali memang diinginkan.

Jika admin terlambat menandai no-show lima hari, pasien tidak boleh diam-diam kehilangan jalur pengajuan yang baru dibuka sesudah penandaan. Definisikan bukti pengajuan tepat waktu dan status request yang melindungi hak sebelum review admin selesai.

### H05 — P1: kuota tiga kali dan owner exception belum memiliki unit

Apakah kuota per booking, per sesi dalam paket, atau per seluruh treatment plan? Apakah pindah ke slot sama dihitung? Apakah no-show berulang mengulang batas empat hari? Apakah owner dapat memperpanjang masa berlaku dan melewati kuota habis?

Definisi yang dapat diuji perlu memisahkan requested/approved/applied/rejected/expired/cancelled. Counter hanya bertambah sekali ketika perubahan jadwal efektif berhasil. Owner exception memakai jenis event tersendiri dan tidak mengubah counter pasien.

### H06 — P1: tidak hadir, terlambat, dan sesi selesai belum mempunyai guard waktu

“Setelah sesi terlewat” bisa berarti setelah mulai atau selesai. Belum ada grace period, definisi datang terlambat, siapa bisa mengoreksi salah no-show, dan apakah checked-in boleh menjadi no-show.

Tentukan check-in awal, konsultasi molor, pasien datang setelah marked no-show, dan penutupan sesi yang berakhir dini. Hindari satu kolom status dipakai untuk menyimpulkan semua fakta tersebut.

### H07 — P1: completed harus menunggu lunas atau tidak

Flow Anda menempatkan pelunasan sebelum completed; belum eksplisit apakah sesi yang benar-benar selesai tetapi pasien masih berutang tetap boleh dicatat selesai. Eko memisahkan kedua status secara eksplisit.

Saran desain: fakta layanan selesai dan saldo tagihan adalah dua hal berbeda. Ini usulan; keputusan final diperlukan karena memengaruhi review, PDF tujuh hari, progres paket, dan laporan jumlah konsultasi.

### H08 — P1: pembatalan praktik dan dana pasien

Kebijakan “tidak ada pengembalian dana” belum menjelaskan owner membatalkan, praktik tutup panjang, pembayaran ganda, salah transfer/lebih bayar, atau layanan tidak dapat disediakan. Empat hari pemulihan no-show juga perlu menangani tidak adanya slot yang cocok dalam rentang itu.

Bedakan deadline **mengajukan** reschedule dari deadline **tanggal sesi pengganti**. Jangan menganggap keduanya sama. Untuk dana hangus, jelaskan yang berakhir adalah hak menggunakan layanan, sementara fakta penerimaan kas tetap disimpan dan tidak dihitung ulang sebagai pendapatan baru. Bagian ini menandai kebutuhan produk; bukan kesimpulan hukum.

### H09 — P1: unit harga dan multi-payment belum lengkap

Minimal 50% dihitung dari total paket atau harga per sesi? Apa yang berlaku saat diskon 100%/harga nol? Uang disimpan dalam Rupiah bulat atau desimal? Untuk harga Rp300.001, minimum 50% perlu aturan pembulatan agar tidak kurang dari batas.

Tetapkan pembayaran aktual kurang DP, cicilan kedua yang belum melunasi, overpayment, koreksi salah input, transaksi ditolak, dan bukti dipakai dua kali. Minimal DP adalah aturan kelayakan reservasi; uang aktual yang sudah masuk tetap perlu dicatat walaupun di bawah minimum.

### H10 — P1: pasien aktual dan izin pemesan belum terdefinisi penuh

Desain Anda sudah benar membedakan pemesan dari pasien, tetapi “pemilik akun dapat melihat booking” tidak otomatis memberikan hak membaca jawaban klinis pasien dewasa lain. Perlu relasi wali/kuasa, bukti persetujuan, batas akses pembayaran vs pre-test, dan pengalihan akses saat pasien mempunyai akun sendiri.

Untuk paket pasangan/keluarga dalam PDF, satu booking dapat melibatkan lebih dari satu peserta. Tentukan satu orang penanggung jawab, peserta klinis, formulir per peserta atau bersama, dan aturan pengaksesan. Jangan menduplikasi booking terpisah untuk satu waktu yang sama hanya untuk mewakili dua peserta.

### H11 — P1/P2: snapshot tidak cukup hanya harga

Perubahan durasi, jumlah sesi, jenis paket, nama layanan, isi benefit, profil pasien, atau tarif tambahan sesudah pembelian juga dapat mengubah interpretasi transaksi lama. Tentukan snapshot pembelian dan snapshot sesi, serta bagian yang memang mengikuti data master terbaru.

Harga paket berubah ketika pasien sedang membaca instruksi transfer: server menghitung ulang itu benar untuk mencegah manipulasi, tetapi harus memberitahu perubahan quote sebelum pasien transfer. Jangan menghitung ulang harga sesudah uang dikirim tanpa mekanisme rekonsiliasi.

### H12 — P1/P2: status reservasi dan pembayaran harus ortogonal

Daftar status A §17 belum menentukan tabel transisi. `CONFIRMED_AUTO_SLA` adalah cara konfirmasi; `PENDING_RECONCILIATION` adalah status pemeriksaan uang. Kombinasi sah dan tindakan yang diizinkan perlu ditulis, misalnya boleh check-in meski rekonsiliasi belum selesai atau tidak.

Pisahkan minimal lifecycle appointment, lifecycle booking/hold, status pembayaran agregat, status transaksi individual, dan status request reschedule. Tidak harus membuat semua kolom tersebut jika model lain setara, tetapi semua konsep harus terwakili.

### H13 — P1/P2: perubahan availability terhadap booking lama

Jika owner menutup tanggal yang sudah ada pasien confirmed, hanya menutup slot baru tidak menyelesaikan jadwal lama. Tentukan warning, daftar terdampak, persetujuan perubahan, dan notifikasi.

Pada Eko, holiday diperiksa sebelum custom override (S:191–205); override buka tidak dapat membuka tanggal yang ada di daftar libur. Jika kedua setting boleh dibuat bersamaan, UI harus menjelaskan prioritas. Override jam/kategori layanan, buffer, jam istirahat, dan overtime perlu satu mesin aturan.

### H14 — P2: PDF tujuh hari tidak mencakup semua status terminal

A §19 memakai completed/cancelled, tetapi bagaimana no-show, expired, forfeited, atau treatment plan yang berhenti? Kapan bukti DP yang diterima sebelum sesi dapat diunduh? Untuk paket empat sesi, “konsultasi selesai” berarti sesi pertama, setiap sesi, atau paket selesai?

Tetapkan akses on-demand, expiry signed URL, koreksi/reissue dokumen, nomor unik, dan snapshot dokumen. Masa unduh bukan kebijakan retensi transaksi dan tidak dapat menarik file yang telah disimpan pasien.

### H15 — P1/P2: consent, retensi, dan file privat masih konseptual

Consent perlu subjek pasien, pemberi persetujuan/kuasa, versi naskah, tujuan pemrosesan, waktu, dan perubahan persetujuan. Dalam kode Eko, pre-test sudah tersimpan pada langkah dua sebelum checkbox consent langkah tiga; flag consent juga tidak dikirim ke facade booking mock. Dokumen Eko mengetahui belum ada audit backend, tetapi urutan pengumpulan perlu diputuskan.

Bukti pembayaran seharusnya file privat, dengan endpoint download/preview berizin; kolom `payment_proof_url` yang dapat berisi URL/path tidak boleh otomatis diperlakukan sebagai URL publik permanen. Log, export, backup, dan notifikasi juga mengandung data sensitif. Tentukan masa simpan dan penghapusan tiap kategori, termasuk akses operator teknis dan pemulihan backup.

### H16 — P1/P2: concurrency belum cukup dijelaskan dengan “pakai transaction”

Dua interval 09:00–10:30 dan 10:00–11:00 tetap overlap walaupun jam mulai berbeda. Unique `(psychologist_id,date,start_time)` tidak cukup. Index jadwal mempercepat pencarian, bukan menolak overlap.

Usulan pola yang perlu diuji: semua mutasi pada psikolog/tanggal yang sama mengunci satu record resource hari yang stabil, lalu cek overlap, buffer, kuota, dan simpan dalam transaksi. Gunakan protokol sama untuk booking pasien, admin, hold, reschedule, exception, dan perubahan availability. Untuk reschedule lintas hari, kunci kedua resource dalam urutan tetap; untuk sesi lanjutan kunci juga induk treatment plan.

Ini contoh rancangan, belum keputusan final. [Dokumentasi locking reads MySQL](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html) menjelaskan locking dan pelepasannya saat transaksi selesai; efektivitas guard overlap tetap harus diuji terhadap query, index, isolation level, dan semua jalur tulis yang dipilih.

### H17 — P1/P2: queue/notifikasi perlu aman terhadap perubahan jadwal

Reminder lama yang sudah masuk queue tidak boleh dikirim dengan waktu lama setelah reschedule. Job perlu mengecek status dan versi jadwal saat eksekusi. Retry WA tidak boleh membuat pesan atau transaksi ganda. Tentukan deduplication key, retry, status gagal, dan fallback operasional jika provider tidak tersedia.

SLA 12 jam, reminder dua jam, rekap harian, dan expiry hold membutuhkan kalender operasional sendiri yang definisinya jelas; kalender jam kerja admin belum tentu sama dengan jam layanan psikolog.

## 7. Ketidakkonsistenan internal dokumen Eko

### D01 — P2: DASS masih berada pada spesifikasi backend aktif

E-L:220–231 masih mendefinisikan `dass21_results` beserta skor/interpretasi. `KNOWN_ISSUES.md:11` menyatakan hanya catatan historis changelog yang masih menyebutnya; itu tidak sesuai isi E-L. `TODO.md` dan konteks aktif menyatakan scope profiling saja. Backend developer yang mengikuti spesifikasi tersebut dapat menghidupkan kembali fitur di luar scope.

### D02 — P2: klaim sinkron 100% lebih kuat daripada buktinya

`SESSION_HANDOFF.md:65` menyebut dokumentasi sudah sinkron 100%, tetapi masih ada DASS, auth yang berbeda, endpoint status berbeda, model DTO berbeda, dan record payments/invoice/consent yang belum dimodelkan rinci pada E-L. TypeScript lolos tidak menguji hal tersebut.

Status checklist perlu membedakan UI prototype selesai, contract draft, runtime QA, dan backend production ready. Jangan membaca `[x]` prototype sebagai sudah siap produksi.

### D03 — P2: rancangan database belum satu schema yang dapat dieksekusi

E-DB menyebut `payments`, `invoices`, `consents`, notification log, dan audit; E-L merinci tabel lain dan masih DASS. E-TP migration treatment plan tidak menyertakan `next_session_number` yang diwajibkan narasinya. E-L memakai override libur/kuota tanpa start/end override, padahal UI dan E-DB mengklaim custom jam.

Tipe ID `uuid / bigIncrements` dan relasi `foreignId` harus dipilih konsisten; itu belum otomatis bug selama belum ada migration nyata, tetapi menyalin contoh yang berbeda tanpa penyelarasan akan bermasalah. `onDelete('cascade')` untuk user -> treatment plan dan `nullOnDelete` hubungan plan perlu dievaluasi terhadap kebutuhan menjaga riwayat transaksi dan klinis.

### D04 — P2: FAQ publik memberikan aturan reschedule berbeda

`LandingPage.tsx:899` menyatakan minimal H-1 dan menjelaskannya sebagai **24 jam sebelum sesi**. E-BR:117 hanya mengatur tanggal pengganti H+1 dan kode tidak menolak berdasarkan selisih jam terhadap sesi lama. Desain Anda justru lock dua jam.

Ada tiga konsep berbeda: tanggal tujuan minimal besok, deadline mengajukan minimal 24 jam, dan lock dua jam. Teks publik yang tidak sesuai perilaku dapat menimbulkan sengketa meskipun form terlihat berfungsi.

### D05 — P2: status tidak seragam

E-BR:29–39 tidak mencantumkan `IN_PROGRESS` dan `DP_PENDING_VERIFICATION` pada daftar awal, tetapi bagian lain dan type menggunakannya. Type `Appointment.paymentStatus` menambah `FINAL_PENDING_VERIFICATION` yang tidak ada di enum E-L. Desain Anda membutuhkan checked-in/held/expired/auto-SLA yang belum dipetakan.

`REFUNDED` adalah state pada Eko, sementara kebijakan refund masih pending. Keberadaan enum tidak membuktikan refund sudah disetujui atau diimplementasikan. Harus ada transisi dan event transaksi yang mendasarinya.

### D06 — P2/P3: riwayat keputusan bercampur dengan aturan aktif

Perubahan avatar dihapus lalu ditambahkan lagi, DP 50% -> flat -> configurable, dan DASS aktif -> dihapus, memang dapat dijelaskan oleh kronologi. Itu bukan otomatis kontradiksi aktif. Masalahnya belum ada penanda keputusan superseded dan daftar satu aturan terkini yang mengacu keputusan terakhir.

`Pending Decisions` E-D masih menyebut payment gateway, padahal scope Anda menolak gateway. Dokumen harus mempertahankan sejarah tetapi memberi status jelas agar coding agent tidak memilih keputusan lama secara arbitrer.

## 8. Temuan dari PDF yang tidak boleh hilang dalam penyatuan desain

### P01 — P1: Rp500 ribu per sesi minimum empat bukan otomatis bundle empat sesi

PDF paket menyebut psikoterapi harga per sesi Rp500.000 dengan minimal empat sesi. Eko mengubahnya menjadi paket intensif empat sesi Rp2 juta dan satu tagihan induk. Jumlah total sama untuk empat sesi, tetapi model transaksi dan kewajiban pasien berbeda.

Perlu konfirmasi apakah minimum empat merupakan pembelian di muka, komitmen rencana terapi, atau rekomendasi jumlah pertemuan dengan pembayaran per sesi. Tentukan perpanjangan sesi kelima, DP dihitung dari apa, penghentian setelah sesi kedua, dan nasib saldo/jatah.

### P02 — P1/P2: asesmen dasar memiliki pertemuan evaluasi terpisah

PDF menyebut evaluasi asesmen dasar diagendakan pada sesi terpisah. Satu paket satu appointment berdurasi tetap belum otomatis menampung itu. Treatment plan generik dapat membantu, tetapi belum menjelaskan jenis tahap, durasi berbeda, petugas/resource pengerjaan, dan apakah sesi evaluasi termasuk harga Rp350 ribu.

Asesmen lengkap menyebut pengerjaan 2–4 jam; Eko mematok durasi 180 menit. Itu merupakan pilihan implementasi yang belum dijelaskan. Waktu pemeriksaan lebih panjang dapat menabrak booking berikutnya jika tidak ada mekanisme perpanjangan.

### P03 — P1/P2: biaya overtime dan surat laporan belum punya model

PDF menyebut tambahan 25% tarif dasar per 15 menit dan surat laporan Rp200 ribu. Kode tagihan berfokus pada harga paket dikurangi diskon, DP, dan satu pelunasan. Belum ada line item tambahan, persetujuan pasien, dasar harga overtime sebelum/sesudah diskon, pembulatan durasi, dan penambahan waktu pada okupansi jadwal.

Hasil pemeriksaan diberikan offline tidak berarti biaya surat otomatis keluar scope. Pisahkan cara penyerahan dokumen dari tagihan biaya layanan.

### P04 — P2: telelayanan masih ada pada PDF sumber

PDF paket memuat telelayanan. Setelah koreksi requirement 2026-10-19, item tersebut tetap dicatat dan dapat ditampilkan sebagai paket dalam katalog tiga kategori dengan status delivery `TELE_SERVICE`. Detail service/kanal pelaksanaan ditunda dan tidak menjadi scope implementasi saat ini.

### P05 — P2: MoU belum cukup menjadi acceptance criteria fitur

PDF MoU masih mempunyai kolom identitas/proyek/tanggal/nilai/tanda tangan kosong pada salinan yang tersedia. Audit tidak menyimpulkan apakah ada salinan lain yang telah disepakati. Pasal 3/17 banyak memakai frasa tergantung spesifikasi; lampiran rinci yang disetujui perlu menjadi acuan scope.

MoU menyebut data dan fungsi analisa laba, biaya bila masuk sistem, akses Super Admin untuk pengelolaan/koreksi dan hak akses. Baseline Eko kemudian membatasi laporan hanya uang masuk, sedangkan Desain Anda menambah expense/surplus. Ini perlu pemetaan tertulis; MoU tidak dengan sendirinya membuktikan satu rumus laba spesifik sudah dijanjikan.

E-D:20 menyebut maksimal tiga revisi. Pasal 10 pada PDF yang dibaca tidak mencantumkan angka itu. Catat sebagai ketidaksamaan dokumen, bukan putusan mengenai kesepakatan atau keberlakuan hukum.

## 9. Hipotesis concurrency dan konsistensi yang harus diuji kemudian

Bagian ini **belum dinyatakan reproduksi bug**. Tidak dilakukan pengujian multi-tab/perangkat dalam sesi audit.

| ID | Hipotesis | Dasar source | Eksperimen yang diperlukan |
|---|---|---|---|
| Q01 | Dua write pada tanggal berbeda bisa saling menimpa keseluruhan array appointment | Lock per psikolog/tanggal; C:700 membaca array, mock API menunggu 80 ms, lalu C:753–757 menulis array snapshot; persistence juga debounce | Jalankan dua booking tanggal berbeda, interleave sebelum/selesai debounce, reload semua tab; kedua booking wajib tetap ada. |
| Q02 | Double click sesi lanjutan dengan dua tanggal berbeda tidak diserialisasi oleh lock yang sama | C:1067 mengunci tanggal tujuan, sedangkan aturan “satu sesi aktif/nomor sesi” bersifat per plan | Dua request plan sama menuju tanggal berbeda; hanya satu sesi berikutnya boleh dibuat dan nomor sesi unik. |
| Q03 | Reschedule yang bersaing dengan complete/cancel/settlement dapat mengembalikan snapshot status lama | Tidak semua mutasi memakai lock appointment/versi yang sama; update status mock async | Interleave reschedule dan perubahan status; jangan sampai complete kembali pending atau pembayaran terhapus. |
| Q04 | Fallback LocalStorage lock tidak memberi mutual exclusion atomik | C:312–328 read/check/write/check, bukan compare-and-set lintas proses | Dua tab tanpa Web Locks serentak pada resource sama; validasi ulang serta storage tidak boleh menghilangkan booking. |
| Q05 | Receipt/profil/paket stale antar-tab | Sync C:278–295 hanya appointments/schedules; users/packages/pre-test/CMS memakai state terpisah dan debounce | Edit paket/profil/keluhan pada tab A, gunakan tab B; pastikan field kritis direvalidasi dan UI diberi tahu jika quote berubah. |
| Q06 | Payment atau review terduplikasi pada double submit/retry | Guard client tanpa idempotency server; review async dan state belum tentu berubah sebelum klik kedua | Request identik dengan key sama harus menghasilkan satu transaksi/review; key sama dengan payload berbeda ditolak sesuai kontrak. |
| Q07 | Penyimpanan lokal gagal tetapi UI telanjur menyatakan berhasil | `setItem` debounce tidak mempunyai handler kegagalan pada C:190–195; `saveScheduleSettings` menangkap error namun UI ScheduleTab tetap set success | Simulasikan quota storage/error tulis, reload; jangan ada pesan sukses permanen untuk data yang tidak tersimpan. |

Web Locks berguna untuk prototype satu origin. Ia tidak mengoordinasikan browser/perangkat lain dan bukan pengganti database. Klaim “anti double booking sudah selesai” harus selalu menyebut batas tersebut.

## 10. Skenario pembuktian dan acceptance criteria

Tabel ini merupakan rancangan pengujian berikutnya, **bukan hasil menjalankan test**. Kolom penilaian berarti hasil penelusuran statis atau kebutuhan keputusan.

| No. | Kasus | Hasil yang perlu disepakati/dijamin | Penilaian saat audit |
|---|---|---|---|
| 1 | Total 900 ribu, DP 100 ribu, pelunasan Rp1 | Saldo 799.999; jangan PAID | Bertentangan dengan kode, B01. |
| 2 | DP sudah memenuhi total setelah diskon | Setelah verified, PAID dengan saldo nol; tidak menerima pelunasan kedua | Bertentangan dengan sebagian jalur, B09. |
| 3 | Pasien confirmed/DP_PAID reschedule | Tidak buntu saat konfirmasi; pembayaran tetap terverifikasi | B02. |
| 4 | Reschedule A->B, user lain mengambil A | A bisa dipakai sesuai kebijakan pelepasan | Flag slot tersisa, B03. |
| 5 | Dua interval beda jam mulai tapi overlap | Satu saja berhasil | Prototype punya validasi overlap; produksi belum diuji. |
| 6 | Dua booking tidak overlap, kuota tersisa satu | Satu saja berhasil | Memerlukan transaction pada resource hari, bukan hanya unique jam. |
| 7 | Request booking diulang setelah timeout | Appointment dan pembayaran tidak ganda | Backend belum ada; kontrak idempotency belum lengkap. |
| 8 | Booking sesi besok pukul 23:58 hari ini | H-1 kalender valid bila sebelum cutoff WIB | Jangan disamakan dengan harus 24 jam. |
| 9 | Upload tepat sebelum hold expired | Perlindungan pembayaran/slot deterministik | H01 belum diputuskan. |
| 10 | Selesai pre-test, slot diambil orang lain | Revalidasi sebelum bayar; data jawaban tidak hilang tanpa penjelasan | H02; kode transfer sebelum final booking. |
| 11 | Reschedule dua jam tepat sebelum sesi | Batas inklusif jelas dan backend menolak normal | Belum tersedia pada Eko. |
| 12 | Request sebelum lock, approve sesudah lock | Kebijakan approval deterministik | H03. |
| 13 | No-show hari keempat 23:59, hari kelima 00:00 | Deadline kalender/timezone eksplisit | H04. |
| 14 | Admin terlambat menandai no-show | Hak pasien tidak bergantung keterlambatan petugas tanpa aturan | H04. |
| 15 | Owner memindahkan jadwal saat kuota tiga habis | Jenis exception, persetujuan, counter terpisah | Gap K05/K06. |
| 16 | Owner tutup hari berisi booking confirmed | Booking terdampak ditindaklanjuti, bukan hanya slot baru ditutup | H13. |
| 17 | DP Oktober, sesi/pelunasan November | Penerimaan tiap tanggal masuk periode benar | B04. |
| 18 | Sesi dipindah Desember tanpa payment baru | Riwayat kas Oktober/November tidak berubah | B04. |
| 19 | Pre-test kedua pada pasien sama | Form pertama tetap terhubung ke sesi pertama | B05. |
| 20 | Booking anak dari akun orang tua | Identity, consent, akses, dan pre-test tepat subjek | Gap K08/H10. |
| 21 | Paket pasangan/keluarga | Satu reservasi resource, peserta dan consent terpisah sesuai keputusan | H10/PDF. |
| 22 | Pembelian psikoterapi sesi kelima | Harga/komitmen/induk billing jelas | P01 belum diputuskan. |
| 23 | No-show sesi 2 dari 4 | Hak pengganti, nomor sesi, dan saldo tidak hilang/mengganda | K10/H05; kode belum menentukan kebijakan pemulihan. |
| 24 | Discontinue plan dengan sesi aktif | Status dan slot aktif mempunyai konsekuensi eksplisit | B13. |
| 25 | Sesi 2 nol rupiah, induk belum lunas | Pembayaran tetap pada tagihan induk | B12. |
| 26 | Paket gratis/diskon 100% | Submit tanpa nama pengirim/bukti | B08. |
| 27 | Tanggal besok pada 01:00 WIB | Form tetap tanggal kalender besok | B19. |
| 28 | Konfirmasi ditolak/gagal | Tidak terbit receipt confirmed | B11. |
| 29 | Dua akun baru selisih 10 detik | ID berbeda | B07. |
| 30 | Payment proof dikirim ulang atau dipakai booking lain | Riwayat percobaan/referensi tidak menggandakan cash | Belum punya aturan rinci. |
| 31 | Download PDF setelah masa tujuh hari | Server menolak walaupun URL lama diketahui | Belum diimplementasikan. |
| 32 | Reminder lama dieksekusi sesudah reschedule | Jadwal terbaru atau pembatalan job, tanpa klinis berlebihan | H17. |
| 33 | Native fetch mode cookie | Login/mutasi mengirim CSRF yang benar | B17, perlu integration test. |
| 34 | Public/admin request package atau review detail | Field sesuai role dan anonimitas, tidak bocor lewat JSON | Kontrak belum cukup eksplisit. |
| 35 | Edit/reject/resubmit review | Aksi UI dan lifecycle review konsisten | B16. |
| 36 | Backup kemudian restore | Identitas, referensi transaksi, permission, dan audit tetap konsisten | Belum ada implementasi produksi. |

## 11. Usulan model penyatuan, belum keputusan implementasi

### 11.1 Pisahkan entitas yang mempunyai makna berbeda

| Entitas konseptual | Tanggung jawab | Sumber kebenaran yang disarankan |
|---|---|---|
| Account | Kredensial dan role | User terautentikasi backend. |
| Patient | Orang yang menerima layanan | Patient terpisah dari pemesan, dapat tanpa akun. |
| Patient access/guardian | Hak pemesan/wali atas pasien | Relasi berizin dan berjejak; bukan kesamaan nomor HP/nama. |
| Package catalog | Penawaran yang dapat diubah | Master paket berversi/soft delete bila diperlukan. |
| Purchase/booking order/treatment plan | Hak layanan dan snapshot transaksi | Satu induk pembelian; nama teknis dapat dipilih tim. |
| Appointment/session | Satu pertemuan dan resource waktu | Memegang rentang waktu dan status layanan. |
| Pre-test submission | Jawaban saat tertentu untuk pasien tertentu | Submission immutable/berversi dengan link sesi. |
| Payment transaction | Uang yang benar-benar diterima/diperiksa | Ledger transaksi, bukan menimpa satu kolom final payment. |
| Receipt | Bukti atas transaksi terverifikasi | Nomor unik, data penerimaan, riwayat reissue/koreksi. |
| Reschedule request/event | Persetujuan dan perpindahan jadwal | Riwayat append-only, counter dari event efektif. |
| Schedule exception | Pengecualian yang disetujui owner | Scope resource/tanggal/aturan yang dilonggarkan, expiry, pemroses. |
| Expense | Uang keluar bila scope disepakati | Transaksi kas keluar dengan jejak koreksi. |

Jangan membuat patient baru otomatis setiap kali nama berbeda lalu menganggap pasien yang sama tidak pernah ada; sebaliknya jangan menggabungkan orang hanya berdasarkan nama atau telepon keluarga. Pemadanan dan merge memerlukan prosedur aman serta audit.

### 11.2 Invariant yang perlu disepakati

1. Satu interval aktif tidak menabrak interval lain pada resource yang sama, termasuk buffer.
2. Kuota harian diperiksa dalam transaksi yang sama dengan pembuatan/pemindahan.
3. Setiap appointment menunjuk pasien aktual dan pemesan yang dapat berbeda.
4. Total tagihan berasal dari snapshot pembelian dan line item sah, bukan field UI.
5. `total_paid` hanya menjumlah pembayaran yang benar-benar terverifikasi; saldo tidak dihapus karena klik status.
6. Satu transaksi uang masuk hanya dihitung sekali, meskipun paket punya banyak sesi atau jadwal berubah.
7. Refund/reversal/koreksi dicatat sebagai event transaksi, tidak menghapus sejarah uang.
8. Status selesai sesi tidak merekayasa status pembayaran.
9. Nomor sesi/attempt dan hak sesi dibedakan jika ada penggantian karena no-show/cancel.
10. Approval/request idempotent; retry tidak menambah kuota reschedule atau transaksi dua kali.
11. Event sensitif mempunyai actor ID, resource ID, alasan, waktu server, dan perubahan relevan.
12. File/data sensitif disaring di backend per role dan kepemilikan; public JSON tidak mengandung field yang hanya disembunyikan lewat CSS.

### 11.3 Keputusan bisnis yang perlu diprioritaskan

Urutan berikut untuk mencegah tim mengimplementasikan aturan yang saling bertentangan:

1. Tetapkan sumber acuan dan siapa mengesahkan revisi; jangan menganggap dokumen yang lebih panjang/lebih baru otomatis menang.
2. Tentukan model biaya: DP minimum persentase vs konfigurasi nominal, pembayaran fleksibel, saldo, dan koreksi.
3. Putuskan psikoterapi per sesi vs pembelian bundle; tambahkan sesi evaluasi asesmen dan add-on sesuai PDF yang disetujui.
4. Putuskan pemesan vs pasien, peserta keluarga, dan consent/akses datanya.
5. Putuskan lifecycle reservasi/payment/arrival/consultation dan aktor setiap transisi.
6. Lengkapi H-1, hold, SLA verifikasi, lock dua jam, no-show empat hari, kuota tiga, dan exception.
7. Putuskan ruang lingkup expense/surplus, akses harga publik, export/CMS admin, WhatsApp, dan tutorial.
8. Pilih REST SPA atau Inertia monolith, mode auth, kemudian bekukan schema API/database sesuai keputusan tersebut.

### 11.4 Urutan perbaikan teknis yang disarankan

- **Tahap A:** tangani B01–B05, B07, B11–B12 dan akar transisi/ledger/slot yang sama. Jangan menambal status saja hingga mengaburkan fakta pembayaran.
- **Tahap B:** kontrak DTO/schema, pre-test/version/consent, patient identity, payment ledger, resource locking, dan auth produksi.
- **Tahap C:** implementasi reschedule/hold/SLA/exception setelah aturan batas disetujui, termasuk semua kejadian gagal/retry.
- **Tahap D:** laporan/receipt dari transaksi, notifikasi, expense bila disepakati, export dan retensi.
- **Tahap E:** contract/integration/concurrency/security/UAT dengan skenario pada bagian 10, lalu QA visual. Checker tipe saja tidak cukup.

Audit ini tidak meminta atau menjalankan implementasi tahapan tersebut.

## 12. Hal yang tidak dapat disimpulkan dan catatan penutup audit

- Tidak dapat dinyatakan seluruh UI sudah lulus QA, aman produksi, atau seluruh race condition berhasil direproduksi.
- Tidak dapat menyimpulkan salinan MoU ini merupakan satu-satunya kontrak yang ada atau sudah ditandatangani. Perbandingan PDF adalah pembacaan isi dan kelengkapan spesifikasi, bukan penilaian hukum.
- Tidak memverifikasi data nyata psikolog, kredensial praktik, rekening, nomor hotline, atau akurasi klinis konten. Nilai pada mock tidak diperlakukan sebagai fakta layanan nyata.
- Tidak memilih arsitektur atau membatalkan keputusan Eko. Migrasi ke Inertia bukan prasyarat untuk memperbaiki uang/jadwal, dan mempertahankan REST bukan alasan melewatkan aturan baru yang disepakati.
- Tidak menganggap seluruh perbedaan sebagai bug. Sebagian merupakan gap scope, sejarah keputusan, atau pilihan bisnis yang membutuhkan satu keputusan bersama.

Perubahan sesi audit terbatas pada laporan ini dan penambahan catatan audit pada `KNOWN_ISSUES.md`, `DECISIONS.md`, serta `SESSION_HANDOFF.md`. Source aplikasi dan dokumen ide asli di Downloads tidak diubah.

### Amendemen requirement 2026-10-19

Koreksi developer menegaskan bahwa “paket” pada PDF berarti katalog tiga kategori dengan layanan di setiap kategori. Asesmen mencakup jasa tes psikologis dan tidak boleh diperlakukan sebagai terapi. F04, API, schema database, payment ledger, dan checklist Eko telah diperbarui untuk assessment case, appointment testing/evaluation, additional time, serta line item laporan.

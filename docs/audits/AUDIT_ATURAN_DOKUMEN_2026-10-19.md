> **ARSIP AUDIT SEBELUM KOREKSI TERAKHIR.** Temuan dan rekomendasi berikut merekam kondisi ketika audit ditulis, bukan kontrak aktif. Lihat [hasil penyelarasan terbaru](AUDIT_PENYELARASAN_ATURAN_2026-10-19.md), [isu aktif](../KNOWN_ISSUES.md), dan keputusan manusia terbaru. Sesi penyelarasan ini hanya docs dan tidak memeriksa aplikasi.

# Audit aturan dokumen JiwaSehat — 2026-10-19

## Ruang lingkup dan kesimpulan

Audit ini memeriksa **aturan dan kontrak tertulis**, bukan source aplikasi, kesiapan deployment, atau hasil test. Belum dikerjakannya aplikasi tidak dihitung sebagai temuan. Rujukan mencakup F01–F17, empat aktor, empat journey, rules, permission, katalog, database, API, invoice, kalender, keputusan, dan dokumen ide developer.

**Dokumen belum sepenuhnya konsisten dan belum cukup deterministik untuk semua kasus batas.** Ada aturan yang sudah diputuskan tetapi teks turunan belum sinkron, ada keputusan bisnis yang belum lengkap, dan ada kontrak teknis yang masih memberikan beberapa pilihan berbeda. Keberadaan 17 file fitur tidak berarti setiap fitur sudah memenuhi template rinci yang dijanjikan DOCS_ARCHITECTURE.

Keputusan terbaru developer mengalahkan rekomendasi audit. Rekomendasi di bawah tidak otomatis menjadi requirement final. Dokumen sumber di Downloads tidak diubah.

## Keputusan yang tidak perlu ditanyakan ulang

- Laravel 13 + React/Vite melalui API, satu VPS; Sanctum session cookie; email/password dan Google SSO.
- Empat sudut pandang: Guest, Pasien, Admin operasional fleksibel, satu Superadmin/owner.
- Harga hanya setelah login; tanpa diskon, gateway, atau refund.
- Tiga kategori layanan dari PDF; asesmen termasuk tes IQ/kepribadian, bukan sinonim terapi.
- Laporan asesmen termasuk paket; laporan konseling atas permintaan Rp200.000.
- Psikoterapi Rp500.000 per sesi, minimum empat sesi, invoice/billing account per sesi.
- Asesmen Dasar Rp350.000 satu paket, beberapa appointment; Admin menambahkan pertemuan lanjutan.
- Asesmen Lengkap default slot empat jam; deskripsi publik 2–4 jam.
- Additional time dibulatkan ke atas per blok 15 menit, 25% tarif dasar; cakupan kategori dibahas pada R10.
- Jam Admin sama dengan jam klinik; cutoff slot online enam jam kerja; SLA verifikasi 12 jam kerja.
- Auto-confirm melindungi booking, tidak mengesahkan uang: payment tetap PENDING_RECONCILIATION.
- Penanggung jawab default akun login, pasien aktual disimpan terpisah; tanpa akun peserta yang rumit.
- Transfer, QR/tunai, DP minimum 50% sudah ada di §13 dokumen ide.
- Batas reschedule tiga kali, lock dua jam sebelum sesi, pengajuan sesudah no-show maksimal empat hari kalender; exception owner tidak memakai kuota pasien (§18 sumber).

## A. Waktu, booking, dan reschedule

### R01 — Deadline pembayaran dapat melewati waktu sesi [DISELESAIKAN DALAM AUDIT]

**Rujukan:** F06, OPERATING_WINDOW_AND_BOOKING_CUTOFF, journey pasien.

Teks lama menjanjikan hold 24 jam penuh. Booking Jumat 23:44 untuk Sabtu 14:00 memberi deadline Sabtu 23:44, padahal sesi sudah berlalu. Developer telah menjawab pada audit ini: deadline adalah yang lebih awal antara 24 jam dan mulai sesi. Dokumen kanonik sekarang memakai `min(booking_created_at + 24 jam, start_at)`; UI harus menampilkan deadline aktual.

### R02 — Enam jam pemilihan slot berbeda dari SLA 12 jam [PERLU MELENGKAPI TRANSISI]

Contoh tanpa istirahat: bukti Jumat malam, Sabtu buka 08:00–16:00, Minggu tutup, Senin buka. Sesi Sabtu 14:00 sah menurut cutoff enam jam, tetapi auto-confirm 12 jam baru jatuh Senin 12:00. Ini bukan alasan menghapus salah satu aturan. Manual check-in sudah disebut; yang belum lengkap adalah transisi appointment `WAITING_VERIFICATION` yang pasiennya datang sebelum SLA. F10 hanya menulis `CONFIRMED → CHECKED_IN`.

**Saran:** Admin merekonsiliasi dan mengonfirmasi, lalu check-in. Jika belum cukup DP, jelaskan apakah layanan ditahan atau diizinkan owner. Jangan menyamakan bukti upload dengan uang terverifikasi.

### R03 — Bukti tidak valid dan bukti ditolak belum memiliki jalur akhir [TERBUKA]

**Rujukan:** F06/F08 dan kalender. Upload tepat waktu melindungi slot; belum tegas berapa kesempatan perbaikan bukti, apakah SLA dimulai ulang setelah penolakan, dan kapan slot dilepas. Seseorang dapat mengupload berkas tidak relevan untuk mempertahankan slot. Auto-confirm tidak memperbaiki bukti palsu.

**Saran:** bedakan file gagal validasi, bukti menunggu pemeriksaan, bukti ditolak, serta pembayaran aktual ditemukan. Bekukan satu awal SLA; tentukan batas perbaikan bukti dan tindakan jika uang baru ditemukan setelah slot expired. Tidak boleh merebut kembali slot yang sudah dimiliki pasien lain.

### R04 — Urutan kalender dan override belum tegas [TERBUKA]

**Rujukan:** F05/F17, tabel weekly_schedules, schedule_overrides, practice_holidays, admin_operational_overrides. Admin membuka Sabtu 17:00, tetapi tanggal itu sudah holiday. Dokumen belum menentukan apakah override membuka libur atau holiday tetap menang. F17 membatasi pengubahan ke tanggal mendatang, padahal user meminta fleksibilitas termasuk jam hari ini.

**Saran:** satu hasil kalender efektif dan satu precedence eksplisit: jadwal mingguan, override tanggal berizin, istirahat/penutupan, booking terlindungi. Pembukaan khusus hari ini harus eksplisit dan tidak menimpa booking lama. Audit override bukan sumber availability kedua.

### R05 — Warning pasien terdampak belum menentukan boleh Simpan atau tidak [TERBUKA]

**Rujukan:** F05/F17. Admin menutup klinik pukul 14:00 sementara ada sesi confirmed 15:00. Menampilkan warning saja masih mengizinkan keadaan yang tidak konsisten.

**Saran:** sebelum apply perubahan, pengguna harus memilih mempertahankan appointment sebagai exception atau menyelesaikan relokasi/pembatalan sah. Pending verifikasi/auto-confirm/check-in juga termasuk terdampak, bukan hanya HELD/CONFIRMED. Reschedule dan perubahan jam mengacu versi kalender yang sama.

### R06 — Durasi beberapa layanan belum tersedia untuk menghitung slot [TERBUKA]

**Rujukan:** F04/F05. Tes IQ, kepribadian, Asesmen Dasar, evaluasi, dan psikoterapi belum memiliki default durasi final. F04 mengizinkan null, tetapi booking membutuhkan interval yang pasti. Asesmen Lengkap empat jam juga tidak muat pada slot 14:00–16:00; bila ada istirahat 12:00–13:00, slot 08:00–12:00 muat tetapi 10:00–14:00 tidak kontinu.

**Saran:** Admin/owner mengisi durasi sebelum layanan menjadi bookable, termasuk durasi evaluasi/follow-up. Jangan mengarang semua layanan menjadi 60 menit. Deskripsi 2–4 jam tidak berarti otomatis memotong blok empat jam menjadi dua appointment.

### R07 — Request reschedule yang menunggu Admin bisa melewati sesi lama [TERBUKA]

**Rujukan:** F09. Pasien mengajukan tiga jam sebelum sesi, Admin approve setelah waktu sesi. Belum ada aturan kapan eligibility dibekukan, expiry approval, dan perlakuan no-show selama request menunggu keputusan.

**Saran:** simpan `requested_at`, `eligibility_checked_at`, `approval_expires_at`, serta versi appointment; hanya satu request aktif. Permintaan tepat waktu tidak dianggap terlambat akibat penundaan Admin. Approval tidak menjamin slot baru sudah dimiliki; apply wajib mengecek ulang.

### R08 — Reschedule setelah no-show tidak boleh tetap berstatus NO_SHOW [TERBUKA]

**Rujukan:** F09 berkata appointment dipindah dengan status lama dipertahankan; F10 mengizinkan reschedule sesudah NO_SHOW. Jika diterapkan literal, jadwal baru tetap NO_SHOW dan tidak aktif. Jika ditimpa CONFIRMED tanpa event, riwayat tidak hadir hilang.

**Saran:** tetapkan transisi pasca-no-show secara eksplisit, simpan event kejadian lama, dan bedakan nomor usaha pertemuan dari nomor sesi berbayar. Pilih satu model: appointment yang sama dengan event historis, atau appointment pengganti tertaut pada layanan/tagihan sama.

### R09 — Kuota, empat hari kalender, dan berakhirnya hak belum lengkap [TERBUKA]

**Rujukan:** F09/F10, §18 dokumen ide. Tiga kali dan empat hari sudah final, tetapi belum ditulis batas inklusif WIB, kapan uang ditandai hangus, serta apakah yang harus tepat waktu adalah submit request atau apply jadwal. Teks sumber menyebut **pengajuan**, bukan selesai proses Admin.

**Saran:** hitung kelayakan pada waktu submit, counter hanya saat APPLIED, perubahan karena owner tidak mengurangi kuota pasien. Hak berakhir jangan mengubah uang masuk menjadi transaksi baru. Jangan menganggap tiga reschedule per satu assessment case bila baseline menyebut per booking/appointment tanpa keputusan tambahan.

## B. Tarif, tagihan, dan administrasi

### R10 — Cakupan tarif additional time meluas dari PDF [MENUNGGU KONFIRMASI]

Catatan 25% per 15 menit terletak di bagian Konseling pada PDF. Dokumen fitur menerapkannya ke layanan secara umum. Untuk Asesmen Lengkap Rp1.500.000, 15 menit menjadi Rp375.000 walau sesi dasar empat jam; untuk Konseling Offline Rp900.000 menjadi Rp225.000.

**Saran:** konfirmasi kategori penerapan; formula pembulatan ke atas sudah final dan tidak perlu ditanyakan lagi. Untuk kategori di luar formula, Admin dapat memasukkan biaya kustom bila memang diminta dan disetujui secara operasional.

### R11 — Pencatatan additional time bertahap bisa menggandakan pembulatan [TERBUKA TEKNIS]

**Rujukan:** F08/F10. Dua entri lima menit menghasilkan dua blok bila dibulatkan per entri; total sepuluh menit seharusnya satu blok untuk sesi yang sama. Input 40 menit ulang juga dapat menggandakan biaya.

**Saran:** satu total menit aktual per appointment/usaha sesi, hitung `ceil(total_minutes/15)` pada agregat, simpan revisi/event dan selisih line item. Tetapkan titik pengukuran: waktu layanan aktual di luar durasi dasar, bukan keterlambatan dokter, waktu tunggu, atau waktu administrasi.

### R12 — Durasi aktual dan waktu yang ditagihkan adalah dua fakta [TERBUKA TEKNIS]

Tambahan 40 menit ditagih 45 menit tetapi layanan aktual tetap 40 menit. Memakai billed duration sebagai okupansi dapat memblokir kalender secara tidak benar; mengabaikan durasi aktual dapat membuat dua pasien menunggu pada waktu sama.

**Saran:** pisahkan `scheduled_end_at`, `actual_started_at`, `actual_ended_at`, `additional_actual_minutes`, dan `billed_blocks`. Appointment berikutnya tidak bergeser otomatis. Owner/Admin menangani dampak operasional secara eksplisit.

### R13 — Tambahan biaya setelah invoice PAID bertabrakan dengan snapshot [TERBUKA TEKNIS]

**Rujukan:** F08/F17, INVOICE_RECEIPT_FORMAT. Pasien lunas Rp900.000 lalu Admin menambah overtime Rp225.000. Jika invoice lama diganti, kwitansi lunas lama berubah; jika tidak, saldo tambahan tidak muncul.

**Saran:** invoice terbit dan receipt penerimaan dibekukan. Tambahan menjadi addendum/invoice tambahan tertaut billing account yang sama dengan total agregat dan saldo terbaru. Receipt Rp900.000 tetap membuktikan uang itu diterima; tidak membuktikan seluruh biaya tambahan sudah lunas. Jangan menduplikasi BASE_SERVICE saat membuat addendum.

### R14 — Custom charge dapat menjadi diskon terselubung [TERBUKA TEKNIS]

**Rujukan:** F17 memperbolehkan amount/quantity kustom dan adjustment, F08 melarang diskon. Nominal minus atau quantity minus bisa menurunkan harga dengan nama lain.

**Saran:** CUSTOM_CHARGE hanya nominal positif dan quantity positif; koreksi berjejak harus merujuk entri yang benar-benar salah, tidak mengurangi BASE_SERVICE yang sah. Pisahkan koreksi salah ketik dari pemberian potongan. Audit bukan alasan menerima semua nilai tanpa aturan.

### R15 — Kerahasiaan harga Admin tidak bisa dijamin dengan formula 25% [MENUNGGU KONFIRMASI]

**Rujukan:** F08/API_BOUNDARY menyembunyikan harga dasar/target, tetapi membolehkan konfirmasi nominal additional time. Admin yang melihat Rp225.000 per blok dapat menghitung Rp900.000. Bukti transfer sendiri juga dapat memuat nominal. Ini konflik desain akses, bukan bug tampilan.

**Saran:** pastikan tujuan kebijakannya: sekadar tidak menampilkan total/saldo, atau benar-benar merahasiakan seluruh nominal? Jangan menjanjikan keduanya sekaligus. Alur koreksi serta receipt juga harus mengikuti pilihan yang sama.

### R16 — Lebih bayar nyata berbeda dari salah input dan klik ganda [KEPUTUSAN SELISIH TERBUKA]

**Rujukan:** F08. Kasus DP Rp450.000 ditambah transfer Rp600.000 untuk tagihan Rp900.000 menghasilkan selisih Rp150.000. Tidak adanya refund tidak menentukan apakah selisih menjadi pemakaian layanan berikutnya atau keputusan lain.

**Saran:** simpan penerimaan aktual, sisa tagihan minimum nol, selisih lebih bayar terpisah. Jangan otomatis menghanguskan/mengkreditkan. Input yang salah dikoreksi, transfer yang sama tidak dicatat dua kali. Sudah dijelaskan kepada developer; tidak perlu mengulang pertanyaan tanpa konteks kasus.

### R17 — Kewajiban bukti transfer diterapkan ke tunai [TERBUKA TEKNIS]

**Rujukan:** PROJECT_CONTEXT dan contoh FormRequest BACKEND_PACKAGE_AND_TREATMENT_PLAN_SPEC mewajibkan nama pengirim/bukti pada semua pembayaran, sementara §13 sumber mengizinkan tunai.

**Saran:** field wajib mengikuti metode: tunai memiliki nominal diterima, kasir, waktu dan receipt; transfer/QR memiliki referensi/bukti sesuai metode. Jangan meminta nama rekening pada cash atau menolak walk-in tanpa akun hanya karena akun Admin belum lengkap sebagai pasien.

### R18 — Riwayat kas bisa berubah karena verifikasi terlambat meskipun tidak ada reschedule [TERBUKA TEKNIS]

DP diterima 31 Oktober tetapi diverifikasi 2 November. Aturan basis kas mengharuskan transaksi muncul pada 31 Oktober; laporan Oktober yang dicetak 1 November belum memuatnya. Larangan “laporan masa lalu tidak berubah” harus dibatasi pada perubahan jadwal, bukan janji agregat tak pernah berubah.

**Saran:** laporan menyimpan `as_of`/tanggal cetak dan status rekonsiliasi, serta mengidentifikasi transaksi terlambat. Koreksi kas historis diaudit; receipt/export yang sudah diterbitkan tidak ditimpa diam-diam.

## C. Layanan, identitas, dan informasi

### R19 — Minimum empat sesi belum menjelaskan berhenti atau sesi kelima [TERBUKA BISNIS]

**Rujukan:** F11 dan BUSINESS_RULES. Per sesi sudah final. Belum jelas apakah berhenti setelah dua sesi menciptakan utang dua sesi yang belum dijadwalkan, dan cara melanjutkan sesi kelima ketika plan otomatis COMPLETED pada empat.

**Saran:** minimum empat adalah rencana layanan, bukan tagihan sesi yang belum dipesan; owner dapat discontinue dengan alasan. Sesi kelima perlu perpanjangan plan eksplisit. Kebijakan harga sesi berikutnya mengikuti snapshot saat booking atau harga yang dijanjikan plan harus dinyatakan, bukan diterka.

### R20 — Siapa menjadwalkan lanjutan dan kapan case dianggap selesai [TERBUKA]

**Rujukan:** F17 memberi Admin fleksibilitas penjadwalan; F11/API dan spesifikasi lama hanya mengizinkan owner menjadwalkan psikoterapi. Asesmen membolehkan satu atau lebih FOLLOW_UP tanpa batas akhir atau definisi termasuk paket.

**Saran:** Admin mengatur waktu berdasarkan rencana owner, sementara owner menentukan kebutuhan layanan. Tentukan kapan case CLOSED serta apakah reopen adalah koreksi atau layanan baru. Satu harga multi-appointment tidak berarti semua kunjungan seumur hidup masuk paket yang sama.

### R21 — Pre-test sebelum booking berpotensi bergantung pada appointment yang belum ada [TERBUKA TEKNIS]

**Rujukan:** F07 dan journey pasien. Pre-test dibuat sebelum hold, tetapi mempunyai appointment_id; F06 juga menyimpan consent_id. Jika semua FK wajib sejak awal, tidak ada record pertama yang dapat dibuat.

**Saran:** draft memiliki ID sendiri dan relasi appointment nullable sampai transaksi final, atau appointment draft dibuat dahulu tanpa mengunci slot. Draft bukan booking confirmed dan tidak mengenakan pembayaran. Tetapkan field wajib, jenis layanan yang perlu form, dan bolehkah follow-up memakai submission terdahulu; jangan memakai jawaban klinis default.

### R22 — Pasien walk-in yang kemudian membuat akun belum punya alur klaim data [TERBUKA TEKNIS]

**Rujukan:** F03/F17, patient_accesses. Penanggung jawab sederhana sudah final. Masalah yang tersisa ialah menghubungkan histori walk-in ke akun baru. Pencocokan nama/nomor telepon saja dapat menyerahkan histori orang yang salah.

**Saran:** Admin menghubungkan record setelah identitas diverifikasi dan mencatat actor/alasan; jangan membuat akun otomatis hanya karena email diketik. Perubahan telepon atau penanggung jawab tidak memindahkan akses histori otomatis. Form anak tidak wajib mengarang pekerjaan atau nomor telepon milik anak.

### R23 — Login email/password dan Google belum menetapkan linking akun [TERBUKA TEKNIS]

**Rujukan:** F01 dan sumber §30. Email unik mencegah duplikat tetapi belum cukup menentukan apakah akun lokal yang sudah ada boleh langsung di-link dari Google, bagaimana akun diblokir, dan bagaimana reset mencabut sesi lama.

**Saran:** role publik selalu PATIENT, identitas provider/email harus terbukti, linking internal berizin, dan status blocked berlaku pada semua cara masuk. Ini pelengkapan kontrak akun, bukan keputusan menambah cara login baru.

### R24 — Notifikasi owner meluas menjadi notifikasi klinis pasien [TERBUKA SCOPE]

**Rujukan:** sumber §20/§39 menargetkan WhatsApp operasional owner; F13 hanya berkata WhatsApp utama tanpa matriks penerima. BUSINESS_RULES/PROJECT_CONTEXT masih menyuruh memasukkan ringkasan keluhan dalam pesan, sementara sumber menganjurkan link dashboard.

**Saran:** satu matriks event × penerima × kanal. Pisahkan reminder owner dari status in-app pasien; pesan WA berisi informasi administratif dan link berizin. Jangan menganggap semua pasien sudah menyetujui menerima keluhan atau data sensitif lewat WA. Gagal kirim tidak membatalkan booking.

### R25 — Retensi satu tahun dan hak download tujuh hari belum disatukan [TERBUKA TEKNIS]

**Rujukan:** F15 menulis satu tahun tanpa anchor; sumber §19 membatasi download PDF tujuh hari setelah selesai/batal sambil menjaga ringkasan.

**Saran:** pisahkan akses unduh PDF, umur file bukti, umur transaksi, dan rotasi backup. Tentukan anchor (upload atau penutupan layanan) dan perlakuan saat case multi-appointment belum selesai/no-show. Restore backup tidak boleh mengaktifkan ulang hak download atau memulihkan file yang sudah melewati kebijakan simpan tanpa penanganan.

### R26 — Laporan asesmen termasuk tidak berarti wajib disimpan di web [TERBUKA SCOPE]

**Rujukan:** sumber §16 mengizinkan hasil diserahkan offline dan tidak mewajibkan penyimpanan. DATABASE_ARCHITECTURE/API sekarang memasukkan assessment_reports dan download tanpa pembatasan scope.

**Saran:** catat permintaan, termasuk/berbayar, status terbit/serah, dan actor secara administratif. Berkas klinis opsional sampai ada persetujuan khusus. Jangan menambah kewajiban upload laporan hanya karena harga paket mencakup laporan.

### R27 — Review multi-appointment dan edit belum pasti [TERBUKA TEKNIS]

**Rujukan:** F12 “satu review aktif per appointment” dan “jika edit diperbolehkan”; sumber menyebut satu booking. Satu asesmen dengan tiga appointment bisa mendapat tiga review dan memengaruhi agregat lebih besar.

**Saran:** nyatakan unit review (appointment atau layanan/case), siapa penulis bila akun penanggung jawab berbeda dari pasien aktual, dan apakah edit mengulang moderasi. Anonymous publik harus tetap menyembunyikan identitas dari metadata dan teks otomatis, bukan hanya menghapus nama tampilan.

## D. Kontrak lintasfile dan struktur data

### R28 — Definisi database belum setara kamus data final [DEFECT DOKUMEN]

DATABASE_ARCHITECTURE memberi ringkasan banyak tabel, tetapi belum tipe/null/default/FK/delete rule untuk semua kolom. Ia menawarkan CHAR(36) atau BINARY(16), decimal atau integer, UTC atau alternatif; LARAVEL_API_SPEC masih memberi uuid/bigIncrements, foreignId integer ke UUID, dan patient_id ke users alih-alih patient_profiles. F01 menawarkan ULID meski schema lain UUID. Ini pilihan implementasi yang dapat diseragamkan tanpa bertanya bisnis ke user.

Tambahan: index treatment_plans memakai `active` sementara tabel mendeskripsikan status; session_number versus continuous_session_number belum seragam. Unique assessment link `(case, appointment, role)` belum mencegah appointment yang sama masuk ke dua case. Relasi billing account ↔ appointment/case dua arah belum menetapkan pemilik FK utama sehingga insert dapat melingkar. payment_events disebut F08 tetapi belum didaftarkan sebagai tabel inti.

**Saran:** satu kamus data final, satu tipe PK/FK, satu relasi authoritative per fakta, constraints unik sesuai unit layanan, dan alur pembuatan record eksplisit. Audit ini menandai gap; tidak mengklaim seluruh schema sudah lengkap.

### R29 — API lama masih memakai status, otorisasi, dan contoh yang berbeda [DEFECT DOKUMEN]

LARAVEL_API_SPEC masih mencantumkan PENDING/IN_PROGRESS, sedangkan F06 memakai WAITING_* /IN_CONSULTATION. Contoh bearer token berbeda dari Sanctum cookie yang disetujui. Contoh package backend dilabeli Publik/Pasien tetapi membawa price; Guest tidak boleh menerima harga. Route notifikasi di contoh hanya terlindungi login, tanpa role/ownership. Endpoint lifecycle check-in, approval reschedule, ledger correction, dan reset password belum lengkap pada daftar utama.

**Saran:** tandai contoh lama nonkanonik sampai diselaraskan; tulis per endpoint siapa boleh baca/tulis, objek yang dikembalikan, guard status dan error. Contoh JSON sama pentingnya dengan paragraf aturan—developer dapat menyalinnya literal.

### R30 — Keuangan dan export operasional masih beda scope antarfile [KONFLIK SUMBER]

**Rujukan:** sumber §21 membolehkan Admin export jadwal dan §25 memuat pengeluaran/surplus basis kas. ROLES_PERMISSIONS melarang Admin mencetak jadwal dan BUSINESS_RULES meniadakan pengeluaran, sedangkan F14 menyebut scope expense belum disahkan.

**Saran:** pisahkan export jadwal administratif dari laporan kas owner. Tentukan apakah pengeluaran/surplus dari ide termasuk scope sekarang atau ditunda. Jika termasuk, diperlukan satu fitur expense dan entitasnya; jika ditunda, nyatakan penundaan eksplisit. Jangan menganggap Admin tidak boleh mencetak jadwal sama dengan tidak boleh melihat laba owner.

### R31 — Template satu fitur satu file belum terpenuhi isinya [DEFECT KELENGKAPAN]

DOCS_ARCHITECTURE menjanjikan latar belakang, tujuan, aktor, input, alur gagal, fungsi/API, transisi, authorization, notifikasi, audit, acceptance criteria. F07/F12/F13/F15/F16 dan beberapa file lain masih ringkasan. Daftar enum bukan tabel transisi. `CONFIRMED_AUTO_SLA`, waktu check-in, stop plan, bukti ditolak, correction, dan reopen case belum mempunyai matriks actor × kondisi awal × hasil × efek samping yang lengkap.

**Saran:** lengkapi tiap fitur berdasarkan daftar skenario audit ini, bukan menambah banyak file generik baru. Nama semua field tidak cukup jika wajib/opsional, validasi, dan unit datanya belum jelas.

### R32 — Prioritas dokumen dan rekomendasi pernah dinyatakan sebagai keputusan [SEBAGIAN DIPERBAIKI]

DOCS_ARCHITECTURE mempunyai dua nomor 5 dengan urutan otoritas berbeda. README menempatkan keputusan terbaru setelah fitur seolah fitur lama boleh menang. Ditemukan juga sisa reschedule kembali PENDING, login single-email, dan adjustment/credit otomatis setelah credit dinyatakan belum disetujui.

**Perbaikan audit ini:** keputusan eksplisit terbaru developer ditempatkan paling atas; rekomendasi tidak otomatis final. Paragraf reschedule BUSINESS_RULES, login Guest, actor audit dari session, larangan booking non-bookable, perbedaan status klinis selesai dengan input biaya sesudahnya, provider Baileys, serta kata credit yang tidak disetujui sudah dirapikan pada dokumen terkait.

Laporan ini tidak menyatakan semua contoh legacy telah diselaraskan. R28/R29/R31 tetap terbuka sampai kamus data, contoh API, dan alur fitur benar-benar selesai.

## Urutan penyelesaian yang disarankan

1. Putuskan cakupan additional time dan makna kerahasiaan harga Admin (pertanyaan sudah dikirim); deadline R01 sudah dijawab pada audit ini.
2. Tutup alur bukti ditolak, check-in sebelum SLA, reschedule menunggu/no-show, serta batas appointment lanjutan dalam paket.
3. Tentukan perlakuan invoice setelah biaya tambahan, correction, overpayment, dan sesi terapi kelima/berhenti.
4. Selaraskan hak Admin dan kanal penerima notifikasi; jangan membuka data klinis dari alasan fleksibilitas operasional.
5. Rapikan schema/API serta template F01–F17. Ini pekerjaan dokumentasi yang dapat dilakukan tanpa menunggu aplikasi dibuat.

**Kriteria selesai audit aturan:** setiap skenario memiliki satu hasil yang konsisten di fitur, permission, journey, API, dan database; setiap keputusan tertunda diberi label jelas. Tidak mensyaratkan menjalankan aplikasi atau melihat source.

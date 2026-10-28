# F04 — Kategori, paket dan promosi
## Latar belakang dan tujuan
Tiga kategori memuat paket tersendiri; Asesmen adalah layanan tes. Harga dan benefit harus sama di katalog, booking dan dokumen pembayaran. Tabel baseline mengikuti PDF; koreksi manusia terbaru menentukan arti paket.
## Aktor dan authorization
Guest melihat nama/deskripsi tanpa harga. Pengguna login melihat harga. Admin/Superadmin mengelola master dan promo global dengan audit; kebutuhan klinis tetap diputus praktisi.
## Kolom/isian dan validasi
| Kategori | Kode layanan | Layanan/paket | Durasi dasar | Harga dasar | Catatan |
|---|---|---|---:|---:|---|
| Konseling | `COUNSELING_OFFLINE` | Konsultasi Offline | 60 menit | Rp900.000 | Sesi konseling |
| Konseling | `COUNSELING_TELE_SERVICE` | Konsultasi Telelayanan | 60 menit | Rp750.000 | Google Meet; Admin memasukkan link pada booking lalu sistem mengirim WA pasien melalui Baileys (F20); dapat bookable setelah konfigurasi wajib valid |
| Konseling | `COUNSELING_CHILD_ADOLESCENT` | Konsultasi Anak/Remaja | 60 menit | Rp900.000 | Sesi konseling anak/remaja |
| Konseling | `COUNSELING_ADULT` | Konsultasi Dewasa | 60 menit | Rp900.000 | Sesi konseling dewasa |
| Konseling | `COUNSELING_COUPLE_FAMILY` | Konsultasi Pasangan/Keluarga | 60 menit | Rp1.500.000 | Satu appointment dengan peserta sesuai kebijakan praktik |
| Asesmen | `ASSESSMENT_BASIC` | Asesmen Psikologis Dasar | Beberapa appointment | Rp350.000 per paket | Harga mencakup layanan tes dan evaluasi; appointment dapat berbeda hari/waktu dan Admin dapat memasukkan jadwal lanjutan pada assessment case yang sama |
| Asesmen | `ASSESSMENT_FULL` | Asesmen Psikologis Lengkap | Default 240 menit; deskripsi 2–4 jam | Rp1.500.000 | Tatap muka untuk mengerjakan alat tes; PDF menyebut hasil laporan termasuk |
| Asesmen | `ASSESSMENT_INTELLIGENCE` | Tes Inteligensi/IQ | Ditentukan alat tes | Rp750.000 | Layanan tes, bukan terapi |
| Asesmen | `ASSESSMENT_PERSONALITY_STANDARD` | Tes Kepribadian Standar | Ditentukan alat tes | Rp500.000 | Layanan tes |
| Asesmen | `ASSESSMENT_PERSONALITY_FULL` | Tes Kepribadian Lengkap | Ditentukan alat tes | Rp900.000 | Layanan tes |
| Asesmen | `ASSESSMENT_CHILD_ADOLESCENT_STANDARD` | Asesmen Anak/Remaja Standar | Ditentukan alat tes | Rp500.000 | Untuk kebutuhan anak/remaja |
| Asesmen | `ASSESSMENT_CHILD_ADOLESCENT_FULL` | Asesmen Anak/Remaja Lengkap | Ditentukan alat tes | Rp900.000 | Contoh di PDF: kesiapan sekolah, minat bakat/penjurusan, klinis/tumbuh kembang, kepribadian klinis remaja |
| Asesmen | `ASSESSMENT_ADULT_STANDARD` | Asesmen Dewasa Standar | Ditentukan alat tes | Rp500.000 | Layanan tes dewasa |
| Asesmen | `ASSESSMENT_ADULT_FULL` | Asesmen Dewasa Lengkap | Ditentukan alat tes | Rp900.000 | Contoh di PDF: kepribadian klinis, kesiapan mental/konseling, pengembangan diri, kepribadian kerja |
| Psikoterapi | `PSYCHOTHERAPY_SESSION` | Psikoterapi per sesi | Sesuai jadwal sesi | Rp500.000 per sesi | Minimum komitmen 4 sesi; tidak dibuat sebagai invoice bundle otomatis Rp2.000.000 |


| Field versi | Wajib | Validasi |
|---|---|---|
| name,category,service_code | Ya | kode unik; tiga kategori resmi |
| normal_price | Ya | integer Rupiah >0 |
| promo_price,promo_starts_at,promo_ends_at | Opsional | 0<promo<normal; end>start, harga lama dicoret saat efektif |
| additional_time_price_basis | Wajib sebelum Konseling bookable | NORMAL_PRICE atau FINAL_PRICE; dipilih Admin/Superadmin, tanpa default tersembunyi |
| duration_minutes | Sebelum bookable | positif; Lengkap240menit |
| duration_min_minutes/duration_max_minutes | Opsional | deskripsi Lengkap120–240menit |
| billing_mode | Ya | PER_APPOINTMENT/PER_PACKAGE/PER_SESSION sesuai kategori |
| minimum_sessions | Ya | awal4 psikoterapi, lainnya1 |
| includes_result_report | Ya | true semua ASSESSMENT |
| requires_evaluation | Ya | true Asesmen Dasar |
| benefits,description,variant | Ya/opsional menurut template | snapshot jelas |
| is_bookable | Ya | false jika durasi/pelaksanaan belum siap |
Nama canonical normal_price dan promo_price, bukan price yang mempunyai beberapa arti. Harga final efektif ditetapkan server saat booking.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Admin membuat master/versi paket, harga normal/promo, benefit dan durasi.
2. Versi baru untuk booking baru; versi lama immutable.
3. Guest hanya proyeksi tanpa nominal. Sesudah login, tampilkan harga normal dicoret + promo efektif.
4. Booking menyimpan versi harga final dan DP flat min(Rp100.000, dasar net) sekali pada booking/rangkaian baru. Sesi lanjutan tidak meminta DP baru; diskon individual dicatat terpisah pada tagihan F08.
5. Asesmen Dasar satu harga Rp350.000 mencakup testing dan evaluasi pada waktu berbeda, diatur Admin pada case sama.
6. Semua Asesmen termasuk laporan; laporan Konseling atas permintaan Rp200.000 diinput Admin. Hasil boleh offline.
7. Psikoterapi Rp500.000 per sesi, minimum rencana4; invoice hanya per sesi dipesan.
8. Formula tambahan waktu25% per15menit hanya Konseling, termasuk paket Telelayanan; akumulasi/basis promo mengikuti F08. Telelayanan dilaksanakan via Google Meet dengan link dari Admin dan pengiriman otomatis ke WhatsApp pasien sesuai F20.
## Status dan transisi
### Pengaturan dasar tarif additional time

Admin dan Superadmin sama-sama mengelola harga normal, promo, serta pilihan **Dasar tarif tambahan waktu** melalui editor paket. Pilihan berlaku per versi paket, bukan pengaturan frontend atau keputusan acak pada setiap input menit.

| Pilihan pada form | Nilai API | Dasar 25% per blok 15 menit |
|---|---|---|
| Harga normal | NORMAL_PRICE | normal_price versi paket saat booking |
| Harga paket setelah promo | FINAL_PRICE | harga final paket sesudah promo global yang efektif saat booking |

Contoh harga normal Rp900.000 dan promo Rp800.000: NORMAL_PRICE menghasilkan Rp225.000 per blok; FINAL_PRICE menghasilkan Rp200.000 per blok. Admin melihat preview sebelum menyimpan versi paket. Pasien login melihat ketentuan tarif yang berlaku sebelum booking; Guest tetap tidak menerima nominal.

FINAL_PRICE tidak mengambil total tagihan terbaru, biaya tambahan, atau diskon individual setelah booking. Diskon individual tetap line item terpisah; tidak diam-diam menghitung ulang tarif tambahan. Bila tidak ada promo saat booking, kedua basis sama nilainya.

Perubahan pilihan membuat versi paket baru untuk booking baru. Booking lama tetap memakai versi/basis dan harga saat pemesanan, termasuk bila promo berakhir sebelum hari layanan. Revisi total menit pada sesi yang sama tidak mengganti basis tarif. Konseling tanpa pilihan basis tidak boleh diaktifkan sebagai bookable; kategori lain tidak memakai formula ini.

Audit menyimpan actor, alasan, versi lama/baru dan pilihan basis. Request mengirim pilihan enum, bukan nominal hasil perhitungan. Laravel memvalidasi permission dan menghitung hasil; React menampilkan preview server.

### Transisi katalog
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Save version / Admin | input valid | versi immutable baru efektif |
| Deactivate / Admin | master aktif | booking baru berhenti, histori tetap |
| Promo effective / server | dalam rentang versi | harga final promo; normal dicoret |
| Ubah basis tambahan / Admin atau Superadmin | versi sebelumnya ada | versi baru; booking lama tetap memakai basis asal |
## Alur gagal dan pemulihan
Durasi belum diketahui tidak diisi60menit otomatis. Bookable tanpa durasi ditolak422. Perubahan harga di tengah wizard meminta preview ulang sebelum reservasi dibuat. Diskon100%/harga0 belum baseline; tidak lolos guard harga positif.
## Function dan route web
listPublicPackages, listAuthenticatedPackages, createPackage, createVersion, deactivate. GET /public/packages,/packages; POST /admin/packages,/admin/packages/{id}/versions.
Target path relatif root domain memakai route web/session Laravel. Kontrak props/form/JSON pendukung dan daftar route yang sudah dibuat ada di [WEB_CONTRACT](../WEB_CONTRACT.md). Kode409/422 di uraian fitur adalah kondisi domain/JSON; form Inertia memetakannya ke redirect/errors sesuai kontrak.
## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Semua paket tabel tersedia sebagai master; kategori bukan paket tunggal.
- Lengkap deskripsi2–4jam, reservasi default4jam.
- Asesmen/Psikoterapi tidak memakai formula tambahan Konseling.
- Laporan termasuk tidak ditagih dua kali; Guest tidak menerima harga.
- Konseling tanpa additional_time_price_basis tidak dapat bookable; nilai di luar dua pilihan ditolak.
- Promo berakhir/perubahan basis tidak mengubah tarif booking lama; kedua pilihan dapat dipreview dengan nominal yang berbeda.
## Hubungan fitur
F05 durasi, F06 snapshot, F08 diskon/charges, F11 plan, F18 asesmen.

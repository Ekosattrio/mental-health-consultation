# Panduan Fitur per Role

> Panduan ini menjelaskan preview Eko. Target integrasi terbaru ada di [keputusan final](KEPUTUSAN_FINAL_2026_10_22.md), [hak akses](ROLES_PERMISSIONS.md) dan F01-F20. Admin/per-sesi/request reschedule target belum seluruhnya sama dengan preview; jangan menjadikan pembatasan lama di bawah aturan backend.


Tanggal pemeriksaan: 22 Oktober 2026.

Dokumen ini menjelaskan fitur yang ditemukan di source, lokasi menu, fungsi, cara kerja, dan batasannya. Ini bukan pernyataan semua fitur telah lulus QA. Runtime masih React/Vite dengan mock data dan LocalStorage; service Laravel belum menjadi sumber data aplikasi.

## 1. Dua Aksi Psikolog yang Perlu Dibedakan

### 1.1 Batalkan Seluruh Layanan Setelah Lunas

**Lokasi:** Psikolog > Riwayat Sesi > ikon lingkaran silang merah. Aksi Hentikan Paket di Paket Berjalan berujung pada aturan penghentian yang sama.

**Artinya:** menghentikan layanan dalam booking/rencana tersebut, bukan menunda tanggal, bukan menghapus data, dan bukan membatalkan semua layanan milik semua pasien.

| Situasi | Yang dilakukan sistem |
|---|---|
| Layanan satu sesi | Appointment tersebut menjadi `CANCELLED`. |
| Layanan multi-sesi | Rencana menjadi `DISCONTINUED`; seluruh appointment tersisa dalam rencana itu menjadi `CANCELLED`. |
| Ada sesi yang sudah selesai | Status `COMPLETED` tetap dipertahankan sebagai histori; rencananya ditandai dihentikan. |
| Ada paket/rencana lain milik pasien yang sama | Tidak ikut dibatalkan. Cakupan perubahan mengikuti `treatmentPlanId`, bukan semua transaksi pasien. |
| Masih ada sisa tagihan | Pembatalan ditolak; admin harus mencatat uang pelunasan yang benar-benar sudah diterima terlebih dahulu. |
| Rencana sudah selesai/dihentikan | Tidak dapat diproses lagi lewat aksi ini. |

**Cara pakai:**

1. Psikolog memutuskan penghentian bersama pasien secara manual.
2. Periksa pembayaran pada Paket Berjalan; pembatalan mensyaratkan `PAID` dan sisa tagihan nol pada appointment pembayaran pertama.
3. Jika belum lunas, admin mencatat penerimaan cicilan/pelunasan. Tujuan `CANCELLATION_SETTLEMENT` mengizinkan pencatatan untuk penghentian, termasuk sebelum sesi pertama psikoterapi.
4. Psikolog membuka ikon batal, mengisi alasan, lalu menekan konfirmasi.
5. Sistem membaca data terbaru, memeriksa kewenangan/pelunasan, menghentikan rencana dan membatalkan sisa jadwal, kemudian menyimpan audit.

**Contoh:** rencana empat sesi bernilai Rp2.000.000, dengan dua sesi sudah selesai. Jika pembayaran sudah Rp2.000.000, penghentian mempertahankan dua sesi selesai dan membatalkan sesi tersisa yang sudah dibuat. Tidak ada sesi lanjutan baru dari rencana tersebut. Jika baru membayar DP Rp100.000, aksi ditolak sampai sisa Rp1.900.000 benar-benar diterima dan dicatat admin.

Syarat pelunasan seluruh rencana adalah aturan bisnis yang sebelumnya ditetapkan developer. Tombol ini tidak otomatis menagih uang, melunasi saldo, mengembalikan DP, atau melakukan refund. Pembayaran yang sudah tercatat tetap masuk histori dan laporan. Appointment yang belum pernah dibuat tidak dibuat hanya untuk dibatalkan.

**Penting:** ikon batal dapat terlihat sebelum lunas. Keberadaan tombol bukan bukti syaratnya sudah terpenuhi; guard saat konfirmasi yang menentukan apakah aksi diterima.

### 1.2 Konfirmasi dan Jadwalkan Ulang Tanpa DP Tambahan

**Lokasi:** Psikolog > Riwayat Sesi > ikon kalender dengan jam hijau. Pada Paket Berjalan, ikon jadwal pengganti tersedia untuk sesi terakhir `NO_SHOW` pada rencana aktif yang belum memiliki sesi aktif berikutnya.

**Artinya:** setelah konfirmasi manual dengan pasien, psikolog memindahkan tanggal/jam sesi yang sama. Ini bukan verifikasi pembayaran dan bukan menambah satu pertemuan.

**Cara pakai:**

1. Psikolog mengonfirmasi keterlambatan/ketidakhadiran atau kebutuhan pindah jadwal dengan pasien di luar proses otomatis.
2. Klik ikon kalender pada sesi yang akan dipindah.
3. Pilih tanggal pengganti minimal H+1 WIB dan slot tersedia.
4. Pilih alasan; catat hasil kesepakatan bila diperlukan.
5. Klik Konfirmasi Reschedule Jadwal.
6. Sistem memeriksa kepemilikan, status rencana/sesi, durasi, hari praktik, kuota, hold aktif, dan overlap terhadap data terbaru sebelum menyimpan.

| Sebelum | Sesudah |
|---|---|
| `CONFIRMED` | Tetap `CONFIRMED`, dengan tanggal/jam baru. |
| `NO_SHOW`, pembayaran awal terverifikasi | Menjadi `CONFIRMED` setelah reschedule manual oleh psikolog yang menangani. |
| Rencana `COMPLETED`/`DISCONTINUED`, atau sesi `CANCELLED` | Ditolak; bukan jalur untuk membuka kembali layanan yang sudah berakhir. |
| Pemulihan no-show tetapi sudah ada sesi lain aktif/nomor sesi lebih lanjut dalam rencana | Ditolak agar sesi lama tidak diaktifkan di tengah progres yang sudah berlanjut. |

ID appointment, kode booking, nomor sesi, rencana, DP, cicilan, sisa tagihan, serta audit verifikasi tetap sama. Riwayat ketidakhadiran tidak dihapus; perubahan status/jadwal menambah event. Tidak ada DP kedua atau upload bukti baru akibat reschedule.

Tidak ada timer yang otomatis membatalkan pasien terlambat. Tidak ada status terlambat khusus atau batas menit otomatis; keputusan tetap manual oleh psikolog.

### 1.3 Pasien Melihat Hasilnya di Mana?

Pasien membuka **Jadwal & Riwayat > Detail Janji Temu**. Daftar dan detail menampilkan tanggal/jam terbaru. Bagian Riwayat Reschedule menampilkan pelaku, waktu, dan alasan perubahan terakhir. Receipt juga menampilkan informasi perubahan terakhir.

Daftar lengkap event tersimpan dalam `rescheduleHistory`, tetapi UI pasien saat ini belum menampilkan seluruh event sebagai timeline. Jangan menyebut tampilan ringkas perubahan terakhir sebagai timeline lengkap.

Setelah psikolog memindahkan sesi menjadi terkonfirmasi, pasien masih dapat mengajukan reschedule lagi melalui alur biasa. Status menjadi `PENDING` untuk konfirmasi ulang admin, tanpa DP kedua. Untuk sesi yang masih `NO_SHOW`, pasien/admin tidak dapat membukanya kembali sendiri; perlu tindakan psikolog lebih dahulu.

### 1.4 Arti Ikon Aksi Psikolog

Urutan empat ikon pada screenshot: selesai, tidak hadir, batal, lalu reschedule.

| Ikon | Fungsi | Syarat dan dampak |
|---|---|---|
| Dua centang biru (`CheckCheck`) | Tandai sesi selesai | Sesi terkonfirmasi milik psikolog; waktu selesai jadwal sudah lewat. Tidak otomatis melunasi pembayaran. |
| Orang dengan tanda silang (`UserX`) | Tandai pasien tidak hadir | Waktu mulai sudah tiba, alasan wajib, dan keputusan manual psikolog. Tidak otomatis menghentikan rencana atau menghabiskan jatah. |
| Silang dalam lingkaran merah (`XCircle`) | Batalkan seluruh layanan setelah lunas | Menghentikan satu booking/rencana beserta sisa jadwal, dengan alasan dan syarat lunas. Bukan reschedule. |
| Kalender dengan jam hijau (`CalendarClock`) | Konfirmasi dan jadwalkan ulang | Memindahkan sesi yang sama ke H+1, tanpa DP tambahan. |
| Kalender dengan tambah (`CalendarPlus`) | Jadwalkan sesi berikutnya | Membuat appointment untuk nomor sesi selanjutnya dalam jatah rencana, setelah sesi sebelumnya selesai. Berbeda dari reschedule. |
| Tombol stop (`CircleStop`) di Paket Berjalan | Hentikan paket | Memakai penghentian seluruh sisa rencana setelah lunas, bukan menghentikan satu sesi saja. |

## 2. Peta Kewenangan

Psikolog/pengelola adalah owner dan role tertinggi. Admin adalah petugas operasional, bukan super admin. Pengunjung belum login disebut `GUEST`.

| Kegiatan | Pasien | Admin | Psikolog |
|---|---|---|---|
| Booking awal | Milik sendiri | Membantu pasien lama/baru | Mengelola jadwal, bukan petugas verifikasi booking awal |
| Mengisi pre-test | Ya | Bukan pengisi hasil klinis; walk-in dapat melewati pre-test awal | Membaca profil/keluhan dan snapshot booking |
| Verifikasi DP/konfirmasi booking awal | Tidak | Ya | Tidak lewat aksi psikolog |
| Input cicilan/pelunasan aktual | Tidak | Ya, write-only | Memantau total, terbayar, dan saldo |
| Reschedule booking aktif | Milik sendiri; menunggu konfirmasi admin | Membantu dan mencatat pelaku | Booking miliknya, sesuai konfirmasi pasien |
| Memulihkan `NO_SHOW` | Tidak sendiri | Tidak | Ya, dengan jadwal pengganti dan audit |
| Complete/no-show/cancel/hentikan | Tidak | Tidak | Ya, sesuai guard masing-masing |
| Membuat sesi lanjutan dalam rencana | Tidak | Tidak | Ya |
| Harga/diskon/CMS/jam praktik | Tidak | Tidak | Ya |
| Laporan keuangan | Pembayaran milik sendiri, bukan laporan praktik | Tidak | Ya |
| Ekspor operasional reservasi | Tidak | CSV tanpa nominal | Melalui pengelolaan praktik/laporan yang tersedia |
| Ekspor data pasien | Tidak | Tidak | CSV; bukan backup database penuh |
| Ulasan | Membuat setelah sesi selesai | Moderasi | Membaca ringkasan yang tersedia |

Pembatasan frontend saat ini belum sama dengan keamanan server. LocalStorage masih dapat diperiksa melalui developer tools; nominal tidak benar-benar rahasia dari perangkat admin sebelum backend menerapkan Resource/Policy.

## 3. Pengunjung / GUEST

| Fitur dan lokasi | Fungsi dan cara kerja | Status/batasan |
|---|---|---|
| Landing page | Melihat praktik, psikolog, layanan, informasi praktik, FAQ, dan testimoni carousel. | UI tersedia dengan data demo/CMS. Harga layanan disembunyikan sebelum login. |
| Pilih layanan/CTA booking | Memulai kebutuhan booking; pengguna diarahkan login dan melengkapi profil bila belum lengkap. | Belum membuat appointment hanya karena memilih paket. |
| Masuk dengan akun Google | Membuka modal login dan memilih tombol Google. | Masih simulasi yang masuk ke akun demo, bukan OAuth Google nyata. |
| Akses cepat pengujian | Masuk sebagai psikolog, admin, pasien lama, atau pasien baru untuk pengujian role. | Bukan fitur autentikasi produksi; tidak boleh dianggap pengamanan role. |
| Consent/privacy | Membaca informasi privasi/persetujuan pada bagian landing. | Belum halaman legal terpisah atau persetujuan digital dari backend. |
| Footer/kontak/media sosial | Membuka tautan kontak yang disediakan. | Tautan kontak tidak sama dengan notifikasi WhatsApp otomatis. |

## 4. Pasien / PATIENT

### 4.1 Daftar Fitur

| Fitur / lokasi | Fungsi | Cara kerja dan hasil |
|---|---|---|
| Kelengkapan profil saat masuk | Memastikan data dasar pasien tersedia | Pasien baru diarahkan ke halaman kelengkapan profil. Mengisi identitas, kontak, pekerjaan, dan kontak darurat sebelum booking. |
| Panduan Konseling | Beranda informasi pasien | Membaca panduan dan informasi CMS; tombol Booking Jadwal/Jadwal Saya mengarahkan ke tab terkait. |
| Booking Konsultasi: pilih layanan | Membandingkan dan memilih layanan | Kartu horizontal, search nama/deskripsi/notes, filter kategori, urutan harga/nama, pagination enam layanan. Notes tampil langsung; rincian lengkap melalui dialog. |
| Booking Konsultasi: tanggal/jam | Memilih slot konsultasi | Tanggal H+1, durasi mengikuti layanan, mempertimbangkan jam praktik, libur, jeda, kuota, appointment, dan hold aktif. Pilihan belum sama dengan booking terkonfirmasi. |
| Formulir pre-test | Profiling keluhan sebelum konsultasi | Mengisi pekerjaan/kontak darurat, beberapa keluhan, deskripsi, stres, tidur, dan harapan opsional. Draft disimpan; booking menyimpan referensi/snapshot agar histori tidak tertimpa. |
| Konfirmasi dan consent | Menyetujui pemrosesan data dan memeriksa tagihan/jadwal | Snapshot versi consent dan waktu persetujuan melekat pada booking. Pre-test bukan diagnosis. |
| Upload bukti DP | Mengajukan bukti pembayaran awal | Alur mandiri saat ini memakai transfer, nama pengirim, serta file JPG/PNG/WEBP/PDF. Rekening muncul setelah hold valid dan consent. DP flat Rp100.000 mengurangi total, dibatasi total bila lebih kecil. |
| Jadwal & Riwayat | Memantau appointment milik sendiri | Cari/filter dan buka detail; melihat jadwal, status sesi, progres pembayaran, dan timeline seluruh perubahan jadwal beserta pelaku/alasan. |
| Ajukan Reschedule Jadwal | Memindahkan appointment aktif milik sendiri | Dari Detail Janji Temu, pilih H+1/slot/alasan. Status menjadi menunggu konfirmasi ulang admin. Pembayaran tidak diulang. |
| Invoice/receipt | Memeriksa pembayaran sendiri | Dari detail/riwayat membuka receipt, lalu cetak/simpan PDF lewat dialog browser. Menampilkan total, pembayaran yang tercatat, dan sisa. Bukan menu kwitansi mandiri baru. |
| Beri ulasan | Menilai pengalaman setelah konsultasi | Hanya appointment `COMPLETED`, satu review aktif per appointment; dapat anonim. Belum tampil publik sebelum moderasi admin. |
| FAQ & Bantuan | Membaca jawaban operasional | FAQ/search dan informasi bantuan yang disediakan; bukan chat konsultasi internal. |
| Pencocokan pembayaran | Menghindari transfer kedua saat hold/quote tidak valid | Jika bukti dikirim setelah expiry/quote berubah, kasus `OPEN` ditampilkan dan admin menindaklanjuti pencocokan/jadwal pengganti. Tidak otomatis dianggap lunas. |

### 4.2 Urutan Booking Mandiri

1. Login dan lengkapi profil.
2. Pilih layanan, baca notes, lalu pilih tanggal H+1 dan jam tersedia.
3. Isi pre-test, lalu lanjut ke konfirmasi. Sistem mencoba membuat hold sebelum instruksi transfer.
4. Periksa rincian dan setujui consent; untuk layanan berbayar lakukan transfer DP dan unggah bukti beserta nama pengirim.
5. Kirim booking. Setelah tersimpan, appointment berstatus `PENDING` dan pembayaran menunggu verifikasi; bukan otomatis terkonfirmasi hanya karena transfer.
6. Admin memeriksa transaksi dan mengonfirmasi.
7. Pasien melihat jadwal terbaru di Jadwal & Riwayat dan mengikuti sesi tatap muka/telelayanan yang disepakati.
8. Psikolog menandai selesai; admin mencatat pembayaran lanjutan sesuai kesepakatan. Kedua status ini berbeda.

Layanan gratis tidak membutuhkan transfer/bukti, tetapi tetap mengikuti pre-test, consent, jadwal, dan konfirmasi yang berlaku. Telelayanan dilakukan lewat platform pihak ketiga; web tidak menyediakan ruang chat/video internal.

Panel Reservasi sebelumnya dan tombol lanjutkan/lepaskan sudah dihapus sesuai arahan developer. Hold teknis dan pemulihan pada Booking Konsultasi masih ada, bukan fitur pelepasan manual pasien.

## 5. Admin / ADMIN

Menu nyata admin: **Booking & Verifikasi**, **Monitoring User**, dan **Moderasi Review**.

| Fitur / lokasi | Fungsi | Cara kerja dan hasil |
|---|---|---|
| Daftar Booking & Verifikasi | Memantau booking | Cari kode/nama pasien, filter status, pagination, serta melihat data administratif jadwal dan status pembayaran. Tidak menampilkan harga/sisa tagihan. |
| Verifikasi bukti pembayaran | Mencocokkan penerimaan sebelum konfirmasi awal | Buka modal, lihat preview gambar atau buka PDF, periksa pengirim/metode/channel dan transaksi nyata, isi tanggal diterima serta catatan opsional, lalu konfirmasi. |
| Konfirmasi perubahan jadwal | Menyetujui reschedule pasien yang DP-nya sudah terverifikasi | Aksi konfirmasi khusus mengubah `PENDING -> CONFIRMED` tanpa DP kedua atau menimpa audit pembayaran awal. |
| Booking walk-in | Membantu pendaftaran pasien di klinik | Pilih pasien lama atau buat draft pasien baru, pilih layanan/jadwal H+1, metode/channel dan nominal uang masuk aktual. Data pasien baru/booking disimpan setelah proses valid. Bukan konsultasi H+0. |
| Catat pembayaran | Mencatat uang masuk setelah DP | Masukkan nominal aktual, tanggal diterima, metode/channel. Bisa bertahap. Sistem menolak lebih dari sisa; nominal yang tersimpan tidak ditampilkan kembali di portal admin. |
| Pelunasan untuk penghentian | Mencatat uang sebelum psikolog membatalkan | Pilih tujuan `CANCELLATION_SETTLEMENT`; pencatatan tidak membatalkan sesi. Psikolog tetap harus memproses pembatalan sendiri. |
| Bantu reschedule | Memindahkan jadwal pasien aktif | Pilih tanggal H+1, jam tersedia dan alasan. Jika slot hilang, pilihan dikosongkan dan wajib dipilih ulang. Form usang ditolak dengan guard versi. Status aktif sebelumnya dipertahankan; identitas admin masuk audit. Tidak dapat memulihkan `NO_SHOW` sendiri. |
| Receipt administratif | Mencetak bukti administratif proses | Setelah verifikasi atau melalui ikon receipt, pilih cetak/simpan PDF atau screenshot. Tidak menampilkan nominal tersimpan, harga paket, atau saldo. |
| Ekspor CSV reservasi | Mengunduh daftar administratif sesuai filter | Mengunduh kode, pasien, paket, tanggal/jam, metode/status layanan dan pembayaran; bukan laporan keuangan. |
| Pencocokan pembayaran | Menangani bukti setelah hold tidak valid | Periksa kasus `OPEN`, gunakan bukti yang sama, siapkan jadwal pengganti H+1, input penerimaan aktual, kemudian verifikasi. Kasus terkait menjadi `BOOKED`; tidak meminta transfer kedua. |
| Monitoring User | Melihat daftar akun | Cari/filter role, lihat nama/kontak/status; tidak ada CRUD, blokir, atau hapus akun. Pembuatan pasien untuk walk-in adalah alur berbeda. |
| Moderasi Review | Mengatur ulasan publik | Cari/filter, baca, setujui, atau tolak/hapus review. Penolakan pada mock saat ini menghapus review dari daftar, bukan menyimpan status penolakan permanen. |

### 5.1 Syarat Verifikasi dan Pencatatan Uang

- Konfirmasi awal mengubah appointment menjadi `CONFIRMED` dan pembayaran menjadi `DP_PAID` atau `PAID` sesuai uang yang telah diverifikasi.
- Pemilihan FULL pada walk-in belum berarti lunas sebelum verifikasi. Untuk psikoterapi, awalnya tetap DP; pembayaran berikutnya biasanya setelah sesi pertama selesai.
- Admin memasukkan uang yang benar-benar diterima, bukan menentukan harga layanan atau diskon. Metode mencakup cash, transfer, QRIS, EDC, atau lainnya, dengan rincian channel bila diperlukan.
- Jika bukti belum cocok, tahan konfirmasi dan lakukan pemeriksaan manual. Tidak ada aksi penolakan/cancel booking atau permintaan unggah ulang dari flow ini.
- Jika nominal melebihi sisa, sistem menolak tanpa membocorkan target saldo. Penanganan koreksi/kelebihan bayar/refund belum menjadi fitur lengkap.
- Tidak ada checkbox pernyataan Saya sudah memeriksa; pemeriksaan adalah pekerjaan admin. Menampilkan gambar bukti bukan bukti aplikasi dapat memastikan petugas benar-benar memeriksa mutasi bank.

**Larangan:** admin tidak boleh complete, no-show, cancel, delete appointment, menghentikan rencana, mengatur tarif/diskon, mengedit CMS, atau mengakses laporan keuangan owner.

## 6. Psikolog / PSYCHOLOGIST / Pengelola

### 6.1 Menu dan Fitur

| Menu | Fungsi | Cara kerja dan hasil |
|---|---|---|
| Ringkasan Praktik | Memantau aktivitas praktik | Melihat ringkasan sesi/pasien/jadwal dan membuka data pasien dari sesi yang ditampilkan. Nilainya berasal dari prototype, bukan database produksi. |
| Keuangan & Uang Masuk | Memantau penerimaan | Meninjau total uang masuk, ringkasan transaksi dan filter. Sumber perhitungan adalah event penerimaan yang terverifikasi, bukan sekadar harga paket atau status sesi. |
| Ruang Cetak & Pratinjau Ekspor | Menghasilkan laporan | Dari menu keuangan, pilih bulan/tahun, rentang, atau semua data. Preview A4, cetak/simpan PDF, unduh CSV atau ekspor `.xls`. Semua baris sesuai filter diekspor, bukan hanya halaman preview. |
| Jadwal & Hari Praktik | Mengatur ketersediaan | Atur buka/tutup mingguan, jam kerja, kuota, override tanggal khusus, dan hari libur; klik Simpan. Perubahan yang menabrak booking/hold aktif ditolak, bukan membatalkan pasien otomatis. |
| Manajemen Paket | Mengelola katalog | Tambah/edit, preview, aktif/nonaktif, atau hapus layanan. Isi kategori, mode tatap muka/telelayanan, durasi, tarif, rangkaian sesi, manfaat, badge, notes, dan diskon. Paket yang sudah memiliki booking/hold tidak dapat dihapus; nonaktifkan untuk menghentikan penjualan. |
| Diskon pada form paket | Menentukan harga efektif | Tambah/edit/hapus diskon nominal atau persen, lalu simpan paket. Pasien tidak memasukkan voucher. Booking yang sudah tersimpan tetap memakai snapshot harga transaksi. |
| Paket Berjalan | Mengelola rencana multi-sesi | Lihat pasien/paket, jumlah selesai, jadwal aktif, total/terbayar/saldo/status; jadwalkan sesi selanjutnya, jadwal pengganti no-show, atau hentikan paket sesuai syarat. |
| Data Pasien & Pre-Test | Persiapan pertemuan | Cari pasien, buka detail profil/pre-test dan riwayat appointment. Untuk booking dengan snapshot, pilih pre-test berdasarkan booking agar tidak hanya membaca draft terbaru. Bukan editor rekam medis/SOAP lengkap. |
| Ekspor data pasien | Mengunduh ringkasan pasien yang tersaring | Unduh CSV berisi identitas, kontak darurat, keluhan, stres, tidur, serta jumlah sesi. Bukan backup seluruh file bukti, seluruh snapshot, atau database yang dapat di-restore. |
| CMS Konten | Mengelola isi dan identitas praktik | Edit landing/carousel, media/kontak/Instagram, rekening DP, QRIS kasir, banner/pengumuman pasien, panduan psikolog dan kop laporan. Disimpan ke LocalStorage sebelum sukses; bukan hak admin. Rincian field dan bagian statis ada di [audit CMS](CMS_AUDIT.md). |
| Profil Praktik | Mengelola profil profesional | Menu sidebar desktop/menu ponsel untuk bio, foto, pendidikan, spesialisasi, pendekatan, bahasa, alamat, dan kredensial. Simpan menunggu persistensi; bukan pengaturan tarif atau slot. |
| Riwayat Sesi | Menjalankan aksi psikolog pada appointment | Cari/filter/pagination; aksi selesai, tidak hadir, batal seluruh layanan, reschedule, serta sesi berikutnya muncul sesuai kondisi. Lihat penjelasan ikon di bagian 1. |

### 6.2 Cara Kerja Paket Berjalan

1. Booking layanan berkelanjutan membuat rencana dan appointment sesi pertama, bukan membuat semua slot sekaligus.
2. Admin memverifikasi DP awal.
3. Psikolog melaksanakan sesi dan menandai `COMPLETED` setelah waktu akhir jadwal lewat.
4. Pada Paket Berjalan/Riwayat Sesi, psikolog memilih Jadwalkan sesi berikutnya dan slot H+1 yang valid.
5. Sistem membuat ID appointment/kode sesi baru, nomor sesi bertambah satu, tetapi tetap merujuk rencana/pembayaran pertama. Tidak menyalin DP sebagai penerimaan baru.
6. Selama masih ada sesi aktif berikutnya, penjadwalan sesi tambahan ditolak. Rencana selesai/dihentikan atau jatah habis tidak dapat ditambah.
7. Ketika seluruh jatah sesi selesai, rencana menjadi `COMPLETED`. Ini tidak otomatis mengubah pembayaran menjadi `PAID`.

Untuk psikoterapi, rencana awal empat sesi dengan tarif per sesi. Setelah empat sesi, kebutuhan terapi lanjutan memakai booking/rencana baru dan DP baru yang mengurangi total rencana baru. Tidak ada tombol menambah sesi kelima pada rencana lama. Penomoran klinis lanjutan dapat dicatat di rekam medis di luar sistem booking.

Jika pasien tidak hadir, jangan menandainya selesai hanya untuk membuka sesi berikutnya. Psikolog mengonfirmasi manual dan dapat memindahkan appointment yang sama melalui ikon jadwal pengganti, tanpa menambah jatah atau DP.

### 6.3 Perbedaan Reschedule, Sesi Berikutnya, dan Booking Baru

| Aksi | Appointment | Nomor sesi | Pembayaran |
|---|---|---|---|
| Reschedule | ID sama, tanggal/jam berganti | Tetap | Ledger/DP tetap; tidak ada DP kedua. |
| Jadwalkan sesi berikutnya | ID/kode appointment baru dalam rencana sama | Bertambah sesuai jatah | Merujuk tagihan rencana awal; tidak ada DP baru. |
| Booking psikoterapi ulang setelah empat sesi | Booking dan rencana baru | Kembali mulai dari sesi 1 rencana baru | DP dan ledger rencana baru; tidak memindahkan kas rencana lama. |
| Batalkan/hentikan | Histori tidak dihapus | Tidak diteruskan | Wajib lunas menurut aturan saat ini; tidak auto-refund. |

## 7. Fitur Bersama dan Batas Implementasi

| Fitur | Cara kerja saat ini | Yang belum boleh diasumsikan |
|---|---|---|
| Sidebar/menu HP | Sidebar dapat dikecilkan; navbar menyediakan navigasi role pada ponsel. | Belum seluruh viewport diuji langsung. |
| Detail Profil & Akun pada avatar | Menyimpan nama/telepon sendiri dan kontak darurat pasien; validasi/ownership/allowlist, sukses setelah persistensi. | Email SSO, role, dan status tidak dapat diubah dari form. Ini bukan rekam medis atau pengelolaan akun orang lain. |
| Profil psikolog khusus | Menu Profil Praktik tersedia pada desktop dan ponsel, membaca data tersimpan. | Nomor izin yang diisi bukan hasil verifikasi regulator otomatis. |
| Logout | Mengembalikan tampilan ke guest lewat state autentikasi prototype. | Bukan pencabutan session/token produksi. |
| Sinkronisasi prototype | Perubahan workflow dipersistenkan dan disinkronkan pada tab dalam browser/origin yang sama. | Bukan sinkronisasi antarperangkat atau izin server. |
| Proteksi slot | Web Lock, validasi ulang overlap/kuota dan hold lokal sebelum transfer. | Tidak menggantikan transaction dan kapasitas server. Hold default 15 menit masih konfigurasi prototype. |
| Form reschedule | Menyimpan versi jadwal saat dibuka dan menolak submit jika aktor lain telah mengubah appointment. | Harus tutup, periksa jadwal terbaru dan pilih ulang. Backend wajib conditional update/409; versi lokal belum jaminan antarperangkat. |
| Expiry hold | Hanya hold belum expired yang dipulihkan/memblokir reservasi baru; histori lama tetap ada untuk bukti terlambat. | Tidak ada cancel appointment otomatis, pelepasan manual baru, atau kewajiban DP kedua pada reschedule. |
| Receipt/laporan PDF | Menggunakan `window.print()` dan Save as PDF milik browser. | Bukan PDF immutable yang disimpan server. |
| Excel | Export `.xls` berupa tabel HTML kompatibel spreadsheet, selain CSV. | Belum workbook `.xlsx` asli meski ada teks UI yang menyebut `.xlsx`. |
| Consent | Checkbox dan snapshot persetujuan pada booking, informasi privasi pada landing. | Belum audit server dengan metadata request dan dokumen legal final. |

## 8. Yang Tidak Ada atau Masih Menunggu Backend

- Tidak ada chat konsultasi/video internal, mesin tes psikologi mandiri, atau diagnosis otomatis. Kategori asesmen adalah penjualan/jadwal layanan, bukan berarti alat tes dikerjakan di web.
- Tidak ada auto-cancel karena terlambat, auto-refund, permintaan upload ulang bukti, voucher pasien, atau tambah kuota sesi pada rencana psikoterapi yang sama.
- Google OAuth/Sanctum, database MySQL, role Policy/Resource, penyimpanan bukti privat, dan audit permanen belum aktif.
- WhatsApp otomatis untuk booking, pembayaran, jadwal/reschedule, dan reminder belum dikirim oleh prototype. Service notifikasi hanya kontrak, bukan provider yang sudah berjalan.
- Backup/restore database lengkap, koreksi/refund pembayaran berotorisasi, invoice permanen, serta sinkronisasi antarperangkat belum tersedia.
- Setelah backend dibuat, FE tetap perlu menangani data loading/error, konflik versi, re-fetch, upload/download nyata, dan session expired. Menghubungkan URL endpoint saja belum menyelesaikan semua flow.

## 9. Status Perbaikan Audit

Temuan pada audit awal telah diperbaiki pada prototype atas permintaan developer. Status saat ini:

| Temuan | Perbaikan | Batas verifikasi |
|---|---|---|
| Profil navbar sukses semu | Allowlist dan persist-before-success; email SSO read-only. | Tes helper/validasi; perlu QA form browser. |
| Label admin dan jalur profil psikolog | Admin Operasional; menu Profil Praktik desktop/mobile. | Perlu QA navigasi browser. |
| Tooltip keluar layar | Ukuran aktual, wrapping, flip/clamp viewport. | Tes matematika 320/375/430/1280 px; belum screenshot browser. |
| Form jadwal usang | Expected version diperiksa dalam lock, bertambah setiap reschedule. | Tes dua aktor paralel; backend wajib menerapkan versi server. |
| Jam admin berubah otomatis | Pilihan hilang dikosongkan, submit dinonaktifkan sampai pilih ulang. | Perlu QA interaksi lintas-tab. |
| Hold expired menghambat booking | Hanya hold aktif yang dipulihkan/dicegah duplikat; histori/bukti lama dipertahankan. | Tes expiry dan bukti terlambat; TTL produksi belum diputuskan. |
| Histori pasien hanya terakhir | Timeline semua event di detail dan receipt; legacy memiliki fallback. | Tes render statis; print nyata belum QA. |
| Field CMS tidak tersambung | Footer/carousel/media/banner/rekening/QRIS/logo kop dihubungkan. | Tes validasi/storage dan sebagian render; semua field perlu QA browser. |
| Data pasien dan storage bersama | Belum diselesaikan oleh frontend. | Policy ownership, Resource terpisah, dan storage privat wajib backend. |

Checkpoint terbaru: TypeScript 0 error dan 36/36 tes regresi terfokus, bukan QA browser untuk seluruh fitur. Git/dev/build tidak dijalankan.

## 10. Sumber Pemeriksaan

- [Routing role dan kelengkapan profil](../resources/js/App.tsx).
- [Menu pasien](../resources/js/components/patient/PatientDashboard.tsx), [booking/pre-test/pembayaran](../resources/js/components/patient/tabs/BookingTab.tsx), [jadwal/detail/receipt pasien](../resources/js/components/patient/tabs/HistoryTab.tsx).
- [Menu admin](../resources/js/components/admin/AdminDashboard.tsx), [reservasi/verifikasi/pembayaran](../resources/js/components/admin/tabs/ReservationsTab.tsx), [moderasi review mock](../resources/js/api/adminEndpoints.ts).
- [Menu psikolog](../resources/js/components/psychologist/PsychologistDashboard.tsx), [aksi riwayat](../resources/js/components/psychologist/tabs/HistoryTab.tsx), [paket berjalan](../resources/js/components/psychologist/tabs/TreatmentPlansTab.tsx).
- [Guard dan mutasi workflow](../resources/js/context/AppContext.tsx), [pembatalan seluruh rencana](../resources/js/utils/appointmentWorkflow.ts), [policy reschedule](../resources/js/utils/reschedulePolicy.ts).
- [Login demo](../resources/js/components/auth/LoginModal.tsx), [profil navbar](../resources/js/components/layout/Navbar.tsx), [tooltip](../resources/js/components/common/Tooltip.tsx).
- [Ekspor laporan](../resources/js/components/admin/tabs/ExportFinancePage.tsx), [data dan ekspor pasien](../resources/js/components/psychologist/tabs/PatientsTab.tsx).
- Lihat juga [aturan bisnis](BUSINESS_RULES.md), [izin role](ROLES_PERMISSIONS.md), [alur fitur](FEATURE_FLOWS.md), [activity diagram](ACTIVITY_DIAGRAMS.md), dan [isu yang diketahui](KNOWN_ISSUES.md).

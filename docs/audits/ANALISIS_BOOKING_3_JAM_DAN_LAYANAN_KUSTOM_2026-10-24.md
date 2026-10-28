# Analisis booking tiga jam dan layanan kustom — 24 Oktober 2026

## Status dan kesimpulan

Ini analisis kebutuhan terbaru beserta jawaban developer, bukan implementasi atau penggantian diam-diam seluruh kontrak aktif. Kode Eko tidak diubah. Pembaruan pemeriksaan lanjutan: developer memilih **tiga jam kerja penuh**, termasuk ketika melintasi istirahat. Rumus waktu tersebut sudah diputuskan; cutoff pembayaran dan model data yang diusulkan di bawah tetap dibedakan dari keputusan eksplisit.

Arah kebutuhan dapat dibuat konsisten: booking online memakai jeda baru dan boleh same-day; Admin dapat mencatat offline/janji eksternal hari ini; layanan di luar katalog dapat dicatat tanpa memaksa transaksi berbayar. Konflik utamanya ada pada aturan lama yang masih tertulis dan pada hubungan pembayaran dengan waktu pengingat. Bukan berarti semua permintaan tersebut bertentangan satu sama lain.

## Keputusan manusia yang terkonfirmasi pada percakapan ini

1. Pasien online memesan23:55 atau05:00; bila klinik berikutnya buka08:00–16:00, dapat memilih paling cepat11:00 jika slot dan durasi memungkinkan.
2. Jawaban eksplisit: booking online05:00 boleh memilih11:00 pada hari yang sama. Dengan demikian H+1 online sebelumnya tidak lagi menjadi syarat umum.
3. Admin dapat membuat booking offline hari ini pada slot yang tersedia; komunikasi persetujuan owner dilakukan di luar sistem.
4. Pasien yang memiliki janji dengan owner tetapi belum ada di aplikasi dapat dicatat Admin setelah dikonfirmasi ke owner; pembayaran diperiksa atau diminta sesuai layanan.
5. Developer menginginkan Admin fleksibel mencatat tambahan layanan/janji di luar katalog agar tidak ada catatan terlewat. Jenis klinis/nonklinisnya tidak dibatasi oleh jawaban developer. Jangan mengasumsikan seluruhnya sekadar rapat atau otomatis konsultasi gratis.
6. Jawaban terakhir: pasien sudah membayar tetapi belum diverifikasi Admin tidak menghalangi pengingat H-2 kepada owner. Admin boleh memverifikasi saat pasien datang. Jadi verifikasi Admin bukan prasyarat pengingat tersebut.
7. Pada pemeriksaan lanjutan, developer memilih tiga jam kerja penuh: permintaan10:30 dengan istirahat12:00–13:00 menghasilkan batas14:30, bukan13:30. Ini menggantikan interpretasi satu jam kerja ditambah dua jam biasa yang sempat direkomendasikan.

## 1. Arti jeda tiga jam

Contoh sederhana tanpa istirahat: booking05:00, Admin mulai08:00, ruang persiapan08:00–09:00, pengingat09:00, sesi11:00. Booking23:55 malam sebelumnya menghasilkan batas awal yang sama bila hari berikutnya buka08:00.

Setelah klarifikasi terakhir, satu jam bukan janji bahwa uang wajib sudah VERIFIED sebelum09:00. Ia menjadi ruang persiapan/administrasi. Status bukti dapat masih menunggu pemeriksaan ketika reminder terkirim.

**Perhitungan yang sudah dipilih developer:** batas awal mengikuti penambahan tiga jam operasional penuh pada kalender, bukan memblokir tiga jam pertama pada setiap tanggal selamanya.

- Ambil tiga jam operasional sejak reservasi berhasil dibuat; waktu tutup/libur/istirahat tidak dihitung.
- Cari interval kosong sesudah batas itu dengan durasi layanan utuh dalam jam yang sah.
- Hitung jadwal reminder secara terpisah: dua jam waktu nyata sebelum sesi. Reminder otomatis boleh jatuh saat istirahat; tidak menunggu dua jam kerja.

Contoh reservasi10:30, istirahat12:00–13:00:10:30–12:00 menyumbang1,5jam dan13:00–14:30 menyumbang1,5jam, sehingga batas awal14:30. Reminder untuk sesi14:30 dijadwalkan12:30, bukan menghitung mundur dua jam operasional. Interpretasi lama satu jam kerja+dua jam biasa menghasilkan13:30 dan telah diganti oleh jawaban developer.

| Permintaan | Kalender contoh | Hasil analisis |
|---|---|---|
| Jumat23:55 | Sabtu08:00–16:00 | Batas awal Sabtu11:00 |
| Sabtu05:00 | Sabtu08:00–16:00 | Batas awal Sabtu11:00, same-day sah |
| Sabtu08:30 | Buka08:00–16:00 tanpa istirahat | Batas awal11:30; pilih slot konkret yang tersedia dan muat |
| Sabtu10:30 | Istirahat12:00–13:00 | Batas awal14:30; reminder12:30 jika syarat pembayaran terpenuhi |
| Malam sebelum hari libur | Hari berikutnya tutup | Hitung dari interval operasional berikut yang benar-benar buka |

Jam11:00 adalah batas pada contoh, bukan jaminan tersedia. Jika slot11:00 terisi, pilih sesudahnya. Jika layanan tidak selesai sebelum klinik tutup atau melewati jeda yang tidak boleh dipakai, pilih interval/hari lain.

**Jangan memblokir pagi untuk booking jauh hari:** pasien sudah menyelesaikan proses sebelumnya dan memilih minggu depan08:00 dapat tetap menggunakan08:00 bila semua guard sah. Jika setiap hari online dipaksa baru mulai11:00, jam08:00–11:00 hilang dari online meskipun owner sudah diberi pengingat. Asesmen240menit pun dapat tidak pernah muat pada kalender08:00–12:00 dan13:00–16:00 karena blok pagi empat jam terlarang dan blok sore hanya tiga jam.

## 2. Bukti pembayaran dan pengingat

Tanpa integrasi bank, aplikasi tidak dapat mengetahui uang nyata hanya dari klaim pasien. Peristiwa otomatis yang dapat diamati adalah bukti lengkap yang diterima server. Admin tetap menentukan penerimaan VERIFIED setelah mencocokkan uang. Untuk tunai/offline, pencatatan petugas menjadi peristiwa yang sesuai; jangan memaksa upload bukti bank untuk tunai.

Syarat reminder yang konsisten dengan jawaban developer: bukti pembayaran awal sudah masuk tepat waktu **atau** minimum awal sudah terverifikasi **atau** layanan tersebut memang tidak mensyaratkan pembayaran baru. Jangan mengubah status uang menjadi VERIFIED/PAID hanya agar reminder dapat berjalan.

Contoh pesan owner: “Jadwal hari ini11:00, pasien…, layanan…. Bukti pembayaran sudah masuk, menunggu verifikasi Admin.” Pesan ini memberitahu jadwal dan keadaan pemeriksaan; tidak menyatakan bank sudah mengesahkan transfer. Tautan detail tetap memerlukan akses sah dan jawaban klinis tidak disalin ke WhatsApp.

## 3. Konsekuensi terhadap deadline pembayaran awal

Jika reminder wajib terkirim setelah bukti masuk dan tepat dua jam sebelum sesi, bukti harus masuk paling lambat T-2jam. Sesi11:00 berarti cutoff09:00, bukan08:00 dan bukan11:00. Cutoff08:00 hanya diperlukan bila verifikasi harus selesai sebelum reminder; developer sudah menyatakan verifikasi belum selesai tidak masalah.

**Rumus yang disarankan untuk booking online baru yang perlu pembayaran awal:**

payment_proof_deadline = min(reservasi_dibuat+24jam, awal_sesi-2jam).

Batas24jam tetap maksimum perlindungan awal, bukan waktu baru setiap transfer dan bukan deadline pelunasan seluruh rangkaian. Ini mengubah rumus lama min24jam/awal_sesi; dokumen lama tidak dapat dipertahankan harfiah bila reminderH-2 selalu mensyaratkan pembayaran/bukti.

| Kasus untuk sesi Sabtu11:00 | Tindakan yang konsisten |
|---|---|
| Reservasi Jumat23:55, bukti Sabtu07:30 | Reminder09:00; verifikasi boleh masih pending sampai pemeriksaan nyata |
| Reservasi Sabtu05:00, bukti08:45 | Reminder09:00 tetap boleh; tidak mewajibkan sudah satu jam diverifikasi |
| Bukti diterima tepat09:00 | Boundary perlu diproses konsisten; event bukti dan reminder diurutkan/dideduplikasi, tidak hilang karena job membaca sebelum commit |
| Belum ada bukti sampai lewat09:00 | Reservasi online belum memenuhi alur normal reminderH-2; jangan mengaku sudah membayar atau mengirim reminder konfirmasi palsu |
| Bukti baru09:30 | Tidak bisa menghasilkan reminder yang benar pada09:00; Admin menangani keterlambatan, atau pasien memilih jadwal lain yang masih memenuhi jeda |
| Transfer sesudah sesi lewat | Uang nyata tetap dicocokkan/dicatat dan ditautkan ke reservasi asal; tidak menghidupkan slot/hadir otomatis atau meminta bayar ulang |

**Penanganan yang masih perlu ditulis tegas:** batas koreksi bukti ditolak, proof terlambat, dan invoice reservasi belum dibayar yang expired. Untuk bukti tepat waktu yang kemudian ditolak, keputusan reject tetap disimpan; owner menerima pembaruan kondisi jadwal/pembayaran dan Admin menindaklanjuti, bukan mengarang waktu reminder lama. Bila tidak ada uang/layanan, akibat tagihan tidak boleh ditentukan diam-diam dari status EXPIRED; ini pertanyaan finansial terpisah yang telah dicatat pada audit sebelumnya.

Pengingat bukan jaminan pesan sudah dibaca. Jika Baileys gagal, simpan status gagal/retry dan berikan tugas kontak manual kepada petugas; tidak menandai SENT atau VERIFIED secara fiktif. Waktu kirim bisa dijadwalkan T-2; keterlambatan worker/provider tidak dapat dijamin nol detik.

## 4. Offline dan janji owner yang belum tercatat

Alur yang disarankan:

1. Cari pasien/penanggung jawab dan appointment yang mungkin sudah ada dengan identitas serta waktu yang sesuai. Jangan langsung membuat duplikat dari ucapan “sudah janjian”.
2. Bila belum ada, Admin mengonfirmasi janji kepada owner di luar aplikasi sesuai keputusan developer.
3. Catat interval sebenarnya pada slot/resource bebas. Alasan dan keterangan “sesuai konfirmasi owner di luar sistem” cukup sebagai konteks administratif; tidak perlu approval workflow baru. Actor pencatat adalah Admin, bukan memalsukan login owner.
4. Pilih layanan standar, layanan kustom berbayar, termasuk transaksi sebelumnya, atau tidak ditagih sesuai arahan owner.
5. Untuk layanan berbayar, periksa pembayaran yang sudah ada atau catat uang yang benar-benar diterima. Nominal boleh berbeda dari DP/total; kurang/lebih dihitung, bukan mengubah jumlah aktual agar cocok pilihan form.
6. Jika jadwal masuk kurang dari dua jam sebelum mulai, kirim pemberitahuan segera sebagai booking/pencatatan mendadak. Jangan memundurkan created_at atau mengklaim reminderH-2 sudah dikirim. Owner memang sudah dikontak di luar sistem; ini exception manual yang tercatat.

Same-day offline dan reminderH-2 untuk booking online tidak bertentangan bila cakupannya eksplisit. Kalau reminderH-2 diwajibkan tanpa pengecualian pada semua jalur, appointment mendadak kurang dari dua jam tidak mungkin dipenuhi. Persetujuan owner atas janji tidak otomatis membolehkan overlap dengan appointment pasien lain; selesaikan konfliknya atau pilih interval lain.

## 5. Layanan atau jadwal kustom di luar katalog

Jawaban developer menunjukkan kebutuhan pencatatan yang fleksibel, bukan sekadar menambah satu paket gratis publik. Usulan UI: **Layanan/Jadwal Kustom — khusus petugas**, dengan label dan ketentuan per appointment. Tidak menambah kategori publik keempat atau mengubah harga master untuk semua pasien.

| Pilihan penagihan | Makna | Pencatatan |
|---|---|---|
| Berbayar | Ada biaya khusus yang disepakati | Nominal kewajiban dan penerimaan aktual terpisah; bila belum diterima tampil belum dibayar |
| Termasuk layanan/transaksi sebelumnya | Pertemuan tambahan merupakan bagian case/paket yang sudah ada | Tautkan case/billing asal, tanpa BASE/DP kedua; bukan otomatis gratis atau lunas jika tagihan asal masih ada |
| Tidak ditagih sesuai arahan owner | Tidak ada kewajiban biaya baru pada appointment ini | Payment requirement NOT_REQUIRED atau padanan yang jelas; tidak membuat receipt/kas0 atau menandai penerimaan fiktif |

Contoh: evaluasi hasil asesmen yang sudah termasuk paket memakai opsi kedua. Pertemuan tambahan owner yang memang tidak ditagih memakai opsi ketiga. Konsultasi khusus berbayar di luar katalog memakai opsi pertama. Jangan mencatat opsi pertama sebagai “tidak ditagih” hanya karena pasien belum membawa uang.

Field minimum yang disarankan: pasien/penanggung jawab, judul singkat administratif, tanggal dan start/end/durasi, sumber/offline atau janji eksternal, pilihan penagihan, nominal bila berbayar, referensi transaksi bila included, alasan/konteks owner dan pencatat/waktu server. Konteks klinis tetap milik praktisi; Admin tidak mengisi diagnosis atau menyalin kertas profiling ke catatan bebas.

Semua pilihan tetap mengokupansi kalender. Gratis bukan durasi0, bukan tanpa batas slot, bukan otomatis sesi terapi terhitung, bukan otomatis berhak review klinis dan bukan menghapus utang transaksi lain. Jika layanan klinis benar diberikan, consent/profiling/riwayat relevan tetap mengikuti konteks layanan; jangan menganggap semua layanan kustom nonklinis.

Perubahan appointment berbayar menjadi tidak ditagih sesudah invoice/uang terbit memerlukan koreksi berjejak dan kebijakan tersendiri, bukan menimpa nominal lama. Pertemuan termasuk paket harus ditautkan ke billing asal agar tidak menagih dua kali.

## 6. Dampak pada aturan dan implementasi lama

| Bagian | Perlu diselaraskan |
|---|---|
| [kalender/cutoff](../OPERATING_WINDOW_AND_BOOKING_CUTOFF.md), F05/F06 | Lepas H+1 umum online dan lead6jam, definisikan jendela baru serta kalender buka/istirahat/libur/durasi |
| F08 dan aturan hold | Pertimbangkan cutoff buktiT-2, perlindungan bukti tepat waktu, reject/koreksi/late proof dan akibat invoice expired |
| F13/outbox | Reminder owner dapat memakai bukti belum terverifikasi; status pesan jujur, pembatalan/revisi jadwal membatalkan reminder lama |
| SLA12jam/auto-confirm lama | Tidak boleh menjadi satu-satunya jalur keputusan jadwal. Verifikasi saat datang tetap sah; tidak mengesahkan uang otomatis. Definisikan apakah SLA lama masih dipakai hanya untuk antrean administratif |
| F04/F17 dan model biaya | Dukungan custom/included/not-required khusus petugas tanpa membuka diskon100% global secara tersirat |
| F10/check-in | Kondisional: pembayaran awal sah untuk yang diwajibkan, atau requirement tidak ada/included yang sesuai; bukan semua appointment wajib mempunyai penerimaan |
| F09/reschedule | Eligibility/requested_at dan kuota tidak berubah sendiri. Target baru harus menilai lead/reminder yang relevan; late exception hanya manual sesuai kewenangan, tidak membuat DP ulang |
| Schema/WEB_CONTRACT/DTO | Layanan kustom dan payment requirement harus menjadi kontrak nyata; field package wajib dan receipt uang positif lama tidak dapat diasumsikan cukup tanpa perubahan desain |
| Source Eko / tes | Guard H+1, hold15menit, verifikasi/minimum, kalender dan reminder perlu dikerjakan kemudian sesuai kontrak final; tes lama H+1 tidak boleh dipakai untuk membatalkan keputusan manusia terbaru |

## 7. Kasus penerimaan yang perlu diuji saat implementasi

- 23:55 dan 05:00 menghasilkan 11:00 saat hari berikut/harinya buka 08:00, slot dan durasi memungkinkan.
- Same-day online sah; jam kerja/libur dan perubahan kalender dinilai saat submit, bukan hanya saat form dibuka.
- Tiga jam operasional penuh10:30 melintasi istirahat12:00–13:00 menghasilkan14:30; reminder dua jam biasa menghasilkan12:30.
- Booking jauh hari tidak memblokir slot pagi secara global; asesmen panjang tidak dipotong agar tampak muat.
- Bukti sebelum/tepat/sesudah T-2 tidak menghasilkan reminder ganda atau klaim pembayaran VERIFIED.
- Reminder tetap terkirim dengan label pending verification; uang baru VERIFIED dari pemeriksaan Admin, termasuk saat kedatangan.
- Tidak ada bukti, bukti ditolak, provider WA gagal, Admin belum memeriksa dan transfer terlambat mempunyai hasil berbeda.
- Admin offline boleh same-day/kurang H-2 dengan catatan dan pemberitahuan segera, tetapi tetap tidak overlap.
- Janji eksternal yang ternyata sudah ada tidak dibuat dua kali dan pembayaran lama tidak ditagih ulang.
- Custom paid/included/not-required dibedakan; non-payment bukan otomatis PAID, cash0 atau penghapusan utang.
- Reschedule/cancel setelah reminder mengirim perubahan status terbaru dan tidak memakai jadwal/link lama.

## 8. Pemeriksaan lanjutan: yang belum selesai setelah keputusan tiga jam

Perhitungan tiga jam sudah jelas. Hal berikut tetap perlu dijadikan aturan operasional/kontrak yang eksplisit, bukan diasumsikan selesai oleh perubahan angka saja.

1. **Anchor reservasi.** Rekomendasi: hitung dari reservation_created_at server ketika slot benar-benar ditahan, bukan saat membuka form. Booking05:00 yang sah untuk11:00 tidak dihitung ulang menjadi11:45 hanya karena proof diunggah08:45. Bukti tidak memperpanjang hold; reservasi baru setelah expiry memakai anchor baru. Jangan menggeser anchor dari jam perangkat pengguna.
2. **Cutoff bukti awal.** Syarat pengingat sesudah pembayaran menyiratkan cutoffT-2 untuk jalur normal. Rumus min24jam/T-2 masih rekomendasi penyelarasan, bukan mempertahankan rumus lama min24jam/awal sesi. Deadline pelunasan seluruh tagihan berbeda dari bukti awal. Reservasi yang tidak perlu pembayaran baru tidak harus menampilkan deadline DP fiktif.
3. **Bukti ditolak setelah reminder.** Contoh reminder09:00, bukti ditolak09:15, sesi11:00. Owner perlu menerima pembaruan, pasien jalur koreksi/penanganan Admin, dan status uang tetap belumVERIFIED. Cutoff bukti pertama tidak boleh diartikan bahwa koreksi sah selalu dilarang setelah09:00; batas koreksi perlu ditulis terpisah. Koreksi tidak memberi24jam baru atau membuat reminderH-2 yang sudah lewat seolah terkirim ulang tepat waktu.
4. **Reschedule yang diproses terlambat.** Kelayakan requested_at tetap dilindungi, tetapi target terlalu dekat untuk reminder tidak bisa disahkan hanya dengan memundurkan jam. Contoh target13:00 baru disetujui12:15. Pilih ulang target yang sah atau gunakan penanganan manual berizin dengan pemberitahuan segera; jangan menghukum pasien sebagai no-show otomatis. Kuota baru bertambah ketika apply, pembayaran tidak diulang.
5. **Akibat keuangan expiry.** Arah yang pernah ditetapkan developer adalah sisa tidak ditagih sebelum layanan yang batal/hak berakhir dan uang nyata tetap tercatat. Dokumen22Oktober memuat kewajiban lunas dahulu. Pertentangan tersebut belum diselesaikan pada perubahan waktu ini. Jangan membuat utang penuh hanya karena memilih slot atau memakai aturan unpaid-expiry untuk menghapus kewajiban layanan yang benar-benar sudah diberikan.
6. **Kustom tidak ditagih versus belum dibayar.** Admin boleh fleksibel mencatat, tetapi paid/included/not-required harus mempunyai makna berbeda. Perubahan setelah invoice/penerimaan memerlukan jejak koreksi; agenda kustom tetap berdurasi dan mengambil slot. Konten klinis tetap di luar catatan administratif Admin.
7. **Dua aksi memperebutkan satu slot.** Booking online dan input offline sama-sama memeriksa interval terkini di bawah transaksi/lock yang sama. Persetujuan owner di luar aplikasi bukan izin menimpa slot yang telah diambil pasien lain. Simpan gagal harus jelas dan tidak menerbitkan tagihan/pesan sukses separuh.
8. **Dokumen dan kode aktif belum diselaraskan.** F06/F09, kalender/cutoff serta beberapa hak akses masih membawa H+1/lead6jam; source preview masih mempunyai guardH+1 dan hold15menit. Analisis ini tidak mengubahnya. Temuan audit sebelumnya juga belum otomatis diperbaiki dengan menetapkan kebutuhan baru.

Sebelum menyatakan kontrak final sinkron, selaraskan satu sumber aturan, enum/payment requirement, perhitungan kalender, deadline, koreksi, reminder, serta kasus exception manual. Klaim keamanan implementasi tetap memerlukan pemeriksaan kode/pengujian sesuai perubahan yang kelak dibuat.

## Batas pekerjaan

Tidak mengubah kode, migration, kontrak aktif atau menjalankan aplikasi/build/test dalam analisis ini. Dokumen ini mencatat arah kebutuhan dan celah yang perlu dirumuskan, bukan klaim preview/backend sudah mengikuti aturan baru. Besaran DP, kebijakan pembatalan, dan batas empat sesi di luar perubahan yang dibahas tidak ditetapkan ulang di sini.

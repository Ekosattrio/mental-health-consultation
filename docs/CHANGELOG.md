# 30 Oktober 2026 - Feedback loading dan transisi CRUD seluruh role

- Tambahkan tracking request aktual dan operasi simpan+refresh yang aman untuk request paralel/failure. Dashboard Superadmin/Admin/Pasien mendapat status memuat, upload, proses simpan, proses lama, refresh manual dan skeleton awal; data lama tetap terlihat selama refresh.
- Transisi tab/tabel tanpa me-remount form; dialog220ms, reduced motion dan label aksesibel. Paket/CMS menunggu simpan aktual dengan loading/disabled, kegagalan mempertahankan form; toast dipindah ke portal di atas modal dengan batas viewport.
- TypeScript/102tes FE lulus. Build akhir1,54detik,43aset/font200 dan Laravel memakai main-D08msmhv.js. Tidak mengubah backend/DB/bisnis/permission, mengelola Laragon, menjalankan Git/dev server baru. UAT visual/FPS/Lighthouse baru belum diklaim. [Detail](DASHBOARD_FEEDBACK_2026-10-30.md).

# 30 Oktober 2026 - Penyempurnaan gerakan animasi

- Pengguna mengonfirmasi animasi sudah muncul. Perhalus easing/reveal600ms dengan jarak16px, rail560ms/12px/stagger45ms; hentikan fade ulang saat activePage berubah dan lepaskan reveal parent ganda pada kartu katalog/ulasan.
- Kurangi jarak hover dan tekanan tombol; letakkan active setelah hover agar feedback desktop tidak tertimpa. Native scroll/snap dan reduced motion tetap dipakai, tanpa dependensi/loop baru.
- TypeScript/99tes FE lulus, build berhasil1,80detik; HTML memuat main-fd6nyBvm.js,41aset/font200. Graph awal JS/CSS603.200byte; belum ada FPS/Lighthouse baru. Tidak mengendalikan Laragon/Git/dev server. [Bukti](PERFORMANCE_2026-10-30.md).

# 30 Oktober 2026 - Diagnosis pengurangan gerakan browser

- Pengguna mengonfirmasi prefers-reduced-motion:reduce bernilai true. Helper/CSS/scroll memang menonaktifkan animasi pada kondisi ini; sumber Windows atau emulasi DevTools belum dibedakan.
- Catat cara pengujian no-preference dan pengaturan animasi Windows. Tidak mengubah source/build atau memaksa preferensi semua pengguna; hasil visual menunggu browser pengguna karena otomasi tidak tersambung.

# 30 Oktober 2026 - Build dan pengalihan aset produksi lokal

- Setelah instruksi eksplisit terbaru Eko, jalankan npm run build: berhasil8,92detik/exit0. Cadangkan public/hot ke storage/app/vite-hot-before-production-20261030.txt agar Laravel benar-benar memakai build, tanpa mematikan server existing/Laragon.
- HTML produksi tanpa Vite client,41aset manifest200, font lokal200/font/woff2, login/up200. Graph awal JS/CSS603.074byte (gzip estimasi lokal172.624byte); bukan pengukuran Lighthouse atau transfer gzip aktual. Peringatan URL font runtime diperiksa dan tidak terjadi404.
- Dokumentasikan mode aktif/pemulihan HMR dan perubahan izin. Browser automation belum terhubung; tidak mengklaim skor/animasi visual baru. [Bukti](PERFORMANCE_2026-10-30.md).

# 30 Oktober 2026 - Koreksi pemicu animasi dan audit Lighthouse55

- Reveal katalog/ulasan/pemilih layanan menunggu kartu terlihat, lalu muncul bergiliran; reveal bagian bawah beranda diperjelas, hero tetap langsung terlihat dan reduced motion dihormati. Header tidak lagi menganimasikan tinggi/blur saat scroll, tombol/kartu memakai transform, dan login pada shell dimuat saat dibuka.
- Catat hasil Lighthouse pengguna: FCP5,4s/LCP11s/TBT20ms/CLS0,001, payload10.907KiB dan potensi minifikasi8.306KiB. Hambatan dominan yang perlu dibuktikan berikutnya adalah pengiriman aset produksi; tidak mengklaim skor baru berdasarkan perubahan source.
- TypeScript dan99tes FE lulus. [Rincian dan batas](PERFORMANCE_2026-10-30.md). Pengguna memilih opsi2: source saja, tanpa build/pengalihan public/hot; layanan Laragon/Git tidak disentuh.

# 30 Oktober 2026 - Animasi ringan dan optimasi pemuatan

- Tambahkan feedback klik/hover, transisi slide180ms dan reveal bagian bawah beranda sekali280ms dengan reduced motion/cleanup; hero tetap terlihat. Pemilih layanan pasien memakai slide halaman penuh dengan notes/pilihan tetap aman, pencarian/harga/kategori di-memo dan tanpa blok catatan kosong berulang. Footer menampilkan rentang jam ringkas.
- Pisahkan AppContextCore/AppContent/default CMS dari provider/data demo di jalur server. Eager-load versi katalog efektif dan ambil jam mingguan sekali. Bukti lokal: query beranda29ke9, graph impor dev71ke44modul; versi masa depan tetap tersembunyi. Font27KB lokal/OFL mengganti stylesheet eksternal, hero eager dan gambar bawah lazy/async.
- TypeScript,98tes FE dan52tes backend/429assertion lulus; HTTP halaman/modul/font200. [Bukti rinci](PERFORMANCE_2026-10-30.md). Tidak menjalankan dev/build/Git atau mengelola MySQL/Apache. Skor Lighthouse produksi dan UAT visual belum diklaim.

# 30 Oktober 2026 - Perbaikan libur, role, carousel dan kontak

- Perbaiki validasi kalender agar intervals=[] untuk libur mingguan/tanggal CLOSED dapat dipreview/apply; field hilang dan OPEN tanpa jam tetap ditolak. Semua hari tutup tampil sebagai praktik sedang libur. Uji HTTP membuktikan slot tanggal libur kosong dan hari buka tetap tersedia.
- Katalog/ulasan memakai halaman penuh berisi1/2/3kartu sesuai lebar area, snap per halaman, rentang item/total/halaman, halaman terakhir dan penyesuaian resize. Tidak ada peek kartu pada posisi berhenti; notes dipertahankan dan ulasan kosong tidak mengarang rating.
- Batasi Admin ke booking/pembayaran, reschedule, monitoring dan moderasi. Hapus lima tab tambahan, sanitasi tab lama dan tutup endpoint/service pengelolaan owner; draft CMS tidak dikirim ke Admin. Sesuaikan tes fixture ke aktor owner yang sah tanpa mengubah kasir Admin atau guard H+1/DP.
- Hilangkan placeholder kontak/Instagram demo. Sambungkan jam footer publik ke kalender/CMS, kontak workspace ke identitas terkini, preview ke draft, dan verifikasi publikasi kontak sampai halaman publik. Database praktik memang belum memiliki alamat/telepon/WhatsApp/email; tidak diisi dengan data rekaan.
- TypeScript0error,97tes frontend dan51tes domain lulus. Perubahan kontak/libur akhir diverifikasi lagi melalui tes terfokus. HTTP halaman/modul200, parser12PHP lulus. Pengujian MySQL memakai database acak terpisah; tidak mereset data praktik, menjalankan Git/dev/build atau mengelola MySQL/Apache. UAT visual/gesture masih terbuka.

# 30 Oktober 2026 - Pengelolaan MySQL melalui Laragon

- Periksa login superadmin melalui HTTP/session nyata: kredensial existing diterima, redirect/superadmin/dashboard dan/work/data200, komponen Eko/Workspace. Sesi uji dilogout terpisah dari browser pengguna. Error pengguna menunjuk alamat modul IPv6 lama setelah Vite beralih ke127.0.0.1; modul dashboard di alamat aktif200. Tambahkan resolver halaman dengan layar pemulihan/tombol muat ulang ketika dynamic import gagal, tanpa POST login ulang atau reload otomatis. TypeScript dan93tes lulus, termasuk regresi kegagalan impor. Tab yang sudah memakai alamat lama perlu satu hard refresh; pesan React DevTools hanya informasi.

- Diagnosis halaman putih/loading: Laravel dan MySQL Laragon aktif, HTML200 sekitar0,5detik, tetapi permintaan aset Vite sempat timeout meski ready. Tetapkan host Vite127.0.0.1, port5173 dan strictPort agar loopback konsisten dengan artisan serve. Vite existing memuat ulang konfigurasi; public/hot dan script HTML kini memakai127.0.0.1:5173.67modul statis frontend berhasil diambil tanpa HTTP error/timeout; TypeScript lulus. Tidak menjalankan dev server/build baru, mengubah .env/database, atau menyalakan/mematikan MySQL/Apache. Pemeriksaan HTTP tidak menggantikan verifikasi tampilan browser.

- Periksa listener3306, executable dan parent proses: MySQL aktif berasal dari Laragon; proses yang dinyalakan manual29Oktober sudah tidak ada. Tidak ditemukan auto-start MySQL pada script project, Windows Run atau scheduled task terkait. Tegaskan larangan agent memulai/menghentikan layanan atau mengganti port tanpa instruksi eksplisit dan perbarui panduan setup. Tidak menyalakan/menghentikan proses, mengubah port/.env atau menulis database. Verifikasi read-only, tanpa tes aplikasi/dev/build/Git.

# 29 Oktober 2026 - Integrasi FE Eko sebagai tampilan utama

- Koreksi lanjutan berdasarkan screenshot pengguna: rail grid sebelumnya masih menekan15kartu hingga teks turun per huruf. Ganti track menjadi flex nowrap dengan kartu22rem yang tidak menyusut, maksimum selebar area pada HP dan scroll horizontal native. Kontrol panah/rentang dipindah ke atas kartu. Berlaku pada katalog dan ulasan melalui CardRail bersama. CSS/modul yang disajikan Vite diverifikasi HTTP200 dan sudah memakai flex/no-shrink tanpa grid-auto-columns; TypeScript dan92tes kembali lulus. Pemeriksaan visual browser belum tersedia dan tidak digantikan oleh checker.

- Katalog landing tidak lagi menampilkan seluruh layanan dalam grid panjang: gunakan CardRail satu baris dengan swipe, trackpad, panah, keyboard dan penunjuk rentang kartu. Tambahkan pencarian nama/deskripsi/catatan serta filter kategori bergeser. Kartu lebih ringkas, catatan tetap terlihat, tarif tamu tetap tersembunyi dan CTA memakai alur booking semula. Ulasan memakai rail yang sama; autoplay mengikuti CMS, dapat dijeda, berhenti saat hover/fokus/tab tersembunyi/di luar layar, dan menghormati reduced motion. Panduan publik menjadi accordion satu judul terbuka tanpa mengubah progres baca. TypeScript dan92tes lulus; smoke render katalog15layanan/tamu/pasien/kosong/panduan lulus dan seluruh modul terkait dari Vite existing HTTP200. Belum mengklaim UAT visual perangkat.

- Koreksi tampilan mobile: dropdown akun dipatok ke batas navbar pada layar kecil, bukan ke tombol akun. Nama/email panjang membungkus, menu memiliki batas tinggi dinamis dan dapat digulir, serta menu akun/navigasi tidak terbuka bersamaan. Dialog lintas role dibatasi tinggi layar dengan safe area; toolbar cetak/ekspor dapat turun baris dan teks notifikasi panjang membungkus. Ukuran maksimum dialog desktop dan aturan cetak dipertahankan. TypeScript dan 92 tes regresi lulus; UAT visual perangkat masih perlu dilakukan karena koneksi otomasi browser tidak tersedia. Tidak mengubah aturan bisnis, database atau Git; dev server/build tidak dijalankan.

- Pemulihan runtime SQLSTATE2002: MySQL yang tidak aktif dinyalakan kembali memakai data/config existing. Koneksi Laravel dan endpoint halaman/API/Vite diverifikasi; tidak mengubah source bisnis atau mereset database. Panduan setup menjelaskan MySQL harus aktif sebelum PHP/Vite.

- Route dashboard menggunakan komponen dashboard/tab FE Eko; navbar/footer/login disamakan pada halaman server.
- ServerAppProvider, adapter DTO dan pilihan slot server menyambungkan aksi FE ke Laravel tanpa mutasi mock.
- DP Rp100.000, H+1 seluruh role, sesi lanjutan/reschedule tanpa DP baru, lifecycle Psikolog dan cancel setelah lunas; tidak ada auto-confirm SLA/auto-cancel no-show.
- Versi paket menyimpan notes/badge/metadata diskon/fasilitas. Quote booking lama dipertahankan; form paket lama ditolak.
- Ledger/laporan memakai kas server tanpa duplikasi per sesi; retry upload mempertahankan ID bukti dan penerimaan nyata berulang tetap dapat dicatat.
- Akun/profil disimpan atomik, tipe jawaban pre-test divalidasi, serta input/form dipertahankan pada kegagalan.
- Migrasi DP/presentation diterapkan tanpa reset akun/transaksi. TypeScript,92tes FE dan49tes backend/359assertion lulus.
- [Keputusan aktif](KEPUTUSAN_AKTIF_2026-10-29.md), [peta integrasi](INTEGRASI_FE_EKO_2026-10-29.md), [handoff](SESSION_HANDOFF.md), [TODO](TODO.md). Dev server/build/Git tidak dijalankan.

## Histori sebelum 29 Oktober

Ketentuan lama yang berbeda dari keputusan Eko29Oktober tidak menjadi aturan aktif.

# Migrasi Inertia disetujui — 20 Oktober 2026

## Pelunasan Sesi Terakhir - 22 Oktober 2026
- Izinkan cicilan sebelum sesi dan penuh di awal; DP tetap Rp100.000 sekali dan mengurangi biaya, pelunasan wajib paling lambat hari sesi terakhir.
- Tambahkan snapshot agreement psikoterapi baru dan ledger/alokasi FIFO rangkaian, tanpa duplikasi receipt/kas pada sesi lanjutan atau perubahan tagihan historis.
- Tambahkan pilihan pembayaran awal, ringkasan terbayar/prabayar/sisa/jatuh tempo, status menunggu pelunasan dan guard booking ulang belum lunas; pertahankan fakta sesi selesai, aturan cancel lunas atas invoice terbentuk, H+1, dan tanpa sesi5.
- Batasi reject bukti pada Admin di helper/facade; payment mutation psikolog tetap ditolak. Tambahkan regresi pembayaran baru, isolasi data/role, overpayment, due WIB/reschedule dan transaksi paralel/gagal simpan.
- Dokumentasikan [alur pembayaran](ALUR_PEMBAYARAN_SESI.md), keputusan/aturan bisnis/F08/F11, TODO dan batas backend. Catatan docs-only sebelum ini tetap sebagai histori, bukan status source terbaru.
- Verifikasi: TypeScript lolos, 87/87 tes (84 FE +3integrasi sumber); tidak menjalankan Git/dev/build/browser/database.

## Perbaikan TODO Audit FE - 22 Oktober 2026
Penegasan pre-test: developer memilih konfirmasi/perbarui per booking/sesi baru karena konteks Konseling ulang dapat berubah. Dokumentasikan salinan yang memerlukan konfirmasi pasien, snapshot per appointment, histori tetap dan reschedule tanpa pre-test ulang otomatis pada keputusan final/F07/aturan bisnis/TODO/handoff. Ini pencatatan keputusan saja; source dan tes tidak diubah.

Penegasan bisnis sesudah audit: pembayaran pasien khusus Admin untuk pemeriksaan/verifikasi/penolakan bukti dan pencatatan/koreksi penerimaan. Perbarui keputusan final, permission, aktor Superadmin, F08, aturan bisnis, kontrak web dan handoff. Psikolog tetap membaca ledger/laporan; larangan input/verifikasi bukan celah. Guard reject FE yang masih menerima psikolog masuk TODO. Ini perubahan dokumentasi saja, tanpa source, tes ulang, Git/dev/build.

- Perbaiki AUD-02 sampai AUD-06 pada preview lokal tanpa mengubah scaffold/backend atau guard preview produksi.
- Tambah input nominal aktual, guard minimum DP, ledger DP kurang/top-up, penerimaan tambahan setelah PAID dan idempotency per operasi; pertahankan kas legacy dan status layanan terminal.
- Pisahkan asal reschedule dari pelaksana; tambahkan SLOT_SELECTION_REQUIRED, revision request, requestedAt asal, aksi pemilihan ulang dan approval target terbaru dengan guard slot/versi. Tutup request pemilihan ulang saat layanan dibatalkan setelah lunas.
- Satukan resolver tanggal untuk availability/ringkasan/conflict guard; override dapat membuka libur dengan alasan. Selaraskan angka waktu operasional pada ringkasan.
- Perbaiki kwitansi agar memakai penerimaan awal aktual dan menamai tagihan psikoterapi PER_SESSION sebagai sesi terkait, bukan membagi tarif satu sesi menjadi empat.
- Perbarui TODO, aturan bisnis, keputusan, known issues dan handoff; tambah [catatan perbaikan FE](PERBAIKAN_AUDIT_FE_2026_10_22.md). AUD-01 serta integrasi backend/window/SLA tetap terbuka.
- npm run lint lolos; npm test74/74 (71 FE +3integrasi sumber), bertambah16tes dari baseline58. Tidak menjalankan dev/build/Git, pengujian browser atau database.

## Kelanjutan FE dan Kesiapan Merge - 22 Oktober 2026
- Implementasikan billing per sesi untuk psikoterapi baru, DP awal100.000, DP lanjutan0, receipt/report per sesi serta guard batal seluruh invoice lunas. Legacy dipertahankan.
- Lengkapi request pasien dan review Admin, kuota3 APPLIED/H-2/+4hari WIB, histori asal perubahan, guard versi dan slot. Slot lama tidak dilepas sebelum apply.
- Lengkapi reject/koreksi proof beralasan dan berversi, guard waktu/ownership/format10MiB, histori bukti asal dan perlindungan uang VERIFIED.
- Tambahkan menu Admin yang disepakati, navigasi bersama desktop/mobile dan CMS administratif allowlist; detail saldo tidak ditampilkan di paket Admin.
- Tambahkan runner tes terkunci tsx dan npm test, tes workflow tambahan serta merge-readiness untuk marker/import-case/lockfile. Larangan Git/dev/build tetap dipatuhi.
- Pemeriksaan akhir: TypeScript0error; npm test58/58 (55FE +3integrasi). Daftar konflik lokasi:50file aktif +13dokumen diarsipkan,0hilang. Tidak ada marker konflik isi.
- Panduan staging/commit/push integrasi dan merge main tanpa force tersedia di PANDUAN_MERGE_INTEGRASI.md. Backend domain tetap TODO, bukan blocker yang disamarkan sebagai selesai.


## 22 Oktober 2026 - Penyelarasan Integrasi
- Pertahankan DP flat Rp100.000 di FE; tambah regresi variasi tarif, booking900.000, dan cancel setelah lunas. DP 50% bukan keputusan yang diterima.
- Selaraskan aturan aktif H+1 seluruh role, tanpa extend, booking kembali setelah empat sesi, cancel/discontinue seluruh sisa layanan setelah lunas. Hak Admin dan scope Desman lain diterima sebagai kontrak target.
- Gabungkan isi konflik source/env/README/log tanpa Git; arsipkan13dokumen lama agar tidak ada dua sumber aturan aktif. Perbaiki import tes setelah perpindahan src ke resources/js.
- Pasang dependency locked tanpa lifecycle script; typecheck lolos dan tes regresi FE40/40 lolos (36 lama +4 DP/pembatalan). Dev/build/browser/database tidak dijalankan. Backend domain dan migrasi kontrak preview masih pekerjaan terpisah.

Entri lebih lama di bawah dipertahankan sebagai histori dan tunduk pada [keputusan final](KEPUTUSAN_FINAL_2026_10_22.md).


- Ubah fondasi web menjadi Laravel13/Inertia3/React19 satu proyek/domain setelah persetujuan developer. Tambah adapter PHP/React dan lockfile; lepas Sanctum serta route API placeholder.
- Tambah halaman/controller Home, login/logout sesi, workspace ber-role, middleware, layout, page resolver, props minimal, Blade Inertia3, konfigurasi history dan SSR/devtools disabled.
- Adaptasi landing Eko menjadi view presentasional; selaraskan FAQ/placeholder publik, tanpa harga/review palsu. Prototype lengkap tetap preview lokal terisolasi; client HTTP lama pindah legacy/api.
- Tetapkan WEB_CONTRACT aktif, arsipkan kontrak REST dan jadikan API.md pointer. Selaraskan panduan, fitur, checklist dan indeks; tulis [MD konteks perubahan untuk Eko](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md).
- Validasi metadata dependency/platform, syntax34PHP, typecheck TypeScript,10route, struktur70dokumen/link/import/nama page serta pemindahan76source asal. Tanpa Git/browser/test suite/dev server/build/migration/seed; seluruh domain bisnis belum otomatis selesai.

---

## Arsip sebelum persetujuan migrasi Inertia

Bagian berikut mempertahankan keadaan/keputusan pada saat dicatat. Rujukan transport dan status setup terdahulu digantikan bagian terbaru di atas; keputusan bisnis tetap mengikuti kontrak aktif.

# Penataan proyek dan setup — 20 Oktober 2026
- Pusatkan Markdown proyek ke docs selain README root; pindahkan dokumen aktif dari Psikolog/Live Docs, rapikan subfolder satu tingkat dan tautan Markdown/Obsidian, arsipkan metadata/readme lama, salin sumber ide sebagai referensi portabel. AGENTS dipusatkan ke docs/AGENTS.md.
- Inisialisasi Laravel13.37.0/Sanctum4.3.3; pindahkan76filefrontend ke resources, Blade/Vite8.3.4 dan React19.3.0 satu domain. Tambah APIprefix/statefulApi, UUIDv4/password_hash/enum akun, private disk, env lokal/key dan lockfile; rapikan dependency/transport cookie-CSRF.
- Perbarui README/setup/panduan/arsitektur/status kerja. Validasi struktur/link/import, hash source, Composer/platform/npm, syntax25PHP dan bootstrap/route sukses. Tanpa Git/migrate/seed/test/dev/build; seluruh domain bisnis belum diimplementasikan.

---
# Perubahan dokumentasi — 19 Oktober 2026
- Audit ulang I25–I27: developer menetapkan profiling offline kertas langsung ke Superadmin; Admin hanya administrasi/pembayaran. Tambah DIGITAL/PAPER, selaraskan role/journey/API/schema/fitur/panduan. Koreksi nama field kalender/notifikasi/no-show, cutoff/template penutupan; lengkapi endpoint revisi/revoke/withdraw dan UNIQUE(supersedes_id). Inspeksi docs:61Markdown,20fitur lengkap, link dalam docs valid,46tabel tanpa judul/kolom ganda/targetFK tak terdefinisi. Tanpa pemeriksaan aplikasi.
- Developer memilih B: booking Psikoterapi pertama langsung, otomatis rangkaian administratif4unit + satu appointment/tagihan sesi1 atomik. Selaraskan F11/F06, journey/aktor, role, aturan, API/schema, guide/checklist/backend spec; tambah unique active_plan_guard, retry/rollback dan guard rangkaian lanjutan. I24 ditutup. Scope tetap docs saja.
- Penelusuran lanjutan audit integrasi: pelepasan unit terapi dari hold tanpa uang/layanan, koreksi uang aktual0, FK naskah consent dan pemeriksaan duplikasi manual serta urutan pertemuan asesmen diperjelas (I19–I23). I24 pengawalan Psikoterapi ditandai menunggu pilihan, setelah developer meminta studi kasus. Catat hasil inspeksi teks dan jangan mengklaim seluruh keputusan sudah final.
- Audit integrasi tambahan: koreksi I01–I18 lintas versi/field, pembayaran case, reschedule, consent, duplikasi/lock, progres, review, export dan endpoint. Konfirmasi pembatalan: sisa tidak ditagih sebelum layanan; CLOSED_UNSERVED/adjustment tanpa mengubah uang aktual. Tambah docs/README, EKO_PROJECT_GUIDE dan AUDIT_INTEGRASI_DOKUMEN_2026-10-19; perbarui aturan/schema/API/fitur dan log. Scope docs, bukan hasil test runtime.
- Pembaruan terakhir: penanganan lebih bayar di luar sistem, hapus kolom/status resolusi target. Tambah F20 Google Meet/WA: Admin isi link pada booking -> kirim Baileys otomatis, revisi/attempt/kontak, penerima tanpa akun, antrean/retry, kehadiran online manual. Perbarui katalog, aktor/journey, role, API, schema dan isu aktif; tanpa perubahan/test aplikasi.
- Koreksi lanjutan: dasar tarif additional time saat promo menjadi pilihan NORMAL_PRICE/FINAL_PRICE pada versi paket, dikelola Admin/Superadmin. Perbarui field, permission, API preview, snapshot, validasi dan status isu; jelaskan kelebihan bayar nyata versus salah input/klik ganda. Scope tetap docs saja.
- Aturan dan kontrak diselaraskan dengan12koreksi developer; batas harga/diskon/total Admin dan larangan saldo diterapkan.
- Lengkapi F01–F19, actor/journey, API roleDTO, kamusdata perkolom/constraint/index/locking.
- Tambah F18 asesmen dan F19 expense; expense/surplusowner dan exportjadwalAdmin dimasukkan.
- Perbarui proma/diskon, kedatangan/penagihanoffline, koreksibukti, requested_at, recoveryNO_SHOW, additionaltimeagregatKonseling, invoiceaddendum, clinicchange dan7hariakses/1tahunretensi.
- Contoh legacy API/schema diganti pointerkanonik; sumberlaranganhargaAdmin ditelusuri.
- Tambah AUDIT_PENYELARASAN_ATURAN_2026-10-19; basis tarifpromo semula terbuka lalu ditutup melalui fitur konfigurasi, penggunaan lebihbayar tetap terbuka.
- Hanya filedocs diperbarui; aplikasi,Git,test/build tidak dijalankan.

---
# Arsip changelog sebelumnya

# Changelog

## 2026-10-22 - Perbaikan Audit Simulasi dan CMS

- Menghubungkan simpan profil navbar dengan validasi/ownership/allowlist dan persist-before-success; email SSO read-only. Menambah menu Profil Praktik desktop/mobile dan guard submit saat menyimpan kredensial. Navbar membaca kredensial/telepon aktual, bukan fallback identitas palsu.
- Memperbaiki label Admin Operasional, tooltip panjang yang melewati viewport, dan pilihan slot admin agar tidak diam-diam berpindah ke jam pertama.
- Menambahkan guard versi reschedule lintas aktor beserta kontrak `expected_version`; form lama wajib ditutup dan memilih ulang setelah jadwal berubah. Mempertahankan guard H+1, role, durasi, kuota, dan ledger.
- Mengabaikan hold expired untuk pemulihan/guard reservasi baru tanpa menghapus record atau bukti; tetap mendukung rekonsiliasi bukti dari tab lama. Panel lanjutkan/lepaskan tidak dikembalikan.
- Menampilkan timeline seluruh reschedule pada detail dan receipt pasien.
- Menyambungkan CMS ke footer/kontak/Instagram, judul/autoplay/interval carousel, gambar hero/tentang, banner/tip/pengumuman pasien, rekening DP, gambar QRIS kasir, dan logo kop laporan. Menambah field editor yang dibutuhkan dan mengganti placeholder klaim enkripsi lama dengan informasi netral.
- CMS dan profil praktik ditulis sebelum state/toast sukses; CMS menerima pembaruan lintas-tab. Hold baru menyimpan snapshot bank/pemilik rekening. Kontrak baca CMS publik dipisahkan dari konfigurasi lengkap owner; response hold menyiapkan instruksi penerima.
- Membuat `CMS_AUDIT.md`; memperbarui panduan role, TODO, isu, handoff, serta kontrak API/data. FAQ/legal/SEO/branding penuh belum menjadi editor CMS.
- Verifikasi: TypeScript exit 0 dan 36/36 tes regresi terfokus; tambahan tes expiry/rekonsiliasi, reschedule paralel/versi, profil, storage CMS gagal, validasi, render footer/banner/timeline, dan posisi tooltip. Tidak menjalankan browser/dev/build/Git.

## 2026-10-22 - Panduan Fitur per Role

- Membuat `PANDUAN_FITUR_PER_ROLE.md` dari pembacaan source: arti ikon aksi psikolog, pembatalan setelah lunas, reschedule/sesi berikutnya, daftar menu/fitur guest-pasien-admin-psikolog, fungsi, cara kerja, serta batas implementasi.
- Membedakan implementasi mock, simulasi/placeholder, kontrak backend, CSV ringkasan vs backup penuh, `.xls` HTML vs workbook `.xlsx`, dan audit ringkas vs timeline lengkap.
- Mencatat temuan profil navbar, label admin, entry point profil psikolog, tooltip, penggantian jam admin, dan hold expired pada KNOWN_ISSUES/TODO. Tidak memperbaiki source aplikasi pada sesi ini.
- Menautkan panduan ke indeks vault dan README dokumentasi. Verifikasi hanya kelengkapan dokumen/link lokal; tidak menjalankan Git/dev/build/test/checker aplikasi baru.

## 2026-10-22 - Hapus Panel Reservasi Pasien

- Menghapus banner Reservasi sebelumnya dan kedua aksi lanjutkan/lepaskan dari seluruh tab dashboard pasien, beserta facade pelepasan manual yang tidak lagi dipakai.
- Menyesuaikan pesan guard agar tidak menyebut tombol yang dihapus. Penguncian slot internal, alur booking, data/bukti pembayaran, serta banner pencocokan pembayaran tetap dipertahankan.
- Verifikasi: TypeScript exit 0, 25/25 tes regresi lolos, dan tidak ada lagi referensi panel/tombol atau `releaseBookingHold` di source. Belum QA browser; dev/build/Git tidak dijalankan.

## 2026-10-22 - Pemadatan Formulir Pre-Test

- Mengurangi padding dan jarak langkah 2 booking, mengecilkan heading, serta merapikan empat field pekerjaan/kontak darurat dalam grid responsif.
- Mengganti tombol pill keluhan dengan checkbox multi-select berarea tekan minimal 44 px. Daftar pilihan dan handler pemilihan tetap sama; label field dihubungkan dengan kontrolnya.
- Menempatkan deskripsi/harapan berdampingan pada layar memadai, memendekkan textarea awal, dan merapatkan slider stres, kualitas tidur, serta footer tanpa menghapus data/validasi.
- Membuat indikator langkah lebih ringkas pada ponsel dan tombol kembali memakai ikon ber-tooltip; label tombol lanjut dipersingkat menjadi Konfirmasi Booking, tetap menuju langkah 3, bukan langsung mengirim booking.
- Tidak mengubah harga, DP, pre-test payload, persistensi, atau reservasi slot. QA visual/interaksi browser belum dijalankan.
- Verifikasi setelah perubahan: `npx tsc --noEmit` exit 0 dan suite regresi terfokus 25/25 lolos. Suite belum menguji interaksi form pre-test; dev/build/Git tidak dijalankan.

## 2026-10-22 - Perapian Pilih Layanan

- Mengubah katalog booking menjadi satu baris kartu horizontal dengan scroll-snap, navigasi panah, dan area geser pada ponsel; filter, pencarian, pengurutan, dan pagination tetap tersedia.
- Menambahkan pembeda kategori, hierarki harga/durasi/metode, ringkasan manfaat, serta status layanan terpilih yang lebih jelas. Rincian lengkap memakai dialog dengan fokus dan Escape bawaan browser.
- Notes tampil penuh langsung di setiap kartu; notes kosong memiliki empty state tanpa menambahkan ketentuan biaya baru. Notes ikut dapat dicari.
- Tidak mengubah data paket, harga/diskon, DP, reservasi slot, atau reschedule. State navigasi hanya diperbarui saat posisi batas scroll berubah agar tidak merender ulang semua kartu setiap gerakan.
- TypeScript exit 0; 25/25 tes lolos, termasuk tiga tes render statis katalog. QA visual/interaksi browser belum dilakukan; dev/build/Git tidak dijalankan.

## 2026-10-22 - Konfirmasi Manual dan Jadwal Pengganti

- Menetapkan keputusan developer: keterlambatan dikonfirmasi manual psikolog, reschedule mengikuti hasil konfirmasi, tanpa cancel otomatis atau DP kedua.
- Membuka reschedule `NO_SHOW` hanya untuk psikolog yang menangani, memakai appointment/nomor sesi/rencana yang sama dan mengembalikan status `CONFIRMED`. Alasan, histori status, jadwal, DP, cicilan, saldo, dan audit verifikasi dipertahankan.
- Menambahkan ikon jadwal pengganti pada Riwayat Sesi/Paket Berjalan psikolog dan service kontrak `rescheduleByPsychologist`. Mempertahankan guard H+1, slot/kuota, status terminal, dan kepemilikan di dalam lock workflow.
- Memperjelas modal reschedule sesuai peran serta tidak menonaktifkan tombol kembali hanya karena slot belum dipilih.
- Menyelaraskan dokumentasi flow/API dan sumber activity diagram 12/13; kedua SVG swimlane di-render ulang serta lolos validasi XML.
- TypeScript exit 0; 22/22 tes regresi terfokus lolos. QA browser/backend tetap diperlukan; dev server, build, dan Git tidak dijalankan.

## 2026-10-21 - Perbaikan Tujuh Temuan Audit FE

- Menambahkan error boundary agar kegagalan membaca data saat startup tidak menjadi layar kosong; data rusak tidak diganti diam-diam dengan data demo dan pengguna diingatkan tidak transfer ulang.

- Menambahkan `workflowStore`: satu Web Lock untuk mutasi kritis dan snapshot atomik yang di-upgrade in-place dari array appointment lama. Menghapus commit snapshot/debounce appointment dan sukses prematur dari controller booking/pre-test.
- Mengaktifkan reservasi lokal sebelum rekening ditampilkan, masa berlaku prototype yang dapat dikonfigurasi, pemulihan setelah refresh, pelepasan dengan konfirmasi belum membayar, serta idempotency dari hold terkonversi. Consent diperlukan sebelum instruksi transfer.
- Menyimpan bukti setelah expiry/quote tidak valid sebagai kasus pencocokan, menampilkannya pada pasien/admin, dan menghubungkannya dengan booking pengganti H+1 tanpa menggandakan bukti/uang masuk. Service kontrak backend rekonsiliasi disiapkan.
- Mempertahankan FULL walk-in sebagai pending sebelum verifikasi, menambahkan tanggal penerimaan aktual, guard klik ganda, dan mencegah pembuatan booking kedua jika penyimpanan sudah sukses tetapi verifikasi belum selesai.
- Menambahkan CSRF cookie/header Sanctum, pemilihan jam berbasis identitas, data modal/receipt terbaru berdasarkan ID, dan encoder CSV/HTML dengan penetralan formula serta Blob download.
- Guard perubahan jadwal turut memeriksa hold aktif dan memakai urutan lock yang sama. No-show tetap menunggu keputusan jatah/pengganti; tooltip diperjelas tanpa mengubah aturan klinis.
- Verifikasi setelah izin: `npx tsc --noEmit` 0 error; `npx tsx --test tests/frontend-regressions.test.ts` 17/17 lolos. Tes memakai storage/lock simulasi; bukan E2E atau QA visual. Tidak menjalankan dev/build/Git.

## 2026-10-21 - Verifikasi TypeScript

- Developer memberi izin eksplisit untuk `npx tsc --noEmit`. Pemeriksaan selesai dengan exit code 0, tanpa error; tidak memerlukan perubahan source.
- Memperbarui status verifikasi pada TODO, Known Issues, Decisions, dan Session Handoff. Dev server, build, Git, serta test runtime tidak dijalankan; QA browser/backend tetap diperlukan.

## 2026-10-21 - Katalog dan Konsistensi Pembayaran/Jadwal

- Katalog booking: pencarian, tiga kategori, urutan nama/harga, pagination enam layanan, radio selection, rincian manfaat/notes, dan layout responsif. Data custom tetap dipertahankan.
- Pasien/psikolog: progres terbayar dari total serta sisa berdasarkan pembayaran aktual. Penerimaan langsung lunas dibedakan dari DP pada detail/receipt.
- Walk-in: wajib input nominal awal aktual; DP/FULL divalidasi tanpa mengekspos target pada admin. Pencatatan penerimaan awal dibedakan dari verifikasi.
- Verifikasi DP/pembayaran lanjutan: tanggal uang diterima dapat dicatat terpisah dari timestamp pencatatan; tanggal masa depan ditolak.
- Laporan/PDF/Excel/CSV: setiap penerimaan menjadi baris tersendiri, memakai tanggal uang diterima, bukan tanggal konsultasi. Tanggal lama yang tidak diketahui diberi label estimasi; sesi lanjutan tidak menduplikasi kas.
- Harga paket lintas-tab disinkronkan; expected total yang berbeda ditolak dan consent direset bila total berubah.
- Pengaturan jadwal menolak perubahan libur/jam/kuota yang berdampak pada booking aktif. Save gagal tidak lagi ditampilkan sebagai sukses pada form jadwal.
- Appointment sesi baru memiliki histori status/jadwal sendiri, tanpa audit reschedule dan ledger awal sesi sebelumnya.
- Kontrak `slotHoldService` untuk Laravel disiapkan, belum terhubung runtime. Risiko mutasi paralel mock dan persistensi storage masih terbuka.
- Verifikasi revisi awal berupa tinjauan statis dan validasi dokumen/diagram; TypeScript checker kemudian lolos setelah izin developer (lihat entri di atas). Dev/build/test runtime tidak dijalankan; bukan klaim flow sudah aman produksi.

## 2026-10-21

- Memperjelas teks Paket Berjalan dan notifikasi penjadwalan menjadi "Selesaikan sesi yang terjadwal sebelum menjadwalkan sesi berikutnya." agar tidak disalahartikan sebagai sesi terakhir dalam keseluruhan rencana.
- Cancel/discontinue kini mensyaratkan pembayaran lunas, menghentikan seluruh rencana, membatalkan sisa appointment, dan mempertahankan histori completed serta uang masuk. Admin dapat mencatat pelunasan untuk penghentian sebelum sesi pertama dengan purpose khusus; hak cancel tetap psikolog.
- Memperbaiki konfirmasi ulang reschedule `PENDING + DP_PAID/PAID` tanpa DP kedua, menyimpan daftar histori reschedule/status, dan mempertahankan audit verifikasi awal.
- Menyimpan snapshot pre-test/consent versi aktif pada booking, mengikat draft setelah booking berhasil, dan menampilkan pilihan histori pre-test di detail pasien. Pengisian baru tidak mengubah booking lama; field klinis yang tidak ditanyakan tidak diisi negatif palsu.
- Menghapus isian contoh kontak darurat/keluhan/harapan tersembunyi dari pre-test baru, menampilkan field kontak darurat terstruktur, dan membatasi ringkasan psikolog ke form yang sudah terikat booking. DP yang mencakup seluruh tarif setelah diskon langsung menjadi lunas saat verifikasi.
- Menunda persistensi pasien walk-in sampai booking berhasil, menyelaraskan H+1 ke WIB, serta membebaskan cache slot yang appointment-nya telah dipindah/dibatalkan.
- Memperketat kontrak API dengan DTO admin administratif, binding draft/multipart booking, consent version, serta endpoint konfirmasi ulang. Fitur permintaan unggah ulang bukti tidak ditambahkan sesuai keputusan developer.
- Memperbarui aturan bisnis, spesifikasi API/database, TODO, daftar isu, handoff, dan sumber/gambar activity diagram. Verifikasi kode berupa peninjauan statis; test/checker/build/dev server tidak dijalankan.

## 2026-10-19

- Mengganti 23 tautan Obsidian mentah pada `FEATURE_FLOWS.md` dengan gambar SVG inline memakai sintaks Markdown standar, sehingga activity diagram tampil langsung di pratinjau VS Code maupun Obsidian.
- Revisi keputusan klien: psikoterapi kini Rp500.000 per sesi dengan rencana awal empat sesi. Sesudah sesi keempat, pasien booking baru; tidak ada penambahan jatah pada plan lama. Tarif katalog/editor, rincian booking, dan CTA booking ulang disesuaikan.
- Menghapus aksi dan kontrak endpoint penambahan sesi dari frontend serta spesifikasi backend. Migrasi LocalStorage v9 memperbarui tarif resmi per sesi sambil menjaga status aktif dan diskon. Data demo yang pernah diperpanjang memerlukan penanganan manual jika ingin dipakai ulang.
- Memperbarui activity diagram psikoterapi menjadi alur swimlane pasien/sistem/admin/psikolog, lalu merender 23 diagram PlantUML menjadi SVG yang langsung terlihat di Obsidian.
- Catatan berikut adalah histori implementasi sebelum revisi klien di atas, bukan spesifikasi aktif.
- Menambahkan aksi **Tambah Sesi** khusus psikolog pada Paket Berjalan. Alasan dan kesepakatan pasien dicatat, jatah sesi serta tagihan diperbarui menurut tarif snapshot awal, dan paket selesai dapat diaktifkan kembali tanpa membuat DP kedua.
- Mendukung pembayaran bertahap setelah DP: setiap uang masuk disimpan sebagai record terpisah, status lunas hanya saat saldo nol, dan admin tetap tidak melihat tarif maupun nominal yang pernah dicatat.
- Menampilkan tambahan sesi dan saldo terkini pada tabel psikolog serta detail/receipt pasien. Sesi lanjutan tetap dijadwalkan psikolog satu per satu minimal H+1.
- Menambahkan kontrak endpoint penambahan sesi dan rancangan amendment/payment ledger Laravel, serta mencatat keputusan klien tentang tiga kategori paket, telelayanan pihak ketiga, notes layanan, dan DP yang mengurangi total.
- Mengganti 23 flowchart Mermaid pada dokumen audit dengan tautan ke 24 UML activity diagram PlantUML berswimlane di `ACTIVITY_DIAGRAMS.md`.
- Verifikasi sesi ini berupa audit statis source dan dokumen; dev server, build, test, dan TypeScript checker tidak dijalankan sesuai `AGENTS.md`.
- Menghapus nomor referensi transaksi dari seluruh alur aktif pasien/admin, type appointment, payload service API, receipt, modal verifikasi, dan spesifikasi database/backend. Nomor invoice/booking tetap menjadi identitas transaksi.
- Menambahkan migrasi LocalStorage v8 untuk membersihkan `paymentReference` dan `finalPaymentReference` lama dari appointment browser.
- Memperbaiki tampilan mobile: toast kini masuk alur halaman pada ponsel sehingga tidak menutupi kartu dashboard, dropdown profil dibatasi sesuai viewport, dan padding dashboard dipadatkan.
- Menambahkan tampilan mobile khusus pada Manajemen Paket, Data Pasien, Jadwal Mingguan, Monitoring User, Moderasi Review, dan Transaksi serta menumpuk tombol footer modal/receipt secara vertikal agar tidak terpotong.
- Membatasi area QA mobile yang masih khusus ke workspace pratinjau/ekspor dokumen karena format kertas dan hasil cetak memang mempertahankan kanvas tabel.
- Mencatat tiga keputusan klien yang belum final: fitur prorata kelebihan waktu, scope asesmen dalam web, dan skema pembayaran psikoterapi minimal 4 sesi.
- Memindahkan ownership CRUD paket dari controller/endpoint admin ke psikolog serta menyelaraskan route mock ke `/api/v1/packages`; guard role psikolog tetap diterapkan di AppContext dan wajib ditegakkan Laravel Policy.
- Mengoreksi wording Monitoring Pengguna admin agar tidak lagi menyiratkan kewenangan verifikasi kredensial atau mutasi akun.
- Menghapus checkbox dan kalimat pernyataan "Saya sudah memeriksa..." dari modal verifikasi pembayaran; admin sekarang langsung memeriksa preview, mengisi catatan opsional, lalu menekan aksi verifikasi.
- Memastikan bukti JPG/PNG/WEBP hasil upload pasien tampil sebagai gambar pada modal admin, baik dari data URL prototype maupun URL storage backend, sedangkan PDF tersedia melalui tombol buka. Data legacy yang hanya menyimpan nama file tetap tidak dapat dipreview.
- Menambahkan kembali paket resmi Konsultasi Telelayanan 60 menit seharga Rp750.000 berdasarkan data katalog terbaru developer, tanpa menambahkan ruang chat web.
- Menambahkan tipe paket `ONLINE_TELE`, pilihan metode konsultasi pada CRUD paket psikolog, lokasi booking kondisional, dan label riwayat telelayanan.
- Menormalkan Paket Psikoterapi Intensif menjadi paket berjalan 4 sesi dengan total Rp2.000.000 (Rp500.000 per sesi).
- Menambahkan migrasi LocalStorage v7 agar katalog browser lama tersinkron dengan 15 paket resmi terbaru, termasuk telelayanan dan metadata psikoterapi multi-sesi, sambil mempertahankan status aktif, diskon, serta paket custom.
- Memperjelas data dummy asesmen anak/remaja dan dewasa sesuai cakupan layanan yang diberikan developer.
- Mengoreksi aturan pembayaran berdasarkan penegasan developer: DP kembali dikunci flat Rp100.000 untuk semua paket berbayar dan tidak dapat diedit dari Manajemen Paket.
- Menghapus `dpAmount/dp_amount` dari kontrak paket frontend; appointment tetap menyimpan snapshot DP yang dihitung server/sistem.
- Menambahkan migrasi LocalStorage v6 untuk menghapus field DP lama pada paket yang sudah tersimpan di browser.
- Memisahkan pemeriksaan bukti pembayaran dari perubahan status biasa. Admin kini membuka modal verifikasi, melihat bukti dan data transaksi, lalu sistem mengubah pembayaran dan booking secara atomik.
- Menambahkan audit verifikasi pembayaran berupa waktu, admin pelaksana, dan catatan opsional pada appointment serta receipt administratif.
- Mengganti input nama file simulasi pasien dengan upload JPG/PNG/WEBP/PDF yang dapat dipreview admin pada prototype LocalStorage.
- Menutup jalur konfirmasi booking langsung yang dapat melewati verifikasi pembayaran.
- Memperkuat paket berjalan: pembayaran awal wajib terverifikasi, sesi sebelumnya wajib selesai, tanggal sesi berikutnya minimal H+1, dan jam dipilih dari availability engine.
- Menghapus input jam bebas untuk sesi lanjutan pada tab Paket Berjalan dan Riwayat Psikolog.
- Mencegah status `COMPLETED` sebelum waktu konsultasi berakhir dan menyelesaikan treatment plan otomatis setelah seluruh sesi selesai.
- Menyesuaikan kontrak service Laravel agar endpoint verifikasi pembayaran juga mengonfirmasi booking.
- Test/build/TypeScript checker tidak dijalankan karena belum diizinkan pada sesi ini.

## 2026-10-19 — Audit aturan dokumen saja

- Menambahkan [AUDIT_ATURAN_DOKUMEN_2026-10-19](audits/AUDIT_ATURAN_DOKUMEN_2026-10-19.md) dengan R01–R32, mencakup konflik aturan, kasus batas, kontrak teknis, serta kelengkapan F01–F17. Tidak memasukkan belum adanya aplikasi sebagai temuan.
- Mengikuti keputusan deadline terbaru: yang lebih awal antara 24 jam dan waktu mulai sesi.
- Memperjelas otoritas keputusan developer dan memperbaiki beberapa residu aturan reschedule, login, laporan, actor audit, dan kewenangan input biaya Admin.
- Memperbarui KNOWN_ISSUES, DECISIONS, SESSION_HANDOFF, peta dokumen, serta index. Source aplikasi tidak diperiksa atau diubah.

## 2026-10-18 — Tindak lanjut audit dan penamaan role

- Memperbaiki B07 pada source: helper ID pasien memakai UUID v4, dengan `crypto.randomUUID()` dan fallback `crypto.getRandomValues`; dipakai pada login email baru, registrasi mock, serta walk-in.
- Helper login pasien baru menggunakan email contoh beridentitas UUID agar tidak berulang setiap satu detik. ID/relasi data lama tidak diubah.
- Memperbarui requirement pembayaran/saldo, pelepasan slot reschedule, laporan kas berbasis tanggal penerimaan dengan relasi ke booking, serta riwayat pre-test. Implementasi runtime keempat fitur tersebut belum diperbaiki pada sesi ini.
- Menambahkan [ALUR_PENGGUNA_DAN_PENYELARASAN_SISTEM](ALUR_PENGGUNA_DAN_PENYELARASAN_SISTEM.md) berisi empat sudut pandang UX, studi kasus reschedule/hold, pembagian frontend/API/backend, dan batas keputusan versus rekomendasi.
- Menegaskan Superadmin sebagai satu owner/praktisi dan stakeholder, Admin sebagai pekerja pembayaran/administrasi; enum `PSYCHOLOGIST` tetap dipertahankan.
- Memperbarui status audit/known issues/TODO. Pemeriksaan statis saja; tidak menjalankan Git, checker/test, aplikasi, dev server, atau build.

## 2026-10-06

- Melakukan hardening frontend menyeluruh setelah audit flow:
  - memisahkan booking walk-in admin dari kewajiban pre-test awal, tetapi tetap menerapkan tanggal konsultasi minimal H+1
  - mendaftarkan pasien walk-in baru ke state pengguna dan memvalidasi jadwal praktik
  - menghitung ulang harga, diskon, total, dan DP langsung dari paket aktif
  - menambahkan validasi identitas pasien, role, ownership resource, dan transisi status appointment
  - membatasi reschedule pada admin atau pasien pemilik booking berstatus `PENDING`/`CONFIRMED`
  - mengembalikan reschedule pasien ke `PENDING` agar admin mengonfirmasi ulang
  - membatasi CMS, paket, jadwal, profil psikolog, sesi lanjutan, dan moderasi sesuai role
- Mengganti lock utama booking/reschedule/sesi lanjutan dengan Web Locks API lintas-tab dan mempertahankan fallback LocalStorage untuk browser lama.
- Menyatukan nominal DP pasien dengan `dpAmount` paket dan menambahkan validasi paket untuk harga, durasi, DP, diskon, serta jumlah sesi.
- Memastikan pre-test selesai disimpan sebelum wizard masuk ke langkah konfirmasi pembayaran.
- Memperbaiki pengaturan jadwal: validasi jam/kuota, migrasi storage v2 ke v3, sinkronisasi lintas-tab, dan reset konfigurasi.
- Memperbaiki efek samping pagination laporan yang sebelumnya memakai `useMemo` menjadi `useEffect`.
- Menambahkan kartu mobile khusus untuk riwayat pasien, reservasi admin, dan riwayat aksi psikolog agar tabel lebar tidak dipaksakan pada ponsel.
- Mengganti pilihan jam generik pada walk-in dan reschedule pasien/admin dengan slot aktual hasil perhitungan jadwal, hari libur, kuota, overlap, durasi paket, dan waktu berjalan.
- Menghapus kolom psikolog dari monitoring reservasi dan CSV admin sesuai scope praktik psikolog tunggal.
- Menjalankan `npx tsc --noEmit` setelah perubahan; hasil 0 error.
- Mengoreksi aturan tanggal berdasarkan arahan developer: semua booking dan semua reschedule, termasuk walk-in admin, wajib memilih tanggal minimal keesokan hari (H+1).
- Menetapkan backend final Laravel 13 REST API dan database MySQL 8+.
- Membersihkan residu tarif online/offline dari profil psikolog; seluruh harga layanan sekarang hanya berasal dari paket.
- Mengganti label ringkasan psikolog "Online & Tatap Muka" menjadi "Seluruh sesi tatap muka" dan membuang import ikon video yang tidak lagi dipakai.
- Menghapus state, model, controller, endpoint, mock, dan indikator tabel catatan SOAP yang sudah tidak masuk scope.
- Menambahkan fallback terpusat untuk logo, avatar psikolog, dan seluruh preview gambar CMS ketika URL gambar rusak.
- Memperbarui migrasi LocalStorage ke versi cleanup v5 untuk membuang state SOAP dan field tarif profil lama.
- Menghapus Architecture Blueprint internal beserta state `viewMode` dan seluruh referensinya.
- Menghapus legacy test psikolog/DASS dari type, model, controller, endpoint, context, mock data, dan kontrak appointment.
- Menghapus paket serta logic konsultasi online/telelayanan dari source aktif; scope konsultasi sekarang tatap muka.
- Menambahkan migrasi LocalStorage satu kali untuk membersihkan state test, telelayanan, dan field appointment legacy.
- Menambahkan HTTP client siap Laravel Resource/Sanctum serta service CRUD modular untuk auth, user, paket, appointment, jadwal, pre-test, treatment plan, finance, review, CMS, dan notifikasi.
- Menambahkan lazy loading per halaman role dan debounce penulisan LocalStorage untuk mengurangi beban render awal prototype.
- Mengubah Paket Berjalan menjadi tabel desktop dan kartu mobile, serta menambahkan aksi discontinue paket dengan alasan dan guard penjadwalan.
- Menambahkan guard review: hanya appointment `COMPLETED` dan maksimal satu review aktif per appointment.
- Menambahkan konfirmasi aksi psikolog untuk complete, no-show, cancel, dan discontinue paket.
- Menghapus mutasi status akun dari portal admin sehingga monitoring user benar-benar read-only.
- Memperbarui `TODO.md` berdasarkan status implementasi aktual dan memisahkan pekerjaan frontend yang perlu QA dari pekerjaan backend produksi.
- Menulis ulang `TODO.md` menjadi checklist status aktual yang memisahkan fitur frontend selesai, pekerjaan frontend tersisa, keputusan yang masih dibutuhkan, pekerjaan backend, dan tahap QA/rilis.
- Mencatat residu frontend yang belum selesai: legacy DASS/test psikolog, telelayanan online di mock/source, Blueprint internal, optimasi performa, QA edge case, dan responsivitas tabel Paket Berjalan.
- Memperkuat slot locking frontend:
  - lock sementara per psikolog/tanggal mencegah double submit dalam proses bersamaan
  - appointment dan schedule disinkronkan antar-tab browser
  - booking membaca ulang snapshot LocalStorage terbaru sebelum menyimpan
  - reschedule memvalidasi H+1, durasi asli, jam praktik, hari libur, kuota, dan overlap slot
  - penjadwalan sesi lanjutan paket memakai lock dan validasi ketersediaan yang sama sebelum disimpan
  - request booking divalidasi ulang terhadap durasi paket, jam praktik, hari libur, kuota, dan ketersediaan slot di dalam lock
- Menambahkan pencatatan pelunasan satu arah oleh admin: nominal aktual dimasukkan sekali, status menjadi `PAID`, lalu nominal disembunyikan dari seluruh UI admin.
- Memisahkan status konsultasi dan pembayaran; psikolog menandai `COMPLETED` tanpa otomatis melunasi transaksi.
- Menambahkan guard role frontend agar admin hanya dapat mengonfirmasi booking dan mencatat pelunasan, tanpa akses menyelesaikan/membatalkan/menandai no-show sesi.
- Menyambungkan DP dan pelunasan aktual ke laporan uang masuk, PDF, CSV, dan Excel serta mengganti metrik menjadi rata-rata per transaksi.
- Mengunci scope laporan sebagai arus kas paket tanpa perhitungan biaya/pengeluaran/laba bersih.
- Menetapkan WhatsApp sebagai kanal notifikasi utama dan email sebagai fallback/dokumen pada implementasi backend.
- Menjadikan vault Obsidian `docs/Psikolog/Live Docs` sebagai satu-satunya sumber dokumentasi aktif serta membersihkan hardlink root dan snapshot lama yang tidak dipakai.
- Memperjelas pengelolaan diskon pada form tambah/edit paket psikolog:
  - tombol Tambah Diskon ditampilkan saat paket belum memiliki diskon
  - diskon aktif dapat diubah sebagai persentase atau nominal rupiah
  - diskon dapat dihapus melalui tombol ikon hapus
  - form menampilkan pratinjau harga awal, nominal diskon, dan harga akhir
  - validasi mencegah nilai diskon kosong, persentase di atas 100%, dan nominal di atas harga paket
- Menambahkan kemampuan admin membantu reschedule jadwal pasien dengan audit pelaku reschedule.
- Menambahkan receipt administratif di admin untuk Print / Simpan PDF setelah konfirmasi pembayaran, tanpa menu kwitansi terpisah dan tanpa nominal harga.
- Mengganti CTA kwitansi pasien menjadi Print Receipt / Simpan PDF serta menampilkan audit reschedule bila jadwal pernah diubah.
- Memastikan source UI utama tidak lagi memuat badge legalitas layanan.
- Menambahkan fitur potongan harga dari psikolog/pengelola:
  - potongan diatur dari Manajemen Paket psikolog, bukan memakai kode promo pasien/admin
  - potongan dihitung sebelum DP dan sisa pelunasan
  - data appointment menyimpan subtotal, label potongan, nominal potongan, total setelah potongan, DP, dan sisa pelunasan
  - invoice/kwitansi pasien menampilkan baris potongan
- Memperbarui form walk-in admin:
  - field "Psikolog yang Melayani" dihapus dari UI admin
  - admin memakai psikolog/pengelola utama sebagai default
  - nominal harga/potongan/DP tidak ditampilkan di admin
  - pembayaran walk-in mendukung cash, bank transfer, QRIS, EDC, bank, nama pengirim, dan referensi transaksi
- Memperkuat logic paket multi-sesi:
  - psikolog hanya bisa menjadwalkan sesi lanjutan setelah sesi terakhir `COMPLETED`
  - sistem memblokir sesi lanjutan jika paket sudah selesai atau sesi aktif berikutnya sudah ada
  - tabel Paket Berjalan menampilkan ringkasan pembayaran paket
- Memperbaiki guard booking H+1 yang sebelumnya masih memakai tanggal hardcoded, serta memperketat deteksi slot bentrok memakai overlap rentang jam.
- Menonaktifkan seed data DASS/test psikolog legacy dari mock data agar scope aktif fokus ke pre-test profiling.
- Membersihkan wording UI yang memakai klaim legalitas layanan pada area publik utama.
- Mencatat isu CSP simulator `script-src 'none'` sebagai isu environment preview, bukan bug Vite app.

- Penyesuaian scope booking-first sesuai arahan terbaru:
  - menghapus jalur UI test psikolog tambahan dari portal pasien; pre-test sekarang diposisikan sebagai profiling awal untuk booking
  - menambahkan consent & privacy pada alur booking dan section informasi consent/privacy di landing page
  - menambahkan tab psikolog **Paket Berjalan** untuk memantau paket multi-sesi, progres sesi, sesi berikutnya, dan tombol jadwalkan sesi lanjutan
  - menambahkan aksi psikolog untuk `COMPLETED`, `NO_SHOW`, dan `CANCELLED`; admin tetap hanya konfirmasi pembayaran
  - menambahkan invoice/kwitansi pasien dengan DP Rp 100.000, sisa pelunasan, metode/channel bayar, nama pengirim, nomor referensi, status, dan bukti pembayaran
  - menambahkan input nomor referensi pembayaran pada booking pasien dan walk-in admin
  - menambahkan export data klinis pasien pada dashboard psikolog
  - laporan finance disesuaikan dari DP 50% menjadi DP Admin Rp 100.000
  - dokumentasi diperbarui untuk notifikasi WhatsApp/email backend, consent/privacy, no-show/cancel, invoice, dan backup/export klinis
- UI Paket Berjalan psikolog diubah dari card-grid menjadi tabel operasional agar lebih mudah untuk managing banyak pasien multi-sesi dalam satu layar.

- Penyempurnaan logic paket multi-sesi:
  - menambahkan konsep `treatmentPlanId` pada appointment mock
  - appointment paket berkelanjutan dibuat bertahap per sesi, bukan semua sesi langsung dibuat di awal
  - psikolog dapat menjadwalkan sesi lanjutan dari Riwayat Sesi setelah sesi sebelumnya selesai
  - aksi psikolog pada tabel diubah menjadi icon button modern dengan tooltip
  - dokumentasi backend diperjelas dengan aturan `treatment_plans`, idempotency key, transaction, unique constraint, dan index anti double booking

## 2026-10-05

- Revisi alur operasional:
  - layout pemilihan tanggal dan jam praktik di booking pasien dibuat lebih ringkas
  - walk-in booking admin diberi rincian metode pembayaran Cash/Bank/QRIS/EDC
  - admin hanya dapat konfirmasi pembayaran/booking; aksi batal/hapus/selesai dicabut dari tabel admin
  - psikolog menandai sesi selesai manual dari Riwayat Sesi
  - form fasilitas/manfaat paket psikolog diubah menjadi add/remove item
  - pilihan jumlah sesi konsultasi berkelanjutan dirapikan dan progres sesi ditampilkan pada tabel

- **Integrasi 15 Paket Layanan Resmi dari Klien (`docs/paket untuk website.pdf`)**:
  - Mengintegrasikan 15 paket resmi: 5 Konseling (Offline, Telelayanan, Anak/Remaja, Dewasa, Pasangan/Keluarga), 9 Asesmen (Dasar, Lengkap include laporan resmi SIP, Tes IQ, Kepribadian Standar/Lengkap, Asesmen Anak/Remaja Standar/Lengkap, Asesmen Dewasa Standar/Lengkap), dan 1 Psikoterapi Intensif 4 Sesi.
  - Paket lama dinonaktifkan (`isActive: false`) demi integritas data relasi historis.
- **Penyembunyian Harga Nominal di Awal Laman (Landing Page)**:
  - Sesuai permintaan keluarga psikolog/klien, nominal harga disembunyikan untuk pengunjung yang belum sign in dan digantikan banner informasi tarif tersedia setelah masuk akun.
  - Ditambahkan filter tab kategori (Semua, Konseling, Asesmen, Psikoterapi).
- **Penguncian Pemilihan Paket Berbasis Kelengkapan Data Diri Pasien (`isProfileComplete`)**:
  - Pasien wajib melengkapi data diri (Nama, No HP/WA, Tanggal Lahir, Jenis Kelamin, Domisili, Pekerjaan, Kontak Darurat) sebelum diizinkan memilih paket.
  - Kartu paket berstatus terkunci dan akan memicu modal pengisian data diri jika belum lengkap.
- **Transisi ke Sistem Pembayaran DP Flat Rp 100.000 (Biaya Administrasi)**:
  - Mengubah skema DP dari persentase 50% menjadi DP Flat Rp 100.000 untuk penguncian jadwal reservasi klinik.
  - Menambahkan input wajib: Nama Pemilik Rekening Pengirim (`transferSenderName`) dan unggah bukti transfer DP Rp 100.000. Sisa biaya paket dilunasi saat pasien hadir di klinik.
- **Resolusi Bug Layar Bisa Digeser ke Samping (Horizontal Overflow)**:
  - Memasang `overflow-x: hidden` pada `index.css` dan membungkus seluruh tabel dengan scrollbar kontainer lokal responsif.
- **Rekonstruksi & Standarisasi Manajemen Paket (`PackagesTab.tsx`)**:
  - Menyelesaikan SyntaxError ekspor modul pada `PackagesTab.tsx`.
  - Membangun antarmuka Data Table manajemen paket lengkap dengan filter pencarian, kategori, jenis konsultasi (Sesi Tunggal vs Perawatan Berkelanjutan/Rawat Jalan), switch on/off status, modal preview kartu paket, dan modal form tambah/edit paket dinamis.
- **Standarisasi Templating Cetak Kop Dinas Resmi (`OfficialPrintModal.tsx`)**:
  - Membangun komponen cetak resmi universal berkop surat klinik, garis ganda dinas, dan kolom tanda tangan penanggung jawab.
- **Redesain Jadwal & Riwayat Pasien Menjadi Format Tabel (`HistoryTab.tsx`)**:
  - Mengubah tampilan kartu besar menjadi tabel rapi dengan modal detail janji temu.
- **Redesain Modal Pasien Berstandar Rekam Medis Modern (`PatientDetailModal.tsx`)**:
  - Mengatasi SyntaxError export `PatientDetailModal.tsx` dan merombak modal rekam medis pasien dengan triage risiko visual, kontak darurat, chips keluhan, quote deskripsi, skor DASS-21, dan riwayat konsultasi.
- **Alur Walk-In Booking Langsung Admin (`ReservationsTab.tsx`)**:
  - Mengaktifkan modal formulir walk-in reservasi pasien langsung untuk admin operasional.
- **Rombak Desain Seluruh Modal ke *Modern Simple Light***:
  - Mengeliminasi seluruh modal ber-header gradient gelap pekat (`slate-900`, `sky-950`, `purple-950`).
  - Mengganti menjadi gaya Modern Simple Light: header putih bersih, kontainer ikon soft pastel teal, tipografi tebal minimalis, tombol aksi terstandarisasi warna teal.
- **Eliminasi Total Blueprint Mode & Switcher Akun Demo, Transisi ke Tombol Sidebar Collapse Global**:
  - Menghapus menu titik 3 demo dan mode blueprint dari Navbar.
  - Mengganti switcher navbar dengan tombol **Sidebar Collapse Toggle** (`PanelLeftClose`/`PanelLeftOpen`) yang tersinkronisasi dua arah via `AppContext`, dan otomatis tidak tampil pada Landing Page Guest.
- **Pembatasan Hak Akses Admin (Strict Read-Only User Monitoring) & Redesain Moderasi Ulasan**:
  - Admin dilarang melakukan operasi Create, Update, Delete di luar reservasi walk-in pasien; tombol blokir/edit user dihapus dari `UsersTab`.
  - Redesain bagian ringkasan ulasan di `ReviewsTab` menjadi Card Metrik Terpadu: Skor 4.7/5.0, progress bar distribusi bintang 5-1 interaktif, dan filter pills status.
- **Fitur Unggah & Edit Foto Profil Wajah Psikolog (`ProfileTab.tsx`)**:
  - Menambahkan input upload dan ganti foto wajah psikolog (`FileReader` DataURL) yang tersimpan ke `PsychologistProfile.avatarUrl` dan tampil di Live Preview Card, Overview Dashboard, Landing Page, dan Avatar Navbar.
- **Kondisional Footer (Landing Page Saja) & Akses Cepat Login Testing (`App.tsx`, `Footer.tsx`, `LoginModal.tsx`)**:
  - Komponen Footer disembunyikan sepenuhnya saat user berada di dalam dashboard (`currentRole !== 'GUEST'`), hanya tampil di Landing Page.
  - Footer dibersihkan dari opsi peran demo dan tautan blueprint lama.
  - Pada Modal Login, ditambahkan tombol chip Akses Cepat Testing (`[🩺 Psikolog]`, `[🛡️ Admin]`, `[👤 Pasien]`) yang sekali klik otomatis mengisi email & sandi resmi pengujian.
- **Navbar Sticky dengan Animasi Transisi & Tombol Hamburger Sidebar Collapse (`Navbar.tsx`)**:
  - Navbar dianimasikan dengan scroll listener (`isScrolled`), memberikan efek elevasi bayangan halus (`shadow-md shadow-slate-900/5`) dan penyesuaian tinggi otomatis.
  - Mengubah tombol toggle sidebar menjadi ikon **Hamburger** (`Menu` dari `lucide-react`) yang rapi dan seragam.
  - Mendukung penayangan logo JiwaSehat kustom dari CMS (`landingCms.logoUrl`) dengan fallback ikon `HeartHandshake`.
- **Standarisasi Universal Tata Letak Tabel & Paginasi (`UsersTab.tsx`, `ReservationsTab.tsx`, `PackagesTab.tsx`, `HistoryTab.tsx`)**:
  - Seluruh tabel di sistem kini terstandarisasi: Search di Kiri, Filter di Kanan, dan Pagination bar modern di Bawah.
  - Menghindari penumpukan baris tabel data besar dengan membatasi 6-8 item per halaman lengkap dengan kontrol halaman Previous, Next, dan nomor halaman.
- **Pencabutan Hak Cetak Jadwal dari Admin & Pembatasan Aksi Booking (`ReservationsTab.tsx`)**:
  - Hapus tombol cetak jadwal dan `OfficialPrintModal` dari dashboard Admin (Admin dilarang/tidak perlu mencetak jadwal).
  - Admin hanya boleh melakukan verifikasi/konfirmasi pembayaran booking. Aksi pembatalan, penghapusan, dan penandaan selesai konsultasi dicabut dari tabel reservasi admin.
- **Pembersihan Banner Profil Dokter di Overview Psikolog & Eliminasi SOAP (`OverviewTab.tsx`, `HistoryTab.tsx`)**:
  - Menghapus kartu banner dokter ("Praktik Mandiri Aktif... SIP... dr. Sarah Jenkins... Status Layanan: Siap Melayani Pasien") di atas dashboard Psikolog.
  - Seluruh kata dan istilah SOAP dibersihkan dari tombol dan tabel riwayat, diganti menjadi "Rekam Medis Pasien".
- **CMS Media & Gambar Branding Website (`CmsTab.tsx`)**:
  - Menambahkan Accordion 4 "Media & Gambar Branding Website" pada CMS Landing Page untuk pengelolaan gambar: Logo JiwaSehat, Banner Hero, Foto Fasilitas Ruang Klinik, dan Barcode QRIS Pembayaran DP Rp 100.000, lengkap dengan tombol preset sampel gambar dan pratinjau langsung.
- **Perbaikan Lapisan Z-Index Tooltip Universal & Transisi ke React Portal (`Tooltip.tsx`)**:
  - Komponen Tooltip dirombak total menggunakan `createPortal(..., document.body)` dengan posisi `fixed` dinamis (`getBoundingClientRect()`) dan `z-index: 999999`.
  - Tooltip 100% bebas dari risiko terpotong oleh container tabel `overflow-x: auto` atau tertutup elemen lain.
- **Penghapusan Card Mobile "Pilih Menu ▾" di Seluruh Dashboard & Integrasi Hamburger Navbar (`Navbar.tsx`, `AdminDashboard.tsx`, `PsychologistDashboard.tsx`, `PatientDashboard.tsx`)**:
  - Menghapus blok card dropdown mobile `[Pilih Menu ▾]` dari ketiga dashboard.
  - Tombol Hamburger di Navbar kini membuka slide-down Mobile Navigation Drawer yang rapi, menampilkan daftar tab menu peran aktif (Admin, Psikolog, Pasien) lengkap dengan ikon dan badge.
- **Perbaikan Sticky Navbar & Efek Animasi Scrolling (`App.tsx`, `index.css`, `Navbar.tsx`)**:
  - Menghapus `overflow-x-hidden` dari container root di `resources/js/App.tsx`, dan menerapkan `overflow-x: clip` pada `html, body` di `resources/js/index.css`.
  - Header Navbar dinaikkan ke level `z-[60]` dengan animasi transisi yang mulus: tinggi mengecil dari `h-16` ke `h-14`, background `bg-white/95 backdrop-blur-md`, border teal halus, dan garis indikator glow dinamis.
- **Alur Autentikasi Email Tunggal di Landing Page (Tanpa Tab Register) (`LoginModal.tsx`, `AppContext.tsx`)**:
  - Form pendaftaran kata sandi terpisah dihapus total (*"gaada register"*). Autentikasi disederhanakan murni berbasis input Alamat Email (dan opsi Google SSO).
  - Sistem mengecek email: jika sudah terdaftar, langsung masuk ke akun; jika belum, otomatis dibuatkan akun pasien baru dengan status `isProfileComplete: false`.
- **Modal Form Data Diri Pasien Wajib (`PatientMandatoryProfileModal.tsx`)**:
  - Pasien baru atau pasien yang belum melengkapi data diri (`isProfileComplete !== true`) wajib mengisi modal ini terlebih dahulu (*"harus melakukan isi form itu baru bisa ngapa ngapain"*).
  - Modal terkunci dan tidak bisa ditutup sebelum disimpan. Field memuat: Nama Lengkap, Nomor WhatsApp, Tanggal Lahir, Jenis Kelamin, Kota Domisili, Pekerjaan, dan Kontak Darurat Kerabat.
  - Setelah disimpan, profil diperbarui ke `isProfileComplete: true` dan pasien langsung diarahkan ke pemilihan paket/booking.
- **Halaman Penuh Khusus Form Data Diri Pasien Baru (`PatientProfileCompletionPage.tsx`)**:
  - Pasien baru dialihkan langsung ke Halaman Khusus Data Diri yang berada di luar sidebar menu dashboard pasien. Menu drawer di Navbar dinonaktifkan hingga seluruh identitas diri berhasil disimpan.
  - Dilengkapi fitur helper pengujian *"Isi Otomatis Data Sampel"* untuk mempercepat testing.
- **Standarisasi Universal Seluruh Modal Menggunakan React Portal & Elevasi Z-Index `z-[999999]`**:
  - Seluruh modal sistem (`PatientDetailModal`, `LoginModal`, `ProfileModal`, `BioModal`, `ReservationsTab`, `ReviewsTab`, `PackagesTab`, `HistoryTab`, `RescheduleModal`, `OfficialPrintModal`, `BookingTab`, dan `ExportFinanceModal`) di-portal ke `document.body` dengan `z-[999999]`.
  - Mengatasi total keluhan modal tertutup/tertabrak oleh sticky Navbar (`z-[60]`).
- **Pembersihan Biaya Awal / Nominal DP dari Kartu Profil Landing Page Publik**:
  - Menghapus tampilan biaya awal / nominal uang ("DP Awal 50% Rp 187.500") dari kartu profil psikolog publik di Landing Page sebelum login, digantikan status operasional *"Praktik Tatap Muka Terjadwal"*.
- **Perbaikan Bug Asinkron Autentikasi Email Pengguna Baru (`loginWithEmail`)**:
  - Mengirimkan `nextUsers` langsung ke `loginAs('PATIENT', newId, nextUsers)` sehingga closure React state tidak tertinggal dan login email baru tidak lagi memicu error 404 *"Pengguna tidak ditemukan dalam sistem"*.
- **Penyembunyian Tombol Hamburger Navbar di Layar Besar (`Navbar.tsx`)**:
  - Tombol hamburger di samping profil akun disembunyikan pada layar besar (`lg:hidden`) karena fungsi kecual/perluas menu sudah terintegrasi di dalam sidebar dashboard masing-masing.
  - Tombol hamburger langsung muncul saat resolusi layar mengecil (`< lg`) untuk membuka slide-down Mobile Navigation Drawer.
- **Ornamen SVG Wave Pembatas Section di Landing Page (`LandingPage.tsx`)**:
  - Menambahkan gelombang SVG Wave lengkung pada batas bawah Hero section (ke `bg-slate-50`) dan batas atas CTA footer (ke `bg-slate-900`) untuk tampilan visual modern yang menenangkan.
  - Memastikan antarmuka landing page tetap bersih, ringan, dan bebas dari scroll dock yang tidak perlu (*"wave aja cukup"*).
- **Integrasi Foto Profil Dinamis Psikolog di Landing Page (`LandingPage.tsx`, `mockData.ts`)**:
  - Kartu Hero dan Modal Bio Dokter kini menayangkan foto resmi psikolog dr. Sarah Jenkins secara dinamis (`soloPsychologist?.avatarUrl || soloUser?.avatar`), siap tersambung ke backend API Laravel.

## 2026-10-02

- Refactor navigasi sidebar dan drawer mobile pada Dashboard Pasien, Admin, dan Psikolog:
  - Mode collapse desktop: ikon terpusat, badge mengambang, dan hover tooltip informatif.
  - Mode mobile: drawer menu bar collapsible interaktif dengan tombol "Pilih Menu ▾" / "Tutup" yang ramah sentuhan jempol.
- Integrasi alur Pre-Test ke Halaman Booking Konsultasi (`BookingTab`):
  - Alur wizard terpadu 3-langkah (1. Jadwal & Paket -> 2. Isi Pre-Test & Keluhan -> 3. Konfirmasi Rincian & DP 50%).
  - Menghapus tab pre-test intake yang berdiri sendiri dari navigasi portal pasien.
- Peningkatan layouting Asesmen Psikologi Mandiri DASS-21 (`TestsTab`):
  - Default beralih ke mode Stepper Soal per Soal (Next-Next) dengan kartu opsi jawaban besar dan touch-friendly.
  - Menghilangkan kebutuhan scroll vertikal panjang di laptop dan mobile.
  - Menyediakan navigasi jump button nomor soal dan auto-fill demo.
- Restrukturisasi Beranda Pasien (`OverviewTab`):
  - Mengubah ringkasan menjadi "Panduan & FAQ" interaktif (5 langkah alur konseling + accordion FAQ per kategori).
  - Memisahkan data jadwal aktif dan riwayat konsultasi ke tab "Jadwal & Riwayat Saya" agar beranda tidak menumpuk.
- Redesain Moderasi Ulasan Admin (`ReviewsTab`):
  - Menghapus card profil dokter tunggal yang berulang.
  - Mengubah daftar ulasan menjadi format Data Table profesional yang rapi.
  - Menambahkan rating rata-rata, filter bintang lengkap (Bintang 5 s/d 1), pencarian, dan pagination terstandarisasi.
- Redesain Portal Psikolog (`ScheduleTab`, `PatientsTab`, & `AnalyticsTab`):
  - Menghapus input slot manual satu per satu, digantikan Manajemen Jadwal Mingguan (Senin-Minggu) padat & modern berformat tabel bergaris yang jelas terbaca orang tua.
  - Menghapus catatan medis SOAP secara menyeluruh karena tidak diminta klien; tabel pasien difokuskan murni pada profil identitas, keluhan pre-test, asesmen DASS-21, dan riwayat sesi.
  - Menyederhanakan tab Keuangan murni mencatat "Uang Masuk / Arus Kas" per bulan & tahun 2026, menghapus pembagian komisi 70-30, slip honor dokter berulang, dan audit rating yang tidak relevan.
- Standarisasi Tipografi Global (Plus Jakarta Sans):
  - Memperbaiki inkonsistensi font monospace bawaan Windows akibat `font-mono` pada angka nominal rupiah, kode booking, dan badge ID; seluruh elemen web diseragamkan mutlak menggunakan Plus Jakarta Sans via `@theme` Tailwind CSS v4.
- Desain Ulang Beranda Pasien Lebih Rapat (`OverviewTab`):
  - Tata letak dirombak menjadi model 2 kolom berdampingan yang rapat dan modern tanpa banyak scroll vertikal: Alur 5 Langkah Konseling di kolom kiri dan Accordion FAQ + Hotline Darurat di kolom kanan.
- Peningkatan Kemudahan Manajemen Jadwal Psikolog (`ScheduleTab`):
  - Status praktik harian diubah menjadi tombol segmented eksplisit `[🟢 Buka] [🔴 Libur]` agar pengguna awam langsung paham bahwa status hari dapat diubah.
  - Menambahkan fitur "Penyesuaian Kuota & Praktik Tanggal Tertentu" (*Custom Date Quota Override*), memungkinkan psikolog menentukan kuota pasien maksimal (misal hanya 2 pasien) atau status libur pada tanggal tertentu.
- Penyederhanaan Tab Jadwal Praktik Psikolog (`ScheduleTab`):
  - Menghapus kolom "Skema Waktu" dari tabel jadwal mingguan.
  - Memperbarui tombol status operasional harian menjadi segmented pill modern `[ 🟢 Buka ] [ 🔴 Libur ]`.
  - Menghapus bagian "Fitur Cek Waktu" (simulator booking slot) agar tampilan tidak ramai.
  - Merampingkan tata letak pengaturan kuota tanggal khusus & cuti dadakan agar pas di layar tanpa scroll berlebih.
- Redesain UI Laporan Keuangan & Uang Masuk (`AnalyticsTab`):
  - Mengganti filter periode menjadi segmented pill bergaya SaaS modern (`Semua`, `Bulan Ini`, `Bulan Lalu`, `Tahun 2026`) ditambah pemilih bulan spesifik yang rapi.
  - Mempercantik kartu metrik uang masuk dengan gradien halus dan tata letak padat.
  - Menambahkan pagination ringkas (8 transaksi/halaman) pada tabel mutasi pembayaran.
- Transformasi CMS Konten Menjadi Accordion Eksklusif (`CmsTab`):
  - Mengubah formulir konfigurasi Landing Page, Portal Pasien, dan Portal Psikolog menjadi sistem Accordion satu-terbuka (*single-open exclusive*) guna menghemat hingga 70% tinggi layar.
- Penghapusan Header Bar Tambahan di Seluruh Dashboard:
  - Menghapus header bar putih tambahan dari Dashboard Pasien, Psikolog, dan Admin agar tata letak tidak mubazir dan konten tab langsung berada di posisi paling atas tanpa memakan ruang vertikal.
- Peningkatan Menu Profil Lengkap di Navbar Atas (`Navbar.tsx`):
  - Mengembangkan user pill dan dropdown profil di samping tombol logout menjadi menu profil yang kaya dan profesional.
  - Menampilkan kartu identitas pengguna (avatar, nama, email, role badge, ID pengguna), ringkasan status klinis (status pre-test / SIP / izin admin).
  - Menyediakan tombol "Buka Detail Profil & Akun" yang memunculkan modal pop-up interaktif untuk melihat dan mengedit profil langsung dengan toast notifikasi sukses.
  - Menyediakan menu pintasan navigasi ke tab dashboard sesuai peran pengguna (Pasien, Psikolog, Admin).
  - Menempatkan tombol Keluar dari Akun (Logout) yang jelas dan tebal di bagian bawah menu dropdown.
- Penambahan Tab Mandiri "Profil Saya" (`profile`) pada Portal Pasien:
  - Memindahkan seluruh data detail akun, status kelengkapan pre-test, kontak darurat, dan ringkasan preferensi pasien ke tab navigasi tersendiri agar halaman utama tetap bersih dan ringkas.
- Pembersihan Bug Hotline Krisis & Normalisasi Perataan Konten Pasien:
  - Memperbaiki duplikasi teks dan frasa keliru pada box hotline darurat 24 jam di `OverviewTab.tsx`.
  - Menghilangkan padding atas (`py-2`, `py-6`) pada `BookingTab`, `HistoryTab`, dan `TestsTab` sehingga seluruh tab pasien sejajar rata sempurna dengan posisi sidebar.
- Pembuatan Tab Khusus "FAQ & Bantuan" (`FaqTab.tsx`):
  - Memisahkan section FAQ dari Overview menjadi tab mandiri lengkap dengan pencarian pertanyaan, filter kategori topik, accordion, dan kontak WhatsApp darurat/admin.
- Pembersihan Redundansi Menu Profil di Sidebar & Dropdown:
  - Menghapus tab Profil dari sidebar Pasien dan Psikolog untuk menghilangkan redundansi (karena profil sudah ada di navbar atas).
  - Menghapus Menu Pintasan dari dropdown profil di Navbar.
  - Memperbaiki bug modal profil yang terpotong di tepi atas layar dengan memindahkannya ke `createPortal(..., document.body)` dengan `z-[9999]`.
- Penyempurnaan Indikator Visual Jadwal Psikolog (`ScheduleTab.tsx`):
  - Memperbaiki tombol status harian: hanya tombol yang berstatus ON yang memiliki warna solid dan pulsing dot (hijau untuk Buka, merah untuk Libur); tombol yang OFF polos transparan tanpa dot warna.
- Redesain Tab Laporan Keuangan Psikolog & Admin (`AnalyticsTab.tsx`):
  - Menghapus section grid bulanan berulang ("Rekap Uang Masuk per Bulan (Tahun 2026)").
  - Mengganti filter periode menjadi pemilih Bulan ('Semua Bulan', 'Januari'-'Desember') dan Tahun ('Semua Tahun', '2026', '2025') yang responsif langsung terhadap analitik dan tabel mutasi.
- Penghapusan Tarif Sesi Mulai di Profil Psikolog (`ProfileTab.tsx`):
  - Menghapus input tarif sesi online dan offline dari formulir profil praktik.
  - Menghapus teks "Tarif Sesi Mulai Rp 250.000" dan tombol jadwalkan sesi dari preview kartu profil publik, digantikan dengan status "Menerima Pasien Baru" dan badge "Paket Konsultasi".
- Penempatan FAQ di Bagian Terbawah:
  - Memindahkan tab FAQ ke urutan paling bawah pada sidebar navigasi Pasien (`PatientDashboard.tsx`).
  - Menambahkan section FAQ interaktif di urutan terbawah Landing Page sebelum Footer (`LandingPage.tsx`).
- Penyempurnaan Portal Pasien:
  - Menghapus tombol export CSV dan cetak pada tab riwayat pasien (`HistoryTab.tsx`).
  - Menghapus box/card "Tips Hari Ini (teknik pernapasan 4-7-8)" pada Overview Pasien (`OverviewTab.tsx`).
  - Mengimplementasikan alur pengajuan Reschedule mandiri lengkap (`RescheduleModal.tsx` & `AppContext.tsx`): validasi tanggal minimal H+1, pilihan slot jam, input alasan & catatan, perbandingan jadwal, serta integrasi reaktif ke context & LocalStorage.
- Stabilisasi Layout & Peningkatan Fitur Ekspor Keuangan (`AnalyticsTab.tsx` & `ExportFinanceModal.tsx`):
  - Mengunci tinggi dan struktur kartu metrik arus kas (`h-full min-h-[125px]`) agar tidak loncat atau bergeser saat filter diganti.
- Implementasi Komponen Tooltip & Konversi Tombol Aksi Menjadi Icon Button Minimalis:
  - Membuat komponen reusable `resources/js/components/common/Tooltip.tsx` berbasis Tailwind CSS dengan animasi fade/scale, dynamic arrow caret, dan dukungan keyboard focus / aria-label.
  - Mengubah tombol pemicu modal ekspor/cetak dan reset filter di tab Keuangan (`AnalyticsTab.tsx`) menjadi icon button yang ringkas dengan tooltip informatif.
  - Menambahkan barisan tombol icon cepat (Download CSV, Cetak PDF, Tutup) pada header dan mempercantik tombol footer di `ExportFinanceModal.tsx`.
  - Mengubah tombol Export CSV dan Cetak di tab Reservasi Admin (`ReservationsTab.tsx`) menjadi icon buttons dengan tooltip.
  - Mengubah tombol "Lihat Detail" pada tabel pasien (`PatientsTab.tsx`) menjadi icon button `Eye` dengan tooltip.
- Ruang Ekspor & Pratinjau Khusus Tanpa Sidebar Utama (`ExportFinancePage.tsx`):
  - Mengubah tema tombol printer di tab Keuangan (`AnalyticsTab.tsx`) dari warna hitam menjadi warna lembut senada brand (`bg-teal-50 text-teal-700 border-teal-200`).
  - Mengalihkan alur ekspor dari pop-up modal menjadi halaman kerja penuh khusus yang dapat diakses melalui tombol cetak di tab Keuangan, tanpa menu di sidebar dashboard psikolog.
  - Membangun sidebar panel internal untuk konfigurasi ekspor: format toggle (PDF vs Excel), pemilih rentang waktu, ringkasan transaksi, tombol aksi, serta Accordion FAQ interaktif cara mencetak A4 dan panduan Excel.
  - Mengimplementasikan Live Preview ganda: Pratinjau Dokumen Cetak Kop Surat Dinas Resmi (PDF) dan Live Table Viewer Excel interaktif dengan formula bar, header hijau, dan tombol unduh berkas spreadsheet `.xls` resmi.
- Pengayaan Data Dummy Menyeluruh & Eliminasi Total Livechat:
  - Membersihkan 100% residu kode `Room-Live-JS0X` dari mock appointments dan menggantinya dengan nama ruang klinik tatap muka fisik (`Klinik Ruang Lavender Lt. 2`, `Klinik Ruang Magnolia Lt. 3`, `Klinik Ruang Cempaka Lt. 2`, `Klinik Ruang Teratai Lt. 1`).
  - Mengubah tombol "Chat WhatsApp Admin" di FaqTab menjadi "Hubungi WhatsApp Admin" dan menyelaraskan teks pengumuman CMS dari telekonsultasi menjadi konsultasi klinis privat.
  - Menambahkan 12 data pengguna pasien baru (`user-pat-9` s/d `user-pat-20`) dengan profil lengkap, nomor kontak, avatar, dan profesi realistis.
  - Melengkapi formulir Pre-Test Intake dan hasil tes DASS-21 untuk seluruh 20 pasien, sehingga triage risiko dan preview riwayat pasien terisi lengkap.
  - Memperbanyak janji temu dan transaksi dari 9 menjadi 33 transaksi riil dari November 2025 s/d Oktober 2026 dengan beragam status pembayaran (`PAID`, `DP_PAID`, `DP_PENDING_VERIFICATION`, `REFUNDED`) dan paket.
  - Menambahkan variasi ulasan pasien bintang 5 & 4, anonim & terbuka, serta pending moderasi admin.
  - Memperbarui `STORAGE_PREFIX` di `AppContext.tsx` dari `'jiwasehat_v2_'` ke `'jiwasehat_v3_'` sehingga browser pengguna langsung memuat set data dummy baru secara otomatis.
- Penyempurnaan Sistem Cetak PDF A4 Multi-Page, Pratinjau Excel Ringkas, & Konfigurasi Kop Surat CMS:
  - Mengimplementasikan pemisahan halaman dokumen A4 otomatis (*Automatic Multi-Page Chunking*): Halaman 1 memuat Kop Lengkap Dinas + 10 transaksi pertama + penomoran halaman; Halaman berikutnya memuat Kop Ringkas + 15 transaksi; Halaman terakhir memuat Rekap Total Akumulasi Dana Masuk + Blok Tanda Tangan Resmi.
  - Menambahkan toolbar navigasi halaman A4 interaktif pada layar: Tombol `[Halaman Sebelumnya]`, `Halaman X dari Y`, `[Halaman Selanjutnya]`, serta opsi beralih mode pratinjau `[Per Halaman A4]` atau `[Semua Halaman]`.
  - Menerapkan CSS cetak `@media print` (`page-break-after: always; break-after: page;`) untuk memastikan browser mencetak setiap lembar dokumen A4 secara terpisah tanpa baris atau tanda tangan terpotong.
  - Membatasi pratinjau tabel spreadsheet Excel menjadi 10 baris per tampilan layar dengan navigasi Prev/Next baris data, dengan tombol "Download Berkas Excel (.xls)" yang tetap mengekspor 100% dari seluruh 33 transaksi.
  - Menambahkan formulir pengaturan Kop Surat Resmi di CMS Konten Dokter (`CmsTab.tsx`): memungkinkan kustomisasi Nama Klinik/Praktik, Nama Psikolog & Gelar, No. SIP, No. STR, Alamat, No. Telp, Email, Website, Kota, dan Jabatan Penandatangan secara dinamis ke dokumen PDF dan berkas Excel.
  - Menghilangkan bug templating atas/bawah: menambahkan `print:hidden` pada Navbar dan Footer website agar tidak terbawa saat cetak PDF, serta membungkus ruang ekspor dengan full-screen overlay `fixed inset-0 z-50 bg-slate-100 overflow-y-auto` agar Navbar tidak melayang di tengah tabel dan Footer website tidak tampak saat scrolling.

## 2026-10-01

- Implementasi awal UI sesuai requirement terbaru:
  - menghapus chat dari navigasi pasien dan psikolog
  - menghapus file halaman chat lama dan jalur aksi chat dari context/controller/endpoint frontend
  - mengganti intake menjadi pre-test sebelum booking
  - menambahkan guard booking minimal H+1 dan pre-test wajib
  - mengubah booking menjadi pengajuan `PENDING` dengan DP 50% menunggu verifikasi admin
  - membatasi dashboard admin ke monitoring user, booking/verifikasi, dan moderasi review
  - memindahkan analytics keuangan dan CMS ke dashboard psikolog/pengelola
  - menambahkan kontrol hari libur, jam kerja, dan kapasitas harian di dashboard psikolog
  - menambahkan sidebar collapsible pada dashboard pasien, psikolog, dan admin
  - menyesuaikan landing page, footer, auth Google SSO demo, dan copywriting agar tidak memakai klaim organisasi yang belum valid
  - menyesuaikan halaman architecture blueprint agar tidak lagi memuat WebSocket/live chat dan mengikuti booking H+1 + DP 50%
- Mencatat requirement terbaru dari developer:
  - hierarki role psikolog/super admin/pengelola, admin, pasien
  - aturan booking H+1, hari libur, jam kerja, batas pertemuan harian, dan anti double booking
  - pre-test sebagai syarat booking
  - pembayaran DP 50% dan pelunasan 50%
  - laporan export PDF/Excel
  - perubahan scope landing page, pasien, psikolog, admin, dan UI/UX
  - tidak ada konsultasi online/chat di web
  - opsi Laravel + React sebagai arah backend
- Membuat struktur dokumentasi awal:
  - `AGENTS.md`
  - `docs/PROJECT_CONTEXT.md`
  - `docs/ARCHITECTURE.md`
  - `docs/CODING_RULES.md`
  - `docs/BUSINESS_RULES.md`
  - `docs/WORKFLOW.md`
  - `docs/DATABASE.md`
  - `docs/API.md`
  - `docs/ROLES_PERMISSIONS.md`
  - `docs/FEATURES.md`
  - `docs/DECISIONS.md`
  - `docs/KNOWN_ISSUES.md`
  - `docs/TODO.md`
  - `docs/CHANGELOG.md`
  - `docs/SESSION_HANDOFF.md`
- Mengganti README bawaan menjadi README project JiwaSehat.

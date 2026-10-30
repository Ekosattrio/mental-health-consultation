# Otorisasi pengiriman - 30 Oktober 2026

Eko meminta langsung push ke integrasi/desman. Branch lokal yang diperiksa sudah integrasi/desman; origin mengarah Ekosattrio/mental-health-consultation dan commit remote saat pemeriksaan merupakan ancestor HEAD lokal. Staging/commit/push task ini diizinkan, tanpa force atau perubahan main. Snapshot mencakup integrasi FE Eko, penyesuaian bisnis/role, perbaikan tampilan/performa, feedback data, tes dan docs yang telah dikerjakan; konfigurasi lokal, build, backup hot dan data praktik tidak ikut dikirim. Bukti verifikasi terakhir source: TypeScript,102tes FE dan build lulus,43aset/font200. Hasil hash commit/pengiriman dilaporkan pada respons task; detail teknis tetap pada catatan di bawah.

# Serah terima - Loading dan transisi dashboard seluruh role

Permintaan terbaru Eko diterapkan melalui requestActivity/DataFeedback: indikator mengambil data, upload, operasi simpan+refresh, skeleton initial/detail yang belum ada, status proses lambat setelah8detik, refresh manual dan transisi tab/tabel/dialog. Tidak memalsukan delay/progres atau menghapus data saat refresh. Perubahan revision tidak me-remount form; fade data dilewati saat input masih fokus. Paket/CMS menunggu simpan aktual dengan fieldset disabled; error/form dipertahankan, toast portal di atas modal. Semua role memakai DashboardPanel; bisnis/permission/CSRF/idempotency tidak berubah.

TypeScript dan102tes FE lulus; regresi mencakup paralel/failure/HTTP/header/status. Build akhir1,54detik, main-D08msmhv.js/main-BbblIWod.css; HTML dan43aset/font200, public/hot tetap tidak ada. Graph awal17berkas JS/CSS605.675byte (gzip estimasi173.618byte). Font runtime warning tetap200. Tidak mengelola Laragon, database, Git atau dev server baru. Browser automation belum tersambung; UAT visual semua role/lambat/gagal/reduced motion perlu dilakukan setelah hard refresh. [Alur dan bukti](DASHBOARD_FEEDBACK_2026-10-30.md).

# Histori serah terima - Animasi diperhalus setelah pengguna mengonfirmasi terlihat

Eko menyatakan animasi sudah bisa dan meminta lebih smooth. Reveal600ms/16px/opasitas awal0,4 dengan easing lebih landai; rail560ms/12px/stagger45ms. Hilangkan fade/gerakan vertikal yang sebelumnya dipicu setiap activePage berubah di tengah native smooth scroll. Reveal katalog/ulasan kini hanya heading dan rail masing-masing, tanpa transform/opacity parent ganda. Hover/press diperkecil dan selector active setelah hover agar press desktop tidak tertimpa. Tidak menambah library/loop atau mengubah bisnis/reduced motion.

TypeScript dan99tes FE lulus. Build exit0/1,80detik; HTML200 memakai main-fd6nyBvm.js/main-D-w7fyf2.css tanpa Vite. Seluruh41aset/font200. Graph awal16berkas603.200byte (gzip lokal estimasi172.647byte). public/hot tetap tidak ada; layanan existing tidak diubah. Perlu reload browser untuk bundle terbaru; FPS/Lighthouse dan kehalusan visual pada perangkat belum diukur agent. [Bukti dan koreksi panduan Chrome](PERFORMANCE_2026-10-30.md).

# Histori serah terima - Penyebab animasi tidak terlihat sudah teridentifikasi

Pengguna mengonfirmasi hasil matchMedia('(prefers-reduced-motion: reduce)').matches adalah true. Cabang reduced motion pada helper/CSS/scroll memang mematikan efek. Belum diketahui apakah berasal dari Windows atau emulasi DevTools. Tidak mengubah source/build atau memaksa gerakan melawan preferensi aksesibilitas. Berikan langkah memilih no-preference di Rendering DevTools atau mengaktifkan animasi Windows dengan No emulation, reload lalu verifikasi ekspresi menjadi false sebelum UAT. Panduan dan batas ada di [catatan performa](PERFORMANCE_2026-10-30.md). Pemeriksaan terakhir beranda masih200 memakai main-BPPOmK4l.js, public/hot tidak ada. Browser automation tetap tidak tersedia; hasil visual setelah preferensi berubah belum diklaim.

# Serah terima - Build produksi lokal aktif30Oktober2026

Instruksi terbaru Eko "coba lu build" mengizinkan build setelah opsi2 sebelumnya. `npm run build` exit0/8,92detik. `public/hot` dicadangkan ke `storage/app/vite-hot-before-production-20261030.txt`; Laravel sekarang menggunakan public/build. Tidak menghentikan PHP/Vite/MySQL/Apache atau menjalankan Git/dev server baru.

HTML beranda200 memakai main-BPPOmK4l.js tanpa vite client/port5173. Graph awal main+Home16berkas JS/CSS603.074byte (gzip lokal estimasi172.624byte, bukan transfer aktual). Seluruh41aset manifest200, font lokal200/font/woff2/27.348byte, login/up200. Peringatan build font runtime sudah diperiksa dan bukan404. TypeScript/99tes FE tetap hasil verifikasi source terbaru sebelum build; tidak ada perubahan source bisnis tahap ini.

Browser automation tidak tersedia; skor Lighthouse baru dan animasi visual belum diklaim. Pengguna perlu hard refresh alamat Laravel untuk melepas tab dengan graph dev lama. Saat kembali mengedit, restart satu terminal Vite existing agar public/hot ditulis lagi, atau pulihkan backup jika Vite masih aktif. Source berikutnya tidak otomatis tampil selama Laravel memakai build. [Hasil rinci](PERFORMANCE_2026-10-30.md).

# Histori serah terima - Tindak lanjut Lighthouse55

Audit pengguna: FCP5,4s, LCP11s, TBT20ms, CLS0,001; payload10.907KiB dan minifikasi JS8.306KiB. Aset Vite dev besar; produksi belum diukur. Jangan menjanjikan skor/FPS atau menyamakan respons mentah dev dengan bundle produksi. `public/hot` masih mengarahkan Laravel ke Vite; build saja tidak otomatis mengganti jalur ini.

Koreksi source: reveal kartu menunggu viewport lalu stagger; section bawah reveal sekali, hero langsung terlihat. Header tetap64px tanpa transisi tinggi/blur, state scroll hanya pada perubahan ambang. Hover/press transform, blur dekoratif dikurangi. LoginModal shell lazy ketika dibuka dengan fallback/error boundary. TypeScript dan99tes FE lulus; backend tidak diubah (hasil tahap sebelumnya52tes/429assertion). Regresi reveal mencakup menunggu viewport, sekali/stagger/cleanup. Browser automation tidak tersedia, sehingga UAT visual belum diklaim.

Pada tahap ini pengguna sempat memilih opsi2: source saja. Instruksi berikutnya secara eksplisit mengizinkan build; status aktif mengikuti bagian Build produksi lokal di atas, bukan penolakan historis ini.

# Serah terima - Animasi dan performa30Oktober2026

[Perubahan dan pengukuran](PERFORMANCE_2026-10-30.md). Jalur runtime server memakai AppContextCore dan AppContent terpisah; AppContext/App lama mereekspor binding/content yang sama untuk kompatibilitas preview. Default CMS pindah cmsDefaults agar Home tidak mengimpor mockData/provider LocalStorage. Graph Vite main+Home turun71ke44modul, bytes mentah termasuk sourcemap10.246.357ke9.428.374; tidak ada mockData/provider demo pada graph beranda.

Home/katalog WorkspaceData memakai eager currentVersion efektif; jam Home dibulk. Request guest lokal15layanan turun29ke9query (versi15ke1,jam7ke1), tanpa cache harga global. Font variable latin27.348byte/OFL lokal+preload, stylesheet Google Fonts dihapus; font/woff2 dan HTML200. ServicePicker memakai rail kartu utuh serta indeks/harga/count di-memo/useDeferredValue, notes kosong dipadatkan, summary/selection/dialog tetap ada. Footer rentang jam ringkas. Animasi klik/hover, slide finite dan reveal once satu observer, reduced motion/cleanup, hero tidak disembunyikan.

Verifikasi: TypeScript lulus;98tes frontend lulus;52DomainWorkflowTest/429assertion lulus. Tes katalog baru memastikan query tidak tumbuh per layanan dan versi masa depan tidak muncul; render seluruh tab tetap memakai context yang sama. Parser PHP lulus, modul/font/halaman200. Tidak menjalankan Git/dev/build atau mengendalikan MySQL/Apache/reset database praktik. Skor screenshot Lighthouse55 berasal dari dev; tidak ada skor produksi/FPS/LCP baru atau UAT visual/gesture yang diklaim.

# Serah terima - Role, libur dan tampilan30Oktober2026

Otoritas terbaru: [keputusan30Oktober](KEPUTUSAN_AKTIF_2026-10-30.md), melengkapi bisnis29Oktober. Admin hanya reservations/requests/users/reviews, termasuk nav mobile dan fallback tab lama. Backend Management/Administration/PublicAsset/FinancialActions, custom booking, lifecycle dan laporan/tutorial dibatasi owner; CMS draft DTO Admin kosong. Kasir Admin/reschedule biasa tetap bekerja. Tests:97FE lulus,51DomainWorkflowTest lulus setelah fixture custom/concurrency memakai owner; TypeScript0error dan parser12PHP lulus. Tes lanjutan memverifikasi kontak CMS/publik serta semua hari tutup. Domain test memakai database uji acak yang dibuang, bukan reset praktik.

Kalender memakai present|array untuk intervals kosong saat libur, OPEN kosong/field hilang tetap ditolak. Availability tanggal tutup kosong, hari buka tetap ada; semua hari tutup tampil praktik sedang libur. CardRail memakai page100% berisi grid1/2/3kolom (area<600,600–959,>=960px), rentang item/halaman dan snap penuh, inert halaman nonaktif, alignment resize dan autoplay ulasan sebelumnya. Notes tidak dipotong. Kontak belum diisi di database praktik; footer menampilkan keterangan, tanpa placeholder/Instagram demo. Jam publik/workspace tersambung kalender atau keterangan CMS; CMS publish menyinkronkan identitas dan preview memakai draft tanpa mutasi.

HTTP beranda/modul terbaru200; kontak publik kosong dan jam ada, tanpa token [ALAMAT_PRAKTIK] dkk. Isi informasi nyata melalui Psikolog > CMS Konten > Landing Page > Informasi Kontak Resmi & Alamat Klinik. UAT visual/gesture browser masih perlu dilakukan; tes render/HTTP tidak membuktikan geometri. Tidak mengendalikan MySQL/Apache, menjalankan dev/build/Git atau menulis data demo ke praktik.

# Serah terima - Pengelolaan layanan lokal30Oktober2026

Kegagalan masuk superadmin yang dilaporkan berikutnya adalah pemuatan modul dari origin Vite lama[::1], bukan kredensial ditolak. Login HTTP dengan akun existing berhasil ke/superadmin/dashboard, Eko/Workspace, role FE PSYCHOLOGIST dan/work/data200; sesi uji sendiri dilogout. Modul dashboard/main/resolver di127.0.0.1:5173 merespons200. Main memakai resolveInertiaPage baru: kegagalan loader menjadi PageLoadFailure dengan tombol reload manual, tanpa pengulangan POST/auto-reload; halaman tidak terdaftar tetap throw. TypeScript0error, npm test93/93; regresi loader gagal/loader normal/nama hilang lulus. Tab lama yang tidak terhubung HMR memerlukan hard refresh untuk memakai origin/resolver baru. Tidak mereset password, mengubah data bisnis atau mengendalikan MySQL/Apache. Verifikasi HTTP/checker/render, bukan UI browser.

Diagnosis terbaru halaman putih: Laravel8000 dan MySQL Laragon merespons normal; aset Vite5173 sempat timeout walaupun ready. Setelah aset pulih, samakan konfigurasi Vite ke host127.0.0.1/port5173/strictPort. Vite yang dijalankan pengguna otomatis memuat ulang config; public/hot dan script HTML sekarang IPv4. HTML200 sekitar0,54detik,67modul frontend berhasil diambil tanpa error/timeout, TypeScript lulus. Tidak menjalankan npm run dev/build, tidak menyalakan/mematikan MySQL/Apache atau mengubah .env/database. Akar internal hang pertama belum terbukti; perubahan alamat menjaga konsistensi loopback. Pengguna perlu refresh tab yang menyimpan HTML lama. Pengujian ini HTTP/checker, bukan pemeriksaan visual browser.

Instruksi terbaru Eko: jangan menyalakan MySQL/phpMyAdmin langsung di luar pengelolaan Laragon karena risiko bentrok port. Pemeriksaan read-only: Laragon PID17704 memulai mysqld PID9956, kemudian child PID11256 yang memegang satu listener3306. Proses manual29Oktober sudah tidak ada. Windows service/Run/scheduled task terkait tidak menunjukkan auto-start MySQL tambahan; script project tidak menjalankan mysqld. .env tetap127.0.0.1:3306. Tidak ada start/stop proses atau perubahan port/database. Perbarui AGENTS/SETUP/DECISIONS/KNOWN_ISSUES/CHANGELOG agar agent berikutnya tidak mengulangi start manual. Jika koneksi gagal, identifikasi listener dan pemiliknya lalu arahkan developer ke menu MySQL Laragon; jangan bertindak start/stop tanpa instruksi eksplisit. Verifikasi bersifat read-only; tes aplikasi, dev/build dan Git tidak dijalankan.

# Serah terima integrasi FE Eko - 29 Oktober 2026

Koreksi screenshot rail menyempit: grid CardRail diganti flex nowrap; semua child memakai flex0 0 22rem, width22rem dan max-width calc(100% - 1rem), dengan pengecualian satu kartu memakai maksimum100%. Track width100%, min-width0 dan overflow-xauto; kontrol di atas track. Tidak ada lagi grid-auto-columns pada rail. Berlaku untuk katalog/ulasan. TypeScript0error, npm test92/92 dan HTTP CSS/modul200; isi CSS served secara eksplisit sudah flex/no-wrap/no-shrink/scroll. UAT visual tetap belum dilakukan: cua dan sky gagal karena native pipe tidak tersedia. Jangan mengklaim screenshot sesudah perubahan sudah diperiksa atau menganggap tes render menjamin layout.

Koreksi katalog panjang: LandingPageView memakai LandingServiceCatalog baru dan CardRail bersama untuk layanan/ulasan. Rail CSS satu baris dengan snap, scroll native, kontrol44px, keyboard dan rentang kartu; responsif1/2/3kartu. Katalog berfilter kategori dan pencarian nama/deskripsi/catatan, notes tetap tampil, tarif tamu tetap tersembunyi dan aksi diteruskan ke requireAuth/onSelectBooking existing. Ulasan tetap mengikuti CMS autoplay dengan jeda manual, reduced motion, hover/fokus, visibility dan viewport. GuestGuides sekarang accordion satu judul terbuka; penyimpanan progres anonim existing dipertahankan. Audit pola lain: ServicePicker sudah horizontal/paginasi, PackagesTab sudah paginasi dan FAQ sudah accordion. Verifikasi: TypeScript0error, npm test92/92, smoke SSR15layanan/notes ter-escape/tarif tamu-pasien/empty/panduan lulus; lima modul CSS/TSX Vite existing HTTP200. Tidak menjalankan dev/build/Git atau mengubah database. UAT visual dan gesture nyata belum dilakukan.

Koreksi mobile sesudah laporan screenshot: Navbar memakai anchor selebar navbar untuk dropdown akun mobile, teks identitas membungkus, batas tinggi menu mengikuti viewport, dan menu akun/navigasi saling menutup. Tambahkan viewport-dialog pada kartu dialog FE lintas role, wrapping toolbar cetak/ekspor dan pesan toast panjang. CSS pembatas dialog hanya berlaku di layar; max-width desktop dan print tidak ditimpa. TypeScript checker lulus dan npm test92/92 lulus. Tidak ada perubahan backend/database/aturan bisnis. UAT visual belum dilakukan karena Computer Use tidak memiliki browser/app yang tersambung; lanjutkan pemeriksaan dropdown, dialog panjang dan toolbar pada320/375/390/430px, landscape dan desktop. Jangan menandai UAT selesai berdasarkan tes render.

Pemeriksaan runtime sesudah pengguna menjalankan aplikasi: MySQL sempat tidak berjalan (SQLSTATE2002/port3306 connection refused), sementara PHP8000 dan Vite5173 aktif. MySQL dipulihkan dengan executable/my.ini existing dan datadir C:/laragon/data/mysql-8.4. Tidak mengubah .env/source bisnis, membuat ulang tabel, atau mereset data. GET halaman publik, login/dashboard/API ketiga role, availability dan modul Vite berhasil HTTP200. Pemeriksaan ini melalui HTTP, bukan verifikasi visual/interaksi browser.

Otoritas terbaru: [keputusan Eko](KEPUTUSAN_AKTIF_2026-10-29.md). [Peta kode/endpoint/alur](INTEGRASI_FE_EKO_2026-10-29.md), [status dan UAT](TODO.md).

## Hasil saat ini

- Dashboard seluruh role memakai Eko/Workspace, ServerAppProvider dan AppContent dengan komponen FE asli. Navbar/footer dan login modal FE dipakai pada halaman publik/akun.
- Aksi operasional menggunakan endpoint Laravel dan data server. Tidak memindahkan mock/LocalStorage ke database praktik.
- DP booking baru FIXED Rp100.000 mengurangi biaya. Tidak ada DP baru untuk lanjutan/reschedule; semua role memakai H+1.
- Pembayaran dicatat/diverifikasi Admin. Ledger dan FIFO mempertahankan cicilan/prabayar tanpa kas ganda. Retry request sama tidak menggandakan uang; penerimaan nyata berbeda tetap dicatat walau nominal/metode/waktunya sama.
- Sesi berikutnya, selesai/no-show/cancel hanya Psikolog. Cancel/stop wajib lunas, menghentikan sisa layanan bersama dan mempertahankan invoice/penerimaan. Tidak ada auto-confirm SLA atau auto-cancel no-show. Setelah empat sesi psikoterapi pasien booking ulang.
- Bukti gambar/PDF privat, invoice/kwitansi, metadata notes/diskon/fasilitas, kalender, CMS/gambar serta profil praktik tersambung ke FE. Form versi lama ditolak. Akun dan profil terkait disimpan atomik.
- Migrasi lokal restore_eko_fixed_initial_payment sudah diterapkan. Database praktik tetap57tabel,3akun,0appointment,0penerimaan; mode FIXED100000 aktif dan kolom presentation tersedia. Tidak mereset akun/invoice/ledger.

## Verifikasi terakhir

- TypeScript checker: lulus.
- npm test:92tes lulus (84regresi FE,5integrasi FE,3pemeriksaan sumber/import/dependency). Tes render mencakup22tab menggunakan komponen Eko dan DTO server.
- DomainWorkflowTest:49tes,359assertion,seluruhnya lulus. Mencakup empat sesi, pembayaran/retry, akses role, dua proses berebut slot, reschedule, no-show, CMS, file/PDF dan profil atomik.
- Database uji acak terpisah dari database praktik. Skenario lama yang mengasumsikan same-day/DP50%/lifecycle Admin/SLA otomatis diperbarui ke keputusan Eko.
- Tidak menjalankan Git, dev server, build, deploy atau reset database.

## Batas verifikasi

Bundle produksi lama tidak dibangun ulang. Developer perlu menjalankan Vite atau build sendiri sebelum menilai source terbaru. UAT browser/mobile interaktif, pengiriman Google/WhatsApp nyata, beban produksi, SMTP dan pemulihan backup produksi belum diklaim. Tes render tidak menggantikan pemeriksaan visual perangkat nyata.

## Histori implementasi 26 Oktober 2026

Implementasi lokal Laravel13 + Inertia3 + React19 telah diselesaikan sesuai izin pengguna untuk melanjutkan seluruh backend dan integrasi tampilan. WhatsApp dan Google Identity Services/One Tap sudah diimplementasikan sesuai izin lanjutan pengguna; aktivasi provider tetap bergantung pairing ponsel dan OAuth Client ID nyata. Tidak ada operasi Git atau deployment VPS publik yang dilakukan.

Mulai dari [hasil implementasi untuk Eko](IMPLEMENTASI_WEB_2026-10-26.md), [akun awal](AKUN_AWAL_DAN_CARA_MASUK.md), [kontrak route aktual](WEB_CONTRACT.md), [aturan aktif](KEPUTUSAN_AKTIF_2026-10-24.md) dan [operasional satu VPS](OPERASIONAL_VPS_DAN_INTEGRASI.md).

## Hasil implementasi

- Kalender bersama klinik/Admin, lead180menit kerja, booking online/offline/custom, preview dan transaksi idempotent.
- Ledger penerimaan, verifikasi aktual, koreksi reversal, alokasi FIFO, diskon, biaya tambahan dan invoice/receipt PDF.
- Pengajuan/penerapan reschedule atomik, histori attempt/no-show, pembatalan bagian belum diberikan, terapi per sesi dan case asesmen beberapa pertemuan.
- Profil administrasi, profiling digital berversi, jalur kertas offline, consent, session revocation, dan DTO role yang menutup saldo/klinis dari Admin.
- CMS berversi dengan draft/preview/publish, logo/foto/hero/CTA/FAQ/footer, informasi workspace, review/moderasi, tutorial berversi beserta tour/progres/replay.
- File privat, masa unduh, retensi, laporan kas berbasis penerimaan/as_of, pengeluaran, export snapshot CSV/XLSX dan scheduler/outbox/queue.
- Google Meet manual oleh Admin dengan nomor penerima dan versi link; adapter Baileys bertanda tangan HMAC, jurnal idempotency dan retry. Pengirim pengguna telah dikonfigurasi, status koneksi privat dan pairing tersedia untuk Superadmin; pengiriman nyata menunggu penautan ponsel.

UI operasional menggunakan resources/js/pages/Practice/Workspace.tsx dan resources/js/practice/. Komponen beranda Eko dipakai sebagai presentasi. Preview LocalStorage dimatikan pada konfigurasi lokal dan default; bukan jalur operasional.

## Bukti verifikasi terakhir

| Pemeriksaan | Hasil |
|---|---|
| Integrasi domain MySQL |40tes,239assertion lulus |
| Konkurensi dua proses PHP |Satu CREATED, satu CONFLICT untuk interval yang sama |
| Fondasi schema |34pemeriksaan, rollback/remigrate MySQL terisolasi lulus |
| Smoke Laravel |2tes lulus |
| Regresi frontend/integritas import |87tes lulus |
| Bridge WhatsApp dengan provider palsu |4tes lulus; tidak mengirim ke akun nyata |
| TypeScript |npm run lint lulus |
| Build produksi |npm run build lulus |
| Parser PHP8.3.30 |227file lulus |
| Dokumentasi |146Markdown, tanpa link lokal/model hilang atau marker konflik aktif |
| Browser lokal |Login Admin/Superadmin/Pasien; kalender, CMS, finance, booking, tour pertama; tanpa console error pada pemeriksaan |
| Layout ponsel |Lebar konten375 sesuai viewport375 setelah perbaikan header |

Tes domain/fondasi membuat database acak dengan pola jiwasehat_schema_test_... dan menghapus database uji miliknya sendiri. Bukan migrate:fresh/reset database aplikasi. Tes frontend lama sebagian masih menguji prototype; bukti aturan server berasal dari suite MySQL.

## Temuan penting yang sudah diperbaiki

Mutex yang diperoleh sesudah ordinary read masih memungkinkan snapshot InnoDB lama melewatkan booking pesaing. Uji dua proses membuktikannya. Transactions sekarang memperoleh mutex praktik sebelum ordinary read pertama, lalu membaca ulang akses aktor; scheduler mengambil urutan yang sama. Pengujian sesudah perbaikan hanya menerima satu booking.

Kunci outbox penerimaan sekarang mencakup ID pembayaran agar DP/cicilan berbeda tidak berbagi notifikasi. Koreksi kas historis mempertahankan penutupan plan dan tidak bertabrakan dengan plan baru yang telah sah. Penutupan asesmen tidak memotong hak no-show atau menghidupkan billing yang sudah dilepas. Query rollback generated guard disesuaikan dengan ONLY_FULL_GROUP_BY.

## Kondisi database aplikasi

Database lokal jiwasehat:59migration,57tabel,113FK,175CHECK dan46trigger. Akun awal pengguna telah dibuat:3akun dan1profil pasien administratif. Tidak memasukkan appointment, penerimaan atau jawaban klinis demo ke database aplikasi. APP_KEY lama dipertahankan. Publikasi materi panduan/CMS dalam tes hanya terjadi pada database uji terisolasi.

## Batas aktivasi

Nomor pengirim pengguna +628558589536 telah dikonfigurasi, bridge terhubung hingga NEEDS_PAIRING. Nomor tujuan owner yang diberikan pengguna telah disimpan melalui profil privat Superadmin dan dapat diubah di website. Pengguna memilih menautkan ponsel sendiri melalui menu Superadmin nanti. Google One Tap/SSO sudah diimplementasikan, namun Client ID/domain produksi belum diberikan; Client Secret hanya untuk redirect/People API opsional. Lihat [integrasi WhatsApp dan Google](INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md). Identitas praktik, rekening, domain, SMTP dan backup/restore produksi perlu konfigurasi operator pada lingkungan nyata. Paket asesmen tanpa durasi pasti pada sumber belum bookable sampai diatur petugas; jangan menebak durasi tes. UAT stakeholder, beban produksi, pengiriman provider nyata dan pemulihan backup produksi belum diklaim.

Histori26Oktober telah digantikan keputusan Eko29Oktober. Ketentuan aktif sekarang H+1/DP flat100000 dan Git tetap dikelola developer.

## Bukti tambahan integrasi provider

- Token Google diuji dengan tanda tangan RSA/JWKS: valid diterima, signature palsu, aud/iss/exp/nonce salah dan email belum terverifikasi ditolak. SDK google/auth memerlukan phpseclib3 untuk utilitas AccessToken; dependensi produksi telah dilengkapi.
- Sub Google tertaut memakai akun sama, email lokal harus dibuktikan dengan password, role publik tidak dapat dinaikkan, nomor/alamat disimpan pada registrasi. Akun Google-only tetap password_hash=null; getAuthPassword mengembalikan string kosong untuk kontrak recaller Laravel, tanpa mengaktifkan kata sandi kosong. Tes pemulihan remember cookie serta pencabutannya lulus.
- Nomor privat owner diperiksa dari website, perubahan profil tersimpan dan terbaca oleh status bridge; tidak mengubah kontak publik. Reminder pasien opt-in, dedupe, withdrawal, stale reminder dan payload retry diuji. ACK provider wajib; payload disimpan terenkripsi.
- Browser lokal: panel Google menunggu Client ID, login owner, pengaturan koneksi WhatsApp dan penyimpanan nomor tujuan diuji; tidak ada console error. Bukti .codex-tmp/ui-whatsapp-integration.png.
- Migration tambahan diterapkan ke jiwasehat tanpa menghapus data: tetap3akun,1profil administratif,0appointment,0transaksi pembayaran. Fondasi rollback/remigrate34pemeriksaan lulus pada DB uji.
- Bridge Node lokal dijalankan pada loopback3210, Laravel sementara pada127.0.0.1:8026 untuk akses menu. Worker/scheduler belum disupervisi sebagai layanan permanen lokal/VPS; setelah pairing operator perlu menjalankan proses sesuai panduan. Tidak ada pesan nyata, kode pairing, akun Google nyata atau secret yang dipublikasikan.

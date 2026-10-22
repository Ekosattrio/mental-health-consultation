# Migrasi Inertia disetujui — 20 Oktober 2026

## Kelanjutan Terbaru - Pelunasan Sesi Terakhir
Permintaan terbaru developer: boleh cicilan/penuh di awal, wajib lunas pada hari sesi terakhir. FE preview baru memakai `paymentAgreement` pada psikoterapi baru dengan snapshot tarif empat sesi dan satu ledger uang nyata pada appointment awal. Aksi pembayaran sesi mana pun dirutekan ke ledger itu; FIFO allocation melunasi invoice terjadwal tanpa kas/DP/proof kedua. Harga katalog baru tidak mengubah agreement. Tagihan sesi belum dipesan tetap bukan utang; prabayar sukarela/lebih bayar ditampilkan terpisah dan tidak pindah ke rangkaian baru.

Pilihan DP/penuh tersedia pada Booking pasien dan walk-in Admin. Riwayat/receipt pasien, progress dan Paket Berjalan memperlihatkan ringkasan pembayaran sesuai role. Admin melihat indikator/jatuh tempo, bukan saved saldo/agregat nominal; hanya Admin dapat verify/record/reject. Pertemuan terakhir yang terjadi tetap COMPLETED secara klinis; jika saldo invoice masih positif, UI Menunggu pelunasan dan pembelian ulang psikoterapi paket sama ditahan. Pelunasan mengubah indikator tanpa mengarang kejadian sesi. Jatuh tempo mengikuti jadwal terakhir yang di-reschedule, tanpa auto-cancel/denda.

Rincian, contoh dan kontrak backend: [ALUR_PEMBAYARAN_SESI](ALUR_PEMBAYARAN_SESI.md). Record lama tanpa agreement dipertahankan; jangan migrasi histori atau membuka mock ke produksi. Domain/DB, penutupan server atomik, DTO, skema alokasi dan pengujian browser/mobile belum selesai. Pre-test konfirmasi per sesi tetap TODO terpisah. Tidak menjalankan Git/dev/build atau PHPUnit pada perubahan FE ini. Catatan lebih lama di bawah bersifat historis.
Verifikasi: `npm run lint` tanpa error, `npm test` 87/87 (84 FE +3integrasi sumber). Tambahan13tes mencakup alokasi, prabayar/lebih bayar, due WIB, status akhir, isolasi/role, dua pembayaran paralel dan kegagalan simpan atomik. Tidak ada dev server/build/browser E2E dijalankan oleh agent.

## Kelanjutan Sebelumnya - TODO FE Audit
Keputusan terbaru untuk pre-test: pilih konfirmasi/perbarui jawaban pada setiap booking atau sesi baru, termasuk Konseling ulang dengan konteks berbeda. Salinan lama tidak otomatis menjadi jawaban baru; simpan submission/snapshot per appointment tanpa menimpa histori. Reschedule sesi yang sama tidak otomatis mengulang pre-test. F07, keputusan final dan TODO diperbarui; source sesi lanjutan yang masih mewarisi snapshot lama belum diubah. Tidak menetapkan deadline/guard layanan baru di luar keputusan ini.

Instruksi bisnis paling baru: operasional penerimaan pembayaran pasien khusus Admin; psikolog membaca keuangan, bukan input/verifikasi. Penolakan input/verifikasi psikolog bukan lagi temuan yang perlu dibuka aksesnya. Dokumen keputusan, permission, F08 dan kontrak diselaraskan. Guard reject bukti masih perlu dibatasi ke Admin dalam tindak lanjut FE; tidak mengubah source/menjalankan tes pada penegasan docs-only ini. Hak harga/diskon dan pengeluaran owner tidak berubah.

Permintaan terakhir: lanjutkan TODO frontend. Lima temuan AUD-02 sampai AUD-06 sudah diperbaiki pada preview; lihat [rincian alur dan handoff backend](PERBAIKAN_AUDIT_FE_2026_10_22.md). AUD-01 tetap terbuka: aplikasi utama belum memiliki seluruh halaman domain yang terhubung backend. Jangan membuka mock di produksi sebagai jalan pintas.

Pembayaran: input nominal aktual saat verifikasi; uang kurang dari DP tetap dicatat tanpa mengonfirmasi booking; pencatatan tambahan memenuhi kekurangan tanpa mengubah penerimaan awal. Transfer nyata setelah PAID tetap masuk ledger, retry ber-key sama tidak rangkap, pembatalan tidak diaktifkan lagi oleh uang masuk.

Reschedule: asal PATIENT/CLINIC/OWNER terpisah dari pelaksana; bantuan pasien oleh Admin tetap memakai kuota/batas pasien. Request dengan tujuan terambil/lewat dapat memilih ulang melalui Riwayat pasien, menjaga ID/requestedAt pertama dan memeriksa revision. Approval memeriksa target request terbaru di bawah workflow lock; slot lama dan DP tetap sampai apply. Kalender memakai resolver tanggal bersama yang menghormati override eksplisit.

Verifikasi: npm run lint lolos, npm test74/74 (71 FE +3integrasi sumber). Belum menjalankan browser/mobile E2E, build, dev server, migration, PHPUnit atau Git pada pengerjaan ini. Backend domain, authorization/DTO, transaksi lintas perangkat, fase APPROVED/selection-window dan clock/SLA tetap TODO. Semua progres sebelumnya di bawah bersifat historis.

## Kelanjutan Sebelumnya - Review Integrasi
Permintaan developer terbaru: rapikan semua blocker integrasi agar dapat commit merge integrasi/desman lalu merge main tanpa force. [Panduan developer](PANDUAN_MERGE_INTEGRASI.md) berisi urutan aman; agent tidak mengeksekusi Git atau mengubah index.
FE preview kini memakai tagihan per sesi pada psikoterapi baru, DP100.000 sekali, lanjutan DP0, rekening sesi/receipt/report terpisah. Record tanpa billingMode mempertahankan nilai legacy. Cancel memeriksa semua invoice terbentuk, menghentikan sisa plan dan request terkait setelah lunas.
Admin punya menu operasional, paket berjalan, kalender, katalog dan CMS administratif (tanpa data klinis/layar saldo/finance). Request pasien mempertahankan slot lama sampai apply Admin; max3 asal pasien, H-2, deadline no-show+4hari, stale-version dan slot dicek. Koreksi bukti beralasan/berversi menjaga jadwal, ledger, bukti asal serta waktu submit pertama.
Backend domain, fase APPROVED/selection-window target, kalender/version clock6/12/24jam, storage privat, DTO server, WA/provider dan integrasi browser/database tetap pekerjaan berikutnya. Simulasi tidak digabung menjadi fallback mutasi halaman Inertia produksi. Jangan mengklaim seluruh target20fitur sudah berjalan.
Verifikasi akhir: npm run lint tanpa error; npm test58/58 lolos (55FE +3marker/import-case/lockfile). Seluruh lokasi dari daftar konflik cocok:50file aktif,13dokumen diarsipkan,0hilang. Tidak ada penanda konflik isi. Tidak menjalankan dev server/build/browser, migration atau Git. Metadata merge masih menunggu developer stage/commit; jangan mengubahnya manual.
Bagian di bawah adalah histori progres sebelum kelanjutan ini, bukan daftar kekurangan aktif yang mengalahkan bagian terbaru.


## Sesi 22 Oktober 2026 - Integrasi dan DP Flat
Permintaan developer: terima scope Desman dengan pengecualian DP100.000 sekali di awal, seluruh jadwal H+1, tanpa tambah sesi, pembatalan wajib lunas. Detail [keputusan final](KEPUTUSAN_FINAL_2026_10_22.md).

Progres: konflik isi tujuh file disatukan; hardening FE terbaru dipertahankan, ID pasien memakai UUID helper. README/env menyesuaikan Laravel/Inertia. Tiga belas dokumen lama yang berkonflik lokasi dipindah ke archive/EKO_2026_10_22_* tanpa membuang histori; dokumen aktif langsung docs/. Kontrak bisnis/web/database/fitur selaras dengan keputusan terbaru. Import tes diperbarui ke resources/js/legacy.

Dependency dipasang melalui npm ci --ignore-scripts (tanpa build/dev). TypeScript checker lolos. Tes regresi FE40/40 lolos, termasuk flat DP pada beberapa tarif, booking900.000 dengan DP100.000, guard batal belum lunas dan isolasi pembatalan plan. Ini pengujian preview, bukan domain Laravel.

Lanjutan: implementasikan backend domain dan migrasikan preview ledger gabungan ke per-sesi serta hak Admin/request reschedule/koreksi bukti target. Jangan mengubah tagihan legacy diam-diam atau mencampur sumber mock/server. Developer masih perlu menyelesaikan index merge melalui Git sendiri; isi file yang rapi tidak berarti merge sudah committed. Penghapusan attachment sengaja dipertahankan. Tidak menjalankan Git/dev/build.

Bagian sebelumnya di bawah adalah histori sesi, bukan aturan yang menimpa keputusan terbaru.


## Permintaan dan keputusan

Developer menyetujui Laravel/Inertia/React satu proyek dan meminta penyesuaian serta MD konteks Eko. Telah dibuat [PERUBAHAN_INERTIA_UNTUK_EKO](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md) sebagai pintu baca perubahan, [WEB_CONTRACT](WEB_CONTRACT.md) sebagai kontrak aktif, dan panduan/fitur terkait diselaraskan. Analisis sebelum persetujuan tetap historis.

## Selesai pada fondasi

- Pasang inertia-laravel3.5.1/@inertiajs/react3.9.1; Laravel13.37.0/React19.3.0/Vite8.3.4 tetap. Composer source-fallback=false dan COMPOSER_ROOT_VERSION dipakai agar tidak menjalankan Git; lockfile terbarui. Sanctum dihapus.
- Registrasi web.php, middleware Inertia/active/role/preview, Blade head/app, resolver pages, tipe props dan WebLayout. SSR/devtools disabled, history encryption flag aktif; no-store workspace/preview.
- HomeController dengan props publik whitelist; LandingPageView presentasional diadaptasi dari Eko, LandingPage lama menjadi wrapper Context untuk preview. Hilangkan nominal DP flat/aturan reschedule lama dan klaim profil/ulasan rekaan dari view publik yang dipakai ulang; metadata/praktik placeholder, paket non-bookable.
- LoginRequest/session controller: normalisasi email, whitelist input, ACTIVE, rate limit, session regenerate; logout invalidate/regenerate CSRF/clear history. Dashboard route ke PATIENT/ADMIN/PSYCHOLOGIST dari backend; bukan switch role mock.
- /preview/eko hanya local+ENABLE_LEGACY_PREVIEW; App.tsx/Context/mock lama tetap dipertahankan. resources/js/services/api dipindah ke legacy/api; variabel Sanctum/REST tidak lagi konfigurasi web aktif. Hapus api.php placeholder, tidak ada shell catch-all.
- Arsipkan kontrak REST; API.md pengarah kompatibilitas. README/guide/setup/architecture/contract/checklist/fitur auth+telelayanan serta20file fitur mengenai transport diselaraskan. Semua Markdown proyek selain README root tetap docs/.

## Hasil pemeriksaan

Composer validate/check-platform-reqs dan npm ls --depth=0 sukses. TypeScript tsc --noEmit tanpa diagnostik; syntax34filePHP valid. Artisan route:list menunjukkan10entry: beranda, login GET/POST, logout POST, redirect dashboard, tiga workspace, preview lokal, health. Tidak ada route Sanctum/API/devtools/catch-all. Package discovery selesai setelah dependency berubah.

Pemeriksaan struktur:70Markdown di docs, README satu-satunya Markdown root, nol link lokal/wiki/import relatif/nama page putus;76source React asal tetap terlacak dan tidak ada perubahan di luar daftar yang direncanakan. Snapshot hash/diagnostik teknis di .codex-tmp bukan sumber bisnis.

## Belum dikerjakan dan kelanjutan

Tidak menjalankan Git, browser/dev server/build/test suite/migration/seeding. Database/akun belum dibuat sehingga login nyata belum diuji; aset Vite/manifest belum dibuat. Pemeriksaan ini bukan uji transaksi atau jaminan aplikasi siap produksi.

Berikutnya implementasikan schema/domain dan ownership per fitur, provisioning aman satu owner, register/Google/reset/revoke-all, kemudian ganti sumber mock pada halaman fitur yang dimigrasi. Jangan mencampur mutasi mock/backend. Siapkan DB/provider/deployment dan verifikasi render/integrasi setelah developer mengizinkan. Pertahankan batas Admin tanpa saldo/agregat paid/klinis, Guest tanpa harga, PAPER offline, ledger, clock/SLA dan outbox sesuai kontrak. HTTPS diperlukan untuk history encryption; penyesuaian lokal ada di SETUP.

Tidak perlu meminta persetujuan migrasi Inertia lagi; sudah diberikan. Scope implementasi domain lanjutan tidak boleh dilaporkan selesai hanya karena fondasi telah tersedia.

---

## Arsip sebelum persetujuan migrasi Inertia

Bagian berikut mempertahankan keadaan/keputusan pada saat dicatat. Rujukan transport dan status setup terdahulu digantikan bagian terbaru di atas; keputusan bisnis tetap mengikuti kontrak aktif.

# Handoff terbaru — 20 Oktober 2026

## Analisis berikutnya: satu proyek melalui route web
Permintaan terbaru hanya evaluasi, jangan menganggap pertanyaan sebagai persetujuan migrasi. Source routing/App/Context/controllerTS/mockclient/servicefetch ditelaah statis; sumber Laravel13, Inertia3, React dan OWASP dibaca. Rekomendasi: Laravel+React+Inertia pada web.php untuk kebutuhan web saat ini; endpoint JSON internal masih boleh bila perlu. Arsitektur kode/dependency belum diubah dan tidak menjalankan aplikasi/test/dev/build/Git. Laporan: audits/ANALISIS_ARSITEKTUR_WEB_2026-10-20.md. Jangan menghapus kontrak/aturan API atau menimpa UI Eko tanpa keputusan lanjut.

## Selesai: penataan dan setup awal
- Izin terbaru mencakup struktur docs/root serta setup Laravel/pemindahan React; larangan Git/dev/build/test tetap berlaku. Aturan agent dipindahkan ke docs/AGENTS.md; hanya README.md yang merupakan Markdown root.
- docs utama langsung root docs; features/,actors/,journeys/,audits/,references/,archive/ satu tingkat. PDFs dipindah tanpa mengubah isi, ide awal disalin dari Downloads agar rujukan portabel. README/index/konfigurasi Obsidian lama di archive; Live Docs/Psikolog tidak ada lagi. Referensi Markdown/Obsidian dinormalisasi ke path baru.
- Laravel13.37.0/Sanctum4.3.3 terpasang via Composer dist, root_version ditetapkan saat command dan source-fallback=false agar tidak memakai Git. React19.3.0/Vite8.3.4 via npm; dependency/build tools dirapikan. composer.lock/package-lock.json tersedia.
- React76file dipindah, main/CSS menyesuaikan lokasi, metadata index.html menjadi Blade + @viteReactRefresh/@vite. Komponen/context/mock/model/controller tidak direfactor. HTTP service nyata kini cookie/CSRF tanpa bearer; UI mock belum dihubungkan ke backend.
- app/bootstrap/config/database/public/routes/storage/tests memakai struktur Laravel; users UUIDv4/password_hash, enum role/status, FK sessions UUID. APIprefix /api/v1 kosong untuk implementasi kontrak; health /up, Sanctum CSRF dan React shell telah terdaftar. Disk privat tidak menerbitkan route storage otomatis.
- .env lokal/APP_KEY dibuat tanpa menampilkan nilainya. Tidak ada migrasi/seed, akun demo atau database baru. SESSION/CACHE file lokal, target MySQL/queue database disiapkan pada .env.example.

## Validasi aktual
Pemindahan awal membandingkan hash76file; pemeriksaan akhir hanya empat file frontend berubah sesuai rencana (entry/CSS/client/authService), tanpa perubahan lain. RootMarkdown hanyaREADME;66Markdown di docs, tanpa link lokal eksternal/putus, wiki link tersisa atau import relatif React putus. Composer validate/check-platform-reqs sukses, npm ls valid, import modul Vite/Laravel-Vite/React/Tailwind sukses,25filePHP syntax sukses. Artisan package discovery/keygenerate/versi dan route:list sukses. Route akhir: /up, sanctum/csrf-cookie dan web shell; tidak ada endpoint bisnis palsu.

## Batas dan langkah berikutnya
Tidak menjalankan Git, migration, test suite, dev server atau build. Tanpa manifest/aset Vite halaman utama belum diverifikasi/render; ini dicatat di SETUP.md. Langkah berikutnya backend bisnis/penyatuan mock setelah developer meminta, database/migrasi dan build/test setelah diizinkan. Placeholder praktik/durasi belum diisi. Source/cache instalasi sementara berada di .codex-tmp yang di-ignore; tidak menjadi sumber aturan. Catatan docs-only19Oktober di bawah bersifat historis.

---
# Handoff audit dokumen — 19 Oktober 2026
## Hasil audit ulang setelah pilihan B
I25–I27 ditangani. Jawaban developer terbaru: profiling offline kertas langsung ke Superadmin, Admin pendataan administratif/pembayaran. appointments.profiling_mode DIGITAL/PAPER ditambahkan; PAPER offline oleh petugas tanpa submission/upload kertas, online DIGITAL ditulis pasien/penanggung jawab. Tidak ada pengecualian akses answers untuk Admin. Perbarui F06/F07, API/schema, role, aktor/journey, panduan/checklist dan aturan. Selaraskan field F05/F10/F13 serta template penutupan invoice; endpoint revisi/revoke/withdraw lengkap dan UNIQUE(supersedes_id) mencegah fork revisi.
Inspeksi docs saja:61Markdown,20fitur dengan10bagian lengkap, tautan dalam docs valid,46tabel tanpa judul/kolom ganda/targetFKbariskolom tak terdefinisi. Tujuh referensi lokal keluar docs tidak diperiksa. Tidak ada konfirmasi aturan tertunda yang teridentifikasi pada audit ini; data praktik/durasi dan peninjauan default sebelum aktivasi tetap kelengkapan. Tidak menjalankan source/aplikasi/test/build/Git.

## Audit integrasi setelah pertanyaan konsistensi menyeluruh
I01–I24 telah ditangani pada dokumen. Developer memilih B: pasien langsung booking Psikoterapi pertama, transaction membuat plan administratif ACTIVE4unit + appointment/invoice sesi1 saja. Jadwal lanjutan Admin sesuai praktisi; clinical_objective tetap owner. F11/F06, journey/pasien, role, aturan, API/schema, backend spec, guide/checklist dan audit diperbarui. Tambahan schema active_plan_guard VARCHAR(73) generated + UNIQUE per pasien/paket ACTIVE; retry/rollback/konflik terdokumentasi. Lock alokasi plan berada sebelum appointment. Rangkaian aktif/terminal yang sudah ada diarahkan ke Admin/owner; sesi5 tidak lolos tanpa extend. Tidak ada lagi pertanyaan tertunda untuk I24.
Inspeksi teks terbaru:20fitur lengkap bagian, tautan lokal valid,46tabel tanpa kolom ganda/targetFKkolom tak terdefinisi; tipe FKUUID sesuai. Tidak menjalankan aplikasi/migration/test/build. Angka ini tidak membuktikan data runtime bersih.
Gunakan EKO_PROJECT_GUIDE.md dan AUDIT_INTEGRASI_DOKUMEN_2026-10-19.md sebagai pintu baca terbaru; docs/README.md ditambahkan. Konfirmasi manusia baru: sisa tidak ditagih jika layanan belum dimulai dan booking batal/hak no-show berakhir; penerimaan aktual tetap. Schema/API/F08 memakai CLOSED_UNSERVED + UNSERVED_BALANCE_RELEASE, bukan menghapus kas atau melabeli net0 sebagai PAID.
Sinkronkan implementasi kelak dengan row_version common (bukan version konten), canonical claimed_amount/PLUS-MINUS, counter derived, clock pembayaran case untuk follow-up, requires_resolution request teknis expired, progres unit resolved versus layanan completed, export dataset_snapshot dan unique guards BASE/CMS. Endpoint detail/read/config/audit/expense-attachment/resolve-plan dilengkapi. Consent membedakan penerima nyata dari Admin pencatat. Jangan menggunakan JSON/nama kolom lama pada bagian arsip.
Scope tetap docs saja; source/aplikasi/test/build/Git tidak dijalankan. Checklist struktur tidak membuktikan integrasi source benar; hasil inspeksi teks dicatat pada audit terbaru.

## Scope dan larangan
Docs saja. Jangan cek/ubah source atau menjalankan Git, aplikasi, checker, test/build tanpa instruksi baru.
## Selesai pada kontrak dokumentasi
Pembaruan paling akhir: kelebihan bayar ditangani di luar sistem, tanpa status/tiket resolusi; catatan uang aktual tetap. F20 Telelayanan Google Meet ditambahkan: Admin isi link -> save/outbox -> otomatis WA Baileys pasien, termasuk status gagal/resend, revisi/attempt, penerima tanpa akun dan kehadiran online manual. Kontrak katalog, akses, API dan schema diselaraskan.
Pembaruan terakhir: dasar additional time Konseling menjadi pengaturan Admin/Superadmin pada versi paket (NORMAL_PRICE/FINAL_PRICE setelah promo saat booking). Field, preview API, permission, validasi sebelum bookable dan snapshot historis sudah dijelaskan. Tidak perlu menunggu developer memilih satu basis global.
Diselaraskan aturan, role,4aktor/4journey,F01–F20,API,kamusdata,kalender,formatinvoice serta petunjuk Eko. F18 asesmen, F19 pengeluaran dan F20 Telelayanan ditambahkan.
Admin: harga/diskon/total boleh, saldo/aggregatepaid/receiptpenuh tidak. Nominal input/bukti aktif untuk pemeriksaan; finance hanya owner. Kedatangan wajib verifikasi/penagihanoffline/inputaktual.
Diskon global/individual dipulihkan. Additional time hanya Konseling,total perusaha; invoiceaddendum tidak mengubah receipt. Reschedule requested_at, recoveryNO_SHOW,hak4hari/3kali, clinicchangebebaskuota, hasilasesmenoffline dan retensi diselaraskan.
Kamusdata memakai UUIDCHAR36,Rupiahinteger,UTC/WIB, relasibillingtanpacycle, index dan locking. Legacy API/schema menjadi pointer, contoh kontradiktif diganti.
## Lanjutan
Inspeksi teks terbaru selesai: 20 fitur lengkap bagian template, tautan lokal valid, 46 tabel domain tanpa target FK tak terdefinisi. Tidak ditemukan sisa aturan aktif Telelayanan ditunda/lebih bayar belum diputuskan; kolom resolusi kelebihan bayar dihapus. Belum ada validasi implementasi.

Tidak perlu menanyakan kembali penggunaan kelebihan bayar atau kanal Telelayanan: sudah diputuskan eksternal dan Google Meet/WA. Implementasi belum dilakukan; isi data praktik, nomor Baileys dan durasi paket lain sebelum bookable. Defaultoperasional grace15menit/window24jam diberi label konfigurabel.
Lakukan pemeriksaan statis link/heading/status pada Markdown; jangan menyebutnya hasil test runtime. Implementasi Laravel/React dikerjakan kemudian.
## Rujukan
AUDIT_PENYELARASAN_ATURAN_2026-10-19.md memetakanR01–R32. DECISIONS bagian terbaru memisahkan keputusan manusia dan desain. Audit/handoff di bawah bersifat historis.

---
# Arsip handoff terdahulu

# Session Handoff

## Terbaru — audit aturan dokumen 2026-10-19

Scope sesi ini hanya dokumentasi. Tidak membaca source aplikasi atau menjalankan Git/aplikasi/test/build. Audit R01–R32 disimpan di [AUDIT_ATURAN_DOKUMEN_2026-10-19](audits/AUDIT_ATURAN_DOKUMEN_2026-10-19.md), terpisah dari audit kesiapan implementasi lama.

- Developer menetapkan deadline pembayaran/hold `min(booking_created_at + 24 jam, start_at)`; F06, kalender, journey, alur umum, dan checklist Eko diperbarui. SLA 12 jam tidak berubah.
- Defect teks yang jelas diperbaiki: reschedule tidak kembali PENDING, login single-email lama, actor_id dari session, larangan booking non-bookable, laporan asesmen termasuk, serta status klinis completed tidak menghalangi pencatatan biaya terpisah.
- Masih menunggu jawaban pada pertanyaan async: cakupan kategori additional time dan kebijakan akses nominal Admin. Jangan menerapkan pilihan yang belum dijawab.
- Belum semua R02–R31 selesai. Beberapa memerlukan keputusan bisnis, yang lain adalah pelengkapan spesifikasi teknis dan contoh dokumen. Jangan mengklaim dokumen telah sinkron/aman seluruhnya.
- Pekerjaan berikutnya tetap dokumentasi: tutup alur bukti ditolak/no-show/reschedule tertunda, tetapkan durasi serta batas pertemuan paket, tulis perubahan tagihan setelah tambahan biaya, dan seragamkan kamus data/API.

## Tanggal

2026-10-06

## Instruksi Aktif

- Gunakan Bahasa Indonesia.
- AI dilarang melakukan seluruh operasi Git.
- Jangan menjalankan `npm run dev` atau `npm run build`.
- Test/build hanya dijalankan bila developer memberi izin.
- Dokumentasi aktif hanya berada di `docs/Psikolog/Live Docs` dalam vault Obsidian `docs/Psikolog`.

## Keputusan Final

- Frontend: React/Vite TypeScript SPA.
- Backend: Laravel 13 REST API terpisah.
- Database: MySQL 8+.
- Scope konsultasi: tatap muka; tidak ada ruang chat atau telekonsultasi web.
- Scope screening: pre-test profiling sebelum booking, bukan DASS dan bukan diagnosis.
- Role tertinggi adalah psikolog/pengelola. Admin hanya menjalankan fungsi operasional yang telah dibatasi.
- WhatsApp menjadi kanal notifikasi utama; email hanya fallback/dokumen.

## Kondisi Frontend

- Fitur role pasien, admin, dan psikolog tersedia sebagai prototype mock/LocalStorage dengan prefix `jiwasehat_v3_`.
- Architecture Blueprint, `viewMode`, modul DASS/test psikolog, dan paket/logic telelayanan telah dihapus dari source aktif.
- Migrasi LocalStorage cleanup v5 membersihkan state test/SOAP, paket telelayanan, tarif profil lama, dan field appointment legacy.
- Harga layanan hanya berasal dari paket; field tarif online/offline pada profil psikolog telah dihapus.
- Logo, avatar, dan preview aset CMS memakai fallback bila URL gambar gagal dimuat.
- Dashboard role menggunakan lazy loading. Penulisan LocalStorage didebounce untuk mengurangi beban render.
- Paket Berjalan memakai tabel desktop dan kartu mobile. Psikolog dapat menjadwalkan sesi lanjutan bertahap atau menghentikan paket dengan alasan.
- Guard paket menolak sesi tambahan ketika selesai/dihentikan atau ketika sesi aktif berikutnya sudah ada.
- Booking/reschedule memakai lock sementara per psikolog/tanggal, sinkronisasi antar-tab, validasi H+1, jam kerja, hari libur, kuota, durasi, dan overlap.
- Web Locks API menjadi lock lintas-tab utama dengan fallback LocalStorage. Booking walk-in admin dapat mendaftarkan pasien baru tanpa pre-test awal, tetapi tanggal konsultasi tetap minimal H+1.
- Harga, diskon, total akhir, dan DP booking dihitung ulang dari paket aktif; komponen UI tidak menentukan nominal final.
- Guard role, ownership, dan transisi status telah diterapkan pada seluruh action facade sensitif di `AppContext`.
- Riwayat pasien, reservasi admin, dan riwayat aksi psikolog memiliki kartu khusus mobile selain tabel desktop.
- Opsi waktu walk-in dan reschedule pasien/admin dihitung dari availability engine yang sama dengan validasi submit.
- Review hanya dapat dibuat setelah appointment `COMPLETED` dan maksimal satu review aktif per appointment.
- Admin user monitoring bersifat read-only. Admin tidak memiliki complete, cancel, no-show, delete, atau discontinue.
- Admin dapat konfirmasi booking/DP, mencatat pelunasan aktual satu arah, membantu reschedule dengan audit trail, dan mencetak receipt administratif tanpa melihat harga paket.
- Laporan psikolog menghitung DP terverifikasi dan pelunasan aktual sebagai uang masuk, tanpa biaya/laba dan tanpa duplikasi dari sesi lanjutan.

## Kesiapan API Frontend

- HTTP client tersedia di `resources/js/legacy/api/client.ts` dengan base URL env, bearer token/Sanctum cookie, CSRF opsional, timeout, error validasi, pagination, upload, dan download Blob.
- Service tersedia untuk auth, user, paket, appointment, jadwal, pre-test, treatment plan, finance/export, review, CMS, dan notifikasi.
- `.env.example` sudah mengarah ke `http://localhost:8000/api/v1` dan menyediakan opsi Sanctum CSRF.
- Service belum dihubungkan ke `AppContext` karena backend belum tersedia. Mock/LocalStorage tetap menjadi sumber data runtime prototype.

## Pekerjaan Tersisa

- QA manual seluruh role pada desktop dan ponsel nyata, termasuk lebar 320/375/430 px.
- Verifikasi print receipt/PDF A4 dan laporan pada browser nyata.
- Profiling performa dan audit loading/error/empty state saat integrasi async.
- Menetapkan kebijakan no-show/cancel/refund dan dampaknya terhadap jatah sesi paket.
- Menetapkan mode Sanctum, kebijakan login produksi, provider WhatsApp, serta format invoice final.
- Membangun Laravel 13, migration MySQL 8+, policy role, storage privat, transaction/row lock booking, audit log, queue notifikasi, dan automated test.
- Mengalihkan context/controller dari mock ke service API secara bertahap setelah kontrak response backend tersedia.

## Verifikasi Sesi Ini

- Seluruh dokumen live docs (`TODO.md`, `DECISIONS.md`, `CHANGELOG.md`, `SESSION_HANDOFF.md`) telah disinkronkan 100% dengan status implementasi revisi terkini di source code.
- Bug desinkronisasi/ke-undo pada `TODO.md` telah diperbaiki tuntas dengan pengkategorian tugas yang jelas dan tanda `[DONE]`.
- Pengetikan TypeScript (`npx tsc --noEmit`) lolos dengan **0 error (exit code 0)** setelah penambahan definisi `vite-env.d.ts` dan perbaikan narrowing `paymentStatus` di `AppContext.tsx`.
- Hardening frontend terbaru telah diperiksa ulang dengan `npx tsc --noEmit` dan lolos 0 error.
- Audit runtime visual tetap perlu dilakukan developer karena dev server/build tidak dijalankan pada sesi ini.
- `npm run dev` dan `npm run build` tetap tidak dijalankan sesuai batasan `AGENTS.md`.

## Referensi Utama

- [TODO](TODO.md)
- [API](API.md)
- [ARCHITECTURE](ARCHITECTURE.md)
- [DATABASE](DATABASE.md)
- [BUSINESS_RULES](BUSINESS_RULES.md)
- [ROLES_PERMISSIONS](ROLES_PERMISSIONS.md)
- [LARAVEL_API_SPEC](LARAVEL_API_SPEC.md)
- [BACKEND_PACKAGE_AND_TREATMENT_PLAN_SPEC](BACKEND_PACKAGE_AND_TREATMENT_PLAN_SPEC.md)

## Tambahan handoff — 2026-10-18

### Pekerjaan sesi audit

- Membaca `AGENTS.md` dan `README.md` root, seluruh 26 file di `docs` sebelum penambahan laporan (19 Markdown, 2 PDF, 5 konfigurasi JSON Obsidian), serta dokumen ide developer di Downloads.
- Membandingkan aturan/scope kedua rancangan dan PDF, kemudian menelusuri source relevan pada context, controller, mock endpoint, service HTTP, jadwal, pembayaran, booking, riwayat, paket berjalan, auth, dan laporan.
- Membuat [AUDIT_PERBANDINGAN_DESAIN_2026-10-18](audits/AUDIT_PERBANDINGAN_DESAIN_2026-10-18.md), menambahkan catatan audit di [KNOWN_ISSUES](KNOWN_ISSUES.md) dan [DECISIONS](DECISIONS.md). Source aplikasi dan dokumen asli di Downloads tidak diubah.

### Temuan prioritas

- Pelunasan kurang bayar dapat dianggap lunas; status/nominal payment pada sesi lanjutan perlu dipisahkan dari induk tagihan.
- Reschedule pasien dengan DP terverifikasi dapat buntu saat konfirmasi ulang; receipt dapat telanjur menyatakan sukses.
- Appointment dan flag slot menyimpan okupansi yang berbeda; flag lama tidak dilepas saat reschedule/cancel.
- Laporan kas mengikuti tanggal sesi dan dapat berubah karena reschedule; pre-test historis ditimpa per pasien; ID user dari empat digit timestamp dapat berulang.
- Kontrak API/schema/DTO belum sepenuhnya sama; spec Laravel aktif masih memuat DASS yang di luar scope.
- Desain developer belum boleh dianggap menggantikan baseline Eko. Perlu keputusan bersama tentang DP, paket/per-sesi, pemesan/pasien, lifecycle/role, reschedule/hold/SLA/exception, keuangan, dan arsitektur.

### Batas verifikasi dan kelanjutan

- Tidak menjalankan Git, aplikasi, test/checker, dev server, atau build. Semua hasil berupa audit statis dan skenario; dugaan concurrency belum direproduksi.
- Pernyataan sinkron 100% dan hasil checker pada bagian sesi 6 Oktober merupakan catatan historis, bukan verifikasi ulang sesi 18 Oktober.
- Lanjutkan dari matriks keputusan dan acceptance scenario di laporan. Jangan melakukan perubahan requirement massal atau mengimplementasikan rekomendasi audit tanpa scope lanjutan dari developer.

## Tindak lanjut tanggapan developer — 2026-10-18

- Requirement pembayaran/saldo, pelepasan slot lama, periode kas yang tetap dengan relasi ke booking/jadwal, dan riwayat pre-test telah dikonfirmasi developer dan diperbarui pada dokumen konteks/aturan/fitur/data/API terkait. Perilaku runtime keempat area belum diubah.
- B07 diperbaiki langsung pada `resources/js/utils/identifiers.ts`, `resources/js/context/AppContext.tsx`, `resources/js/api/authEndpoints.ts`, `resources/js/components/admin/tabs/ReservationsTab.tsx`, dan `resources/js/components/auth/LoginModal.tsx`: ID pasien baru UUID v4 dan email helper pasien baru tidak berulang setiap satu detik. Data/ID lama tetap dipertahankan; tidak ada klaim perbaikan relasi lama.
- [ALUR_PENGGUNA_DAN_PENYELARASAN_SISTEM](ALUR_PENGGUNA_DAN_PENYELARASAN_SISTEM.md) menjadi referensi UX empat role, studi kasus reschedule buntu/hold-SLA, riwayat pembayaran/pre-test, dan rekomendasi pembagian frontend/API/backend.
- Superadmin adalah satu owner/praktisi dan stakeholder; Admin adalah pekerja administrasi/pembayaran. `PSYCHOLOGIST` tetap enum kode untuk Superadmin; tidak ada migrasi permission/role massal.
- Saran mempertahankan React melalui Laravel API belum merupakan keputusan migrasi arsitektur. Lifecycle reschedule dan angka deadline hold/SLA masih memerlukan keputusan.
- Tidak menjalankan Git, aplikasi, checker/test, dev server, atau build. Pemeriksaan perubahan ID dan dokumentasi hanya statis.

## Konfirmasi requirement 2026-10-19

- Laravel final: **Laravel 13**, PHP minimal 8.3, REST API `/api/v1`, React/Vite frontend, MySQL 8+.
- Harga publik baru muncul setelah Guest login sebagai Pasien.
- Psikoterapi mengikuti PDF: Rp500.000 per sesi, minimum empat sesi. Payment timing masih perlu policy.
- Asesmen Dasar bernilai satu paket Rp350.000 yang mencakup testing dan evaluasi; appointment dapat dipisah dan ditambahkan Admin pada assessment case yang sama.
- Overtime 25% per 15 menit dan surat laporan Rp200.000 dicatat sebagai add-on/line item dari PDF.
- Admin direkomendasikan check-in administratif; complete/no-show/cancel klinis tetap Superadmin/praktisi secara default.
- WhatsApp backend memakai Baileys; retry/dedupe/session/opt-in/payload minimal perlu implementasi.
- Retensi awal bukti pembayaran, file terkait, backup, dan restore snapshot adalah 1 tahun.
- [EKO_IMPLEMENTATION_CHECKLIST](EKO_IMPLEMENTATION_CHECKLIST.md) menjelaskan DTO, payment ledger, reschedule, pre-test versioning, upload private, timezone, dan enum transisi yang harus diikuti frontend.

## Dokumentasi fitur dan satu VPS — 2026-10-18

- Source Eko tidak diubah pada sesi dokumentasi ini.
- Struktur baru: [DOCS_ARCHITECTURE](DOCS_ARCHITECTURE.md), `actors/`, `journeys/`, `features/` F01–F16, [API_BOUNDARY](API_BOUNDARY.md), [OPERATING_WINDOW_AND_BOOKING_CUTOFF](OPERATING_WINDOW_AND_BOOKING_CUTOFF.md), dan [DATABASE_ARCHITECTURE](DATABASE_ARCHITECTURE.md).
- Topologi rekomendasi: satu VPS, React build dan Laravel API pada domain yang sama, MySQL/private storage/queue sesuai kebutuhan.
- Aturan operasional baru: hold online 24 jam sejak booking; enam jam kerja Admin sebelum slot online; walk-in Admin same-day membutuhkan slot kosong dan persetujuan Superadmin.
- Reschedule mempunyai request status tersendiri; payment tidak berubah karena reschedule; slot lama hanya dilepas setelah slot baru berhasil diamankan.

## Koreksi katalog PDF — 2026-10-19

- `features/F04_PACKAGE_CATALOG.md` sekarang menjadi sumber katalog tiga kategori: Konseling, Asesmen, dan Psikoterapi, dengan seluruh service item dan harga dari PDF.
- Asesmen dimodelkan sebagai layanan tes (IQ/inteligensi, kepribadian, anak/remaja, dewasa), bukan terapi. Asesmen Dasar memiliki appointment testing dan evaluation dalam satu assessment case.
- Treatment plan dibatasi untuk Psikoterapi; harga Rp500.000 per sesi dengan minimum empat sesi.
- Admin dapat memasukkan additional time sebagai jumlah menit; backend menghitung line item 25% tarif dasar per blok 15 menit.
- Database/API docs sekarang mencakup `assessment_cases`, `assessment_case_appointments`, `assessment_reports`, `billing_line_items`, dan `additional_time_entries`.
- Telelayanan sudah diputuskan tetap masuk katalog, sedangkan detail service/kanalnya ditunda. Asesmen Dasar kini satu harga dengan appointment testing/evaluation/follow-up yang dapat dipisah; Asesmen Lengkap default 4 jam dengan deskripsi 2–4 jam; additional time dibulatkan ke atas; dan surat formal Rp200.000 dipisahkan dari hasil laporan paket.

## Audit ulang kontrak — 2026-10-19

- Kontradiksi walk-in H+1 pada dokumen lama sudah ditandai historis; baseline sekarang mengizinkan Admin same-day jika slot kosong, sementara booking online pasien tetap H+1.
- Assessment case memakai satu billing account dan mencegah line item dasar ganda pada appointment evaluation/follow-up.
- F17 mendokumentasikan fleksibilitas Admin untuk pendaftaran, jam klinik, override slot, biaya kustom, dan appointment lanjutan.
- Sebelum migration, minta keputusan tentang invoice psikoterapi per sesi, kalender klinik versus kalender Admin, expiry bukti menunggu verifikasi, participant/guardian, authority reschedule setelah lock, overpayment/refund, matriks DP antar kategori, dan metode pembayaran manual yang resmi.
- Source runtime masih mock/LocalStorage dan belum menerapkan kontrak baru; temuan runtime lama tetap berlaku sampai Laravel backend dan integrasi DTO selesai.

## Jawaban lanjutan audit — baseline terbaru

- Sudah dikonfirmasi: invoice psikoterapi per sesi; jam Admin = jam klinik; tanpa diskon; tanpa pengembalian dana; penanggung jawab default akun login.
- §15 dokumen ide sudah mengatur SLA 12 jam operasional dan auto-confirm booking dengan payment `PENDING_RECONCILIATION`. Ini berbeda dari cutoff enam jam pemilihan slot. Admin memeriksa saat check-in jika sesi lebih awal dari deadline SLA.
- Invoice lanjutan psikoterapi wajib terpisah per sesi. Jangan memakai aturan lama semua sesi lanjutan bernilai nol; hanya pertemuan asesmen yang termasuk paket berbagi satu billing account.
- Salah input nominal dan submit ganda bukan overpayment nyata. Selisih transfer berlebih disimpan sebagai `overpaid_amount`; tidak ada credit/refund otomatis.
- Laporan asesmen termasuk paket; laporan konseling yang diminta pasien menambah Rp200.000.
- Penyelesaian selisih overpayment masih menunggu keputusan pengguna setelah contoh kasus. Jangan menganggap credit telah disetujui.
- Tidak menjalankan Git, aplikasi, dev server, build, checker, test, atau migration. Hanya pemeriksaan teks dokumentasi.

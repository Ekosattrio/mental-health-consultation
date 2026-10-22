# Arsip Eko Sebelum Integrasi - SESSION_HANDOFF.md

Histori prototype, bukan aturan aktif. Gunakan [keputusan final](../KEPUTUSAN_FINAL_2026_10_22.md), [kontrak web](../WEB_CONTRACT.md) dan dokumen utama di docs/.

# Session Handoff

## Tanggal

2026-10-22

## Instruksi Aktif

- Gunakan Bahasa Indonesia.
- AI dilarang melakukan seluruh operasi Git.
- Jangan menjalankan `npm run dev` atau `npm run build`.
- Test/build hanya dijalankan bila developer memberi izin.
- Dokumentasi aktif hanya berada di `docs/Psikolog/Live Docs` dalam vault Obsidian `docs/Psikolog`.

## Keputusan Final

- Frontend: React/Vite TypeScript SPA.
- Backend: Laravel 12+ REST API terpisah.
- Database: MySQL 8+.
- Scope konsultasi: tatap muka dan telelayanan terjadwal; tidak ada ruang chat konsultasi di web.
- Scope screening: pre-test profiling sebelum booking, bukan DASS dan bukan diagnosis.
- Role tertinggi adalah psikolog/pengelola. Admin hanya menjalankan fungsi operasional yang telah dibatasi.
- WhatsApp menjadi kanal notifikasi utama; email hanya fallback/dokumen.

## Kondisi Frontend

- Panduan `PANDUAN_FITUR_PER_ROLE.md` diselaraskan dengan perbaikan source terbaru: profil navbar persist, label Admin Operasional, menu Profil Praktik desktop/mobile, tooltip dibatasi viewport, admin wajib memilih ulang jam yang hilang, dan hold expired tidak memblokir reservasi baru.
- Form reschedule membawa versi saat dibuka; perubahan oleh aktor lain membuat form usang ditolak di lock. Detail/receipt pasien menampilkan timeline lengkap. Backend tetap wajib conditional update/409 untuk jaminan antarperangkat.
- Audit CMS ada di `CMS_AUDIT.md`: field editor dan pembaca aktual, snapshot rekening pada hold, QRIS kasir, logo laporan, serta daftar FAQ/legal/SEO/branding yang masih statis. Footer, carousel, media landing, dan banner pasien sudah tersambung. CMS/profil praktik persist-before-success dan sinkron lintas-tab.
- Hold expired tidak dihapus atau dianggap membatalkan booking. Bukti terlambat dari tab lama tetap dapat dicocokkan admin; tidak mengembalikan fitur pelepasan manual pasien.
- Checkpoint terbaru 22 Oktober: `npx tsc --noEmit` exit 0 dan 36/36 tes regresi terfokus. Belum browser/mobile/print/E2E/backend. Git/dev/build tidak dijalankan. Isi kontak/rekening/logo/kredensial demo harus diganti dan diverifikasi pengelola sebelum publikasi.

- Sesuai arahan terbaru, panel Reservasi sebelumnya beserta tombol Lanjutkan reservasi/Lepaskan, belum membayar sudah dihapus dari `PatientDashboard`, termasuk facade `releaseBookingHold`. Penguncian slot dan pemulihan di Booking Konsultasi tetap internal; data hold/appointment/bukti tidak dibersihkan otomatis. Banner pencocokan pembayaran tidak diubah.

- Langkah 2 pre-test pada `BookingTab` dipadatkan: padding/heading kecil, identitas/kontak grid dua/empat kolom, keluhan checkbox dua/empat kolom, deskripsi/harapan berdampingan, dan footer ringkas. Field, handler, validasi, payload, serta reservasi tidak diubah. Indikator langkah menampilkan label aktif saja pada ponsel untuk menghemat lebar.

- Pembaruan 22 Oktober: `ServicePicker` menampilkan kartu satu baris horizontal dengan scroll-snap, panah, kategori beraksen, serta notes penuh tanpa klik. Rincian memakai native dialog. Search mencakup notes; filter/sort/pagination enam layanan dan pemilihan radio tetap tersedia. Tidak mengubah data layanan custom/legacy atau logic pembayaran.

- Fitur role pasien, admin, dan psikolog tersedia sebagai prototype mock/LocalStorage dengan prefix `jiwasehat_v3_`.
- Architecture Blueprint, `viewMode`, dan modul DASS/test psikolog telah dihapus dari source aktif.
- Migrasi LocalStorage cleanup v5 membersihkan paket telelayanan legacy lama, tarif profil lama, state test/SOAP, dan field appointment legacy.
- Migrasi LocalStorage `flat_dp_cleanup_v6` menghapus field DP lama dari paket tersimpan.
- Migrasi LocalStorage `service_catalog_v7` menyinkronkan 15 paket resmi terbaru, menambahkan telelayanan, dan menormalkan psikoterapi menjadi paket berjalan 4 sesi. Status aktif, diskon, dan paket custom yang sudah dibuat tetap dipertahankan.
- Migrasi LocalStorage `payment_reference_cleanup_v8` menghapus field nomor referensi pembayaran lama dari appointment tersimpan.
- Harga layanan hanya berasal dari paket; field tarif online/offline pada profil psikolog telah dihapus.
- Logo, avatar, dan preview aset CMS memakai fallback bila URL gambar gagal dimuat.
- Dashboard role menggunakan lazy loading. Sebagian state pendukung didebounce; workflow, users, paket, CMS, dan profil praktik memakai persistensi langsung sebelum sukses.
- Paket Berjalan memakai tabel desktop dan kartu mobile. Psikolog dapat menjadwalkan sesi lanjutan bertahap atau menghentikan paket dengan alasan.
- Guard paket menolak sesi tambahan ketika selesai/dihentikan atau ketika sesi aktif berikutnya sudah ada.
- Booking/reschedule memakai satu lock mutasi workflow lintas-tab, sinkronisasi state, validasi H+1, jam kerja, libur, kuota termasuk hold aktif, durasi, dan overlap.
- Web Locks API wajib untuk mutasi sensitif prototype; fallback lease LocalStorage telah dihapus. Walk-in dapat mendaftarkan pasien baru tanpa pre-test awal, tetapi tanggal tetap minimal H+1.
- Harga, diskon, dan total akhir booking dihitung ulang dari paket aktif. DP ditetapkan sistem secara flat Rp100.000 dan tidak dapat diedit per paket.
- Guard role, ownership, dan transisi status telah diterapkan pada seluruh action facade sensitif di `AppContext`.
- Riwayat pasien, reservasi admin, dan riwayat aksi psikolog memiliki kartu khusus mobile selain tabel desktop.
- Opsi waktu walk-in dan reschedule pasien/admin dihitung dari availability engine yang sama dengan validasi submit.
- Review hanya dapat dibuat setelah appointment `COMPLETED` dan maksimal satu review aktif per appointment.
- Admin user monitoring bersifat read-only. Admin tidak memiliki complete, cancel, no-show, delete, atau discontinue.
- Admin dapat konfirmasi booking/DP, mencatat pelunasan aktual satu arah, membantu reschedule dengan audit trail, dan mencetak receipt administratif tanpa melihat harga paket.
- Konfirmasi admin sekarang wajib melalui modal pemeriksaan bukti. Verifikasi tidak memakai checkbox pernyataan tambahan; admin dapat melihat preview gambar atau membuka PDF, menulis catatan opsional, lalu mengonfirmasi. Status pembayaran dan booking berubah secara atomik serta menyimpan audit admin.
- Pasien mengunggah file bukti JPG/PNG/WEBP/PDF pada prototype; admin dapat melihat preview atau membuka dokumen sebelum verifikasi.
- Nomor referensi transaksi telah dihapus dari seluruh alur pembayaran. Verifikasi memakai bukti pembayaran, nama pengirim, metode/channel, nomor booking, dan nomor invoice.
- Sesi lanjutan dipilih dari slot availability engine minimal H+1 setelah pembayaran paket terverifikasi dan sesi terakhir selesai. Input jam bebas pada modal sesi lanjutan telah dihapus.
- Psikolog tidak dapat menandai sesi selesai sebelum waktu appointment berakhir; treatment plan otomatis selesai ketika seluruh sesi selesai.
- Laporan psikolog menghitung DP terverifikasi dan pelunasan aktual sebagai uang masuk, tanpa biaya/laba dan tanpa duplikasi dari sesi lanjutan.
- Katalog resmi aktif memuat 5 paket Konseling, 9 paket Asesmen, dan 1 paket Psikoterapi. Telelayanan adalah paket 60 menit Rp750.000; psikoterapi adalah 4 sesi x Rp500.000.
- Form paket psikolog dapat mempertahankan/mengubah metode Konseling antara tatap muka dan telelayanan. Booking telelayanan menampilkan metode sesi, bukan alamat klinik.
- Audit mobile statis memperbaiki toast agar tidak menutupi konten di ponsel, dropdown profil, padding dashboard, footer modal/receipt, dan tombol aksi. Manajemen Paket, Data Pasien, Jadwal Mingguan, Monitoring User, Moderasi Review, dan Transaksi kini memiliki tampilan mobile khusus.
- Residu CRUD paket pada `AdminController/AdminEndpoints` telah dihapus. Operasi mock paket sekarang dimiliki `PsychologistController/PsychologistEndpoints` dan memakai kontrak route `/api/v1/packages` yang sama dengan service Laravel.

## Kesiapan API Frontend

- HTTP client tersedia di `src/services/api/client.ts` dengan base URL env, bearer token/Sanctum cookie, CSRF opsional, timeout, error validasi, pagination, upload, dan download Blob.
- Service tersedia untuk auth, user, paket, appointment, jadwal, pre-test, treatment plan, finance/export, review, CMS, dan notifikasi.
- `.env.example` sudah mengarah ke `http://localhost:8000/api/v1` dan menyediakan opsi Sanctum CSRF.
- Service belum dihubungkan ke `AppContext` karena backend belum tersedia. Mock/LocalStorage tetap menjadi sumber data runtime prototype.

## Progres Terbaru - 19 Oktober 2026

- Keputusan klien terbaru menggantikan fitur Tambah Sesi: psikoterapi Rp500.000 per sesi, rencana awal minimal empat sesi, lalu booking baru bila sesi kelima dan seterusnya diperlukan. Booking baru mempunyai kode, DP, dan ledger sendiri; rekam medis eksternal dapat meneruskan penomoran klinis.
- Aksi Tambah Sesi telah dihapus dari UI psikolog, context, type, dan API service. Migrasi LocalStorage v9 memperbarui harga katalog resmi. Admin masih dapat mencatat pembayaran parsial tanpa membaca kembali nominalnya; backend wajib memindahkan ledger ke database dan menerapkan Policy, transaksi, serta idempotency.
- Booking psikoterapi ulang ditolak bila rencana lama masih aktif. Pada walk-in psikoterapi, opsi lunas otomatis dimatikan; admin mencatat DP terlebih dulu, lalu pembayaran lanjutan setelah sesi pertama.
- `ACTIVITY_DIAGRAMS.md` berisi 23 gambar SVG berswimlane yang langsung tampil di Obsidian serta blok sumber PlantUML untuk revisi. Gambar harus di-render ulang jika sumber diubah.
- `FEATURE_FLOWS.md` kini menyematkan 23 SVG tersebut langsung pada tiap fitur dengan Markdown standar; tautan wikilink Obsidian yang tampil mentah di VS Code telah diganti.
- Kategori tetap Konseling, Asesmen, Psikoterapi. Telelayanan hanya booking dengan media pihak ketiga. Notes biaya tambahan tetap di paket. DP Rp100.000 mengurangi biaya pertemuan dalam setiap booking/rencana awal.

## Progres Terbaru - 21 Oktober 2026

- Pembatalan/penghentian hanya setelah lunas: helper `cancelPaidPlan` membaca ledger appointment pertama, menghentikan rencana, membatalkan seluruh sisa jadwal, dan mempertahankan histori completed/pembayaran. Admin dapat mencatat purpose pelunasan penghentian sebelum sesi pertama.
- Konfirmasi ulang jadwal terbayar dipisahkan dari verifikasi DP; histori reschedule/status disimpan sebagai daftar. H+1 dan waktu penyelesaian sesi memakai WIB.
- Booking menyimpan snapshot pre-test dan consent versi aktif; draft terbaru tetap per pasien untuk prefill. Form baru tidak menandai semua booking lama. Booking legacy tidak direkonstruksi otomatis.
- Persistensi pasien walk-in ditunda sampai booking sukses. Cache slot booked lama dibebaskan bila appointment sudah pindah/cancel. Service Laravel memakai DTO admin administratif dan binding draft/multipart booking.
- Tidak menambahkan reupload bukti sesuai keputusan developer. Pemeriksaan bukti yang belum cocok dilakukan manual dengan menahan konfirmasi.
- Perubahan belum diuji runtime; TypeScript checker kemudian diizinkan developer dan lolos pada 21 Oktober 2026. Kebijakan no-show pengganti/jatah, expiry pending, dan koreksi/refund masih belum diputuskan. Backend/QA tetap pekerjaan tersisa.

## Pekerjaan Tersisa Terkini

- Tujuh temuan audit sudah ditangani pada prototype: satu Web Lock workflow, snapshot persist-before-publish, hold sebelum instruksi transfer, CSRF cookie/header, pilihan jam stabil, modal berbasis ID terbaru, serta encoder CSV/HTML. Rincian ada pada status terbaru KNOWN_ISSUES; daftar audit lama bersifat historis.
- Aturan no-show dipastikan pada 22 Oktober: konfirmasi manual psikolog, boleh jadwal pengganti H+1 pada sesi yang sama tanpa DP lagi; tidak ada auto-cancel/auto-completed atau sesi tambahan. Default hold prototype 15 menit (`VITE_MOCK_HOLD_MINUTES`) tetap bukan keputusan TTL produksi/klien.

- Tindak lanjut audit: katalog `ServicePicker` dengan search/filter/sort/pagination; `PaymentProgress` pada pasien/psikolog; `initialPaymentRecord` dan nominal aktual walk-in; `receivedAt` pada pembayaran; proyeksi event kas untuk laporan/export; sinkronisasi katalog/expected-total guard; `findScheduleConflicts` sebelum Save; serta reset audit/ledger pada sesi baru sudah masuk source.
- `slotHoldService`/`paymentReconciliationService` adalah kontrak server, sedangkan runtime sudah memakai mock hold lokal. Bukti setelah expiry/quote berubah disimpan sebagai kasus OPEN, terlihat oleh pasien/admin, lalu admin memproses jadwal pengganti H+1 dengan nominal/tanggal aktual tanpa membaca kembali nominal tersimpan. Kasus BOOKED merujuk appointment, tidak menduplikasi uang masuk.
- Snapshot `jiwasehat_v3_appointments` kini envelope `{appointments, holds, walkInPatients, reconciliations}`. Array lama di-upgrade in-place tanpa key duplikat. `workflow_v1` eksperimental tetap dibaca bila ada. Reload semua tab saat upgrade; versi lama yang masih menulis array tidak boleh berjalan bersamaan.
- Semua mutasi workflow kritis memakai Web Locks; browser tanpa API tersebut menolak mutasi, bukan memakai lease tidak atomik. Tidak ada lagi debounce appointment. Controller booking/pre-test hanya menyiapkan hasil; facade menyimpan dulu, baru memperbarui state/toast.
- Masih terbuka: QA browser/mobile/A4, pengujian session Sanctum nyata, keamanan data produksi, integrasi API, dan locking antarperangkat. Tes logika menggunakan Storage/LockManager simulasi, bukan bukti E2E/native browser.
- Laporan modern memakai tanggal penerimaan, bukan tanggal konsultasi. Data legacy tanpa tanggal pasti memakai tanggal verifikasi/pencatatan/pembuatan sebagai estimasi berlabel, tidak diklaim sebagai tanggal kas yang pasti.

- QA manual seluruh role pada desktop dan ponsel nyata, termasuk lebar 320/375/430 px.
- Uji workspace pratinjau/ekspor dokumen pada ponsel nyata; format kertas dan hasil cetaknya memang tidak diubah menjadi kartu.
- Verifikasi print receipt/PDF A4 dan laporan pada browser nyata.
- Profiling performa dan audit loading/error/empty state saat integrasi async.
- QA tindak lanjut manual no-show serta menetapkan koreksi/refund terpisah. Cancel tetap menghentikan seluruh sisa rencana setelah lunas.
- Menetapkan mode Sanctum, kebijakan login produksi, provider WhatsApp, serta format invoice final.
- Menetapkan provider/media telelayanan dan mekanisme tautan sesi aman dari backend.
- Meminta keputusan klien tentang scope mesin asesmen, jatuh tempo cicilan, dan bukti persetujuan pasien secara independen.
- Membangun Laravel 12+, migration MySQL 8+, policy role, storage privat, transaction/row lock booking, audit log, queue notifikasi, dan automated test.
- Mengalihkan context/controller dari mock ke service API secara bertahap setelah kontrak response backend tersedia.

## Verifikasi Sesi Ini

- Checkpoint terkini setelah perbaikan audit role/CMS: TypeScript exit 0 dan 36/36 tes regresi terfokus. Pengujian memakai helper, storage/lock simulasi, dan render statis, bukan QA browser. Catatan di bawah adalah riwayat checkpoint sebelumnya.

- Pembuatan awal panduan role hanya audit source/dokumentasi. Setelah developer meminta perbaikan, source diubah sebagaimana Kondisi Frontend di atas.

- Setelah penghapusan panel reservasi pasien: `npx tsc --noEmit` exit 0 dan 25/25 tes regresi lolos. Pencarian source memastikan panel/tombol dan facade pelepasan manual tidak lagi dipakai. Belum QA browser; tidak menjalankan dev/build/Git.

- Pemadatan pre-test hanya perubahan layout/semantik kontrol. QA visual/interaksi form belum dilakukan; suite regresi yang tersedia tidak mencakup klik form pre-test. Jangan menyebutnya lolos UAT/browser hanya karena checker dan regresi lain lolos.
- Checkpoint setelah pemadatan pre-test: TypeScript exit 0 dan 25/25 tes regresi terfokus lolos pada 22 Oktober 2026. Tidak menjalankan Git, dev server, atau build.

- Checkpoint setelah perapian katalog: TypeScript exit 0 dan 25/25 tes lolos. Tiga tes render statis memeriksa notes langsung terlihat, katalog 15 item/pagination, serta tarif per sesi/diskon/profil terkunci. Belum QA visual atau interaksi swipe/dialog browser. Dev/build/Git tetap tidak dijalankan.
- QA berikutnya: carousel di 320/375/430 px dan desktop, navigasi panah/swipe/keyboard, fokus dialog/Escape, notes panjang, serta pilihan yang berada di halaman katalog lain. Guard expected version kini sudah diterapkan pada prototype; backend dan QA interaksi konflik tetap diperlukan.

- 22 Oktober 2026: menambahkan policy reschedule bersama dan ikon jadwal pengganti pada Riwayat Sesi/Paket Berjalan psikolog. Hanya psikolog yang menangani dapat mengembalikan `NO_SHOW -> CONFIRMED`; appointment/nomor sesi/ledger sama, histori ketidakhadiran tetap ada. Slot/kuota/H+1 diperiksa di dalam lock. Rencana terminal dan sesi lain yang sudah berjalan tidak boleh dibuka lewat jalur ini.
- DP hanya di awal booking/rencana; reschedule tidak menambah DP. Service `rescheduleByPsychologist` menyiapkan kontrak Laravel; runtime tetap mock.
- Activity diagram 12 (reschedule) dan 13 (pelaksanaan konsultasi) sudah diselaraskan, kedua SVG di-render ulang dan XML valid. Pemeriksaan ini bukan QA interaksi/visual browser.
- Checkpoint saat perbaikan no-show: `npx tsc --noEmit` exit 0, `npx tsx --test tests/frontend-regressions.test.ts` 22/22 lolos. Lima tes baru menguji policy/ledger/hak akses/H+1, bukan interaksi browser. Tidak menjalankan dev/build/Git.

- Dokumen aktif telah diperbarui berdasarkan peninjauan statis perubahan flow. Ini belum menyatakan seluruh fitur lulus QA runtime.
- Checkpoint saat audit 21 Oktober: `npx tsc --noEmit` exit 0; `npx tsx --test tests/frontend-regressions.test.ts` 17/17 lolos setelah izin eksplisit developer.
- Tes mencakup antrean transaksi, booking/pembayaran paralel, storage penuh, upgrade data, jam reschedule stabil, hold/expiry/rekonsiliasi, CSRF cookie, encoder ekspor, nominal FULL, overlap, H+1, dan controller yang tidak mempublikasikan sukses sebelum commit. Belum ada E2E/QA browser. Build dan dev server tidak dijalankan.
- Audit runtime visual tetap perlu dilakukan developer karena dev server/build tidak dijalankan pada sesi ini.
- `npm run dev` dan `npm run build` tetap tidak dijalankan sesuai batasan `AGENTS.md`.

## Referensi Utama

- [[TODO]]
- [[API]]
- [[ARCHITECTURE]]
- [[DATABASE]]
- [[BUSINESS_RULES]]
- [[ROLES_PERMISSIONS]]
- [[LARAVEL_API_SPEC]]
- [[BACKEND_PACKAGE_AND_TREATMENT_PLAN_SPEC]]

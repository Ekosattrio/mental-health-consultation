# Panduan menyeluruh proyek untuk Eko

> Prioritas terbaru: [keputusan final integrasi22Oktober2026](../KEPUTUSAN_FINAL_2026_10_22.md). DP100.000 sekali, seluruh jadwal H+1, tanpa extend, cancel wajib lunas. Panduan ini adalah target integrasi, bukan klaim semua route/domain telah tersedia.


## Apa yang dibangun

JiwaSehat mengelola profil praktik, pemesanan dan administrasi layanan satu praktisi. Ada tiga kategori: Konseling, Asesmen/tes, dan Psikoterapi. Telelayanan adalah paket Konseling lewat Google Meet; Admin memasukkan link dan sistem mengirim WA melalui Baileys. Website mengelola administrasi, bukan ruang percakapan atau diagnosis otomatis.

Frontend React/TypeScript berada di resources/js. Laravel13 + Inertia3 mengatur routing web/session/controller melalui routes/web.php dalam satu domain. Home, login/logout dan workspace dasar sudah memakai backend Laravel; fitur domain lainnya belum dimigrasi. Desain Eko/mock tersedia hanya pada preview lokal, terpisah dari web utama. Baca [perubahan dan konteks untuk Eko](../PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md) sebelum mengubah data layer. Dokumen langsung di docs/ tanpa kewajiban Obsidian; instalasi/status ada di [SETUP](../SETUP.md).

## Urutan baca yang disarankan

1. Panduan ini untuk gambaran menyeluruh dan contoh hubungan data.
2. [BUSINESS_RULES](../BUSINESS_RULES.md) dan [ROLES_PERMISSIONS](../ROLES_PERMISSIONS.md) untuk keputusan dan akses.
3. actors/ dan journeys/ untuk alasan tiap pelaku serta urutan pengalaman.
4. [FEATURES](../FEATURES.md): F01–F20 untuk detail fitur, field, transisi, gagal/pemulihan dan acceptance criteria.
5. [WEB_CONTRACT](../WEB_CONTRACT.md) untuk nama payload/response, enum, policy dan error; [DATABASE_ARCHITECTURE](../DATABASE_ARCHITECTURE.md) untuk tipe/null/FK/index, insert order dan locking.
6. [KNOWN_ISSUES](../KNOWN_ISSUES.md), bagian terbaru DECISIONS/SESSION_HANDOFF, lalu audit integrasi terbaru.

File audit di audits/ adalah bukti pemeriksaan pada tanggalnya, bukan implementasi aktif. README root mendeskripsikan struktur Laravel/React terbaru; README prototype lama ada di archive/. Jika dua dokumen aktif berbeda, catat dan selaraskan; jangan membuat aturan sendiri di komponen.

## Siapa mengerjakan apa dalam produk

| Pelaku | Tujuan dan kemampuan | Batas utama |
|---|---|---|
| Guest | Memahami praktik, layanan, lokasi, kontak, review; daftar/login | Tidak menerima harga atau data pasien |
| Pasien | Mengurus profil aktual, booking, profiling, bukti, riwayat, reschedule, review | Hanya pasien/booking yang aksesnya sah |
| Admin | Daftar/bantu pasien, harga/promo, jadwal/jam, cek uang, biaya/diskon, link Meet/WA dan operasional | Harga/diskon/total boleh; saldo, rekap pembayaran, receipt penuh dan keuangan praktik tidak |
| Superadmin | Satu owner/praktisi, role teknis PSYCHOLOGIST; kebutuhan klinis, rencana, laporan/expense dan audit | Tetap mengikuti transaksi/guard/audit; tidak menimpa histori |

Admin boleh memeriksa nominal bukti/input yang sedang dikerjakan. Ini tidak memberi akses saldo/agregat pembayaran pasien. VERIFIED adalah hasil pemeriksaan petugas, bukan konfirmasi bank otomatis.

## Peta fitur ke data dan operasi

| Fitur | Data utama | Interaksi utama |
|---|---|---|
| F01 akun | users, auth_identities | register/login/Google, session cookie |
| F02 profil praktik | cms_contents | draft/publish, Guest tanpa harga |
| F03 pasien | patient_profiles, patient_accesses | identitas aktual dan akses penanggung jawab |
| F04 paket | consultation_packages, package_versions | harga/promo/basis tambahan versi baru |
| F05 kalender | calendar_versions, schedules/overrides, schedule_resources | preview/apply dan availability |
| F06 booking | appointments, events, invoice | satu commit reservasi dan harga snapshot |
| F07 profiling | pretest_templates/submissions | draft, submit, revisi per appointment |
| F08 uang | billing_accounts, invoices/lines, payment/proof/events, receipts | submit/verify/reject/correction/addendum |
| F09 pindah jadwal | reschedule_requests/events | submit/review/apply, interval lama dilepas |
| F10 operasional | appointments/events | check-in/start/complete/no-show/cancel |
| F11 psikoterapi | treatment_plans, appointment sesi | jadwalkan1-4, review complete/discontinue setelah lunas; lanjut via plan baru |
| F12 ulasan | reviews | satu per billing account, moderasi ulang saat edit |
| F13 pesan | notification_outbox, notifications | commit dahulu, worker/dedupe/retry |
| F14 laporan | ledger, expenses, export_jobs | cutoff as_of dan snapshot export |
| F15 privasi | consents, private_files, audit_logs | penerimaan nyata, download policy dan retensi |
| F16 tutorial | tutorial_contents/progress | panduan per role, boleh skip/replay |
| F17 kerja Admin | menggunakan modul di atas | form operasional, bukan endpoint bebas mengubah semua kolom |
| F18 asesmen | assessment_cases, appointment case, report_deliveries | satu harga, banyak waktu, hasil boleh offline |
| F19 pengeluaran | expenses | owner-only, koreksi berjejak |
| F20 Telelayanan | tele_service_links, outbox/delivery | Admin save link -> otomatis WA pasien |

Nama tabel lengkap dan relasi tetap mengacu kamus database. Istilah schedules/overrides di tabel ini adalah kelompok penjelasan, bukan tabel baru.

## Akun pemesan berbeda dari pasien aktual

Contoh orang tua bernama Ani mempunyai satu users.id. Anaknya Bima mempunyai patient_profiles.id. patient_accesses memberi Ani akses yang sah ke Bima. Appointment menyimpan pasien Bima dan snapshot penanggung jawab Ani; bukan mengganti nama akun Ani menjadi Bima.

Pasien walk-in boleh belum punya akun. Admin membuat profil aktual; akun yang mendaftar kemudian tidak otomatis mendapat riwayat hanya karena nama/telepon cocok. Admin memverifikasi klaim, lalu membuat akses. Ini dua konsep identitas yang berbeda, bukan data duplikat yang harus digabung otomatis.

## Contoh1: Konseling dari booking sampai laporan

1. Pasien login; controller halaman memberi props harga normal/promo dan basis additional time yang efektif pada versi paket. Contoh ini target fitur bisnis, bukan kemampuan workspace dasar saat ini.
2. Isi profil aktual, draft profiling dan consent. Draft tidak mengunci slot. Submission/consent boleh belum memiliki appointment_id agar tidak ada lingkaran insert.
3. Preview server memvalidasi paket, kalender, durasi, H+1/enam jam dan deadline. Submit idempotent mengunci resource hari lalu membuat appointment, billing account milik appointment, satu invoice BASE dan snapshot harga dalam satu transaction. Jika satu langkah gagal, seluruhnya rollback.
4. WAITING_PAYMENT mengokupansi sampai min(created_at+24jam,start_at). Bukti tepat waktu membuat WAITING_VERIFICATION; tidak menambah kas.
5. Admin memverifikasi uang aktual. DP minimum membuat reservasi CONFIRMED; seluruh kewajiban terpenuhi membuat status tagihan PAID. Status appointment dan tagihan bukan satu enum.
6. Saat hadir, Admin memeriksa identitas/uang, menagih di luar sistem bila DP belum cukup, lalu mencatat penerimaan aktual dan check-in. Auto-confirm SLA12jam hanya melindungi jadwal, bukan uang.
7. Sesi berlangsung/selesai; additional time memakai total menit aktual per usaha, basis tarif snapshot dan selisih revisi. Tambahan sesudah invoice terbit adalah ADDENDUM, bukan menulis ulang receipt.
8. Laporan kas owner menempatkan setiap penerimaan pada received_at. Reschedule bulan depan tidak memindahkan uang bulan ini. Verifikasi terlambat baru masuk laporan dengan as_of yang mencakup verified_at itu.

## Contoh2: Asesmen satu harga, dua pertemuan

Asesmen Dasar Rp350.000: buat satu assessment_case dan billing_account case, satu biaya dasar; appointment TESTING sequence1 dan EVALUATION sequence2. Evaluasi boleh berbeda hari, dijadwalkan Admin sesuai kebutuhan praktisi.

Jika DP case sudah terpenuhi, appointment evaluasi baru langsung CONFIRMED. Jangan meminta DP/bukti ulang, membuat invoice Rp350.000 kedua, atau membuat hold baru yang meng-expire layanan yang sudah dibayar. Clock perlindungan berasal dari anchor TESTING pertama; case paid tidak perlu SLA baru.

Hasil laporan termasuk dan boleh diberikan offline. Menutup case mengikuti penyelesaian scope/keputusan owner, terpisah dari lunas. Membatalkan satu evaluasi bukan membatalkan seluruh kewajiban paket yang sudah sebagian diberikan. Review satu untuk seluruh case; cutoff PDF pembayaran dari penutupan case, bukan tes pertama.

## Profiling pasien offline
Pasien offline mengisi kertas lalu menyerahkannya langsung kepada Superadmin. Admin hanya mengurus identitas, jadwal, administrasi dan pembayaran. Form booking petugas memakai profiling_mode=PAPER tanpa pretest_submission_id/answers/upload kertas; tampilkan “Profiling kertas — tidak tersimpan di aplikasi”, bukan SUBMITTED digital. Profiling kertas tidak menghalangi booking offline. Online tetap DIGITAL dan pasien/penanggung jawab mengisi submission melalui akun sendiri; tidak ada akses tulis jawaban untuk Admin. DIGITAL/PAPER adalah jalur pencatatan, bukan penilaian kelengkapan/kondisi klinis pasien.

## Contoh3: Psikoterapi dan unit rencana
**Keputusan developer: pilihan B.** Dina memilih Psikoterapi dan langsung booking sesi pertama. Sistem membuat satu rangkaian administratif ACTIVE empat unit serta satu appointment/billing/invoice sesi1 Rp500.000 secara atomik; tidak ada approval owner sebelumnya, tagihan Rp2.000.000 atau appointment otomatis sesi2–4. Isi klinis tetap praktisi. Admin menjadwalkan sesi lanjutan sesuai arahan praktisi dan kesepakatan Dina. Klik ulang dengan key sama mengembalikan hasil sama; rangkaian ACTIVE yang sudah ada mengarahkan ke Admin, bukan membuat kelompok baru. Setelah empat sesi selesai dan plan terminal, pasien booking rangkaian baru dengan ledger/DP awal baru, bukan extend/sesi5. DP100.000 awal mengurangi invoice sesi1; lanjutan dan reschedule tidak meminta DP baru. Detail F11/WEB_CONTRACT dan unique active_plan_guard pada schema.

Rencana awal4unit; setiap unit yang dipesan mempunyai appointment, billing account dan invoice sendiri Rp500.000 per sesi sesuai versi saat booking. Dua unit yang belum dipesan tidak menjadi utang bila berhenti setelah dua.

session_number adalah nomor unit dan unik untuk unit belum dilepas dalam plan. Reservasi expired tanpa uang/layanan melepaskan unit; booking baru dapat mengisi nomor itu dengan appointment/billing baru, sementara riwayat lama tetap dan tagihan lamanya ditutupnet0. attempt_number adalah usaha jadwal unit itu; reschedule sah mempertahankan tagihan/nomor unit. Jangan menghitung no-show sebagai layanan yang sudah diberikan.

UI membedakan completed_sessions (layanan nyata), cancelled/no-show dan sesi belum dipesan. Setelah empat sesi selesai, tutup plan; kebutuhan lanjutan memakai booking plan baru tanpa extend. Discontinue memerlukan pelunasan seluruh tagihan terbentuk lalu menghentikan seluruh sisa appointment plan atomik; completed/histori uang/rangkaian lain tetap.

## Contoh4: Telelayanan

Pasien memilih paket Google Meet, mengonfirmasi WA penanggung jawab -> reservasi -> tugas Admin NEEDS_LINK -> Admin hubungi pasien dan tempel URL -> server simpan revisi+outbox -> Baileys kirim otomatis -> QUEUED/SENT/FAILED terlihat terpisah.

Nomor snapshot pada booking adalah konteks awal. Jika Admin memperbaikinya, revisi tele_service_links aktif adalah tujuan terbaru; notifications menyalin tujuan kirim agar pesan lama tetap dapat ditelusuri. Jangan memakai nomor awal sebagai satu-satunya kebenaran setelah koreksi sah.

Reschedule mengganti attempt, membatalkan antrean lama dan meminta konfirmasi tautan usaha baru. Pembayaran yang mengubah row_version saja tidak membatalkan link karena attempt/link_version belum berubah. Link/SENT/klik bukan check-in; Admin tetap memeriksa identitas/pembayaran dan kehadiran online.

## Pembatalan dan uang

Pembatalan/discontinue wajib lunas atas seluruh tagihan sah yang telah terbentuk. Tolak bila masih ada sisa; tidak menerbitkan pelepasan sisa atau refund. Setelah lunas, hentikan seluruh sisa layanan terkait; completed/histori uang/rangkaian lain tetap. Expiry hold teknis bukan pembatalan otomatis layanan berbayar. Keputusan final: [22 Oktober 2026](../KEPUTUSAN_FINAL_2026_10_22.md).

Jika layanan sudah dimulai, jangan menjalankan pelepasan sisa otomatis. Pada case asesmen, periksa seluruh case sebelum menutup paket. Pengajuan reschedule tepat waktu yang masih aktif mencegah penutupan hak sepihak karena keterlambatan Admin.

Kelebihan uang nyata ditangani di luar sistem tanpa fitur resolusi/refund/credit. Salah ketik memakai koreksi; klik ganda dicegah idempotency; dua transfer nyata tetap dua penerimaan.

## Mana histori yang disengaja dan mana duplikasi keliru

| Data serupa | Alasan / sumber kebenaran |
|---|---|
| Paket dan package_versions | Identitas master berbeda dari versi harga/benefit immutable |
| Harga versi dan snapshot invoice | Bukti yang sudah diterbitkan tidak berubah saat katalog diedit |
| Appointment dan appointment_events | Interval/status terkini versus histori yang append-only |
| Link Meet revisi dan nomor delivery | Link aktif terbaru versus bukti versi/tujuan pesan yang sudah dikirim |
| Profile dan identity_snapshot booking | Data sekarang versus identitas pada transaksi dahulu |
| Export dataset_snapshot | Bekuan hasil berizin pada satu as_of; bukan sumber transaksi baru |
| Total agregat billing/paid/saldo/counter/progres | Derived dari invoice/ledger/request/unit; bukan field yang boleh ditimpa React |
| Dua BASE, dua request aktif, dua nomor dokumen sama | Duplikasi terlarang, dijaga unique constraint dan transaction |

Tidak ada isBooked kedua untuk menandingi appointment. reschedule_count berasal dari request APPLIED, bukan kolom counter writable. Satu billing account per appointment non-asesmen atau case asesmen; tidak menaruh FK balik yang memaksa insert melingkar.

## Empat jenis versi yang jangan tertukar

- row_version: revisi record mutable, untuk expected_version dan409 ketika stale.
- version konten: versi paket/template/CMS/proof/link; disimpan untuk histori.
- attempt_number: usaha jadwal sesudah reschedule, tetap satu unit layanan/tagihan.
- revision additional time: versi total menit dalam satu usaha; input mengirim total, bukan menghitung blok dari setiap delta.

Calendar expected_version memakai nomor versi kalender, bukan row_version sebuah interval. WEB_CONTRACT merinci mapping expected_link_version dan expected_appointment_version. Setelah409, muat ulang hasil server; jangan menimpa otomatis.

## Tanggung jawab React dan backend

React mengelola input, status form, loading/error/empty, pemilihan data, dan menampilkan hasil commit. Seluruh field/request/enum memakai WEB_CONTRACT (props/form/JSON pendukung), termasuk claimed_amount dan direction=PLUS/MINUS. UI tidak mengarang actor, verified status, harga, saldo atau tanggal deadline.

Backend memegang policy, ownership, jumlah tagihan, clock operasional, slot lock, state transitions, unique constraints, histori, private files dan outbox. Semua side effect penting berasal dari satu commit; pengiriman jaringan eksternal tidak dijanjikan exactly-once.

Audit aturan19Oktober dilakukan pada dokumen. Pada20Oktober developer mengizinkan setup lalu menyetujui migrasi Laravel/Inertia/React. Fondasi Home/login/logout/workspace ber-role dibuat; ini belum implementasi seluruh kontrak domain. Pengembang masih perlu menerapkan domain backend dan memverifikasi transaksi bersamaan, retry, akses antar pasien/role, rollover waktu, pembatalan dan kegagalan WA setelah pengujian diizinkan.

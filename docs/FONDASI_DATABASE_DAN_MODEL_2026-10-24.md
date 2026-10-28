# Handoff Eko — fondasi database dan model, 24 Oktober 2026

Permintaan Desman: betulkan aturan/dokumentasi, buat migration dan model lebih dahulu, lalu minta konfirmasi sebelum controller dan penyambungan tampilan. Tahap fondasi ini selesai. Controller bisnis, action transaksi, policy/DTO dan integrasi tampilan **belum dibuat**.

## Hasil nyata

| Bagian | Hasil |
|---|---|
| Database lokal | `jiwasehat`, MySQL 8.4.3 pada localhost |
| Migration | 56 migration terpasang: 3 fondasi lama + 53 baru |
| Tabel | 49 domain termasuk users + 8 teknis Laravel = 57 |
| Model | 48 model domain baru + User diperbarui = 49 model konkret |
| Enum | 45 enum domain baru; UserRole/UserStatus tetap dipakai |
| Integritas DB | 113 foreign key termasuk sessions; 175 CHECK; 46 trigger |
| Data nyata | users, patient_profiles, appointments, payment_transactions masing-masing 0 record |

Pembuatan schema lokal memakai CREATE DATABASE IF NOT EXISTS lalu Laravel migrate. Tidak memakai migrate:fresh/reset, tidak seed akun demo, tidak mengimpor LocalStorage, dan tidak mengganti APP_KEY. Migration Laravel membuat tabel dalam schema yang tersedia; operator checkout lain tetap menyiapkan database/kredensial sendiri.

## Peta berkas untuk Eko

- [Keputusan aktif](KEPUTUSAN_AKTIF_2026-10-24.md) adalah otoritas aturan setelah koreksi langsung pengguna. Berkas “final22Oktober” menjadi pointer ke aturan terbaru; salinannya tetap ada pada archive/.
- [Kamus database](DATABASE_ARCHITECTURE.md) menjelaskan setiap tabel/kolom, wajib/default, PK/FK, enum, index/CHECK, transisi, privacy dan strategi lock. [Manifest](../database/schema/domain-schema.json) menyediakan inventaris yang bisa diperiksa mesin.
- `database/migrations/2026_10_24_000100_*` sampai `000147_*`: 48 tabel domain; `000050_*`: guard akun; `000900_*`: FK; `000910_*`: CHECK; `000920_*`: trigger histori; `000930_*`: default DP 50% sesuai desain pemilik, tanpa mengubah konfigurasi tersimpan.
- `app/Models/`: model konkret, casts/relasi; `app/Enums/`: nilai status resmi. Nama kelas dan pasangan tabel ada di kamus, tidak perlu menebak bentuk singular.
- `app/Models/Concerns/DomainModel.php`: UUIDv4, format waktu mikrodetik, optimistic locking row_version, larangan delete biasa.
- `ImmutableDomainModel.php`: record terbit append-only. `ChecksDomainRelations.php`: pemeriksaan konteks referensi saat save Eloquent.
- `app/Exceptions/StaleDomainRecord.php`: konflik model usang. Controller nanti perlu memetakannya ke error yang dapat ditangani UI.
- [Kontrak web](WEB_CONTRACT.md): target route/form/props; daftar ini bukan bukti controller sudah dibuat.
- [Audit preview Eko](audits/AUDIT_PERUBAHAN_EKO_2026-10-24.md): temuan source yang belum diubah pada tahap ini.

## Penyelarasan penting

Online boleh same-day setelah180 menit kerja penuh pada kalender klinik/Admin yang sama. Booking10.30 dengan jeda12–13 menghasilkan earliest14.30. Offline oleh Admin boleh hari ini/sekarang, tetap slot bebas/durasi muat. Deadline bukti awal min(created_at+24jam,start_at−2jam); reminder owner pada T−2jam waktu nyata boleh memakai bukti yang belum Admin verifikasi. Rincian boundary, penolakan terlambat dan notifikasi manual ada di [aturan waktu](OPERATING_WINDOW_AND_BOOKING_CUTOFF.md).

CUSTOM REQUIRED mempunyai biaya positif; INCLUDED memakai billing asal melalui appointment_billing_links; NOT_REQUIRED tanpa tagihan/receipt dan tidak menjadi PAID. Profiling klinis offline PAPER langsung ke owner; Admin tidak memasukkan jawaban. Profiling digital memakai submission per konteks dan tidak menimpa jawaban sebelumnya.

Pembatalan sebelum layanan tidak menagih sisa bagian belum diberikan. Penutupan memakai adjustment terbit yang merujuk tagihan asal dan CLOSED_UNSERVED; uang yang benar-benar diterima tetap. Bagian yang telah dilayani tidak dihapus otomatis. Ini mengganti ketentuan lama yang memaksa pelunasan sebelum pembatalan.

Plan AWAITING_SETTLEMENT ikut unique guard, sehingga tidak bisa membuat plan ACTIVE kedua untuk melewati kewajiban lama. Psikoterapi tetap invoice per sesi yang dipesan, bukan membuat utang empat sesi sekaligus. Agreement dan allocation memisahkan kesepakatan, invoice dan kas; alokasi tidak menerbitkan penerimaan/receipt kedua.

## Perilaku model dan batas integritas

UUID dihasilkan server. FK melindungi keberadaan referensi; model memeriksa konteks pasien/case/plan tertentu. Penerimaan pending mempunyai claimed_amount dan amount aktual boleh null; VERIFIED memerlukan amount positif, waktu penerimaan, verifikasi dan pemeriksa. Kas VERIFIED, invoice, line, receipt, event dan versi terbit tidak di-overwrite; koreksi menambah record reversal/revisi baru.

Submission terkirim tidak boleh diubah jawabannya. Binding appointment hanya satu kali jika sebelumnya null, dengan pasien yang sama. Answers dienkripsi ke LONGTEXT; objective klinis dan URL Meet juga encrypted casts. Saldo/klinis/link/file sensitif tidak boleh dibagikan dengan raw model; hidden hanyalah perlindungan tambahan, **bukan policy/DTO**.

Save model memakai `WHERE id AND row_version` dan menaikkan versi. Dua petugas menyimpan dari versi sama: perubahan kedua ditolak, tidak menimpa yang pertama. Query builder/raw SQL tidak mengikuti event model; trigger melindungi histori kritis, tetapi action tetap wajib memakai aturan transaction.

FK/CHECK tidak menjamin interval bebas, SUM alokasi tidak melebihi kas, SUM potongan tidak melebihi line, jumlah invoice sama dengan line, minimum DP terpenuhi, atau status transisi sah. Tahap action wajib mengunci resource praktisi+tanggal, plan/case, appointment/request, billing dan ledger dalam urutan stabil; validasi ulang dan simpan idempotency+audit+outbox atomik. **Jangan menulis controller yang sekadar menerima semua field lalu Model::create(request()->all()).**

## Verifikasi yang sudah dijalankan

| Pemeriksaan | Hasil |
|---|---|
| `php tests/database-foundation.php` | PASS, 34 pemeriksaan, MySQL lokal dengan database acak terisolasi |
| Migration → rollback → migration ulang | PASS pada database uji; database aplikasi tidak direset |
| Constraint/model | UUID, single owner, FK, interval, promo, nominal aktual, immutable kas/receipt, enkripsi dan histori profiling, versi usang, receipt belum verified ditolak, alokasi/idempotency, pasien lintas referensi ditolak, guard plan menunggu pelunasan |
| Penerapan aplikasi | 56 migration sukses, 57 tabel; jumlah constraint/trigger diperiksa dari information_schema |
| PHPUnit | 2 tes dasar / 2 assertion lolos; ini health/unit scaffold, bukan tes controller bisnis |
| TypeScript | `npm run lint` lolos |
| Regresi preview lama | 87/87 lolos via native Node test runner dan loader transpile TypeScript sementara |

`npm test` belum dipakai sebagai bukti karena paket tsx tidak tersedia pada node_modules lokal meski tercatat pada lockfile. Tes87 menjalankan berkas test yang sama dengan loader TypeScript sementara di .codex-tmp, tanpa mengubah perilaku source. Tes preview masih menguji aturan lama, termasuk H+1; kelulusannya **bukan validasi aturan baru di tampilan**. Tidak menjalankan browser/dev server/build atau menyatakan E2E bisnis lolos. Format PHP telah dirapikan dengan Laravel Pint.

## Default pembayaran mengikuti ide pemilik

Dokumen ide Desman menyatakan pembayaran awal minimum 50% dari harga final paket. Flat100000 pada perubahan Eko belum mendapat persetujuan eksplisit pengguna, sehingga default backend dipulihkan ke PERCENT 5000 basis poin melalui migration lanjutan000930, bukan mengedit migration yang sudah diterapkan. Opsi FIXED tetap ada untuk konfigurasi owner; nilainya tidak digunakan selama mode PERCENT. Konfigurasi yang sudah disimpan tidak ditimpa. Parameter dan hasil minimum masuk initial_payment_policy_snapshot agar booking lama tidak mengikuti konfigurasi baru.

Identitas praktik, rekening, nomor WA, akun petugas dan secret integrasi belum diprovisikan. Hal tersebut tidak menghalangi pembuatan schema/model.

## Tahap berikut setelah konfirmasi Desman

1. Action/domain service transaksi + FormRequest/policy/DTO per objek dan per role. Terapkan kalkulasi waktu, lock overlap, idempotency, penutupan belum diberikan dan ledger sebelum controller mutasi diaktifkan.
2. Controller web/session/Inertia bertahap, lalu sesuaikan komponen tampilan Eko ke props/action nyata. Hapus ketergantungan mock hanya untuk fitur yang telah dipindahkan; jangan dual-write LocalStorage dan DB.
3. Perbaiki temuan preview yang ditunda: guard tanggal, nominal walk-in, reject sesudah awal sesi, migrasi katalog lokal, grace no-show, penutupan plan, perhitungan progress, identitas/email walk-in dan durasi asesmen240 menit.
4. Upload privat/PDF, scheduler/outbox/queue/Baileys, pengingat dan retensi setelah alur transaksinya tersedia; tes konkurensi dan alur end-to-end untuk fitur yang selesai.

Berhenti pada tahap fondasi ini sesuai instruksi pengguna; tidak ada controller bisnis baru atau perubahan tampilan React pada sesi ini.

# Kamus database kanonik JiwaSehat

> Target schema, belum migrasi domain. [Keputusan final 22 Oktober 2026](KEPUTUSAN_FINAL_2026_10_22.md) mengalahkan histori: DP100.000 sekali, seluruh jadwal H+1, tanpa extend, cancel wajib lunas.
Target implementasi Laravel 13 / MySQL 8. Dokumen desain; setup20Oktober2026 menambahkan migration fondasi users/cache/jobs dan memeriksa syntax, tanpa menjalankan migration atau memvalidasi seluruh domain. Sebagian besar tabel berikut belum diimplementasikan.

## Konvensi tetap
- Semua PK domain bernama id: CHAR(36), UUID v4 dibuat server, NOT NULL, tanpa default database. Semua FK domain CHAR(36), charset/collation sama, mengarah ke id tabel yang disebut. Tidak memakai ULID, integer FK atau pilihan alternatif.
- N = nullable (default NULL). W = NOT NULL, tanpa default kecuali tertulis. Semua tabel mempunyai created_at DATETIME(6) W dari server; tabel master/mutable juga updated_at DATETIME(6) W. Tabel event/ledger immutable tidak mempunyai updated_at. UUID dan timestamps disisipkan server.
- Semua tabel domain mutable juga mempunyai row_version INT UNSIGNED NOT NULL DEFAULT 1 sebagai kolom common. Setiap update menaikkannya atomik. API expected_version mengacu row_version target, bukan nomor versi konten. Tabel immutable tidak memakai row_version. Kolom version pada package_versions/calendar_versions/template/proof/review/tutorial/link adalah nomor versi konten/kejadian dan tetap terpisah. Payment pending/reschedule/profile memakai row_version common meski tidak diulang pada tabel detail; payment VERIFIED tidak boleh diedit meskipun tabelnya mempunyai mekanisme versi.
- FK memakai ON UPDATE RESTRICT / ON DELETE RESTRICT. Tidak ada cascade delete pada data domain; penghapusan akses/master memakai status/is_active. File purge tidak menghapus record metadata/FK.
- Nominal Rupiah BIGINT UNSIGNED, tanpa sen. Arah PLUS/MINUS disimpan terpisah; total net yang dapat negatif pada dokumen koreksi memakai BIGINT signed. Tidak menggunakan float. quantity dan menit INT UNSIGNED. Persentase basis point SMALLINT UNSIGNED (2500=25%,5000=50%).
- Tanggal DATE WIB; jam kalender TIME(0) WIB; timestamp event DATETIME(6) UTC. API timestamp RFC3339 dengan offset. Rentang waktu [start,end), end > start. MySQL tidak memiliki exclusion constraint interval; transaction/lock dijelaskan di bawah.
- Varchar/teks menggunakan utf8mb4. Email dinormalisasi lowercase dan unique. JSON mempunyai whitelist dan schema validation server, bukan wadah status/harga utama.
- Setiap FK memiliki index BTREE sendiri kecuali sudah menjadi prefix suatu index. Setiap status yang disebut di kolom adalah VARCHAR(40) W, divalidasi enum PHP + CHECK database sesuai daftar di dokumen ini. CHECK tidak menggantikan policy/transaction.
- Format baris berikut: kolom | tipe | W/N, default | FK/aturan. Kolom common di atas berlaku pada SEMUA tabel berikut; tidak perlu ditebak dari ringkasan fitur.

## Status kanonik
| Objek | Nilai |
|---|---|
| users.role | PATIENT, ADMIN, PSYCHOLOGIST |
| users.status | ACTIVE, BLOCKED |
| appointments.status | WAITING_PAYMENT, WAITING_VERIFICATION, CONFIRMED, CONFIRMED_AUTO_SLA, CHECKED_IN, IN_CONSULTATION, COMPLETED, NO_SHOW, CANCELLED, EXPIRED |
| reschedule_requests.status | REQUESTED, APPROVED, SLOT_SELECTION_REQUIRED, APPLIED, REJECTED, EXPIRED, CANCELLED |
| payment_transactions.status | PENDING_VERIFICATION, PENDING_RECONCILIATION, VERIFIED, REJECTED |
| billing summary (DERIVED, bukan status transaksi) | UNPAID/PARTIAL/PAID dari kewajiban/penerimaan; OVERPAID flag terpisah. Status batal layanan tidak menghapus utang; cancel wajib lunas |
| pretest_submissions.status | DRAFT, SUBMITTED |
| treatment_plans.status | ACTIVE, COMPLETED, DISCONTINUED |
| assessment_cases.status | OPEN, IN_PROGRESS, READY_FOR_REPORT, CLOSED |
| notifications.status | QUEUED, SENDING, RETRY, SENT, FAILED, CANCELLED |
| invoices.kind | BASE, ADDENDUM, ADJUSTMENT |
DRAFT adalah draft form/submission sebelum reservasi; HELD dan DP_PAID/PAID bukan status appointment/payment row. Istilah “hold” berarti perlindungan appointment WAITING_PAYMENT sampai deadline.

## users
Akun login; penanggung jawab tidak selalu pasien aktual.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| name | VARCHAR(150) | W | Nama akun |
| email | VARCHAR(254) | W | Normalisasi lowercase |
| password_hash | VARCHAR(255) | N | Null jika Google-only |
| role | VARCHAR(40) | W, PATIENT | Publik tidak boleh override |
| status | VARCHAR(40) | W, ACTIVE | Blocked untuk semua metode |
| phone | VARCHAR(25) | N | Kontak akun |
| email_verified_at | DATETIME(6) | N | Bukti kepemilikan email |
| last_login_at | DATETIME(6) | N | Waktu login |

Index/constraint: UNIQUE(email). Satu PSYCHOLOGIST aktif ditegakkan via owner_settings.singleton_key dan user FK; provisioning tidak membuka pembuatan owner kedua.
Catatan adapter Laravel awal: migration users juga mempunyai remember_token nullable untuk mekanisme autentikasi framework. sessions/password_reset_tokens/cache/jobs adalah tabel infrastruktur, bukan46tabel domain di kamus ini; sessions.user_id tetap UUID dan FK users. Model User menyesuaikan password_hash serta menghasilkan UUIDv4; kontrol policy/expected_version/provisioning owner belum menjadi lengkap hanya karena scaffold ini tersedia.

## auth_identities
Identitas provider terpisah dari profil pasien.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| user_id | CHAR(36) | W | FK users |
| provider | VARCHAR(20) | W | GOOGLE |
| subject | VARCHAR(255) | W | Provider sub |
| linked_at | DATETIME(6) | W | Sesudah verifikasi akun |

Index/constraint: UNIQUE(provider,subject), UNIQUE(user_id,provider).

## owner_settings
Satu praktik/praktisi, kontak placeholder dan konfigurasi operasional.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| singleton_key | TINYINT UNSIGNED | W, 1 | CHECK =1 |
| owner_user_id | CHAR(36) | W | FK users; role PSYCHOLOGIST |
| practice_identity | JSON | W | Nama/alamat/logo/rekening/nomor placeholder; snapshot di invoice |
| timezone | VARCHAR(64) | W, Asia/Jakarta | Tidak dikendalikan browser |
| grace_minutes | INT UNSIGNED | W, 15 | Default operasional |
| selection_window_hours | INT UNSIGNED | W, 24 | Default pemilihan reschedule |
| proof_correction_hours | INT UNSIGNED | W, 24 | Default koreksi bukti; dibatasi awal sesi |
| wa_owner_phone | VARCHAR(25) | N | Belum kirim jika placeholder |

Index/constraint: UNIQUE(singleton_key), UNIQUE(owner_user_id). Parameter default operasional dapat diubah owner untuk kejadian baru, bukan diam-diam merevisi deadline lama.

## patient_profiles
Identitas pasien aktual, dapat tanpa akun.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| full_name | VARCHAR(150) | W | Tidak kosong |
| birth_date | DATE | N | Wajib saat booking online |
| birth_place | VARCHAR(150) | N | Administratif |
| gender | VARCHAR(30) | N | Sesuai form |
| phone | VARCHAR(25) | N | Boleh kontak penanggung jawab pada booking |
| address | TEXT | N | Alamat |
| city | VARCHAR(150) | N | Kota |
| occupation | VARCHAR(150) | N | Anak boleh kosong |
| emergency_contact | JSON | N | Name/phone/relationship |
| is_active | BOOLEAN | W, true | Tidak hard delete |

Index/constraint: INDEX(full_name), INDEX(phone); bukan unique, bukan dasar auto-claim.

## patient_accesses
Kewenangan akun terhadap pasien; klaim walk-in diverifikasi petugas.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| account_user_id | CHAR(36) | W | FK users |
| patient_id | CHAR(36) | W | FK patient_profiles |
| relationship | VARCHAR(50) | W | SELF/PARENT/RESPONSIBLE/OTHER |
| status | VARCHAR(20) | W, ACTIVE | ACTIVE/REVOKED |
| verified_by | CHAR(36) | N | FK users; Admin untuk klaim |
| verified_at | DATETIME(6) | N | Waktu verifikasi |
| reason | VARCHAR(500) | N | Wajib untuk klaim/revoke |

Index/constraint: UNIQUE(account_user_id,patient_id).

## consultation_packages
Identitas paket stabil. Nilai harga/durasi berada di package_versions.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| service_code | VARCHAR(80) | W | Kode F04 |
| category | VARCHAR(30) | W | COUNSELING/ASSESSMENT/PSYCHOTHERAPY |
| is_active | BOOLEAN | W, true | Master aktif |
| created_by | CHAR(36) | W | FK users |

Index/constraint: UNIQUE(service_code), INDEX(category,is_active).

## package_versions
Snapshot immutable harga/benefit/promo. Perubahan membuat versi baru.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| package_id | CHAR(36) | W | FK consultation_packages |
| version | INT UNSIGNED | W | Urutan positif |
| name | VARCHAR(180) | W | Nama saat transaksi |
| description | TEXT | W | Deskripsi termasuk rentang durasi |
| variant | VARCHAR(40) | N | BASIC/STANDARD/FULL/PER_SESSION |
| delivery_mode | VARCHAR(30) | W, OFFLINE | OFFLINE/TELE_SERVICE |
| duration_minutes | INT UNSIGNED | N | Wajib >0 jika bookable |
| duration_min_minutes | INT UNSIGNED | N | Rentang deskripsi |
| duration_max_minutes | INT UNSIGNED | N | Rentang deskripsi |
| normal_price | BIGINT UNSIGNED | W | Harga normal >0 |
| promo_price | BIGINT UNSIGNED | N | 0<promo<normal |
| promo_starts_at | DATETIME(6) | N | Null = tanpa batas awal |
| promo_ends_at | DATETIME(6) | N | Eksklusif; sesudah awal |
| additional_time_price_basis | VARCHAR(20) | N | NORMAL_PRICE/FINAL_PRICE; wajib sebelum COUNSELING bookable, null kategori lain; tanpa default |
| billing_mode | VARCHAR(30) | W | PER_APPOINTMENT/PER_PACKAGE/PER_SESSION |
| minimum_sessions | INT UNSIGNED | W, 1 | 4 psikoterapi awal |
| includes_result_report | BOOLEAN | W, false | True untuk ASSESSMENT |
| requires_evaluation | BOOLEAN | W, false | True Asesmen Dasar |
| benefits | JSON | W | Daftar benefit |
| is_bookable | BOOLEAN | W, false | Tidak aktif tanpa durasi/service siap |
| effective_at | DATETIME(6) | W | Versi efektif terbaru <= waktu preview |
| created_by | CHAR(36) | W | FK users |

Index/constraint: UNIQUE(package_id,version), UNIQUE(package_id,effective_at); INDEX(effective_at). Harga final dihitung pada waktu booking, disnapshot juga di billing BASE line.
Basis tambahan hanya dipilih Admin/Superadmin lewat versi baru; validasi kondisional kategori dilakukan service dalam transaction (kategori berada pada consultation_packages). FINAL_PRICE adalah normal_price dikurangi GLOBAL_PROMO yang disnapshot saat booking, sebelum potongan individual/biaya lain. Metadata BASE menyimpan final_price_at_booking. Appointment mengacu versi immutable; rate_basis/base_rate_snapshot entri tambahan diturunkan server, tidak dipercaya dari payload menit.

## calendar_versions
Versi perubahan kalender; bukan sumber okupansi.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| version | INT UNSIGNED | W | Monotonik |
| effective_at | DATETIME(6) | W | Mulai berlaku |
| created_by | CHAR(36) | W | FK users |
| reason | VARCHAR(500) | W | Alasan perubahan |

Index/constraint: UNIQUE(version).

## weekly_schedule_limits
Satu batas pertemuan per hari/minggu pada versi kalender; tidak disalin ke setiap interval buka.
Tabel immutable: id dan created_at mengikuti common.
| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| calendar_version_id | CHAR(36) | W | FK calendar_versions |
| day_of_week | TINYINT UNSIGNED | W | 1–7 ISO |
| daily_limit | INT UNSIGNED | W | >0 untuk hari yang dibuka |
Index/constraint: UNIQUE(calendar_version_id,day_of_week). Interval weekly_schedules versi/hari harus memiliki header limit ini; divalidasi service satu transaction. Override tanggal mempunyai daily_limit sendiri dan menggantikan header mingguan hari itu.

## weekly_schedules
Interval buka mingguan per versi; istirahat direpresentasikan sebagai celah interval.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| calendar_version_id | CHAR(36) | W | FK calendar_versions |
| day_of_week | TINYINT UNSIGNED | W | 1 Senin–7 Minggu |
| start_time | TIME | W | WIB |
| end_time | TIME | W | CHECK end>start |

Index/constraint: UNIQUE(calendar_version_id,day_of_week,start_time). Larang overlap interval versi/hari via service.

## schedule_overrides
Satu header tanggal khusus mengganti jadwal mingguan, termasuk hari libur. Tidak ada tabel holiday independen yang dapat bertabrakan.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| calendar_version_id | CHAR(36) | W | FK calendar_versions |
| local_date | DATE | W | Tanggal WIB |
| mode | VARCHAR(10) | W | OPEN/CLOSED |
| daily_limit | INT UNSIGNED | W | Positif untuk OPEN, 0 CLOSED |
| reason | VARCHAR(500) | W | Termasuk alasan buka hari libur |

Index/constraint: UNIQUE(calendar_version_id,local_date).

## schedule_override_intervals
Interval kontinu pada override OPEN; CLOSED tidak mempunyai child interval.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| override_id | CHAR(36) | W | FK schedule_overrides |
| start_time | TIME | W | Jam WIB |
| end_time | TIME | W | end>start |

Index/constraint: UNIQUE(override_id,start_time); validasi non-overlap.

## schedule_resources
Resource lock stabil per praktisi/tanggal. Dibuat dahulu dengan unique key, lalu SELECT FOR UPDATE.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| psychologist_id | CHAR(36) | W | FK users, role PSYCHOLOGIST |
| local_date | DATE | W | Tanggal WIB |

Index/constraint: UNIQUE(psychologist_id,local_date).

## operational_changes
Perubahan operasional dan dampak kalender.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| calendar_version_id | CHAR(36) | N | FK calendar_versions jika perubahan kalender |
| actor_id | CHAR(36) | W | FK users dari session |
| reason | VARCHAR(500) | W | Alasan |
| effective_at | DATETIME(6) | W | Tidak retroaktif |
| before_snapshot | JSON | W | Whitelist konfigurasi |
| after_snapshot | JSON | W | Konfigurasi baru |

Index/constraint: INDEX(effective_at).

## assessment_cases
Induk layanan asesmen; tidak mempunyai FK balik ke billing account.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| patient_id | CHAR(36) | W | FK patient_profiles |
| package_version_id | CHAR(36) | W | FK package_versions, kategori ASSESSMENT |
| status | VARCHAR(40) | W, OPEN | Status case |
| scope_snapshot | JSON | W | Cakupan, steps wajib, evaluasi/laporan termasuk |
| created_by | CHAR(36) | W | FK users |
| closed_at | DATETIME(6) | N | Penutupan layanan, bukan pelunasan |
| closure_reason | VARCHAR(500) | N | Wajib penutupan dini |

Index/constraint: INDEX(patient_id,status,created_at).
Anchor case adalah appointment TESTING dengan assessment_sequence=1; sequence anchor tidak diubah. Follow-up memakai paket/billing/clock bukti case/anchor, bukan hold/proof baru. verification_started_at/verification_due_at lanjutan bila disalin hanya snapshot clock asal. Verifikasi case mengunci appointment terurut sebelum billing dan hanya memperbarui yang menunggu, bukan terminal/kehadiran.

## treatment_plans
Rencana psikoterapi, bukan induk invoice bundle.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| patient_id | CHAR(36) | W | FK patient_profiles |
| package_id | CHAR(36) | W | FK consultation_packages, PSYCHOTHERAPY |
| psychologist_id | CHAR(36) | W | FK users; auto-create memakai praktisi tunggal konfigurasi server |
| planned_sessions | INT UNSIGNED | W, 4 | Tetap4; CHECK planned_sessions=4, tanpa extend. Setelah selesai booking plan baru |
| status | VARCHAR(40) | W, ACTIVE | Tidak ada kolom active terpisah |
| active_plan_guard | VARCHAR(73) generated | N | CONCAT(patient_id,':',package_id) jika status=ACTIVE, selainnya NULL |
| clinical_objective | TEXT | N | Owner-only |
| completed_at | DATETIME(6) | N | Terakhir mencapai target |
| discontinued_at | DATETIME(6) | N | Penghentian |
| reason | VARCHAR(500) | N | Extend/stop wajib alasan |

Index/constraint: INDEX(patient_id,package_id,status), UNIQUE(active_plan_guard). Satu plan ACTIVE per pasien/paket. Booking pertama atomik membuat plan4 + appointment/billing/invoice sesi1; rollback tidak meninggalkan plan yatim. Retry key/payload sama mengembalikan asal; key bersaing ->409 TREATMENT_PLAN_EXISTS. Admin menjadwalkan sesi2-4 dengan lock plan, versi dan nomor unik; setelah plan terminal boleh booking plan baru, bukan extend. Urutan lock resource-hari -> plan -> appointment/request -> billing. Cancel/discontinue mengambil cakupan lock yang sama sebelum memeriksa pelunasan dan menghentikan semua sisa appointment.
planned_sessions tetap4, session_number 1..4, tidak ada sesi5 pada plan lama. completed_sessions derived hanya COMPLETED; cancelled/no-show dan belum dipesan tampil terpisah. Sesi belum dipesan tidak mempunyai invoice/utang. DP awal dikreditkan hanya ke billing sesi1; lanjutan mempunyai invoice per sesi tanpa DP awal baru. Status terminal/expiry hold tidak boleh membuat write-off atau klaim layanan telah diberikan.

## appointments
Satu unit sesi berbayar atau pertemuan included asesmen. Tidak mempunyai billing_account_id balik; cari melalui billing_accounts atau assessment_case_id.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| booking_code | VARCHAR(40) | W | Kode tampilan unik |
| patient_id | CHAR(36) | W | FK patient_profiles |
| booked_by_user_id | CHAR(36) | W | FK users: pemesan atau Admin |
| psychologist_id | CHAR(36) | W | FK users |
| package_version_id | CHAR(36) | W | FK package_versions |
| assessment_case_id | CHAR(36) | N | FK assessment_cases |
| assessment_role | VARCHAR(20) | N | TESTING/EVALUATION/FOLLOW_UP hanya jika case ada |
| assessment_sequence | INT UNSIGNED | N | Positif, unik per case |
| profiling_mode | VARCHAR(10) | W, DIGITAL | DIGITAL/PAPER; online wajib DIGITAL, PAPER khusus pendaftaran offline oleh petugas tanpa submission digital |
| treatment_plan_id | CHAR(36) | N | FK treatment_plans |
| session_number | INT UNSIGNED | N | Unit positif dalam plan; unik untuk unit belum dilepas |
| plan_unit_released_at | DATETIME(6) | N | Pelepasan unit untuk reservasi berakhir tanpa uang/layanan; histori tidak diaktifkan kembali |
| plan_session_guard | VARCHAR(75) generated | N | CONCAT(treatment_plan_id,':',session_number) jika plan ada dan plan_unit_released_at null, selainnya NULL |
| attempt_number | INT UNSIGNED | W, 1 | Bertambah saat pindah jadwal diterapkan |
| start_at | DATETIME(6) | W | Jadwal terkini UTC |
| end_at | DATETIME(6) | W | Jadwal, bukan durasi pembulatan biaya |
| status | VARCHAR(40) | W, WAITING_PAYMENT | Enum appointment |
| booking_source | VARCHAR(30) | W | PATIENT_ONLINE/ADMIN_WALK_IN/ADMIN_ASSISTED |
| responsible_user_id | CHAR(36) | N | FK users; boleh null walk-in |
| identity_snapshot | JSON | W | Pasien aktual, penanggung jawab, kontak, hubungan, peserta opsional |
| tele_service_recipient_phone | VARCHAR(25) | N | Nomor WA tujuan yang dikonfirmasi; wajib untuk TELE_SERVICE, null offline |
| tele_service_wa_accepted_at | DATETIME(6) | N | Timestamp server penerimaan pengiriman link/jadwal saat booking Telelayanan |
| calendar_version_id | CHAR(36) | W | FK calendar_versions saat dibuat |
| hold_expires_at | DATETIME(6) | W | min(created+24h,start) |
| verification_started_at | DATETIME(6) | N | Bukti lengkap pertama |
| verification_due_at | DATETIME(6) | N | +12 jam kerja versi snapshot |
| correction_deadline_at | DATETIME(6) | N | Batas perbaikan bukti |
| requires_reschedule | BOOLEAN | W, false | Asal klinik/request sah, bukan status bayar |
| checked_in_at | DATETIME(6) | N | Waktu kedatangan |
| checked_in_by | CHAR(36) | N | FK users |
| actual_started_at | DATETIME(6) | N | Mulai layanan aktual |
| actual_ended_at | DATETIME(6) | N | Akhir layanan aktual |
| terminal_at | DATETIME(6) | N | Completed/cancel/penutupan hak, bukan no-show sementara |

Index/constraint: UNIQUE(booking_code), UNIQUE(plan_session_guard), UNIQUE(assessment_case_id,assessment_sequence); INDEX(psychologist_id,start_at,end_at,status), INDEX(patient_id,created_at). CHECK bukan case dan plan sekaligus; assessment fields semua null atau semuanya terisi. Jika plan null, session_number/plan_unit_released_at harus null; jika plan terisi, session_number wajib positif. plan_unit_released_at hanya diisi saat penutupan tanpa layanan dengan penerimaan bersih0, tidak saat appointment masih aktif. FK patient/package cocok case/plan diperiksa service.

Validasi profil saat booking: CHECK profiling_mode IN ('DIGITAL','PAPER') dan booking_source='PATIENT_ONLINE' mengharuskan DIGITAL. Service memeriksa DIGITAL mempunyai submission SUBMITTED berizin dan PAPER tidak menautkan submission. PAPER hanya dipilih petugas untuk pendaftaran offline, bukan cara melewati profiling booking mandiri. Mode merekam jalur awal; reschedule mempertahankannya, akses kertas tidak dibuat lewat endpoint file/answers.

## appointment_events
Histori status, interval lama/baru, usaha sesi, perubahan plan/case memakai audit terpisah.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| appointment_id | CHAR(36) | W | FK appointments |
| actor_id | CHAR(36) | N | FK users; null job sistem |
| event_type | VARCHAR(60) | W | Status/reschedule/no-show/correction |
| attempt_number | INT UNSIGNED | W | Usaha terkait |
| old_value | JSON | N | Status/interval sebelumnya |
| new_value | JSON | W | Status/interval berikutnya |
| reason | VARCHAR(500) | N | Wajib perubahan manual/exception |
| request_id | VARCHAR(80) | W | Trace |

Index/constraint: INDEX(appointment_id,created_at).

## operational_change_impacts
Daftar appointment yang harus memilih jadwal lagi.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| operational_change_id | CHAR(36) | W | FK operational_changes |
| appointment_id | CHAR(36) | W | FK appointments |
| resolution | VARCHAR(30) | W, PENDING | PENDING/RESCHEDULED/CANCELLED/OWNER_RESOLVED |
| resolved_at | DATETIME(6) | N | Waktu penyelesaian |

Index/constraint: UNIQUE(operational_change_id,appointment_id).

## reschedule_requests
Permintaan tidak mengganti appointment sebelum APPLIED.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| appointment_id | CHAR(36) | W | FK appointments |
| requested_by | CHAR(36) | W | FK users |
| origin | VARCHAR(20) | W | PATIENT/CLINIC/OWNER |
| status | VARCHAR(40) | W, REQUESTED | Enum request |
| requested_at | DATETIME(6) | W | Dasar eligibility |
| eligibility_checked_at | DATETIME(6) | W | Snapshot pemeriksaan |
| appointment_version | INT UNSIGNED | W | Versi saat diajukan |
| appointment_attempt_number | INT UNSIGNED | W | Snapshot usaha sesi; dipakai bersama interval untuk memeriksa jadwal belum berubah |
| reason_code | VARCHAR(60) | N | Klasifikasi administratif; reason tetap wajib |
| owner_authorization_note | VARCHAR(500) | N | Wajib origin OWNER oleh Admin; referensi persetujuan owner eksternal/alasan owner sendiri |
| old_interval | JSON | W | start/end/attempt lama |
| requested_start_at | DATETIME(6) | N | Usulan baru |
| requested_end_at | DATETIME(6) | N | Usulan baru |
| reason | VARCHAR(500) | W | Alasan pengajuan |
| approved_by | CHAR(36) | N | FK users |
| approved_at | DATETIME(6) | N | Waktu putus |
| selection_expires_at | DATETIME(6) | N | Approval + window snapshot |
| requires_resolution | BOOLEAN | W, false | Keputusan administratif masih wajib setelah jendela expired/penolakan terlambat; menahan penutupan hak |
| applied_at | DATETIME(6) | N | Apply berhasil |
| quota_effect | TINYINT UNSIGNED | W, 0 | 0/1; 1 hanya PATIENT APPLIED |
| active_guard | CHAR(36) generated | N | appointment_id jika REQUESTED/APPROVED/SLOT_SELECTION_REQUIRED atau requires_resolution=true, selainnya NULL |

Index/constraint: UNIQUE(active_guard), INDEX(appointment_id,status). Generated menggunakan CASE status/requires_resolution; alternatif validasi aplikasi saja tidak cukup. Sesudah APPLIED, origin/quota_effect/interval/waktu penerapan tidak diedit ulang; perubahan berikutnya memakai request/event baru, agar counter derived tidak berubah karena histori ditimpa.

## reschedule_events
Jejak setiap keputusan/request; histori no-show tetap appointment_events.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| request_id | CHAR(36) | W | FK reschedule_requests |
| actor_id | CHAR(36) | N | FK users |
| from_status | VARCHAR(40) | N | Status lama |
| to_status | VARCHAR(40) | W | Status baru |
| reason | VARCHAR(500) | N | Wajib reject/expire/exception |

Index/constraint: INDEX(request_id,created_at).

## pretest_templates
Versi pertanyaan profiling, tanpa DASS.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| template_key | VARCHAR(80) | W | Kunci form |
| version | INT UNSIGNED | W | Versi |
| questions | JSON | W | Field, tipe, required, allow_null |
| effective_at | DATETIME(6) | W | Awal penggunaan |
| created_by | CHAR(36) | W | FK users |

Index/constraint: UNIQUE(template_key,version).

## pretest_submissions
Draft dapat dibuat sebelum appointment; setelah submitted tidak overwrite answers.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| patient_id | CHAR(36) | W | FK patient_profiles |
| appointment_id | CHAR(36) | N | FK appointments; bind satu kali |
| template_id | CHAR(36) | W | FK pretest_templates |
| author_user_id | CHAR(36) | W | FK users |
| status | VARCHAR(20) | W, DRAFT | DRAFT/SUBMITTED |
| answers | JSON | W | Whitelist template, null bukan false otomatis |
| supersedes_id | CHAR(36) | N | FK pretest_submissions |
| submitted_at | DATETIME(6) | N | Wajib jika submitted |

Index/constraint: INDEX(patient_id,appointment_id,submitted_at), UNIQUE(supersedes_id). row_version common hanya untuk autosave draft; submission SUBMITTED tidak diubah answers-nya. Revisi create row baru dengan supersedes_id, satu penerus per submission; tidak boleh membentuk cycle/fork atau lintas pasien/appointment/template. Draft penerus tidak mengganti jawaban efektif sampai submitted. Appointment membaca submitted yang ditautkan dan revisi sahnya, bukan pre-test terbaru pasien tanpa pembatasan appointment. PAPER tidak membuat submission kosong/flag SUBMITTED; dokumen kertas langsung ke Superadmin, tidak diunggah Admin dan tidak menjadi kolom answers pada appointment.

## consents
Penerimaan naskah aplikasi; tidak menciptakan cycle insert.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| patient_id | CHAR(36) | W | FK patient_profiles |
| appointment_id | CHAR(36) | N | FK appointments, bind setelah booking |
| actor_user_id | CHAR(36) | N | FK users penanggung jawab yang benar-benar menerima; null bila tanpa akun |
| accepted_by_name_snapshot | VARCHAR(150) | W | Nama penanggung jawab yang benar-benar menerima persetujuan |
| recorded_by_user_id | CHAR(36) | W | FK users yang merekam: akun sendiri atau Admin pendamping; bukan pengganti identitas penerima |
| document_key | VARCHAR(80) | W | Jenis persetujuan |
| document_version | INT UNSIGNED | W | Versi naskah |
| accepted_at | DATETIME(6) | W | Penerimaan nyata |
| withdrawn_at | DATETIME(6) | N | Event penarikan dicatat audit |
| acceptance_source | VARCHAR(30) | W | SELF/ASSISTED_OFFLINE |
| ip_address | VARCHAR(45) | N | Bukan identitas utama |

Index/constraint: INDEX(patient_id,appointment_id), INDEX(document_key,document_version), FOREIGN KEY(document_key,document_version) REFERENCES cms_contents(section_key,version) RESTRICT. Tipe/kolasi pasangan harus sama. Naskah tepat yang diterima tidak boleh dihapus; penerimaan baru memeriksa versi PUBLISHED, histori boleh merujuk versi yang kemudian ARCHIVED. Binding/withdrawal diaudit, isi/nama penerima/naskah penerimaan tidak di-overwrite. Migration cms_contents dibuat sebelum FK consent ditambahkan.

## billing_accounts
Satu induk kewajiban per appointment Konseling/Psikoterapi ATAU case Asesmen. Pemilik FK hanya di sini.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| patient_id | CHAR(36) | W | FK patient_profiles |
| appointment_id | CHAR(36) | N | FK appointments untuk non-asesmen |
| assessment_case_id | CHAR(36) | N | FK assessment_cases |
| initial_minimum_due | BIGINT UNSIGNED | W | Awal min(100000,dasar_net); lanjutan0 setelah DP awal plan/case verified; snapshot bukan persentase |
| collection_status | VARCHAR(30) | W, OPEN | OPEN/CLOSED_PAID; hanya ditutup setelah tagihan terbentuk lunas, tidak melepas sisa |
| collection_closed_at | DATETIME(6) | N | Wajib bila CLOSED_PAID; tidak menandakan layanan COMPLETED |
| collection_closure_reason | VARCHAR(500) | N | Pembatalan/expiry/berakhirnya hak sebelum layanan |
| service_terminal_at | DATETIME(6) | N | Penutupan layanan, dasar download cutoff |
| download_until | DATETIME(6) | N | Terminal+7hari, owner reissue terpisah |

Index/constraint: UNIQUE(appointment_id), UNIQUE(assessment_case_id), CHECK tepat satu owner terisi. Lookup appointment asesmen menggunakan case; tidak membuat billing account appointment included. Total/paid/remaining derived, bukan kolom editable. required_initial_amount derived = min(100000,effective_base_due) pada awal booking/rangkaian, 0 pada lanjutan setelah DP awal verified; initial_minimum_due tetap snapshot. Reschedule memakai billing/uang asal tanpa DP baru.

## document_sequences
Counter nomor invoice/receipt per tanggal WIB; bukan PK transaksi.
Tabel mutable: id, created_at, updated_at mengikuti common.
| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| document_kind | VARCHAR(20) | W | INVOICE/RECEIPT |
| local_date | DATE | W | Tanggal nomor WIB |
| next_value | BIGINT UNSIGNED | W, 1 | Counter monotonik |
Index/constraint: UNIQUE(document_kind,local_date). SELECT FOR UPDATE saat mengambil nomor, increment dalam transaction penerbitan. Gagal rollback boleh menyisakan nomor yang tidak terpakai; tidak boleh menggunakan kembali nomor dokumen terbit.

## invoices
Dokumen tagihan terbit immutable; adjustment dapat net negatif tanpa nominal item negatif.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| billing_account_id | CHAR(36) | W | FK billing_accounts |
| invoice_number | VARCHAR(60) | W | Nomor unik sequence server |
| kind | VARCHAR(20) | W | BASE/ADDENDUM/ADJUSTMENT |
| parent_invoice_id | CHAR(36) | N | FK invoices; null hanya BASE |
| net_amount | BIGINT signed | W | Jumlah PLUS dikurangi MINUS |
| issued_at | DATETIME(6) | W | Waktu terbit |
| issuer_id | CHAR(36) | W | FK users |
| identity_snapshot | JSON | W | Praktik/pasien/booking/template saat terbit |
| base_guard | CHAR(36) generated | N | billing_account_id jika BASE, selainnya NULL |

Index/constraint: UNIQUE(invoice_number), UNIQUE(base_guard), INDEX(billing_account_id,issued_at). Invoice+lines disisipkan atomik, lalu immutable.

## billing_line_items
Nilai invoice berasal server; diskon/promo dan koreksi dipisahkan dari custom charge.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| invoice_id | CHAR(36) | W | FK invoices |
| appointment_id | CHAR(36) | N | FK appointments, sumber biaya sesi |
| kind | VARCHAR(30) | W | BASE_SERVICE/GLOBAL_PROMO/PERSONAL_DISCOUNT/ADDITIONAL_TIME/FORMAL_REPORT/CUSTOM_CHARGE/CORRECTION |
| direction | VARCHAR(5) | W, PLUS | PLUS/MINUS |
| label | VARCHAR(255) | W | Deskripsi |
| quantity | INT UNSIGNED | W, 1 | CHECK >0 |
| unit_amount | BIGINT UNSIGNED | W | CHECK >0 |
| amount | BIGINT UNSIGNED | W | quantity*unit_amount, CHECK >0 |
| reference_line_id | CHAR(36) | N | FK billing_line_items; wajib GLOBAL_PROMO/CORRECTION/PERSONAL_DISCOUNT, target yang dikurangi |
| base_service_guard | CHAR(36) generated | N | invoice_id jika kind=BASE_SERVICE, selainnya NULL |
| metadata | JSON | N | Snapshot harga final/promo/rate/billed blocks |
| created_by | CHAR(36) | W | FK users |
| reason | VARCHAR(500) | N | Wajib adjustment/custom/discount |

Index/constraint: UNIQUE(base_service_guard), INDEX(invoice_id,kind). BASE_SERVICE hanya pada invoice BASE. Harga normal PLUS/promo MINUS; dasar net positif. DP flat min(100000,net BASE) hanya awal plan/case; lanjutan0 sesudah awal verified. Tidak ada line pelepasan sisa untuk meloloskan cancel. Reversal mengoreksi salah input, bukan menghilangkan uang nyata.

## additional_time_entries
Revisi total aktual tambahan per appointment/usaha sesi; bukan pembulatan per penambahan.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| appointment_id | CHAR(36) | W | FK appointments kategori COUNSELING |
| attempt_number | INT UNSIGNED | W | Usaha layanan |
| revision | INT UNSIGNED | W | Naik monotonik |
| total_additional_minutes | INT UNSIGNED | W | Total, bukan delta |
| billed_blocks | INT UNSIGNED | W | ceil(total/15) |
| base_rate_snapshot | BIGINT UNSIGNED | W | Dasar tarif sesuai F08; tidak dari form |
| rate_basis | VARCHAR(20) | W | NORMAL_PRICE/FINAL_PRICE dari versi paket booking; tetap pada seluruh revisi usaha sesi |
| rate_basis_points | SMALLINT UNSIGNED | W, 2500 | 25% |
| calculated_total | BIGINT UNSIGNED | W | Hasil total Rupiah |
| invoice_id | CHAR(36) | N | FK invoices, hanya bila selisih nominal nonzero |
| created_by | CHAR(36) | W | FK users |
| reason | VARCHAR(500) | W | Alasan/update total |

Index/constraint: UNIQUE(appointment_id,attempt_number,revision). Revisi append; hanya selisih terhadap revisi terakhir ditagih, koreksi turun harus merujuk kesalahan.
Untuk menjaga pembulatan Rupiah pada harga ganjil, ADDITIONAL_TIME line memakai quantity=1 dan unit_amount=delta positif yang telah dihitung; blok/tarif disimpan pada metadata. Koreksi delta negatif menjadi CORRECTION arah MINUS. Jangan mengalikan blok dengan tarif per blok yang dibulatkan lebih dahulu karena dapat berbeda dari ceil(base_rate_snapshot*2500*billed_blocks/10000).

## payment_transactions
Ledger penerimaan aktual dan pembalik salah input. Refund bukan entry_type yang tersedia.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| billing_account_id | CHAR(36) | W | FK billing_accounts |
| appointment_id | CHAR(36) | N | FK appointments konteks pembayaran |
| entry_type | VARCHAR(20) | W, RECEIPT | RECEIPT/REVERSAL |
| purpose | VARCHAR(20) | W | DP/SETTLEMENT/ADD_ON/CORRECTION |
| claimed_amount | BIGINT UNSIGNED | N | Klaim pasien asli, bukan uang terverifikasi |
| amount | BIGINT UNSIGNED | W | Aktual >0 |
| method | VARCHAR(20) | W | TRANSFER/QR/CASH |
| status | VARCHAR(40) | W | Enum payment |
| reference | VARCHAR(150) | N | Ref bank/QR; bukan selalu unik lintas bank |
| sender_name | VARCHAR(150) | N | Transfer bila ada; tidak wajib CASH |
| received_at | DATETIME(6) | N | Wajib sebelum VERIFIED; tanggal uang sebenarnya |
| verified_at | DATETIME(6) | N | Wajib jika VERIFIED |
| verified_by | CHAR(36) | N | FK users; tidak auto-job SLA |
| submitted_by | CHAR(36) | W | FK users |
| reversal_of_id | CHAR(36) | N | FK payment_transactions, hanya REVERSAL |
| correction_group_id | CHAR(36) | N | UUID korelasi, bukan FK |
| reason | VARCHAR(500) | N | Wajib reject/reversal/correction |

Index/constraint: UNIQUE(reversal_of_id), INDEX(billing_account_id,received_at), INDEX(status,created_at). PENDING boleh status berubah via event; VERIFIED immutable termasuk amount/received_at. Koreksi: VERIFIED asal + VERIFIED REVERSAL minus + RECEIPT replacement positif, bukan mengubah asal lalu mengurangi lagi. Bila nilai benar0 (uang sebenarnya tidak diterima), buat reversal saja tanpa replacement/receipt0; ini koreksi fakta, bukan refund.

## payment_events
Log keputusan bukti/nominal/SLA/correction.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| payment_transaction_id | CHAR(36) | W | FK payment_transactions |
| actor_id | CHAR(36) | N | FK users, null job SLA |
| event_type | VARCHAR(60) | W | SUBMITTED/VERIFIED/REJECTED/CORRECTED/SLA_MARKED |
| from_status | VARCHAR(40) | N | Sebelumnya |
| to_status | VARCHAR(40) | W | Sesudah |
| reason | VARCHAR(500) | N | Wajib reject/correction |

Index/constraint: INDEX(payment_transaction_id,created_at).

## private_files
Metadata file tidak hilang saat blob dipurge.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| storage_key | VARCHAR(255) | W | Private disk path acak |
| mime_type | VARCHAR(100) | W | MIME sebenarnya |
| size_bytes | BIGINT UNSIGNED | W | Batas upload server |
| checksum_sha256 | CHAR(64) | W | Dedup signal, bukan bukti transfer identik |
| uploaded_by | CHAR(36) | W | FK users |
| uploaded_at | DATETIME(6) | W | Anchor retensi |
| expires_at | DATETIME(6) | W | +1tahun, file export boleh lebih singkat |
| purged_at | DATETIME(6) | N | Tombstone |
| purpose | VARCHAR(30) | W | PAYMENT_PROOF/EXPENSE/EXPORT |

Index/constraint: UNIQUE(storage_key), INDEX(expires_at,purged_at).

## payment_proofs
Versi unggahan; reupload bukan penerimaan uang kedua.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| payment_transaction_id | CHAR(36) | W | FK payment_transactions |
| file_id | CHAR(36) | W | FK private_files |
| version | INT UNSIGNED | W | Nomor koreksi |
| received_at | DATETIME(6) | W | Server menerima lengkap |
| decision | VARCHAR(20) | W, PENDING | PENDING/APPROVED/REJECTED/SUPERSEDED |
| decision_reason | VARCHAR(500) | N | Wajib ditolak |

Index/constraint: UNIQUE(payment_transaction_id,version), UNIQUE(file_id).

## receipts
Bukti penerimaan immutable. Bukan perhitungan ulang saldo setiap kali dicetak.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| payment_transaction_id | CHAR(36) | W | FK payment_transactions VERIFIED RECEIPT |
| receipt_number | VARCHAR(60) | W | Nomor unik |
| issued_at | DATETIME(6) | W | Waktu terbit |
| snapshot | JSON | W | Jumlah diterima, total/balance saat terbit, identitas/template |
| correction_of_receipt_id | CHAR(36) | N | FK receipts untuk pengganti berjejak |

Index/constraint: UNIQUE(receipt_number), UNIQUE(payment_transaction_id). Admin memakai proyeksi invoice tanpa saldo; receipt lengkap hanya pasien/owner.

## report_deliveries
Metadata administratif hasil; tidak ada kewajiban upload file klinis.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| billing_account_id | CHAR(36) | W | FK billing_accounts |
| assessment_case_id | CHAR(36) | N | FK assessment_cases |
| appointment_id | CHAR(36) | N | FK appointments Konseling |
| included | BOOLEAN | W | True asesmen, false laporan Konseling add-on |
| status | VARCHAR(20) | W, REQUESTED | REQUESTED/READY/DELIVERED |
| delivery_method | VARCHAR(20) | W, OFFLINE | Scope default OFFLINE |
| issued_by | CHAR(36) | N | FK users, praktisi |
| delivered_at | DATETIME(6) | N | Waktu serah |
| administrative_note | VARCHAR(500) | N | Tidak memuat hasil tes |

Index/constraint: INDEX(billing_account_id,status); validasi tepat satu konteks case/appointment dan patient cocok.

## reviews
Satu review per billing account, bukan per pertemuan asesmen.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| billing_account_id | CHAR(36) | W | FK billing_accounts |
| author_user_id | CHAR(36) | W | FK users |
| rating | TINYINT UNSIGNED | W | CHECK1–5 |
| comment | VARCHAR(2000) | N | Sanitasi |
| is_anonymous | BOOLEAN | W, false | Proyeksi publik tanpa IDs |
| status | VARCHAR(30) | W, PENDING_MODERATION | PENDING_MODERATION/APPROVED/REJECTED |
| version | INT UNSIGNED | W, 1 | Edit masuk moderasi ulang |
| moderated_by | CHAR(36) | N | FK users |
| moderated_at | DATETIME(6) | N | Moderasi |
| moderation_reason | VARCHAR(500) | N | Wajib reject |

Index/constraint: UNIQUE(billing_account_id), INDEX(status,created_at). Versi sebelum/sesudah edit disimpan audit teredaksi.

## expenses
Pengeluaran owner, append-only termasuk koreksi.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| expense_date | DATE | W | WIB aktual |
| category | VARCHAR(30) | W | RENT/ELECTRICITY/INTERNET/SUPPLIES/OPERATIONS/STAFF/OTHER |
| description | VARCHAR(500) | W | Deskripsi |
| amount | BIGINT UNSIGNED | W | Positif |
| entry_type | VARCHAR(20) | W, EXPENSE | EXPENSE/REVERSAL |
| reversal_of_id | CHAR(36) | N | FK expenses |
| correction_group_id | CHAR(36) | N | UUID korelasi |
| attachment_file_id | CHAR(36) | N | FK private_files |
| notes | TEXT | N | Catatan owner |
| created_by | CHAR(36) | W | FK users role PSYCHOLOGIST |
| reason | VARCHAR(500) | N | Wajib koreksi |

Index/constraint: UNIQUE(reversal_of_id), INDEX(expense_date,category). Status POSTED konseptual: setiap insert sah posted; tidak menyimpan status yang tak punya alur draft.

## notification_outbox
Event commit yang menunggu dispatch.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| event_key | VARCHAR(150) | W | Dedupe event |
| event_type | VARCHAR(80) | W | Template event |
| resource_type | VARCHAR(60) | W | Whitelist appointment/billing/calendar |
| resource_id | CHAR(36) | W | Polymorphic, bukan FK; service memvalidasi |
| resource_version | INT UNSIGNED | N | Versi jadwal |
| payload | JSON | W | Administratif minimal |
| dispatched_at | DATETIME(6) | N | Belum jika null |

Index/constraint: UNIQUE(event_key), INDEX(dispatched_at,created_at).

## notifications
Satu delivery per event/penerima/kanal; in-app read state termasuk.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| outbox_id | CHAR(36) | W | FK notification_outbox |
| recipient_user_id | CHAR(36) | N | FK users; wajib IN_APP/EMAIL, boleh null khusus WHATSAPP kontak tanpa akun |
| recipient_phone_snapshot | VARCHAR(25) | N | Nomor tujuan wajib WHATSAPP, disnapshot; bukan fallback dari user sembarang |
| tele_service_link_id | CHAR(36) | N | FK tele_service_links; wajib untuk template link Google Meet |
| channel | VARCHAR(20) | W | IN_APP/WHATSAPP/EMAIL |
| template_key | VARCHAR(80) | W | Template berizin |
| deduplication_key | VARCHAR(180) | W | Event+penerima+kanal+versi |
| status | VARCHAR(20) | W, QUEUED | Enum notification |
| attempt_count | INT UNSIGNED | W, 0 | Jumlah coba |
| next_retry_at | DATETIME(6) | N | Backoff |
| sent_at | DATETIME(6) | N | Acknowledgment |
| read_at | DATETIME(6) | N | In-app |
| last_error | VARCHAR(500) | N | Tanpa token/credential |
| provider_reference | VARCHAR(150) | N | Identitas eksternal |

Index/constraint: UNIQUE(deduplication_key), INDEX(status,next_retry_at), INDEX(recipient_user_id,created_at).
CHECK kanal IN_APP/EMAIL membutuhkan recipient_user_id; WHATSAPP membutuhkan recipient_phone_snapshot. Policy GET notifikasi sendiri tidak memasukkan row tanpa akun atau nomor kontak lain. Template Meet memeriksa link_id, appointment/attempt/versi dan penerima sebelum dispatch; outbox membawa ID referensi, bukan URL Meet lengkap dalam payload/log generik.

## tele_service_links
Revisi privat tautan Google Meet per appointment/usaha sesi. Latest version pada attempt aktif menjadi satu sumber tautan yang berlaku; tidak memakai is_current paralel.
Tabel immutable: id dan created_at dari common, tanpa updated_at. Semua FK ON DELETE/UPDATE RESTRICT.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| appointment_id | CHAR(36) | W | FK appointments, delivery_mode versi paket harus TELE_SERVICE |
| attempt_number | INT UNSIGNED | W | Usaha appointment saat link disimpan; server |
| version | INT UNSIGNED | W | Revisi monotonik per appointment+attempt |
| meeting_url | TEXT | W | Nilai terenkripsi at rest; validasi HTTPS host meet.google.com sebelum enkripsi |
| recipient_phone | VARCHAR(25) | W | Nomor internasional pasien/penanggung jawab yang dikonfirmasi |
| recipient_user_id | CHAR(36) | N | FK users bila penerima punya akses akun; tidak memaksa walk-in membuat akun |
| recipient_confirmed_at | DATETIME(6) | W | Penerimaan tujuan dari booking atau konfirmasi nyata saat nomor diperbaiki; server |
| created_by | CHAR(36) | W | FK users role ADMIN/PSYCHOLOGIST |
| reason | VARCHAR(500) | W | Pembuatan/perubahan/konfirmasi ulang; tanpa isi klinis |

Index/constraint: UNIQUE(appointment_id,attempt_number,version), INDEX(recipient_user_id,created_at); FK index common berlaku. Lock appointment sebelum menyimpan revisi + audit terfilter + outbox. Angka expected_link_version dari client bukan nomor versi final. Kesamaan URL/nomor pada versi aktif tidak membuat revisi/kiriman baru dari save biasa; pengiriman ulang sengaja melalui action resend idempotent beralasan.
Status READY/NEEDS_LINK derived dari revisi untuk attempt aktif; status kirim hanya notifications. Reschedule membatalkan delivery lama dan memerlukan link baru/konfirmasi ulang untuk attempt baru. URL sama boleh disalin ke revisi usaha baru setelah Admin mengonfirmasi. Booking cancelled/expired/terminal atau requires_reschedule tidak mengirim antrean link. Audit tidak menyalin URL lengkap; histori bukan tautan gabung aktif.

## audit_logs
Event lintas fitur append-only. Bukan tabel untuk membaca jawaban klinis.
Tabel immutable: hanya id dan created_at dari kolom common; insert-only.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| actor_id | CHAR(36) | N | FK users, null sistem |
| action | VARCHAR(100) | W | Whitelist aksi |
| resource_type | VARCHAR(60) | W | Whitelist tabel domain |
| resource_id | CHAR(36) | W | Polymorphic validasi service |
| old_value | JSON | N | Terfilter |
| new_value | JSON | N | Terfilter |
| reason | VARCHAR(500) | N | Sesuai aksi |
| request_id | VARCHAR(80) | W | Trace |
| ip_address | VARCHAR(45) | N | IPv4/v6 |

Index/constraint: INDEX(resource_type,resource_id,created_at), INDEX(actor_id,created_at).

## cms_contents
Konten terstruktur dan naskah consent versi tertentu.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| section_key | VARCHAR(80) | W | Landing/profil/consent dll |
| version | INT UNSIGNED | W | Versi |
| payload | JSON | W | Schema section |
| status | VARCHAR(20) | W, DRAFT | DRAFT/PUBLISHED/ARCHIVED |
| published_at | DATETIME(6) | N | Waktu publish |
| published_guard | VARCHAR(80) generated | N | section_key jika status=PUBLISHED, selainnya NULL |
| updated_by | CHAR(36) | W | FK users |

Index/constraint: UNIQUE(section_key,version), UNIQUE(published_guard), INDEX(section_key,status). Publish mengarsipkan versi lama dan menerbitkan versi baru atomik; unique generated memastikan satu versi published per section. row_version common berbeda dari version konten CMS.

## tutorial_contents
Materi tutorial per role dan versi.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| content_key | VARCHAR(80) | W | Kunci materi |
| role | VARCHAR(40) | W | GUEST/PATIENT/ADMIN/PSYCHOLOGIST |
| version | INT UNSIGNED | W | Versi |
| title | VARCHAR(180) | W | Judul |
| steps | JSON | W | Langkah dan selector opsional |
| video_url | VARCHAR(500) | N | URL berizin |
| is_active | BOOLEAN | W, true | Publikasi |

Index/constraint: UNIQUE(content_key,role,version).

## tutorial_progress
Progres akun, Guest cukup progres lokal non-sensitif.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| user_id | CHAR(36) | W | FK users |
| tutorial_content_id | CHAR(36) | W | FK tutorial_contents |
| last_step | INT UNSIGNED | W, 0 | Batas jumlah steps |
| completed_at | DATETIME(6) | N | Complete |
| skipped_at | DATETIME(6) | N | Skip |

Index/constraint: UNIQUE(user_id,tutorial_content_id).

## export_jobs
Metadata export dan snapshot as_of.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| requested_by | CHAR(36) | W | FK users |
| kind | VARCHAR(30) | W | SCHEDULE/FINANCE |
| filters | JSON | W | Whitelist filter |
| as_of | DATETIME(6) | W | Snapshot data |
| dataset_snapshot | JSON | W | Dataset sesuai role/filter dibekukan pada request export dalam consistent read; worker memformat snapshot ini, bukan mengambil data hidup ulang |
| status | VARCHAR(20) | W, QUEUED | QUEUED/READY/FAILED/EXPIRED |
| file_id | CHAR(36) | N | FK private_files |
| expires_at | DATETIME(6) | N | Hak unduh |
| error | VARCHAR(500) | N | Tanpa data sensitif |

Index/constraint: INDEX(requested_by,created_at). filters/as_of/dataset_snapshot/requested_by tidak diedit setelah request dibuat; hanya status/file/error yang dapat diupdate sesuai guard. Snapshot bukan sumber transaksi baru.

## idempotency_requests
Mencegah retry mutasi membuat penerimaan/booking ganda.
Tabel mutable: id, created_at, updated_at mengikuti common.

| Kolom | Tipe | W/N dan default | FK / aturan |
|---|---|---|---|
| actor_id | CHAR(36) | W | FK users |
| scope | VARCHAR(120) | W | Endpoint+target |
| request_key | VARCHAR(100) | W | Header Idempotency-Key |
| payload_hash | CHAR(64) | W | Canonical request hash |
| status | VARCHAR(20) | W, PROCESSING | PROCESSING/COMPLETED |
| response_status | SMALLINT UNSIGNED | N | HTTP status |
| response_snapshot | JSON | N | Response role-specific, bukan semua field |
| expires_at | DATETIME(6) | W | Dedupe minimal selama retry window kebijakan operasi |

Index/constraint: UNIQUE(actor_id,scope,request_key). Key expired tidak menggantikan unique bisnis pada invoice/session/reference reversal.

## Transaction, insert order dan sumber kebenaran
1. Tidak ada FK melingkar: pasien -> case/plan -> appointment -> billing account -> invoice/lines -> payment/proofs/receipt. Untuk asesmen, case dibuat sebelum appointment, billing account mengacu case; tidak menaruh billing_account_id balik ke case.
   Untuk modul Telelayanan, buat tabel tele_service_links setelah appointments/users dan sebelum notifications yang mereferensikannya. Insert booking -> link revision -> outbox/delivery; tidak ada FK balik dari link ke delivery. Definisi tabel pada kamus bukan urutan migration otomatis.
2. Draft pre-test dan consent dapat tanpa appointment. Sesudah appointment dibuat, bind sekali dalam transaction; gagal transaksi tidak meninggalkan reservasi atau tagihan separuh.
3. Booking dan reschedule lock schedule_resources untuk semua tanggal yang tersentuh, urut (psychologist_id,local_date). Kemudian appointment/request/billing lock dengan urutan konsisten. Jika deadlock sementara, retry terbatas dengan key idempotency sama.
   Untuk seluruh operasi lintas jadwal/uang gunakan urutan resource-hari -> treatment_plan (bila perlu mengalokasikan/mengubah unit) -> appointment (urut id) -> reschedule_request -> billing_account -> payment -> sequence dokumen. Langkah yang tidak diperlukan boleh dilewati; jangan mengambil plan sesudah appointment bila keduanya perlu dimutasi. Operasi hanya uang tidak boleh mengunci billing dahulu lalu appointment; ambil appointment terkait lebih dahulu. Jangan memakai dua urutan yang berlawanan pada jalur verify dan reschedule. Alokasi sesi lanjutan mengunci plan sebelum appointment agar nomor unit tidak dipakai dua request berbeda; complete/discontinue mengikuti urutan yang sama; jika perlu seluruh appointment/resource, ambil sebelum billing, bukan membalik urutan lock.
4. Cek overlap: existing.start_at < candidate.end_at AND existing.end_at > candidate.start_at. Mengokupansi: WAITING_PAYMENT yang belum expired, WAITING_VERIFICATION termasuk koreksi sah, CONFIRMED, CONFIRMED_AUTO_SLA, CHECKED_IN, IN_CONSULTATION. requires_reschedule tidak membuatnya tersedia bagi orang lain sebelum resolusi.
5. Expiry, unggah bukti, verifikasi, check-in dan auto-confirm lock appointment yang sama, memeriksa waktu server/status lagi. Tidak boleh satu job melepas slot sementara upload tepat waktu memenangkan status lain.
6. Lock billing_accounts ketika menambah invoice/discount, verifikasi/correction, atau revisi additional time. Hitung total/paid/minimum/overpaid di bawah lock yang sama. Tidak ada global mutable payment_status untuk satu pasien.
7. Revisi additional time total yang sama tidak menambah biaya; perpindahan0->5menit menghasilkan1blok, 5->10tetap1blok,10->40menjadi3blok sehingga selisih2blok ditagih. Perhitungan dilakukan per appointment+attempt yang benar-benar melayani.
   reschedule_count hanya field DTO derived dari SUM(quota_effect) request APPLIED untuk appointment itu. Tidak ada kolom counter editable kedua. Hitung di bawah lock appointment yang sama; maksimum tiga untuk asal PATIENT. appointment_version pada request adalah snapshot row_version saat submit, bukan alasan menolak hak pasien hanya karena pembayaran kemudian diverifikasi; apply memeriksa interval+attempt serta row_version terkini dari form.
8. Semua output role memakai allowlist DTO. Admin: harga/diskon/total; tidak total_paid, remaining_amount, overpaid_amount atau receipt snapshot lengkap. Status minimum terpenuhi boleh boolean; tidak memberi diagnosis/answers atau finance praktik.
9. Audit/outbox dibuat satu commit bersama perubahan. Akses file memeriksa pemilik, purpose, expiry blob dan cutoff download; UUID bukan otorisasi.
10. Laporan kas = SUM RECEIPT VERIFIED minus SUM REVERSAL VERIFIED berdasarkan received_at. Original yang dibalik tetap VERIFIED, sehingga jangan sekaligus menghilangkannya dan mengurangi reversal. Replacement mengisi nilai benar; bukan uang kembali.
11. Invoice net boleh negatif untuk dokumen pengurang berjejak, tetapi agregat kewajiban billing account tidak boleh negatif. Diskon tidak boleh melebihi total yang dapat dikurangi dan tidak menyelesaikan selisih uang secara diam-diam.

## Pembatalan Seluruh Sisa Layanan Setelah Lunas
Pembatalan/discontinue memakai transaction dan urutan lock resource-hari -> plan/case -> seluruh appointment/request berurutan -> seluruh billing terkait. Periksa net kewajiban terhadap penerimaan VERIFIED pada setiap invoice sah terbentuk. Bila ada sisa tolak409 PAYMENT_REQUIRED_BEFORE_CANCELLATION; tidak menerbitkan adjustment pelepasan sisa. Sesi yang belum dipesan tidak dibuatkan invoice demi pembatalan.
Setelah seluruh tagihan terbentuk lunas, hentikan seluruh sisa appointment terkait dan plan/case atomik; completed, invoice, receipt dan ledger tetap. collection_status=CLOSED_PAID menutup penagihan layanan batal yang telah dibayar, bukan menyatakan layanan selesai. Rangkaian lain tidak terpengaruh. Versi dan idempotency mencegah aksi rangkap.
Expiry hold teknis/jendela reschedule tidak menghapus kas/utang atau membatalkan layanan berbayar otomatis. Request sah diselesaikan dahulu; uang/bukti terlambat direkonsiliasi tanpa mengambil slot lain. Data historis tidak ditulis ulang menjadi aturan baru.

## Infrastruktur Laravel dan storage
Tabel framework (sessions, password_reset_tokens, jobs, failed_jobs, cache jika driver database) mengikuti migration resmi Laravel versi terpasang; bukan tabel domain UUID. user_id pada sessions harus CHAR(36) kompatibel users.id, nullable untuk Guest. Token reset disimpan hash. Tidak ada personal_access_tokens untuk autentikasi browser yang telah disepakati berbasis cookie.
File publik CMS terpisah dari private_files, tidak boleh dipakai mengunggah bukti/hasil klinis. Backup terenkripsi dan tombstone retensi berada pada kebijakan deployment F15. Dokumen ini tidak menentukan penghapusan record medis berdasarkan batas satu tahun file operasional.

## Data awal dan guard integrasi
Seed hanya identitas praktik placeholder, kategori/paket F04, satu owner dan konfigurasi operasional. Durasi belum pasti tidak diisi angka karangan demi menampilkan slot. Telelayanan Google Meet dapat bookable setelah konfigurasi wajib paket/kalender/basis tarif valid; kontak WA dikonfirmasi pada booking. Link pertemuan diisi Admin setelah reservasi, bukan syarat harus sudah ada pada katalog.
Nama DTO tidak harus sama dengan nama tabel, tetapi field, unit, enum dan mapping harus eksplisit di API. Tidak ada foreignId integer yang mengarah ke UUID pasien/users.

Kuota yang diturunkan tidak menghapus reservasi sah; hentikan tambahan booking. IN_CONSULTATION tanpa actual_ended_at memblokir walk-in yang dimulai sekarang walaupun scheduled end sudah lewat. Penanganan keterlambatan jadwal harus eksplisit F05/F10.

Additional time entry hanya untuk IN_CONSULTATION/COMPLETED dan menit aktual yang telah terjadi. claimed_amount dipertahankan untuk membandingkan klaim pasien dengan amount aktual petugas; hanya amount VERIFIED masuk laporan.
Kelebihan bayar tetap dapat dihitung dari ledger aktual, tetapi tidak mempunyai tabel/status resolusi, tiket, refund, wallet atau credit. Penanganannya di luar sistem; kolom overpayment_resolution tidak menjadi bagian schema aktif.

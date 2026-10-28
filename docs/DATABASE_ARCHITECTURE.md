<!-- Kamus aktif diselaraskan dengan migration auth_version dan penutupan historis pada26Oktober2026. -->
# Kamus arsitektur database — 24 Oktober 2026

Schema telah dituangkan dalam migration dan Eloquent model; controller bisnis belum dibuat. Otoritas aturan: [keputusan aktif](KEPUTUSAN_AKTIF_2026-10-24.md). Berkas [manifest schema](../database/schema/domain-schema.json) memuat nama tabel/kolom, tipe, enum, FK, index dan CHECK yang sesuai tahap ini. Migration adalah DDL yang dijalankan, bukan SQL contoh terpisah yang boleh berbeda.

## Target dan konvensi
- MySQL 8.0.16+ dengan CHECK enforced; diverifikasi pada MySQL8.4 lokal. InnoDB, utf8mb4_unicode_ci. SQLite bukan pengganti validasi schema ini.
- 49 tabel domain termasuk users; delapan tabel teknis Laravel menjadikan total57 termasuk repository migrations. Ada49 model konkret, bukan model untuk cache/jobs/session.
- PK domain id CHAR(36) UUIDv4; identifier bukan kontrol akses. Eloquent menghasilkan UUID; jangan memakai empat digit timestamp atau nomor urut publik sebagai PK.
- Semua domain mempunyai created_at DATETIME(6), wajib. Tabel mutable juga updated_at DATETIME(6) dan row_version INT UNSIGNED DEFAULT1. Tabel immutable tidak mempunyai updated_at/row_version. Nama common ini tidak diulang pada setiap tabel di bawah.
- DATETIME disimpan UTC; DATE/local_date dan TIME mengacu kalender Asia/Jakarta sesuai konteks. Aplikasi timezone UTC; input WIB dikonversi server, bukan offset browser yang dipercaya. Laravel model memakai format mikrodetik.
- Rupiah integer, bukan FLOAT/DECIMAL pecahan. Nominal kas/klaim dibedakan. BIGINT signed hanya ketika delta kewajiban dapat negatif; tidak ada uang masuk negatif tanpa entry REVERSAL.
- W=wajib NOT NULL; N=nullable; setelah koma adalah DEFAULT DB. Tidak ada angka0 sebagai pengganti FK atau tanggal fiktif. JSON terenkripsi menggunakan LONGTEXT, karena ciphertext bukan JSON SQL.
- FK domain memakai RESTRICT ON UPDATE/DELETE. Koreksi/status/tombstone mempertahankan histori. Semua FK mempunyai index prefix yang sesuai. FK ditambahkan setelah seluruh tabel terbentuk agar dependensi tidak membuat urutan migration buntu.
- Unique nullable guard menerapkan satu owner aktif, satu plan aktif/menunggu administrasi, satu request aktif, satu invoice BASE, satu base service, satu versi CMS published. Banyak NULL boleh; guard bukan enum status kedua.

## Relasi utama dan pemilik fakta
users adalah identitas login/petugas, patient_profiles adalah orang yang dilayani. patient_accesses menghubungkan penanggung jawab dan profil; offline dapat hanya profil tanpa akun/email palsu. Kesamaan nama/telepon bukan dasar menggabungkan profil otomatis.
appointments adalah satu interval nyata. assessment_cases menaungi beberapa appointment dalam satu harga; treatment_plans menaungi sesi psikoterapi dengan invoice per sesi. billing_accounts dimiliki tepat satu appointment atau satu case, bukan dua FK aktif sekaligus. CUSTOM INCLUDED memakai appointment_billing_links ke billing asal; CUSTOM NOT_REQUIRED tidak membuat billing/penerimaan.
invoices/billing_line_items adalah kewajiban terbit; payment_transactions adalah uang aktual/claim; payment_allocations adalah atribusi kas ke invoice dalam satu kesepakatan, bukan uang baru. receipts merujuk penerimaan verified saja. Tidak menyimpan remaining_balance/paid_amount di appointment sebagai sumber kedua; summary dihitung dari invoice/adjustment, kas bersih dan alokasi.
payment_agreements menyimpan kesepakatan per sesi dan billing anchor. Invoice sesi belum dipesan tidak dibuat hanya karena agreement empat sesi. Semua uang dicatat satu kali pada transaksi asal; alokasi mempunyai idempotency dan reversal sendiri.

## Katalog tabel domain
| Tabel | Model | Sifat |
|---|---|---|
| users | User | Mutable dengan row_version |
| auth_identities | AuthIdentity | Mutable dengan row_version |
| owner_settings | OwnerSetting | Mutable dengan row_version |
| patient_profiles | PatientProfile | Mutable dengan row_version |
| patient_accesses | PatientAccess | Mutable dengan row_version |
| consultation_packages | ConsultationPackage | Mutable dengan row_version |
| package_versions | PackageVersion | Append-only |
| calendar_versions | CalendarVersion | Append-only |
| weekly_schedule_limits | WeeklyScheduleLimit | Append-only |
| weekly_schedules | WeeklySchedule | Append-only |
| schedule_overrides | ScheduleOverride | Append-only |
| schedule_override_intervals | ScheduleOverrideInterval | Append-only |
| schedule_resources | ScheduleResource | Mutable dengan row_version |
| operational_changes | OperationalChange | Append-only |
| assessment_cases | AssessmentCase | Mutable dengan row_version |
| treatment_plans | TreatmentPlan | Mutable dengan row_version |
| appointments | Appointment | Mutable dengan row_version |
| appointment_events | AppointmentEvent | Append-only |
| operational_change_impacts | OperationalChangeImpact | Mutable dengan row_version |
| reschedule_requests | RescheduleRequest | Mutable dengan row_version |
| reschedule_events | RescheduleEvent | Append-only |
| pretest_templates | PretestTemplate | Append-only |
| pretest_submissions | PretestSubmission | Mutable dengan row_version |
| consents | Consent | Mutable dengan row_version |
| billing_accounts | BillingAccount | Mutable dengan row_version |
| document_sequences | DocumentSequence | Mutable dengan row_version |
| invoices | Invoice | Append-only |
| billing_line_items | BillingLineItem | Append-only |
| additional_time_entries | AdditionalTimeEntry | Append-only |
| payment_transactions | PaymentTransaction | Mutable dengan row_version |
| payment_events | PaymentEvent | Append-only |
| private_files | PrivateFile | Mutable dengan row_version |
| payment_proofs | PaymentProof | Mutable dengan row_version |
| receipts | Receipt | Append-only |
| report_deliveries | ReportDelivery | Mutable dengan row_version |
| reviews | Review | Mutable dengan row_version |
| expenses | Expense | Append-only |
| notification_outbox | NotificationOutbox | Mutable dengan row_version |
| notifications | Notification | Mutable dengan row_version |
| tele_service_links | TeleServiceLink | Append-only |
| audit_logs | AuditLog | Append-only |
| cms_contents | CmsContent | Mutable dengan row_version |
| tutorial_contents | TutorialContent | Mutable dengan row_version |
| tutorial_progress | TutorialProgress | Mutable dengan row_version |
| export_jobs | ExportJob | Mutable dengan row_version |
| idempotency_requests | IdempotencyRequest | Mutable dengan row_version |
| payment_agreements | PaymentAgreement | Append-only |
| payment_allocations | PaymentAllocation | Append-only |
| appointment_billing_links | AppointmentBillingLink | Append-only |

## users
Model: app/Models/User.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| name | VARCHAR(150) | W | Nama akun |
| email | VARCHAR(254) | N | Unik bila diisi; walk-in tanpa akun tidak diberi email palsu |
| password_hash | VARCHAR(255) | N | Null jika Google-only |
| role | VARCHAR(40) | W, PATIENT | Publik tidak boleh override |
| status | VARCHAR(40) | W, ACTIVE | Blocked untuk semua metode |
| phone | VARCHAR(25) | N | Kontak akun |
| email_verified_at | DATETIME(6) | N | Bukti kepemilikan email |
| last_login_at | DATETIME(6) | N | Waktu login |
| auth_version | INT UNSIGNED | W, 1 | Pencabutan sesi melalui versi; bukan role dari frontend |
| remember_token | VARCHAR(100) | N | Teknis Laravel, disembunyikan pada serialisasi |
| active_owner_guard | TINYINT UNSIGNED generated | N | CASE WHEN role='PSYCHOLOGIST' AND status='ACTIVE' THEN 1 ELSE NULL END; UNIQUE |

Index/unique (selain PK):
- UNIQUE (email) — users_email_unique.
- UNIQUE (active_owner_guard) — uq_users_single_active_owner.

CHECK SQL:
- `role IN ('PATIENT','ADMIN','PSYCHOLOGIST')`.
- `status IN ('ACTIVE','BLOCKED')`.
- `row_version > 0`.
- `role='PATIENT' OR (email IS NOT NULL AND CHAR_LENGTH(TRIM(email))>0)`.

## auth_identities
Model: app/Models/AuthIdentity.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| user_id | CHAR(36) | W | FK users |
| provider | VARCHAR(20) | W | GOOGLE |
| subject | VARCHAR(255) | W | Provider sub |
| linked_at | DATETIME(6) | W | Sesudah verifikasi akun |

Index/unique (selain PK):
- UNIQUE (provider, subject) — uq_auth_identities_provider_subject.
- UNIQUE (user_id, provider) — uq_auth_identities_user_id_provider.

Foreign key:
- user_id → users.id, fk_auth_identities_user_id, RESTRICT.

CHECK SQL:
- `provider = 'GOOGLE'`.
- `row_version > 0`.

## owner_settings
Model: app/Models/OwnerSetting.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| singleton_key | TINYINT UNSIGNED | W, 1 | CHECK =1 |
| owner_user_id | CHAR(36) | W | FK users; role PSYCHOLOGIST |
| practice_identity | JSON | W | Nama/alamat/logo/rekening/nomor placeholder; snapshot di invoice |
| timezone | VARCHAR(64) | W, Asia/Jakarta | Tidak dikendalikan browser |
| grace_minutes | INT UNSIGNED | W, 15 | Default operasional |
| selection_window_hours | INT UNSIGNED | W, 24 | Default pemilihan reschedule |
| proof_correction_hours | INT UNSIGNED | W, 24 | Default koreksi bukti; dibatasi awal sesi |
| wa_owner_phone | VARCHAR(25) | N | Legacy, tidak dibaca pengiriman; tujuan owner canonical users.phone privat |
| online_lead_working_minutes | INT UNSIGNED | W, 180 | Tiga jam kerja penuh; snapshot setiap reservasi |
| reminder_lead_minutes | INT UNSIGNED | W, 120 | Dua jam waktu biasa sebelum sesi |
| payment_hold_hours | INT UNSIGNED | W, 24 | Batas maksimum hold awal |
| initial_payment_mode | VARCHAR(20) | W, PERCENT | FIXED/PERCENT; default 50% mengikuti ide Desman, forward migration000930 |
| initial_payment_fixed_amount | BIGINT UNSIGNED | W, 100000 | Parameter FIXED opsional; dibatasi net dasar, bukan default mode aktif |
| initial_payment_basis_points | SMALLINT UNSIGNED | W, 5000 | 5000 basis poin =50%, default pemilik; bukan pengganti snapshot tagihan |

Index/unique (selain PK):
- UNIQUE (singleton_key) — uq_owner_settings_singleton_key.
- UNIQUE (owner_user_id) — uq_owner_settings_owner_user_id.

Foreign key:
- owner_user_id → users.id, fk_owner_settings_owner_user_id, RESTRICT.

CHECK SQL:
- `singleton_key = 1`.
- `timezone = 'Asia/Jakarta'`.
- `online_lead_working_minutes > 0`.
- `reminder_lead_minutes > 0`.
- `payment_hold_hours > 0`.
- `initial_payment_basis_points BETWEEN 1 AND 10000`.
- `initial_payment_fixed_amount > 0`.
- `initial_payment_mode IN ('FIXED', 'PERCENT')`.
- `row_version > 0`.

Cast initial_payment_mode: App/Enums/InitialPaymentMode.php, nilai FIXED/PERCENT.

## patient_profiles
Model: app/Models/PatientProfile.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- INDEX (full_name) — ix_patient_profiles_full_name.
- INDEX (phone) — ix_patient_profiles_phone.

CHECK SQL:
- `row_version > 0`.

## patient_accesses
Model: app/Models/PatientAccess.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| account_user_id | CHAR(36) | W | FK users |
| patient_id | CHAR(36) | W | FK patient_profiles |
| relationship | VARCHAR(50) | W | SELF/PARENT/RESPONSIBLE/OTHER |
| status | VARCHAR(20) | W, ACTIVE | ACTIVE/REVOKED |
| verified_by | CHAR(36) | N | FK users; Admin untuk klaim |
| verified_at | DATETIME(6) | N | Waktu verifikasi |
| reason | VARCHAR(500) | N | Wajib untuk klaim/revoke |

Index/unique (selain PK):
- UNIQUE (account_user_id, patient_id) — uq_patient_accesses_account_user_id_patient_id.
- INDEX (patient_id) — ix_patient_accesses_patient_id.
- INDEX (verified_by) — ix_patient_accesses_verified_by.

Foreign key:
- account_user_id → users.id, fk_patient_accesses_account_user_id, RESTRICT.
- patient_id → patient_profiles.id, fk_patient_accesses_patient_id, RESTRICT.
- verified_by → users.id, fk_patient_accesses_verified_by, RESTRICT.

CHECK SQL:
- `relationship IN ('SELF', 'PARENT', 'RESPONSIBLE', 'OTHER')`.
- `status IN ('ACTIVE', 'REVOKED')`.
- `row_version > 0`.

Cast relationship: App/Enums/PatientRelationship.php, nilai SELF/PARENT/RESPONSIBLE/OTHER.

Cast status: App/Enums/PatientAccessStatus.php, nilai ACTIVE/REVOKED.

## consultation_packages
Model: app/Models/ConsultationPackage.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| service_code | VARCHAR(80) | W | Kode F04 |
| category | VARCHAR(30) | W | COUNSELING/ASSESSMENT/PSYCHOTHERAPY |
| is_active | BOOLEAN | W, true | Master aktif |
| created_by | CHAR(36) | W | FK users |

Index/unique (selain PK):
- UNIQUE (service_code) — uq_consultation_packages_service_code.
- INDEX (category, is_active) — ix_consultation_packages_category_is_active.
- INDEX (created_by) — ix_consultation_packages_created_by.

Foreign key:
- created_by → users.id, fk_consultation_packages_created_by, RESTRICT.

CHECK SQL:
- `category IN ('COUNSELING', 'ASSESSMENT', 'PSYCHOTHERAPY')`.
- `row_version > 0`.

Cast category: App/Enums/ServiceCategory.php, nilai COUNSELING/ASSESSMENT/PSYCHOTHERAPY.

## package_versions
Model: app/Models/PackageVersion.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- UNIQUE (package_id, version) — uq_package_versions_package_id_version.
- UNIQUE (package_id, effective_at) — uq_package_versions_package_id_effective_at.
- INDEX (effective_at) — ix_package_versions_effective_at.
- INDEX (created_by) — ix_package_versions_created_by.

Foreign key:
- package_id → consultation_packages.id, fk_package_versions_package_id, RESTRICT.
- created_by → users.id, fk_package_versions_created_by, RESTRICT.

CHECK SQL:
- `version > 0`.
- `normal_price > 0`.
- `promo_price IS NULL OR (promo_price > 0 AND promo_price < normal_price)`.
- `promo_starts_at IS NULL OR promo_ends_at IS NULL OR promo_ends_at > promo_starts_at`.
- `duration_minutes IS NULL OR duration_minutes > 0`.
- `is_bookable = 0 OR duration_minutes IS NOT NULL`.
- `duration_min_minutes IS NULL OR duration_max_minutes IS NULL OR duration_max_minutes >= duration_min_minutes`.
- `minimum_sessions > 0`.
- `delivery_mode IN ('OFFLINE', 'TELE_SERVICE')`.
- `additional_time_price_basis IS NULL OR additional_time_price_basis IN ('NORMAL_PRICE', 'FINAL_PRICE')`.
- `billing_mode IN ('PER_APPOINTMENT', 'PER_PACKAGE', 'PER_SESSION')`.

Cast delivery_mode: App/Enums/DeliveryMode.php, nilai OFFLINE/TELE_SERVICE.

Cast additional_time_price_basis: App/Enums/AdditionalTimePriceBasis.php, nilai NORMAL_PRICE/FINAL_PRICE.

Cast billing_mode: App/Enums/BillingMode.php, nilai PER_APPOINTMENT/PER_PACKAGE/PER_SESSION.

## calendar_versions
Model: app/Models/CalendarVersion.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| version | INT UNSIGNED | W | Monotonik |
| effective_at | DATETIME(6) | W | Mulai berlaku |
| created_by | CHAR(36) | W | FK users |
| reason | VARCHAR(500) | W | Alasan perubahan |

Index/unique (selain PK):
- UNIQUE (version) — uq_calendar_versions_version.
- INDEX (created_by) — ix_calendar_versions_created_by.

Foreign key:
- created_by → users.id, fk_calendar_versions_created_by, RESTRICT.

CHECK SQL:
- `version > 0`.

## weekly_schedule_limits
Model: app/Models/WeeklyScheduleLimit.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| calendar_version_id | CHAR(36) | W | FK calendar_versions |
| day_of_week | TINYINT UNSIGNED | W | 1–7 ISO |
| daily_limit | INT UNSIGNED | W | >0 untuk hari yang dibuka |

Index/unique (selain PK):
- UNIQUE (calendar_version_id, day_of_week) — uq_weekly_schedule_limits_calendar_version_id_day_of_week.

Foreign key:
- calendar_version_id → calendar_versions.id, fk_weekly_schedule_limits_calendar_version_id, RESTRICT.

CHECK SQL:
- `day_of_week BETWEEN 1 AND 7`.
- `daily_limit > 0`.

## weekly_schedules
Model: app/Models/WeeklySchedule.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| calendar_version_id | CHAR(36) | W | FK calendar_versions |
| day_of_week | TINYINT UNSIGNED | W | 1 Senin–7 Minggu |
| start_time | TIME | W | WIB |
| end_time | TIME | W | CHECK end>start |

Index/unique (selain PK):
- UNIQUE (calendar_version_id, day_of_week, start_time) — uq_weekly_schedules_calendar_version_id_day_of_we_d82bec82.

Foreign key:
- calendar_version_id → calendar_versions.id, fk_weekly_schedules_calendar_version_id, RESTRICT.

CHECK SQL:
- `day_of_week BETWEEN 1 AND 7`.
- `end_time > start_time`.

## schedule_overrides
Model: app/Models/ScheduleOverride.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| calendar_version_id | CHAR(36) | W | FK calendar_versions |
| local_date | DATE | W | Tanggal WIB |
| mode | VARCHAR(10) | W | OPEN/CLOSED |
| daily_limit | INT UNSIGNED | W | Positif untuk OPEN, 0 CLOSED |
| reason | VARCHAR(500) | W | Termasuk alasan buka hari libur |

Index/unique (selain PK):
- UNIQUE (calendar_version_id, local_date) — uq_schedule_overrides_calendar_version_id_local_date.

Foreign key:
- calendar_version_id → calendar_versions.id, fk_schedule_overrides_calendar_version_id, RESTRICT.

CHECK SQL:
- `(mode = 'OPEN' AND daily_limit IS NOT NULL AND daily_limit > 0) OR (mode = 'CLOSED' AND daily_limit = 0)`.
- `mode IN ('OPEN', 'CLOSED')`.

Cast mode: App/Enums/ScheduleOverrideMode.php, nilai OPEN/CLOSED.

## schedule_override_intervals
Model: app/Models/ScheduleOverrideInterval.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| override_id | CHAR(36) | W | FK schedule_overrides |
| start_time | TIME | W | Jam WIB |
| end_time | TIME | W | end>start |

Index/unique (selain PK):
- UNIQUE (override_id, start_time) — uq_schedule_override_intervals_override_id_start_time.

Foreign key:
- override_id → schedule_overrides.id, fk_schedule_override_intervals_override_id, RESTRICT.

CHECK SQL:
- `end_time > start_time`.

## schedule_resources
Model: app/Models/ScheduleResource.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| psychologist_id | CHAR(36) | W | FK users, role PSYCHOLOGIST |
| local_date | DATE | W | Tanggal WIB |

Index/unique (selain PK):
- UNIQUE (psychologist_id, local_date) — uq_schedule_resources_psychologist_id_local_date.

Foreign key:
- psychologist_id → users.id, fk_schedule_resources_psychologist_id, RESTRICT.

CHECK SQL:
- `row_version > 0`.

## operational_changes
Model: app/Models/OperationalChange.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| calendar_version_id | CHAR(36) | N | FK calendar_versions jika perubahan kalender |
| actor_id | CHAR(36) | W | FK users dari session |
| reason | VARCHAR(500) | W | Alasan |
| effective_at | DATETIME(6) | W | Tidak retroaktif |
| before_snapshot | JSON | W | Whitelist konfigurasi |
| after_snapshot | JSON | W | Konfigurasi baru |

Index/unique (selain PK):
- INDEX (effective_at) — ix_operational_changes_effective_at.
- INDEX (calendar_version_id) — ix_operational_changes_calendar_version_id.
- INDEX (actor_id) — ix_operational_changes_actor_id.

Foreign key:
- calendar_version_id → calendar_versions.id, fk_operational_changes_calendar_version_id, RESTRICT.
- actor_id → users.id, fk_operational_changes_actor_id, RESTRICT.

## assessment_cases
Model: app/Models/AssessmentCase.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| patient_id | CHAR(36) | W | FK patient_profiles |
| package_version_id | CHAR(36) | W | FK package_versions, kategori ASSESSMENT |
| status | VARCHAR(40) | W, OPEN | Status case |
| scope_snapshot | JSON | W | Cakupan, steps wajib, evaluasi/laporan termasuk |
| created_by | CHAR(36) | W | FK users |
| closed_at | DATETIME(6) | N | Penutupan layanan, bukan pelunasan |
| closure_reason | VARCHAR(500) | N | Wajib penutupan dini |

Index/unique (selain PK):
- INDEX (patient_id, status, created_at) — ix_assessment_cases_patient_id_status_created_at.
- INDEX (package_version_id) — ix_assessment_cases_package_version_id.
- INDEX (created_by) — ix_assessment_cases_created_by.

Foreign key:
- patient_id → patient_profiles.id, fk_assessment_cases_patient_id, RESTRICT.
- package_version_id → package_versions.id, fk_assessment_cases_package_version_id, RESTRICT.
- created_by → users.id, fk_assessment_cases_created_by, RESTRICT.

CHECK SQL:
- `status IN ('OPEN', 'IN_PROGRESS', 'READY_FOR_REPORT', 'CLOSED')`.
- `row_version > 0`.

Cast status: App/Enums/AssessmentCaseStatus.php, nilai OPEN/IN_PROGRESS/READY_FOR_REPORT/CLOSED.

## treatment_plans
Model: app/Models/TreatmentPlan.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| patient_id | CHAR(36) | W | FK patient_profiles |
| package_id | CHAR(36) | W | FK consultation_packages, PSYCHOTHERAPY |
| psychologist_id | CHAR(36) | W | FK users; auto-create memakai praktisi tunggal konfigurasi server |
| planned_sessions | INT UNSIGNED | W, 4 | Tetap4; CHECK planned_sessions=4, tanpa extend. Setelah selesai booking plan baru |
| status | VARCHAR(40) | W, ACTIVE | Tidak ada kolom active terpisah |
| active_plan_guard | VARCHAR(73) generated | N | CASE WHEN status='ACTIVE' OR (status='AWAITING_SETTLEMENT' AND administrative_closed_at IS NULL) THEN CONCAT(patient_id,':',package_id) ELSE NULL END |
| clinical_objective | TEXT | N | Owner-only |
| completed_at | DATETIME(6) | N | Terakhir mencapai target |
| administrative_closed_at | DATETIME(6) | N | Fakta penutupan historis tetap tersimpan ketika ada koreksi kas lama |
| discontinued_at | DATETIME(6) | N | Penghentian |
| reason | VARCHAR(500) | N | Alasan penutupan/penghentian |

Index/unique (selain PK):
- INDEX (patient_id, package_id, status) — ix_treatment_plans_patient_id_package_id_status.
- UNIQUE (active_plan_guard) — uq_treatment_plans_active_plan_guard.
- INDEX (package_id) — ix_treatment_plans_package_id.
- INDEX (psychologist_id) — ix_treatment_plans_psychologist_id.

Foreign key:
- patient_id → patient_profiles.id, fk_treatment_plans_patient_id, RESTRICT.
- package_id → consultation_packages.id, fk_treatment_plans_package_id, RESTRICT.
- psychologist_id → users.id, fk_treatment_plans_psychologist_id, RESTRICT.

CHECK SQL:
- `planned_sessions = 4`.
- `status IN ('ACTIVE', 'AWAITING_SETTLEMENT', 'COMPLETED', 'DISCONTINUED')`.
- `row_version > 0`.

Cast status: App/Enums/TreatmentPlanStatus.php, nilai ACTIVE/AWAITING_SETTLEMENT/COMPLETED/DISCONTINUED.

## appointments
Model: app/Models/Appointment.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| booking_code | VARCHAR(40) | W | Kode tampilan unik |
| patient_id | CHAR(36) | W | FK patient_profiles |
| booked_by_user_id | CHAR(36) | W | FK users: pemesan atau Admin |
| psychologist_id | CHAR(36) | W | FK users |
| package_version_id | CHAR(36) | N | FK package_versions; wajib STANDARD_SERVICE, null CUSTOM |
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
| reminder_recipient_phone | VARCHAR(25) | N | Nomor E.164 penerima pengingat booking, eksplisit dan dapat diperbarui |
| reminder_wa_accepted_at | DATETIME(6) | N | Persetujuan pengingat pada waktu server; null bila dicabut |
| tele_service_wa_accepted_at | DATETIME(6) | N | Timestamp server penerimaan pengiriman link/jadwal saat booking Telelayanan |
| calendar_version_id | CHAR(36) | W | FK calendar_versions saat dibuat |
| hold_expires_at | DATETIME(6) | N | Awal online min(created_at+24h,start_at-2h); null bila tidak ada pembayaran awal baru |
| verification_started_at | DATETIME(6) | N | Bukti lengkap pertama |
| verification_due_at | DATETIME(6) | N | +12 jam kerja versi snapshot |
| correction_deadline_at | DATETIME(6) | N | Batas perbaikan bukti |
| requires_reschedule | BOOLEAN | W, false | Asal klinik/request sah, bukan status bayar |
| checked_in_at | DATETIME(6) | N | Waktu kedatangan |
| checked_in_by | CHAR(36) | N | FK users |
| actual_started_at | DATETIME(6) | N | Mulai layanan aktual |
| actual_ended_at | DATETIME(6) | N | Akhir layanan aktual |
| terminal_at | DATETIME(6) | N | Completed/cancel/penutupan hak, bukan no-show sementara |
| appointment_kind | VARCHAR(30) | W, STANDARD_SERVICE | STANDARD_SERVICE/CUSTOM |
| payment_requirement | VARCHAR(20) | W, REQUIRED | REQUIRED/INCLUDED/NOT_REQUIRED |
| custom_label | VARCHAR(180) | N | Wajib CUSTOM, administratif |
| custom_notes | VARCHAR(1000) | N | Konteks administratif; bukan diagnosis/jawaban profiling |
| custom_fee_amount | BIGINT UNSIGNED | N | Wajib positif untuk CUSTOM berbayar; selainnya null |
| owner_authorization_note | VARCHAR(500) | N | Konteks arahan owner; wajib CUSTOM atau OWNER_EXTERNAL |
| external_agreed_at | DATETIME(6) | N | Waktu janji eksternal jika diketahui, bukan memundurkan created_at |
| lead_working_minutes_snapshot | INT UNSIGNED | W, 180 | Aturan pada saat reservasi, bukan timer dari upload bukti |
| reminder_lead_minutes_snapshot | INT UNSIGNED | W, 120 | Waktu biasa; snapshot reservasi |

Index/unique (selain PK):
- UNIQUE (booking_code) — uq_appointments_booking_code.
- UNIQUE (plan_session_guard) — uq_appointments_plan_session_guard.
- UNIQUE (assessment_case_id, assessment_sequence) — uq_appointments_assessment_case_id_assessment_sequence.
- INDEX (psychologist_id, start_at, end_at, status) — ix_appointments_psychologist_id_start_at_end_at_status.
- INDEX (patient_id, created_at) — ix_appointments_patient_id_created_at.
- INDEX (booked_by_user_id) — ix_appointments_booked_by_user_id.
- INDEX (package_version_id) — ix_appointments_package_version_id.
- INDEX (treatment_plan_id) — ix_appointments_treatment_plan_id.
- INDEX (responsible_user_id) — ix_appointments_responsible_user_id.
- INDEX (calendar_version_id) — ix_appointments_calendar_version_id.
- INDEX (checked_in_by) — ix_appointments_checked_in_by.

Foreign key:
- patient_id → patient_profiles.id, fk_appointments_patient_id, RESTRICT.
- booked_by_user_id → users.id, fk_appointments_booked_by_user_id, RESTRICT.
- psychologist_id → users.id, fk_appointments_psychologist_id, RESTRICT.
- package_version_id → package_versions.id, fk_appointments_package_version_id, RESTRICT.
- assessment_case_id → assessment_cases.id, fk_appointments_assessment_case_id, RESTRICT.
- treatment_plan_id → treatment_plans.id, fk_appointments_treatment_plan_id, RESTRICT.
- responsible_user_id → users.id, fk_appointments_responsible_user_id, RESTRICT.
- calendar_version_id → calendar_versions.id, fk_appointments_calendar_version_id, RESTRICT.
- checked_in_by → users.id, fk_appointments_checked_in_by, RESTRICT.

CHECK SQL:
- `end_at > start_at`.
- `attempt_number > 0`.
- `lead_working_minutes_snapshot > 0`.
- `reminder_lead_minutes_snapshot > 0`.
- `(assessment_case_id IS NULL OR treatment_plan_id IS NULL)`.
- `(assessment_case_id IS NULL AND assessment_role IS NULL AND assessment_sequence IS NULL) OR (assessment_case_id IS NOT NULL AND assessment_role IS NOT NULL AND assessment_sequence IS NOT NULL AND assessment_sequence > 0)`.
- `(treatment_plan_id IS NULL AND session_number IS NULL AND plan_unit_released_at IS NULL) OR (treatment_plan_id IS NOT NULL AND session_number IS NOT NULL AND session_number BETWEEN 1 AND 4)`.
- `(appointment_kind = 'STANDARD_SERVICE' AND package_version_id IS NOT NULL AND custom_label IS NULL AND custom_fee_amount IS NULL) OR (appointment_kind = 'CUSTOM' AND package_version_id IS NULL AND custom_label IS NOT NULL AND CHAR_LENGTH(TRIM(custom_label)) > 0 AND assessment_case_id IS NULL AND treatment_plan_id IS NULL AND owner_authorization_note IS NOT NULL)`.
- `(appointment_kind = 'CUSTOM' AND payment_requirement = 'REQUIRED' AND custom_fee_amount IS NOT NULL AND custom_fee_amount > 0) OR (appointment_kind = 'CUSTOM' AND payment_requirement <> 'REQUIRED' AND custom_fee_amount IS NULL) OR appointment_kind = 'STANDARD_SERVICE'`.
- `booking_source <> 'PATIENT_ONLINE' OR (profiling_mode = 'DIGITAL' AND appointment_kind = 'STANDARD_SERVICE')`.
- `profiling_mode <> 'NONE' OR appointment_kind = 'CUSTOM'`.
- `payment_requirement <> 'NOT_REQUIRED' OR appointment_kind = 'CUSTOM'`.
- `payment_requirement <> 'NOT_REQUIRED' OR status NOT IN ('WAITING_PAYMENT','WAITING_VERIFICATION','CONFIRMED_AUTO_SLA')`.
- `booking_source <> 'OWNER_EXTERNAL' OR owner_authorization_note IS NOT NULL`.
- `status IN ('WAITING_PAYMENT', 'WAITING_VERIFICATION', 'CONFIRMED', 'CONFIRMED_AUTO_SLA', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW', 'CANCELLED', 'EXPIRED')`.
- `appointment_kind IN ('STANDARD_SERVICE', 'CUSTOM')`.
- `payment_requirement IN ('REQUIRED', 'INCLUDED', 'NOT_REQUIRED')`.
- `booking_source IN ('PATIENT_ONLINE', 'ADMIN_WALK_IN', 'ADMIN_ASSISTED', 'OWNER_EXTERNAL')`.
- `profiling_mode IN ('DIGITAL', 'PAPER', 'NONE')`.
- `assessment_role IS NULL OR assessment_role IN ('TESTING', 'EVALUATION', 'FOLLOW_UP')`.
- `row_version > 0`.

Cast status: App/Enums/AppointmentStatus.php, nilai WAITING_PAYMENT/WAITING_VERIFICATION/CONFIRMED/CONFIRMED_AUTO_SLA/CHECKED_IN/IN_CONSULTATION/COMPLETED/NO_SHOW/CANCELLED/EXPIRED.

Cast appointment_kind: App/Enums/AppointmentKind.php, nilai STANDARD_SERVICE/CUSTOM.

Cast payment_requirement: App/Enums/PaymentRequirement.php, nilai REQUIRED/INCLUDED/NOT_REQUIRED.

Cast booking_source: App/Enums/BookingSource.php, nilai PATIENT_ONLINE/ADMIN_WALK_IN/ADMIN_ASSISTED/OWNER_EXTERNAL.

Cast profiling_mode: App/Enums/ProfilingMode.php, nilai DIGITAL/PAPER/NONE.

Cast assessment_role: App/Enums/AssessmentRole.php, nilai TESTING/EVALUATION/FOLLOW_UP.

## appointment_events
Model: app/Models/AppointmentEvent.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| appointment_id | CHAR(36) | W | FK appointments |
| actor_id | CHAR(36) | N | FK users; null job sistem |
| event_type | VARCHAR(60) | W | Status/reschedule/no-show/correction |
| attempt_number | INT UNSIGNED | W | Usaha terkait |
| old_value | JSON | N | Status/interval sebelumnya |
| new_value | JSON | W | Status/interval berikutnya |
| reason | VARCHAR(500) | N | Wajib perubahan manual/exception |
| request_id | VARCHAR(80) | W | Trace |

Index/unique (selain PK):
- INDEX (appointment_id, created_at) — ix_appointment_events_appointment_id_created_at.
- INDEX (actor_id) — ix_appointment_events_actor_id.

Foreign key:
- appointment_id → appointments.id, fk_appointment_events_appointment_id, RESTRICT.
- actor_id → users.id, fk_appointment_events_actor_id, RESTRICT.

## operational_change_impacts
Model: app/Models/OperationalChangeImpact.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| operational_change_id | CHAR(36) | W | FK operational_changes |
| appointment_id | CHAR(36) | W | FK appointments |
| resolution | VARCHAR(30) | W, PENDING | PENDING/RESCHEDULED/CANCELLED/OWNER_RESOLVED |
| resolved_at | DATETIME(6) | N | Waktu penyelesaian |

Index/unique (selain PK):
- UNIQUE (operational_change_id, appointment_id) — uq_operational_change_impacts_operational_change__ecc26f12.
- INDEX (appointment_id) — ix_operational_change_impacts_appointment_id.

Foreign key:
- operational_change_id → operational_changes.id, fk_operational_change_impacts_operational_change_id, RESTRICT.
- appointment_id → appointments.id, fk_operational_change_impacts_appointment_id, RESTRICT.

CHECK SQL:
- `resolution IN ('PENDING', 'RESCHEDULED', 'CANCELLED', 'OWNER_RESOLVED')`.
- `row_version > 0`.

Cast resolution: App/Enums/OperationalImpactResolution.php, nilai PENDING/RESCHEDULED/CANCELLED/OWNER_RESOLVED.

## reschedule_requests
Model: app/Models/RescheduleRequest.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- UNIQUE (active_guard) — uq_reschedule_requests_active_guard.
- INDEX (appointment_id, status) — ix_reschedule_requests_appointment_id_status.
- INDEX (requested_by) — ix_reschedule_requests_requested_by.
- INDEX (approved_by) — ix_reschedule_requests_approved_by.

Foreign key:
- appointment_id → appointments.id, fk_reschedule_requests_appointment_id, RESTRICT.
- requested_by → users.id, fk_reschedule_requests_requested_by, RESTRICT.
- approved_by → users.id, fk_reschedule_requests_approved_by, RESTRICT.

CHECK SQL:
- `appointment_version > 0`.
- `appointment_attempt_number > 0`.
- `quota_effect IN (0,1)`.
- `quota_effect = 0 OR (origin = 'PATIENT' AND status = 'APPLIED')`.
- `requested_end_at IS NULL OR requested_start_at IS NULL OR requested_end_at > requested_start_at`.
- `origin IN ('PATIENT', 'CLINIC', 'OWNER')`.
- `status IN ('REQUESTED', 'APPROVED', 'SLOT_SELECTION_REQUIRED', 'APPLIED', 'REJECTED', 'EXPIRED', 'CANCELLED')`.
- `row_version > 0`.

Cast origin: App/Enums/RescheduleOrigin.php, nilai PATIENT/CLINIC/OWNER.

Cast status: App/Enums/RescheduleStatus.php, nilai REQUESTED/APPROVED/SLOT_SELECTION_REQUIRED/APPLIED/REJECTED/EXPIRED/CANCELLED.

## reschedule_events
Model: app/Models/RescheduleEvent.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| request_id | CHAR(36) | W | FK reschedule_requests |
| actor_id | CHAR(36) | N | FK users |
| from_status | VARCHAR(40) | N | Status lama |
| to_status | VARCHAR(40) | W | Status baru |
| reason | VARCHAR(500) | N | Wajib reject/expire/exception |

Index/unique (selain PK):
- INDEX (request_id, created_at) — ix_reschedule_events_request_id_created_at.
- INDEX (actor_id) — ix_reschedule_events_actor_id.

Foreign key:
- request_id → reschedule_requests.id, fk_reschedule_events_request_id, RESTRICT.
- actor_id → users.id, fk_reschedule_events_actor_id, RESTRICT.

## pretest_templates
Model: app/Models/PretestTemplate.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| template_key | VARCHAR(80) | W | Kunci form |
| version | INT UNSIGNED | W | Versi |
| questions | JSON | W | Field, tipe, required, allow_null |
| effective_at | DATETIME(6) | W | Awal penggunaan |
| created_by | CHAR(36) | W | FK users |

Index/unique (selain PK):
- UNIQUE (template_key, version) — uq_pretest_templates_template_key_version.
- INDEX (created_by) — ix_pretest_templates_created_by.

Foreign key:
- created_by → users.id, fk_pretest_templates_created_by, RESTRICT.

CHECK SQL:
- `version > 0`.

## pretest_submissions
Model: app/Models/PretestSubmission.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| patient_id | CHAR(36) | W | FK patient_profiles |
| appointment_id | CHAR(36) | N | FK appointments; bind satu kali |
| template_id | CHAR(36) | W | FK pretest_templates |
| author_user_id | CHAR(36) | W | FK users |
| status | VARCHAR(20) | W, DRAFT | DRAFT/SUBMITTED |
| answers | LONGTEXT | W | JSON terenkripsi at rest via encrypted:array; tidak dikirim pada DTO Admin |
| supersedes_id | CHAR(36) | N | FK pretest_submissions |
| submitted_at | DATETIME(6) | N | Wajib jika submitted |

Index/unique (selain PK):
- INDEX (patient_id, appointment_id, submitted_at) — ix_pretest_submissions_patient_id_appointment_id__eb54727e.
- UNIQUE (supersedes_id) — uq_pretest_submissions_supersedes_id.
- INDEX (appointment_id) — ix_pretest_submissions_appointment_id.
- INDEX (template_id) — ix_pretest_submissions_template_id.
- INDEX (author_user_id) — ix_pretest_submissions_author_user_id.

Foreign key:
- patient_id → patient_profiles.id, fk_pretest_submissions_patient_id, RESTRICT.
- appointment_id → appointments.id, fk_pretest_submissions_appointment_id, RESTRICT.
- template_id → pretest_templates.id, fk_pretest_submissions_template_id, RESTRICT.
- author_user_id → users.id, fk_pretest_submissions_author_user_id, RESTRICT.
- supersedes_id → pretest_submissions.id, fk_pretest_submissions_supersedes_id, RESTRICT.

CHECK SQL:
- `(status = 'DRAFT' AND submitted_at IS NULL) OR (status = 'SUBMITTED' AND submitted_at IS NOT NULL)`.
- `supersedes_id IS NULL OR supersedes_id <> id`.
- `status IN ('DRAFT', 'SUBMITTED')`.
- `row_version > 0`.

Cast status: App/Enums/PretestStatus.php, nilai DRAFT/SUBMITTED.

## consents
Model: app/Models/Consent.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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
| cms_content_id | CHAR(36) | W | FK cms_contents; versi dokumen yang benar-benar diterima |

Index/unique (selain PK):
- INDEX (patient_id, appointment_id) — ix_consents_patient_id_appointment_id.
- INDEX (document_key, document_version) — ix_consents_document_key_document_version.
- INDEX (appointment_id) — ix_consents_appointment_id.
- INDEX (actor_user_id) — ix_consents_actor_user_id.
- INDEX (recorded_by_user_id) — ix_consents_recorded_by_user_id.
- INDEX (cms_content_id) — ix_consents_cms_content_id.

Foreign key:
- patient_id → patient_profiles.id, fk_consents_patient_id, RESTRICT.
- appointment_id → appointments.id, fk_consents_appointment_id, RESTRICT.
- actor_user_id → users.id, fk_consents_actor_user_id, RESTRICT.
- recorded_by_user_id → users.id, fk_consents_recorded_by_user_id, RESTRICT.
- cms_content_id → cms_contents.id, fk_consents_cms_content_id, RESTRICT.
- (cms_content_id,document_key,document_version) → cms_contents.(id,section_key,version), fk_consents_document_version. ID dan nomor versi harus mengacu dokumen yang sama, mendukung eager loading document() tanpa tertukar versi.

CHECK SQL:
- `document_version > 0`.
- `withdrawn_at IS NULL OR withdrawn_at >= accepted_at`.
- `acceptance_source IN ('SELF', 'ASSISTED_OFFLINE')`.
- `row_version > 0`.

Cast acceptance_source: App/Enums/ConsentSource.php, nilai SELF/ASSISTED_OFFLINE.

## billing_accounts
Model: app/Models/BillingAccount.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| patient_id | CHAR(36) | W | FK patient_profiles |
| appointment_id | CHAR(36) | N | FK appointments untuk non-asesmen |
| assessment_case_id | CHAR(36) | N | FK assessment_cases |
| initial_minimum_due | BIGINT UNSIGNED | W | Nilai dari initial_payment_policy_snapshot FIXED/PERCENT; lanjutan0 setelah minimum asal verified |
| collection_status | VARCHAR(30) | W, OPEN | OPEN/CLOSED_PAID/CLOSED_UNSERVED; pelepasan kewajiban belum diberikan berjejak, kas tetap |
| collection_closed_at | DATETIME(6) | N | Wajib bila CLOSED_PAID; tidak menandakan layanan COMPLETED |
| collection_closure_reason | VARCHAR(500) | N | Pembatalan/expiry/berakhirnya hak sebelum layanan |
| service_terminal_at | DATETIME(6) | N | Penutupan layanan, dasar download cutoff |
| download_until | DATETIME(6) | N | Terminal+7hari, owner reissue terpisah |
| initial_payment_policy_snapshot | JSON | W | Mode FIXED/PERCENT/NONE, parameter nominal/basis poin dan dasar net pada waktu pembentukan; jangan membaca ulang konfigurasi terbaru untuk billing lama |

Index/unique (selain PK):
- UNIQUE (appointment_id) — uq_billing_accounts_appointment_id.
- UNIQUE (assessment_case_id) — uq_billing_accounts_assessment_case_id.
- INDEX (patient_id) — ix_billing_accounts_patient_id.

Foreign key:
- patient_id → patient_profiles.id, fk_billing_accounts_patient_id, RESTRICT.
- appointment_id → appointments.id, fk_billing_accounts_appointment_id, RESTRICT.
- assessment_case_id → assessment_cases.id, fk_billing_accounts_assessment_case_id, RESTRICT.

CHECK SQL:
- `(appointment_id IS NULL) <> (assessment_case_id IS NULL)`.
- `(collection_status = 'OPEN' AND collection_closed_at IS NULL) OR (collection_status <> 'OPEN' AND collection_closed_at IS NOT NULL)`.
- `collection_status IN ('OPEN', 'CLOSED_PAID', 'CLOSED_UNSERVED')`.
- `row_version > 0`.

Cast collection_status: App/Enums/CollectionStatus.php, nilai OPEN/CLOSED_PAID/CLOSED_UNSERVED.

## document_sequences
Model: app/Models/DocumentSequence.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| document_kind | VARCHAR(20) | W | INVOICE/RECEIPT |
| local_date | DATE | W | Tanggal nomor WIB |
| next_value | BIGINT UNSIGNED | W, 1 | Counter monotonik |

Index/unique (selain PK):
- UNIQUE (document_kind, local_date) — uq_document_sequences_document_kind_local_date.

CHECK SQL:
- `next_value > 0`.
- `document_kind IN ('INVOICE', 'RECEIPT')`.
- `row_version > 0`.

Cast document_kind: App/Enums/DocumentKind.php, nilai INVOICE/RECEIPT.

## invoices
Model: app/Models/Invoice.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- UNIQUE (invoice_number) — uq_invoices_invoice_number.
- UNIQUE (base_guard) — uq_invoices_base_guard.
- INDEX (billing_account_id, issued_at) — ix_invoices_billing_account_id_issued_at.
- INDEX (parent_invoice_id) — ix_invoices_parent_invoice_id.
- INDEX (issuer_id) — ix_invoices_issuer_id.

Foreign key:
- billing_account_id → billing_accounts.id, fk_invoices_billing_account_id, RESTRICT.
- parent_invoice_id → invoices.id, fk_invoices_parent_invoice_id, RESTRICT.
- issuer_id → users.id, fk_invoices_issuer_id, RESTRICT.

CHECK SQL:
- `(kind = 'BASE' AND parent_invoice_id IS NULL AND net_amount > 0) OR (kind <> 'BASE' AND parent_invoice_id IS NOT NULL)`.
- `parent_invoice_id IS NULL OR parent_invoice_id <> id`.
- `kind IN ('BASE', 'ADDENDUM', 'ADJUSTMENT')`.

Cast kind: App/Enums/InvoiceKind.php, nilai BASE/ADDENDUM/ADJUSTMENT.

## billing_line_items
Model: app/Models/BillingLineItem.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- UNIQUE (base_service_guard) — uq_billing_line_items_base_service_guard.
- INDEX (invoice_id, kind) — ix_billing_line_items_invoice_id_kind.
- INDEX (appointment_id) — ix_billing_line_items_appointment_id.
- INDEX (reference_line_id) — ix_billing_line_items_reference_line_id.
- INDEX (created_by) — ix_billing_line_items_created_by.

Foreign key:
- invoice_id → invoices.id, fk_billing_line_items_invoice_id, RESTRICT.
- appointment_id → appointments.id, fk_billing_line_items_appointment_id, RESTRICT.
- reference_line_id → billing_line_items.id, fk_billing_line_items_reference_line_id, RESTRICT.
- created_by → users.id, fk_billing_line_items_created_by, RESTRICT.

CHECK SQL:
- `quantity > 0`.
- `unit_amount > 0`.
- `amount = quantity * unit_amount`.
- `kind NOT IN ('GLOBAL_PROMO','PERSONAL_DISCOUNT','CORRECTION') OR reference_line_id IS NOT NULL`.
- `kind NOT IN ('GLOBAL_PROMO','PERSONAL_DISCOUNT') OR direction = 'MINUS'`.
- `kind <> 'CUSTOM_CHARGE' OR direction = 'PLUS'`.
- `reference_line_id IS NULL OR reference_line_id <> id`.
- `kind IN ('BASE_SERVICE', 'GLOBAL_PROMO', 'PERSONAL_DISCOUNT', 'ADDITIONAL_TIME', 'FORMAL_REPORT', 'CUSTOM_CHARGE', 'CORRECTION')`.
- `direction IN ('PLUS', 'MINUS')`.

Cast kind: App/Enums/BillingLineKind.php, nilai BASE_SERVICE/GLOBAL_PROMO/PERSONAL_DISCOUNT/ADDITIONAL_TIME/FORMAL_REPORT/CUSTOM_CHARGE/CORRECTION.

Cast direction: App/Enums/AmountDirection.php, nilai PLUS/MINUS.

## additional_time_entries
Model: app/Models/AdditionalTimeEntry.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- UNIQUE (appointment_id, attempt_number, revision) — uq_additional_time_entries_appointment_id_attempt_a6fd7046.
- INDEX (invoice_id) — ix_additional_time_entries_invoice_id.
- INDEX (created_by) — ix_additional_time_entries_created_by.

Foreign key:
- appointment_id → appointments.id, fk_additional_time_entries_appointment_id, RESTRICT.
- invoice_id → invoices.id, fk_additional_time_entries_invoice_id, RESTRICT.
- created_by → users.id, fk_additional_time_entries_created_by, RESTRICT.

CHECK SQL:
- `attempt_number > 0`.
- `revision > 0`.
- `base_rate_snapshot > 0`.
- `rate_basis_points = 2500`.
- `billed_blocks = CEILING(total_additional_minutes / 15)`.
- `calculated_total = CEILING(base_rate_snapshot * rate_basis_points * billed_blocks / 10000)`.
- `rate_basis IN ('NORMAL_PRICE', 'FINAL_PRICE')`.

Cast rate_basis: App/Enums/AdditionalTimePriceBasis.php, nilai NORMAL_PRICE/FINAL_PRICE.

## payment_transactions
Model: app/Models/PaymentTransaction.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| billing_account_id | CHAR(36) | W | FK billing_accounts |
| appointment_id | CHAR(36) | N | FK appointments konteks pembayaran |
| entry_type | VARCHAR(20) | W, RECEIPT | RECEIPT/REVERSAL |
| purpose | VARCHAR(20) | W | DP/SETTLEMENT/ADD_ON/CORRECTION |
| claimed_amount | BIGINT UNSIGNED | N | Klaim pasien asli, bukan uang terverifikasi |
| amount | BIGINT UNSIGNED | N | Aktual positif wajib saat VERIFIED; null selama bukti belum diperiksa |
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
| payment_agreement_id | CHAR(36) | N | FK payment_agreements; penerimaan rangkaian pada billing anchor |

Index/unique (selain PK):
- UNIQUE (reversal_of_id) — uq_payment_transactions_reversal_of_id.
- INDEX (billing_account_id, received_at) — ix_payment_transactions_billing_account_id_received_at.
- INDEX (status, created_at) — ix_payment_transactions_status_created_at.
- INDEX (appointment_id) — ix_payment_transactions_appointment_id.
- INDEX (verified_by) — ix_payment_transactions_verified_by.
- INDEX (submitted_by) — ix_payment_transactions_submitted_by.
- INDEX (payment_agreement_id) — ix_payment_transactions_payment_agreement_id.

Foreign key:
- billing_account_id → billing_accounts.id, fk_payment_transactions_billing_account_id, RESTRICT.
- appointment_id → appointments.id, fk_payment_transactions_appointment_id, RESTRICT.
- verified_by → users.id, fk_payment_transactions_verified_by, RESTRICT.
- submitted_by → users.id, fk_payment_transactions_submitted_by, RESTRICT.
- reversal_of_id → payment_transactions.id, fk_payment_transactions_reversal_of_id, RESTRICT.
- payment_agreement_id → payment_agreements.id, fk_payment_transactions_payment_agreement_id, RESTRICT.

CHECK SQL:
- `amount IS NULL OR amount > 0`.
- `claimed_amount IS NULL OR claimed_amount > 0`.
- `status <> 'VERIFIED' OR (amount IS NOT NULL AND received_at IS NOT NULL AND verified_at IS NOT NULL AND verified_by IS NOT NULL)`.
- `(entry_type = 'RECEIPT' AND reversal_of_id IS NULL) OR (entry_type = 'REVERSAL' AND reversal_of_id IS NOT NULL AND reason IS NOT NULL AND status = 'VERIFIED')`.
- `reversal_of_id IS NULL OR reversal_of_id <> id`.
- `entry_type IN ('RECEIPT', 'REVERSAL')`.
- `purpose IN ('DP', 'SETTLEMENT', 'ADD_ON', 'CORRECTION')`.
- `method IN ('TRANSFER', 'QR', 'CASH', 'EDC', 'OTHER')`.
- `status IN ('PENDING_VERIFICATION', 'PENDING_RECONCILIATION', 'VERIFIED', 'REJECTED')`.
- `row_version > 0`.

Cast entry_type: App/Enums/PaymentEntryType.php, nilai RECEIPT/REVERSAL.

Cast purpose: App/Enums/PaymentPurpose.php, nilai DP/SETTLEMENT/ADD_ON/CORRECTION.

Cast method: App/Enums/PaymentMethod.php, nilai TRANSFER/QR/CASH/EDC/OTHER.

Cast status: App/Enums/PaymentStatus.php, nilai PENDING_VERIFICATION/PENDING_RECONCILIATION/VERIFIED/REJECTED.

## payment_events
Model: app/Models/PaymentEvent.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| payment_transaction_id | CHAR(36) | W | FK payment_transactions |
| actor_id | CHAR(36) | N | FK users, null job SLA |
| event_type | VARCHAR(60) | W | SUBMITTED/VERIFIED/REJECTED/CORRECTED/SLA_MARKED |
| from_status | VARCHAR(40) | N | Sebelumnya |
| to_status | VARCHAR(40) | W | Sesudah |
| reason | VARCHAR(500) | N | Wajib reject/correction |

Index/unique (selain PK):
- INDEX (payment_transaction_id, created_at) — ix_payment_events_payment_transaction_id_created_at.
- INDEX (actor_id) — ix_payment_events_actor_id.

Foreign key:
- payment_transaction_id → payment_transactions.id, fk_payment_events_payment_transaction_id, RESTRICT.
- actor_id → users.id, fk_payment_events_actor_id, RESTRICT.

## private_files
Model: app/Models/PrivateFile.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| storage_key | VARCHAR(255) | W | Private disk path acak |
| mime_type | VARCHAR(100) | W | MIME sebenarnya |
| size_bytes | BIGINT UNSIGNED | W | Batas upload server |
| uploaded_by | CHAR(36) | W | FK users |
| uploaded_at | DATETIME(6) | W | Anchor retensi |
| expires_at | DATETIME(6) | W | +1tahun, file export boleh lebih singkat |
| purged_at | DATETIME(6) | N | Tombstone |
| purpose | VARCHAR(30) | W | PAYMENT_PROOF/EXPENSE/EXPORT |
| checksum_sha256 | CHAR(64) | W | SHA-256 isi file untuk pemeriksaan kandidat duplikasi; bukan UNIQUE karena transfer berbeda dapat mempunyai lampiran identik |

Index/unique (selain PK):
- UNIQUE (storage_key) — uq_private_files_storage_key.
- INDEX (expires_at, purged_at) — ix_private_files_expires_at_purged_at.
- INDEX (uploaded_by) — ix_private_files_uploaded_by.

Foreign key:
- uploaded_by → users.id, fk_private_files_uploaded_by, RESTRICT.

CHECK SQL:
- `size_bytes > 0`.
- `expires_at > uploaded_at`.
- `purpose IN ('PAYMENT_PROOF', 'EXPENSE', 'EXPORT')`.
- `row_version > 0`.

Cast purpose: App/Enums/PrivateFilePurpose.php, nilai PAYMENT_PROOF/EXPENSE/EXPORT.

## payment_proofs
Model: app/Models/PaymentProof.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| payment_transaction_id | CHAR(36) | W | FK payment_transactions |
| file_id | CHAR(36) | W | FK private_files |
| version | INT UNSIGNED | W | Nomor koreksi |
| received_at | DATETIME(6) | W | Server menerima lengkap |
| decision | VARCHAR(20) | W, PENDING | PENDING/APPROVED/REJECTED/SUPERSEDED |
| decision_reason | VARCHAR(500) | N | Wajib ditolak |

Index/unique (selain PK):
- UNIQUE (payment_transaction_id, version) — uq_payment_proofs_payment_transaction_id_version.
- UNIQUE (file_id) — uq_payment_proofs_file_id.

Foreign key:
- payment_transaction_id → payment_transactions.id, fk_payment_proofs_payment_transaction_id, RESTRICT.
- file_id → private_files.id, fk_payment_proofs_file_id, RESTRICT.

CHECK SQL:
- `version > 0`.
- `decision <> 'REJECTED' OR decision_reason IS NOT NULL`.
- `decision IN ('PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED')`.
- `row_version > 0`.

Cast decision: App/Enums/ProofDecision.php, nilai PENDING/APPROVED/REJECTED/SUPERSEDED.

## receipts
Model: app/Models/Receipt.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| payment_transaction_id | CHAR(36) | W | FK payment_transactions VERIFIED RECEIPT |
| receipt_number | VARCHAR(60) | W | Nomor unik |
| issued_at | DATETIME(6) | W | Waktu terbit |
| snapshot | JSON | W | Jumlah diterima, total/balance saat terbit, identitas/template |
| correction_of_receipt_id | CHAR(36) | N | FK receipts untuk pengganti berjejak |

Index/unique (selain PK):
- UNIQUE (receipt_number) — uq_receipts_receipt_number.
- UNIQUE (payment_transaction_id) — uq_receipts_payment_transaction_id.
- INDEX (correction_of_receipt_id) — ix_receipts_correction_of_receipt_id.

Foreign key:
- payment_transaction_id → payment_transactions.id, fk_receipts_payment_transaction_id, RESTRICT.
- correction_of_receipt_id → receipts.id, fk_receipts_correction_of_receipt_id, RESTRICT.

## report_deliveries
Model: app/Models/ReportDelivery.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- INDEX (billing_account_id, status) — ix_report_deliveries_billing_account_id_status.
- INDEX (assessment_case_id) — ix_report_deliveries_assessment_case_id.
- INDEX (appointment_id) — ix_report_deliveries_appointment_id.
- INDEX (issued_by) — ix_report_deliveries_issued_by.

Foreign key:
- billing_account_id → billing_accounts.id, fk_report_deliveries_billing_account_id, RESTRICT.
- assessment_case_id → assessment_cases.id, fk_report_deliveries_assessment_case_id, RESTRICT.
- appointment_id → appointments.id, fk_report_deliveries_appointment_id, RESTRICT.
- issued_by → users.id, fk_report_deliveries_issued_by, RESTRICT.

CHECK SQL:
- `(assessment_case_id IS NULL) <> (appointment_id IS NULL)`.
- `status <> 'DELIVERED' OR delivered_at IS NOT NULL`.
- `status IN ('REQUESTED', 'READY', 'DELIVERED')`.
- `delivery_method IN ('OFFLINE')`.
- `row_version > 0`.

Cast status: App/Enums/ReportDeliveryStatus.php, nilai REQUESTED/READY/DELIVERED.

Cast delivery_method: App/Enums/ReportDeliveryMethod.php, nilai OFFLINE.

## reviews
Model: app/Models/Review.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- UNIQUE (billing_account_id) — uq_reviews_billing_account_id.
- INDEX (status, created_at) — ix_reviews_status_created_at.
- INDEX (author_user_id) — ix_reviews_author_user_id.
- INDEX (moderated_by) — ix_reviews_moderated_by.

Foreign key:
- billing_account_id → billing_accounts.id, fk_reviews_billing_account_id, RESTRICT.
- author_user_id → users.id, fk_reviews_author_user_id, RESTRICT.
- moderated_by → users.id, fk_reviews_moderated_by, RESTRICT.

CHECK SQL:
- `rating BETWEEN 1 AND 5`.
- `version > 0`.
- `status <> 'REJECTED' OR moderation_reason IS NOT NULL`.
- `status IN ('PENDING_MODERATION', 'APPROVED', 'REJECTED')`.
- `row_version > 0`.

Cast status: App/Enums/ReviewStatus.php, nilai PENDING_MODERATION/APPROVED/REJECTED.

## expenses
Model: app/Models/Expense.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- UNIQUE (reversal_of_id) — uq_expenses_reversal_of_id.
- INDEX (expense_date, category) — ix_expenses_expense_date_category.
- INDEX (attachment_file_id) — ix_expenses_attachment_file_id.
- INDEX (created_by) — ix_expenses_created_by.

Foreign key:
- reversal_of_id → expenses.id, fk_expenses_reversal_of_id, RESTRICT.
- attachment_file_id → private_files.id, fk_expenses_attachment_file_id, RESTRICT.
- created_by → users.id, fk_expenses_created_by, RESTRICT.

CHECK SQL:
- `amount > 0`.
- `(entry_type = 'EXPENSE' AND reversal_of_id IS NULL) OR (entry_type = 'REVERSAL' AND reversal_of_id IS NOT NULL AND reason IS NOT NULL)`.
- `reversal_of_id IS NULL OR reversal_of_id <> id`.
- `category IN ('RENT', 'ELECTRICITY', 'INTERNET', 'SUPPLIES', 'OPERATIONS', 'STAFF', 'OTHER')`.
- `entry_type IN ('EXPENSE', 'REVERSAL')`.

Cast category: App/Enums/ExpenseCategory.php, nilai RENT/ELECTRICITY/INTERNET/SUPPLIES/OPERATIONS/STAFF/OTHER.

Cast entry_type: App/Enums/ExpenseEntryType.php, nilai EXPENSE/REVERSAL.

## notification_outbox
Model: app/Models/NotificationOutbox.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| event_key | VARCHAR(150) | W | Dedupe event |
| event_type | VARCHAR(80) | W | Template event |
| resource_type | VARCHAR(60) | W | Whitelist appointment/billing/calendar |
| resource_id | CHAR(36) | W | Polymorphic, bukan FK; service memvalidasi |
| resource_version | INT UNSIGNED | N | Versi jadwal |
| payload | JSON | W | Administratif minimal |
| dispatched_at | DATETIME(6) | N | Belum jika null |
| available_at | DATETIME(6) | N | Jadwal dispatch, null berarti siap sekarang |

Index/unique (selain PK):
- UNIQUE (event_key) — uq_notification_outbox_event_key.
- INDEX (dispatched_at, created_at) — ix_notification_outbox_dispatched_at_created_at.

CHECK SQL:
- `row_version > 0`.

## notifications
Model: app/Models/Notification.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| outbox_id | CHAR(36) | W | FK notification_outbox |
| recipient_user_id | CHAR(36) | N | FK users; wajib IN_APP/EMAIL, boleh null khusus WHATSAPP kontak tanpa akun |
| delivery_payload | TEXT | N | JSON phone/text/id terenkripsi APP_KEY; dibekukan saat percobaan pertama agar retry sama |
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

Index/unique (selain PK):
- UNIQUE (deduplication_key) — uq_notifications_deduplication_key.
- INDEX (status, next_retry_at) — ix_notifications_status_next_retry_at.
- INDEX (recipient_user_id, created_at) — ix_notifications_recipient_user_id_created_at.
- INDEX (outbox_id) — ix_notifications_outbox_id.
- INDEX (tele_service_link_id) — ix_notifications_tele_service_link_id.

Foreign key:
- outbox_id → notification_outbox.id, fk_notifications_outbox_id, RESTRICT.
- recipient_user_id → users.id, fk_notifications_recipient_user_id, RESTRICT.
- tele_service_link_id → tele_service_links.id, fk_notifications_tele_service_link_id, RESTRICT.

CHECK SQL:
- `(channel = 'WHATSAPP' AND recipient_phone_snapshot IS NOT NULL) OR (channel IN ('IN_APP','EMAIL') AND recipient_user_id IS NOT NULL)`.
- `status <> 'SENT' OR sent_at IS NOT NULL`.
- `channel IN ('IN_APP', 'WHATSAPP', 'EMAIL')`.
- `status IN ('QUEUED', 'SENDING', 'RETRY', 'SENT', 'FAILED', 'CANCELLED')`.
- `row_version > 0`.

Cast channel: App/Enums/NotificationChannel.php, nilai IN_APP/WHATSAPP/EMAIL.

Cast status: App/Enums/NotificationStatus.php, nilai QUEUED/SENDING/RETRY/SENT/FAILED/CANCELLED.

## tele_service_links
Model: app/Models/TeleServiceLink.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- UNIQUE (appointment_id, attempt_number, version) — uq_tele_service_links_appointment_id_attempt_number_version.
- INDEX (recipient_user_id, created_at) — ix_tele_service_links_recipient_user_id_created_at.
- INDEX (created_by) — ix_tele_service_links_created_by.

Foreign key:
- appointment_id → appointments.id, fk_tele_service_links_appointment_id, RESTRICT.
- recipient_user_id → users.id, fk_tele_service_links_recipient_user_id, RESTRICT.
- created_by → users.id, fk_tele_service_links_created_by, RESTRICT.

CHECK SQL:
- `attempt_number > 0`.
- `version > 0`.

## audit_logs
Model: app/Models/AuditLog.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- INDEX (resource_type, resource_id, created_at) — ix_audit_logs_resource_type_resource_id_created_at.
- INDEX (actor_id, created_at) — ix_audit_logs_actor_id_created_at.

Foreign key:
- actor_id → users.id, fk_audit_logs_actor_id, RESTRICT.

## cms_contents
Model: app/Models/CmsContent.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| section_key | VARCHAR(80) | W | Landing/profil/consent dll |
| version | INT UNSIGNED | W | Versi |
| payload | JSON | W | Schema section |
| status | VARCHAR(20) | W, DRAFT | DRAFT/PUBLISHED/ARCHIVED |
| published_at | DATETIME(6) | N | Waktu publish |
| published_guard | VARCHAR(80) generated | N | section_key jika status=PUBLISHED, selainnya NULL |
| updated_by | CHAR(36) | W | FK users |

Index/unique (selain PK):
- UNIQUE (section_key, version) — uq_cms_contents_section_key_version.
- UNIQUE (published_guard) — uq_cms_contents_published_guard.
- INDEX (section_key, status) — ix_cms_contents_section_key_status.
- INDEX (updated_by) — ix_cms_contents_updated_by.
- UNIQUE (id, section_key, version) — uq_cms_identity_version.

Foreign key:
- updated_by → users.id, fk_cms_contents_updated_by, RESTRICT.

CHECK SQL:
- `version > 0`.
- `status <> 'PUBLISHED' OR published_at IS NOT NULL`.
- `status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')`.
- `row_version > 0`.

Cast status: App/Enums/CmsStatus.php, nilai DRAFT/PUBLISHED/ARCHIVED.

## tutorial_contents
Model: app/Models/TutorialContent.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| content_key | VARCHAR(80) | W | Kunci materi |
| role | VARCHAR(40) | W | GUEST/PATIENT/ADMIN/PSYCHOLOGIST |
| version | INT UNSIGNED | W | Versi |
| title | VARCHAR(180) | W | Judul |
| steps | JSON | W | Langkah dan selector opsional |
| video_url | VARCHAR(500) | N | URL berizin |
| is_active | BOOLEAN | W, true | Publikasi |

Index/unique (selain PK):
- UNIQUE (content_key, role, version) — uq_tutorial_contents_content_key_role_version.

CHECK SQL:
- `version > 0`.
- `role IN ('GUEST', 'PATIENT', 'ADMIN', 'PSYCHOLOGIST')`.
- `row_version > 0`.

Cast role: App/Enums/TutorialAudience.php, nilai GUEST/PATIENT/ADMIN/PSYCHOLOGIST.

## tutorial_progress
Model: app/Models/TutorialProgress.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| user_id | CHAR(36) | W | FK users |
| tutorial_content_id | CHAR(36) | W | FK tutorial_contents |
| last_step | INT UNSIGNED | W, 0 | Batas jumlah steps |
| completed_at | DATETIME(6) | N | Complete |
| skipped_at | DATETIME(6) | N | Skip |

Index/unique (selain PK):
- UNIQUE (user_id, tutorial_content_id) — uq_tutorial_progress_user_id_tutorial_content_id.
- INDEX (tutorial_content_id) — ix_tutorial_progress_tutorial_content_id.

Foreign key:
- user_id → users.id, fk_tutorial_progress_user_id, RESTRICT.
- tutorial_content_id → tutorial_contents.id, fk_tutorial_progress_tutorial_content_id, RESTRICT.

CHECK SQL:
- `row_version > 0`.

## export_jobs
Model: app/Models/ExportJob.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
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

Index/unique (selain PK):
- INDEX (requested_by, created_at) — ix_export_jobs_requested_by_created_at.
- INDEX (file_id) — ix_export_jobs_file_id.

Foreign key:
- requested_by → users.id, fk_export_jobs_requested_by, RESTRICT.
- file_id → private_files.id, fk_export_jobs_file_id, RESTRICT.

CHECK SQL:
- `kind IN ('SCHEDULE', 'FINANCE')`.
- `status IN ('QUEUED', 'READY', 'FAILED', 'EXPIRED')`.
- `row_version > 0`.

Cast kind: App/Enums/ExportKind.php, nilai SCHEDULE/FINANCE.

Cast status: App/Enums/ExportStatus.php, nilai QUEUED/READY/FAILED/EXPIRED.

## idempotency_requests
Model: app/Models/IdempotencyRequest.php. PK dan kolom common mengikuti konvensi di atas. Penyimpanan Eloquent memakai optimistic locking row_version; raw query harus dikelola action berizin.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| actor_id | CHAR(36) | W | FK users |
| scope | VARCHAR(120) | W | Endpoint+target |
| request_key | VARCHAR(100) | W | Header Idempotency-Key |
| payload_hash | CHAR(64) | W | Canonical request hash |
| status | VARCHAR(20) | W, PROCESSING | PROCESSING/COMPLETED |
| response_status | SMALLINT UNSIGNED | N | HTTP status |
| response_snapshot | JSON | N | Response role-specific, bukan semua field |
| expires_at | DATETIME(6) | W | Dedupe minimal selama retry window kebijakan operasi |

Index/unique (selain PK):
- UNIQUE (actor_id, scope, request_key) — uq_idempotency_requests_actor_id_scope_request_key.

Foreign key:
- actor_id → users.id, fk_idempotency_requests_actor_id, RESTRICT.

CHECK SQL:
- `status IN ('PROCESSING', 'COMPLETED')`.
- `row_version > 0`.

Cast status: App/Enums/IdempotencyStatus.php, nilai PROCESSING/COMPLETED.

## payment_agreements
Model: app/Models/PaymentAgreement.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| treatment_plan_id | CHAR(36) | W | FK treatment_plans |
| first_billing_account_id | CHAR(36) | W | FK billing_accounts |
| package_version_id | CHAR(36) | W | FK package_versions |
| session_count | INT UNSIGNED | W, 4 | Kesepakatan empat sesi |
| session_subtotal | BIGINT UNSIGNED | W | Tarif per sesi sebelum diskon |
| session_discount | BIGINT UNSIGNED | W, 0 | Potongan per sesi |
| session_amount | BIGINT UNSIGNED | W | Net per sesi; tidak membuat invoice sesi belum dipesan |
| duration_minutes | INT UNSIGNED | W | Durasi kesepakatan |
| agreed_at | DATETIME(6) | W | Waktu kesepakatan |
| created_by | CHAR(36) | W | FK users |
| terms_snapshot | JSON | N | Snapshot persyaratan administratif |

Index/unique (selain PK):
- UNIQUE (treatment_plan_id) — uq_payment_agreements_treatment_plan_id.
- UNIQUE (first_billing_account_id) — uq_payment_agreements_first_billing_account_id.
- INDEX (package_version_id) — ix_payment_agreements_package_version_id.
- INDEX (created_by) — ix_payment_agreements_created_by.

Foreign key:
- treatment_plan_id → treatment_plans.id, fk_payment_agreements_treatment_plan_id, RESTRICT.
- first_billing_account_id → billing_accounts.id, fk_payment_agreements_first_billing_account_id, RESTRICT.
- package_version_id → package_versions.id, fk_payment_agreements_package_version_id, RESTRICT.
- created_by → users.id, fk_payment_agreements_created_by, RESTRICT.

CHECK SQL:
- `session_count = 4`.
- `session_subtotal > 0`.
- `session_discount < session_subtotal`.
- `session_amount = session_subtotal - session_discount`.
- `duration_minutes > 0`.

## payment_allocations
Model: app/Models/PaymentAllocation.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| payment_transaction_id | CHAR(36) | W | FK payment_transactions |
| billing_account_id | CHAR(36) | W | FK billing_accounts |
| entry_type | VARCHAR(20) | W, ALLOCATION | ALLOCATION/REVERSAL |
| amount | BIGINT UNSIGNED | W | Positif; alokasi bukan kas kedua |
| reversal_of_id | CHAR(36) | N | FK payment_allocations |
| allocation_key | VARCHAR(150) | W | Idempotency alokasi |
| created_by | CHAR(36) | W | FK users |
| reason | VARCHAR(500) | N | Wajib reversal |

Index/unique (selain PK):
- UNIQUE (allocation_key) — uq_payment_allocations_allocation_key.
- UNIQUE (reversal_of_id) — uq_payment_allocations_reversal_of_id.
- INDEX (billing_account_id, created_at) — ix_payment_allocations_billing_account_id_created_at.
- INDEX (payment_transaction_id, created_at) — ix_payment_allocations_payment_transaction_id_created_at.
- INDEX (created_by) — ix_payment_allocations_created_by.

Foreign key:
- payment_transaction_id → payment_transactions.id, fk_payment_allocations_payment_transaction_id, RESTRICT.
- billing_account_id → billing_accounts.id, fk_payment_allocations_billing_account_id, RESTRICT.
- reversal_of_id → payment_allocations.id, fk_payment_allocations_reversal_of_id, RESTRICT.
- created_by → users.id, fk_payment_allocations_created_by, RESTRICT.

CHECK SQL:
- `amount > 0`.
- `(entry_type = 'ALLOCATION' AND reversal_of_id IS NULL) OR (entry_type = 'REVERSAL' AND reversal_of_id IS NOT NULL AND reason IS NOT NULL)`.
- `reversal_of_id IS NULL OR reversal_of_id <> id`.
- `entry_type IN ('ALLOCATION', 'REVERSAL')`.

Cast entry_type: App/Enums/AllocationEntryType.php, nilai ALLOCATION/REVERSAL.

## appointment_billing_links
Model: app/Models/AppointmentBillingLink.php. PK dan kolom common mengikuti konvensi di atas. INSERT-only; UPDATE/DELETE ditolak event Eloquent serta trigger DB.

| Kolom | Tipe MySQL | Wajib/default | Makna/aturan |
|---|---|---|---|
| appointment_id | CHAR(36) | W | FK appointments; khusus CUSTOM INCLUDED |
| billing_account_id | CHAR(36) | W | FK billing_accounts; tagihan asal |
| created_by | CHAR(36) | W | FK users |
| reason | VARCHAR(500) | W | Alasan keterkaitan tanpa biaya dasar kedua |

Index/unique (selain PK):
- UNIQUE (appointment_id) — uq_appointment_billing_links_appointment_id.
- INDEX (billing_account_id) — ix_appointment_billing_links_billing_account_id.
- INDEX (created_by) — ix_appointment_billing_links_created_by.

Foreign key:
- appointment_id → appointments.id, fk_appointment_billing_links_appointment_id, RESTRICT.
- billing_account_id → billing_accounts.id, fk_appointment_billing_links_billing_account_id, RESTRICT.
- created_by → users.id, fk_appointment_billing_links_created_by, RESTRICT.

## Tabel teknis Laravel
| Tabel | Kolom/PK | Relasi/index penting |
|---|---|---|
| password_reset_tokens | email VARCHAR255 PK, token VARCHAR255, created_at TIMESTAMP nullable | Token hanya hash/secret server, bukan props |
| sessions | id VARCHAR255 PK; user_id CHAR36 nullable; ip_address VARCHAR45 nullable; user_agent TEXT nullable; payload LONGTEXT; last_activity INT | FK users RESTRICT; index last_activity dan user_id |
| cache | key VARCHAR255 PK, value MEDIUMTEXT, expiration BIGINT signed | Bukan sumber transaksi |
| cache_locks | key VARCHAR255 PK, owner VARCHAR255, expiration BIGINT signed | Lock cache bukan pengganti DB lock resource |
| jobs | id BIGINT UNSIGNED auto PK, queue VARCHAR255, payload LONGTEXT, attempts SMALLINT UNSIGNED, reserved_at INT UNSIGNED nullable, available_at/created_at INT UNSIGNED | index queue; payload jangan berisi seluruh jawaban klinis |
| job_batches | id VARCHAR255 PK, name VARCHAR255, total_jobs/pending_jobs/failed_jobs INT, failed_job_ids LONGTEXT, options MEDIUMTEXT nullable, cancelled_at/finished_at INT nullable, created_at INT | Teknis queue |
| failed_jobs | id BIGINT UNSIGNED auto PK, uuid VARCHAR255 unique, connection/queue VARCHAR255, payload/exception LONGTEXT, failed_at TIMESTAMP default current | Index(connection,queue,failed_at); redaksi log/secret wajib pada worker |
| migrations | id INT UNSIGNED auto PK, migration VARCHAR255, batch INT | Dibuat repository Laravel |

Tidak dibuat model bisnis untuk tabel teknis ini. Session/cache lokal dapat tetap file; tabel teknis tersedia tanpa otomatis menjalankan worker.

## Transisi yang menjadi kontrak action berikutnya
| Entitas | Transisi pokok | Larangan |
|---|---|---|
| Appointment | WAITING_PAYMENT→WAITING_VERIFICATION→CONFIRMED atau CONFIRMED_AUTO_SLA; CHECKED_IN→IN_CONSULTATION→COMPLETED | Auto-SLA tidak mengubah kas; NOT_REQUIRED tidak memasuki status menunggu bayar |
| Proof/payment | PENDING_VERIFICATION/PENDING_RECONCILIATION→VERIFIED atau REJECTED; proof koreksi berversi | VERIFIED immutable; koreksi lewat transaksi REVERSAL baru, bukan overwrite |
| Reschedule request | REQUESTED→APPROVED/SLOT_SELECTION_REQUIRED→APPLIED atau REJECTED/EXPIRED/CANCELLED | Satu request aktif/resolution guard; kuota hanya APPLIED asal PATIENT |
| Plan | ACTIVE→AWAITING_SETTLEMENT jika sesi selesai namun administrasi belum selesai; kemudian COMPLETED, atau DISCONTINUED beralasan | ACTIVE dan AWAITING_SETTLEMENT sama-sama menghalangi plan aktif kedua |
| Billing collection | OPEN→CLOSED_PAID atau CLOSED_UNSERVED | CLOSED_UNSERVED bukan pembayaran/receipt nol; kas lama tetap |
| Assessment case | OPEN→IN_PROGRESS→READY_FOR_REPORT→CLOSED; reopen beralasan | Tidak menagih BASE kedua untuk pertemuan included |
| Profiling | DRAFT→SUBMITTED; appointment boleh diikat satu kali setelah submit | Jawaban terkirim tidak diubah/dipindah ke appointment lain; buat submission baru |
| Notification | QUEUED→SENDING→SENT atau RETRY/FAILED/CANCELLED | SENT hanya acknowledgment, bukan dibaca/hadir/bayar |

CHECK enum hanya membatasi himpunan nilai; ia tidak menegakkan seluruh pasangan transisi/status. Action perlu memeriksa keadaan asal di bawah lock. Seluruh perubahan lintas entitas dilakukan atomik dan membuat event/audit/outbox, bukan raw PATCH status dari client.

## Batas jaminan DB/model dan concurrency
- DomainModel menambah row_version dengan WHERE id+versi lama; record usang melempar StaleDomainRecord. Ini mencegah lost update pada save Eloquent, bukan janji raw SQL ikut memeriksa versi.
- ChecksDomainRelations memeriksa hubungan pasien pada billing/submission/case/plan, kategori plan/case, owner aktif, eligibility receipt, serta sumber/tujuan alokasi saat save Eloquent. Policy/perizinan tetap di lapisan berikutnya. Query builder tidak menjalankan event Eloquent.
- Trigger menjaga tabel append-only, transaksi uang VERIFIED, dan jawaban profiling SUBMITTED meski raw query. Submission hanya boleh satu kali bind appointment dengan field jawaban/identitas/template/timestamp submit yang tetap.
- DB tidak mempunyai exclusion constraint interval. Buat/lock schedule_resources(praktisi,local_date) dalam transaction, baru query overlap [start,end) dan kuota. Reschedule mengunci semua tanggal lama/baru dalam urutan stabil; tidak ada isBooked kedua.
- SUM alokasi <=kas bersih, SUM diskon <=line, kewajiban invoice =jumlah line, saldo CLOSED_PAID, kecukupan minimum DP, keterkaitan nominal reversal, eligibility sesi/reschedule dan reminder memerlukan action transaksi. Jangan menganggap UUID/FK/index atau hidden model sudah menyelesaikannya.
- Urutan lock kanonik: resource-hari terurut → plan/case → appointment/request terurut → billing terurut → transaksi/alokasi → sequence/idempotency. Jika aksi uang tidak menyentuh jadwal, mulai pada parent cakupan yang dibutuhkan dengan urutan relatif tetap. Retry deadlock dibatasi dan tetap memakai idempotency.
- Invoice/line/receipt immutable dibangun sekali dalam transaction. Penambahan setelah terbit ADDENDUM; diskon/koreksi/pelepasan bagian belum diberikan ADJUSTMENT dengan reference. Tidak menulis ulang invoice atau menghapus penerimaan saat cancel/reschedule.
- Idempotency scoped actor+action+key; payload hash berbeda pada key sama ditolak. Satu penerimaan nyata tidak dicatat dua kali. Referensi bank/checksum hanya kandidat duplikasi, bukan UNIQUE uang global.

## Privasi dan retensi
pretest_submissions.answers LONGTEXT memakai encrypted:array; clinical_objective dan meeting_url encrypted. APP_KEY yang sudah dipakai tidak boleh diganti sembarangan; backup terenkripsi dan pengelolaan kunci diperlukan pada deployment. Kertas offline langsung ke owner, tidak otomatis diunggah.
Field klinis, nominal kas tertentu, private storage key, snapshot receipt, link dan payload sensitif disembunyikan pada serialisasi default model. Hidden bukan policy: halaman memakai DTO allowlist per role dan tidak membagikan raw Eloquent. Admin tidak menerima saldo/agregat kas/receipt penuh/klinis.
File memakai private_files dengan expires_at/purged_at; setelah satu tahun hapus blob dan simpan tombstone/audit, bukan DELETE transaksi. Download PDF tujuh hari adalah policy akses, bukan masa simpan record. Trigger histori tidak menghapus data klinis/keuangan otomatis setahun.

## Migration dan pengujian
Kelompok create table dibentuk lebih dahulu, lalu FK, CHECK dan trigger. down() membuang trigger/CHECK/FK sebelum tabel dalam urutan terbalik. Rollback adalah operasi pengembang pada database uji; histori produksi tidak dikoreksi dengan rollback.
Uji terisolasi: php tests/database-foundation.php. Skrip hanya menerima MySQL localhost, membuat nama acak jiwasehat_schema_test_<12hex>, menguji migration/model/integritas, rollback lalu migrate ulang, dan menghapus hanya database acak miliknya. Tidak memakai migrate:fresh pada database aplikasi.
Untuk aplikasi yang database-nya sudah dibuat operator: php artisan migrate. Laravel migration membuat tabel, bukan CREATE DATABASE; pembuatan schema lokal awal dilaporkan terpisah pada handoff. Tidak ada seed/import data pasien otomatis.

Referensi implementasi: [Laravel migrations](https://laravel.com/framework/docs/13.x/migrations), [Eloquent](https://laravel.com/framework/docs/13.x/eloquent), [relationships](https://laravel.com/framework/docs/13.x/eloquent-relationships).


## Penyesuaian kewajiban belum diberikan
Pelepasan sisa memakai invoice ADJUSTMENT dan line kind=CORRECTION,direction=MINUS,reference_line_id asal,reason wajib serta metadata.reason_code=UNSERVED_RELEASE. CORRECTION di sini adalah kategori penyesuaian kewajiban terbit; INPUT_ERROR dan UNSERVED_RELEASE mempunyai alasan berbeda. Ini tidak membuat payment REVERSAL, karena uang nyata tidak dikembalikan. Pengurangan dibatasi bagian belum diberikan dan sisa yang boleh ditutup, diperiksa action di bawah lock.

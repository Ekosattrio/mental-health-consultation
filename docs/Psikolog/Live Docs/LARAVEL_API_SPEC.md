# Spesifikasi Backend API Laravel 12+ (JiwaSehat)

Dokumen ini merupakan panduan implementasi teknis backend **Laravel 12+** untuk platform konsultasi psikologi **JiwaSehat**, yang dirancang agar terhubung dengan frontend React/Vite TypeScript.

---

## Addendum 22 Oktober 2026 - Conditional Reschedule dan CMS Owner

- Payload semua reschedule menyertakan `expected_version` integer. Dalam transaction/row lock appointment, tolak versi usang dengan `409 SCHEDULE_VERSION_CONFLICT`, periksa kembali role/status/H+1/durasi/kuota/overlap, increment `schedule_version` dan insert histori atomik. Resource seluruh role menyertakan `scheduleVersion`; admin tidak menerima field keuangan/klinis hanya karena memerlukan versi.
- `GET /cms/landing` berupa allowlist publik tanpa rekening/QRIS kasir. `GET /psychologist/cms/landing` mengembalikan konfigurasi lengkap hanya owner. Semua update CMS tetap Policy psikolog; admin tidak berwenang.
- Hold menyimpan snapshot instruksi rekening server, diekspos kepada pemilik dengan `payment_channel_detail`/`account_holder` sesuai flow consent. Perubahan CMS tidak mengubah instruksi hold lama; jangan menerima rekening dari payload pasien sebagai sumber kebenaran.
- Detail editor ada di [[CMS_AUDIT]] dan aturan konflik di [[API]]. Fallback versi legacy frontend bukan pengganti backfill/validasi server. Backend dan adapter runtime belum diimplementasikan.

## Addendum Kontrak Frontend - 21 Oktober 2026

Detail endpoint ada di [[API]] bagian Pengaman Booking dan Kas. Addendum ini berlaku bila contoh lama di bawah belum memuat field baru.

- `src/services/api/slotHoldService.ts` menyiapkan create/get/release `/slot-holds`, dengan status, server_time, expires_at, dan package_version. Prototype sudah memiliki implementasi hold lokal sebelum rekening; service server belum runtime. Default lokal 15 menit, bukan TTL produksi final.
- Booking pasien menambahkan `slot_hold_id` dan `expected_total_amount`. Validasi quote/snapshot tetap server-side; expected amount tidak boleh menjadi sumber harga. Perubahan quote wajib conflict dan persetujuan ulang.
- Walk-in menambahkan `initial_payment_amount`, `payment_phase`, `received_date`, dan `reconciliation_id` opsional. FULL tetap pending sampai verifikasi. Validasi nominal aktual dan penyimpanan pasien/booking/ledger/konfirmasi atomik diperlukan; admin tetap menerima Resource tanpa nominal.
- `paymentReconciliationService` menyiapkan list/create `/payment-reconciliations`: file privat, pemilik hold, idempotency/keunikan per hold, status OPEN/BOOKED, dan appointmentId pengganti. Memprosesnya melalui walk-in H+1 memakai bukti yang sudah ada, bukan transfer/unggah ulang; jangan mengakui kas sebelum verifikasi. Detail pada [[API]].
- Verifikasi DP menerima `received_date`; input pembayaran lanjutan menyertakan `received_date`. Simpan tanggal penerimaan terpisah dari `recorded_at/verified_at` server dan jangan menerima tanggal masa depan.
- Kas terverifikasi berasal dari ledger, tidak dari status FULL atau harga paket semata. Finance/CSV/Excel/PDF menggunakan satu row setiap penerimaan pada tanggal uang diterima. Tanggal historis tidak pasti ditandai estimasi, bukan diisi tanggal konsultasi.
- Lock kapasitas per psikolog/tanggal sebelum memeriksa overlap/kuota/hold; gunakan protokol sama pada perubahan jadwal dan reschedule. Lock plan/ledger pada pembayaran serta sesi. Tambahkan idempotency dan re-fetch resource setelah mutasi.
- Reservasi server harus aktif sebelum pasien diarahkan transfer. Jika uang sudah dikirim tetapi hold tidak valid, simpan kasus rekonsiliasi privat dan cegah pembayaran/booking dobel; jangan auto-hapus bukti atau membuat refund diam-diam.
- Integrasi backend wajib mengganti full-array LocalStorage mutations. Transaction DB tidak menyelesaikan snapshot overwrite bila frontend masih menulis ulang store mock setelah response API.

---

## 1. Konsep & Arsitektur Utama

- **Framework**: Laravel 12.x (PHP 8.3+)
- **Database Engine**: MySQL 8.0+
- **Autentikasi**: Laravel Sanctum (Personal Access Token / SPA State Cookies) & Laravel Socialite (Google SSO)
- **Format Pertukaran Data**: JSON standar RFC 7807 / RESTful API Resource
- **Prefix Route API**: `/api/v1`
- **File Storage**: Private/Public Disk (Local / AWS S3) untuk bukti transfer DP dan lampiran asesmen.

---

## 2. Standar Respons JSON API

### 2.1. Format Respons Sukses
```json
{
  "success": true,
  "message": "Data reservasi berhasil dibuat",
  "data": {
    "id": "apt-uuid-12345",
    "booking_code": "JS-20261002-01",
    "status": "PENDING",
    "payment_status": "DP_PENDING_VERIFICATION",
    "total_amount": 350000
  },
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 8,
    "total": 38
  }
}
```

### 2.2. Format Respons Error Validasi (HTTP 422)
```json
{
  "success": false,
  "message": "Validasi data gagal.",
  "errors": {
    "date": ["Tanggal booking tidak boleh di masa lalu."],
    "time": ["Slot waktu sudah terisi atau di luar jam operasional praktik."]
  }
}
```

### 2.3. Format Respons Autentikasi / Otorisasi (HTTP 401 / 403)
```json
{
  "success": false,
  "message": "Unauthenticated / Akses tidak diizinkan untuk peran pengguna ini."
}
```

---

## 3. Skema Database & Migrasi Eloquent

### 3.1. Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` / `bigIncrements` | Primary key |
| `name` | `string(150)` | Nama lengkap |
| `email` | `string(150)` | Unik, index |
| `password` | `string` | Nullable jika murni Google SSO |
| `google_id` | `string` | Nullable, index SSO |
| `role` | `enum('PATIENT','PSYCHOLOGIST','ADMIN')` | Default `'PATIENT'` |
| `status` | `enum('ACTIVE','PENDING_VERIFICATION','BLOCKED')` | Default `'ACTIVE'` |
| `avatar` | `string` | URL foto profil |
| `phone` | `string(25)` | Nomor kontak / WhatsApp |
| `birth_date` | `date` | Nullable, tanggal lahir pasien |
| `gender` | `string(20)` | Nullable, Laki-laki / Perempuan |
| `occupation` | `string(100)` | Nullable, pekerjaan |
| `city` | `string(100)` | Nullable, kota domisili |
| `emergency_contact` | `string(150)` | Nullable, nomor kontak & nama darurat |
| `is_profile_complete`| `boolean` | Default `false`, wajib `true` sebelum booking |
| `email_verified_at` | `timestamp` | Nullable |
| `created_at`, `updated_at` | `timestamps` | Standar Laravel |

### 3.2. Tabel `psychologist_profiles`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` / `bigIncrements` | Primary key |
| `user_id` | `foreignId` | Relasi ke `users.id` (onDelete cascade) |
| `title` | `string(150)` | Misal: "Psikolog Klinis Dewasa & Hubungan" |
| `str_number` | `string(50)` | Nomor Surat Tanda Registrasi |
| `sip_number` | `string(50)` | Nomor Surat Izin Praktik Psikolog |
| `avatar_url` | `text` / `string` | Nullable, URL foto wajah resmi psikolog |
| `experience_years`| `integer` | Pengalaman dalam tahun |
| `clinical_hours` | `integer` | Jam terbang klinis |
| `bio` | `text` | Biografi profil praktik |
| `education` | `json` | Array almamater pendidikan |
| `specialties` | `json` | Array spesialisasi kasus klinis |
| `therapy_approaches` | `json` | Array pendekatan terapi (CBT, ACT, dll) |
| `languages` | `json` | Bahasa sesi konsultasi |
| `clinic_address` | `text` | Lokasi klinik offline tatap muka |
| `practice_policy`| `text` | Kebijakan informed consent |
| `created_at`, `updated_at` | `timestamps` | |

### 3.3. Tabel `consultation_packages`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` / `bigIncrements` | Primary key |
| `name` | `string(150)` | Nama paket (misal: "Konsultasi Offline 60 Menit") |
| `category` | `enum('COUNSELING','ASSESSMENT','PSYCHOTHERAPY')` | Kategori paket resmi |
| `delivery_mode` | `enum('OFFLINE_CLINIC','ONLINE_TELE')` | Metode sesi; asesmen/psikoterapi dapat memakai default tatap muka |
| `session_type` | `enum('SINGLE_SESSION','CONTINUOUS_CARE')` | Sesi tunggal atau rawat jalan |
| `duration_minutes` | `integer` | 60, 75, 90, atau 180 menit |
| `price` | `decimal(12,2)` | Psikoterapi: tarif per sesi; layanan lain: tarif paket |
| `discount_type` | `enum('NONE','PERCENT','FIXED')` | Jenis diskon langsung tanpa voucher |
| `discount_value` | `decimal(12,2)` | Nilai persentase atau nominal diskon |
| `discount_label` | `string(150)` | Nullable, label potongan yang tampil ke pasien |
| `description` | `text` | Rincian dan deskripsi paket |
| `benefits` | `json` | Poin manfaat / fasilitas include |
| `continuous_care_note` | `text` | Nullable, panduan rencana rawat jalan berkala |
| `total_sessions` | `integer` | Default 1; psikoterapi wajib 4 sesi awal per booking |
| `frequency` | `string(50)` | Nullable, misal: "1x seminggu" |
| `is_active` | `boolean` | Status on/off paket |

### 3.4. Tabel `treatment_plans` (Rencana Paket Multi-Sesi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` | Primary key |
| `patient_id` | `foreignId` | Relasi ke `users.id` pasien |
| `psychologist_id` | `foreignId` | Relasi ke `users.id` psikolog |
| `package_id` | `foreignId` | Relasi ke `consultation_packages.id` |
| `status` | `enum('ACTIVE','COMPLETED','DISCONTINUED')` | Status rencana terapi |
| `total_planned_sessions` | `integer` | Jumlah sesi paket |
| `completed_sessions` | `integer` | Jumlah sesi yang sudah selesai |
| `next_session_number` | `integer` | Nomor sesi berikutnya yang boleh dijadwalkan |
| `clinical_objective` | `text` | Nullable, target klinis |
| `started_at`, `completed_at` | `date` | Nullable |
| `created_at`, `updated_at` | `timestamps` | |

Catatan: paket 4/5/8/10 sesi memakai `treatment_plans` sebagai induk. Appointment dibuat bertahap per pertemuan, bukan semua sesi langsung dibuat saat transaksi awal.

### 3.5. Tabel `schedules` (Jadwal Mingguan Rutin)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `bigIncrements` | |
| `psychologist_id`| `foreignId` | Relasi ke `users.id` |
| `day_of_week` | `enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')` | Hari |
| `is_active` | `boolean` | `true` jika buka praktik |
| `start_time` | `time` | Default '09:00:00' |
| `end_time` | `time` | Default '17:00:00' |
| `max_patients` | `integer` | Kapasitas maksimal kuota per hari |

### 3.6. Tabel `schedule_overrides` (Libur & Kuota Khusus Tanggal Tertentu)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `bigIncrements` | |
| `psychologist_id`| `foreignId` | |
| `date` | `date` | Tanggal spesifik (YYYY-MM-DD) |
| `is_day_off` | `boolean` | Status libur dadakan |
| `custom_max_patients` | `integer` | Nullable, kuota override |
| `reason` | `string` | Alasan (misal: "Seminar Nasional") |

### 3.7. Tabel `appointments` (Booking Konsultasi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` | Primary key |
| `booking_code` | `string(30)` | Unik, misal: "JS-20261002-01" |
| `patient_id` | `foreignId` | Relasi ke `users.id` (Pasien) |
| `psychologist_id`| `foreignId` | Relasi ke `users.id` (Psikolog) |
| `package_id` | `foreignId` | Relasi ke `consultation_packages.id` |
| `treatment_plan_id` | `foreignId` | Nullable, relasi ke `treatment_plans.id` untuk paket multi-sesi |
| `date` | `date` | Tanggal sesi |
| `start_time` | `time` | Jam mulai sesi |
| `end_time` | `time` | Jam berakhir sesi |
| `session_type` | `enum('OFFLINE_CLINIC','ONLINE_TELE')` | Telelayanan hanya booking di website; pertemuan melalui platform pihak ketiga |
| `status` | `enum('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW')` |
| `payment_status` | `enum('PENDING','DP_PENDING_VERIFICATION','DP_PAID','PAID','REFUNDED')` |
| `subtotal_amount` | `decimal(12,2)` | Snapshot harga paket sebelum diskon |
| `discount_label` | `string(150)` | Nullable, snapshot label potongan |
| `discount_amount` | `decimal(12,2)` | Snapshot nominal potongan |
| `total_amount` | `decimal(12,2)` | Total paket setelah diskon |
| `dp_amount` | `decimal(12,2)` | Snapshot DP flat Rp100.000 yang dihitung server saat booking |
| `remaining_amount` | `decimal(12,2)` | Sisa tagihan pelunasan di klinik |
| `transfer_sender_name` | `string(150)` | Nullable, nama pemilik rekening pengirim |
| `payment_proof_url` | `string` | Nullable, path foto berkas transfer DP |
| `payment_proof_name` | `string(255)` | Nullable, nama asli berkas untuk tampilan audit |
| `payment_proof_mime_type` | `string(100)` | Nullable, MIME hasil validasi server |
| `payment_verified_at` | `timestamp` | Nullable, waktu bukti diverifikasi |
| `payment_verified_by` | `foreignId` | Nullable, admin yang memverifikasi |
| `payment_verification_note` | `text` | Nullable, catatan pemeriksaan admin |
| `final_payment_amount` | `decimal(12,2)` | Opsional untuk kompatibilitas data lama; sumber uang masuk baru adalah `payment_transactions` |
| `final_payment_method` | `enum('CASH','BANK_TRANSFER','QRIS','EDC','OTHER')` | Opsional untuk kompatibilitas data lama |
| `final_payment_channel_detail` | `string(150)` | Opsional untuk kompatibilitas data lama |
| `final_payment_recorded_at` | `timestamp` | Opsional untuk kompatibilitas data lama |
| `final_payment_recorded_by` | `foreignId` | Opsional untuk kompatibilitas data lama |
| `continuous_session_number`| `integer` | Nullable, nomor sesi ke-N jika rawat jalan |
| `continuous_session_total`| `integer` | Nullable, total sesi dalam paket |
| `admin_notes` | `text` | Catatan verifikator admin |
| `created_at`, `updated_at` | `timestamps` | |

Constraint penting:
- Unique `(treatment_plan_id, continuous_session_number)` untuk mencegah sesi lanjutan dobel.
- Index `(psychologist_id, date, start_time, end_time, status)` untuk validasi bentrok jadwal dan performa kalender.
- Pembuatan appointment wajib memakai database transaction dan validasi overlap slot aktif.

### 3.8. Tabel `intake_forms` (Pre-Test & Keluhan Awal)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` | |
| `appointment_id`| `foreignId nullable` | Draft sebelum booking; diikat dalam transaction create appointment, immutable setelah terikat |
| `form_version` | `string` | Versi pertanyaan pre-test |
| `answers_json` | `json` | Snapshot primary_concerns, concern_description, current_stress_level, sleep_quality, goals, serta field riwayat opsional sesuai intakeService |
| `patient_id` | `foreignId` | Relasi ke `users.id` |
| `birth_date` | `date` | Tanggal lahir pasien |
| `gender` | `string(20)` | |
| `occupation` | `string(100)` | Pekerjaan |
| `emergency_name` | `string(100)` | Nama kontak darurat |
| `emergency_rel` | `string(50)` | Hubungan keluarga |
| `emergency_phone`| `string(25)` | Telepon kontak darurat |
| `chief_complaint`| `text` | Keluhan utama |
| `duration` | `string(100)` | Durasi gejala |
| `completed_at` | `timestamp` | Waktu penyimpanan draft; consent final dicatat terpisah saat booking |
| `created_at` | `timestamp` | |

### 3.9. Tabel `payment_transactions` (DP dan Pembayaran Bertahap)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` | Primary key |
| `treatment_plan_id` | `foreignId` | Nullable untuk booking sesi tunggal |
| `appointment_id` | `foreignId` | Booking awal/invoice terkait |
| `kind` | `enum('DP','INSTALLMENT')` | DP dicatat sekali, sisanya boleh bertahap |
| `purpose` | `enum('CONSULTATION','CANCELLATION_SETTLEMENT')` | Pelunasan untuk penghentian dapat diterima sebelum sesi pertama |
| `amount` | `decimal(12,2)` | Hanya terlihat oleh psikolog/owner |
| `method` | `enum('CASH','BANK_TRANSFER','QRIS','EDC','OTHER')` | Cara bayar |
| `channel_detail` | `string(150)` | Nullable, bank/channel |
| `recorded_by` | `foreignId` | Admin pencatat |
| `idempotency_key` | `string(100)` | Unik untuk mencegah duplikasi |
| `verified_at` | `timestamp` | Waktu verifikasi |
| `created_at` | `timestamp` | Waktu catat |

### 3.10. Consent dan Audit Jadwal

- `consents`: id, patient_id, appointment_id, document_version, privacy_version, accepted_at, ip_address, user_agent. Metadata request berasal dari server.
- `appointment_reschedules`: from/to tanggal dan jam, pelaku/role, alasan, created_at. Setiap reschedule menambah record.
- `appointment_status_events`: appointment_id, from_status, to_status, actor_id, reason, created_at.
- Create booking menerima draft pre-test dan consent versi aktif beserta bukti multipart; semuanya diikat dalam transaction. Tidak perlu appointment lebih dahulu untuk membuat draft.
- Cancel/discontinue mengunci ledger dan rencana, menolak saldo tersisa atau pembayaran belum `PAID`, lalu menghentikan rencana dan membatalkan seluruh sisa appointment. Sesi completed dan seluruh pembayaran tetap menjadi histori.
- Konfirmasi ulang reschedule tidak mengubah nominal/status/audit pembayaran awal. Response admin wajib Resource administratif tanpa harga, saldo, ledger, consent, atau data klinis.
- Keputusan 22 Oktober 2026: keterlambatan/ketidakhadiran dikonfirmasi manual psikolog. Tidak ada auto-cancel/auto-no-show; psikolog penanggung jawab dapat reschedule `NO_SHOW -> CONFIRMED` pada appointment yang sama, minimal H+1, dengan alasan dan slot valid. Simpan histori status/jadwal, jangan menambah nomor/jatah sesi atau mengubah DP/ledger; tidak ada DP kedua. Admin/pasien tidak dapat memulihkan NO_SHOW sendiri. Tolak rencana terminal, pembayaran awal belum terverifikasi, atau rencana yang sudah memiliki sesi lanjutan/aktif lain.
- Tidak ada fitur minta unggah ulang bukti. Admin menahan konfirmasi bila transaksi belum dapat dicocokkan secara manual.

### 3.11. Tabel `reviews` (Ulasan & Rating)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` | |
| `appointment_id`| `foreignId` | Unik |
| `patient_id` | `foreignId` | |
| `psychologist_id`| `foreignId` | |
| `rating` | `tinyInteger` | 1 sampai 5 |
| `comment` | `text` | Testimoni pasien |
| `is_anonymous` | `boolean` | Anonimitas ulasan |
| `is_approved` | `boolean` | Default `false` (wajib moderasi admin) |
| `created_at` | `timestamp` | |

---

## 4. Pemetaan Route API (`routes/api.php`)

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\PackageController;
use App\Http\Controllers\Api\V1\ScheduleController;
use App\Http\Controllers\Api\V1\FinanceController;
use App\Http\Controllers\Api\V1\IntakeController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\CmsController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\TreatmentPlanController;
use App\Http\Controllers\Api\V1\NotificationController;

Route::prefix('v1')->group(function () {

    // --- PUBLIC ENDPOINTS ---
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
    Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);
    
    // Paket Layanan Publik
    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{id}', [PackageController::class, 'show']);
    Route::get('/psychologists/{id}/profile', [AuthController::class, 'psychologistProfile']);
    
    Route::get('/cms/landing', [CmsController::class, 'getLanding']);
    Route::get('/reviews', [ReviewController::class, 'indexPublic']);
    Route::get('/reviews/{id}', [ReviewController::class, 'show']);
    Route::get('/schedules/available-slots', [ScheduleController::class, 'availableSlots']);

    // --- PROTECTED ENDPOINTS (AUTH SANCTUM) ---
    Route::middleware('auth:sanctum')->group(function () {
        
        // Autentikasi & Profil Pengguna Aktif
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::get('/appointments/{id}', [AppointmentController::class, 'show']);

        // --- ROLE: PATIENT ---
        Route::middleware('role:PATIENT')->group(function () {
            Route::get('/patients/me/profile', [AuthController::class, 'patientProfile']);
            Route::put('/patients/me/profile', [AuthController::class, 'updatePatientProfile']);
            Route::post('/appointments', [AppointmentController::class, 'store']);
            Route::post('/appointments/{id}/reschedule', [AppointmentController::class, 'requestReschedule']);
            Route::get('/appointments/{id}/receipt', [AppointmentController::class, 'patientReceipt']);
            Route::post('/patient/pre-tests', [IntakeController::class, 'store']);
            Route::get('/patient/pre-tests', [IntakeController::class, 'indexMine']);
            Route::get('/patient/pre-tests/{id}', [IntakeController::class, 'showMine']);
            Route::put('/patient/pre-tests/{id}', [IntakeController::class, 'updateMine']);
            Route::post('/reviews', [ReviewController::class, 'store']);
            Route::get('/cms/patient', [CmsController::class, 'getPatientCms']);
        });

        // --- ROLE: PSYCHOLOGIST ---
        Route::middleware('role:PSYCHOLOGIST')->group(function () {
            // Manajemen Paket Layanan Dinamis
            Route::post('/packages', [PackageController::class, 'store']);
            Route::put('/packages/{id}', [PackageController::class, 'update']);
            Route::delete('/packages/{id}', [PackageController::class, 'destroy']);
            Route::patch('/packages/{id}/status', [PackageController::class, 'setStatus']);

            // Upload & Kelola Foto Wajah Profil Psikolog
            Route::post('/psychologists/me/avatar', [AuthController::class, 'uploadAvatar']);
            Route::delete('/psychologists/me/avatar', [AuthController::class, 'deleteAvatar']);
            Route::put('/psychologists/{id}/profile', [AuthController::class, 'updatePsychologistProfile']);
            Route::get('/psychologist/users/{id}', [AdminController::class, 'showPatientForOwner']);

            // Jadwal & Pengaturan
            Route::get('/psychologists/{id}/schedules', [ScheduleController::class, 'show']);
            Route::get('/psychologists/{id}/schedules/weekly', [ScheduleController::class, 'showWeekly']);
            Route::put('/psychologists/{id}/schedules/weekly', [ScheduleController::class, 'updateWeekly']);
            Route::post('/psychologists/{id}/schedules/day-off', [ScheduleController::class, 'addDayOff']);
            Route::delete('/psychologists/{id}/schedules/day-off/{dayOffId}', [ScheduleController::class, 'deleteDayOff']);
            Route::put('/psychologists/{id}/schedules/date-overrides/{date}', [ScheduleController::class, 'upsertDateOverride']);
            Route::delete('/psychologists/{id}/schedules/date-overrides/{date}', [ScheduleController::class, 'deleteDateOverride']);
            Route::get('/psychologist/patients/{patientId}/pre-test', [IntakeController::class, 'patientPreTest']);
            Route::get('/psychologist/appointments/{id}/pre-test', [IntakeController::class, 'appointmentPreTest']);
            Route::patch('/psychologist/appointments/{id}/complete', [AppointmentController::class, 'completeByPsychologist']);
            Route::patch('/psychologist/appointments/{id}/no-show', [AppointmentController::class, 'markNoShow']);
            Route::patch('/psychologist/appointments/{id}/reschedule', [AppointmentController::class, 'rescheduleByPsychologist']);
            Route::patch('/psychologist/appointments/{id}/cancel', [AppointmentController::class, 'cancelByPsychologist']);
            Route::get('/treatment-plans', [TreatmentPlanController::class, 'index']);
            Route::post('/treatment-plans', [TreatmentPlanController::class, 'store']);
            Route::get('/treatment-plans/{id}', [TreatmentPlanController::class, 'show']);
            Route::post('/treatment-plans/{id}/sessions', [TreatmentPlanController::class, 'scheduleNextSession'])
                ->middleware('idempotency');
            Route::patch('/treatment-plans/{id}/discontinue', [TreatmentPlanController::class, 'discontinue']);
            Route::put('/cms/psychologist', [CmsController::class, 'updatePsychologistCms']);
            Route::get('/cms/psychologist', [CmsController::class, 'getPsychologistCms']);
        });

        // --- ROLE: ADMIN ---
        Route::middleware('role:ADMIN')->group(function () {
            // User Monitoring (Strict Read-Only)
            Route::get('/admin/users', [AdminController::class, 'users']);

            // Reservasi & Walk-in Booking
            Route::post('/admin/appointments/walk-in', [AppointmentController::class, 'storeWalkIn']);
            Route::post('/admin/appointments/{id}/verify-payment', [AppointmentController::class, 'verifyPayment']);
            Route::post('/admin/appointments/{id}/confirm-reschedule', [AppointmentController::class, 'confirmReschedule']);
            Route::post('/admin/appointments/{id}/final-payment', [AppointmentController::class, 'recordFinalPayment']);
            Route::patch('/admin/appointments/{id}/reschedule', [AppointmentController::class, 'rescheduleByAdmin']);
            Route::get('/admin/appointments/{id}/receipt', [AppointmentController::class, 'adminReceipt']);

            // Moderasi Review
            Route::get('/admin/reviews', [ReviewController::class, 'indexAdmin']);
            Route::patch('/admin/reviews/{id}/moderate', [ReviewController::class, 'moderate']);
        });

        // --- ROLE: PSYCHOLOGIST / OWNER REPORTING ---
        Route::middleware('role:PSYCHOLOGIST')->group(function () {
            // Laporan uang masuk paket; tidak menghitung biaya operasional atau laba bersih
            Route::get('/finance/summary', [FinanceController::class, 'summary']);
            Route::get('/finance/transactions', [FinanceController::class, 'transactions']);
            Route::get('/finance/export/clinical', [FinanceController::class, 'clinicalExport']);
            Route::get('/finance/export/{format}', [FinanceController::class, 'export'])
                ->whereIn('format', ['pdf', 'xlsx', 'csv']);

            // CMS Update
            Route::get('/psychologist/cms/landing', [CmsController::class, 'getLandingForManagement']);
            Route::put('/cms/landing', [CmsController::class, 'updateLanding']);
            Route::put('/cms/patient', [CmsController::class, 'updatePatientCms']);
            Route::post('/cms/assets', [CmsController::class, 'uploadAsset']);
        });

        Route::get('/notifications/logs', [NotificationController::class, 'index']);
        Route::post('/notifications/{id}/resend', [NotificationController::class, 'resend']);
        Route::post('/notifications/appointments/{id}/send', [NotificationController::class, 'sendAppointmentEvent']);
        Route::post('/notifications/reminders/daily', [NotificationController::class, 'sendDailyReminder']);
    });
});
```

---

## 5. Implementasi Frontend Service Client

Seluruh komunikasi API dari frontend React telah dipetakan ke dalam direktori modular `src/services/api/`:
- `client.ts`: Base Fetch client dengan Bearer token, CSRF protection, dan error handling.
- `authService.ts`: Login, register, Google SSO, dan profile management.
- `packageService.ts`: CRUD paket konsultasi, filter kategori, dan switch on/off status aktif.
- `appointmentService.ts`: Booking wizard, verifikasi DP, reschedule, walk-in booking, complete sesi oleh psikolog, dan upload bukti transfer.
- `scheduleService.ts`: Konfigurasi jadwal mingguan, kuota tanggal tertentu, dan slot dinamis.
- `treatmentPlanService.ts`: Paket berjalan, sesi lanjutan idempotent, dan discontinue.
- `financeService.ts`: Mutasi kas masuk, filter bulan & tahun, dan ekspor PDF/XLSX/CSV/klinis.
- `intakeService.ts`: CRUD pre-test profiling keluhan awal sebagai syarat booking, bukan diagnosis.
- `reviewService.ts`: Manajemen testimoni dan moderasi bintang 1-5.
- `cmsService.ts`: Pengelolaan teks konten landing page, panduan pasien, dan kop dinas resmi.
- `userService.ts`: Profil pasien/psikolog dan monitoring user admin read-only.
- `notificationService.ts`: Log, retry, event appointment, dan reminder harian WhatsApp/email.

### Cara Penggunaan di Komponen React:
```tsx
import { appointmentService, financeService } from '@/services/api';

// Memuat data kas bulanan
const fetchFinancialData = async (month: string, year: string) => {
  try {
    const res = await financeService.getSummary({ month, year });
    console.log('Total Cash In:', res.data.total_cash_in);
  } catch (err: any) {
    console.error('Gagal memuat keuangan:', err.message);
  }
};
```

---

## 6. Checklist Kesiapan Integrasi ke Laravel 12

- [~] Struktur folder `src/services/api/` dibuat lengkap; pemeriksaan TypeScript menunggu izin developer untuk dijalankan.
- [x] Endpoint RESTful, payload, dan query parameter sesuai konvensi standar Laravel.
- [x] Skema database relasional telah disesuaikan dengan kebutuhan praktisi tunggal (tanpa split komisi dan tanpa SOAP medis).
- [x] Fitur Export CSV dan Cetak siap beroperasi baik di frontend langsung (client-side) maupun melalui stream response dari Laravel.

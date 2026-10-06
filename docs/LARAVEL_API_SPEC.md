# Spesifikasi Arsitektur Backend API Laravel 12++ (JiwaSehat)

Dokumen ini merupakan panduan implementasi teknis dan cetak biru (*blueprint*) backend **Laravel 12++** untuk platform konsultasi psikologi **JiwaSehat**, yang dirancang agar terhubung secara mulus dengan frontend React Vite TypeScript yang sudah dibangun.

---

## 1. Konsep & Arsitektur Utama

- **Framework**: Laravel 12.x (PHP 8.3+)
- **Database Engine**: PostgreSQL 16+ / MySQL 8.0+
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
| `session_type` | `enum('SINGLE_SESSION','CONTINUOUS_CARE')` | Sesi tunggal atau rawat jalan |
| `duration_minutes` | `integer` | 60, 75, 90, atau 180 menit |
| `price` | `decimal(12,2)` | Harga resmi paket konsultasi |
| `description` | `text` | Rincian dan deskripsi paket |
| `benefits` | `json` | Poin manfaat / fasilitas include |
| `continuous_care_note` | `text` | Nullable, panduan rencana rawat jalan berkala |
| `total_sessions` | `integer` | Default 1 (misal 4 untuk psikoterapi intensif) |
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
| `session_type` | `enum('OFFLINE','ONLINE')` | Default `'OFFLINE'` (klinik tatap muka) |
| `status` | `enum('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED')` |
| `payment_status` | `enum('PENDING','DP_PENDING_VERIFICATION','DP_PAID','PAID','REFUNDED')` |
| `total_amount` | `decimal(12,2)` | Total tarif paket |
| `dp_amount` | `decimal(12,2)` | Default 100000.00 (DP Flat Administrasi) |
| `remaining_amount` | `decimal(12,2)` | Sisa tagihan pelunasan di klinik |
| `transfer_sender_name` | `string(150)` | Nullable, nama pemilik rekening pengirim |
| `payment_proof_url` | `string` | Nullable, path foto berkas transfer DP |
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
| `appointment_id`| `foreignId` | Relasi ke `appointments.id` |
| `patient_id` | `foreignId` | Relasi ke `users.id` |
| `birth_date` | `date` | Tanggal lahir pasien |
| `gender` | `string(20)` | |
| `occupation` | `string(100)` | Pekerjaan |
| `emergency_name` | `string(100)` | Nama kontak darurat |
| `emergency_rel` | `string(50)` | Hubungan keluarga |
| `emergency_phone`| `string(25)` | Telepon kontak darurat |
| `chief_complaint`| `text` | Keluhan utama |
| `duration` | `string(100)` | Durasi gejala |
| `consent_given` | `boolean` | Persetujuan informed consent |
| `created_at` | `timestamp` | |

### 3.9. Tabel `dass21_results` (Asesmen Mandiri)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` | |
| `patient_id` | `foreignId` | |
| `appointment_id`| `foreignId` | Nullable |
| `depression_score` | `integer` | Skor subskala depresi |
| `anxiety_score` | `integer` | Skor subskala kecemasan |
| `stress_score` | `integer` | Skor subskala stres |
| `severity_level` | `string(30)` | Normal, Ringan, Sedang, Berat, Sangat Berat |
| `interpretation` | `text` | Interpretasi klinis |
| `created_at` | `timestamp` | |

### 3.10. Tabel `reviews` (Ulasan & Rating)
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

Route::prefix('v1')->group(function () {

    // --- PUBLIC ENDPOINTS ---
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
    Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);
    
    // Paket Layanan Publik
    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{id}', [PackageController::class, 'show']);
    
    Route::get('/cms/landing', [CmsController::class, 'getLanding']);
    Route::get('/reviews', [ReviewController::class, 'indexPublic']);
    Route::get('/schedules/available-slots', [ScheduleController::class, 'availableSlots']);

    // --- PROTECTED ENDPOINTS (AUTH SANCTUM) ---
    Route::middleware('auth:sanctum')->group(function () {
        
        // Autentikasi & Profil Pengguna Aktif
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // --- ROLE: PATIENT ---
        Route::middleware('role:PATIENT')->group(function () {
            Route::post('/appointments', [AppointmentController::class, 'store']);
            Route::post('/appointments/{id}/upload-proof', [AppointmentController::class, 'uploadProof']);
            Route::post('/appointments/{id}/reschedule', [AppointmentController::class, 'requestReschedule']);
            Route::post('/patient/intake-forms', [IntakeController::class, 'submitIntake']);
            Route::get('/patient/intake-forms', [IntakeController::class, 'myIntakes']);
            Route::post('/reviews', [ReviewController::class, 'store']);
            Route::get('/cms/patient', [CmsController::class, 'getPatientCms']);
        });

        // --- ROLE: PSYCHOLOGIST ---
        Route::middleware('role:PSYCHOLOGIST')->group(function () {
            // Manajemen Paket Layanan Dinamis
            Route::post('/packages', [PackageController::class, 'store']);
            Route::put('/packages/{id}', [PackageController::class, 'update']);
            Route::delete('/packages/{id}', [PackageController::class, 'destroy']);
            Route::patch('/packages/{id}/toggle-status', [PackageController::class, 'toggleStatus']);

            // Upload & Kelola Foto Wajah Profil Psikolog
            Route::post('/psychologists/me/avatar', [AuthController::class, 'uploadAvatar']);
            Route::delete('/psychologists/me/avatar', [AuthController::class, 'deleteAvatar']);

            // Jadwal & Pengaturan
            Route::get('/psychologists/{id}/schedules', [ScheduleController::class, 'show']);
            Route::put('/psychologists/{id}/schedules/weekly', [ScheduleController::class, 'updateWeekly']);
            Route::post('/psychologists/{id}/schedules/day-off', [ScheduleController::class, 'addDayOff']);
            Route::delete('/psychologists/{id}/schedules/day-off/{dayOffId}', [ScheduleController::class, 'deleteDayOff']);
            Route::get('/psychologist/patients/{patientId}/intake', [IntakeController::class, 'patientIntakeDetail']);
            Route::patch('/appointments/{id}/complete', [AppointmentController::class, 'completeByPsychologist']);
            Route::get('/treatment-plans', [TreatmentPlanController::class, 'index']);
            Route::post('/treatment-plans', [TreatmentPlanController::class, 'store']);
            Route::get('/treatment-plans/{id}', [TreatmentPlanController::class, 'show']);
            Route::post('/treatment-plans/{id}/sessions', [TreatmentPlanController::class, 'scheduleNextSession'])
                ->middleware('idempotency');
            Route::patch('/treatment-plans/{id}/discontinue', [TreatmentPlanController::class, 'discontinue']);
            Route::put('/cms/psychologist', [CmsController::class, 'updatePsychologistCms']);
        });

        // --- ROLE: ADMIN ---
        Route::middleware('role:ADMIN')->group(function () {
            // User Monitoring (Strict Read-Only)
            Route::get('/admin/users', [AdminController::class, 'users']);

            // Reservasi & Walk-in Booking
            Route::get('/appointments', [AppointmentController::class, 'index']);
            Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
            Route::post('/appointments/walk-in', [AppointmentController::class, 'storeWalkIn']);
            Route::patch('/appointments/{id}/confirm', [AppointmentController::class, 'confirm']);
            Route::post('/appointments/{id}/verify-payment', [AppointmentController::class, 'verifyPayment']);

            // Moderasi Review
            Route::get('/admin/reviews', [ReviewController::class, 'indexAdmin']);
            Route::patch('/reviews/{id}/moderate', [ReviewController::class, 'moderate']);
        });

        // --- ROLE: PSYCHOLOGIST / OWNER REPORTING ---
        Route::middleware('role:PSYCHOLOGIST')->group(function () {
            // Keuangan & Arus Kas Nyata
            Route::get('/finance/summary', [FinanceController::class, 'summary']);
            Route::get('/finance/transactions', [FinanceController::class, 'transactions']);
            Route::get('/finance/export', [FinanceController::class, 'exportCsv']);

            // CMS Update
            Route::put('/cms/landing', [CmsController::class, 'updateLanding']);
            Route::put('/cms/patient', [CmsController::class, 'updatePatientCms']);
        });
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
- `financeService.ts`: Mutasi kas masuk, filter bulan & tahun, dan ekspor CSV.
- `intakeService.ts`: Integrasi pre-test keluhan dan asesmen DASS-21.
- `reviewService.ts`: Manajemen testimoni dan moderasi bintang 1-5.
- `cmsService.ts`: Pengelolaan teks konten landing page, panduan pasien, dan kop dinas resmi.

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

- [x] Struktur folder `src/services/api/` dibuat lengkap dan bebas error TypeScript.
- [x] Endpoint RESTful, payload, dan query parameter sesuai konvensi standar Laravel.
- [x] Skema database relasional telah disesuaikan dengan kebutuhan praktisi tunggal (tanpa split komisi dan tanpa SOAP medis).
- [x] Fitur Export CSV dan Cetak siap beroperasi baik di frontend langsung (client-side) maupun melalui stream response dari Laravel.

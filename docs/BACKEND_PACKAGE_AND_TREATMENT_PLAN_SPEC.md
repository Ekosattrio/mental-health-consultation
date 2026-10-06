# Spesifikasi Backend: Manajemen Paket & Konsultasi Berkelanjutan (Rawat Jalan)

Dokumen ini disusun sebagai panduan teknis bagi **Backend Developer** untuk mengimplementasikan fitur **Manajemen Paket Layanan Dinamis** dan **Konsultasi Berkelanjutan (*Continuous Care* / Rawat Jalan)** pada backend **Laravel 12++**.

---

## 1. Latar Belakang & Kebutuhan Klien

1. **Paket Layanan Dinamis**:
   - Klinik memiliki 15 paket resmi yang terbagi ke dalam 3 kategori: **Konseling**, **Asesmen**, dan **Psikoterapi**.
   - Paket harus dinamis di database (bisa ditambah, diubah tarif/deskripsi/fasilitas, dan diaktifkan/dinonaktifkan oleh psikolog).
   - Pada Landing Page publik, nominal harga disembunyikan untuk pengunjung yang belum sign in.
   - Pasien wajib melengkapi data diri (`is_profile_complete`) sebelum diizinkan memilih paket konsultasi.

2. **Konsultasi Berkelanjutan (*Continuous Care* / Rawat Jalan)**:
   - Layanan psikologi sering membutuhkan penanganan berkelanjutan bertahap (misal: 4 sesi terapi berkala, rawat jalan mingguan/dua mingguan).
   - Pasien tidak hanya memesan satu sesi tunggal, melainkan dapat berada dalam satu program rencana perawatan (*treatment plan*).
   - Sistem wajib mencatat nomor sesi ke-N (contoh: Sesi 1 dari 4, Sesi 2 dari 4) dan melacak progres terapi pasien hingga tuntas.

3. **Skema Pembayaran DP Flat Administrasi**:
   - Setiap pemesanan jadwal reservasi wajib membayar **DP Flat Rp 100.000** sebagai biaya administrasi penguncian slot.
   - Pasien wajib mengunggah bukti transfer dan mencantumkan nama pemilik rekening pengirim (`transfer_sender_name`).
   - Sisa biaya paket (`harga paket - Rp 100.000`) dilunasi saat pasien hadir di klinik.

---

## 2. Skema Database Relasional (Laravel Migrations)

### 2.1. Tabel `consultation_packages`
Menyimpan master data paket konsultasi dan asesmen.

```php
Schema::create('consultation_packages', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name', 150);
    $table->enum('category', ['COUNSELING', 'ASSESSMENT', 'PSYCHOTHERAPY']);
    $table->enum('session_type', ['SINGLE_SESSION', 'CONTINUOUS_CARE'])->default('SINGLE_SESSION');
    $table->integer('duration_minutes')->default(60); // 60, 75, 90, 180 menit
    $table->decimal('price', 12, 2); // Nominal harga paket
    $table->text('description');
    $table->json('benefits')->nullable(); // Array string fasilitas
    $table->text('continuous_care_note')->nullable(); // Catatan panduan rawat jalan berkelanjutan
    $table->integer('total_sessions')->default(1); // Jumlah pertemuan dalam paket (misal: 4 sesi)
    $table->string('frequency', 50)->nullable(); // Misal: "1x seminggu", "2 minggu sekali"
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### 2.2. Tabel `treatment_plans` (Rencana Rawat Jalan Berkelanjutan)
Menghubungkan pasien, psikolog, dan paket rawat jalan berkelanjutan untuk melacak progres multi-sesi.

```php
Schema::create('treatment_plans', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('psychologist_id')->constrained('users')->onDelete('cascade');
    $table->foreignUuid('package_id')->constrained('consultation_packages')->onDelete('restrict');
    $table->string('title', 150); // Misal: "Program Terapi Kognitif Perilaku (CBT) 4 Sesi"
    $table->enum('status', ['ACTIVE', 'COMPLETED', 'DISCONTINUED'])->default('ACTIVE');
    $table->integer('total_planned_sessions')->default(4);
    $table->integer('completed_sessions')->default(0);
    $table->text('clinical_objective')->nullable(); // Target tujuan terapi
    $table->text('recommendations')->nullable(); // Catatan rekomendasi dokter
    $table->date('started_at')->nullable();
    $table->date('completed_at')->nullable();
    $table->timestamps();
});
```

### 2.3. Modifikasi Tabel `appointments`
Menghubungkan reservasi ke paket dan treatment plan.

```php
Schema::table('appointments', function (Blueprint $table) {
    $table->foreignUuid('treatment_plan_id')->nullable()->constrained('treatment_plans')->nullOnDelete();
    $table->integer('continuous_session_number')->nullable(); // Menandai sesi ke-N (misal: 1, 2, 3, 4)
    $table->decimal('dp_amount', 12, 2)->default(100000.00); // DP Flat Rp 100.000
    $table->decimal('remaining_amount', 12, 2)->default(0.00); // Sisa pelunasan di klinik
    $table->string('transfer_sender_name', 150)->nullable(); // Nama rekening pengirim transfer
});
```

### 2.4. Constraint dan Index Wajib

- Tambahkan unique constraint `(treatment_plan_id, continuous_session_number)` untuk mencegah sesi yang sama dibuat dobel.
- Tambahkan index `(psychologist_id, date, start_time, end_time, status)` agar pengecekan bentrok jadwal tetap cepat saat data appointment sudah besar.
- Tambahkan index `(patient_id, status)` pada `treatment_plans` untuk mempercepat tampilan progres pasien.
- Pembuatan booking dan sesi lanjutan wajib memakai database transaction. Saat mengecek slot, gunakan row lock / transactional guard agar dua request bersamaan tidak bisa mengambil rentang jam yang sama.

---

## 3. Prinsip Best Practice Multi-Sesi

1. Jangan membuat semua appointment sekaligus saat pasien mengambil paket 10 sesi.
   - Yang dibuat di awal adalah `treatment_plan` dan appointment sesi pertama.
   - Sesi 2, 3, dan seterusnya dibuat ketika psikolog menjadwalkan pertemuan lanjutan.
2. `treatment_plans` adalah sumber progres program.
   - Simpan `total_planned_sessions`, `completed_sessions`, dan `next_session_number`.
   - Appointment hanya merepresentasikan satu pertemuan aktual.
3. Pembayaran paket tidak boleh dihitung berulang di setiap sesi lanjutan.
   - Invoice/pembayaran melekat ke treatment plan atau appointment pertama.
   - Appointment sesi lanjutan berfokus pada jadwal, status hadir/selesai, dan catatan klinis.
4. Psikolog menutup sesi secara manual.
   - Endpoint complete hanya boleh diakses psikolog/pengelola.
   - Setelah sesi `COMPLETED`, backend memperbarui `completed_sessions` pada treatment plan.
   - Jika `completed_sessions === total_planned_sessions`, status treatment plan menjadi `COMPLETED`.
5. Jadwal sesi berikutnya harus idempotent.
   - Gunakan header seperti `Idempotency-Key` pada endpoint jadwalkan sesi lanjutan.
   - Jika user double click, backend mengembalikan hasil request pertama, bukan membuat appointment dobel.

---

## 4. Spesifikasi RESTful API Endpoints

### 4.1. Master Data Paket (`PackageController`)

#### A. Ambil Daftar Paket (Publik / Pasien)
- **Method**: `GET /api/v1/packages`
- **Query Params**:
  - `category`: `COUNSELING` | `ASSESSMENT` | `PSYCHOTHERAPY` (opsional)
  - `session_type`: `SINGLE_SESSION` | `CONTINUOUS_CARE` (opsional)
  - `is_active`: `true` | `false` (default: `true` untuk publik)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "pkg-counseling-offline",
      "name": "Konsultasi Offline",
      "category": "COUNSELING",
      "session_type": "SINGLE_SESSION",
      "duration_minutes": 60,
      "price": 900000,
      "description": "Sesi tatap muka langsung di klinik privat.",
      "benefits": ["Ruang privat kedap suara", "Informed consent", "Free teh & air mineral"],
      "continuous_care_note": null,
      "total_sessions": 1,
      "is_active": true
    },
    {
      "id": "pkg-therapy-intensive-4",
      "name": "Paket Psikoterapi Intensif 4 Sesi",
      "category": "PSYCHOTHERAPY",
      "session_type": "CONTINUOUS_CARE",
      "duration_minutes": 60,
      "price": 2000000,
      "description": "Program terapi intensif berkelanjutan 4 pertemuan terstruktur.",
      "benefits": ["4 Sesi tatap muka", "Monitoring progres berkala", "Lembar kerja latihan di rumah"],
      "continuous_care_note": "Rekomendasi rawat jalan berkala 1x seminggu untuk evaluasi adaptasi kognitif.",
      "total_sessions": 4,
      "frequency": "1x seminggu",
      "is_active": true
    }
  ]
}
```

#### B. Tambah Paket Baru (Khusus Psikolog/Pengelola)
- **Method**: `POST /api/v1/packages`
- **Headers**: `Authorization: Bearer <token_psikolog>`
- **Payload**:
```json
{
  "name": "Konseling Pemulihan Burnout Karier",
  "category": "COUNSELING",
  "session_type": "CONTINUOUS_CARE",
  "duration_minutes": 60,
  "price": 1600000,
  "description": "Program konseling rawat jalan pemulihan kelelahan mental kerja 3 sesi.",
  "benefits": ["3 sesi tatap muka", "Asesmen burnout berkala", "Rencana aksi kerja sehat"],
  "continuous_care_note": "Sesi dijadwalkan setiap 2 minggu sekali.",
  "total_sessions": 3,
  "frequency": "2 minggu sekali",
  "is_active": true
}
```

#### C. Edit & Toggle Status Paket
- **Method**: `PUT /api/v1/packages/{id}`
- **Method**: `PATCH /api/v1/packages/{id}/toggle-status`

---

### 4.2. Program Rawat Jalan Berkelanjutan (`TreatmentPlanController`)

#### A. Buat Rencana Rawat Jalan Pasien
- **Method**: `POST /api/v1/treatment-plans`
- **Headers**: `Authorization: Bearer <token_psikolog>`
- **Payload**:
```json
{
  "patient_id": 15,
  "package_id": "pkg-therapy-intensive-4",
  "title": "Program Terapi Kognitif Perilaku (CBT) Depresi Sedang",
  "clinical_objective": "Mereduksi skor depresi DASS-21 dari 22 ke bawah 10 dan mengatasi distorsi kognitif.",
  "total_planned_sessions": 4
}
```

#### B. Jadwalkan Sesi Berikutnya pada Program Rawat Jalan
- **Method**: `POST /api/v1/treatment-plans/{id}/sessions`
- **Headers**: `Authorization: Bearer <token_psikolog>`, `Idempotency-Key: <uuid_request>`
- **Payload**:
```json
{
  "date": "2026-10-18",
  "start_time": "14:00:00",
  "end_time": "15:00:00"
}
```

---

## 5. Validasi Bisnis Utama di Backend (FormRequest)

1. **Validasi Profil Lengkap**:
   - Sebelum membuat janji temu (`AppointmentStoreRequest`), pastikan `Auth::user()->is_profile_complete === true`. Jika `false`, tolak dengan HTTP 422: `"Lengkapi data diri pasien sebelum memilih paket konsultasi."`.
2. **Validasi DP Flat Rp 100.000**:
   - `dp_amount` wajib bernilai `100000.00`.
   - `transfer_sender_name` wajib diisi (`required|string|max:150`).
   - `payment_proof` wajib berkas gambar/PDF (`required|file|mimes:jpeg,png,jpg,pdf|max:5120`).
3. **Validasi Anti Double Booking & Jadwal H+1**:
   - Tanggal booking wajib `date|after:today`.
   - Tanggal booking tidak boleh jatuh pada hari libur psikolog (`psychologist_holidays`).
   - Slot waktu tidak boleh bertabrakan dengan appointment lain yang berstatus `CONFIRMED` atau `PENDING` aktif.
4. **Validasi Sesi Lanjutan**:
   - `treatment_plan.status` wajib `ACTIVE`.
   - `next_session_number` tidak boleh melebihi `total_planned_sessions`.
   - Hanya psikolog/pengelola yang boleh menjadwalkan sesi lanjutan dan menandai sesi selesai.
   - Endpoint wajib menolak request jika ada appointment aktif yang overlap pada psikolog, tanggal, dan rentang waktu yang sama.

---

## 6. Hubungan dengan Frontend React

Frontend telah dilengkapi dengan service layer yang siap mengonsumsi endpoint ini:
- [`packageService.ts`](file:///c:/laragon/www/psikolog/src/services/api/packageService.ts) $\rightarrow$ terhubung ke `/api/v1/packages`.
- [`appointmentService.ts`](file:///c:/laragon/www/psikolog/src/services/api/appointmentService.ts) $\rightarrow$ terhubung ke `/api/v1/appointments` dengan payload `dp_amount`, `transfer_sender_name`, dan `continuous_session_number`.
- [`PackagesTab.tsx`](file:///c:/laragon/www/psikolog/src/components/psychologist/tabs/PackagesTab.tsx) $\rightarrow$ antarmuka psikolog untuk mengelola paket secara dinamis.

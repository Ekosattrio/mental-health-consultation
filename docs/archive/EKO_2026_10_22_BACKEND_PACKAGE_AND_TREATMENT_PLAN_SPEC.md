# Arsip Eko Sebelum Integrasi - BACKEND_PACKAGE_AND_TREATMENT_PLAN_SPEC.md

Histori prototype, bukan aturan aktif. Gunakan [keputusan final](../KEPUTUSAN_FINAL_2026_10_22.md), [kontrak web](../WEB_CONTRACT.md) dan dokumen utama di docs/.

# Spesifikasi Backend: Manajemen Paket & Konsultasi Berkelanjutan (Rawat Jalan)

Dokumen ini disusun sebagai panduan teknis bagi **Backend Developer** untuk mengimplementasikan fitur **Manajemen Paket Layanan Dinamis** dan **Konsultasi Berkelanjutan (*Continuous Care* / Rawat Jalan)** pada backend **Laravel 12+**.

---

## 1. Latar Belakang & Kebutuhan Klien

### Konfirmasi Manual 22 Oktober 2026

- Pasien terlambat/tidak hadir dikonfirmasi manual oleh psikolog. Tidak ada auto-cancel atau pemotongan jatah otomatis.
- Psikolog penanggung jawab dapat memilih jadwal pengganti H+1 pada sesi yang sama, termasuk `NO_SHOW -> CONFIRMED`, dengan validasi status/rencana, pembayaran awal terverifikasi, durasi, kuota, serta overlap dalam transaction. Tolak jika sudah ada sesi lanjutan/aktif lain di rencana.
- Pertahankan ID appointment, nomor/jatah sesi, DP, cicilan, saldo, bukti, dan audit kas. Tidak ada DP kedua atau payment baru karena reschedule. Simpan histori no-show dan reschedule beserta hasil konfirmasi/pelaku/waktu/alasan.
- Admin/pasien tidak boleh memulihkan `NO_SHOW` sendiri. Cancel/discontinue tetap manual oleh psikolog sesudah lunas. Rencana yang selesai/dihentikan tidak dapat dibuka kembali lewat reschedule.

### Penyelarasan Audit 21 Oktober 2026

- Harga/quote aktif harus divalidasi versi dan expected total; katalog FE memiliki pencarian/kategori/urutan/pagination dan menyinkronkan perubahan tarif.
- Hold server masih kontrak, sedangkan prototype sudah memiliki hold lokal sebelum rekening, pemulihan setelah refresh, dan pencocokan bukti setelah expiry/quote berubah. Default lokal 15 menit bukan TTL produksi final. Endpoint rekonsiliasi dan booking pengganti memakai bukti yang sama; lihat [[API]].
- Penerimaan awal walk-in menyimpan nominal aktual DP/FULL, bukan menyimpulkan kas dari pilihan status lunas. Admin tetap write-only; ledger hanya diakui sebagai kas setelah verifikasi.
- Ledger membedakan received_at (periode uang diterima), recorded_at, dan verified_at. Laporan merinci DP dan setiap pembayaran lanjutan; sesi baru tidak menduplikasi ledger awal.
- Detail pasien/psikolog menghitung terbayar dari total dan sisa dari appointment induk/plan. Histori status/reschedule appointment baru berdiri sendiri.
- Update jadwal ditolak bila libur/jam/kuota baru berbenturan dengan appointment/hold aktif. Seluruh jalur mutasi harus memakai transaksi dan protokol lock kapasitas yang sama.

1. **Paket Layanan Dinamis**:
   - Klinik memiliki katalog paket dinamis yang terbagi ke dalam 3 kategori: **Konseling**, **Asesmen**, dan **Psikoterapi**. Konseling telelayanan juga aktif; website hanya mengurus booking, sedangkan pertemuan memakai pihak ketiga seperti Google Meet sesuai pilihan psikolog.
   - Paket harus dinamis di database (bisa ditambah, diubah tarif/deskripsi/fasilitas, dan diaktifkan/dinonaktifkan oleh psikolog).
   - Pada Landing Page publik, nominal harga disembunyikan untuk pengunjung yang belum sign in.
   - Pasien wajib melengkapi data diri (`is_profile_complete`) sebelum diizinkan memilih paket konsultasi.

2. **Konsultasi Berkelanjutan (*Continuous Care* / Rawat Jalan)**:
   - Layanan psikologi sering membutuhkan penanganan berkelanjutan bertahap (misal: 4 sesi terapi berkala, rawat jalan mingguan/dua mingguan).
   - Pasien tidak hanya memesan satu sesi tunggal, melainkan dapat berada dalam satu program rencana perawatan (*treatment plan*).
   - Sistem wajib mencatat nomor sesi ke-N (contoh: Sesi 1 dari 4, Sesi 2 dari 4) dan melacak progres terapi pasien hingga tuntas.

3. **Skema Pembayaran DP per Paket**:
   - DP flat Rp100.000 dihitung sekali per booking/rencana empat sesi dan mengurangi biaya pertemuan; booking ulang memiliki DP baru. Backend tidak menerima nominal DP dari payload pasien/admin.
   - Pasien wajib mengunggah bukti transfer dan mencantumkan nama pemilik rekening pengirim (`transfer_sender_name`).
   - Sisa proyeksi empat sesi (`tarif per sesi setelah diskon x 4 - DP`) dapat dibayar sekaligus setelah sesi pertama atau bertahap menurut kesepakatan pasien dan psikolog. Admin hanya mencatat uang masuk, tanpa melihat harga atau saldo.

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
    $table->decimal('price', 12, 2); // Psikoterapi: tarif per sesi; layanan lain: tarif paket
    $table->enum('discount_type', ['NONE', 'PERCENT', 'FIXED'])->default('NONE');
    $table->decimal('discount_value', 12, 2)->default(0);
    $table->string('discount_label', 150)->nullable();
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
    $table->decimal('dp_amount', 12, 2)->default(0.00); // Snapshot DP flat Rp100.000 dari server
    $table->decimal('remaining_amount', 12, 2)->default(0.00); // Sisa pelunasan di klinik
    $table->string('transfer_sender_name', 150)->nullable(); // Nama rekening pengirim transfer
    $table->decimal('final_payment_amount', 12, 2)->nullable(); // Pelunasan aktual, tersembunyi dari response admin
    $table->enum('final_payment_method', ['CASH', 'BANK_TRANSFER', 'QRIS', 'EDC', 'OTHER'])->nullable();
    $table->string('final_payment_channel_detail', 150)->nullable();
    $table->timestamp('final_payment_recorded_at')->nullable();
    $table->foreignId('final_payment_recorded_by')->nullable()->constrained('users')->nullOnDelete();
});
```

### 2.4. Constraint dan Index Wajib

- Tambahkan unique constraint `(treatment_plan_id, continuous_session_number)` untuk mencegah sesi yang sama dibuat dobel.
- Tambahkan index `(psychologist_id, date, start_time, end_time, status)` agar pengecekan bentrok jadwal tetap cepat saat data appointment sudah besar.
- Tambahkan index `(patient_id, status)` pada `treatment_plans` untuk mempercepat tampilan progres pasien.
- Pembuatan booking dan sesi lanjutan wajib memakai database transaction. Saat mengecek slot, gunakan row lock / transactional guard agar dua request bersamaan tidak bisa mengambil rentang jam yang sama.

### 2.5. Tarif Per Sesi dan Pembayaran Bertahap

- Snapshot tarif per sesi psikoterapi disimpan pada booking/rencana baru. Proyeksi rencana awal = tarif per sesi setelah diskon dikali empat; proyeksi ini bukan kewajiban bayar di muka.
- `payment_transactions`: `id`, `treatment_plan_id` atau `appointment_id`, `kind` (`DP`/`INSTALLMENT`), `amount`, `method`, `channel_detail`, `recorded_by`, `verified_at`, `created_at`, dan idempotency key. Setiap pembayaran adalah satu record; jangan menimpa pembayaran sebelumnya.
- Saldo rencana awal = proyeksi empat sesi - seluruh pembayaran terverifikasi. DP Rp100.000 adalah transaksi pertama dan mengurangi saldo rencana tersebut.
- Setelah sesi keempat selesai, booking ulang membuat treatment plan, invoice, DP, dan ledger baru. Plan lama tetap `COMPLETED`; histori pembayaran tidak dipindahkan.
- Harga, saldo, dan transaksi tidak boleh dikirim pada resource admin. Admin hanya mengirim nominal pembayaran aktual, metode, dan menerima status tanpa nominal.

---

## 3. Prinsip Best Practice Multi-Sesi

1. Jangan membuat semua appointment sekaligus saat pasien mengambil paket 10 sesi.
   - Yang dibuat di awal adalah `treatment_plan` dan appointment sesi pertama.
   - Sesi 2, 3, dan seterusnya dibuat ketika psikolog menjadwalkan pertemuan lanjutan.
2. `treatment_plans` adalah sumber progres program.
   - Simpan `total_planned_sessions`, `completed_sessions`, dan `next_session_number`.
   - Appointment hanya merepresentasikan satu pertemuan aktual.
3. Pembayaran paket tidak boleh dihitung berulang di setiap sesi lanjutan.
   - Invoice/pembayaran melekat ke treatment plan atau appointment pertama; setelah empat sesi selesai, kelanjutan terapi memakai booking paket baru dengan ledger sendiri.
   - Appointment sesi lanjutan berfokus pada jadwal dan status hadir/selesai.
   - Laporan owner menghitung uang masuk paket dari DP terverifikasi ditambah pelunasan aktual, tanpa komponen biaya operasional atau laba bersih.
   - Admin memasukkan nominal pelunasan tanpa melihat harga paket maupun target sisa tagihan. Setelah submit, resource/serializer admin tidak boleh mengembalikan nominal tersebut.
4. Psikolog menutup sesi secara manual.
   - Endpoint complete hanya boleh diakses psikolog/pengelola.
   - Backend menolak complete sebelum tanggal dan jam selesai appointment terlewati.
   - Setelah sesi `COMPLETED`, backend memperbarui `completed_sessions` pada treatment plan.
   - Jika `completed_sessions === total_planned_sessions`, status treatment plan menjadi `COMPLETED`.
5. Jadwal sesi berikutnya harus idempotent.
   - Gunakan header seperti `Idempotency-Key` pada endpoint jadwalkan sesi lanjutan.
   - Jika user double click, backend mengembalikan hasil request pertama, bukan membuat appointment dobel.
   - Pembayaran awal harus `DP_PAID` atau `PAID`, sesi terakhir harus `COMPLETED`, tanggal minimal H+1, dan slot harus divalidasi ulang terhadap jam kerja, hari libur, kuota, durasi, serta overlap di dalam transaction.
6. Verifikasi pembayaran dan konfirmasi booking harus atomik.
   - Admin wajib memperoleh bukti dari storage privat melalui signed URL sementara sebelum konfirmasi.
   - Satu transaction mengubah `DP_PENDING_VERIFICATION` menjadi `DP_PAID`, mengubah appointment `PENDING` menjadi `CONFIRMED`, dan menulis audit admin.
   - Tidak boleh ada endpoint konfirmasi langsung yang melewati pemeriksaan pembayaran.

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
      "name": "Psikoterapi per Sesi (Minimal 4 Sesi)",
      "category": "PSYCHOTHERAPY",
      "session_type": "CONTINUOUS_CARE",
      "duration_minutes": 60,
      "price": 500000,
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
  "clinical_objective": "Mendukung tujuan konseling yang disepakati psikolog dan pasien.",
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

### 4.3. Pencatatan Pelunasan oleh Admin

- **Method**: `POST /api/v1/admin/appointments/{id}/final-payment`
- **Headers**: `Authorization: Bearer <token_admin>`
- **Payload**:
```json
{
  "amount": 150000,
  "method": "BANK_TRANSFER",
  "channel_detail": "BCA",
  "purpose": "CONSULTATION"
}
```
- Hanya appointment pertama pada plan dengan pembayaran awal terverifikasi dan saldo positif yang dapat menerima pembayaran berikutnya.
- Psikoterapi biasa menunggu sesi pertama selesai. `purpose=CANCELLATION_SETTLEMENT` mengizinkan pelunasan untuk penghentian sebelum sesi pertama; admin tetap tidak berhak cancel.
- Simpan tiap nominal sebagai transaksi baru. Status tetap `DP_PAID` bila saldo masih ada dan berubah menjadi `PAID` hanya saat saldo nol.
- Response admin hanya mengembalikan status keberhasilan, waktu pencatatan, dan identitas pencatat. Jangan mengembalikan `price`, `remaining_amount`, atau `final_payment_amount`.
- Status konsultasi tidak berubah otomatis menjadi `COMPLETED`; penyelesaian sesi tetap aksi psikolog.

### 4.4. Booking Ulang Psikoterapi

Keputusan 21 Oktober 2026: cancel/discontinue hanya psikolog setelah seluruh tagihan lunas. Backend mengunci ledger/rencana, memeriksa `PAID` dan saldo nol, lalu menandai rencana `DISCONTINUED`, membatalkan seluruh sisa appointment, melepas slot, serta menyimpan alasan/pelaku/waktu. Histori sesi completed dan pembayaran tetap disimpan. Tidak ada refund otomatis atau penambahan sesi pengganti setelah cancel.

- **Method**: `POST /api/v1/appointments` (alur booking standar, bukan endpoint penambahan sesi).
- **Role**: pasien; admin dapat membantu walk-in sesuai alur yang sudah ada.
- Rencana awal selalu minimal empat sesi. Setelah sesi keempat selesai dan psikolog menyarankan kelanjutan, pasien memilih jadwal booking baru minimal H+1. Backend memvalidasi slot dalam transaksi dan memberi kode booking, snapshot tarif per sesi, DP, serta ledger baru. Tidak boleh mengubah total sesi atau pembayaran plan lama.
- Nomor sesi klinis ke-5 dan seterusnya hanya ada di rekam medis eksternal. Website menomori booking baru dari 1/4. Admin tidak membuat sesi lanjutan dalam plan; psikolog menjadwalkan satu sesi berikutnya setiap kali melalui `/sessions` minimal H+1.

---

## 5. Validasi Bisnis Utama di Backend (FormRequest)

1. **Validasi Profil Lengkap**:
   - Sebelum membuat janji temu (`AppointmentStoreRequest`), pastikan `Auth::user()->is_profile_complete === true`. Jika `false`, tolak dengan HTTP 422: `"Lengkapi data diri pasien sebelum memilih paket konsultasi."`.
2. **Validasi DP Flat Sistem**:
   - `subtotal_amount`, `discount_amount`, dan `total_amount` wajib dihitung ulang server dari paket aktif dalam transaction.
   - `dp_amount` tidak dibaca dari paket atau request client. Server menetapkan Rp100.000, atau sebesar `total_amount` jika total akhir lebih kecil dari Rp100.000.
   - `transfer_sender_name` wajib diisi (`required|string|max:150`).
   - `payment_proof` wajib berkas gambar/PDF (`required|file|mimes:jpeg,png,jpg,pdf|max:5120`).
3. **Validasi Anti Double Booking & Jadwal H+1**:
   - Semua booking, termasuk endpoint walk-in admin, wajib memakai validasi `date|after:today` atau aturan ekuivalen minimal H+1.
   - Tanggal booking tidak boleh jatuh pada hari libur psikolog (`psychologist_holidays`).
   - Slot waktu tidak boleh bertabrakan dengan appointment lain yang berstatus `CONFIRMED` atau `PENDING` aktif.
4. **Validasi Sesi Lanjutan**:
   - `treatment_plan.status` wajib `ACTIVE`.
   - `next_session_number` tidak boleh melebihi `total_planned_sessions`.
   - Hanya psikolog/pengelola yang boleh menjadwalkan sesi lanjutan dan menandai sesi selesai.
   - Endpoint wajib menolak request jika ada appointment aktif yang overlap pada psikolog, tanggal, dan rentang waktu yang sama.
5. **Validasi Pelunasan Admin**:
   - `amount` wajib numerik dan lebih besar dari nol.
   - Appointment pertama wajib berstatus pembayaran `DP_PAID` dengan saldo positif. Pembayaran parsial berikutnya diperbolehkan.
   - Gunakan transaction dan idempotency key agar double submit tidak membuat dua transaksi pembayaran.
   - Policy/resource admin wajib menyembunyikan harga paket, target sisa tagihan, dan nominal pelunasan setelah pencatatan.

---

## 6. Hubungan dengan Frontend React

Frontend telah dilengkapi dengan service layer yang siap mengonsumsi endpoint ini:
- [`packageService.ts`](../../resources/js/legacy/api/packageService.ts) $\rightarrow$ terhubung ke `/api/v1/packages`.
- [`appointmentService.ts`](../../resources/js/legacy/api/appointmentService.ts) $\rightarrow$ terhubung ke `/api/v1/appointments`; client mengirim data pembayaran administratif, sedangkan `dp_amount` selalu dihitung server.
- [`PackagesTab.tsx`](../../resources/js/components/psychologist/tabs/PackagesTab.tsx) $\rightarrow$ antarmuka psikolog untuk mengelola paket secara dinamis.

# Database

## Status Saat Ini

Belum ada database nyata. Aplikasi menggunakan mock data dan LocalStorage.

Database produksi telah diputuskan menggunakan **MySQL 8+** melalui migration dan Eloquent Laravel 12+.

## Storage Lokal

State disimpan di browser menggunakan key dengan prefix:

```text
jiwasehat_v3_
```

Contoh data yang disimpan:

- users (termasuk status kelengkapan data diri `isProfileComplete`)
- psychologists (termasuk `avatarUrl` foto wajah)
- packages (termasuk `category`, `sessionType`, `continuousCareNote`, `discountType`, `discountValue`, dan `discountLabel`)
- schedules & scheduleOverrides
- appointments (termasuk `transferSenderName`, `paymentReference`, `dpAmount`, `remainingAmount`, `finalPaymentAmount`, `finalPaymentMethod`, `finalPaymentRecordedAt`, `continuousSessionNumber`)
- preTests (keluhan dan riwayat medis)
- invoices
- consents
- notificationLogs
- reviews
- payments & paymentProofs
- landingCms
- patientCms
- psychologistCms (termasuk konfigurasi kop surat dinas resmi)

## Rancangan Entity Target

Entity utama yang perlu disiapkan ketika backend dibuat:

- `users` (id, name, email, password, google_id, role, status, phone, birth_date, gender, occupation, city, emergency_contact, is_profile_complete)
- `psychologist_profiles` (id, user_id, title, str_number, sip_number, avatar_url, experience_years, bio, specialties, therapy_approaches, practice_policy)
- `consultation_packages` (id, name, category, session_type, duration_minutes, price, discount_type, discount_value, discount_label, description, benefits, is_active, continuous_care_note, total_sessions, frequency)
- `treatment_plans` (id, patient_id, psychologist_id, package_id, status, total_planned_sessions, completed_sessions, next_session_number, clinical_objective, started_at, completed_at)
- `schedule_slots` & `schedule_overrides` (id, psychologist_id, day_of_week, start_time, end_time, max_patients, custom_date, is_day_off)
- `appointments` (id, booking_code, patient_id, psychologist_id, package_id, treatment_plan_id, date, start_time, end_time, session_type, status, payment_status, subtotal_amount, discount_label, discount_amount, total_amount, dp_amount, remaining_amount, payment_method, payment_channel_detail, transfer_sender_name, payment_reference, payment_proof_url, final_payment_amount, final_payment_method, final_payment_channel_detail, final_payment_reference, final_payment_recorded_at, final_payment_recorded_by, continuous_session_number, continuous_session_total)
- `pre_tests` (id, patient_id, appointment_id, primary_complaint, stress_level, sleep_quality, note)
- `payments` (id, appointment_id, amount, type, method, channel_detail, transfer_sender_name, payment_reference, proof_file_path, status, verified_by, verified_at)
- `invoices` (id, appointment_id, invoice_number, total_amount, dp_amount, remaining_amount, payment_method, payment_reference, issued_at)
- `consents` (id, patient_id, appointment_id, consent_type, accepted_at, ip_address, user_agent)
- `notifications` & `notification_logs` (id, appointment_id, recipient_user_id, channel, template_key, payload_json, status, sent_at, failed_reason)
- `reviews` (id, appointment_id, patient_id, rating, comment, is_anonymous, is_approved)
- `cms_configs` (id, section, content_json)
- `audit_logs` (id, user_id, action, resource, ip_address, timestamp)

## Aturan Data Penting

- Booking minimal H+1 dari tanggal pembuatan booking.
- Tanggal baru reschedule minimal H+1 dari hari pengajuan.
- Hari libur psikolog harus memblokir pembuatan booking secara dinamis.
- Batas pertemuan harian psikolog harus dihitung dari booking aktif dan override kuota khusus.
- Slot booking perlu constraint unik agar tidak bisa dipakai dua booking aktif (anti double booking).
- **Payment**: Wajib mendukung snapshot DP sesuai konfigurasi paket, metode/channel bayar, nama pengirim transfer (`transfer_sender_name`), nomor referensi (`payment_reference`), berkas bukti transfer, dan pencatatan sisa pelunasan di klinik.
- API admin untuk pelunasan menerima nominal aktual sebagai input satu arah. Nominal tersimpan untuk laporan owner/psikolog, tetapi serializer/resource admin tidak boleh mengembalikannya setelah transaksi dibuat.
- Potongan harga hanya diatur oleh psikolog/pengelola pada `consultation_packages`; admin tidak mengatur atau melihat nominal harga/potongan pada dashboard admin.
- Bukti pembayaran perlu menyimpan file path, status verifikasi, verifier, dan waktu verifikasi.
- Invoice/kwitansi perlu disimpan terstruktur agar dapat dicetak ulang dan diaudit.
- Profil data diri pasien (`is_profile_complete`) wajib lengkap sebelum dapat membuat reservasi paket.
- Consent informed consent/privacy wajib tersimpan sebelum booking final.
- Paket konsultasi mendukung klasifikasi sesi tunggal vs rawat jalan berkelanjutan (*continuous care*).
- Paket multi-sesi menggunakan tabel `treatment_plans` sebagai induk rencana terapi; appointment dibuat bertahap per pertemuan, bukan seluruh sesi dibuat sekaligus pada saat pembelian.
- `appointments.treatment_plan_id` nullable untuk sesi tunggal dan wajib terisi untuk paket berkelanjutan.
- Gunakan unique constraint `(treatment_plan_id, continuous_session_number)` agar sesi ke-N tidak dibuat dobel.
- Gunakan index `(psychologist_id, date, start_time, end_time, status)` untuk validasi jadwal dan performa kalender.
- Gunakan transaction + row lock saat membuat booking/sesi lanjutan agar slot tidak bentrok saat banyak user mengirim request bersamaan.
- Notifikasi WhatsApp/email perlu memiliki log pengiriman, status retry, dan payload ringkas yang tidak membuka data klinis berlebihan.

## Catatan Keamanan Data

- Data pre-test, consent, pembayaran, notifikasi, export klinis, dan rekam klinis adalah data sensitif.
- Backend wajib menerapkan authorization per role dan per kepemilikan data (Laravel Gates / Policies).
- Perubahan data klinis dan verifikasi keuangan wajib memiliki audit log.

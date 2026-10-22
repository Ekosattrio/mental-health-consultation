# Database

## Status Saat Ini

Belum ada database nyata. Aplikasi menggunakan mock data dan LocalStorage.

Database produksi telah diputuskan menggunakan **MySQL 8+** melalui migration dan Eloquent Laravel 12+.

## Addendum 22 Oktober 2026 - Versi Jadwal dan Snapshot CMS

- Tambahkan `appointments.schedule_version` integer non-negatif default 0. Backfill histori legacy sesuai kebijakan migration. Resource FE mengembalikan `scheduleVersion`; request reschedule mengirim `expected_version`.
- Transaction reschedule wajib memeriksa versi/ownership/status terbaru dan slot di bawah lock; mismatch menghasilkan 409 tanpa perubahan. Update jadwal, increment versi, dan insert histori berada dalam transaction yang sama. Versi saja tidak menggantikan lock kapasitas interval.
- `slot_holds` menyimpan snapshot penerima rekening (`payment_channel_detail`, `account_holder`) di samping quote/expiry. Config CMS rekening yang diubah hanya memengaruhi hold baru. Appointment menyimpan lokasi praktik saat dibuat, bukan mengikuti alamat CMS dinamis.
- CMS memiliki konfigurasi publik dan field operasional owner. Resource publik tidak mengekspor rekening/QRIS kasir; akses konfigurasi lengkap, penulisan, dan audit perubahan dibatasi Policy. Profil akun hanya menerima allowlist, tidak menerima role/email SSO dari form biasa.
- Prototype memakai `scheduleVersion`, snapshot bank pada hold, dan persist-before-state CMS/profil di LocalStorage. Ini belum tabel database atau audit permanen.

Keputusan 22 Oktober 2026: reschedule sesudah konfirmasi keterlambatan/no-show memperbarui appointment yang sama. Jangan membuat row sesi atau ledger DP baru; pertahankan nomor sesi, treatment plan, seluruh payment record, dan tanggal kas. Tambahkan event status `NO_SHOW -> CONFIRMED` serta histori jadwal/pelaku/alasan dalam transaction yang sama. Hanya psikolog penanggung jawab yang boleh memulihkan no-show; pembatalan tidak otomatis.

## Storage Lokal

State disimpan di browser menggunakan key dengan prefix:

```text
jiwasehat_v3_
```

Contoh data yang disimpan:

- users (termasuk status kelengkapan data diri `isProfileComplete`)
- psychologists (termasuk `avatarUrl` foto wajah)
- packages (termasuk `category`, `type`, `isContinuousCare`, `sessionCount`, dan field diskon)
- schedules; aturan mingguan/override disimpan melalui helper scheduleConfig
- appointments (snapshot tarif, `preTestId`, `preTestSnapshot`, `consent`, `rescheduleHistory`, `statusHistory`, dan ledger `finalPaymentRecords` termasuk tujuan pembayaran)
- intakeForms (draft atau form terakhir per pasien; histori per booking tersimpan pada snapshot appointment)
- reviews
- landingCms
- patientCms
- psychologistCms (termasuk konfigurasi kop surat dinas resmi)

Belum ada key terpisah untuk invoices, consents, payments, paymentProofs, atau notificationLogs. Invoice dirender dari appointment; bukti/consent/pembayaran masih melekat pada appointment prototype.

## Rancangan Entity Target

Entity utama yang perlu disiapkan ketika backend dibuat:

- `users` (id, name, email, password, google_id, role, status, phone, birth_date, gender, occupation, city, emergency_contact, is_profile_complete)
- `psychologist_profiles` (id, user_id, title, str_number, sip_number, avatar_url, experience_years, bio, specialties, therapy_approaches, practice_policy)
- `consultation_packages` (id, name, category, delivery_mode, session_type, duration_minutes, price, discount_type, discount_value, discount_label, description, benefits, is_active, continuous_care_note, total_sessions, frequency)
- Untuk kategori psikoterapi, `price` dan diskon nominal adalah tarif **per sesi**; `total_sessions` awal wajib 4. Proyeksi saldo rencana dihitung dari empat sesi setelah diskon, sementara booking terapi lanjutan membuat plan dan ledger baru tanpa amendment plan lama.
- `treatment_plans` (id, patient_id, psychologist_id, package_id, status, total_planned_sessions, completed_sessions, next_session_number, clinical_objective, started_at, completed_at)
- `schedule_slots` & `schedule_overrides` (id, psychologist_id, day_of_week, start_time, end_time, max_patients, custom_date, is_day_off)
- `appointments` (id, booking_code, patient_id, psychologist_id, package_id, treatment_plan_id, date, start_time, end_time, session_type, status, payment_status, subtotal_amount, discount_label, discount_amount, total_amount, dp_amount, remaining_amount, payment_method, payment_channel_detail, transfer_sender_name, payment_proof_url, payment_proof_name, payment_proof_mime_type, payment_verified_at, payment_verified_by, payment_verification_note, final_payment_amount, final_payment_method, final_payment_channel_detail, final_payment_recorded_at, final_payment_recorded_by, continuous_session_number, continuous_session_total)
- `pre_tests` (id, patient_id, appointment_id nullable selama draft, form_version, primary_complaint, stress_level, sleep_quality, answers_json, completed_at); booking mengikat draft ke appointment secara atomik dan form terikat tidak boleh diedit
- `payments` (id, appointment_id, amount, type, method, channel_detail, transfer_sender_name, proof_file_path, status, verified_by, verified_at)
- `invoices` (id, appointment_id, invoice_number, total_amount, dp_amount, remaining_amount, payment_method, issued_at)
- `consents` (id, patient_id, appointment_id, document_version, privacy_version, accepted_at, ip_address, user_agent)
- `appointment_reschedules` (appointment_id, from_date/time, to_date/time, actor_id, actor_role, reason, created_at)
- `appointment_status_events` (appointment_id, from_status, to_status, actor_id, reason, created_at)
- `notifications` & `notification_logs` (id, appointment_id, recipient_user_id, channel, template_key, payload_json, status, sent_at, failed_reason)
- `reviews` (id, appointment_id, patient_id, rating, comment, is_anonymous, is_approved)
- `cms_configs` (id, section, content_json)
- `audit_logs` (id, user_id, action, resource, ip_address, timestamp)

## Aturan Data Penting

- Penyimpanan workflow prototype kini satu envelope pada `jiwasehat_v3_appointments`: `appointments`, `holds`, `walkInPatients`, `reconciliations`. Array appointment lama dibaca dan di-upgrade in-place saat commit berhasil. Key eksperimental `jiwasehat_v3_workflow_v1` tetap dipakai jika sudah ada. Gunakan helper, bukan `JSON.parse` sebagai array langsung; reload tab versi lama setelah upgrade.
- `BookingHold` prototype memuat pasien, layanan, psikolog, tanggal/jam, snapshot total, expiry, status, dan appointmentId setelah konversi. `HELD` yang belum expired ikut kuota/overlap; `RECONCILIATION` bukan reservasi kapasitas.
- Kasus pencocokan menyimpan bukti serta identitas tanpa mengakui uang masuk. Setelah booking pengganti dibuat, kasus `BOOKED` menyimpan appointmentId; data URL bukti dipindah ke appointment agar tidak disimpan dua kali. Admin tetap tidak menerima nominal tersimpan.
- Atomicity lokal berarti satu `setItem` snapshot sebelum state/toast. Produksi harus memecah entity ke tabel relasional dalam transaction DB, bukan menyimpan envelope JSON LocalStorage ke MySQL tanpa Policy/relasi/audit.

- Prototype menyimpan `initialPaymentRecord` (id, amount, kind DP/FULL, method/channel, receivedAt, recordedByName, verifiedAt) dan `finalPaymentRecords[].receivedAt` pada appointment pembayaran pertama. Sesi berikutnya tidak menduplikasi record awal.
- Target `payments` perlu `received_at` untuk tanggal kas diterima, `recorded_at` untuk waktu input server, verifier, dan idempotency key. Jangan memakai tanggal appointment sebagai periode kas. Pisahkan payment pending dari penerimaan terverifikasi.
- `CashInReportRow` adalah proyeksi read-only per event untuk laporan, bukan appointment baru atau tabel transaksi duplikat. Field: sourceAppointmentId, cashInAmount, cashInKind, cashInOccurredAt, cashInDateEstimated. Data legacy tanpa received_at diberi label estimasi.
- Target tambahan `slot_holds`: owner patient_id, psychologist_id, package_id/version, date/start/end, status, expires_at, snapshot quote, dan idempotency key. Masih kontrak belum tabel runtime; TTL dan rekonsiliasi setelah expiry menunggu keputusan.
- Lock baris kapasitas psikolog/tanggal sebelum memeriksa hold, kuota, dan overlap dalam transaction. Unique constraint jam mulai saja tidak mencegah bentrok interval berdurasi berbeda. Jalur perubahan jadwal/reschedule wajib berbagi protokol lock yang sama.

- Booking minimal H+1 dari tanggal pembuatan booking.
- Tanggal baru reschedule minimal H+1 dari hari pengajuan.
- Hari libur psikolog harus memblokir pembuatan booking secara dinamis.
- Batas pertemuan harian psikolog harus dihitung dari booking aktif dan override kuota khusus.
- Slot booking perlu constraint unik agar tidak bisa dipakai dua booking aktif (anti double booking).
- **Payment**: Wajib mendukung snapshot DP flat Rp100.000 yang dihitung server, metode/channel bayar, nama pengirim transfer (`transfer_sender_name`), berkas bukti transfer, dan pencatatan sisa pelunasan di klinik. Nomor referensi transaksi tidak digunakan.
- API admin untuk pelunasan menerima nominal aktual sebagai input satu arah. Nominal tersimpan untuk laporan owner/psikolog, tetapi serializer/resource admin tidak boleh mengembalikannya setelah transaksi dibuat.
- Potongan harga hanya diatur oleh psikolog/pengelola pada `consultation_packages`; admin tidak mengatur atau melihat nominal harga/potongan pada dashboard admin.
- Bukti pembayaran perlu menyimpan file path, status verifikasi, verifier, dan waktu verifikasi.
- Verifikasi awal wajib memakai transaction yang mengubah payment status dan appointment status sekaligus agar tidak ada booking `CONFIRMED` dengan DP belum diverifikasi.
- Invoice/kwitansi perlu disimpan terstruktur agar dapat dicetak ulang dan diaudit.
- Profil data diri pasien (`is_profile_complete`) wajib lengkap sebelum dapat membuat reservasi paket.
- Consent informed consent/privacy wajib tersimpan sebelum booking final.
- Paket konsultasi mendukung klasifikasi sesi tunggal vs rawat jalan berkelanjutan (*continuous care*).
- `consultation_packages.delivery_mode` membedakan `OFFLINE_CLINIC` dan `ONLINE_TELE`; backend menyimpan detail/tautan sesi telelayanan secara terpisah dan tidak mengirim tautan permanen pada katalog publik.
- Paket multi-sesi menggunakan tabel `treatment_plans` sebagai induk rencana terapi; appointment dibuat bertahap per pertemuan, bukan seluruh sesi dibuat sekaligus pada saat pembelian.
- Pembatalan wajib transaction: lock rencana/ledger, pastikan lunas, set `DISCONTINUED`, batalkan seluruh sisa appointment, simpan alasan/pelaku/waktu, dan lepas slot. Histori completed dan uang masuk tidak dihapus.
- `appointments.treatment_plan_id` nullable untuk sesi tunggal dan wajib terisi untuk paket berkelanjutan.
- Gunakan unique constraint `(treatment_plan_id, continuous_session_number)` agar sesi ke-N tidak dibuat dobel.
- Gunakan index `(psychologist_id, date, start_time, end_time, status)` untuk validasi jadwal dan performa kalender.
- Gunakan transaction + row lock saat membuat booking/sesi lanjutan agar slot tidak bentrok saat banyak user mengirim request bersamaan.
- Notifikasi WhatsApp/email perlu memiliki log pengiriman, status retry, dan payload ringkas yang tidak membuka data klinis berlebihan.

## Catatan Keamanan Data

- Data pre-test, consent, pembayaran, notifikasi, export klinis, dan rekam klinis adalah data sensitif.
- Backend wajib menerapkan authorization per role dan per kepemilikan data (Laravel Gates / Policies).
- Perubahan data klinis dan verifikasi keuangan wajib memiliki audit log.

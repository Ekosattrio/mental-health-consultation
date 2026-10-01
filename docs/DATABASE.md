# Database

## Status Saat Ini

Belum ada database nyata. Aplikasi menggunakan mock data dan LocalStorage.

## Storage Lokal

State disimpan di browser menggunakan key dengan prefix:

```text
jiwasehat_v2_
```

Contoh data yang disimpan:

- users
- psychologists
- packages
- tests
- schedules
- appointments
- testResults
- preTests
- assessmentAssignments
- clinicalNotes
- reviews
- payments
- landingCms
- patientCms
- psychologistCms

## Rancangan Entity Target

Entity utama yang perlu disiapkan ketika backend dibuat:

- users
- psychologist_profiles
- consultation_packages
- schedule_slots
- psychologist_holidays
- psychologist_working_hours
- psychologist_daily_capacities
- appointments
- appointment_reschedule_requests
- psychological_tests
- test_questions
- test_results
- pre_tests
- assessment_assignments
- payments
- payment_proofs
- clinical_notes
- reviews
- cms_configs
- reports
- audit_logs

## Aturan Data Penting

- Booking minimal H+1 dari tanggal pembuatan booking.
- Reschedule minimal H+1 dari tanggal pengajuan.
- Hari libur psikolog harus memblokir pembuatan booking.
- Batas pertemuan harian psikolog harus dihitung dari booking aktif.
- Slot booking perlu constraint agar tidak bisa dipakai dua booking aktif.
- Payment perlu mendukung DP 50% dan pelunasan 50%.
- Bukti pembayaran perlu menyimpan file path, status verifikasi, verifier, dan waktu verifikasi.
- Pre-test wajib terkait dengan pengguna dan booking flow.
- Assessment tambahan dari psikolog masih pending konfirmasi client.

## Catatan Keamanan Data

- Data pre-test, test result, pembayaran, dan clinical note adalah data sensitif.
- Backend wajib menerapkan authorization per role dan per kepemilikan data.
- Perubahan data klinis idealnya memiliki audit log.

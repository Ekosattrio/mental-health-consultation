# F05 — Kalender dan ketersediaan
## Latar belakang dan tujuan
Menghasilkan interval layanan yang benar dan mencegah dua pasien menggunakan satu praktisi pada waktu bersamaan.
## Aktor dan authorization
Pasien login membaca slot tanpa nama pasien lain. Admin/Superadmin mengubah kalender dengan alasan dan preview dampak. Kalender Admin dan klinik adalah satu kalender.
## Kolom/isian dan validasi
weekly_schedules: calendar_version_id, day_of_week 1–7 ISO, start_time < end_time. Keberlakuan berasal dari calendar_versions.effective_at, bukan kolom effective_from/effective_until pada interval mingguan. Batas harian ada di weekly_schedule_limits.daily_limit. schedule_overrides menyimpan calendar_version_id, local_date, mode OPEN/CLOSED, daily_limit dan reason; interval OPEN disimpan di schedule_override_intervals, CLOSED tanpa interval. daily_limit positif untuk OPEN (0 untuk CLOSED); tidak menggantikan kapasitas simultan satu praktisi. Paket: duration_minutes positif sebelum bookable.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Pilih kalender versi efektif: override tanggal menggantikan seluruh interval hari; jika tidak ada gunakan interval mingguan, kurangi libur/istirahat.
2. Bentuk interval kontinu yang cukup untuk durasi; 240 menit tidak boleh melintasi istirahat.
3. Kurangi appointment yang mengokupansi dan periksa kuota.
4. Terapkan sesuai batas kalender F05 dan tiga jam kerja penuh bagi pasien online.
5. Saat submit, lock resource hari dan hitung ulang; hasil GET availability bukan jaminan slot.
6. Saat jam berubah, preview seluruh appointment aktif terdampak. Apply mencatat operational_change dan clinic-origin request, tandai requires_reschedule dan kirim informasi agar pasien memilih kembali. Jangan memindahkan jadwal diam-diam.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Apply calendar / Admin | versi sesuai, preview valid | versi baru + dampak + outbox dalam satu transaction |
| Submit booking / berizin | interval bebas | appointment mengokupansi |
| Reschedule apply / Admin | interval baru bebas | interval lama dilepas atomik |
| Cancel/expire / sah | reservasi aktif | okupansi dilepas |
## Alur gagal dan pemulihan
Interval overlap, end<=start, durasi tidak muat, atau kuota penuh mendapat 422/409. Perubahan kalender tidak disimpan separuh: event dampak/notifikasi-outbox harus tercatat bersama versi. Perubahan retroaktif dilarang; perubahan hari ini berlaku mulai now server dan tidak mengubah layanan yang sudah dimulai.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /admin/calendar/apply | ManagementController@calendarApply |
| POST | /admin/calendar/preview | ManagementController@calendarPreview |
| GET / HEAD | /availability | BookingController@slots |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Dua submit bersamaan untuk interval overlap hanya satu berhasil.
- Sabtu 14:00–16:00 tidak menawarkan paket 240 menit.
- Penutupan klinik tidak menghasilkan NO_SHOW untuk pasien yang diminta mengubah jadwal.
- Tidak ada isBooked persisten sebagai sumber okupansi kedua.
## Hubungan fitur
F06 booking, F09 reschedule, F17 input Admin, dokumen OPERATING_WINDOW_AND_BOOKING_CUTOFF.

## Kuota turun dan layanan yang masih berlangsung
Jika kuota baru di bawah jumlah reservasi yang telah sah, reservasi lama tetap diakui; hentikan booking baru sampai count di bawah limit. Penutupan/perubahan interval yang membuat jadwal tidak valid tetap memakai workflow pasien terdampak, bukan memilih pasien untuk dibatalkan secara acak.
IN_CONSULTATION tanpa actual_ended_at menandakan praktisi masih melayani. Admin tidak boleh membuat walk-in yang dimulai saat itu sebelum layanan lama selesai/ditangani. Kelebihan durasi dicatat sebagai fakta aktual dan dampak jadwal; end_at jadwal tidak diedit untuk menyembunyikan bentrokan. Appointment berikutnya tidak bergeser otomatis.

## Batas aktif24 Oktober
Online addWorkingMinutes(reservation_created_at,180), same-day boleh. Kalender Admin=klinik, istirahat dikecualikan; 10.30 dengan jeda12–13 menjadi14.30. Reminder120 menit waktu nyata. Offline Admin tidak memakai lead online, tetapi slot/durasi/overlap/kuota tetap diperiksa. Sumber okupansi hanya appointment, bukan cache flag.
ScheduleResource unik praktisi+tanggal WIB adalah baris mutex: wajib lockForUpdate sebelum query overlap dan perubahan jadwal. SQL unique tanggal itu tidak berarti hanya satu appointment/hari dan tidak menjamin overlap sendiri. Detail contoh/deadline pada OPERATING_WINDOW_AND_BOOKING_CUTOFF.

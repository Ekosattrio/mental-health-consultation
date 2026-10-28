# F10 — Kedatangan, layanan dan ketidakhadiran

> Minimum awal mengikuti snapshot konfigurasi billing. Lanjutan memakai verifikasi asal. Cancel belum diberikan memakai CLOSED_UNSERVED+adjustment berjejak, kas tetap; tanpa refund. [Keputusan aktif](../KEPUTUSAN_AKTIF_2026-10-24.md).

## Latar belakang dan tujuan
Mencatat kejadian operasional nyata tanpa menyamakan konfirmasi reservasi dengan penerimaan uang.
## Aktor dan authorization
Admin mencatat check-in, pemanggilan, mulai/selesai berdasarkan fakta/instruksi praktisi dan no-show setelah pemeriksaan. Superadmin dapat melakukan semua aksi operasional dan menentukan isi/keputusan klinis. Pasien hanya melihat status miliknya. Ketentuan Admin ini mengikuti §3.3 ide, menggantikan rekomendasi lama yang membatasi seluruh status hanya ke owner.
## Kolom/isian dan validasi
identity_checked wajib pada request check-in; response initial_requirement_met dihitung server, bukan kolom payment_initial_requirement_met. Kolom appointment: checked_in_at, checked_in_by, actual_started_at, actual_ended_at. Penetapan no-show dicatat melalui appointment_events dengan event_type=NO_SHOW beserta attempt_number, actor_id, reason dan created_at server, bukan kolom no_show_at pada appointment. Waktu mulai/selesai aktual tidak boleh masa depan; koreksi waktu kejadian harus terpisah dan beralasan. Catatan administratif tidak memuat diagnosis.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Admin mencocokkan identitas, booking dan status slot.
2. Admin wajib memeriksa pembayaran. Jika transfer benar sudah diterima, approve nominal aktual. Jika DP belum cukup, tagih di luar sistem, lalu input uang yang diterima; jangan menunggu SLA.
3. Jika DP terpenuhi, check-in atomik. Admin mendapat indikator terpenuhi/tidak; DTO Admin tidak mengirim saldo pasien.
4. Catat mulai dan selesai layanan berdasarkan kejadian sebenarnya. Jika ada pelunasan, tagih dan input ledger, bukan menimpa DP.
5. Pasien terlambat dicatat. Default grace 15 menit (konfigurabel owner); keterlambatan tidak otomatis menghasilkan biaya waktu tambahan.
6. NO_SHOW hanya setelah grace, tidak hadir, dan tidak ada request tepat waktu/konflik klinik yang belum diselesaikan. Admin mencatat alasan; patient menerima hak pengajuan empat hari.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Check-in / Admin | CONFIRMED atau CONFIRMED_AUTO_SLA, DP diverifikasi | CHECKED_IN |
| Arrival reconcile / Admin | WAITING_VERIFICATION/WAITING_PAYMENT, slot sah | verifikasi/terima uang dahulu, CONFIRMED lalu CHECKED_IN |
| Start / Admin/owner | CHECKED_IN | IN_CONSULTATION + actual_started_at |
| Complete / Admin/owner | IN_CONSULTATION | COMPLETED + actual_ended_at |
| No-show / Admin/owner | reservasi aktif, grace lewat, tanpa pengecualian sah | NO_SHOW + histori + batas hak |
| Cancel / Admin/owner | belum layanan, alasan sah | CANCELLED + lepas interval; uang tetap |
| Cancel/discontinue / petugas berizin | bagian belum diberikan ditetapkan, alasan dan versi sah | ADJUSTMENT pelepasan + CLOSED_UNSERVED; sisa appointment cakupan batal atomik, completed/kas tetap |
| Clinical correction / owner | status salah dicatat | event koreksi, versi baru; tidak hapus histori |
## Alur gagal dan pemulihan
CHECK_IN layanan REQUIRED ditolak bila DP belum memenuhi minimum; INCLUDED memeriksa billing asal, NOT_REQUIRED sah tanpa pembayaran; petugas menagih dan mencatat aktual dahulu. Pasien yang menolak membayar tetap belum check-in, diarahkan penanganan Admin. Slot EXPIRED tidak direbut kembali. Start tanpa check-in atau complete sesi masa depan ditolak. Layanan yang sudah selesai tetapi belum lunas tetap COMPLETED dengan kewajiban tersisa pada pasien/owner.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /admin/appointments/{appointment}/{action} | BookingController@lifecycle |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Jumat23:44 memilih Sabtu14:00: bila SLA belum habis, pemeriksaan nyata saat datang tetap dapat menuntaskan check-in.
- Auto-confirm tidak menambah uang.
- NO_SHOW bukan pembatalan histori; recovery F09 tidak menagih ulang paket.
- Admin tidak mendapatkan outstanding_amount atau total_paid pada response kedatangan.
## Hubungan fitur
F08 pembayaran, F09 reschedule, F11/F18 rangkaian layanan.

## Kehadiran Telelayanan
Untuk Google Meet, “kedatangan” berarti identitas/kehadiran online yang dikonfirmasi Admin berdasarkan komunikasi pasien/praktisi. Payment dan minimum DP diperiksa sebelum check-in seperti layanan offline; tagihan ditindaklanjuti lewat komunikasi jarak jauh. Klik link/pesan WA SENT tidak otomatis check-in, start, complete atau no-show. Link belum disiapkan/WA gagal dari sisi praktik tidak menjadi kesalahan ketidakhadiran pasien; selesaikan administrasi/perubahan jadwal lebih dahulu. Detail F20.

## Kedatangan, custom dan notifikasi terlambat
Admin wajib mencocokkan uang saat kedatangan. Sudah benar diterima: catat/verifikasi; belum: tagih di luar sistem lalu catat nominal aktual. NOT_REQUIRED sah tidak ditahan minimum DP; INCLUDED memeriksa billing asal. Ketiganya tetap membutuhkan pemeriksaan identitas dan slot.
NO_SHOW hanya sesudah start_at+grace_minutes (awal15), tidak ada check-in/request sah/konflik klinik. Perubahan jam yang memaksa pindah tidak menghukum pasien no-show. Booking manual kurang120 menit mengirim pemberitahuan segera berlabel tambahan manual, tidak mengarang riwayat pengingat T−2.

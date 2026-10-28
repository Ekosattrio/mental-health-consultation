# F03 — Identitas pasien dan penanggung jawab
## Latar belakang dan tujuan
Mencegah akun pemesan, anak/pasangan yang diperiksa dan pasien walk-in tertukar, dengan satu penanggung jawab sederhana.
## Aktor dan authorization
Pasien mengelola profil yang mempunyai patient_accesses sah. Admin mengisi identitas administratif dan memverifikasi klaim riwayat; Superadmin melihat konteks klinis. Mengganti kontak tidak memindahkan hak akses histori.
## Kolom/isian dan validasi
| Isian | Wajib | Validasi |
|---|---|---|
| full_name, birth_date | Booking | nama; tanggal lahir tidak di masa depan |
| gender | Sesuai template | tidak mengarang jawaban |
| phone / responsible_phone | Booking | minimal satu kontak yang dapat dihubungi |
| address, city, birth_place | Sesuai kebutuhan administrasi | batas panjang |
| occupation | Opsional | anak boleh kosong |
| emergency_name/phone/relationship | Sesuai form | tidak memakai identitas palsu untuk lolos |
| responsible_user_id | Default akun | server dari session |
| responsible_name/phone, relationship, participants_note | Untuk orang lain/walk-in | satu penanggung jawab; catatan peserta opsional |
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Pemilik akun melengkapi profil diri atau membuat profil pasien aktual lain.
2. Server menambahkan patient_accesses untuk pemesan sah.
3. Booking mengambil snapshot identitas/penanggung jawab; edit profil berikutnya tidak mengubah dokumen lama.
4. Walk-in dibuat Admin tanpa wajib akun/password.
5. Jika kemudian pasien mendaftar, Admin memverifikasi identitas dan menautkan akses dengan alasan; nama/telepon cocok tidak cukup.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Save / pemilik atau Admin | profil baru/lama | kelengkapan dihitung server |
| Link account / Admin | identitas terverifikasi | akses ACTIVE + audit |
| Revoke access / Superadmin | akses ACTIVE | REVOKED, histori tidak dihapus |
## Alur gagal dan pemulihan
Duplikat potensial ditampilkan untuk verifikasi, bukan auto-merge. Profil kurang lengkap memblokir booking online dengan daftar field. Klaim riwayat salah ditolak; tidak ada endpoint pencarian riwayat berdasarkan nomor telepon saja.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /admin/patients/{patient}/link | ClinicalAdministrationController@link |
| POST | /patients | ClinicalAdministrationController@patient |
| POST / PATCH | /patients/{patient} | ClinicalAdministrationController@patient |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Booking anak tidak menimpa nama akun orang tua.
- Akun lain tidak dapat membaca profil/riwayat hanya dengan UUID.
- Walk-in tanpa akun dapat dibooking tanpa mengisi profil Admin sebagai pasien.
## Hubungan fitur
F01 akun, F06 booking, F07 profiling, F15 consent.

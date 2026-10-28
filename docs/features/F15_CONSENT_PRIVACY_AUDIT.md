# F15 — Consent, file privat, retensi dan audit
## Latar belakang dan tujuan
Memisahkan persetujuan, akses dokumen dan umur simpan berkas agar hilangnya tombol unduh tidak menghapus histori transaksi.
## Aktor dan authorization
Penanggung jawab menerima consent aplikasi untuk booking terkait; Admin melihat status penerimaan; Superadmin mengelola versi naskah dan akses klinis. Ini tidak mengklaim menggantikan persetujuan klinis offline.
## Kolom/isian dan validasi
consent: patient_id, actor_user_id penerima jika punya akun (nullable), accepted_by_name_snapshot, recorded_by_user_id, document_key/document_version, accepted_at, acceptance_source dan appointment_id nullable sebelum bind. Tidak ada assisted_actor_id/scope bebas yang tidak terdefinisi pada schema. Pada SELF, penerima dan pencatat sama; pada ASSISTED_OFFLINE, nama penerima nyata tetap dicatat, Admin hanya pencatat. file: storage_key private, checksum, MIME, size, uploaded_by, uploaded_at, expires_at, purged_at. audit: actor, action, target, sanitized old/new, reason, request_id, created_at.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Tampilkan naskah versi aktif; persetujuan terkait identitas dan versi, tidak dicentang otomatis.
2. Simpan consent draft mandiri; booking menautkannya setelah appointment ada.
3. Upload bukti memvalidasi isi/MIME/size, nama acak dan private disk; signed URL hanya sesudah policy dan berumur pendek.
4. Cutoff kanonik adalah billing_accounts.download_until=service_terminal_at+7hari; single appointment mengambil terminal_at, asesmen mengambil penutupan seluruh case. Tidak menebak kolom completed_at/cancelled_at yang tidak ada pada appointments; actual_ended_at membuktikan waktu selesai layanan dan event menyimpan alasan/waktu cancel. NO_SHOW dengan hak request aktif belum terminal. Ringkasan transaksi tetap tersedia.
5. File bukti/operasional expires_at = uploaded_at +1 tahun kalender. Backup expires_at = backup_created_at +1 tahun. File export boleh punya masa unduh lebih singkat; maksimum retensi sama, tidak membuatnya publik.
6. Job purge mencatat tombstone; restore menerapkan ulang tombstone/expiry sebelum aplikasi dibuka. Record transaksi, consent, audit dan snapshot invoice tidak otomatis dipurge setahun.
7. Receipt/addendum baru setelah penutupan tidak diam-diam memperpanjang hak unduh; reissue bantuan oleh petugas diaudit.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Accept / penanggung jawab | versi sah | ACCEPTED immutable |
| Withdraw / pemilik | persetujuan ada | WITHDRAWN event; histori uang tidak terhapus |
| Upload / berizin | valid | STORED private |
| Access cutoff / server | > download_until | download ditolak, ringkasan tersedia |
| Purge / job | expires_at lewat | PURGED + tombstone; metadata bertahan |
## Alur gagal dan pemulihan
Berkas executable/MIME salah/terlalu besar ditolak. URL expired harus diminta ulang dengan policy; tidak memperpanjang hak pasien. Backup gagal harus tercatat dan dipantau; restore diuji kelak dalam implementasi, belum dinyatakan terbukti di audit dokumen.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /consents | ClinicalAdministrationController@consent |
| POST | /consents/{consent}/withdraw | ClinicalAdministrationController@withdraw |
| POST | /files | FileController@store |
| GET / HEAD | /files/{file}/download | FileController@download |
| GET / HEAD | /invoices/{invoice}/download | FileController@invoice |
| GET / HEAD | /receipts/{receipt}/download | FileController@receipt |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Tujuh hari adalah akses unduh pasien; satu tahun adalah retensi file, dua aturan tidak saling menggantikan.
- Admin tidak dapat mengunduh receipt lengkap yang membocorkan saldo; gunakan cetak dokumen tagihan/proyeksi berizin.
- Audit tidak dapat diubah lewat API dan tidak menyimpan token/semua answers.
## Hubungan fitur
F01 sessions, F07 clinical access, F08 proofs, F13 queue.

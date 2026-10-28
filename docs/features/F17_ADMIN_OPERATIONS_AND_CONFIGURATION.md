# F17 — Ruang kerja dan input kustom Admin

> Online boleh same-day setelah tiga jam kerja penuh; offline Admin boleh hari ini/sekarang. DP tidak diulang pada reschedule/lanjutan. Ikuti [keputusan aktif](../KEPUTUSAN_AKTIF_2026-10-24.md).

## Latar belakang dan tujuan
Memberi fleksibilitas operasional untuk kondisi nyata sambil mempertahankan relasi, histori dan guard tabrakan.
## Aktor dan authorization
Admin/Superadmin mengelola pendaftaran, booking, jam buka, penjadwalan lanjutan, promo, biaya kustom dan diskon individual. Admin tidak melihat saldo pasien/laporan kas owner atau isi klinis. Pencatatan administratif selesai/no-show mengikuti F10.
Pengelolaan harga termasuk pilihan dasar tarif additional time pada versi paket Konseling: harga normal atau harga setelah promo saat booking (F04). Keduanya berhak mengubah untuk booking baru dengan alasan/audit; input menit pada sesi tidak boleh mengubah basis booking lama.
Untuk Telelayanan, Admin/Superadmin memasukkan atau memperbaiki link Google Meet dan nomor WA booking; save otomatis memicu pengiriman Baileys. Monitor status kirim dan lakukan resend beralasan sesuai F20, bukan mengubah status uang/kehadiran dari sukses kirim.
## Kolom/isian dan validasi
Semua input: source, reason, effective_at dan target terkait wajib sesuai aksi; actor_id/session server. Custom charge: label, quantity integer>0, unit_amount Rupiah>0, reference opsional. Personal discount: amount>0, reason, billing_account_id, target_line_id; tidak menggunakan nominal biaya negatif. Calendar change: expected_version + preview_id. preview_id adalah token server untuk hasil pratinjau, bukan FK/kolom baru atau ID buatan React.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Pilih pasien/booking/case, lihat identitas dan harga/diskon/total yang berizin. Pendaftaran offline boleh profiling_mode=PAPER tanpa submission digital: pasien menyerahkan kertas langsung kepada Superadmin; Admin tidak menulis/baca/upload jawaban klinis.
2. Pilih aksi: daftar, walk-in, tambah jadwal included follow-up, ubah jam, tambah biaya, promo global atau diskon tagihan.
3. Preview server menunjukkan dampak/total (tanpa saldo Admin); operator mengonfirmasi data.
4. Server memvalidasi permission, ownership, versi, waktu, biaya dan kalender; menyimpan hasil+audit+outbox.
5. Bukti/nominal pembayaran aktual diinput F08; penagihan dilakukan di luar sistem.
6. Kalender berubah: pasien terdampak diberitahu untuk memilih jadwal kembali melalui request asal klinik, bebas kuota pasien.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Preview / Admin | input valid | tidak memutasi reservasi/uang |
| Apply / Admin | versi cocok, guard terpenuhi | record/event baru + audit |
| Correction / berizin | ada record asal salah | event koreksi; asal tetap |
| Owner reverse / Superadmin | alasan sah | revisi/event baru; tidak hard delete |
## Alur gagal dan pemulihan
Custom amount/quantity minus ditolak; gunakan PERSONAL_DISCOUNT. Diskon total melebihi kewajiban/menyebabkan selisih uang memerlukan rekonsiliasi, tidak menghapus penerimaan. Appointment COMPLETED boleh mendapat invoice addendum, tetapi tidak boleh diedit jadwalnya sebagai booking masa depan. Ruang/kuota tidak membolehkan satu praktisi melayani dua sesi overlap.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| GET / HEAD | /admin/dashboard | DashboardController@show |
| GET / HEAD | /dashboard | DashboardController@redirect |
| GET / HEAD | /pasien/dashboard | DashboardController@show |
| GET / HEAD | /superadmin/dashboard | DashboardController@show |
| GET / HEAD | /work/data | Closure |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Walk-in sah tidak membutuhkan exception_approval_id.
- Perubahan Admin tetap mempunyai actor/reason dan ditautkan ke target.
- Dua input additional time5+5 menit hanya satu blok F08.
- Tidak ada endpoint generic update status/role/ledger dari JSON bebas.
## Hubungan fitur
F03–F06, F08–F11, F15, F18.

## Fleksibilitas manual terstruktur
Admin mengubah kalender dengan publish version+impact+requestCLINIC+outbox atomik. Warning tanpa jalur penyelesaian tidak cukup; jangan memaksa memindah ke jam baru yang belum dipublish. Appointment terdampak requires_reschedule sampai diselesaikan; histori tidak hilang.
Pendaftaran offline tanpa email/login memakai PatientProfile dan kontak nyata; jangan membuat email dari nama pasien. Akun login opsional dan akses PatientAccess harus diverifikasi sebelum klaim. Layanan tambahan owner memakai CUSTOM REQUIRED/INCLUDED/NOT_REQUIRED F06, tetap slot nyata dan alasan. Identitas akun dan profil tidak disatukan hanya berdasarkan nama/nomor yang mirip.
OwnerSetting menyimpan konfigurasi DP/lead/reminder/grace; perubahan untuk kejadian baru, bukan menulis ulang snapshot. Admin/Superadmin mengelola harga/promo/basis overtime pada PackageVersion, bukan update harga transaksi lama.

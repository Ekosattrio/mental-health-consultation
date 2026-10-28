# F19 — Pengeluaran praktik
## Latar belakang dan tujuan
Melengkapi keuangan basis kas dalam §25 ide: pengeluaran dan surplus, tanpa menjadikannya sistem akuntansi penuh.
## Aktor dan authorization
Hanya Superadmin mencatat, mengoreksi dan membaca pengeluaran. Admin tidak mendapat endpoint atau dataset ini. Lampiran private.
## Kolom/isian dan validasi
| Isian | Wajib | Validasi |
|---|---|---|
| expense_date | Ya | tanggal pengeluaran aktual WIB |
| category | Ya | RENT/ELECTRICITY/INTERNET/SUPPLIES/OPERATIONS/STAFF/OTHER |
| description | Ya | 1–500 karakter |
| amount | Ya | integer Rupiah positif |
| notes, attachment_file_id | Tidak | file private berizin |
| correction_of_id, reason | Koreksi | record asal, alasan wajib |
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Owner memasukkan pengeluaran yang sudah benar-benar terjadi, bukan rencana.
2. Server mencatat POSTED dengan idempotency key dan audit.
3. Koreksi membuat REVERSAL/REPLACEMENT tertaut; record asal tidak ditimpa.
4. Finance F14 memasukkan net expense pada expense_date. Lampiran expired tidak menghapus nominal/histori pengeluaran.
5. Export menyimpan as_of, filter dan tautan record sumber.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Post / owner | data aktual valid | POSTED |
| Correct / owner | record aktif sah | reversal + replacement, alasan dan link |
| Attachment expiry / job | umur file1tahun | file dihapus, expense tetap |
## Alur gagal dan pemulihan
Nominal <=0, tanggal invalid atau referensi file milik scope lain ditolak. Klik ganda tidak mencatat dua pengeluaran. Admin mendapat403. Koreksi berantai tidak boleh membalik record yang telah dibalik lagi secara ganda.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /superadmin/expenses | FinanceController@expense |
| POST | /superadmin/expenses/{expense}/corrections | FinanceController@expense |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Surplus mengurangkan pengeluaran bersih yang benar pada periode yang sama.
- Koreksi meninggalkan sumber asal dan audit.
- Tidak ada data gaji/biaya praktik pada export jadwal Admin.
## Hubungan fitur
F14 finance, F15 file/audit; bukan fitur refund.

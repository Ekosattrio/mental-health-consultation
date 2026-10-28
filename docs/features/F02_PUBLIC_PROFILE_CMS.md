# F02 — Company profile dan CMS
## Latar belakang dan tujuan
Guest perlu memahami praktik dan kontak; pengelola membutuhkan konten terstruktur yang dapat diperbarui tanpa menyunting program.
## Aktor dan authorization
Guest membaca hanya publik. Admin/Superadmin mengelola konten administratif; kredensial/identitas praktisi diterbitkan setelah konfirmasi Superadmin. Draft/pratinjau hanya petugas.
## Kolom/isian dan validasi
section_key wajib; kombinasi section_key/version unik; payload JSON dengan whitelist per section; status DRAFT/PUBLISHED/ARCHIVED; version wajib; aset logo/foto dengan MIME/size yang diizinkan. Section: hero, CTA, profil, fasilitas, layanan, alamat, jam, kontak administrasi, FAQ, privacy, footer. Harga tidak disisipkan ke teks publik.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Petugas membuat revisi draft.
2. Preview menggunakan proyeksi Guest.
3. Publish membuat versi aktif atomik; cache publik diinvalidasi.
4. Guest menekan booking lalu diarahkan login; hotline jelas untuk administrasi.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Save / petugas | belum ada atau draft | DRAFT versi baru |
| Publish / berizin | valid | PUBLISHED; versi lama ARCHIVED |
| Rollback / petugas | ada versi lama | revisi baru dari konten lama; histori tetap |
## Alur gagal dan pemulihan
Konten invalid/HTML berbahaya ditolak/sanitasi. Konflik versi mendapat 409; load ulang sebelum menyimpan. Aset gagal menampilkan fallback; tidak membocorkan path private. Draft tidak bocor ke API Guest.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| GET / HEAD | / | HomeController |
| POST | /admin/assets | PublicAssetController@store |
| POST | /admin/cms | ManagementController@cms |
| GET / HEAD | /admin/cms/{cms}/preview | ManagementController@preview |
| POST | /admin/cms/{cms}/publish | ManagementController@publish |
| GET / HEAD | /informasi/{section} | Closure |
| GET / HEAD | /media/{asset} | PublicAssetController@show |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Response Guest, metadata dan HTML publik tidak mengandung harga, promo_price, DP atau diskon numerik.
- Publish gagal tidak menghapus versi aktif.
- Hotline menggunakan placeholder sampai data praktik diisi.
## Hubungan fitur
F04 katalog, F13 notifikasi, F15 sanitasi/aset.

## Pemetaan implementasi26 Oktober2026
Landing menyimpan hero, logo, foto fasilitas/profil, CTA, FAQ, footer dan kontak. Teks identitas praktisi berasal dari pengaturan owner; jam publik dihitung dari kalender. Bagian patient/psychologist berisi informasi workspace yang dipublikasikan. Privacy/consent dan clinical_identity hanya diterbitkan owner. Gambar disimpan melalui unggah CMS, bukan URL/private path bebas. Teks landing/FAQ menolak nominal Rp/IDR untuk menjaga kebijakan harga setelah login. Tidak ada cache konten aplikasi yang perlu menunggu TTL setelah publish.

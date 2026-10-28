# F02 — Company profile dan CMS
## Latar belakang dan tujuan
Guest perlu memahami praktik dan kontak; pengelola membutuhkan konten terstruktur yang dapat diperbarui tanpa menyunting program.
## Aktor dan authorization
Guest membaca hanya publik. Admin/Superadmin mengelola konten administratif; kredensial/identitas praktisi diterbitkan setelah konfirmasi Superadmin. Draft/pratinjau hanya petugas.
## Kolom/isian dan validasi
section_key wajib/unik; payload JSON dengan whitelist per section; status DRAFT/PUBLISHED/ARCHIVED; version wajib; aset logo/foto dengan MIME/size yang diizinkan. Section: hero, CTA, profil, fasilitas, layanan, alamat, jam, kontak administrasi, FAQ, privacy, footer. Harga tidak disisipkan ke teks publik.
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
getLanding, saveRevision, preview, publish, uploadPublicAsset. GET /public/landing; GET/POST /admin/cms; POST /admin/cms/{id}/publish; POST /admin/assets.
Target path relatif root domain memakai route web/session Laravel. Kontrak props/form/JSON pendukung dan daftar route yang sudah dibuat ada di [WEB_CONTRACT](../WEB_CONTRACT.md). Kode409/422 di uraian fitur adalah kondisi domain/JSON; form Inertia memetakannya ke redirect/errors sesuai kontrak.
## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Response Guest, metadata dan HTML publik tidak mengandung harga, promo_price, DP atau diskon numerik.
- Publish gagal tidak menghapus versi aktif.
- Hotline menggunakan placeholder sampai data praktik diisi.
## Hubungan fitur
F04 katalog, F13 notifikasi, F15 sanitasi/aset.

# F12 — Ulasan dan moderasi
## Latar belakang dan tujuan
Memberi umpan balik per pembelian layanan tanpa memperbanyak bobot asesmen yang terdiri atas beberapa appointment.
## Aktor dan authorization
Penanggung jawab berizin menulis satu review per billing account. Admin/Superadmin memoderasi. Guest hanya melihat versi APPROVED; bukan identitas internal atau detail klinis.
## Kolom/isian dan validasi
billing_account_id unik; author_user_id server; rating integer1–5; comment opsional maksimal2000; is_anonymous boolean; version; status PENDING_MODERATION/APPROVED/REJECTED; moderated_by/time/reason.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Konseling/psikoterapi eligible setelah appointment COMPLETED; asesmen setelah case CLOSED dan setidaknya satu appointment case COMPLETED. Pembatalan/tanpa satu pun layanan diberikan tidak eligible, walaupun seluruh tagihan sudah dilunasi.
2. Penulis membuat review; ditahan untuk moderasi.
3. Admin memeriksa komentar agar tidak membuka identitas/data pihak lain.
4. Edit membuat versi baru dan kembali moderasi; versi lama tidak tetap tampil bila materi diubah.
5. Rating publik dihitung hanya dari versi APPROVED terkini. Anonymous menghilangkan nama, patient/booking UUID, avatar dan metadata pengenal.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Submit / penulis | layanan eligible, belum ada review | PENDING_MODERATION |
| Approve / moderator | PENDING_MODERATION | APPROVED, agregat diperbarui |
| Reject / moderator | PENDING_MODERATION | REJECTED beralasan |
| Edit / penulis | milik sendiri, version cocok | PENDING_MODERATION versi baru |
## Alur gagal dan pemulihan
Belum selesai/tidak berizin ditolak. Duplikat billing account memberi409. Review anonim tetap berelasi internal untuk audit. Hapus publik memakai moderasi, tidak menghapus jejak.
## Function dan route web
createReview, editReview, moderate, listPublished. POST /billing-accounts/{id}/review; PATCH /reviews/{id}; POST /admin/reviews/{id}/moderate; GET /public/reviews.
Target path relatif root domain memakai route web/session Laravel. Kontrak props/form/JSON pendukung dan daftar route yang sudah dibuat ada di [WEB_CONTRACT](../WEB_CONTRACT.md). Kode409/422 di uraian fitur adalah kondisi domain/JSON; form Inertia memetakannya ke redirect/errors sesuai kontrak.
## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Asesmen tiga pertemuan hanya satu review.
- Review edit tidak langsung tampil approved.
- Response anonim tidak menyertakan internal IDs.
## Hubungan fitur
F10 completion, F18 close case, F02 publik.

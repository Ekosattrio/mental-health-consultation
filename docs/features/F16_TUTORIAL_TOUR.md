# F16 — Tutorial dan panduan interaktif
## Latar belakang dan tujuan
Membantu tiap aktor mengerti langkah kerja berdasarkan permission yang benar, tanpa menyisipkan aturan bisnis ke UI.
## Aktor dan authorization
Guest membaca tutorial umum. Pengguna login menyimpan progres sendiri. Admin/Superadmin memperbarui materi administratif; materi klinis disahkan owner.
## Kolom/isian dan validasi
tutorial: content_key, role, version, title, steps JSON, video_url opsional, is_active. progress: user_id, content_key, content_version, last_step, completed_at/skipped_at. Guest memakai progres lokal non-sensitif, bukan patient ID.
content_key/content_version pada API dipetakan server ke tutorial_contents.id; storage progress hanya tutorial_content_id, bukan salinan key/version kedua. Status progress derived dari completed_at/skipped_at dan last_step. row_version common untuk concurrency progres, version konten untuk versi materi.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Server memberi tutorial sesuai role dan capabilities.
2. Tour muncul pada penggunaan awal, boleh skip/replay.
3. Progres disimpan dengan version; perubahan mayor materi menawarkan ulang.
4. Materi booking menjelaskan deadline aktual, H+1/enam jam, DP dan bukti; materi Admin tidak menampilkan saldo; tutorial tidak menjalankan transaksi nyata otomatis.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Start/save / pengguna | materi aktif sesuai role | IN_PROGRESS |
| Complete / pengguna | langkah selesai | COMPLETED |
| Skip / pengguna | kapan saja | SKIPPED |
| Replay / pengguna | completed/skipped | progres baru untuk versi aktif |
## Alur gagal dan pemulihan
Target selector hilang melewati langkah dengan pesan aman. Video gagal punya teks alternatif. API gagal tidak menghalangi fungsi utama. Role berganti harus memuat ulang materi; tidak memperlihatkan layar finance ke Admin.
## Function dan route web
getTutorials, saveTourProgress, replayTour. GET /tutorials; PUT /tutorial-progress/{key}.
Target path relatif root domain memakai route web/session Laravel. Kontrak props/form/JSON pendukung dan daftar route yang sudah dibuat ada di [WEB_CONTRACT](../WEB_CONTRACT.md). Kode409/422 di uraian fitur adalah kondisi domain/JSON; form Inertia memetakannya ke redirect/errors sesuai kontrak.
## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Skip tidak memblokir booking.
- Tour tidak menjanjikan hold selalu24h bila sesi lebih dekat.
- Server menolak menyimpan progres atas user_id orang lain.
## Hubungan fitur
Semua fitur UX; F01 permissions dan F15 audit.

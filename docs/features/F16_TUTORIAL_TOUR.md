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
4. Materi booking menjelaskan deadline aktual, sesuai batas kalender F05/tiga jam kerja penuh, DP dan bukti; materi Admin tidak menampilkan saldo; tutorial tidak menjalankan transaksi nyata otomatis.
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

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /admin/tutorials | ClinicalAdministrationController@tutorialContent |
| POST | /tutorial-progress/{tutorial} | ClinicalAdministrationController@tutorial |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Skip tidak memblokir booking.
- Tour tidak menjanjikan hold selalu24h bila sesi lebih dekat.
- Server menolak menyimpan progres atas user_id orang lain.
## Hubungan fitur
Semua fitur UX; F01 permissions dan F15 audit.

## Implementasi26 Oktober2026
Tour berupa dialog langkah teks pada penggunaan pertama, dengan Lanjut, Selesai, Lewati dan replay melalui menu panduan. Tidak melakukan transaksi klinis/keuangan otomatis. Video adalah tautan HTTPS dengan langkah teks sebagai alternatif. Progres memakai expected_version:0 jika belum ada, atau row_version terakhir; replay memakai restart=true. Revisi materi membuat content/version baru dan menonaktifkan versi lama tanpa menghapus progresnya. Role PSYCHOLOGIST dan content_key berawalan clinical hanya dikelola owner; Admin mengelola materi administratif. Materi Guest yang diaktifkan muncul di beranda, progres bacanya hanya lokal anonim.

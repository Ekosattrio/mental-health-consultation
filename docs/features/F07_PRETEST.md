# F07 — Profiling dan riwayat pre-test
## Latar belakang dan tujuan
Memberi konteks awal per layanan kepada praktisi tanpa menimpa jawaban lama atau menyimpulkan diagnosis otomatis.
## Aktor dan authorization
Keputusan developer: profiling offline memakai kertas yang langsung diserahkan kepada Superadmin. Admin hanya mengurus pendataan administratif, jadwal dan pembayaran; tidak memasukkan, membaca, memindai atau mengunggah jawaban profiling kertas. Pasien/penanggung jawab mengisi profiling digital melalui akun sendiri untuk booking online; Admin hanya melihat status DRAFT/SUBMITTED/kelengkapan. Superadmin membaca jawaban digital berizin dan menerima kertas secara langsung. Tidak ada kewajiban menyalin kertas ke aplikasi.
## Kolom/isian dan validasi
| Isian | Wajib | Validasi |
|---|---|---|
| patient_id, template_version | Ya | pasien berizin, versi template aktif |
| appointment_id | Saat booking berhasil | nullable pada draft |
| chief_complaint, goals | Sesuai template | string terbatas |
| duration, concerns, stress, sleep | Sesuai pertanyaan | enum/scale terdefinisi template |
| previous_therapy, medications, risk answers | Hanya bila ditanyakan | null/absent jika belum dijawab; bukan false otomatis |
| row_version, supersedes_id | Server | row_version untuk autosave; revisi submission memakai ID baru dan relasi, tidak overwrite jawaban lama |
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Buat draft mandiri sebelum reservasi; FK appointment boleh null.
2. Autosave dengan expected_version=row_version agar dua tab tidak menimpa. Nomor versi template berbeda dari versi row draft.
3. Submit memvalidasi hanya pertanyaan template; versi submitted immutable.
4. Booking menghubungkan submission dalam transaction setelah appointment dibuat.
5. Keputusan eksplisit developer 22 Oktober 2026: setiap booking/sesi baru memakai submission baru yang dikonfirmasi atau diperbarui pasien. Termasuk pemesanan Konseling kembali, karena konteks keluhannya dapat berbeda. Boleh menawarkan salinan jawaban sebelumnya, tetapi pasien wajib memeriksa/menyetujui atau mengubahnya; jangan otomatis menganggap snapshot lama sebagai jawaban sesi baru. Histori tetap terikat appointment asal. Admin yang menjadwalkan tidak menjadi pengisi/penyetujui jawaban klinis pasien.
6. Jawaban risiko menandai perhatian praktisi di dashboard; tidak menghasilkan diagnosis/layanan darurat otomatis.
7. Booking offline oleh Admin dapat memakai appointments.profiling_mode=PAPER tanpa pretest_submission_id; pasien mengisi kertas dan menyerahkannya langsung ke Superadmin. Label “Profiling kertas — tidak tersimpan di aplikasi” berbeda dari SUBMITTED digital. Admin tidak menyatakan kelengkapan klinis kertas atau membuat submission kosong untuk meloloskan booking. Kelengkapan identitas, pembayaran, consent dan guard slot tetap berlaku.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Save / pemilik | DRAFT + version cocok | DRAFT versi berikut |
| Submit / pemilik | pertanyaan wajib lengkap | SUBMITTED immutable |
| Correction / pemilik | SUBMITTED | submission versi baru, supersedes_id |
| Bind booking / server | SUBMITTED belum terikat | appointment_id diisi satu kali |
## Alur gagal dan pemulihan
Autosave stale memberi 409. Submit template yang telah berubah memerlukan review pertanyaan baru. Tidak boleh memasangkan submission milik pasien lain. Draft yang ditinggal tidak mengunci slot atau membuat utang.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /pretests | ClinicalAdministrationController@pretest |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Konseling berikutnya dapat mempunyai keluhan/harapan berbeda; psikolog melihat jawaban milik appointment yang dipilih, bukan selalu jawaban terbaru pasien atau salinan otomatis tanpa konfirmasi.
- Jawaban yang disalin harus dikonfirmasi pasien sebelum menjadi submission baru. Membuka form atau menjadwalkan sesi oleh Admin tidak dihitung sebagai konfirmasi pasien.
- Reschedule appointment yang sama mempertahankan pre-test/snapshot asal tanpa memaksa submission baru. Koreksi jawaban yang memang diminta tetap memakai revisi berjejak, bukan overwrite.
- Jawaban kunjungan pertama tetap terlihat di sesi pertama setelah kunjungan kedua.
- Profiling tidak memuat DASS/scoring diagnosis pada scope aktif.
- API Admin tidak mengembalikan answers JSON.
- Pasien offline tanpa akun tetap bisa dibooking Admin dengan PAPER dan tanpa submission digital. Kertas tidak diunggah, tidak dinilai kelengkapannya oleh Admin, dan langsung ditangani Superadmin.
## Hubungan fitur
F03 profil, F06 binding, F15 consent/privacy.

# F18 — Rangkaian tes dan evaluasi asesmen
## Latar belakang dan tujuan
Asesmen adalah layanan tes, termasuk IQ/kepribadian, yang dapat memiliki beberapa jadwal dalam satu harga paket.
## Aktor dan authorization
Superadmin menetapkan kebutuhan testing/evaluation/follow-up, cakupan paket, hasil dan penutupan. Admin mengatur jadwal lanjutan pada case dan status serah hasil. Pasien melihat jadwal/tagihan miliknya.
## Kolom/isian dan validasi
assessment_case: patient_id, package_version_id, scope_snapshot, status OPEN/IN_PROGRESS/READY_FOR_REPORT/CLOSED dan closed_at. requires_evaluation dibaca dari package_versions serta snapshot scope, bukan kolom kedua di case. Appointment memiliki assessment_case_id, assessment_role TESTING/EVALUATION/FOLLOW_UP dan assessment_sequence unik (bukan sequence kedua). report_delivery: included=true untuk semua Asesmen; status REQUESTED/READY/DELIVERED, delivery_method OFFLINE default, issued_by/delivered_at; isi/file klinis tidak wajib disimpan.
Nama kolom, tipe, nullability, FK dan index mengikuti [kamus database](../DATABASE_ARCHITECTURE.md). actor_id dan waktu keputusan diambil server, bukan dipercaya dari form.
## Alur normal
1. Booking pertama membuat satu case, satu billing account dan satu BASE_SERVICE.
2. Admin menjadwalkan testing. Asesmen Lengkap mengokupansi240 menit default; tidak diam-diam dibelah karena kalender tidak cukup.
3. Admin memasukkan evaluasi/follow-up yang ditentukan owner, setiap appointment punya durasi positif dan slot bebas. Included follow-up tidak menambah harga dasar kedua.
   Status awal follow-up dihitung dari billing account case: DP sudah memenuhi -> CONFIRMED langsung; bukti case masih sah menunggu -> WAITING_VERIFICATION/CONFIRMED_AUTO_SLA sesuai perlindungan. Jangan membuat WAITING_PAYMENT/hold baru yang kedaluwarsa meskipun paket sudah dibayar. Bukti/penerimaan case tidak diunggah ulang untuk tiap pertemuan. Jadwal lanjutan tidak memperpanjang hold/SLA asal; jika case belum memenuhi syarat, Admin menyelesaikan pemeriksaan pembayaran case dahulu. Case CLOSED tidak menerima appointment baru kecuali reopen sah.
4. Asesmen Dasar Rp350.000 mencakup tes dan evaluasi pada waktu berbeda.
5. Owner menyatakan seluruh cakupan selesai; hasil boleh diserahkan offline, Admin mencatat penyerahan administratif tanpa mengunggah isinya.
6. Case CLOSED ketika seluruh langkah wajib terselesaikan atau ada keputusan owner tentang penghentian beralasan. Penutupan layanan terpisah dari status tagihan.
7. Tes baru di luar scope setelah CLOSED membuat case baru; reopen hanya untuk koreksi/penyelesaian cakupan yang belum benar-benar selesai, dengan audit owner.
8. Pembatalan case sebelum testing dimulai melepaskan sisa bagian belum diberikan melalui adjustment berjejak/CLOSED_UNSERVED; kas yang diterima tetap. Jika testing sudah sebagian berlangsung, owner menentukan cakupan belum diberikan sebelum penutupan. Hentikan sisa appointment case atomik, completed/ledger tetap; tidak ada refund.
9. Reopen hanya koreksi salah penutupan yang merujuk event asal, beralasan dan diaudit; bukan membalik write-off atau membuka layanan gratis. Uang/BASE_SERVICE lama tetap, jadwal baru sesuai batas kalender F05 dengan validasi slot. Kebutuhan tes baru setelah case ditutup dengan benar memakai pembelian/case baru.
## Urutan pertemuan dalam case
Scope case menetapkan pertemuan wajib dan dependency-nya. Evaluasi hasil tes secara default bergantung pada TESTING; owner dapat merinci kebutuhan sesuai paket. Jadwal evaluasi tidak boleh mendahului akhir testing prasyarat dan layanan evaluasi hanya dimulai setelah testing wajib COMPLETED, bukan sekadar sudah punya tanggal. Follow-up lain mengikuti dependency yang dinyatakan scope, tidak diasumsikan semua pertemuan identik.
Saat reschedule suatu testing membuat urutan pertemuan yang sudah dijadwalkan menjadi tidak sah, tolak apply dengan409 DEPENDENT_APPOINTMENT_CONFLICT dan tampilkan daftar dampak ke petugas. Admin menyelesaikan jadwal terkait sesuai rencana praktisi dahulu; jangan otomatis menimpa evaluasi, menghapus biaya atau menandai pasien tidak hadir karena urutan yang dibuat sistem sendiri. Hak request tepat waktu tetap disimpan selama penyelesaian.
## Status dan transisi
| Pemicu / aktor | Kondisi awal | Hasil dan efek |
|---|---|---|
| Create / server | paket ASSESSMENT | OPEN + billing account |
| Start testing / operasional | appointment mulai | IN_PROGRESS |
| Scope selesai / owner | kebutuhan wajib selesai | READY_FOR_REPORT |
| Hasil diserahkan/close / owner | cakupan selesai | CLOSED + closed_at |
| Reopen correction / owner | CLOSED, alasan koreksi sah | IN_PROGRESS; histori closed tetap event |
## Alur gagal dan pemulihan
Tidak boleh memasangkan appointment ke dua case atau beda pasien/paket. Appointment tambahan di luar cakupan memerlukan biaya kustom jelas atau case baru; tidak otomatis semua kunjungan berikutnya gratis. Additional time formula Konseling ditolak untuk asesmen. Laporan termasuk tidak boleh ditagih ulang Rp200.000.
## Function dan route web

Implementasi26 Oktober2026; rincian payload dan hak akses pada [kontrak aktual](../WEB_CONTRACT.md).

| Method | Route | Handler |
|---|---|---|
| POST | /admin/appointments/{appointment}/next | BookingController@next |
| POST | /admin/assessment-cases/{case}/report | ClinicalAdministrationController@report |
| POST | /superadmin/assessment-cases/{case}/{action} | ClinicalAdministrationController@caseAction |

Data baca juga tersedia melalui props workspace dan GET /work/data sesuai role. Proses terjadwal memakai practice:tick, practice:purge-files dan queue; tidak membutuhkan endpoint publik tambahan.


## Data, audit dan notifikasi
Simpan entitas terkait dalam transaction untuk perubahan lintas record. Audit action, actor, target, alasan, waktu, request_id dan perubahan yang diizinkan; jangan menyalin password, token atau seluruh jawaban klinis ke log.
Notifikasi dikirim setelah commit melalui outbox; kegagalan kirim tidak membatalkan hasil yang sudah tersimpan. Detail penerima/kanal mengikuti F13; tidak setiap edit profil memerlukan pesan eksternal.
## Acceptance criteria
- Verifikasi pembayaran case mengevaluasi ulang seluruh appointment case yang masih WAITING_PAYMENT/WAITING_VERIFICATION/AUTO_SLA secara atomik sesuai guard, tanpa menimpa status terminal/kehadiran. Clinic scheduling dan payment memakai urutan lock appointment terurut lalu billing, bukan kebalikannya.
- Tes Senin dan evaluasi Rabu tetap satu tagihan Rp350.000, tidak Rp700.000.
- Case dapat CLOSED tanpa file hasil klinis di web.
- Satu review untuk seluruh case; PDF payment cutoff memakai closed_at.
## Hubungan fitur
F04 katalog, F05 durasi, F08 tagihan, F12 review, F15 akses.

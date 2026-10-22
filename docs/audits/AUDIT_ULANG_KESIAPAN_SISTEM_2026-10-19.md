> **ARSIP AUDIT SEBELUM KOREKSI TERAKHIR.** Temuan dan rekomendasi berikut merekam kondisi ketika audit ditulis, bukan kontrak aktif. Lihat [hasil penyelarasan terbaru](AUDIT_PENYELARASAN_ATURAN_2026-10-19.md), [isu aktif](../KNOWN_ISSUES.md), dan keputusan manusia terbaru. Sesi penyelarasan ini hanya docs dan tidak memeriksa aplikasi.

# Audit ulang kesiapan sistem — 2026-10-19

## Status setelah tanggapan developer

Daftar temuan/pertanyaan pada audit awal di bawah adalah snapshot sebelum tanggapan developer. Aturan berikut menggantikannya untuk implementasi:

- Psikoterapi: invoice dan billing account per sesi, treatment plan hanya untuk progres.
- Kalender: jam Admin sama dengan jam klinik; gunakan satu sumber konfigurasi.
- Tidak ada diskon dan tidak ada pengembalian dana. Koreksi input bukan refund.
- SLA dari §15 dokumen ide: setelah 12 jam operasional booking otomatis `CONFIRMED_AUTO_SLA`, payment tetap `PENDING_RECONCILIATION`; kas tidak disahkan otomatis. Cutoff enam jam sebelum sesi tetap aturan terpisah.
- Penanggung jawab default adalah akun yang login. Tidak perlu modul akun/guardian/consent digital kompleks per peserta.
- DP minimum 50%, boleh langsung 100%, metode manual transfer/QR/tunai sudah ada pada §13 dokumen ide.
- Overpayment nyata ditandai sebagai selisih menunggu penyelesaian; refund dan credit tidak boleh disimpulkan otomatis. Keputusan pemakaian selisih masih terbuka.
- Semua paket asesmen mencakup laporan; laporan konseling atas permintaan dikenakan Rp200.000. Contoh lama Rp1.700.000 untuk asesmen dan surat yang sama tidak berlaku.

Source runtime belum berubah. Pertanyaan yang sudah dijawab tidak perlu diajukan ulang hanya karena masih tertulis pada snapshot audit.

## Kesimpulan

Dokumentasi bisnis sekarang sudah mencakup empat aktor, tiga kategori layanan, assessment case, payment ledger, input fleksibel Admin, override jam klinik, dan API/database target. Dokumentasi aman dijadikan baseline desain.

Implementasi belum aman untuk produksi. Source masih React/Vite dengan mock data dan LocalStorage, sedangkan kontrak target membutuhkan Laravel 13, MySQL, transaction, row lock, policy, private storage, ledger, dan audit backend.

## Temuan prioritas

| Prioritas | Temuan | Dampak | Status |
|---|---|---|---|
| P0 | Runtime belum menjadi consumer API Laravel | Data dapat hilang, role/permission hanya simulasi, kontrak docs belum berlaku | Backend dan integrasi belum dikerjakan |
| P1 | Pelunasan runtime masih menerima nominal positif lalu langsung `PAID` | Kurang bayar menghapus saldo | Requirement sudah diperbaiki di docs; kode belum |
| P1 | Reschedule pasien dapat menghasilkan `PENDING + DP_PAID` | Booking buntu pada guard konfirmasi Admin | Requirement target sudah dipisahkan melalui request; kode belum |
| P1 | Appointment dan `isBooked` masih dua sumber okupansi | Slot terlihat kosong tetapi ditolak atau sebaliknya | Backend harus memakai availability transaction sebagai sumber tunggal |
| P1 | Assessment multi-appointment berisiko membuat invoice dasar ganda | Asesmen Dasar Rp350.000 dapat tertagih ulang pada evaluation/follow-up | Docs sekarang memakai satu assessment billing account; backend belum ada |
| P1 | Input `CUSTOM_CHARGE` Admin tanpa policy final | Potensi biaya tidak sah atau tidak dapat dipertanggungjawabkan | Audit, reason, dan actor sudah diwajibkan; approval/limit masih perlu keputusan |
| P1 | Jam klinik dan jam kerja Admin belum pasti hubungannya | Cutoff enam jam dapat salah dan slot terlalu dekat | Kalender dipisahkan di docs; perlu keputusan apakah selalu sama |
| P1 | Hold dan bukti upload sebelum expiry belum memiliki batas akhir verifikasi | Reservasi dapat terkunci tanpa keputusan sampai sesi lewat | Perlu escalation dan expiry final |
| P1 | Satu `patient_id` belum cukup untuk keluarga/anak/remaja | Peserta, wali, consent, dan akses data dapat tertukar | Perlu model participant/guardian |
| P2 | Invoice psikoterapi per sesi belum dipilih bentuknya | Sesi kelima, no-show, dan saldo dapat salah relasi | Perlu pilih invoice per sesi atau ledger induk dengan line item |
| P2 | Overpayment/refund/credit belum final | Saldo negatif atau transaksi koreksi ganda | Perlu policy owner |
| P2 | DP dan metode pembayaran belum seragam antar kategori | UI/API dapat memakai aturan berbeda | Perlu matriks DP dan metode resmi |
| P2 | Telelayanan masuk katalog tetapi `is_bookable=false` | Tidak boleh tampil sebagai tombol booking aktif | Sudah diputuskan dan perlu dijaga di API/UI |

## Skenario yang harus diuji backend

### Kurang bayar

Harga Rp900.000, DP terverifikasi Rp100.000, Admin memasukkan penerimaan Rp1. Backend harus menyimpan transaksi Rp1, saldo menjadi Rp799.999, dan status tidak boleh `PAID`.

### Reschedule dengan DP sah

Booking `CONFIRMED + DP_PAID` mengajukan reschedule. Request reschedule berubah status, tetapi appointment lama tetap valid sampai slot baru berhasil diamankan. Setelah diterapkan, status appointment tetap valid dan `DP_PAID`; Admin tidak boleh dipaksa memverifikasi ulang uang.

### Assessment Dasar terpisah waktu

Harga paket Rp350.000. Appointment `TESTING` dibuat Sabtu, `EVALUATION` dibuat Senin, dan `FOLLOW_UP` dibuat Rabu oleh Admin. Hanya satu `BASE_SERVICE` line item yang muncul. Additional time atau surat formal boleh menambah line item terpisah.

### Additional time

Konseling Offline Rp900.000 menerima tambahan 40 menit. Backend menghitung `ceil(40/15)=3`, tarif per blok Rp225.000, total tambahan Rp675.000. React tidak mengirim nominal final.

### Override jam klinik

Admin mengubah jam buka Sabtu dan perubahan itu menyentuh booking `CONFIRMED`. Backend harus mengembalikan daftar terdampak, tidak memindahkan booking diam-diam, dan menyimpan override dengan `effective_from`, alasan, actor, serta nilai lama/baru.

### Telelayanan

API mengembalikan item Telelayanan sebagai katalog dengan `is_bookable=false`. Endpoint booking harus menolak item tersebut dengan pesan bahwa service belum tersedia.

## Pertanyaan audit awal (historis; lihat status terbaru di atas)

1. Apakah psikoterapi memakai satu invoice/billing account per sesi, atau satu billing account treatment plan dengan line item per sesi? Rekomendasi: satu invoice per sesi karena pembayaran ditetapkan per sesi.
2. Apakah jam kerja Admin selalu sama dengan jam buka klinik? Rekomendasi: default sama, tetapi kalender tetap disimpan terpisah agar SLA dapat berubah tanpa mengubah availability.
3. Apakah `CUSTOM_CHARGE` Admin langsung efektif, atau nominal tertentu/refund harus menunggu review Superadmin? Rekomendasi: biaya kustom biasa langsung tercatat; refund, diskon besar, dan adjustment negatif memerlukan Superadmin.
4. Jika bukti masuk sebelum hold berakhir tetapi belum diverifikasi, kapan escalation/expiry terakhirnya? Rekomendasi: eskalasi otomatis ke Superadmin menjelang sesi dan tidak pernah mengubah uang menjadi terverifikasi otomatis.
5. Untuk pasangan/keluarga dan anak/remaja, siapa pasien utama, siapa peserta, dan siapa yang memberi consent? Rekomendasi: satu responsible patient ditambah participant/guardian records dengan consent per orang.
6. Overpayment menjadi refund, credit ke appointment berikutnya, atau saldo yang menunggu instruksi? Rekomendasi: jangan otomatis; Superadmin memilih refund atau credit melalui event ledger.
7. Apakah DP selain Psikoterapi memakai persentase minimum yang sama, atau tiap paket dapat memiliki policy berbeda? Metode resmi apakah hanya transfer atau juga QRIS/cash?

## Kesenjangan runtime yang terverifikasi secara statis

- `resources/js/context/AppContext.tsx` masih mengubah `paymentStatus` menjadi `PAID` dan `remainingAmount=0` setelah nominal pelunasan positif.
- Guard konfirmasi Admin pada `resources/js/context/AppContext.tsx` belum menerima `DP_PAID` setelah reschedule.
- Booking prototype masih memakai `isBooked` pada slot dan array appointment sekaligus.
- `resources/js/api/patientEndpoints.ts` masih menghitung DP/harga dan membuat payment status lokal, bukan payment ledger backend.
- Cleanup prototype masih menghapus paket `ONLINE_TELE`, sedangkan katalog target menyimpan Telelayanan sebagai item non-bookable.
- Auth service prototype masih menyimpan bearer token di LocalStorage; target produksi memakai Sanctum session cookie.
- Timestamp prototype memakai format lokal/UTC campuran; backend harus menetapkan UTC storage dan display `Asia/Jakarta`.

## Batas audit

Audit ini bersifat pembacaan statis dokumentasi dan source. Tidak menjalankan Git, dev server, build, test, concurrency test, database migration, atau endpoint Laravel. Status “sudah aman” hanya dapat diberikan setelah kontrak ini diimplementasikan dan acceptance scenario di atas lulus.

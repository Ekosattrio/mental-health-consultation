# Keputusan aktif — 24 Oktober 2026

> Histori keputusan Desman. Instruksi Eko 29 Oktober menggantikan bagian yang bertentangan: gunakan [keputusan aktif 29 Oktober](KEPUTUSAN_AKTIF_2026-10-29.md), khususnya FE utama, DP Rp100.000, H+1, lifecycle Psikolog, dan pembatalan setelah lunas.

Dokumen ini menyatukan keputusan langsung Desman dalam percakapan. Lampiran ide, PDF, audit, prototype dan dokumen Eko adalah sumber analisis; label “final” pada dokumen lama tidak mengalahkan koreksi langsung pengguna. Jika ada perbedaan teks turunan, gunakan keputusan ini lalu BUSINESS_RULES dan kamus DATABASE_ARCHITECTURE.

## Jadwal dan pembayaran awal
- Online boleh pada hari yang sama. Earliest start = tambah 180 menit kerja penuh sejak waktu reservasi persisten di server, pada satu kalender klinik/Admin. Jam tutup, istirahat dan hari libur tidak dihitung. Durasi layanan harus muat dalam interval buka dan tidak bentrok.
- Booking pukul 23.55 atau 05.00, buka 08.00–16.00 tanpa jeda: paling cepat 11.00. Booking 10.30, jeda 12.00–13.00: paling cepat 14.30.
- Satu jam untuk kesempatan Admin memeriksa dan dua jam untuk pemberitahuan adalah alasan batas tiga jam, bukan syarat pembayaran harus terverifikasi tiga jam sebelumnya. Pengingat owner T−120 menit memakai waktu nyata.
- Batas bukti awal = min(reservation_created_at + 24 jam, start_at − 120 menit). Ini penjabaran operasional permintaan pengingat setelah pasien membayar. Pada sesi 11.00, bukti awal paling lambat 09.00; upload belum berarti uang terverifikasi. Jika tenggat bukti dan reminder bertepatan, penerimaan bukti yang sah mengantrekan reminder satu kali setelah commit, termasuk ketika scheduler sudah lewat.
- Bukti lengkap tepat tenggat boleh; setelah tenggat tidak mengaktifkan reservasi lama. Transfer nyata tetap direkonsiliasi. Slot yang telah dipakai orang lain tidak direbut kembali.
- Bukti tepat waktu cukup untuk reminder dan perlindungan reservasi, walaupun Admin baru memverifikasi saat kedatangan. SLA 12 jam kerja tetap hanya auto-confirm reservasi, tidak pernah mengesahkan kas.
- Koreksi bukti tidak mengulang deadline/SLA. Bukti ditolak sesudah sesi dimulai tetap dicatat REJECTED; jangan membuat deadline masa lalu menjadi alasan menolak pencatatan fakta. Kedatangan/rekonsiliasi ditangani Admin.

## Offline dan layanan kustom
- Khusus offline oleh Admin boleh hari ini/sekarang pada slot kosong. Janji owner di luar sistem dicatat dengan konteksnya; tidak memerlukan approval object. Cari booking/profil lama sebelum membuat baru. Waktu pencatatan server tidak dimundurkan.
- Admin memeriksa pembayaran saat pasien datang; uang yang nyata diterima wajib dicatat. Bila belum memenuhi ketentuan, Admin menagih di luar aplikasi dan memasukkan nominal aktual, bukan dipaksa sama persis DP atau harga penuh.
- Layanan di luar katalog boleh dicatat sebagai CUSTOM: REQUIRED (berbayar positif), INCLUDED (tertaut billing asal, tanpa biaya dasar/DP baru), atau NOT_REQUIRED (tanpa tagihan/penerimaan, bukan PAID). Nama, durasi, interval dan alasan arahan owner tetap wajib. Layanan ini tetap mengisi kalender praktisi.
- Profiling offline memakai kertas langsung ke Superadmin. Admin tidak membaca, memasukkan atau mengunggah jawaban klinis. CUSTOM nonklinis dapat NONE; layanan klinis offline PAPER.

## Tagihan dan kewenangan
- Pembayaran per sesi psikoterapi, satu invoice per sesi yang dipesan. Minimum empat sesi bukan utang empat sesi otomatis. Sesi belum dipesan tidak ditagih. Plan pertama dapat terbentuk pada booking pertama, tanpa approval klinis digital tambahan.
- Pembayaran awal minimal 50% dari harga final paket mengikuti ide Desman, bagian DP. Angka flat100000 pada preview/dokumen Eko tidak menggantikan instruksi pengguna tanpa persetujuan. Default owner_settings adalah PERCENT dengan5000 basis poin. Schema juga mendukung FIXED sebagai opsi konfigurasi owner di masa depan; parameter dan hasil minimum disnapshot agar booking lama tetap. Sesi lanjutan/reschedule tidak meminta DP awal lagi.
- Prabayar sukarela yang disepakati pada plan disimpan sebagai satu penerimaan, kemudian dialokasikan ke invoice yang benar-benar terbit. Alokasi bukan uang masuk kedua, bukan wallet lintas plan. Tidak ada penagihan otomatis sesi belum dipesan.
- Sebelum layanan dimulai, pembatalan atau berakhirnya hak reschedule melepaskan sisa yang belum diberikan: uang nyata tetap tercatat, tidak dikembalikan. Gunakan adjustment immutable dan CLOSED_UNSERVED, bukan menimpa invoice/kas atau menyebutnya lunas karena pembayaran. Pada rangkaian yang sudah dilayani sebagian, bagian yang benar-benar diberikan tetap ditagih; owner menentukan bagian belum diberikan dengan alasan.
- Tidak ada refund/wallet otomatis. Lebih bayar nyata diselesaikan di luar sistem; jumlah aktual tetap utuh pada ledger. Koreksi salah input memakai reversal + replacement, bukan menghapus penerimaan.
- Admin melihat harga/diskon/total dan nominal bukti/input aktif. Saldo/agregat penerimaan, receipt penuh, klinis dan laporan kas tetap tidak diberikan ke Admin. Superadmin pemilik laporan keuangan. Petugas input/verifikasi pembayaran pada pembagian preview saat ini adalah Admin.
- Promo global dan diskon individual beralasan boleh. Paket standar net positif; tanpa biaya memakai CUSTOM NOT_REQUIRED, bukan diskon 100% tersamar. Katalog versi lama tidak ditulis ulang.

## Paket, lifecycle dan notifikasi
- Tiga kategori COUNSELING, ASSESSMENT, PSYCHOTHERAPY. Harga/benefit paket mengikuti PDF dan F04. Asesmen adalah tes, termasuk laporan asesmen, dapat beberapa pertemuan dalam satu harga/case. Asesmen Lengkap menahan 240 menit; deskripsi 2–4 jam. Laporan formal konseling tambahan Rp200.000 dicatat Admin.
- Additional time otomatis hanya Konseling: ceil(total menit tambahan satu usaha sesi / 15), tarif 25% per blok. Basis harga normal/akhir promo dipilih Admin/Superadmin pada versi paket. Revisi menagih selisih, bukan membulatkan setiap input.
- Reschedule mempunyai request tersendiri; kelayakan dihitung requested_at. Maksimal tiga APPLIED asal pasien per appointment, normal sebelum T−2 jam; setelah NO_SHOW sampai akhir WIB tanggal sesi + empat hari. Perubahan klinik tidak memakan kuota. Saat APPLIED, slot lama dilepas atomik dan histori lama dipertahankan.
- Setelah NO_SHOW, usaha lama tetap pada event, usaha jadwal pengganti kembali aktif dengan attempt_number baru; kas/DP asal tidak dibuat ulang.
- Jam klinik berubah: publish versi kalender + daftar dampak + request asal CLINIC + notifikasi dalam satu transaction. Appointment terdampak diberi requires_reschedule; tidak digeser diam-diam atau dianggap no-show karena klinik menutup jam.
- Google Meet dimasukkan Admin setelah pemesanan paket Telelayanan; outbox Baileys otomatis mengirim ke nomor WA yang dikonfirmasi. Tidak membuat ruang Google otomatis. Gagal kirim tidak membatalkan booking.
- Retensi file operasional satu tahun; hak unduh PDF pasien tujuh hari setelah terminal layanan/case. Transaksi/audit tidak dihapus otomatis setahun.

## Batas tahap pekerjaan
Tahap ini dokumentasi, migrations, models, enum, constraint dan verifikasi database. Controller/action/policy, pekerjaan scheduler/queue, upload, Baileys dan penyambungan React Eko ke database memerlukan tahap berikutnya setelah konfirmasi pengguna. Preview LocalStorage bukan bukti backend sudah berjalan.

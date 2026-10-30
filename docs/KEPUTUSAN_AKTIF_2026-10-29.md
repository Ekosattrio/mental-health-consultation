# Keputusan aktif Eko — 29 Oktober 2026

Instruksi langsung Eko pada sesi ini menggantikan ketentuan yang bertentangan dalam keputusan Desman24Oktober dan dokumen turunannya. Penegasan terbaru tentang role Admin, libur, carousel dan kontak ada pada [keputusan30Oktober](KEPUTUSAN_AKTIF_2026-10-30.md).

- Seluruh tampilan utama menggunakan komponen FE Eko: navbar, footer, login modal, dashboard Pasien/Admin/Psikolog, tab, tabel, dialog, katalog, dan formulir. Workspace alternatif Desman tidak menjadi halaman dashboard utama.
- Laravel/Inertia, session, CSRF, validasi, penguncian transaksi, ledger, file privat, PDF, serta pemeriksaan versi dari backend tetap digunakan. Data demo/LocalStorage tidak dipindahkan ke database praktik.
- DP awal tetap Rp100.000 dan mengurangi biaya layanan. Bila harga akhir kurang dari Rp100.000, pembayaran awal dibatasi sebesar harga akhir agar tidak memaksa lebih bayar. Tidak ada DP 50%. Pembayaran penuh di awal tetap diperbolehkan.
- Sesi lanjutan dalam rangkaian yang sama dan reschedule tidak menarik DP lagi. Booking baru setelah rangkaian selesai menjadi episode/tagihan baru dengan DP awal baru.
- Booking, booking bantuan Admin, layanan kustom, penjadwalan sesi berikutnya, dan tujuan reschedule minimal H+1 berdasarkan Asia/Jakarta. Tidak ada pengecualian same-day untuk Admin/Psikolog.
- Psikoterapi Rp500.000 per sesi, rangkaian awal empat sesi. Psikolog menjadwalkan sesi berikutnya setelah sesi sebelumnya selesai. Tidak ada tambah jatah/sesi kelima pada plan lama; setelah empat sesi pasien memesan kembali.
- Invoice hanya untuk sesi yang benar-benar dijadwalkan. Prabayar rangkaian dialokasikan ke invoice dengan FIFO tanpa menggandakan penerimaan. Proyeksi empat sesi tidak otomatis menjadi utang empat sesi saat pembatalan.
- Pelunasan paling lambat hari sesi terakhir. Bila fakta sesi telah selesai tetapi pembayaran belum lengkap, penutupan administratif tetap menunggu pelunasan. Keterangan terbayar, sisa, dan prabayar mengikuti ledger server.
- Pembayaran pasien dicatat/diverifikasi Admin. Nominal penerimaan tersimpan, saldo, dan laporan kas tidak diberikan kembali pada DTO Admin. Psikolog/pasien berwenang dapat membaca rincian sesuai aksesnya.
- Mulai/selesai sesi, no-show, pembatalan, dan penghentian layanan merupakan keputusan manual Psikolog. Admin dapat membantu reschedule. Pembatalan/penghentian mensyaratkan seluruh tagihan yang sudah terbentuk lunas; invoice dan uang masuk tidak dihapus atau dikurangi untuk meloloskan pembatalan.
- Pasien dapat mengajukan reschedule; jadwal lama tetap berlaku sampai perubahan diterapkan. Batas tiga perubahan asal pasien, batas normal T−2 jam, dan jendela empat hari setelah no-show dipertahankan. Perubahan klinik/owner tidak menghabiskan kuota pasien. Tujuan semua perubahan tetap H+1.
- Lewatnya SLA verifikasi tidak otomatis mengonfirmasi jadwal. Lewatnya jendela no-show hanya meminta tinjauan psikolog, tidak membatalkan layanan otomatis. Reservasi awal yang belum dibayar tetap dapat kedaluwarsa sesuai tenggat yang ditampilkan.
- Catatan, badge, fasilitas, dan diskon layanan disimpan bersama versi katalog. Harga booking lama tidak mengikuti perubahan katalog baru.
- Git dikelola developer. Dev server dan build tidak dijalankan AI. TypeScript checker dan tes integrasi terfokus diizinkan pada sesi ini.

Pemetaan kode, alur, dan batas verifikasi: [integrasi FE Eko](INTEGRASI_FE_EKO_2026-10-29.md).

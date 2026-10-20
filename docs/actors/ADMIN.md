# Admin — petugas administrasi dan pembayaran
## Latar belakang dan tujuan
Pekerja membantu kondisi operasional nyata: pasien datang, jadwal berubah, uang diperiksa dan biaya dicatat.
Tujuan: melayani pasien tanpa membuat data ganda atau kehilangan jejak transaksi.
## Dapat melakukan dan alasannya
- Daftar pasien, cari/verifikasi identitas, hubungkan akun setelah pemeriksaan, buat walk-in same-day tanpa approval object.
- Untuk pasien offline, pilih profiling_mode=PAPER tanpa pre-test digital. Pasien mengisi kertas dan menyerahkannya langsung ke Superadmin; Admin tidak menginput, membaca atau mengunggah jawaban dan tidak menandainya SUBMITTED digital.
- Kelola jam klinik/slot/kuota dan daftar pasien terdampak; bantu jadwal tes/evaluasi/terapi sesuai rencana praktisi.
- Lihat harga, diskon dan total tagihan; cek bukti/nominal input aktif, approve/reject serta catat uang nyata.
- Saat pasien datang, wajib cek pembayaran; jika belum memenuhi DP, tagih langsung di luar sistem lalu catat aktual.
- Catat check-in/mulai/selesai/no-show berdasarkan fakta dan guard waktu; tidak menulis interpretasi klinis.
- Tambah biaya/promo/diskon khusus beralasan; cetak tagihan proyeksi Admin tanpa saldo, export jadwal, moderasi review.
- Kelola harga paket dan pilih dasar additional time Konseling (normal/setelah promo) pada versi paket untuk booking baru; tidak mengubah tarif transaksi lama.
## Batas akses
Untuk Telelayanan: menghubungi pasien, memasukkan/memperbaiki link Google Meet dan nomor WA pada booking, memantau pengiriman otomatis, mengirim ulang beralasan, serta mencatat kehadiran online sesuai F20. Kemampuan ini juga dimiliki Superadmin.
**Tidak melihat saldo pasien, aggregate paid, receipt penuh atau pendapatan/pengeluaran/surplus praktik.** Tidak mengakses jawaban pre-test/hasil klinis, mengubah role atau menghapus audit. Pengetahuan nominal dari bukti bukan akses laporan keuangan.
## Layar, data dan perjalanan
Antrean verifikasi -> detail administratif -> kedatangan -> pencatatan biaya/pembayaran -> jadwal/reschedule -> export. Lihat journeys/ADMIN_OPERATIONS.md, F08,F10,F17.
Aksi/error/field teknis mengikuti features/, WEB_CONTRACT.md dan ROLES_PERMISSIONS.md. UI harus menampilkan loading, validasi, konflik versi/slot dan hasil server; tidak menampilkan aksi yang permission-nya tidak dimiliki.

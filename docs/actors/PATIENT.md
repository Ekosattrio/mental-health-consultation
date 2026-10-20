# Pasien — akun dan penanggung jawab
## Latar belakang dan tujuan
Akun login memesan untuk diri sendiri atau pasien aktual lain yang diurusnya.
Tujuan: mendapat jadwal yang pasti, informasi harga/deadline jelas dan riwayat yang utuh.
## Dapat melakukan dan alasannya
- Mengelola profil pasien yang diakses dan satu penanggung jawab, tidak perlu membuat akun tiap peserta.
- Melihat harga/promosi, memilih paket dan interval valid, mengisi profiling dan consent.
- Langsung booking Psikoterapi pertama; sistem mengelompokkan empat unit administratif, tetapi hanya sesi pertama dibuatkan jadwal/tagihan. Admin mengatur jadwal lanjutan sesuai praktisi; sesi yang belum dipesan tidak menjadi utang.
- Mengirim/memperbaiki bukti, melihat riwayat pembayaran dan saldo sendiri.
- Mengajukan reschedule berdasarkan waktu submit, memilih ulang jadwal jika klinik berubah.
- Mengunduh dokumen dalam masa akses, memberi review setelah layanan selesai.
## Batas akses
Untuk Telelayanan, mengonfirmasi nomor WA pada booking, menerima link Google Meet dan pembaruan jadwal dari Admin melalui sistem, lalu mengikuti sesi online. Akses link hanya booking yang diurusnya; klik link bukan check-in otomatis. Detail F20.
Tidak memverifikasi uang sendiri, mengubah harga/role/status klinis atau membuka pasien lain. Upload bukan lunas. Tidak ada refund atau credit otomatis.
## Layar, data dan perjalanan
Dashboard -> profil -> katalog -> booking -> payment -> jadwal/riwayat -> receipt/review. Asesmen menampilkan rangkaian pertemuan satu case; psikoterapi menampilkan tagihan per sesi. Lihat journeys/PATIENT_BOOKING.md.
Aksi/error/field teknis mengikuti features/, WEB_CONTRACT.md dan ROLES_PERMISSIONS.md. UI harus menampilkan loading, validasi, konflik versi/slot dan hasil server; tidak menampilkan aksi yang permission-nya tidak dimiliki.

# Superadmin — owner dan praktisi
## Latar belakang dan tujuan
Satu stakeholder pemilik praktik sekaligus psikolog/dokter sesuai konteks bisnis; enum teknis PSYCHOLOGIST.
Tujuan: menentukan layanan klinis dan kebijakan praktik serta menelusuri kas/data operasional.
## Dapat melakukan dan alasannya
- Seluruh kemampuan operasional Admin.
- Kelola harga/promo dan dasar tarif tambahan Konseling pada versi paket; kemampuan ini juga diberikan kepada Admin sesuai kontrak akses aktif.
- Membaca profiling dan menentukan kebutuhan klinis, scope asesmen dan rencana psikoterapi.
- Menerima kertas profiling pasien offline secara langsung; jawaban kertas tidak melalui input/unggahan Admin dan tidak wajib disalin ke aplikasi.
- Menutup/reopen case beralasan, memperpanjang/menghentikan plan.
- Melihat saldo/ledger lengkap, penerimaan-pengeluaran-surplus dan export finansial.
- Mengelola akun petugas, versi kebijakan, audit dan konfigurasi operasional.
## Batas akses
Akses tinggi tetap memerlukan guard waktu/relasi, audit dan koreksi berjejak. Tidak menimpa receipt/invoice terbit, menghapus uang nyata atau membuat dua appointment overlap.
## Layar, data dan perjalanan
Dashboard -> kalender/pasien berikut -> profiling -> layanan/rencana -> laporan/expense -> audit/config. Lihat journeys/SUPERADMIN_OPERATIONS.md.
Aksi/error/field teknis mengikuti features/, WEB_CONTRACT.md dan ROLES_PERMISSIONS.md. UI harus menampilkan loading, validasi, konflik versi/slot dan hasil server; tidak menampilkan aksi yang permission-nya tidak dimiliki.

# Guest — calon pasien
## Latar belakang dan tujuan
Pengunjung belum login, ingin mengenal praktik sebelum mendaftar.
Tujuannya memahami layanan dan cara membuat janji.
## Dapat melakukan dan alasannya
- Membaca profil/kredensial praktik, lokasi, jam, kontak administrasi dan FAQ.
- Melihat tiga kategori dan deskripsi paket tanpa nominal, serta review approved.
- Mendaftar/login email/password atau Google agar dapat melihat harga dan memesan.
## Batas akses
Tidak menerima harga/promo numerik/DP, data pasien, slot beridentitas, draft CMS, pre-test atau laporan keuangan.
## Layar, data dan perjalanan
Landing -> layanan -> CTA login/register -> profil. Lihat journeys/GUEST_TO_PATIENT.md; F01,F02,F04,F12,F16.
Aksi/error/field teknis mengikuti features/, WEB_CONTRACT.md dan ROLES_PERMISSIONS.md. UI harus menampilkan loading, validasi, konflik versi/slot dan hasil server; tidak menampilkan aksi yang permission-nya tidak dimiliki.

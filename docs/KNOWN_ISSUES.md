# Known Issues

## Saat Ini

- Belum ada backend dan database nyata.
- Auth masih berupa simulasi client-side.
- Data tersimpan di LocalStorage, sehingga tidak aman untuk data produksi.
- Data klinis belum memiliki authorization server-side.
- Sisa data LocalStorage browser lama mungkin masih menyimpan state dari versi sebelum chat dihapus; reset data demo/clear storage jika tampilan tidak berubah.
- Pre-test masih memakai struktur data lama `IntakeForm` di TypeScript dan LocalStorage, walaupun label dan alurnya sudah diubah menjadi pre-test.
- Data mock legacy untuk test psikolog/DASS masih ada di layer data/model lama, tetapi UI portal pasien sudah tidak menampilkan test psikolog tambahan. Saat backend dibuat, tabel/endpoint legacy ini perlu diputuskan: dihapus atau disimpan sebagai fitur nonaktif.
- Payment status masih simulasi.
- Payment sudah disimulasikan sebagai DP Flat Rp 100.000 (biaya administrasi), pencatatan nama pemilik rekening pengirim (`transferSenderName`), dan pelunasan di klinik, tetapi verifikasi berkas transfer masih berupa simulasi client-side tanpa storage bucket cloud / payment gateway nyata.
- Invoice/kwitansi masih berupa tampilan frontend dari data appointment; backend produksi perlu menyimpan invoice sebagai record permanen.
- Consent/privacy sudah diwajibkan di UI booking, tetapi belum tersimpan sebagai audit record backend.
- Notifikasi WhatsApp/email belum ada karena membutuhkan backend dan provider resmi.
- Export data klinis masih client-side CSV; produksi perlu role protection, audit log, dan pembatasan data yang diekspor.
- Booking belum punya mekanisme locking slot server-side yang aman dari double booking.
- Role permission frontend sudah diarahkan ke hierarki terbaru, tetapi belum ada authorization server-side.
- File `tsc_errors.txt` ada di root dan perlu dicek untuk mengetahui error TypeScript historis dari repo.
- Folder `dist/` pernah terbentuk dari build sebelumnya dan diabaikan oleh `.gitignore`.

## Risiko Produk

- Fitur psikologi harus berhati-hati agar tidak dianggap diagnosis otomatis.
- Crisis/hotline information harus diverifikasi sebelum dipakai produksi.
- Nomor STR/SIP psikolog butuh validasi resmi pada implementasi nyata.

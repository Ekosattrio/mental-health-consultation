# Known Issues

## Saat Ini

- Belum ada backend dan database nyata.
- Auth masih berupa simulasi client-side.
- Data tersimpan di LocalStorage, sehingga tidak aman untuk data produksi.
- Data klinis belum memiliki authorization server-side.
- UI masih memiliki konsep chat, padahal requirement terbaru menyebut tidak ada konsultasi online/chat via web.
- Intake form masih ada di prototype, padahal requirement terbaru ingin diganti menjadi pre-test sebelum booking.
- Payment status masih simulasi.
- Payment belum mendukung skema DP 50% dan pelunasan 50%.
- Booking belum punya mekanisme locking slot yang aman dari double booking.
- Role permission prototype belum sesuai hierarki terbaru: psikolog/super admin/pengelola harus menjadi role tertinggi.
- File `tsc_errors.txt` ada di root dan perlu dicek untuk mengetahui error TypeScript historis dari repo.
- Folder `dist/` pernah terbentuk dari build sebelumnya dan diabaikan oleh `.gitignore`.

## Risiko Produk

- Fitur psikologi harus berhati-hati agar tidak dianggap diagnosis otomatis.
- Crisis/hotline information harus diverifikasi sebelum dipakai produksi.
- Nomor STR/SIP psikolog butuh validasi resmi pada implementasi nyata.

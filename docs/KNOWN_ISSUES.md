# Known Issues

## Saat Ini

- Belum ada backend dan database nyata.
- Auth masih berupa simulasi client-side.
- Data tersimpan di LocalStorage, sehingga tidak aman untuk data produksi.
- Data klinis belum memiliki authorization server-side.
- Sisa data LocalStorage browser lama mungkin masih menyimpan state dari versi sebelum chat dihapus; reset data demo/clear storage jika tampilan tidak berubah.
- Pre-test masih memakai struktur data lama `IntakeForm` di TypeScript dan LocalStorage, walaupun label dan alurnya sudah diubah menjadi pre-test.
- Payment status masih simulasi.
- Payment sudah disimulasikan sebagai DP 50% dan pelunasan 50%, tetapi belum ada upload file/backend/payment gateway nyata.
- Booking belum punya mekanisme locking slot server-side yang aman dari double booking.
- Role permission frontend sudah diarahkan ke hierarki terbaru, tetapi belum ada authorization server-side.
- File `tsc_errors.txt` ada di root dan perlu dicek untuk mengetahui error TypeScript historis dari repo.
- Folder `dist/` pernah terbentuk dari build sebelumnya dan diabaikan oleh `.gitignore`.

## Risiko Produk

- Fitur psikologi harus berhati-hati agar tidak dianggap diagnosis otomatis.
- Crisis/hotline information harus diverifikasi sebelum dipakai produksi.
- Nomor STR/SIP psikolog butuh validasi resmi pada implementasi nyata.

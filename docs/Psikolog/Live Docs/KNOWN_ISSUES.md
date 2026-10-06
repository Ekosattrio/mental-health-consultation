# Known Issues

## Saat Ini

- Belum ada backend dan database nyata.
- Auth masih berupa simulasi client-side.
- Data tersimpan di LocalStorage, sehingga tidak aman untuk data produksi.
- Data klinis belum memiliki authorization server-side.
- Migrasi LocalStorage cleanup v5 membersihkan state test/SOAP, field appointment lama, tarif profil lama, dan paket telelayanan. State lama lain yang tidak dikenali masih mungkin memerlukan reset data demo.
- Pre-test masih memakai struktur data lama `IntakeForm` di TypeScript dan LocalStorage, walaupun label dan alurnya sudah diubah menjadi pre-test.
- Modul, type, model, controller, endpoint, dan seed test psikolog/DASS sudah dihapus dari source aktif. Hanya catatan historis pada changelog lama yang masih menyebut implementasi tersebut.
- Payment status masih simulasi.
- Payment sudah disimulasikan sebagai DP yang mengikuti konfigurasi paket, pencatatan nama pemilik rekening pengirim (`transferSenderName`), dan pelunasan di klinik, tetapi verifikasi berkas transfer masih berupa simulasi client-side tanpa storage privat / payment gateway nyata.
- Pelunasan aktual sudah disembunyikan dari UI admin setelah submit, tetapi masih tersimpan di LocalStorage dan dapat diperiksa melalui developer tools. Privasi role yang sebenarnya baru aman setelah backend memakai policy dan serializer admin yang tidak mengembalikan nominal.
- Invoice/kwitansi masih berupa tampilan frontend dari data appointment; backend produksi perlu menyimpan invoice sebagai record permanen.
- Consent/privacy sudah diwajibkan di UI booking, tetapi belum tersimpan sebagai audit record backend.
- Notifikasi WhatsApp/email belum ada karena membutuhkan backend dan provider resmi.
- Export data klinis masih client-side CSV; produksi perlu role protection, audit log, dan pembatasan data yang diekspor.
- Frontend sudah memakai Web Locks API lintas-tab dengan fallback lock LocalStorage per psikolog/tanggal, sinkronisasi state, dan validasi ulang booking/reschedule/sesi lanjutan. Mekanisme ini mengurangi double submit tetapi belum menggantikan locking server-side/database transaction untuk produksi.
- Service CRUD Laravel sudah tersedia di `src/services/api/`, tetapi `AppContext` masih memakai facade mock/LocalStorage. Integrasi runtime baru dapat dilakukan setelah response API backend tersedia dan sesuai kontrak.
- Error CSP `script-src 'none'` saat preview di simulator/iframe bukan berasal dari konfigurasi project saat ini. `index.html` tidak memasang CSP tersebut; Vite membutuhkan script `@vite/client` dan `src/main.tsx`, sehingga parent simulator yang memaksa `script-src 'none'` akan memblokir aplikasi. Buka app di browser normal/preview tanpa CSP tersebut atau ubah CSP parent preview.
- Role permission frontend sudah diarahkan ke hierarki terbaru, tetapi belum ada authorization server-side.
- File `tsc_errors.txt` tetap ada sebagai artefak historis; kondisi source terbaru telah diperiksa dengan `npx tsc --noEmit` dan lolos 0 error pada 2026-10-06.
- Folder `dist/` pernah terbentuk dari build sebelumnya dan diabaikan oleh `.gitignore`.
- AI tidak menjalankan build atau dev server. Belum tersedia automated unit/integration/E2E test; verifikasi terbaru terbatas pada TypeScript checker dan audit statis.

## Risiko Produk

- Fitur psikologi harus berhati-hati agar tidak dianggap diagnosis otomatis.
- Crisis/hotline information harus diverifikasi sebelum dipakai produksi.
- Nomor STR/SIP psikolog butuh validasi resmi pada implementasi nyata.

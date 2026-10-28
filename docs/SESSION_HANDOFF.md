# Serah terima implementasi — 26 Oktober2026

Implementasi lokal Laravel13 + Inertia3 + React19 telah diselesaikan sesuai izin pengguna untuk melanjutkan seluruh backend dan integrasi tampilan. WhatsApp dan Google Identity Services/One Tap sudah diimplementasikan sesuai izin lanjutan pengguna; aktivasi provider tetap bergantung pairing ponsel dan OAuth Client ID nyata. Tidak ada operasi Git atau deployment VPS publik yang dilakukan.

Mulai dari [hasil implementasi untuk Eko](IMPLEMENTASI_WEB_2026-10-26.md), [akun awal](AKUN_AWAL_DAN_CARA_MASUK.md), [kontrak route aktual](WEB_CONTRACT.md), [aturan aktif](KEPUTUSAN_AKTIF_2026-10-24.md) dan [operasional satu VPS](OPERASIONAL_VPS_DAN_INTEGRASI.md).

## Hasil implementasi

- Kalender bersama klinik/Admin, lead180menit kerja, booking online/offline/custom, preview dan transaksi idempotent.
- Ledger penerimaan, verifikasi aktual, koreksi reversal, alokasi FIFO, diskon, biaya tambahan dan invoice/receipt PDF.
- Pengajuan/penerapan reschedule atomik, histori attempt/no-show, pembatalan bagian belum diberikan, terapi per sesi dan case asesmen beberapa pertemuan.
- Profil administrasi, profiling digital berversi, jalur kertas offline, consent, session revocation, dan DTO role yang menutup saldo/klinis dari Admin.
- CMS berversi dengan draft/preview/publish, logo/foto/hero/CTA/FAQ/footer, informasi workspace, review/moderasi, tutorial berversi beserta tour/progres/replay.
- File privat, masa unduh, retensi, laporan kas berbasis penerimaan/as_of, pengeluaran, export snapshot CSV/XLSX dan scheduler/outbox/queue.
- Google Meet manual oleh Admin dengan nomor penerima dan versi link; adapter Baileys bertanda tangan HMAC, jurnal idempotency dan retry. Pengirim pengguna telah dikonfigurasi, status koneksi privat dan pairing tersedia untuk Superadmin; pengiriman nyata menunggu penautan ponsel.

UI operasional menggunakan resources/js/pages/Practice/Workspace.tsx dan resources/js/practice/. Komponen beranda Eko dipakai sebagai presentasi. Preview LocalStorage dimatikan pada konfigurasi lokal dan default; bukan jalur operasional.

## Bukti verifikasi terakhir

| Pemeriksaan | Hasil |
|---|---|
| Integrasi domain MySQL |40tes,239assertion lulus |
| Konkurensi dua proses PHP |Satu CREATED, satu CONFLICT untuk interval yang sama |
| Fondasi schema |34pemeriksaan, rollback/remigrate MySQL terisolasi lulus |
| Smoke Laravel |2tes lulus |
| Regresi frontend/integritas import |87tes lulus |
| Bridge WhatsApp dengan provider palsu |4tes lulus; tidak mengirim ke akun nyata |
| TypeScript |npm run lint lulus |
| Build produksi |npm run build lulus |
| Parser PHP8.3.30 |227file lulus |
| Dokumentasi |146Markdown, tanpa link lokal/model hilang atau marker konflik aktif |
| Browser lokal |Login Admin/Superadmin/Pasien; kalender, CMS, finance, booking, tour pertama; tanpa console error pada pemeriksaan |
| Layout ponsel |Lebar konten375 sesuai viewport375 setelah perbaikan header |

Tes domain/fondasi membuat database acak dengan pola jiwasehat_schema_test_... dan menghapus database uji miliknya sendiri. Bukan migrate:fresh/reset database aplikasi. Tes frontend lama sebagian masih menguji prototype; bukti aturan server berasal dari suite MySQL.

## Temuan penting yang sudah diperbaiki

Mutex yang diperoleh sesudah ordinary read masih memungkinkan snapshot InnoDB lama melewatkan booking pesaing. Uji dua proses membuktikannya. Transactions sekarang memperoleh mutex praktik sebelum ordinary read pertama, lalu membaca ulang akses aktor; scheduler mengambil urutan yang sama. Pengujian sesudah perbaikan hanya menerima satu booking.

Kunci outbox penerimaan sekarang mencakup ID pembayaran agar DP/cicilan berbeda tidak berbagi notifikasi. Koreksi kas historis mempertahankan penutupan plan dan tidak bertabrakan dengan plan baru yang telah sah. Penutupan asesmen tidak memotong hak no-show atau menghidupkan billing yang sudah dilepas. Query rollback generated guard disesuaikan dengan ONLY_FULL_GROUP_BY.

## Kondisi database aplikasi

Database lokal jiwasehat:59migration,57tabel,113FK,175CHECK dan46trigger. Akun awal pengguna telah dibuat:3akun dan1profil pasien administratif. Tidak memasukkan appointment, penerimaan atau jawaban klinis demo ke database aplikasi. APP_KEY lama dipertahankan. Publikasi materi panduan/CMS dalam tes hanya terjadi pada database uji terisolasi.

## Batas aktivasi

Nomor pengirim pengguna +628558589536 telah dikonfigurasi, bridge terhubung hingga NEEDS_PAIRING. Nomor tujuan owner yang diberikan pengguna telah disimpan melalui profil privat Superadmin dan dapat diubah di website. Pengguna memilih menautkan ponsel sendiri melalui menu Superadmin nanti. Google One Tap/SSO sudah diimplementasikan, namun Client ID/domain produksi belum diberikan; Client Secret hanya untuk redirect/People API opsional. Lihat [integrasi WhatsApp dan Google](INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md). Identitas praktik, rekening, domain, SMTP dan backup/restore produksi perlu konfigurasi operator pada lingkungan nyata. Paket asesmen tanpa durasi pasti pada sumber belum bookable sampai diatur petugas; jangan menebak durasi tes. UAT stakeholder, beban produksi, pengiriman provider nyata dan pemulihan backup produksi belum diklaim.

Pekerjaan berikutnya mengikuti kebutuhan pengguna/UAT, bukan menunggu izin tahap controller yang sudah disetujui. Jangan mengembalikan H+1/DP flat100000 dari preview lama. Git tetap dikelola developer.

## Bukti tambahan integrasi provider

- Token Google diuji dengan tanda tangan RSA/JWKS: valid diterima, signature palsu, aud/iss/exp/nonce salah dan email belum terverifikasi ditolak. SDK google/auth memerlukan phpseclib3 untuk utilitas AccessToken; dependensi produksi telah dilengkapi.
- Sub Google tertaut memakai akun sama, email lokal harus dibuktikan dengan password, role publik tidak dapat dinaikkan, nomor/alamat disimpan pada registrasi. Akun Google-only tetap password_hash=null; getAuthPassword mengembalikan string kosong untuk kontrak recaller Laravel, tanpa mengaktifkan kata sandi kosong. Tes pemulihan remember cookie serta pencabutannya lulus.
- Nomor privat owner diperiksa dari website, perubahan profil tersimpan dan terbaca oleh status bridge; tidak mengubah kontak publik. Reminder pasien opt-in, dedupe, withdrawal, stale reminder dan payload retry diuji. ACK provider wajib; payload disimpan terenkripsi.
- Browser lokal: panel Google menunggu Client ID, login owner, pengaturan koneksi WhatsApp dan penyimpanan nomor tujuan diuji; tidak ada console error. Bukti .codex-tmp/ui-whatsapp-integration.png.
- Migration tambahan diterapkan ke jiwasehat tanpa menghapus data: tetap3akun,1profil administratif,0appointment,0transaksi pembayaran. Fondasi rollback/remigrate34pemeriksaan lulus pada DB uji.
- Bridge Node lokal dijalankan pada loopback3210, Laravel sementara pada127.0.0.1:8026 untuk akses menu. Worker/scheduler belum disupervisi sebagai layanan permanen lokal/VPS; setelah pairing operator perlu menjalankan proses sesuai panduan. Tidak ada pesan nyata, kode pairing, akun Google nyata atau secret yang dipublikasikan.

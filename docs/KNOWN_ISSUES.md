# Batas aktivasi dan temuan aktif

Backend dan workspace operasional telah diimplementasikan; lihat [hasil perubahan](IMPLEMENTASI_WEB_2026-10-26.md) serta [bukti verifikasi](SESSION_HANDOFF.md). Pernyataan tahap24 Oktober bahwa controller belum dibuat telah digantikan.

- Google Identity Services/One Tap dan optional People API sudah diimplementasikan. OAuth Client ID, domain produksi dan secret opsional belum diberikan; login provider nyata belum diuji.
- WhatsApp memakai nomor pengirim pengguna +628558589536 dan bridge nyata. Pemilik masih harus menautkan ponsel; nomor tujuan owner telah disimpan pada profil privat Superadmin dan dapat diubah. Kode/status pairing tersedia khusus Superadmin. Pengiriman nyata belum diklaim. Lihat [panduan WhatsApp dan Google](INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md).
- Identitas praktik, rekening, domain, SMTP dan deployment VPS tetap konfigurasi operator. Email lokal masuk log, bukan inbox pasien. Backup produksi belum diaktifkan ke tujuan penyimpanan nyata.
- Paket asesmen dengan durasi sumber yang belum pasti masuk katalog tetapi belum bookable sampai diatur Admin/Superadmin. Jangan menebak durasi tes.
- Preview Eko tetap menyimpan perilaku historis dan dimatikan default; pengujian prototype bukan pengujian transaksi server.
- Pengujian lokal tidak menjamin aplikasi bebas bug atau sudah lolos UAT stakeholder. Pengiriman nyata, beban produksi dan pemulihan backup produksi belum diklaim.

Temuan lama tersimpan pada audits/ dan archive/. Jangan memindahkan data LocalStorage/demo ke database aplikasi. Gunakan pengujian MySQL terisolasi untuk perubahan aturan berikutnya.

Pengguna memilih pairing mandiri nanti. Bridge telah diverifikasi NEEDS_PAIRING; worker/scheduler masih harus dijalankan/disupervisi agar antrean dan pengingat otomatis bekerja setelah penautan. Google membutuhkan Client ID; tidak cukup hanya login akun Google pada browser. Rincian [integrasi WhatsApp dan Google](INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md).

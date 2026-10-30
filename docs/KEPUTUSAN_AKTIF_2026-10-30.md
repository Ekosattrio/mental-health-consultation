# Penegasan Eko - 30 Oktober 2026

Melengkapi [keputusan29Oktober](KEPUTUSAN_AKTIF_2026-10-29.md). Pembatasan role pada dokumen ini menggantikan izin Admin yang lebih luas pada dokumen Desman/histori. DP Rp100.000, H+1 semua role, ledger, reschedule tanpa DP baru, empat sesi dan lifecycle manual Psikolog tetap berlaku.

## Admin

Navigasi hanya empat menu:

1. Booking & Pembayaran: booking bantuan, pemeriksaan bukti serta pencatatan/verifikasi/penolakan/koreksi penerimaan sesuai guard dan audit.
2. Pengajuan Reschedule: membantu dan memproses perubahan jadwal sesuai slot, versi, H+1 dan kuota yang disepakati.
3. Monitoring User: memantau data administratif tanpa mengelola akun petugas atau data klinis.
4. Moderasi Review: memproses ulasan sesuai kewenangan.

Tidak ada menu Paket Berjalan, Operasional Sesi, Kalender Praktik, Layanan & Harga atau Konten Publik untuk Admin. URL tab lama kembali ke booking. Endpoint dan service pengelolaan paket/diskon/biaya, kalender, CMS/publikasi/media/tutorial, laporan asesmen, layanan kustom serta lifecycle termasuk check-in khusus Psikolog/owner. CMS draft tidak dikirim melalui DTO Admin. Katalog/quote operasional tidak memberikan hak mengubah tarif. Pembatasan nominal penerimaan/saldo yang sudah ada tetap berlaku; owner tidak otomatis menjadi kasir.

## Kalender dan libur

Hari libur mingguan maupun tanggal CLOSED memakai intervals=[] yang wajib disertakan, tetapi boleh kosong. Field hilang/null tetap ditolak. OPEN khusus tetap membutuhkan jam dan kuota positif; jam bentrok/tidak sah tetap ditolak. Preview, versi dan apply tetap diperlukan. Hari libur menghasilkan slot kosong, sementara hari buka tetap dapat dipesan. Jika seluruh minggu tutup, informasi publik menyebut praktik sedang libur. Perubahan yang berdampak pada booking tidak menimpa appointment tanpa penanganan reschedule.

## Katalog dan ulasan

Keduanya memakai slide per halaman dengan kartu utuh saat berhenti: satu kartu jika area kurang600px, dua pada600–959px dan tiga mulai960px. Penghitung menampilkan rentang item, total item dan nomor halaman. Halaman terakhir tidak mengarang kartu pengisi. Swipe/panah/keyboard memakai batas halaman penuh; resize disejajarkan kembali. Notes tetap terlihat. Ulasan kosong tidak menampilkan rating atau ulasan palsu. Autoplay ulasan mengikuti CMS dan perlindungan fokus/reduced motion sebelumnya; katalog tetap manual.

## Kontak dan jam praktik

Pemeriksaan lokal menemukan identitas hanya memiliki nama praktik untuk bagian kontak; alamat/telepon/WhatsApp/email belum diisi. Jangan membuat kontak atau Instagram demo. Nilai kosong/placeholder ditampilkan sebagai informasi belum diisi; Instagram hanya tampil bila diatur. Isi melalui Psikolog > CMS Konten > Landing Page > Informasi Kontak Resmi & Alamat Klinik. Publikasi menyinkronkan kontak ke identitas praktik. Profil terkini menjadi sumber kontak pada workspace; pratinjau menggunakan nilai draft tanpa menyimpannya. Jam berasal dari kalender jika tidak ada keterangan jam CMS yang diisi. Alur penyimpanan kontak sampai halaman publik diuji terpisah dari data praktik.

## Verifikasi dan batas

TypeScript, regresi FE dan integrasi MySQL terisolasi mencakup simpan CLOSED kosong, penolakan OPEN tanpa jam/field hilang, slot libur, pembatasan role, reschedule/pembayaran/lifecycle sebelumnya, kontak CMS/publik dan pagination. Bukti jumlah tes terbaru ada di [handoff](SESSION_HANDOFF.md). HTTP sumber200 dan tes render tidak membuktikan UAT visual/gesture perangkat; pemeriksaan itu tetap terbuka. Tidak mereset data praktik, menjalankan Git/dev/build atau mengendalikan MySQL/Apache.

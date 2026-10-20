# Alur lintas pelaku dan penyelarasan
Ini pengantar; aturan detail berada pada fitur, API dan kamus database.
## Guest -> Pasien
Company profile tanpa harga -> login email/password atau Google -> profil pasien aktual dan satu penanggung jawab -> harga/promo -> pilih layanan/slot -> profiling/consent -> preview -> booking -> deadline -> kirim bukti -> verifikasi -> datang -> pelunasan/selesai -> receipt/review.
## Admin
Antrean tugas -> daftar/bantu pasien/walk-in -> kalender dan jadwal -> cek bukti aktual/approve atau reject beralasan -> saat datang cek identitas dan pembayaran, tagih langsung bila kurang DP -> catat aktual -> check-in -> status operasional -> biaya tambahan/diskon berjejak -> export jadwal.
Admin melihat harga/diskon/total, bukan saldo atau laporan kas owner. Check-in menggunakan indikator minimum terpenuhi; tidak memaksa sistem mengirim saldo.
## Superadmin
Kalender/keluhan berizin -> kebutuhan layanan -> rencana terapi atau scope asesmen -> keputusan klinis -> penutupan/perpanjangan -> laporan kas/expense/surplus -> audit/konfigurasi.
## Perubahan klinik
Admin ubah jam -> preview pasien terdampak -> apply kalender+requestCLINIC+notifikasi -> pasien memilih kembali -> Admin apply pada slot valid -> interval lama dilepas. Kuota pasien0, uang tetap pada penerimaan awal.
## Penyelarasan teknis
Telelayanan: pasien pilih paket -> konfirmasi nomor WA -> booking -> tugas Admin -> Admin hubungi pasien dan isi link Google Meet -> save+outbox -> Baileys kirim WA otomatis -> pemeriksaan pembayaran/kehadiran online -> layanan. Gagal kirim ditindaklanjuti Admin; reschedule membatalkan antrean lama dan memerlukan konfirmasi tautan untuk jadwal baru. Detail F20.

React untuk UX, Laravel untuk kebijakan/transaksi, MySQL sumber data. Tidak mencampurkan status appointment, tagihan, payment row dan requestreschedule. Draft bukan reservasi. Semua jalur kembali memakai role DTO yang sama termasuk print/export.
Lihat actors/, journeys/, F01–F20, WEB_CONTRACT.md, DATABASE_ARCHITECTURE.md dan KNOWN_ISSUES.md untuk aturan serta kelengkapan implementasi.

# Kalender, batas pemesanan dan verifikasi
## Tiga jam yang berbeda
| Aturan | Titik awal | Hasil |
|---|---|---|
| Lead online6jam kerja | waktu booking server | earliest_online_start; tetap H+1 |
| Hold maksimal24jam | waktu booking | min(created_at+24h,start_at) |
| SLA12jam kerja | bukti pertama lengkap tepat waktu | auto-protect, bukan uang terverifikasi |
Kalender jam Admin = jam klinik, mencakup interval buka, celah istirahat dan hari tutup. Timestamp UTC; hitung hari WIB. Lead/SLA memakai penjumlahan interval operasional, bukan penambahan jam biasa.
## Contoh Jumat malam
Booking Jumat23:44, Sabtu buka08:00–16:00 tanpa istirahat contoh ini. Enam jam kerja selesai Sabtu14:00. Sesi60menit dapat mulai14:00 atau15:00 jika tersedia; sesi240menit tidak muat setelah14:00 sehingga pilih hari berikut.
Untuk sesi Sabtu14:00, deadline pembayaran Sabtu14:00 (lebih awal daripada Sabtu23:44). Tampilkan batas aktual. Bukti diterima server <=deadline melindungi jadwal.
Jika Minggu tutup, SLA12jam bukti Jumat23:44 baru selesai Senin12:00. Sesi Sabtu tetap ditangani saat kedatangan: Admin memeriksa transfer, approve uang nyata atau tagih langsung dan catat aktual; check-in sesudah DP minimum.
SLA yang belum habis tidak menghalangi pemeriksaan manual. Auto-confirm bukan jalan untuk membuat payment VERIFIED.
## Kalender berubah
Gunakan versi kalender snapshot untuk deadline lama. Perubahan jam berlaku kini/ke depan, preview dampak seluruh reservasi aktif; apply membuat clinic-origin requests dan notifikasi. Pasien memilih jadwal kembali, kuota tidak berkurang. Tidak ada pemindahan diam-diam atau no-show otomatis akibat klinik tutup.
## Bukti ditolak dan kedatangan
Alur lengkap F08: koreksi diperbolehkan, alasan/versi disimpan; SLA tidak reset. Batas koreksi tidak lebih awal dari deadline awal dan tidak lebih lambat dari awal sesi, dengan default window24jam konfigurabel. Jika batas pada awal sesi, kedatangan diselesaikan sampai grace operasional. Job expiry/no-show dan verify mengunci appointment yang sama agar hanya satu transisi berlaku.
Koreksi terlambat tidak merebut slot yang sudah diberikan kepada pasien lain. Penerimaan nyata tetap direkonsiliasi tanpa menggeser periode kas.
## Walk-in
Admin/owner hanya boleh membuat booking minimal H+1 WIB pada interval kosong dan jam buka. Walk-in tidak mempunyai pengecualian same-day. Lock/overlap/payment/identitas tetap diperiksa.
## Perubahan jadwal
Pasien normal mengajukan sebelum H-2, maksimum3 APPLIED; setelah NO_SHOW boleh submit sampai akhir WIB tanggal sesi+4. requested_at menjadi dasar kelayakan, bukan waktu Admin memproses.
Semua tujuan booking/reschedule/sesi lanjutan minimal H+1 WIB, termasuk jalur Admin/owner. Pilihan online pasien juga memenuhi enam jam operasional sejak pemilihan. Reschedule tidak mengulang DP, bukti, verifikasi uang, SLA asal atau base charge.

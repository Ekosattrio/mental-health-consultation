# Journey Admin sehari-hari
## Tujuan
Memastikan pasien dan pembayaran nyata tercatat tanpa melihat saldo pasien atau laporan kas praktik.
## Langkah
1. Login; lihat kalender dan antrean pembayaran, prioritas sesi dekat.
2. Daftarkan/cari pasien; walk-in tanpa akun dapat dibuat pada interval bebas. Pilih PAPER untuk profiling offline tanpa submission digital; pasien mengisi kertas lalu menyerahkannya langsung ke Superadmin. Admin tetap mengurus identitas/jadwal/pembayaran, tanpa membaca/menginput/upload jawaban.
3. Periksa bukti dan nominal aktual, approve/reject dengan alasan. Koreksi bukti tidak reset SLA.
4. Saat pasien datang, wajib cek pembayaran: sudah diterima -> approve; belum memenuhi minimum -> tagih di luar sistem saat itu, catat yang benar-benar diterima.
5. Check-in sesudah minimum DP terpenuhi; catat mulai/selesai/no-show sesuai kejadian dan guard.
6. Input total menit tambahan Konseling, laporan permintaan atau biaya kustom. Tambahan setelah lunas menjadi addendum; receipt lama tetap.
7. Input diskon khusus dengan alasan/preview, tanpa nominal biaya negatif atau menghapus uang diterima.
8. Atur jadwal lanjutan asesmen/terapi sesuai rencana, proses reschedule dengan lock interval lama/baru.
9. Jam klinik berubah: preview dampak -> apply -> pasien diberi informasi untuk memilih kembali melalui request CLINIC, quota0.
10. Export jadwal dan moderasi review bila dibutuhkan.
11. Booking Telelayanan masuk tugas NEEDS_LINK. Hubungi pasien, buat/peroleh link Meet di luar aplikasi, tempel link dan periksa nomor WA pada detail booking. Save memicu kirim Baileys otomatis; monitor QUEUED/SENT/FAILED dan bantu jika gagal. Setelah reschedule, konfirmasi link untuk usaha/jadwal baru dahulu. Kehadiran online tetap dicatat manual sesuai F20.
## Tampilan dan gagal
Harga/diskon/total boleh; saldo/aggregate paid/receipt penuh tidak boleh. Petugas mendapat indikator minimum terpenuhi, bukan field selisih. Konflik slot/versi meminta reload, bukan override bebas. Input salah dikoreksi berjejak; jangan mengulang sebagai uang masuk baru.
## Hasil
Setiap aksi ditautkan actor, alasan, pasien/booking dan event. F05,F08–F10,F17,F18.

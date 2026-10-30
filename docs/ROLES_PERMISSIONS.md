# Hak akses kanonik

Penegasan terbaru30Oktober: [keputusan aktif](KEPUTUSAN_AKTIF_2026-10-30.md). Admin hanya empat menu: booking/pembayaran, pengajuan reschedule, monitoring pengguna dan moderasi review. Pengelolaan paket/harga/diskon, kalender, CMS/media/tutorial serta operasional sesi khusus Psikolog. Izin Admin historis yang bertentangan di bawah/arsip tidak berlaku.

Dasar bisnis: [keputusan Eko 29 Oktober](KEPUTUSAN_AKTIF_2026-10-29.md). Seluruh booking/reschedule/lanjutan H+1; mulai/selesai/no-show/cancel dan penjadwalan sesi berikutnya hanya Psikolog. Pembayaran tetap operasional Admin.
Diperbarui30Oktober2026; tanggal19Oktober adalah histori awal. Role bisnis Superadmin dipetakan ke PSYCHOLOGIST, hanya satu owner.
## Matriks
| Kemampuan | Guest | Pasien berizin | Admin | Superadmin |
|---|---|---|---|---|
| Profil praktik/katalog tanpa harga | Ya | Ya | Ya | Ya |
| Harga/promo setelah login | Tidak | Ya | Ya | Ya |
| Profil/booking pasien | Tidak | Milik/akses sah | Administratif | Ya |
| Harga, diskon, total tagihan pasien | Tidak | Milik sendiri | Ya | Ya |
| Saldo pasien/agregat penerimaan/receipt penuh | Tidak | Milik sendiri | **Tidak** | Ya |
| Nominal bukti/input pembayaran aktif | Tidak | Milik sendiri | Ya untuk verifikasi/input | Ya |
| Verifikasi/penolakan bukti dan pencatatan/koreksi DP/cicilan/pelunasan | Tidak | Upload/koreksi bukti sendiri saja | Ya | Tidak; baca ledger/laporan |
| Promo global dan diskon tagihan individual | Tidak | Lihat hasil milik sendiri | Tidak mengelola | Ya |
| Harga dasar dan basis tarif additional time per versi paket | Tidak | Lihat ketentuan paket sendiri | Tidak mengelola | Kelola |
| Biaya kustom/extra Konseling/laporan | Tidak | Lihat tagihan sendiri | Tidak mengelola | Ya |
| Link Google Meet dan nomor WA Telelayanan | Tidak | Baca link milik/akses sah, konfirmasi nomor booking | Kelola/kirim ulang beralasan | Kelola |
| Jam klinik, slot, kuota | Baca jam publik | Baca slot | Baca untuk booking/reschedule | Kelola |
| Booking bantuan/walk-in | Tidak | Minimal H+1 | Minimal H+1 pada slot sah | Minimal H+1 pada slot sah |
| Check-in administratif | Tidak | Lihat status | Tidak mengubah status | Ya |
| Mulai/selesai/no-show/cancel | Tidak | Lihat status | Tidak | Ya, manual; cancel setelah lunas |
| Menjadwalkan sesi berikutnya | Tidak | Lihat jadwal | Monitoring/bantuan reschedule | Ya, setelah sesi sebelumnya selesai, tanpa DP baru |
| Pre-test answers/hasil tes/catatan klinis | Tidak | Jawaban sendiri | Status lengkap saja | Ya |
| Profiling offline di kertas | Tidak melalui aplikasi | Isi lalu serahkan langsung ke Superadmin | Pendataan administratif saja; tidak input/baca/upload jawaban | Terima dan tangani langsung |
| Keputusan klinis/close case/stop plan lunas (tanpa extend) | Tidak | Tidak | Bantu jadwal saja | Ya |
| Memulai rangkaian administratif Psikoterapi pada booking pertama | Tidak | Ya, otomatis bersama sesi1 milik/akses sah | Ya melalui assisted/walk-in | Ya; dapat membuat manual |
| Reschedule | Tidak | Mengajukan | Review/apply | Ya |
| CMS administratif/media/tutorial | Baca published | Baca | Baca published saja | Kelola |
| Moderasi review | Baca approved | Buat/edit milik sendiri | Ya | Ya |
| Export jadwal tanpa saldo/klinis | Tidak | Tidak | Ya | Ya |
| Laporan kas/pengeluaran/surplus | Tidak | Tidak | Tidak | Ya |
| Akun petugas/role, audit lengkap | Tidak | Sesi sendiri | Tidak | Ya |

## Sumber pembatasan lama
Larangan Admin melihat seluruh harga/target tagihan terdapat pada versi lama ROLES_PERMISSIONS.md, API_BOUNDARY.md, F08 dan spesifikasi Eko. Itu bukan larangan eksplisit pada ide SYSTEM_DESIGN_PRAKTIK_PSIKOLOGI.md: §3.3/§14 memberi Admin tugas mencocokkan nominal, menginput aktual dan memverifikasi; §21 mengizinkan export jadwal.
Koreksi developer 19 Oktober: Admin boleh harga/diskon/total, **saldo tidak boleh**; pendapatan/pengeluaran tetap khusus Superadmin. Matriks di atas menggantikan larangan lama, tanpa membuka saldo lewat endpoint print atau response nested.
Menyembunyikan saldo adalah pembatasan field, bukan jaminan Admin tidak dapat memperkirakannya dari bukti atau perhitungan yang sudah diketahui.

## Policy
Penegasan developer 22 Oktober 2026: operasional penerimaan pembayaran pasien khusus ADMIN. PSYCHOLOGIST tetap membaca ledger/keuangan, tetapi tidak mewarisi aksi input/verifikasi/penolakan/koreksi pembayaran hanya karena role tertinggi. Ketentuan ini tidak mengubah hak pengelolaan harga/diskon atau pengeluaran praktik yang diatur terpisah. Temuan audit sebelumnya yang menyebut penolakan input/verifikasi psikolog sebagai celah dinyatakan tidak berlaku.

Role tidak cukup: backend memeriksa relasi pasien, target dokumen, status, waktu dan tujuan file. UUID bukan otorisasi. Export menggunakan dataset role yang sama. Aksi petugas mencatat actor dari session dan alasan; Superadmin tidak dapat menghapus audit/kas historis secara overwrite.

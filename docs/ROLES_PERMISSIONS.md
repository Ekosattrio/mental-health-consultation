# Hak akses kanonik
Tanggal: 19 Oktober 2026. Role bisnis Superadmin dipetakan ke PSYCHOLOGIST, hanya satu owner.
## Matriks
| Kemampuan | Guest | Pasien berizin | Admin | Superadmin |
|---|---|---|---|---|
| Profil praktik/katalog tanpa harga | Ya | Ya | Ya | Ya |
| Harga/promo setelah login | Tidak | Ya | Ya | Ya |
| Profil/booking pasien | Tidak | Milik/akses sah | Administratif | Ya |
| Harga, diskon, total tagihan pasien | Tidak | Milik sendiri | Ya | Ya |
| Saldo pasien/agregat penerimaan/receipt penuh | Tidak | Milik sendiri | **Tidak** | Ya |
| Nominal bukti/input pembayaran aktif | Tidak | Milik sendiri | Ya untuk verifikasi/input | Ya |
| Verifikasi dan pencatatan DP/pelunasan | Tidak | Upload saja | Ya | Ya |
| Promo global dan diskon tagihan individual | Tidak | Lihat hasil milik sendiri | Ya, alasan/audit | Ya |
| Harga dasar dan basis tarif additional time per versi paket | Tidak | Lihat ketentuan paket sendiri | Kelola, alasan/audit | Kelola |
| Biaya kustom/extra Konseling/laporan | Tidak | Lihat tagihan sendiri | Ya sesuai guard | Ya |
| Link Google Meet dan nomor WA Telelayanan | Tidak | Baca link milik/akses sah, konfirmasi nomor booking | Kelola/kirim ulang beralasan | Kelola |
| Jam klinik, slot, kuota | Baca jam publik | Baca slot | Ya + dampak | Ya |
| Walk-in same-day | Tidak | Tidak melalui online | Ya, tanpa approval object | Ya |
| Check-in/mulai/selesai/no-show administratif | Tidak | Lihat status | Ya sesuai F10 | Ya |
| Pre-test answers/hasil tes/catatan klinis | Tidak | Jawaban sendiri | Status lengkap saja | Ya |
| Profiling offline di kertas | Tidak melalui aplikasi | Isi lalu serahkan langsung ke Superadmin | Pendataan administratif saja; tidak input/baca/upload jawaban | Terima dan tangani langsung |
| Keputusan klinis/close case/extend-stop plan | Tidak | Tidak | Bantu jadwal saja | Ya |
| Memulai rangkaian administratif Psikoterapi pada booking pertama | Tidak | Ya, otomatis bersama sesi1 milik/akses sah | Ya melalui assisted/walk-in | Ya; dapat membuat manual |
| Reschedule | Tidak | Mengajukan | Review/apply | Ya |
| CMS administratif | Baca published | Baca | Kelola | Kelola/sahkan identitas klinis |
| Moderasi review | Baca approved | Buat/edit milik sendiri | Ya | Ya |
| Export jadwal tanpa saldo/klinis | Tidak | Tidak | Ya | Ya |
| Laporan kas/pengeluaran/surplus | Tidak | Tidak | Tidak | Ya |
| Akun petugas/role, audit lengkap | Tidak | Sesi sendiri | Tidak | Ya |

## Sumber pembatasan lama
Larangan Admin melihat seluruh harga/target tagihan terdapat pada versi lama ROLES_PERMISSIONS.md, API_BOUNDARY.md, F08 dan spesifikasi Eko. Itu bukan larangan eksplisit pada ide SYSTEM_DESIGN_PRAKTIK_PSIKOLOGI.md: §3.3/§14 memberi Admin tugas mencocokkan nominal, menginput aktual dan memverifikasi; §21 mengizinkan export jadwal.
Koreksi developer 19 Oktober: Admin boleh harga/diskon/total, **saldo tidak boleh**; pendapatan/pengeluaran tetap khusus Superadmin. Matriks di atas menggantikan larangan lama, tanpa membuka saldo lewat endpoint print atau response nested.
Menyembunyikan saldo adalah pembatasan field, bukan jaminan Admin tidak dapat memperkirakannya dari bukti atau perhitungan yang sudah diketahui.

## Policy
Role tidak cukup: backend memeriksa relasi pasien, target dokumen, status, waktu dan tujuan file. UUID bukan otorisasi. Export menggunakan dataset role yang sama. Aksi petugas mencatat actor dari session dan alasan; Superadmin tidak dapat menghapus audit/kas historis secara overwrite.

# Integrasi tampilan FE Eko dengan Laravel

## Jalur tampilan

Dashboard Pasien/Admin/Psikolog dirender melalui `DashboardController -> Eko/Workspace -> ServerAppProvider -> AppContent`. Komponen di `resources/js/components/patient`, `admin`, dan `psychologist` dipakai kembali. Home, halaman akun, serta informasi publik memakai navbar/footer yang sama melalui `EkoShell`. Login memakai modal FE dengan autentikasi Laravel/Google sebenarnya; tombol login demo tidak muncul di jalur operasional.

`resources/js/pages/Practice/Workspace.tsx` adalah implementasi alternatif sebelumnya dan tidak dipanggil route dashboard. `/preview/eko` tetap terpisah sebagai histori simulasi, dimatikan default; bukan pintu masuk aplikasi utama.

## Adapter dan aksi server

`resources/js/integration/mapping.ts` memetakan DTO server ke model presentasi FE. ID akun login dibedakan dari ID profil pasien. `ServerAppProvider.tsx` menghubungkan aksi FE ke endpoint session Laravel; tidak memanggil mutasi mock atau menyimpan jawaban/bukti/ledger ke LocalStorage. Penyimpanan gagal tidak menampilkan keberhasilan palsu. Pembaruan latar belakang tidak menimpa respons yang lebih baru.

Penyimpanan profil akun dan profil pasien terkait dilakukan atomik dengan dua pemeriksaan versi. Upload bukti menyimpan ID file berhasil dalam memori dan mempertahankan identitas retry. Kesamaan nominal/metode/waktu saja tidak menolak penerimaan nyata baru; idempotency request mencegah retry ganda, sedangkan checksum bukti identik tetap meminta peninjauan.

| FE Eko | Sumber/aksi server |
|---|---|
| Ringkasan, monitoring pasien, jadwal, paket berjalan | `GET /work/data`, halaman appointment digabung tanpa menggandakan bill |
| Pilihan tanggal/jam booking, reschedule, sesi lanjutan | `GET /availability?summary=1`, hanya slot server yang dapat dipilih |
| Profil pasien / kelengkapan data | `POST /patients`, `POST /patients/{id}` dengan versi profil |
| Pre-test baru | `POST /pretests`, jawaban klinis hanya pasien berwenang/Psikolog |
| Persetujuan | `POST /consents`, versi dokumen CMS yang diterbitkan |
| Reservasi sebelum transfer | `POST /appointments/preview`, lalu `POST /appointments` dengan quote, pre-test, dan consent |
| Bukti dan pemeriksaan Admin | `POST /files`, `/appointments/{id}/payment-submissions`, `/payments/{id}/verify` atau `/reject` |
| Cicilan/pelunasan | `POST /admin/appointments/{id}/payments`, penerimaan nyata baru pada ledger |
| Pengajuan dan perubahan jadwal | `/appointments/{id}/reschedule-requests`, `/reschedule-requests/{id}/{decision}` dengan versi dan lock slot |
| Sesi berikutnya | `/admin/appointments/{id}/next`, khusus Psikolog, tanpa DP baru |
| Selesai/no-show/cancel | Endpoint lifecycle, keputusan manual Psikolog; tidak dibuka untuk Admin |
| Paket/diskon/notes/fasilitas | `/admin/packages`, versi immutable; nonaktifkan untuk menjaga riwayat |
| Kalender | Preview/apply berversi; FE meminta booking terdampak dijadwal ulang terlebih dahulu |
| CMS | `/admin/cms`, gambar melalui `/admin/assets`; field FE diterima dan disimpan |
| Profil praktik/foto | `/superadmin/settings`, upload gambar sebelum menyimpan URL |
| Review | `/billing-accounts/{id}/review`, `/admin/reviews/{id}/moderate` |
| Invoice/kwitansi | Tautan PDF server dari detail FE; bukti dapat dilihat inline melalui akses file privat |
| Laporan cetak/Excel FE | Ledger server, deduplikasi ID penerimaan, termasuk koreksi/reversal |

## Urutan booking pasien

1. Lengkapi profil asli; bantuan isi data sampel tidak muncul di aplikasi operasional.
2. Pilih layanan dan slot H+1 dari server; catatan paket tetap ditampilkan.
3. Isi pre-test dan setujui dokumen layanan/privasi serta penerimaan informasi jadwal. Server menyimpan submission dan consent baru.
4. Server memvalidasi ulang harga/kalender dan membuat reservasi dalam transaksi. Baru setelah respons berhasil, rincian pembayaran ditampilkan. Perubahan katalog tidak menulis ulang snapshot booking ini.
5. Transfer DP Rp100.000 atau pembayaran penuh, unggah bukti, lalu kirim untuk diperiksa Admin. Bukti bukan uang terverifikasi.
6. Admin melihat gambar/PDF bukti dan memasukkan nominal aktual. Penerimaan kurang dari DP tetap dicatat, tetapi jadwal belum terkonfirmasi. Kekurangan dicatat sebagai penerimaan berikutnya.
7. Jika halaman ditutup sebelum unggah, buka detail Jadwal & Riwayat untuk mengunggah bukti ke reservasi yang sama; tidak membuat booking kedua.

## Rangkaian dan perubahan jadwal

Psikolog menyelesaikan sesi secara manual dan menjadwalkan pertemuan berikutnya pada slot H+1 yang tersedia. Setelah empat pertemuan tidak tersedia sesi kelima pada plan lama. Pasien memesan episode baru. DP sekali di awal plan; pembayaran penuh/cicilan dialokasikan tanpa penerimaan ganda.

Reschedule memindahkan appointment yang sama. Jadwal/pembayaran lama tetap sampai target diterapkan. Form lama ditolak jika versi berubah. Bila target telah diambil orang lain, status menjadi pilih ulang; UI tidak melaporkan seolah pemindahan berhasil. Identitas pelaku dan riwayat jadwal berasal dari event server.

Pembatalan/penghentian hanya Psikolog setelah tagihan terbentuk lunas. Sesi selesai dan riwayat pembayaran tetap tersimpan; sisa appointment dihentikan bersama. Tidak ada auto-cancel no-show atau auto-confirm karena SLA.

## Database dan verifikasi

Migrasi `2026_10_29_000001_restore_eko_fixed_initial_payment` telah dijalankan lokal: kebijakan booking baru FIXED Rp100.000 serta kolom JSON presentation pada versi paket. Snapshot invoice/ledger lama tidak ditulis ulang; akun tidak direset.

Pengujian memakai database MySQL acak terpisah dengan guard nama khusus. Fixture tidak dimasukkan ke database praktik. Pemeriksaan meliputi render seluruh tab FE, pemetaan ID, DP, H+1, upload/verifikasi, akses role, konflik versi/slot, laporan kas, dan rangkaian empat sesi. Hasil terakhir ada di SESSION_HANDOFF.

Dev server dan build tidak dijalankan. Bundle produksi lama tidak dibuat ulang; untuk melihat perubahan source, developer menjalankan Vite atau membuat build sendiri. Pemeriksaan visual/interaksi browser nyata dan UAT mobile belum diklaim selesai. Google membutuhkan kredensial; WhatsApp membutuhkan pairing/worker. Pengiriman akun nyata tidak diuji dalam pekerjaan ini.

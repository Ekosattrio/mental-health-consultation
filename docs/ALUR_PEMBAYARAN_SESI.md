# Pembayaran Bertahap dan Pelunasan Sesi Terakhir

Keputusan developer 22 Oktober 2026: pasien boleh mencicil atau membayar penuh di awal, tetapi harus lunas paling lambat pada hari pertemuan terakhir. Penerapan saat ini adalah FE preview lokal, bukan domain Laravel/database yang sudah berjalan.

## Aturan Utama

- DP Rp100.000 sekali pada awal booking/rangkaian, dibatasi biaya net bila lebih kecil, dan mengurangi total biaya. Tidak ada DP kedua saat sesi lanjutan atau reschedule.
- Konseling tunggal wajib lunas paling lambat hari konsultasi tersebut. Psikoterapi wajib lunas paling lambat hari sesi keempat. Hari mengikuti WIB, bukan jam perangkat pasien.
- Pasien boleh membayar sisa sekaligus sebelum sesi pertama, atau mencicil menurut kesepakatan dengan psikolog. Tidak ada persentase, jadwal cicilan wajib, denda, auto-cancel, atau pemotongan uang otomatis baru.
- Hanya Admin memeriksa bukti dan mencatat uang aktual. Pilihan pembayaran/unggah bukti pasien tidak membuktikan uang diterima.
- Sesi selesai dan keuangan lunas adalah dua fakta berbeda. Pertemuan yang sudah terjadi tetap dicatat; bila belum lunas, tampil `Menunggu pelunasan`, bukan penutupan administratif selesai dan lunas.

## Kesepakatan dan Alokasi

Psikoterapi baru mengambil snapshot tarif bersih per sesi dan jumlah empat sesi pada booking pertama. Contoh Rp500.000/sesi berarti kesepakatan empat sesi Rp2.000.000. Bukan wajib membayar Rp2.000.000 di awal, bukan tarif paket baru, dan bukan langsung membuat utang untuk sesi yang belum dijadwalkan. Tarif rangkaian ini tidak berubah akibat edit katalog setelah kesepakatan.

Satu ledger penerimaan pada appointment pertama menjadi referensi pembayaran rangkaian. Admin boleh membuka aksi dari sesi mana pun; penyimpanan selalu menuju ledger yang sama. Uang dialokasikan berurutan ke sesi 1, 2, 3, 4. Appointment/invoice sesi berikutnya tetap dibuat bertahap setelah sesi sebelumnya selesai, H+1 dan slot valid.

| Kejadian | Kas nyata | Hasil |
|---|---|---|
| Awal, DP diverifikasi Rp100.000 | Rp100.000 | Sesi 1 teralokasi Rp100.000; sisa kesepakatan Rp1.900.000 |
| Cicilan Rp600.000 sebelum konsultasi | Total Rp700.000 | Sesi 1 lunas Rp500.000, Rp200.000 untuk sesi 2; belum-dijadwalkan tetap prabayar, bukan invoice baru |
| Bayar penuh Rp2.000.000 di awal | Rp2.000.000 sekali | Invoice sesi 1 lunas, Rp1.500.000 tersimpan sebagai prabayar sesi mendatang |
| Sesi 2 dijadwalkan setelah prabayar penuh | Tidak ada penerimaan baru | Invoice sesi 2 teralokasi Rp500.000, tanpa DP/proof ulang |
| Sesi 4 selesai, penerimaan baru Rp1.500.000 | Sisa Rp500.000 | Fakta sesi selesai tetap; rangkaian menunggu pelunasan |
| Admin mencatat sisa Rp500.000 | Total Rp2.000.000 | Empat sesi selesai dan seluruh tagihan lunas |

Laporan kas/receipt penerimaan menghitung transaksi nyata sekali pada tanggal uang diterima, bukan pada tanggal tiap sesi yang mendapat alokasi. Retry satu idempotency key tidak menambah uang lagi. Dua transfer berbeda tetap dua penerimaan nyata, termasuk jika jumlahnya melampaui kesepakatan.

## Tampilan Per Role

- Pasien: pilihan DP/penuh di awal; setelah verifikasi melihat uang diterima, kesepakatan total, tagihan terjadwal, teralokasi, prabayar, sisa pelunasan, dan tanggal jatuh tempo. Detail riwayat serta receipt memakai ledger rangkaian yang sama.
- Psikolog: membaca progres pembayaran dan status `Selesai & lunas` / `Menunggu pelunasan` di Paket Berjalan; tidak mendapat aksi input/verifikasi pembayaran.
- Admin: mencatat nominal aktual/metode/tanggal, memeriksa bukti dan melihat indikator status/jatuh tempo. Input nominal kembali kosong setelah diproses; tidak menampilkan saldo/agregat penerimaan atau receipt keuangan penuh. Preview masih menyimpan model lokal; redaksi UI bukan policy keamanan server.

## Pelunasan, Reschedule, dan Pembatalan

Tanggal jatuh tempo mengikuti jadwal sesi terakhir yang berlaku. Jika sesi terakhir belum dijadwalkan, tulis `hari sesi terakhir (sesi 4)`, jangan mengarang tanggal. Reschedule memindahkan tanggal itu tanpa mengubah penerimaan, tarif kesepakatan, jumlah sesi, atau DP.

Pada hari sesi terakhir, sisa positif ditandai wajib pelunasan. Setelah seluruh pertemuan selesai tetapi belum lunas, status finansial tetap menunggu pelunasan dan pembelian psikoterapi berikutnya untuk paket yang sama ditolak sampai tagihan rangkaian lama beres. Pencatatan sesi selesai tidak mengarang penerimaan dan tidak memblokir pencatatan fakta klinis yang sudah terjadi.

Pembatalan/discontinue tetap wajib melunasi seluruh invoice sah yang sudah terbentuk, bukan memaksa pembayaran sesi yang belum dipesan. Contoh hanya sesi 1 dijadwalkan: kewajiban Rp500.000, bukan Rp2.000.000. Prabayar yang belum teralokasi setelah berhenti tetap tercatat, tidak hangus, tidak dipindah ke booking lain, dan tidak otomatis direfund. Penanganan selisih di luar aplikasi sesuai keputusan sebelumnya.

Sesudah empat sesi selesai dan tagihan lunas, layanan lanjutan memakai booking/rangkaian baru, tarif saat booking baru, dan DP awal sendiri. Tidak ada sesi ke-5 dalam rangkaian lama atau saldo lintas booking.

## Implementasi dan Handoff Backend

- `Appointment.paymentAgreement` adalah snapshot FE untuk rangkaian PER_SESSION baru: referensi ledger awal, waktu kesepakatan, empat sesi, tarif/subtotal/potongan per sesi, dan durasi.
- `resolvePaymentAccount`, `getTreatmentPlanBalance`, `syncPaymentAllocations`, dan `getPaymentSummary` memisahkan uang nyata, alokasi per invoice, prabayar dan kewajiban hari terakhir. `getRecordedCashIn` pada continuation ber-agreement selalu nol; kas berada di ledger awal.
- Record lama tanpa agreement mempertahankan perhitungan lama, tidak dimigrasikan atau dihitung ulang diam-diam. Pelunasan akhir tetap memeriksa invoice yang sudah terbentuk. Tarif tetap/prabayar lintas sesi memerlukan agreement baru atau migrasi eksplisit yang diaudit.
- Backend perlu entitas agreement dan relasi alokasi receipt ke invoice, lock ledger/rangkaian/invoice, idempotency persisten, policy Admin-only dan DTO redacted. Alokasi tidak membuat receipt kedua atau menyalin nominal ke ledger appointment lanjutan. Server menetapkan nilai/sesi/aktor/waktu dan menolak tautan lintas pasien/paket/rangkaian.
- Close administratif harus memeriksa empat pertemuan nyata selesai dan seluruh tagihan sah lunas secara atomik. Status klinis selesai jangan dibatalkan karena koreksi uang. Lewat jatuh tempo hanya indikator/tagihan manual, bukan job pembatalan.
- Backend tetap memasukkan biaya/adjustment sah yang disepakati pada kontrak domain ke total final. FE ini belum mengimplementasikan seluruh additional-time/addendum Desman dan bukan pengganti ledger server.
- Tidak membuka mock/LocalStorage ke produksi; endpoint bisnis, SQL migration dan invoice database belum dibuat oleh pekerjaan FE ini.

## Verifikasi

Regresi mencakup full di awal, alokasi FIFO, tanpa duplikasi kas/DP, cicilan sebelum sesi, jatuh tempo WIB/reschedule, status akhir belum lunas, isolasi ledger, harga snapshot, pembatalan atas invoice terbentuk, dan pembatasan role. Hasil tes terbaru lihat [handoff](SESSION_HANDOFF.md).

Pola pemisahan penerimaan awal dan penerapannya pada invoice diadaptasi untuk kebutuhan ini, bukan menambah gateway/ERP: [Microsoft Learn - Customer prepayment invoices](https://learn.microsoft.com/en-us/dynamics365/finance/accounts-receivable/customer-prepayment-invoice). Detail aturan hari terakhir, empat sesi, akses role, dan pembatalan tetap keputusan proyek.

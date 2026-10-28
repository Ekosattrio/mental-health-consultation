# Pembayaran Bertahap dan Pelunasan Sesi Terakhir

Aturan target mengikuti [keputusan aktif24 Oktober](KEPUTUSAN_AKTIF_2026-10-24.md). FE preview masih memakai struktur lokal; schema/model server kini tersedia, controller/alokasi transaksi belum diaktifkan.

## Aturan Utama

- Minimum awal dihitung dari initial_payment_policy_snapshot: FIXED=min(fixed_amount,dasar_net), PERCENT=min(dasar_net,ceil(dasar_net*basis_points/10000)); lanjutan0 setelah DP asal terverifikasi. Default PERCENT 5000 basis poin sesuai ide pemilik; contoh FIXED 100000 hanya skenario konfigurasi opsional.
- Konseling tunggal wajib lunas paling lambat hari konsultasi tersebut. Psikoterapi wajib lunas paling lambat hari sesi keempat. Hari mengikuti WIB, bukan jam perangkat pasien.
- Pasien boleh membayar sisa sekaligus sebelum sesi pertama, atau mencicil menurut kesepakatan dengan psikolog. Tidak ada jadwal cicilan wajib, denda, auto-cancel, atau pemotongan uang otomatis baru.
- Hanya Admin memeriksa bukti dan mencatat uang aktual. Pilihan pembayaran/unggah bukti pasien tidak membuktikan uang diterima.
- Sesi selesai dan keuangan lunas adalah dua fakta berbeda. Pertemuan yang sudah terjadi tetap dicatat; bila belum lunas, tampil `Menunggu pelunasan`, bukan penutupan administratif selesai dan lunas.

## Kesepakatan dan Alokasi

Psikoterapi baru mengambil snapshot tarif bersih per sesi dan jumlah empat sesi pada booking pertama. Contoh Rp500.000/sesi berarti kesepakatan empat sesi Rp2.000.000. Bukan wajib membayar Rp2.000.000 di awal, bukan tarif paket baru, dan bukan langsung membuat utang untuk sesi yang belum dijadwalkan. Tarif rangkaian ini tidak berubah akibat edit katalog setelah kesepakatan.

Satu ledger penerimaan pada appointment pertama menjadi referensi pembayaran rangkaian. Admin boleh membuka aksi dari sesi mana pun; penyimpanan selalu menuju ledger yang sama. Uang dialokasikan berurutan ke sesi 1, 2, 3, 4. Appointment/invoice sesi berikutnya tetap dibuat bertahap setelah sesi sebelumnya selesai, sesuai batas kalender F05 dan slot valid.

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

Pembatalan/discontinue sebelum layanan tidak menagih sisa bagian belum diberikan. Invoice500000/kas100000: adjustment pelepasan400000, CLOSED_UNSERVED; uang100000 tetap tanpa refund. Bila sebagian layanan telah diberikan, owner menetapkan bagian belum diberikan secara beralasan. Prabayar tetap tercatat; selisih diselesaikan di luar aplikasi, tidak dipindah otomatis ke plan lain.

Sesudah empat sesi selesai dan tagihan lunas, layanan lanjutan memakai booking/rangkaian baru, tarif saat booking baru, dan DP awal sendiri. Tidak ada sesi ke-5 dalam rangkaian lama atau saldo lintas booking.

## Implementasi dan Handoff Backend

- `Appointment.paymentAgreement` adalah snapshot FE untuk rangkaian PER_SESSION baru: referensi ledger awal, waktu kesepakatan, empat sesi, tarif/subtotal/potongan per sesi, dan durasi.
- `resolvePaymentAccount`, `getTreatmentPlanBalance`, `syncPaymentAllocations`, dan `getPaymentSummary` memisahkan uang nyata, alokasi per invoice, prabayar dan kewajiban hari terakhir. `getRecordedCashIn` pada continuation ber-agreement selalu nol; kas berada di ledger awal.
- Record lama tanpa agreement mempertahankan perhitungan lama, tidak dimigrasikan atau dihitung ulang diam-diam. Pelunasan akhir tetap memeriksa invoice yang sudah terbentuk. Tarif tetap/prabayar lintas sesi memerlukan agreement baru atau migrasi eksplisit yang diaudit.
- Backend perlu entitas agreement dan relasi alokasi receipt ke invoice, lock ledger/rangkaian/invoice, idempotency persisten, policy Admin-only dan DTO redacted. Alokasi tidak membuat receipt kedua atau menyalin nominal ke ledger appointment lanjutan. Server menetapkan nilai/sesi/aktor/waktu dan menolak tautan lintas pasien/paket/rangkaian.
- Close administratif harus memeriksa empat pertemuan nyata selesai dan seluruh tagihan sah lunas secara atomik. Status klinis selesai jangan dibatalkan karena koreksi uang. Lewat jatuh tempo hanya indikator/tagihan manual, bukan job pembatalan.
- Backend tetap memasukkan biaya/adjustment sah yang disepakati pada kontrak domain ke total final. FE ini belum mengimplementasikan seluruh additional-time/addendum Desman dan bukan pengganti ledger server.
- Tidak membuka mock/LocalStorage ke produksi; endpoint bisnis/invoice action belum dibuat; SQL migration/model telah ditambahkan pada tahap fondasi24 Oktober.

## Verifikasi

Regresi mencakup full di awal, alokasi FIFO, tanpa duplikasi kas/DP, cicilan sebelum sesi, jatuh tempo WIB/reschedule, status akhir belum lunas, isolasi ledger, harga snapshot, pembatalan atas invoice terbentuk, dan pembatasan role. Hasil tes terbaru lihat [handoff](SESSION_HANDOFF.md).

Pola pemisahan penerimaan awal dan penerapannya pada invoice diadaptasi untuk kebutuhan ini, bukan menambah gateway/ERP: [Microsoft Learn - Customer prepayment invoices](https://learn.microsoft.com/en-us/dynamics365/finance/accounts-receivable/customer-prepayment-invoice). Detail aturan hari terakhir, empat sesi, akses role, dan pembatalan tetap keputusan proyek.

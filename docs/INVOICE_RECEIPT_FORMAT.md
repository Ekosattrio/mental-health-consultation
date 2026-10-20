# Format invoice, addendum dan receipt
Format awal dengan placeholder; template final tanda tangan/stempel belum disahkan.
## Header
[LOGO_PRAKTIK], [NAMA_PRAKTIK], [ALAMAT], [TELEPON_WA], [EMAIL], [SIP], [STR], [REKENING/QR].
## Identitas
Nomor JS-INV-YYYYMMDD-000001 untuk invoice; JS-RCP-YYYYMMDD-000001 untuk receipt. Sequence server dan unique constraint, bukan menghitung row browser. Kind BASE/ADDENDUM/ADJUSTMENT; parent invoice pada tambahan. Tanggal, template_version, issuer dan billing account tercantum.
Nama pasien aktual, penanggung jawab secukupnya, kode booking/case, layanan, sesi ke-N dan jadwal snapshot. Perubahan jadwal ditautkan sebagai riwayat, tidak mengganti PDF terbit.
## Rincian
| Jenis | Tampilan |
|---|---|
| BASE_SERVICE | Harga normal,qty,unit/subtotal |
| GLOBAL_PROMO | Potongan global; harga normal dicoret, final jelas |
| PERSONAL_DISCOUNT | Potongan khusus dengan label/alasan |
| ADDITIONAL_TIME | Total menit aktual, blok15menit, tarif snapshot, selisih revisi |
| FORMAL_REPORT | Laporan Konseling permintaan Rp200000 |
| CUSTOM_CHARGE | Label,qty,nominal positif |
| CORRECTION | Referensi item asal dan arah penyesuaian |
| UNSERVED_BALANCE_RELEASE | Pelepasan sisa karena layanan belum dimulai lalu ditutup; arah MINUS, tertaut invoice asal; nominal rinci khusus pasien/owner |
Total kewajiban = PLUS-MINUS seluruh invoice terkait. Tidak ada refund. Semua Asesmen termasuk laporan; jangan otomatis menagih FORMAL_REPORT200000 untuknya. Psikoterapi invoice per sesi; asesmen satu invoice dasar per case.
## Receipt
Hanya untuk uang VERIFIED: nomor transaksi, received_at, verified_at, metode, nominal diterima dan tagihan saat terbit. Receipt penuh pasien/owner dapat memuat total terbayar/sisa saat itu. Unggahan/PENDING_RECONCILIATION bukan receipt uang diterima.
Admin dapat mencetak proyeksi invoice harga/diskon/total tanpa saldo/agregat pembayaran. Admin tidak mengambil receipt penuh lewat endpoint print/file.
## Tambahan setelah lunas
Invoice900000 dan receipt900000 tetap utuh saat tambahan225000 dibuat. ADDENDUM225000 mengacu invoice dasar/billing account sama; halaman pasien menampilkan kewajiban1125000 dan sisa225000. Receipt tambahan terbit sesudah uang diterima.
## Footer dan akses
Dibuat [NAMA_PRAKTIK]; diverifikasi [PETUGAS]; penanggung jawab [PRAKTISI]; ruang tanda tangan dan [STEMPEL]. Tidak meniru tanda tangan nyata.
Pasien hanya dokumen miliknya sampai billing_accounts.download_until = service_terminal_at +7hari. Terminal mencakup layanan selesai atau penutupan sah tanpa layanan (termasuk batal/expired/hak no-show berakhir); asesmen memakai penutupan seluruh case, bukan pertemuan pertama. Request sah yang belum diselesaikan tidak menutup hak lebih dahulu. Ringkasan tetap ada. File private/retensi F15. Reissue berjejak, dokumen asli immutable.

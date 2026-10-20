# Hasil penyelarasan aturan — 19 Oktober 2026
> Dilengkapi oleh [audit integrasi setelahnya](AUDIT_INTEGRASI_DOKUMEN_2026-10-19.md), yang menemukan dan memperbaiki celah field/versi, penutupan tagihan dan hubungan antarfitur yang belum tertutup oleh inspeksi struktur di laporan ini. Gunakan kontrak aktif dan panduan Eko terbaru.
Pekerjaan **docs saja**, tidak menilai kesiapan/keamanan kode. Seluruh status “diperbaiki” di bawah berarti kontrak dokumen diperbarui, bukan implementasi sudah lulus uji.
## Jawaban atas koreksi terakhir
1. Kedatangan: Admin wajib periksa, approve uang yang terbukti diterima atau tagih di luar sistem lalu catat aktual. Check-in setelah minimum, tidak menunggu SLA.
2. Bukti ditolak dapat diperbaiki, versi asal utuh; reupload tidak resetSLA. Default window24jam konfigurabel dibatasi awal sesi, dengan jalur kedatangan.
3. Kelayakan reschedule berdasarkan requested_at.
4. Recovery no-show mempertahankan event lama dan mengaktifkan usaha jadwal baru pada layanan/tagihan sama.
5. Tarif tambahan25% per15menit hanya Konseling.
6. Pembulatan total tambahan aktual per usaha sesi, invoice hanya selisih revisi.
7. Biaya setelah lunas menjadi addendum, receipt tidak berubah.
8. Diskon dipulihkan: promo global Admin/Superadmin, harga normal dicoret setelah login; potongan khusus beralasan pada tagihan. Bukan custom charge negatif.
9. Larangan nominal Admin berasal dari ROLES_PERMISSIONS/API_BOUNDARY/F08/spesifikasi lama Eko, bukan larangan eksplisit pada ide §3.3/§14. Jawaban terbaru developer: harga/diskon/total boleh, **saldo tidak boleh**, pendapatan/pengeluaran hanya Superadmin. Seluruh DTO/print/export mengikuti batas ini.
10. Psikoterapi minimum4 tidak menciptakan utang sesi belum dipesan; extend eksplisit untuk sesi5. Asesmen ditutup berdasarkan cakupan.
11. Jam klinik berubah memicu informasi ke pasien dan permintaan memilih kembali tanpa kuota pasien; tidak sekadar warning.
12. Kamusdata, API, fitur, retensi, hasil offline, pengeluaran/surplus dan exportjadwal diselaraskan.
## Pembaruan scope dan kelengkapan
- Dasar25% saat promo sudah ditutup sebagai fitur konfigurasi per versi paket oleh Admin/Superadmin (F04/F08); bukan lagi pertanyaan untuk memilih satu basis global. Pilihan NORMAL_PRICE/FINAL_PRICE wajib sebelum Konseling bookable dan disnapshot pada booking; transaksi lama tidak berubah.
- Penyelesaian lebih bayar sudah diputuskan di luar sistem; tidak ada status/tiket resolusi. Penerimaan aktual/perhitungan tetap benar, tanpa fitur refund/credit/hangus.
- Telelayanan Google Meet sudah ditetapkan: Admin mengisi link booking dan sistem otomatis mengirim ke WA pasien via Baileys. F20 menjelaskan field, akses, antrean/gagal/resend, reschedule, penerima tanpa akun dan kehadiran online manual.
- Durasi paket tertentu, identitas/rekening/nomor nyata perlu diisi sebelum diaktifkan. Ini kelengkapan master, bukan alasan mengarang data.
Default operasional dari perancang yang belum menjadi angka eksplisit manusia: grace15menit, window pemilihan24jam dan window koreksi bukti24jam (tetap dibatasi awal sesi). Seluruhnya dilabeli, disnapshot dan dapat diatur owner; bukan diklaim berasal dari PDF.
## Matriks penutupan audit
| Temuan | Status kontrak dokumentasi | Rujukan |
|---|---|---|
| R01 deadline | Ditetapkan min24jam/awal sesi | F06, waktu operasional |
| R02 kedatangan/SLA | Wajib cek, approve aktual atau tagih offline | F08,F10 |
| R03 bukti ditolak | Koreksi versi, batas perlindungan, SLA tak reset | F08 |
| R04 prioritas kalender | Override tanggal menggantikan mingguan; satu kalender | F05,schema |
| R05 dampak perubahan jam | RequestCLINIC+notifikasi+pilih kembali, quota0 | F05,F09 |
| R06 durasi belum pasti | Non-bookable sampai diisi; bukan menebak60menit | F04,F05 |
| R07 waktu request | Eligibility requested_at, Admindelay bukan keterlambatan pasien | F09 |
| R08 recoveryNO_SHOW | Event lama utuh, usaha baru status aktif | F09,F10 |
| R09 kuota/4hari | Count APPLIED; akhir tanggal sesi+4WIB; pending tepat waktu diputuskan dahulu | F09 |
| R10 scopeadditional | Konseling saja | F04,F08 |
| Tambahan: basis tarif saat promo | Pengaturan versi paket oleh Admin/Superadmin, preview dan snapshot historis | F04,F08,API,schema |
| R11 pembulatan | Total per appointment+attempt, tagih selisih revisi | F08,schema |
| R12 aktual/jadwal/tagihan | Dipisahkan; walk-in tidak menabrak layanan yang masih berjalan | F05,F08,F10 |
| R13 dokumenpaid | Receipt tetap, invoice addendum tertaut | F08,formatdokumen |
| R14 diskon | Kebijakan lama dibatalkan; promo global+diskonindividual resmi | F04,F08,F17 |
| R15 akses Admin | Manusia menetapkan harga/diskon/total boleh; saldo tidak; finance khususowner | ROLES,API |
| R16 overpayment | Penyelesaian di luar sistem; ledger aktual tetap, tanpa status/tiket resolusi | F08,KNOWN_ISSUES |
| R17 cash | Tidak wajib bukti/nama rekening | F08,API |
| R18 kas historis | received_at; revisi verifikasi terlambat dengan as_of | F14 |
| R19 batas psikoterapi | Tak ada utang sesi belum dipesan; extend sebelum sesi5 | F11 |
| R20 lanjutan asesmen | Admin jadwalkan; owner scope/close/reopen | F18 |
| R21 draftFK | Nullable sebelum bind; insert order jelas | F07,F15,schema |
| R22 klaimwalkin | Admin verifikasi, bukan auto-match | F03 |
| R23 Googlelink | Bukti penguasaan akun; blocked semua metode | F01 |
| R24 penerimaWA | Owner operasional; klinis berupa link berizin | F13 |
| R25 retensi/download | File1tahun, aksesPDF7hari, tombstone/restore | F15 |
| R26 laporanasesmen | Included, boleh offline, metadata saja | F18 |
| R27 reviewunit | Satu perbillingaccount; edit moderasiulang | F12 |
| R28 kamusdata | UUIDCHAR36, Rupiahinteger, kolom/FK/index, locking | DATABASE_ARCHITECTURE |
| R29 API | Cookie,roleDTO,guard/error; contoh legacy diganti | API |
| R30 expense/export | Expense/surplusowner + exportjadwalAdmin | F14,F19 |
| R31 fitur | F01–F20 dilengkapi template, gagal/transisi | features/ |
| R32 otoritas | Keputusan manusia mengalahkan rekomendasi/histori | DOCS_ARCHITECTURE |

## Pemeriksaan dokumen
Hasil inspeksi teks setelah F20: 20 file fitur mempunyai seluruh 10 bagian template; tautan Markdown lokal yang diperiksa tidak putus; 46 tabel domain terdaftar dengan seluruh target FK kolom terdefinisi. Tidak ditemukan aturan aktif Telelayanan ditunda atau kelebihan bayar masih menunggu keputusan; kolom resolusi kelebihan bayar sudah tidak ada. Pemeriksaan ini hanya terhadap dokumen, bukan pengujian aplikasi/database berjalan.

Periksa keberadaan fitur/heading, link lokal, konsistensi enum/PK/FK, proyeksi Admin, contoh API dan sumber histori. Tidak menjalankan Git, source checker, aplikasi, test atau build.
Kamusdata dan aturan concurrency adalah rancangan yang perlu diwujudkan serta diverifikasi oleh pengembang kemudian. Tidak ada klaim dokumen atau aplikasi bebas semua bug.

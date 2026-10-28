# Implementasi web terpadu — 26 Oktober 2026

Dokumen ini menjelaskan hasil implementasi lanjutan setelah [fondasi database](FONDASI_DATABASE_DAN_MODEL_2026-10-24.md). Otoritas aturan adalah [keputusan aktif](KEPUTUSAN_AKTIF_2026-10-24.md), ditambah keputusan pengguna yang dijabarkan pada fitur. Catatan prototype/keputusan22 Oktober bukan otoritas untuk mengembalikan DP Rp100.000 atau H+1.

## Bentuk aplikasi

Satu proyek Laravel13 + Inertia3 + React19/TypeScript. Laravel menangani session, CSRF, validasi, authorization, transaksi, database, file dan pekerjaan latar belakang. React menangani tampilan dan form. Tidak ada backend REST terpisah, token bearer, atau keharusan Sanctum untuk web ini. Route PHP berada di routes/web.php.

Tampilan operasional berada di resources/js/pages/Practice/Workspace.tsx dan resources/js/practice/. Pola sidebar, kartu, warna dan komponen beranda Eko dipertahankan. Data berasal dari props Inertia dan GET /work/data. AppContext/mock/LocalStorage lama hanya untuk preview lokal yang dimatikan secara default. Jangan mengimpor state prototype ke workspace operasional.

Pembaruan lanjutan: Google One Tap/SSO, linking akun aman, pengingat pasien dan status/pairing WhatsApp telah diimplementasikan. Pengirim pengguna sudah dikonfigurasi; aktivasi nyata masih membutuhkan pairing serta kredensial Google. Lihat [panduan WhatsApp dan Google](INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md). Lihat [panduan VPS dan integrasi](OPERASIONAL_VPS_DAN_INTEGRASI.md).

## Peta implementasi

| Bagian | Lokasi dan tanggung jawab |
|---|---|
| HTTP | app/Http/Controllers: validasi form, role, versi dan respons |
| Aturan domain | app/Domain: Calendar, Bookings, Billing, FinancialActions, Operations, Administration |
| DTO | WorkspaceData: whitelist sesuai role; model tidak dilempar utuh ke browser |
| Pengiriman | Notifications, Clockwork, app/Jobs, services/whatsapp |
| PDF/ekspor | Documents, Reports, GenerateExport, resources/views/documents |
| Penyimpanan | database/migrations, database/schema/domain-schema.json, app/Models |
| Uji | tests/Integration/DomainWorkflowTest.php dan tests/Support/concurrent-booking-worker.php |

## Peran dan batas data

- Guest melihat company profile, katalog tanpa harga, ulasan yang disetujui dan kebijakan publik.
- Pasien mengelola profil orang yang ditanggung, profiling digital, persetujuan, booking, bukti, pengajuan reschedule, dokumen dan ulasan miliknya.
- Admin mengelola administrasi, jadwal, tarif/promo, potongan khusus, biaya tambahan, penerimaan nyata, verifikasi, CMS administratif, laporan penyerahan asesmen dan link Meet. Admin tidak menerima saldo, agregat penerimaan, receipt penuh, jawaban profiling atau tujuan klinis.
- Superadmin membaca data klinis dan laporan keuangan, mengelola pengeluaran, praktik, akun internal, cakupan asesmen serta penutupan rencana. Pencatatan/verifikasi uang masuk tetap dilakukan Admin sesuai pembagian tugas.

Profiling offline menggunakan kertas langsung ke praktisi. Admin tidak mengetik jawaban klinis. Profil pasien yang dibuat saat instalasi tidak berisi tanggal lahir/keluhan buatan; data administratif perlu dilengkapi sebelum booking online.

## Alur yang harus dipahami Eko

1. Booking melakukan preview harga/kalender, lalu create dengan quote_token. Server memeriksa ulang semuanya dalam transaksi. Preview tidak mengambil slot.
2. Online boleh hari yang sama setelah180 menit kerja penuh. Jam tutup, istirahat dan libur tidak dihitung. Deadline awal adalah min(waktu reservasi+24jam, awal sesi−2jam). Anchor tidak berubah karena refresh atau unggah ulang.
3. Bukti tepat waktu melindungi slot. SLA12jam kerja dapat membuat CONFIRMED_AUTO_SLA/PENDING_RECONCILIATION; tidak membuat uang VERIFIED atau receipt. Admin memeriksa dan menagih saat pasien datang.
4. Transfer/pembayaran dicatat sebagai penerimaan terpisah. Rp1 tidak menghapus sisa tagihan. Uang terverifikasi tidak ditimpa; koreksi memakai reversal dan penerimaan pengganti bila ada.
5. Reschedule memakai request tersendiri. Jadwal lama masih aktif sampai APPLIED. Pemindahan atomik melepas interval lama; tidak ada flag isBooked paralel. Riwayat NO_SHOW tersimpan sebagai event, sedangkan attempt baru aktif.
6. Psikoterapi membuat invoice setiap sesi yang dipesan. Kesepakatan tarif empat sesi dibekukan. Pembayaran di muka dialokasikan FIFO tanpa membuat receipt kedua. Tidak ada invoice/utang untuk sesi yang belum dipesan.
7. Asesmen adalah layanan tes. Satu case/tagihan dapat mencakup testing, evaluasi dan pertemuan lanjutan. Laporan asesmen termasuk dan boleh diserahkan offline; status penyerahan dicatat tanpa mengunggah dokumen klinis oleh Admin.
8. Overtime hanya Konseling, ceil(total menit tambahan/15),25% dari basis harga yang dipilih pada versi paket. Koreksi kumulatif membuat selisih addendum. Receipt lama tetap utuh.
9. Cancel/berakhir sebelum layanan menutup bagian belum diberikan melalui adjustment berjejak. Uang masuk tetap tercatat dan sisa belum diberikan tidak ditagih. Bagian asesmen yang sudah diberikan tetap kewajiban; nominal pelepasan parsial diputuskan owner.
10. Janji kustom mempunyai mode REQUIRED, INCLUDED atau NOT_REQUIRED. Tanpa biaya tidak membuat pembayaran nol/PAID. INCLUDED hanya boleh memakai billing pasien yang sama. Semua tetap mengonsumsi slot.
11. Perubahan kalender dipreview lalu diterapkan dengan versi dan token dampak. Janji terdampak memperoleh request asal klinik serta notifikasi. Kuota yang dikurangi membatasi booking baru; tidak membatalkan appointment lama secara diam-diam.
12. Link Meet diisi Admin, dibatasi URL Google Meet sah dan nomor penerima terkonfirmasi. Pengiriman sesudah commit melalui outbox. Versi link/attempt lama dibatalkan sebelum dikirim.

## Kontrak form dan penanganan gagal

Frontend menggunakan practice/http.ts untuk CSRF, JSON pendukung dan Idempotency-Key. Bentuk sukses adalah {data:...}. Validasi gagal422, objek di luar akses404/403, session tidak sah401, CSRF kedaluwarsa419. Optimistic model conflict dapat409; guard versi form menggunakan422. Dialog gagal tetap terbuka dengan isian dan pesan kesalahan.

expected_version berasal dari row_version server, bukan timestamp browser. Ulangi aksi jaringan yang hasilnya belum diketahui dengan key yang sama. Jangan menyatakan sukses sebelum respons tersimpan. Key sama dengan isi berbeda ditolak. Kunci disimpan sebagai hash intent; jawaban klinis tidak disimpan ke LocalStorage/sessionStorage.

Untuk praktik satu praktisi, urutan lock diawali owner_settings sebagai mutex praktik, lalu resource/tanggal, scope plan/case, appointment/request dan billing. Ini juga melindungi tanggal kosong terhadap race perubahan kalender. Semua penulisan bisnis harus melewati action tersebut; jangan menambah query update bebas dari komponen.

Timestamp disimpan UTC; tanggal kalender dan tampilan memakai Asia/Jakarta. datetime-local tanpa offset dinormalisasi sebagai WIB sebelum validasi. Nilai uang adalah integer Rupiah; persentase menggunakan basis poin.

## Riwayat, dokumen dan koreksi belakangan

Invoice/line item, receipt, alokasi dan event mempunyai jejak append-only. PDF memakai snapshot dan renderer lokal tanpa fetch remote/JavaScript/PHP. Unduhan pasien dibatasi tujuh hari sesudah layanan/case terminal; ringkasan transaksi tetap ada. File privat mempunyai retensi satu tahun, ekspor satu hari. Purge menghapus blob dan menyimpan tombstone, bukan menghapus ledger.

Laporan kas memakai received_at dan cutoff as_of yang sesungguhnya. Reschedule tidak memindahkan periode uang. Verifikasi/koreksi terlambat diberi penanda dan ditautkan ke jadwal/transaksi asal. File ekspor membekukan dataset ketika diminta; worker tidak membaca ulang data hidup.

users.auth_version mencabut sesi lama setelah perubahan akses/reset password. treatment_plans.administrative_closed_at mempertahankan fakta penutupan administratif historis. Koreksi pembayaran lama dapat membuat plan lama AWAITING_SETTLEMENT tanpa merusak unique guard plan baru yang sebelumnya sudah sah. Booking plan berikutnya tetap ditolak selama ada kewajiban aktif/belum diselesaikan.

## Instalasi lokal dan batas aktivasi

Database lokal telah memakai57tabel,113FK,175CHECK dan46trigger;58migration diterapkan tanpa reset data. Akun awal sesuai permintaan pengguna tersedia di [panduan akun](AKUN_AWAL_DAN_CARA_MASUK.md). Tidak ada transaksi/appointment demo yang dimasukkan ke database aplikasi.

Beberapa paket asesmen tidak mempunyai durasi pasti pada sumber. Paket tetap masuk katalog, tetapi belum bookable sampai Admin/Superadmin mengisi durasi dan menerbitkan versi paket. Sistem menyediakan pengaturannya; tidak menebak durasi tes.

Informasi praktik, rekening, SMTP, domain dan nomor tetap diisi operator sebelum dipakai publik. Pengiriman email lokal memakai log. WhatsApp dan Google belum dinyatakan teruji dengan akun nyata. Hasil pengujian akhir dan batas pemeriksaan dicatat pada [handoff](SESSION_HANDOFF.md).

Penyelesaian terakhir juga menyambungkan CTA/FAQ/logo/foto/footer CMS, informasi workspace patient/psychologist, penerbitan materi tutorial berversi, tour pertama dan replay. Hasil akhir32tes domain/182assertion,87tes frontend,34pemeriksaan schema serta2tes smoke dan2tes bridge tercatat pada handoff.

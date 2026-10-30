# TODO dan status — 29 Oktober 2026

Otoritas: [keputusan aktif Eko](KEPUTUSAN_AKTIF_2026-10-29.md). [Peta kode, endpoint dan alur](INTEGRASI_FE_EKO_2026-10-29.md).

## Selesai pada source

- [x] Feedback request aktual/simpan+refresh pada Superadmin/Admin/Pasien, skeleton awal/detail, transisi tab/tabel/dialog tanpa remount editor, status proses lambat dan error di atas modal. Paket/CMS loading/disabled; TypeScript/102tes/build lulus,43aset/font200. [Alur](DASHBOARD_FEEDBACK_2026-10-30.md).
- [x] Perhalus reveal/hover/press, hilangkan fade ulang selama geser halaman dan reveal parent ganda pada kartu. Pengguna sudah mengonfirmasi animasi muncul sebelum penyempurnaan ini; TypeScript/99tes/build lulus, aset terbaru HTTP200.
- [x] Build produksi setelah izin eksplisit terbaru; alihkan Laravel dari marker hot ke build dengan backup marker. Beranda/login/up dan seluruh41aset HTTP200; graph awal JS/CSS603.074byte. Tidak menjalankan dev server baru/Git atau mengendalikan Laragon.
- [x] Koreksi reveal kartu agar mulai saat masuk viewport/stagger, bukan habis sebelum terlihat; header tinggi tetap/state scroll seperlunya, transform-only feedback dan login shell lazy. TypeScript/99tes FE lulus.
- [x] Animasi klik/hover/slide dan reveal sekali dengan reduced motion; ServicePicker memakai kartu utuh, indeks/harga/count memo dan footer jam ringkas.
- [x] Eager-load versi katalog efektif dan bulk jam; query guest beranda29ke9, dengan regresi layanan banyak/versi masa depan.
- [x] Pisahkan context/content/default CMS dari provider/data demo di entry server; graph dev71ke44modul. Host font variable lokal/OFL, preload, hero eager dan gambar bawah lazy/async.
- [x] Libur mingguan/tanggal CLOSED menerima intervals kosong melalui preview/apply; OPEN tanpa jam/field hilang tetap ditolak, availability tertutup dan seluruh minggu libur diuji.
- [x] Slide layanan/ulasan per halaman utuh1/2/3kartu dengan rentang item/total/nomor halaman, resize alignment dan notes tetap terlihat.
- [x] Admin hanya booking/pembayaran, pengajuan reschedule, monitoring pengguna dan moderasi review. Guard endpoint/service owner serta redaksi CMS draft diterapkan; tab lama aman kembali ke booking.
- [x] Footer memakai kontak/identitas terkini dan jam kalender/CMS, tanpa placeholder/Instagram demo. Penyimpanan kontak CMS sampai halaman publik diuji.
- [x] Pemulihan dynamic import Inertia gagal dengan tombol reload manual, tanpa POST login/mutasi ulang. Login superadmin existing/dashboard/API200 diverifikasi; TypeScript dan93tes lulus. Hard refresh tab lama masih diperlukan setelah pergantian origin Vite.
- [x] Katalog landing satu baris geser dengan kategori, pencarian, penunjuk rentang dan notes terlihat; ulasan menjadi rail responsif dengan autoplay CMS/jeda dan panduan publik menjadi accordion. Pemilih layanan pasien/manajemen paket diperiksa sudah horizontal/paginasi.
- [x] Koreksi dropdown akun mobile agar mengikuti batas navbar, wrapping identitas/notifikasi, batas tinggi/scroll dialog lintas role, dan wrapping toolbar cetak/ekspor. Checker/regresi lulus; UAT visual tetap terpisah.
- [x] Route dashboard memakai komponen FE Eko untuk Pasien, Admin, dan Psikolog.
- [x] Navbar/footer FE dipakai pada halaman publik, akun, login dan dashboard.
- [x] Login modal memakai autentikasi Laravel/Google; tidak ada quick login demo di jalur operasional.
- [x] Profil pasien dan profil akun disimpan dengan versi; pembaruan akun/profil terkait berlangsung atomik.
- [x] Booking memakai pre-test baru, consent berversi, slot server, quote dan reservasi sebelum transfer.
- [x] DP FIXED Rp100.000 mengurangi biaya; pembayaran penuh di awal diperbolehkan.
- [x] Booking/reschedule/sesi berikutnya H+1 semua role; slot diperiksa ulang di transaksi server.
- [x] Bukti gambar/PDF tersimpan privat, dapat diperiksa Admin, dan upload dapat diulang tanpa mengganti ID berkas yang sudah berhasil diterima.
- [x] Admin mencatat DP/cicilan/pelunasan; penerimaan tersimpan dan saldo tidak dibaca kembali oleh Admin.
- [x] Retry request yang sama tidak menggandakan uang. Dua penerimaan nyata yang kebetulan sama nominal/metode/waktunya tetap dapat dicatat sebagai dua operasi berbeda.
- [x] Reschedule mempertahankan appointment/DP, pemeriksaan versi, jadwal lama sampai APPLIED, identitas pelaku dan pemilihan ulang saat slot bentrok.
- [x] Sesi berikutnya dan lifecycle layanan hanya Psikolog; Admin tetap dapat membantu reschedule.
- [x] Rangkaian psikoterapi empat sesi; invoice per sesi terjadwal, alokasi prabayar FIFO, tidak menambah sesi kelima pada plan lama.
- [x] Pembatalan/penghentian setelah tagihan terbentuk lunas; tidak ada auto-cancel no-show atau auto-confirm SLA.
- [x] Paket, diskon, notes, badge dan fasilitas tersimpan sebagai versi katalog; form lama ditolak jika versi paket berubah.
- [x] Kalender, CMS dan profil/foto praktik tersambung ke server tanpa memindahkan data demo.
- [x] Invoice/kwitansi PDF tersedia pada detail FE; laporan FE memakai penerimaan server tanpa menghitung ulang kas setiap sesi.
- [x] Migrasi lokal DP/presentation diterapkan tanpa reset akun, invoice atau ledger.
- [x] TypeScript checker dan tes regresi/integrasi dijalankan; hasil terakhir ada di SESSION_HANDOFF.

## Verifikasi developer dan aktivasi yang tersisa

- [ ] UAT feedback ketiga role setelah hard refresh: request lambat/paralel/gagal, refresh mempertahankan data dan input, detail pre-test, simpan paket/CMS, toast di atas modal pada320–430px, serta reduced motion. Browser automation belum tersedia; tidak mengklaim kecepatan SQL atau skor baru dari indikator loading.
- [ ] UAT animasi dengan no-preference/hasil matchMedia false setelah reload, kemudian uji reduce agar efek dimatikan dengan benar. Pengguna mengonfirmasi browser sebelumnya menghasilkan true. Audit Lighthouse ulang pada aset produksi; build/HTTP sudah diverifikasi, browser automation belum tersedia dan belum ada skor baru. [Bukti dan pengaturan](PERFORMANCE_2026-10-30.md).
- [ ] Isi alamat, telepon, WhatsApp, email dan Instagram praktik nyata melalui CMS Psikolog; database lokal belum memiliki kontak tersebut.
- [ ] UAT slide utuh pada HP/tablet/desktop, swipe/panah sampai akhir, resize serta ulasan dengan data; simpan ulang pilihan libur di browser dan periksa empat menu Admin pada desktop/mobile.
- [ ] UAT katalog/ulasan320–430px/tablet/desktop: swipe dan panah hingga kartu terakhir, keyboard, kategori/pencarian/hasil kosong, notes panjang, rentang setelah resize, autoplay CMS/jeda/reduced motion dan accordion panduan. Cek tarif tamu tetap tertutup dan CTA masuk ke layanan yang dipilih.
- [x] Browser Laravel kini menerima aset build terbaru setelah izin eksplisit; HMR dapat dipulihkan dengan restart satu Vite existing atau restorasi marker. Jangan menganggap source berikutnya otomatis masuk ke build.
- [ ] UAT interaksi langsung desktop/mobile: ketiga akun, seluruh dialog, input salah/gagal jaringan, upload, cetak PDF dan ekspor. Tes render source bukan pemeriksaan visual browser.
- [ ] Verifikasi visual koreksi clipping pada320/375/390/430px, landscape dan desktop: dropdown akun seluruh role, nama/email panjang, menu navigasi, dialog panjang dan toolbar cetak/ekspor. Otomasi browser belum tersambung pada sesi koreksi29Oktober.
- [ ] Lengkapi identitas/rekening/jam praktik dan durasi asesmen yang belum pasti melalui pengaturan/katalog, tanpa menebak data klien.
- [ ] Aktivasi Google dengan kredensial nyata serta WhatsApp dengan pairing dan worker/scheduler; uji kirim/penerimaan nyata belum dilakukan.
- [ ] Konfigurasi SMTP/domain, deployment dan backup produksi serta uji pemulihannya sebelum dipakai publik.

Tidak ada operasi Git atau deployment yang dilakukan AI. Tidak ada klaim bahwa seluruh UAT/aktivasi produksi sudah selesai.

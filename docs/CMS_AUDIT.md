# Audit dan Panduan CMS

 > Status integrasi22Oktober2026: dokumen ini mengaudit preview Eko, bukan seluruh target Desman yang telah diimplementasikan. Hak Admin target mengikuti [keputusan final](KEPUTUSAN_FINAL_2026_10_22.md) dan [F02](features/F02_PUBLIC_PROFILE_CMS.md); perbedaan source masih TODO.


Pembaruan: 22 Oktober 2026. Status: implementasi prototype frontend, bukan backend produksi. Menu **Psikolog > CMS Konten** hanya untuk psikolog/pengelola; admin operasional tidak berwenang mengedit CMS.

## Kesimpulan

CMS sudah mencakup konten operasional utama untuk scope booking: identitas/kontak praktik, materi landing, banner pasien, informasi praktik psikolog, rekening DP, dan kop laporan. Field yang sebelumnya belum tersambung telah dihubungkan ke komponen pembacanya. CMS ini bukan page builder: tidak semua kalimat, susunan halaman, atau aturan bisnis dapat diubah melalui editor.

## Yang Bisa Diganti

### Tab Landing Page

| Pengaturan | Dibaca di mana | Catatan |
|---|---|---|
| Badge, judul, dan subjudul hero | Bagian utama landing | Teks biasa, bukan HTML bebas. |
| Judul dan subjudul testimoni | Bagian carousel landing | Bukan editor untuk mengarang ulasan pasien. |
| Autoplay dan interval carousel | Gerakan carousel | Dapat dimatikan; interval valid 2-60 detik. Kontrol manual tetap tersedia. |
| Nama praktik | Kontak landing dan footer | Merek JiwaSehat di beberapa label/navbar/copyright belum merupakan pengaturan merek global. |
| Alamat praktik | Kontak landing, footer, konfirmasi booking tatap muka | Appointment baru menyimpan lokasi; perubahan CMS tidak memindahkan appointment tersimpan. Profil praktisi memiliki alamat tersendiri di Profil Praktik. |
| Jam informasi praktik | Kontak landing dan footer | Teks informasi saja. Slot aktual tetap di Jadwal & Hari Praktik, bukan ditentukan dari teks ini. |
| Telepon, WhatsApp, dan email | Kontak landing dan footer | Isi dengan kontak nyata yang disetujui pengelola. Tidak otomatis mengirim WhatsApp. |
| URL Instagram | Footer | Gunakan URL HTTPS Instagram, bukan nama akun tanpa tautan. |
| URL logo | Navbar/footer dan fallback logo laporan | Gambar rusak memakai fallback. |
| URL gambar hero dan profil/tentang | Landing | Opsional; gambar kosong/rusak tidak wajib diganti ilustrasi palsu. |
| URL logo kop | Pratinjau laporan/print PDF | Fallback ke logo praktik. Tidak menanam gambar ke berkas Excel HTML. |
| URL QRIS kasir | Modal pencatatan pembayaran admin saat memilih QRIS | Referensi kasir, bukan payment gateway atau metode DP mandiri baru. Gunakan QRIS asli milik praktik. |
| Bank, nomor rekening, nama pemilik | Instruksi transfer DP setelah hold dan consent | Ketiga field wajib lengkap. Snapshot penerima disimpan ketika hold dibuat. |

### Tab Halaman Pasien

| Pengaturan | Dibaca di mana |
|---|---|
| Judul dan subjudul sambutan | Panduan Konseling/beranda pasien |
| Tip informasi harian | Beranda pasien |
| Pengumuman opsional | Beranda pasien; kosong berarti disembunyikan |
| Judul, keterangan, telepon, dan WhatsApp bantuan | Area bantuan beranda pasien |

Nomor dan informasi bantuan seed adalah data demo, bukan layanan yang telah diverifikasi. Pengelola wajib memeriksa nomor, jam layanan, dan isi klinis sebelum publikasi. Placeholder lama yang mengklaim enkripsi end-to-end diganti informasi netral bila masih persis sama dengan seed lama; pengumuman custom tidak ditimpa.

### Tab Halaman Psikolog

| Pengaturan | Dibaca di mana |
|---|---|
| Judul/isi panduan | Ringkasan Praktik |
| Judul/isi pengumuman | Ringkasan Praktik |
| Kebijakan internal dan kontak supervisor | Ringkasan Praktik |
| Nama praktik dan psikolog pada kop | Laporan/pratinjau/print |
| Nomor SIP/STR pada kop | Laporan/pratinjau/print; diisi data nyata, bukan validasi izin otomatis |
| Alamat, telepon, email, dan website kop | Laporan/pratinjau/print |
| Kota dan jabatan penanda tangan | Bagian penutup laporan |

Teks kebijakan internal tidak mengubah perhitungan uang masuk, harga, atau hak akses.

## Pengaturan yang Sengaja Terpisah

| Kebutuhan | Menu yang digunakan |
|---|---|
| Tarif, diskon tanpa voucher, kategori, durasi, metode, manfaat, dan notes layanan | Manajemen Paket |
| Pendidikan, bio, foto, spesialisasi, pendekatan, bahasa, kredensial, dan alamat praktisi | Profil Praktik; tersedia pada sidebar desktop dan menu ponsel |
| Nama akun, nomor telepon, kontak darurat pasien | Avatar > Detail Profil & Akun; email SSO tidak dapat diubah dari form ini |
| Jam kerja, hari libur, kuota dan override tanggal | Jadwal & Hari Praktik |
| Publikasi ulasan asli | Moderasi Review oleh admin |

Status ketersediaan praktisi pada CMS bersifat badge informasi publik. Untuk menutup slot booking, pengelola tetap mengubah kalender. Tidak ada CMS untuk mengubah DP Rp100.000, batas H+1, hak akses, atau aturan psikoterapi empat sesi.

## Cara Simpan dan Dampaknya

1. Buka subtab yang sesuai, ubah field, lalu simpan subtab tersebut.
2. Frontend menulis LocalStorage sebelum memperbarui tampilan dan memberi pesan sukses. Penyimpanan penuh/gagal menghasilkan error, bukan sukses semu.
3. Tab lain pada browser/origin yang sama menerima pembaruan melalui storage event. Ini bukan sinkronisasi antarperangkat.
4. Reset mengembalikan subtab ke nilai demo dan mencoba menyimpannya; bukan tombol membatalkan draft tanpa simpan. Jangan reset rekening/kontak yang sudah memakai data nyata.
5. Perubahan rekening hanya berlaku bagi hold baru. Pasien yang sudah menerima instruksi tetap melihat snapshot bank/pemilik rekening pada hold-nya; jangan mengarahkan pasien transfer dua kali karena rekening CMS berubah.
6. Bukti terlambat masih masuk pencocokan pembayaran. Expiry tidak menghapus bukti/histori atau membatalkan appointment otomatis.

## Belum Menjadi Editor CMS

| Bagian | Status dan saran |
|---|---|
| Isi FAQ landing dan pasien | Masih array statis; tambah CRUD pertanyaan/jawaban/urutan jika klien perlu sering mengubahnya. |
| Kebijakan privasi dan informed consent | Dokumen/copy masih ditentukan source. Editor produksi harus berversi agar booking lama tetap menunjuk persetujuan lama. Jangan sekadar menimpa teks global. |
| SEO, judul halaman, metadata berbagi, favicon | Masih konfigurasi/source. Dapat menjadi pengembangan berikutnya, bukan field aktif CMS sekarang. |
| Copyright, semua label merek, navigasi, dan copy instruksi tetap | Belum seluruhnya mengikuti nama praktik CMS. Perlu pekerjaan branding terpisah bila ingin white-label penuh. |
| Susunan section, warna, dan layout bebas | Bukan scope editor saat ini; mengubahnya melalui source. |
| Upload aset CMS ke storage permanen | Editor menggunakan URL. Service upload sudah kontrak; belum backend/storage nyata. |
| Riwayat revisi/publikasi konten | Belum tersedia. Backend perlu audit siapa mengubah apa dan kapan. |

Untuk kebutuhan booking saat ini, prioritas berikutnya adalah QA browser semua field dan pengisian konten nyata. FAQ CRUD dan consent berversi layak diprioritaskan jika pengelola ingin mengelola isi tanpa developer; belum diklaim selesai pada audit ini.

## Kontrak Backend

- `GET /cms/landing` hanya Resource publik; jangan menyertakan rekening/QRIS kasir. Owner mengambil konfigurasi lengkap melalui `GET /psychologist/cms/landing`.
- Semua mutasi CMS dan upload aset wajib Policy psikolog/pengelola. Admin tidak boleh menulis CMS meskipun nama file komponen lama masih `admin/tabs/CmsTab.tsx`.
- Instruksi pembayaran berasal dari snapshot server pada hold milik pasien setelah alur consent yang berlaku, bukan menerima nomor rekening dari payload pasien.
- Validasi URL, tipe/ukuran aset, allowlist field, audit perubahan, dan persistensi database wajib di server. TypeScript maupun menyembunyikan form bukan batas keamanan.
- LocalStorage masih dapat dibaca/diedit pengguna melalui browser; jangan isi data klinis atau bukti produksi pada prototype.

## Verifikasi

TypeScript 0 error dan 36/36 tes regresi terfokus. Tes meliputi validasi/persistensi CMS gagal, render footer/banner, profil, versi reschedule, expiry hold, timeline, serta posisi tooltip. Bukan QA visual browser, pemeriksaan gambar eksternal, cetak A4, atau uji backend. Dev server, build, dan Git tidak dijalankan.

Lihat [panduan per role](PANDUAN_FITUR_PER_ROLE.md), [API](API.md), [isu tersisa](KNOWN_ISSUES.md), dan [TODO](TODO.md).

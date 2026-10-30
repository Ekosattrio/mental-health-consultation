# Feedback data dan animasi dashboard — 30 Oktober 2026

Permintaan Eko: beri animasi dan loading pada Superadmin/Psikolog, Admin dan Pasien saat mengambil, menampilkan, mengedit dan menyimpan data agar pengguna memahami proses yang sedang berjalan.

## Perilaku per proses

| Proses | Feedback |
|---|---|
| Modul halaman belum siap | Skeleton kartu/tabel dan teks menyiapkan halaman |
| GET data/sinkronisasi | Status memuat data terbaru; isi yang sudah ada tetap terlihat |
| Memuat availability | Status memuat jadwal tersedia; validasi/pilihan slot existing tetap dipakai |
| Membuka detail pasien yang pre-test-nya belum dimuat | Skeleton detail dan status memuat data pasien |
| Berpindah tab | Fade240ms pada konten tanpa menunggu waktu tambahan |
| Data tabel diperbarui | Fade singkat pada maksimal tiga tabel/area data; dilewati ketika fokus masih berada di input panel |
| Membuka form/dialog | Entry220ms melalui opacity/transform, dengan reduced motion |
| Mengirim/mengunggah/menyimpan | Spinner dan pesan proses aktual, tetap terlihat di atas modal |
| Menyimpan paket/CMS | Tombol berstatus menyimpan dan form sementara disabled; kegagalan mempertahankan isian |
| Request berlangsung lebih dari8detik | Penjelasan bahwa proses masih berjalan, tanpa persentase atau hasil keberhasilan rekaan |
| Kegagalan | Spinner berhenti, error tersedia; kegagalan refresh mempertahankan data dan menawarkan muat ulang |

Ketiga dashboard memakai DashboardPanel yang sama. Superadmin tetap menggunakan PsychologistDashboard. Empat menu Admin, redaksi nominal, DP100ribu, H+1, lifecycle dan seluruh aturan transaksi tidak berubah. Feedback tidak menambahkan request otomatis; tombol Perbarui data memanggil refresh yang sudah ada saat ditekan.

## Alur teknis

`practice/http.send` mendaftarkan aktivitas sebelum proses request dan melepasnya dalam finally, termasuk bila digest, fetch, pembacaan respons atau validasi gagal. Store menghitung operasi secara terpisah: satu request selesai tidak boleh mematikan indikator request lain. Handler action ServerAppProvider menahan satu aktivitas tambahan sepanjang proses simpan beserta refresh lanjutan, sehingga indikator tidak menyatakan selesai hanya karena POST sudah kembali.

Snapshot hanya berisi hitungan, label proses dan waktu mulai, tanpa URL, identitas pasien, formulir, nominal atau isi respons. Request preview diperlakukan sebagai pemeriksaan, bukan klaim data tersimpan. Tidak mengubah CSRF, idempotency key, payload, hak akses, endpoint atau hasil/error request.

DashboardPanel memakai transisi pada node yang sama; perubahan revision tidak dijadikan key yang membongkar form. Refresh tidak mengganti seluruh data dengan skeleton. Skeleton hanya untuk tahap awal atau detail yang belum tersedia. Input tidak di-reset oleh komponen feedback. Form paket/CMS menunggu Promise aktual; form paket juga tidak dapat ditutup/diganti selama penyimpanan. Pesan toast memakai portal di atas lapisan modal dengan gutter dan batas tinggi viewport agar error tidak tersembunyi di belakang form.

Animasi spinner/skeleton hanya hidup selama komponen loading tampil. Tidak menambah library, polling, delay minimum, persentase palsu atau loop JavaScript per frame. Shimmer/spinner/dialog hanya bergerak pada no-preference; pada reduced motion teks/status tetap tersedia. Transisi tab/data juga menghormati preferensi itu. Skeleton/dekorasi tidak membawa data pasien.

## Verifikasi

- TypeScript lulus;102tes frontend lulus, termasuk render tab seluruh role.
- Regresi baru mencakup request paralel, pelepasan status setelah error, tracking send aktual dengan header CSRF/idempotency dan hasil/error tetap, serta perbedaan tampilan memuat/lambat/gagal/siap.
- Build akhir berhasil1,54detik. Laravel memuat main-D08msmhv.js/main-BbblIWod.css tanpa Vite client; beranda dan43aset manifest200. Font runtime200/font/woff2,27.348byte.
- Graph awal beranda17berkas JS/CSS605.675byte (gzip estimasi lokal173.618byte), bukan ukuran transfer terkompresi aktual. Build tetap memberi peringatan URL font runtime; URL-nya sudah terbukti200.
- public/hot tetap tidak ada. Tidak menjalankan dev server baru, Git, perubahan database atau pengelolaan MySQL/Apache.

UAT visual pada perangkat belum dilakukan agent karena otomasi browser tidak tersambung. Perlu hard refresh, lalu cek ketiga role: pindah tab, refresh lambat, buka detail, edit/simpan berhasil/gagal, input tetap ada, modal/toast320–430px dan reduced motion. Waktu request/SQL tidak dipercepat oleh indikator ini dan skor Lighthouse/FPS baru belum diukur.

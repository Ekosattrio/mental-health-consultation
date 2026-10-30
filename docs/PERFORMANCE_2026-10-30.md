# Optimasi tampilan dan pemuatan - 30 Oktober 2026

Permintaan Eko: animasi klik/geser/scroll yang ringan, jam footer ringkas, pemilih layanan pasien yang rapi, serta optimasi query/pemuatan. Aturan bisnis dan hak akses mengikuti [keputusan aktif](KEPUTUSAN_AKTIF_2026-10-30.md).

## Feedback loading dashboard seluruh role

Permintaan berikutnya menambahkan status request aktual/simpan+refresh, skeleton awal/detail, fade tab/data tanpa remount editor, entry dialog serta toast di atas modal. Tidak menambah delay minimum/library/polling atau mengosongkan data saat refresh. TypeScript/102tes FE lulus; build akhir1,54detik,43aset/font200. Aset aktif main-D08msmhv.js/main-BbblIWod.css, graph awal beranda17berkas605.675byte (gzip lokal estimasi173.618byte). Ini feedback FE, bukan klaim optimasi SQL/FPS/skor baru. [Alur, aturan dan verifikasi](DASHBOARD_FEEDBACK_2026-10-30.md).

## Histori penyempurnaan setelah animasi terlihat

Eko mengonfirmasi animasi sudah bisa muncul, lalu meminta gerakan lebih smooth. Reveal section kini600ms dengan jarak16px dan opacity awal0,4; easing cubic-bezier(0.22,0.61,0.36,1) mengurangi hentakan awal. Rail memakai560ms/12px/stagger45ms hanya saat pertama terlihat atau hasil filter dipasang; pindah halaman tidak memulai fade/gerakan vertikal baru di tengah scroll horizontal native. Heading katalog/ulasan dipisahkan dari reveal rail agar tidak ada opacity/transform berlapis pada kartu.

Hover kartu dikurangi4px ke2px, tombol2px ke1px; press dari scale0,95 ke0,98 dan aturan active diletakkan setelah hover agar tetap terlihat pada desktop. Transisi hanya transform, tanpa menambah library, loop rAF, animasi tinggi/lebar atau will-change global. Dukungan reduced motion, snap kartu utuh, notes, fokus dan aturan bisnis tetap dipertahankan.

Verifikasi terbaru: TypeScript/99tes frontend lulus; build exit0/1,80detik. Laravel memakai main-fd6nyBvm.js/main-D-w7fyf2.css tanpa Vite client; beranda dan seluruh41aset manifest200, font lokal200/font/woff2. Graph awal main+Home16berkas JS/CSS603.200byte, estimasi gzip lokal172.647byte; bukan transfer gzip aktual atau skor Lighthouse. public/hot tetap tidak ada. Build font memberi peringatan URL runtime yang sama, dan URL tersebut tetap200. Tidak mengendalikan server existing/Laragon/Git. Pengguna perlu reload setelah build; tingkat kehalusan pada perangkat dan skor Lighthouse baru belum diukur oleh agent karena browser automation tidak terhubung.

## Histori build produksi lokal setelah izin terbaru

Diagnosis lanjutan30Oktober: pengguna mengonfirmasi `matchMedia('(prefers-reduced-motion: reduce)').matches` menghasilkan `true` pada browser yang tidak menampilkan animasi. `revealWhenVisible` berhenti sebelum memasang observer pada kondisi tersebut; efek CSS hover/press juga hanya aktif dalam `no-preference`, dan slide memilih scroll tanpa smooth. Jadi pengurangan gerakan yang aktif menjelaskan hilangnya efek meskipun aset build sudah berhasil dimuat. Belum dibedakan apakah sumber preferensi berasal dari Windows atau emulasi DevTools.

Koreksi panduan Chrome: menu yang ditampilkan pengguna hanya menyediakan emulate reduce, sehingga jangan menganggap no-preference selalu tersedia sebagai pilihan UI. No emulation kembali mengikuti OS dan tidak menjamin false bila OS tetap meminta reduce. Chromium menyediakan parameter peluncuran --force-prefers-no-reduced-motion untuk pengujian khusus browser; [sumber resmi Chromium](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/ui/gfx/switches.cc). Untuk mengikuti perangkat, pengaturan Windows11 berada di Settings > Accessibility > Visual effects > Animation effects, atau Windows10 di Settings > Ease of Access > Display > Show animations in Windows, kemudian gunakan No emulation di DevTools dan reload. Pengguna selanjutnya menyatakan sudah bisa; cara yang dipakai tidak dikonfirmasi. [Chrome](https://developer.chrome.com/docs/devtools/rendering/emulate-css), [Windows](https://support.microsoft.com/en-us/accessibility/windows/make-it-easier-to-focus-on-tasks).

Tidak memaksa animasi untuk semua pengguna yang meminta pengurangan gerakan dan tidak mengubah pengaturan perangkat/browser melalui script. Pada diagnosis ini source/build tidak diubah; browser automation masih tidak tersambung, sehingga pengujian visual setelah perubahan preferensi tetap menunggu pengguna.

Eko mencabut penolakan build sebelumnya dengan instruksi eksplisit "coba lu build". `npm run build` berhasil (exit0, Vite8.3.4,8,92detik). Laravel sebelumnya masih memakai `public/hot`, sehingga menjalankan build saja tidak akan mengalihkan browser dari Vite. Marker tersebut dicadangkan ke `storage/app/vite-hot-before-production-20261030.txt`; keadaan akhir Laravel memakai `public/build`, tanpa mematikan PHP/Vite atau mengelola MySQL/Apache.

| Pemeriksaan hasil build | Hasil |
|---|---:|
| Entry JavaScript utama |351.672byte (gzip estimasi lokal108.543byte)|
| Graph impor statis main + Home, JS dan CSS |16berkas,603.074byte|
| Gzip estimasi gabungan JS dan CSS awal |172.624byte|
| Semua aset manifest diperiksa melalui HTTP |41berkas,seluruhnya200|
| Font lokal melalui HTTP |200,font/woff2,27.348byte|

Ukuran graph tidak mencakup HTML/gambar/font/halaman lain; estimasi gzip dihitung lokal, bukan klaim bahwa artisan serve mengirim respons terkompresi. Ini tidak dibandingkan langsung sebagai persentase dengan seluruh payload Lighthouse dev. HTML beranda200 merujuk `/build/assets/main-BPPOmK4l.js`, tanpa `@vite/client` atau port5173. Login dan health endpoint juga200. Build menghasilkan satu peringatan URL font tidak di-resolve saat build; font di public/fonts memang dipertahankan sebagai URL runtime, dan berkas serta MIME-nya sudah diverifikasi berhasil dilayani.

Browser automation masih tidak tersedia (native pipe tidak tersambung, tanpa browser pada inventori). Belum ada skor Lighthouse/FPS baru atau pembuktian animasi visual langsung. Lakukan hard refresh pada `http://127.0.0.1:8000/` sebelum audit ulang. Kondisi ini hanya mengganti aset frontend; APP_ENV, database, akun, transaksi dan konfigurasi layanan tidak diubah.

Untuk kembali mengedit dengan HMR, developer menghentikan lalu menjalankan ulang terminal Vite existing; proses tersebut menulis public/hot kembali. Jangan membuka instance dev kedua pada port5173. Alternatif pemulihan marker adalah memindahkan backup di atas kembali menjadi public/hot, hanya jika Vite existing masih merespons. Selama memakai hasil build, perubahan source berikutnya memerlukan build baru atau kembali ke mode dev.

## Hasil terukur sebelum build

Pemeriksaan lokal menggunakan katalog publik15layanan. Query dihitung pada request guest melalui kernel Laravel; graph modul diperiksa dari respons server Vite milik developer tanpa menjalankan server baru/build.

| Pemeriksaan | Sebelum | Sesudah |
|---|---:|---:|
| Query beranda guest |29|9|
| Query versi katalog pada beranda |15|1|
| Query jam mingguan pada beranda |7|1|
| Modul dalam graph impor statis main + Home di Vite |71|44|
| Bytes mentah graph dev, termasuk sourcemap |10.246.357|9.428.374|
| Provider demo/mockData dalam graph beranda |Ada|Tidak|
| Font UI |Stylesheet eksternal Google Fonts|Satu WOFF2 lokal27.348byte, preload dan font-display swap|

Graph impor bukan seluruh waterfall browser atau ukuran bundle produksi. Nilai Lighthouse55 pada screenshot pengguna berasal dari server Vite dev; tidak ada skor Lighthouse produksi baru, FCP/LCP/TBT/FPS atau jaminan skor100 yang diklaim.

## Audit lanjutan berdasarkan Lighthouse pengguna

Pengguna mengirim hasil audit: FCP5,4detik, LCP11detik, TBT20ms, CLS0,001, Speed Index5,4detik; payload10.907KiB, potensi minifikasi JavaScript8.306KiB dan JS tidak terpakai1.370KiB. TBT yang rendah menunjukkan pemblokiran thread bukan penyebab dominan skor55 pada hasil tersebut. Pemuatan aset dev yang belum diminify menjadi prioritas; ini belum membuktikan skor pada aset produksi.

Inspeksi respons dev menemukan Lucide sekitar3,8MB, React DOM3,1MB dan Inertia1MB termasuk sourcemap. Impor ikon bernama tetap dipertahankan untuk tree-shaking build produksi, tanpa menyalin implementasi pustaka atau mengubah dependensi hanya untuk mengejar skor mode dev. Pengguna awalnya memilih opsi2 (source saja), lalu mengizinkan build secara eksplisit; hasil dan keadaan aktif kini mengikuti bagian Build produksi lokal di atas.

Animasi kartu sebelumnya dimulai saat komponen mount, sehingga sudah selesai sebelum pengguna menggulir ke katalog. `revealWhenVisible` kini menunggu intersection, menjalankan reveal sekali per halaman aktif, dengan stagger75ms per kartu, durasi440ms dan translate20px. Bagian bawah beranda memakai reveal480ms/22px; hero tidak dianimasikan/disembunyikan. Tanpa IntersectionObserver/Web Animations atau pada reduced motion, konten tetap terbaca tanpa animasi tambahan. Observer dan animasi dibersihkan saat unmount/pergantian halaman.

Feedback tombol/kartu menggunakan transform saja. Header tetap setinggi64px saat scroll, tanpa transisi tinggi/backdrop blur; listener hanya mengubah state saat melewati ambang15px. Blur dekoratif berlebih pada beranda dihapus. Formulir login/Google pada shell dimuat dinamis ketika dibuka, dengan fallback loading dan error boundary; tidak memuatnya untuk setiap kunjungan beranda.

Verifikasi lanjutan: TypeScript lulus dan99tes frontend lulus, termasuk regresi animasi yang belum berjalan di luar viewport, hanya berjalan sekali, stagger dan cleanup. Tes backend terakhir52/429assertion dari tahap sebelumnya; source backend tidak diubah pada tahap lanjutan ini. Otomasi browser tidak tersedia sehingga belum ada Lighthouse produksi, pengukuran FPS, atau klaim hasil visual langsung. Perubahan source tidak dianggap bukti skor baru.

## Perubahan awal

- `ConsultationPackage::currentVersion()` memakai eager loading versi tertinggi yang sudah efektif. Home dan katalog workspace tidak melakukan query versi per paket; versi masa depan tetap tidak terbit. Jam mingguan Home diambil satu query lalu dikelompokkan. Tidak menambahkan cache global harga yang berisiko stale/lintas role.
- `AppContextCore` memisahkan binding/hook/kontrak dari provider LocalStorage demo. Komponen/server bridge memakai binding ringan yang sama; path AppContext lama mereekspor binding untuk kompatibilitas. `AppContent` dipisah agar workspace server tidak menarik AppProvider lama. Default CMS dipisah dari kumpulan data demo; tidak menghapus fungsi preview.
- Font Plus Jakarta Sans variable latin dihosting pada `public/fonts/plus-jakarta-sans-latin-variable.woff2`; SIL Open Font License disertakan. Sumber font: https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2 ; lisensi: https://raw.githubusercontent.com/google/fonts/main/ofl/plusjakartasans/OFL.txt . Stylesheet Google Fonts yang menghambat render dihapus. Hero tetap eager/high-priority bila ada; gambar about lazy dan decoding gambar async.
- Pemilih layanan pasien memakai CardRail halaman penuh yang sama dengan katalog/ulasan, lengkap rentang dan nomor halaman. Pilihan, radio disabled, notes yang ada dan rincian dialog dipertahankan. Catatan kosong tidak memakan blok besar pada setiap kartu. Pencarian ditunda dengan useDeferredValue; indeks pencarian, jumlah kategori dan kalkulasi harga di-memo, sehingga sort tidak menghitung diskon berulang untuk tiap perbandingan. Tidak mengirim request pencarian ke backend per ketikan.
- Animasi finite awal kemudian diperjelas berdasarkan audit lanjutan di atas: reveal dimulai ketika terlihat, dengan stagger per kartu. Tidak menyembunyikan konten sebelum JS, tidak menganimasikan hero/LCP, tidak menambah library atau loop rAF permanen/will-change global. Reduced motion menonaktifkan animasi tambahan; observer/animasi dibersihkan saat unmount.
- Footer meringkas jam, misalnya08:00 - 16:00 WIB. Rentang berbeda tetap dibedakan; teks lengkap menjadi title dan data kalender tidak berubah. Libur/teks janji temu tetap ditampilkan apa adanya.

## Verifikasi dan batas

TypeScript lulus,98tes frontend dan52tes backend/429assertion lulus. Tambahan regresi mencakup versi masa depan/kueri katalog yang tetap terbatas saat layanan bertambah, kompatibilitas konteks melalui render seluruh role, pemilih layanan/notes/selection dan jam footer. Parser PHP lulus; halaman, modul dan font lokal merespons200 dengan MIME font/woff2. Jumlah/bukti terbaru di [handoff](SESSION_HANDOFF.md).

Pada tahap awal build belum dijalankan; setelah izin terbaru build berhasil dan Laravel memakai hasilnya seperti bukti di atas. Dev server baru/Git tidak dijalankan, MySQL/Apache tetap dikelola Laragon, dan data praktik tidak direset. UAT visual/gesture serta Lighthouse dengan aset produksi tetap perlu dilakukan; tes render/HTTP tidak membuktikan geometri, kelancaran perangkat atau skor Lighthouse.

# AGENTS.md

Panduan ini wajib diikuti oleh AI agent yang bekerja di project ini.
Lokasi otoritatif panduan adalah docs/AGENTS.md, ditautkan README root. Seluruh Markdown milik proyek selain README root berada di docs/ sesuai instruksi developer20 Oktober 2026.

## Bahasa

- Gunakan Bahasa Indonesia saat berkomunikasi dengan developer.
- Tulis dokumentasi project dalam Bahasa Indonesia kecuali istilah teknis umum lebih jelas dalam Bahasa Inggris.

## Batasan Git

AI dilarang melakukan operasi Git.

Jangan menjalankan:

- `git add`
- `git commit`
- `git push`
- `git pull`
- `git merge`
- `git rebase`
- `git reset`
- `git checkout`
- `git switch`
- `git stash`
- `git clean`

Git sepenuhnya dikelola oleh developer.

AI hanya diperbolehkan:

- membaca source code
- membuat file
- mengubah file
- menghapus file jika memang diperlukan oleh task
- menjalankan aplikasi/test/build hanya jika developer mengizinkan

Untuk sesi ini, AI juga dilarang menjalankan:

- `npm run dev`
- `npm run build`

Pengecualian eksplisit30Oktober2026: Eko kemudian meminta "coba lu build". Build dan pemeriksaan hasil produksi lokal diizinkan untuk task performa ini. `npm run build` telah berhasil; `public/hot` dicadangkan ke `storage/app/vite-hot-before-production-20261030.txt` agar Laravel memakai build terbaru. Larangan menjalankan dev server baru/Git dan mengelola layanan Laragon tetap berlaku. Lihat status terakhir di [catatan performa](PERFORMANCE_2026-10-30.md).

## Cara Kerja

Pengecualian Git30Oktober2026: Eko secara eksplisit meminta "langsung push aja ke integrasi desman". Untuk pengiriman perubahan task ini, pemeriksaan Git, staging, commit dan push biasa ke origin/integrasi/desman diizinkan. Tidak mengizinkan force push, penghapusan riwayat, atau push ke main. Otorisasi khusus ini mengungguli larangan Git umum di atas; jangan meminta izin ulang untuk langkah pengiriman yang diperlukan.

- Instruksi Eko30Oktober2026: MySQL dan Apache lokal dikelola developer melalui Laragon. AI tidak boleh menyalakan/mematikan layanan tersebut, menjalankan mysqld langsung, membuat auto-start/service/task, atau mengganti port tanpa instruksi eksplisit untuk tindakan tersebut. Permintaan memperbaiki error koneksi saja bukan izin menyalakan database.
- Untuk error koneksi/port, periksa listener, executable dan rantai parent process dahulu. Jika port ditempati, laporkan pemiliknya; jangan membunuh proses atau menjalankan instance tambahan. Dua proses mysqld dalam satu rantai parent-child tidak otomatis berarti dua server bentrok.
- Baca konteks project sebelum mengubah file.
- Ikuti struktur dan pola kode yang sudah ada.
- Jangan melakukan refactor besar tanpa permintaan eksplisit.
- Hindari perubahan di luar scope task.
- Catat keputusan penting di `docs/DECISIONS.md`.
- Catat isu yang ditemukan di `docs/KNOWN_ISSUES.md`.
- Perbarui `docs/SESSION_HANDOFF.md` saat ada progres penting yang perlu dilanjutkan.

## Project Saat Ini

Jalur operasional menggunakan binding `context/AppContextCore`, `components/AppContent` dan default CMS terpisah. Jangan mengimpor provider demo dari `context/AppContext`/`App` ke entry server hanya untuk memakai hook atau AppContent; reexport lama dipertahankan untuk preview. Bukti optimasi dan batas Lighthouse ada di [catatan performa30Oktober](PERFORMANCE_2026-10-30.md).

Penegasan Eko30Oktober tentang empat menu Admin, pengelolaan khusus owner, kalender libur, slide utuh dan kontak mengikuti [keputusan30Oktober](KEPUTUSAN_AKTIF_2026-10-30.md). Izin Admin lama mengelola CMS/paket/diskon/kalender/lifecycle tidak berlaku. Pembatasan pengelolaan layanan lokal pada bagian Cara Kerja tetap berlaku.

Dasar bisnis29Oktober yang dilengkapi keputusan30Oktober: [keputusan aktif](KEPUTUSAN_AKTIF_2026-10-29.md), [integrasi FE](INTEGRASI_FE_EKO_2026-10-29.md). Dashboard operasional memakai Eko/Workspace dengan komponen FE asli melalui ServerAppProvider. Jangan mengembalikan workspace alternatif Desman, DP50%, same-day, auto-confirm SLA, atau auto-cancel no-show. Larangan Git/dev server/build tetap berlaku; checker dan tes terfokus telah diizinkan.

Project JiwaSehat memakai fondasi Laravel13 di root dan React/Vite TypeScript di resources/js. Arsitektur aktif Laravel13 + Inertia3 + React19 dengan routes/web.php. Home/login/logout/workspace dasar memakai server; mock/LocalStorage hanya preview Eko lokal. Backend domain, controller dan workspace operasional telah diimplementasikan pada26Oktober2026; bukti dan batasnya di docs/SESSION_HANDOFF.md. Developer mengizinkan penataan folder, inisialisasi Laravel dan pemindahan React pada20 Oktober 2026. Pembatasan sesi docs-only terdahulu tidak berlaku untuk pekerjaan setup yang baru diizinkan ini; larangan Git, dev server/build dan test tanpa izin tetap berlaku.

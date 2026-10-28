> Catatan historis/source pada waktu penulisan. Aturan target terbaru: [keputusan24 Oktober](KEPUTUSAN_AKTIF_2026-10-24.md); status implementasi: [handoff](FONDASI_DATABASE_DAN_MODEL_2026-10-24.md). Pernyataan aturan/tes lama di bawah tidak otomatis berlaku pada tahap sekarang.

# Panduan Merge Integrasi

Untuk developer, bukan perintah yang dijalankan agent. Tidak menggunakan force, rebase atau reset. Branch kerja saat diperiksa: integrasi/desman; merge Desman masih menunggu staging/commit developer.

## Batas Kesiapan

Isi konflik telah dirapikan, import resources/js diperiksa termasuk kapitalisasi filename, dependency terkunci dan tes regresi tersedia. Perubahan ini layak dijadikan checkpoint integrasi; bukan klaim backend, browser/mobile, database atau deployment sudah selesai. Agent tidak mengubah index Git, branch, MERGE_HEAD atau history.

Aturan final: DP100.000 sekali pada awal; semua booking/reschedule H+1; psikoterapi baru per sesi dengan rangkaian4; setelah selesai booking plan baru; cancel wajib lunas tagihan terbentuk. Data legacy tetap terpisah, tidak dihitung ulang diam-diam.

## Periksa Sebelum Staging

Jalankan pada Git Bash di C:/laragon/www/psikolog:

```bash
git status
git branch --show-current
```

Pastikan branch integrasi/desman. Periksa seluruh daftar perubahan, termasuk penghapusan attachment yang memang disengaja dan pemindahan dokumen lama ke docs/archive/. Jangan stage rahasia, .env, data pasien nyata, vendor atau node_modules. Jangan melanjutkan langkah berikut bila ada perubahan yang tidak dikenali.

Pemeriksaan tanpa dev server/build:

```bash
npm run lint && npm test
```

## Selesaikan Merge dan Push Branch Integrasi

Setelah daftar perubahan disetujui:

```bash
git add -A
git diff --cached --name-only --diff-filter=U
git diff --cached --stat
git status
```

Daftar unmerged harus kosong. Isi file yang sudah rapi tidak otomatis menandai index resolved. Jika masih ada unmerged/penanda konflik/error Git, berhenti dan periksa; jangan menghapus metadata Git atau memaksa push.

Jika tidak ada konflik dan status menyatakan siap commit:

```bash
git commit -m "eko: integrasikan Desman dan selaraskan DP, sesi, serta alur admin" && git push -u origin integrasi/desman
```

Push ini menyimpan branch integrasi, belum mengubah main.

## Merge ke Main

Sesudah review branch integrasi, gunakan PR ke main atau langkah lokal berikut. Simpan/commit perubahan kerja terlebih dahulu.

```bash
git fetch origin && git switch main && git merge --ff-only origin/main
```

Jika gagal, jangan lanjutkan blok berikut. Bila main/origin berkembang setelah pemeriksaan agent, konflik tambahan tetap mungkin dan perlu diselesaikan normal.

```bash
git merge --no-ff integrasi/desman -m "eko: gabungkan integrasi Desman ke main" && npm run lint && npm test && git push origin main
```

Jika merge konflik, selesaikan file, stage dan commit merge setelah review, jalankan pemeriksaan lagi, baru push. Jika push ditolak karena main remote maju atau branch protection, lakukan fetch/review/merge normal atau gunakan PR; jangan gunakan force. Simpan branch integrasi sampai main selesai diverifikasi.

## Pekerjaan Berikutnya

Backend domain Laravel dan migrasi halaman Inertia per fitur masih pekerjaan terpisah pada TODO. Halaman operasional baru dalam perubahan FE ini adalah preview lokal. Kebijakan akses DTO, lock antarpengguna/perangkat, storage privat dan pengiriman WhatsApp harus ditegakkan backend; LocalStorage bukan pengganti.

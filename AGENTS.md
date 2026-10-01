# AGENTS.md

Panduan ini wajib diikuti oleh AI agent yang bekerja di project ini.

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

## Cara Kerja

- Baca konteks project sebelum mengubah file.
- Ikuti struktur dan pola kode yang sudah ada.
- Jangan melakukan refactor besar tanpa permintaan eksplisit.
- Hindari perubahan di luar scope task.
- Catat keputusan penting di `docs/DECISIONS.md`.
- Catat isu yang ditemukan di `docs/KNOWN_ISSUES.md`.
- Perbarui `docs/SESSION_HANDOFF.md` saat ada progres penting yang perlu dilanjutkan.

## Project Saat Ini

Project ini adalah aplikasi React/Vite TypeScript untuk platform konsultasi psikologi bernama JiwaSehat. Data saat ini masih berbasis mock data dan LocalStorage.

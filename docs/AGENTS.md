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

## Cara Kerja

- Baca konteks project sebelum mengubah file.
- Ikuti struktur dan pola kode yang sudah ada.
- Jangan melakukan refactor besar tanpa permintaan eksplisit.
- Hindari perubahan di luar scope task.
- Catat keputusan penting di `docs/DECISIONS.md`.
- Catat isu yang ditemukan di `docs/KNOWN_ISSUES.md`.
- Perbarui `docs/SESSION_HANDOFF.md` saat ada progres penting yang perlu dilanjutkan.

## Project Saat Ini

Project JiwaSehat memakai fondasi Laravel13 di root dan React/Vite TypeScript di resources/js. Arsitektur aktif Laravel13 + Inertia3 + React19 dengan routes/web.php. Home/login/logout/workspace dasar memakai server; mock/LocalStorage hanya preview Eko lokal. Backend domain, controller dan workspace operasional telah diimplementasikan pada26Oktober2026; bukti dan batasnya di docs/SESSION_HANDOFF.md. Developer mengizinkan penataan folder, inisialisasi Laravel dan pemindahan React pada20 Oktober 2026. Pembatasan sesi docs-only terdahulu tidak berlaku untuk pekerjaan setup yang baru diizinkan ini; larangan Git, dev server/build dan test tanpa izin tetap berlaku.

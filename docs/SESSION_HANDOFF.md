# Session Handoff

## Tanggal

2026-10-01

## Instruksi Aktif Developer

- Gunakan Bahasa Indonesia.
- AI dilarang melakukan operasi Git.
- Jangan jalankan `npm run dev`.
- Jangan jalankan `npm run build`.

## Kondisi Project

- Repo sudah berada di `C:\laragon\www\psikolog`.
- Project adalah React/Vite TypeScript.
- Dokumentasi awal sudah dibuat di `docs/`.
- Data aplikasi masih mock data dan LocalStorage.
- Requirement terbaru sudah dicatat di dokumentasi, belum diimplementasikan ke source code aplikasi.

## Catatan Requirement Terbaru

- Role tertinggi adalah psikolog/super admin/pengelola sebagai owner company/praktik.
- Admin berada di bawah psikolog dan fokus pada monitoring, verifikasi pembayaran, booking, reschedule, dan moderasi review.
- Pasien wajib mengisi pre-test sebelum booking.
- Booking dan reschedule minimal H+1, bukan hari yang sama.
- Psikolog dapat mengatur hari libur, jam kerja, dan batas jumlah pertemuan per hari.
- Tidak ada ruang chat/konsultasi online di web.
- Pembayaran memakai DP 50% di awal dan 50% setelah konsultasi selesai.
- Landing page perlu menghapus klaim organisasi yang tidak valid, menambah carousel pengalaman, dan media sosial footer.
- Dashboard psikolog memuat analytics keuangan dan CMS.
- Dashboard admin hanya untuk monitoring user/booking, approval status, verifikasi, dan moderasi review.
- UI/UX perlu sidebar collapsible dan mobile-first yang nyaman untuk jempol.
- Laravel + React memungkinkan; kandidat arah teknis adalah Laravel API + React frontend.

## File Dokumentasi Yang Dibuat/Diubah

- `README.md`
- `AGENTS.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/CODING_RULES.md`
- `docs/BUSINESS_RULES.md`
- `docs/WORKFLOW.md`
- `docs/DATABASE.md`
- `docs/API.md`
- `docs/ROLES_PERMISSIONS.md`
- `docs/FEATURES.md`
- `docs/DECISIONS.md`
- `docs/KNOWN_ISSUES.md`
- `docs/TODO.md`
- `docs/CHANGELOG.md`
- `docs/SESSION_HANDOFF.md`

## Lanjut Berikutnya

- Review `tsc_errors.txt`.
- Tentukan backend dan database, kandidat backend: Laravel.
- Rapikan nama package.
- Mulai mapping fitur prioritas dari prototype ke implementasi produksi.
- Konfirmasi ke client soal assessment/test tambahan dari psikolog.
- Desain mekanisme anti double booking/slot locking.

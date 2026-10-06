# Workflow

## Aturan Kerja Developer

- Developer mengelola Git sepenuhnya.
- AI tidak melakukan operasi Git.
- AI boleh membaca, membuat, mengubah, dan menghapus file sesuai task.
- AI tidak menjalankan `npm run dev` atau `npm run build` pada sesi ini.

## Alur Perubahan

1. Baca konteks kode dan dokumentasi.
2. Tentukan file yang relevan.
3. Lakukan perubahan kecil dan terarah.
4. Update dokumentasi jika ada perubahan aturan, fitur, atau keputusan.
5. Laporkan perubahan yang dilakukan.

## Saat Menambah Fitur

- Update `docs/Psikolog/Live Docs/FEATURES.md`.
- Update `docs/Psikolog/Live Docs/API.md` jika butuh endpoint.
- Update `docs/Psikolog/Live Docs/DATABASE.md` jika butuh schema baru.
- Update `docs/Psikolog/Live Docs/ROLES_PERMISSIONS.md` jika akses role berubah.
- Update `docs/Psikolog/Live Docs/BUSINESS_RULES.md` jika ada aturan bisnis baru.

## Saat Menemukan Bug

- Catat di `docs/Psikolog/Live Docs/KNOWN_ISSUES.md` jika belum langsung diperbaiki.
- Jika diperbaiki, catat ringkas di `docs/Psikolog/Live Docs/CHANGELOG.md`.

## Handoff

Gunakan `docs/Psikolog/Live Docs/SESSION_HANDOFF.md` untuk mencatat:

- pekerjaan terakhir
- file yang berubah
- keputusan penting
- hal yang belum selesai
- larangan atau instruksi aktif dari developer

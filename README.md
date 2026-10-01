# JiwaSehat - Platform Konsultasi Psikologi

JiwaSehat adalah aplikasi frontend React untuk simulasi platform konsultasi psikologi. Aplikasi ini memiliki tampilan publik, dashboard pasien, dashboard psikolog, dashboard admin, dan halaman blueprint arsitektur.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- LocalStorage sebagai persistence sementara
- Mock data di `src/data/mockData.ts`

## Struktur Dokumentasi

Dokumentasi proyek ada di folder `docs/`:

- `PROJECT_CONTEXT.md` - konteks produk dan ruang lingkup
- `ARCHITECTURE.md` - struktur teknis dan alur aplikasi
- `CODING_RULES.md` - aturan coding
- `BUSINESS_RULES.md` - aturan bisnis
- `WORKFLOW.md` - cara kerja developer dan AI
- `DATABASE.md` - rancangan data dan persistence
- `API.md` - kontrak API target
- `ROLES_PERMISSIONS.md` - role dan izin
- `FEATURES.md` - daftar fitur
- `DECISIONS.md` - catatan keputusan teknis
- `KNOWN_ISSUES.md` - isu yang sudah diketahui
- `TODO.md` - daftar pekerjaan berikutnya
- `CHANGELOG.md` - riwayat perubahan
- `SESSION_HANDOFF.md` - catatan handoff sesi

## Instalasi Lokal

```bash
npm ci
```

## Script

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Catatan: jalankan script hanya saat memang diperlukan. Untuk sesi kerja AI saat ini, developer meminta AI tidak menjalankan `npm run dev` dan `npm run build`.

## Aturan Git

Git sepenuhnya dikelola oleh developer. AI tidak boleh menjalankan operasi Git seperti `git add`, `git commit`, `git push`, `git pull`, `git merge`, `git rebase`, `git reset`, `git checkout`, `git switch`, `git stash`, atau `git clean`.

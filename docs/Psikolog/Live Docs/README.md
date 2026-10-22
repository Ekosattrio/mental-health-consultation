# JiwaSehat - Platform Konsultasi Psikologi

JiwaSehat adalah aplikasi frontend React untuk booking konsultasi psikologi tatap muka dan telelayanan melalui platform pihak ketiga. Aplikasi memiliki landing page, dashboard pasien, dashboard psikolog/pengelola, dan dashboard admin operasional. Psikoterapi ditarifkan per sesi dengan rencana awal empat sesi; kelanjutan setelah sesi keempat melalui booking baru.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- LocalStorage sebagai persistence sementara
- Mock data di `src/data/mockData.ts`
- HTTP service layer siap untuk Laravel 12+ REST API dan MySQL 8+

## Struktur Dokumentasi

Dokumentasi proyek dikelola melalui vault Obsidian di `docs/Psikolog`. Dokumen utama berada di `docs/Psikolog/Live Docs/`:

- `PROJECT_CONTEXT.md` - konteks produk dan ruang lingkup
- `ARCHITECTURE.md` - struktur teknis dan alur aplikasi
- `CODING_RULES.md` - aturan coding
- `BUSINESS_RULES.md` - aturan bisnis
- `WORKFLOW.md` - cara kerja developer dan AI
- `DATABASE.md` - rancangan data dan persistence
- `API.md` - kontrak API target
- `ROLES_PERMISSIONS.md` - role dan izin
- `PANDUAN_FITUR_PER_ROLE.md` - fitur per role, fungsi/cara kerja, arti ikon aksi psikolog, dan batas implementasi
- `CMS_AUDIT.md` - pengaturan CMS, komponen pembaca, cara simpan, dan bagian yang masih statis
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

## Verifikasi Frontend

Setelah izin developer, checkpoint 22 Oktober 2026: TypeScript 0 error dan 36 tes regresi lolos, termasuk versi reschedule paralel, hold expired/rekonsiliasi, profil, CMS, timeline, dan render statis katalog. Belum QA visual/interaksi browser.

```bash
npx tsc --noEmit
npx tsx --test tests/frontend-regressions.test.ts
```

Tes memakai storage/antrean lock simulasi, bukan QA browser atau jaminan antarperangkat. Workflow prototype membutuhkan Web Locks melalui localhost/HTTPS; tanpa dukungan tersebut mutasi sensitif ditolak. Default reservasi lokal 15 menit dapat diatur melalui `VITE_MOCK_HOLD_MINUTES`, bukan TTL produksi final. Detail di dokumentasi aktif.

## Aturan Git

Git sepenuhnya dikelola oleh developer. AI tidak boleh menjalankan operasi Git seperti `git add`, `git commit`, `git push`, `git pull`, `git merge`, `git rebase`, `git reset`, `git checkout`, `git switch`, `git stash`, atau `git clean`.

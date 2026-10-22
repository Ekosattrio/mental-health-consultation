# JiwaSehat - Laravel, Inertia dan React

Satu proyek Laravel 13 + Inertia 3 + React 19/TypeScript dengan MySQL 8. Laravel mengatur route/session; React mengerjakan tampilan. Prototype lokal tetap terpisah dari transaksi backend.

## Acuan Aktif

- [Keputusan final 22 Oktober](docs/KEPUTUSAN_FINAL_2026_10_22.md): DP flat Rp100.000 sekali di awal, semua jadwal H+1, booking baru setelah empat sesi, pembatalan wajib lunas.
- [Aturan bisnis](docs/BUSINESS_RULES.md), [kontrak web](docs/WEB_CONTRACT.md), [database](docs/DATABASE_ARCHITECTURE.md), dan [TODO](docs/TODO.md).
- [Merge integrasi ke main tanpa force](docs/PANDUAN_MERGE_INTEGRASI.md).
- [Panduan Eko](docs/EKO_PROJECT_GUIDE.md), [setup](docs/SETUP.md), [CMS](docs/CMS_AUDIT.md), dan [aturan agent](docs/AGENTS.md).

## Struktur

```text
app/                   Fondasi Laravel
resources/js/pages/    Halaman Inertia
resources/js/layouts/  Layout web berbasis session
resources/js/components/ Komponen React dan preview
resources/js/legacy/   Kontrak REST lama, bukan transport web aktif
resources/css/         Tailwind CSS
routes/web.php         Route halaman dan action web
database/              Migration fondasi; schema domain masih target
docs/                  Dokumentasi aktif, fitur, journey, referensi, arsip
tests/                 Regresi prototype dan kerangka tes Laravel
```

## Status

Home, login/logout session dan dashboard kerangka ber-role tersedia. Booking, ledger, upload privat, Google SSO, CMS database, WhatsApp dan domain backend belum operasional. Komponen preview tidak membuktikan backend selesai.

`/preview/eko` hanya lokal dengan flag aktif. Mock/LocalStorage bukan data produksi. Sebagian flow prototype masih kontrak lama; pekerjaan integrasi dicatat di TODO/KNOWN_ISSUES.

Verifikasi integrasi22Oktober2026: TypeScript tanpa error dan58tes lolos (55regresi FE +3kesiapan sumber integrasi). Ini bukan QA browser/backend.

Preview baru mencakup psikoterapi per sesi, DP100.000 sekali, lanjutan DP0, review reschedule Admin, koreksi bukti berversi dan menu Admin yang disepakati. Tagihan legacy tidak ditulis ulang.

```bash
npm run lint
npm test
```

Git dikelola developer. Agent tidak menjalankan Git, dev server, atau build. Perbaikan isi file tidak menandai index Git resolved; staging/commit tetap developer setelah pemeriksaan.

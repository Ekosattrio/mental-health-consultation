# Mulai membaca proyek JiwaSehat

## Keputusan Terbaru - 22 Oktober 2026
Mulai dari [keputusan final integrasi](KEPUTUSAN_FINAL_2026_10_22.md): DP flat Rp100.000 sekali pada awal, semua jadwal H+1, tanpa tambah sesi, batal wajib lunas. Scope lain Desman diterima sebagai target. Fitur domain belum seluruhnya diimplementasikan.

Terbaru: [pembayaran bertahap/penuh dan pelunasan hari sesi terakhir](ALUR_PEMBAYARAN_SESI.md), termasuk alokasi prabayar psikoterapi baru, ringkasan sesuai role dan batas handoff backend. Verifikasi FE terbaru: TypeScript lolos, 87/87 tes (84 FE +3integrasi sumber); bukan hasil E2E browser/database.


Untuk Eko dan pengembang backend, mulai dari [panduan menyeluruh Eko](EKO_PROJECT_GUIDE.md), lalu [peta dokumentasi](DOCS_ARCHITECTURE.md).

Dokumen utama langsung berada di `docs/`, tanpa lapisan Psikolog/Live Docs. Root proyek memakai struktur Laravel 13, React berada di resources/js, dengan Inertia3, routing web serta session Laravel pada domain yang sama. [README root](../README.md) menjelaskan proyek saat ini; catatan prototype lama disimpan sebagai arsip.

Panduan menyelesaikan merge/push oleh developer: [PANDUAN_MERGE_INTEGRASI](PANDUAN_MERGE_INTEGRASI.md). Agent tidak menjalankan Git/dev/build.

## Peta folder

| Lokasi | Isi |
|---|---|
| docs/*.md | Panduan, aturan, kontrak web, database dan catatan kerja |
| [features](FEATURES.md) | Satu fitur satu file F01–F20 di features/ |
| actors/ | Kemampuan dan batas empat pelaku |
| journeys/ | Perjalanan pengguna tiap pelaku |
| audits/ | Temuan audit dan perbaikan pada tanggal audit |
| references/ | PDF sumber; aturan terbaru tetap mengikuti keputusan developer |
| archive/ | README/index prototype dan konfigurasi Obsidian lama |

- [Perubahan arsitektur untuk Eko](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md) dan [kontrak web aktif](WEB_CONTRACT.md).
- [Setup lokal](SETUP.md) dan [panduan kerja agent](AGENTS.md).

- [Aturan bisnis](BUSINESS_RULES.md) dan [hak akses](ROLES_PERMISSIONS.md).
- [Daftar20fitur](FEATURES.md), [WEB_CONTRACT](WEB_CONTRACT.md) dan [kamus database](DATABASE_ARCHITECTURE.md).
- [Audit integrasi terakhir](audits/AUDIT_INTEGRASI_DOKUMEN_2026-10-19.md), [isu aktif](KNOWN_ISSUES.md) dan [keputusan](DECISIONS.md).

Audit lama serta bagian arsip pada log adalah histori; jangan mengimplementasikan rekomendasi lama yang sudah diganti. Target dokumen belum merupakan hasil pengujian implementasi.

# Mulai membaca proyek JiwaSehat

Status26 Oktober2026: mulai dari [hasil implementasi untuk Eko](IMPLEMENTASI_WEB_2026-10-26.md), [akun awal](AKUN_AWAL_DAN_CARA_MASUK.md), [kontrak route aktual](WEB_CONTRACT.md) dan [handoff](SESSION_HANDOFF.md). Controller domain dan workspace operasional sudah dibuat. Bukti tahap migration/model24 Oktober merupakan catatan historis tahap sebelumnya.

Untuk Eko dan pengembang backend, mulai dari [panduan menyeluruh Eko](EKO_PROJECT_GUIDE.md), lalu [peta dokumentasi](DOCS_ARCHITECTURE.md).

Dokumen utama langsung berada di `docs/`, tanpa lapisan Psikolog/Live Docs. Root proyek memakai struktur Laravel 13, React berada di resources/js, dengan Inertia3, routing web serta session Laravel pada domain yang sama. [README root](../README.md) menjelaskan proyek saat ini; catatan prototype lama disimpan sebagai arsip.

Panduan menyelesaikan merge/push oleh developer: [PANDUAN_MERGE_INTEGRASI](PANDUAN_MERGE_INTEGRASI.md). Git tetap dikelola developer; pemeriksaan build/test lanjutan dilakukan dalam scope penyelesaian yang telah diizinkan pengguna.

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

Pembaruan integrasi provider: [panduan WhatsApp dan Google](INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md).

# JiwaSehat — Laravel, Inertia dan React

Satu aplikasi Laravel13 + Inertia3 + React19/TypeScript dengan MySQL8. Seluruh halaman utama memakai komponen FE Eko dengan data dan aksi Laravel. DP awal Rp100.000, booking/reschedule minimal H+1. Session, route web dan transaksi dikelola Laravel.

Mulai dari [keputusan aktif Eko 29 Oktober](docs/KEPUTUSAN_AKTIF_2026-10-29.md) dan [integrasi FE Eko](docs/INTEGRASI_FE_EKO_2026-10-29.md). Ketentuan lama Desman tentang DP50%, same-day, dan lifecycle Admin sudah diganti.

## Mulai membaca

- [Optimasi UI, query dan pemuatan30Oktober](docs/PERFORMANCE_2026-10-30.md).
- [Penegasan terbaru30Oktober: role, libur, slide dan kontak](docs/KEPUTUSAN_AKTIF_2026-10-30.md).
- [Hasil implementasi untuk Eko](docs/IMPLEMENTASI_WEB_2026-10-26.md).
- [Akun awal dan cara masuk](docs/AKUN_AWAL_DAN_CARA_MASUK.md).
- [Indeks dokumentasi](docs/README.md), [aturan bisnis](docs/BUSINESS_RULES.md), [fitur](docs/FEATURES.md), [database](docs/DATABASE_ARCHITECTURE.md).
- [Kontrak web aktual](docs/WEB_CONTRACT.md), [setup](docs/SETUP.md), [operasional satu VPS](docs/OPERASIONAL_VPS_DAN_INTEGRASI.md).
- [Status dan bukti pemeriksaan](docs/SESSION_HANDOFF.md), [batas aktivasi](docs/KNOWN_ISSUES.md), [aturan agent](docs/AGENTS.md).

## Struktur

| Direktori | Isi |
|---|---|
| app/Domain | Aturan, transaksi, kalender, billing, laporan dan notifikasi |
| app/Http | Controller dan middleware web |
| app/Models | Model domain dan relasi |
| resources/js/pages | Halaman Inertia |
| resources/js/practice | Form dan panel operasional React |
| resources/js/components | Komponen presentasi Eko dan komponen preview |
| resources/views | Blade shell dan template PDF |
| routes/web.php | Route halaman, form dan JSON pendukung session |
| database | Migration dan manifest schema |
| services/whatsapp | Bridge Baileys loopback, status dan penautan privat Superadmin |
| docs | Fitur, aktor, journey, arsitektur dan catatan perubahan |
| tests | Regresi frontend, Laravel dan integrasi MySQL terisolasi |

Google Identity Services/One Tap sudah diimplementasikan dan menunggu OAuth Client ID. WhatsApp memakai nomor pengirim pengguna, menunggu penautan ponsel dan nomor tujuan owner. Lihat [panduan WhatsApp dan Google](docs/INTEGRASI_WHATSAPP_GOOGLE_2026-10-26.md). Identitas/rekening/domain/SMTP diisi operator. Preview /preview/eko dimatikan secara default dan selalu404 di production; LocalStorage lama bukan database operasional.

Perintah pemeriksaan: npm run lint, npm test, npm run build, php vendor/bin/phpunit, php vendor/bin/phpunit -c tests/phpunit-domain.xml. Tes domain memakai database MySQL acak terpisah, bukan reset database aplikasi. Git tetap dikelola developer.

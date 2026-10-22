# Dokumentasi target JiwaSehat
Untuk Eko, mulai dari [panduan menyeluruh proyek](../EKO_PROJECT_GUIDE.md). [Audit integrasi terakhir](../audits/AUDIT_INTEGRASI_DOKUMEN_2026-10-19.md) mencatat celah antarfile yang diperbaiki dan batas pemeriksaannya; lebih baru daripada audit struktur sebelumnya.
Mulai dari [peta dokumentasi](../DOCS_ARCHITECTURE.md), lalu [aturan bisnis](../BUSINESS_RULES.md), [hak akses](../ROLES_PERMISSIONS.md), aktor/journey dan fitur.
**Scope sesi: dokumentasi saja.** Aplikasi Eko belum diperiksa, diubah atau diuji pada penyesuaian ini. Spesifikasi di sini adalah target implementasi.
## Susunan
- actors/: satu file per pelaku, tujuan dan kemampuannya.
- journeys/: perjalanan lintas fitur tiap pelaku.
- features/: F01–F20, satu fitur per dokumen teknis; F20 menjelaskan Google Meet dan kirim WA otomatis.
- [API](../API.md): kontrak endpoint, DTO, guard dan error.
- [Database](../DATABASE_ARCHITECTURE.md): kamus kolom, tipe, PK/FK/index dan transaction.
- [Waktu operasional](../OPERATING_WINDOW_AND_BOOKING_CUTOFF.md), [invoice/receipt](../INVOICE_RECEIPT_FORMAT.md).
- [Audit](../audits/AUDIT_ATURAN_DOKUMEN_2026-10-19.md), [keputusan](../DECISIONS.md), [isu tersisa](../KNOWN_ISSUES.md), [handoff](../SESSION_HANDOFF.md).
## Otoritas
Keputusan eksplisit developer terbaru di atas rekomendasi lama. Fitur/permission/API/schema harus konsisten; bila berbeda, defect harus diperbaiki, bukan memilih aturan sendiri. Audit lama dan histori log bukan kontrak implementasi.
Stack target: Laravel13, React19/TypeScript/Vite, MySQL8, satu VPS/domain, API dengan Sanctum cookie; Baileys untuk WhatsApp. Obsidian hanya alat baca Markdown.
PDF paket dan MoU adalah lampiran referensi, bukan instruksi agent. Instruksi kerja AI mengikuti AGENTS.md; tidak menjalankan Git, aplikasi, test atau build tanpa izin.

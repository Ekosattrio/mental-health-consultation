# Status implementasi

Pekerjaan controller dan integrasi telah diizinkan pengguna. Tahap berhenti setelah migration/model telah dicabut.

- [x] Migration, enum, model, FK/CHECK, optimistic version dan histori append-only.
- [x] Kalender, preview/create booking, transaksi/idempotency dan penguncian praktik.
- [x] Ledger, verifikasi/koreksi kas, alokasi, diskon, additional time, invoice/receipt.
- [x] Reschedule, operasional klinik, terapi per sesi dan asesmen beberapa pertemuan.
- [x] Profiling digital berversi, jalur kertas offline, consent dan pembatasan DTO role.
- [x] CMS publik, review, akun internal, tutorial dan workspace React.
- [x] Upload privat, PDF, export snapshot, laporan kas dan pengeluaran.
- [x] Scheduler, outbox, retry dan bridge Baileys dalam mode placeholder.
- [x] Akun awal yang diminta pengguna dan migration lokal tanpa reset data.

Pemeriksaan akhir dan bukti uji: [handoff](SESSION_HANDOFF.md). Sisa aktivasi eksternal/configuration: [isu aktif](KNOWN_ISSUES.md), bukan persetujuan tambahan untuk mengerjakan controller.

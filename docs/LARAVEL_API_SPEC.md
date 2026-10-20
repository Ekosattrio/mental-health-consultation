# Spesifikasi backend Laravel13
Kontrak endpoint/DTO resmi hanya di [WEB_CONTRACT.md](WEB_CONTRACT.md), batas frontend di [API_BOUNDARY.md](API_BOUNDARY.md), schema di [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md).
Contoh route/migration lama di file ini telah digantikan; tidak boleh dijadikan referensi bearer browser, harga publik Guest, DASS, PENDING appointment atau FK integer.
## Urutan implementasi
1. Schema UUID, session/CSRF, email/password+Google, policy role/ownership.
2. Kalender dan resource locking; booking idempotent dengan snapshot paket dan deadline.
3. Ledger, bukti versi, verifikasi/reject/correction, invoice/addendum/discount dan proyeksi Admin tanpa saldo.
4. Reschedule terpisah, eligibility requested_at, no-show history, clinic change workflow.
5. Profiling immutable, asesmen multi-appointment, terapi per sesi, laporan kas/expense/export.
6. Queue/outbox, Baileys, file expiry, audit dan tutorial.
## Pembagian tanggung jawab
FormRequest whitelist input dan unit. Policy memeriksa target berizin. Domain service memegang transaction dan guard. Resource/DTO menyaring output per role, termasuk nested/error/export/print. React menampilkan hasil commit.
Acceptance criteria dan skenario gagal berada pada setiap F01–F20; belum menjadi hasil test runtime. Telelayanan Google Meet dengan save link -> outbox -> WhatsApp Baileys dijelaskan F20. Menjalankan aplikasi/test/build memerlukan izin developer.

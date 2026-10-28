# Panduan Eko

Baca [hasil implementasi26 Oktober](IMPLEMENTASI_WEB_2026-10-26.md), [keputusan aktif](KEPUTUSAN_AKTIF_2026-10-24.md), [aturan bisnis](BUSINESS_RULES.md), [kalender](OPERATING_WINDOW_AND_BOOKING_CUTOFF.md), [database](DATABASE_ARCHITECTURE.md) dan [kontrak web aktual](WEB_CONTRACT.md).

React berada di resources/js. Workspace operasional berada di pages/Practice/Workspace.tsx, panel/form di practice/, dan presentasi beranda tetap memakai komponen Eko. Laravel web route + Inertia/session adalah satu-satunya jalur operasional. Preview /preview/eko dimatikan default dan masih mempunyai aturan lama; jangan mengimpor AppContext atau mock ke workspace.

Satu fitur satu berkas di features/, satu pelaku di actors/, perjalanan di journeys/. Authorization dan whitelist DTO berada pada server. Admin tidak boleh menerima saldo, receipt penuh atau jawaban klinis, termasuk lewat export dan objek nested. Jangan serialisasi model langsung ke props.

Gunakan practice/http.ts untuk action, CSRF, key retry dan penanganan kesalahan. Jangan memperbarui UI seolah sukses sebelum server mengonfirmasi simpan. expected_version dan quote_token berasal dari server; perhitungan uang/slot di browser hanya untuk presentasi. Pengembangan tampilan berikutnya harus mempertahankan alur gagal dan histori yang telah dibuat.

[Akun awal](AKUN_AWAL_DAN_CARA_MASUK.md), [setup](SETUP.md), [operasional](OPERASIONAL_VPS_DAN_INTEGRASI.md), [hasil verifikasi](SESSION_HANDOFF.md). Arsip dan audit bertanggal lama menjelaskan sejarah, bukan instruksi untuk mengembalikan aturan lama.

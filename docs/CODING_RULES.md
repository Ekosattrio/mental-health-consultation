# Aturan implementasi

Frontend React/TypeScript di resources/js; backend Laravel/PHP di app, routes dan database. Fondasi aktif memakai Inertia3 setelah persetujuan20 Oktober 2026. Ikuti [WEB_CONTRACT](WEB_CONTRACT.md), [BUSINESS_RULES](BUSINESS_RULES.md), [ROLES_PERMISSIONS](ROLES_PERMISSIONS.md) dan [DATABASE_ARCHITECTURE](DATABASE_ARCHITECTURE.md).

- pages/ adalah entry Inertia; layouts/ kerangka web, components/ tampilan yang dapat dipakai ulang. App.tsx/AppContext/api mock hanya preview lokal. Tidak mengimpor state mock sebagai sumber kebenaran halaman utama.
- Pakai Link/router untuk navigasi web dan useForm untuk form Inertia. Action sukses redirect setelah commit; validasi/conflict yang dapat diperbaiki kembali sebagai errors, bukan JSON mentah pada kunjungan Inertia. JSON pendukung memakai client/route eksplisit.
- Middleware/policy/ownership memutus akses backend setiap request; input role/actor/harga/status tidak dipercaya. FormRequest harus membatasi input dan field terlarang, bukan mass assignment model dari request penuh.
- UI hanya render/interaksi. Harga, saldo, DP, waktu, permission, slot dan transisi dihitung server. Idempotency dan database constraint tetap diperlukan.
- Props/data per role di-allowlist; tidak mengirim saldo/aggregate paid/jawaban klinis ke Admin atau harga ke Guest. Hindari any tanpa alasan; mapping snake_case eksplisit.
- Komponen PascalCase, function TypeScript camelCase, kolom/request domain snake_case. Gunakan nama page sama pada Inertia::render dan resolver; URL/nama route mengikuti kontrak.
- File/klinis/bukti privat; log bebas password/token/jawaban klinis. Nilai VITE_* selalu dianggap publik. Jangan menambah dependency/provider tanpa kebutuhan.
- Migrasi fitur satu per satu; satu intent hanya satu jalur data backend. Status berhasil hanya setelah commit server, bukan setelah menutup modal.

Pemeriksaan struktur/typecheck/syntax/daftar route untuk setup bukan pengujian bisnis. Git dilarang; browser/dev server/build/test suite/migration tetap belum dijalankan dan memerlukan izin developer sesuai [AGENTS](AGENTS.md).

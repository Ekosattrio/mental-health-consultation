# Batas kerja React dan Laravel

Arsitektur aktif Laravel13 + Inertia3 + React19, satu proyek/domain. Nama file ini dipertahankan sebagai tautan lama; kontrak aktif ada di [WEB_CONTRACT](WEB_CONTRACT.md), bukan REST terpisah.

Eko mengerjakan pages/layouts/components, input, navigasi URL, loading/empty/error, aksesibilitas dan mapping DTO. Laravel mengerjakan route/controller, autentikasi/session/CSRF, policy/ownership, validasi, harga, kalender, transisi, transaksi, ledger, file privat, audit dan queue. Obsidian hanya pembaca Markdown, bukan runtime.

Page controller mengirim props whitelist sesuai role. Form useForm/router mengirim field yang diizinkan ke route web, kemudian menerima redirect/errors/flash. JSON pendukung kecil diperbolehkan dengan session/policy; bukan alasan membangun aplikasi API publik untuk seluruh halaman.

DTO (Data Transfer Object) adalah bentuk data yang dipertukarkan, bukan model database mentah. Mapping snake_case ke view model React eksplisit. Shared props tidak berisi seluruh pasien/klinis/ledger. Admin hanya harga/diskon/total serta nominal bukti/input aktif, tanpa saldo/agregat paid/receipt penuh. Laporan seluruh praktik khusus Superadmin; pasien hanya datanya yang sah. Backend menyaring pula error/export/print/nested props.

React tidak menentukan actor_id, role, computed total, verified status atau deadline. Server commit sebelum sukses. Retry memakai key intent sama, optimistic concurrency mengikuti versi server. Jangan menggabungkan penyimpanan mock dan backend dalam satu aksi.

Fondasi runtime hanya Home, login/logout dan workspace ber-role; backend bisnis masih target. Preview lokal Eko memakai mock, tidak terhubung database. Lihat [perubahan untuk Eko](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md).

Telelayanan target F20: Admin menempel link Meet/nomor WA, Laravel menyimpan revisi/outbox dan worker Baileys mengirim otomatis dari VPS sama. Link eksternal bukan sesi auth, bukti pembayaran atau attendance. Tidak ada pembuatan ruang Google API dalam scope.

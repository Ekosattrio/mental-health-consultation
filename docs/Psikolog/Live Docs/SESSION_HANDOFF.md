# Session Handoff

## Tanggal

2026-10-06

## Instruksi Aktif

- Gunakan Bahasa Indonesia.
- AI dilarang melakukan seluruh operasi Git.
- Jangan menjalankan `npm run dev` atau `npm run build`.
- Test/build hanya dijalankan bila developer memberi izin.
- Dokumentasi aktif hanya berada di `docs/Psikolog/Live Docs` dalam vault Obsidian `docs/Psikolog`.

## Keputusan Final

- Frontend: React/Vite TypeScript SPA.
- Backend: Laravel 12+ REST API terpisah.
- Database: MySQL 8+.
- Scope konsultasi: tatap muka; tidak ada ruang chat atau telekonsultasi web.
- Scope screening: pre-test profiling sebelum booking, bukan DASS dan bukan diagnosis.
- Role tertinggi adalah psikolog/pengelola. Admin hanya menjalankan fungsi operasional yang telah dibatasi.
- WhatsApp menjadi kanal notifikasi utama; email hanya fallback/dokumen.

## Kondisi Frontend

- Fitur role pasien, admin, dan psikolog tersedia sebagai prototype mock/LocalStorage dengan prefix `jiwasehat_v3_`.
- Architecture Blueprint, `viewMode`, modul DASS/test psikolog, dan paket/logic telelayanan telah dihapus dari source aktif.
- Migrasi LocalStorage cleanup v5 membersihkan state test/SOAP, paket telelayanan, tarif profil lama, dan field appointment legacy.
- Harga layanan hanya berasal dari paket; field tarif online/offline pada profil psikolog telah dihapus.
- Logo, avatar, dan preview aset CMS memakai fallback bila URL gambar gagal dimuat.
- Dashboard role menggunakan lazy loading. Penulisan LocalStorage didebounce untuk mengurangi beban render.
- Paket Berjalan memakai tabel desktop dan kartu mobile. Psikolog dapat menjadwalkan sesi lanjutan bertahap atau menghentikan paket dengan alasan.
- Guard paket menolak sesi tambahan ketika selesai/dihentikan atau ketika sesi aktif berikutnya sudah ada.
- Booking/reschedule memakai lock sementara per psikolog/tanggal, sinkronisasi antar-tab, validasi H+1, jam kerja, hari libur, kuota, durasi, dan overlap.
- Web Locks API menjadi lock lintas-tab utama dengan fallback LocalStorage. Booking walk-in admin dapat mendaftarkan pasien baru tanpa pre-test awal, tetapi tanggal konsultasi tetap minimal H+1.
- Harga, diskon, total akhir, dan DP booking dihitung ulang dari paket aktif; komponen UI tidak menentukan nominal final.
- Guard role, ownership, dan transisi status telah diterapkan pada seluruh action facade sensitif di `AppContext`.
- Riwayat pasien, reservasi admin, dan riwayat aksi psikolog memiliki kartu khusus mobile selain tabel desktop.
- Opsi waktu walk-in dan reschedule pasien/admin dihitung dari availability engine yang sama dengan validasi submit.
- Review hanya dapat dibuat setelah appointment `COMPLETED` dan maksimal satu review aktif per appointment.
- Admin user monitoring bersifat read-only. Admin tidak memiliki complete, cancel, no-show, delete, atau discontinue.
- Admin dapat konfirmasi booking/DP, mencatat pelunasan aktual satu arah, membantu reschedule dengan audit trail, dan mencetak receipt administratif tanpa melihat harga paket.
- Laporan psikolog menghitung DP terverifikasi dan pelunasan aktual sebagai uang masuk, tanpa biaya/laba dan tanpa duplikasi dari sesi lanjutan.

## Kesiapan API Frontend

- HTTP client tersedia di `src/services/api/client.ts` dengan base URL env, bearer token/Sanctum cookie, CSRF opsional, timeout, error validasi, pagination, upload, dan download Blob.
- Service tersedia untuk auth, user, paket, appointment, jadwal, pre-test, treatment plan, finance/export, review, CMS, dan notifikasi.
- `.env.example` sudah mengarah ke `http://localhost:8000/api/v1` dan menyediakan opsi Sanctum CSRF.
- Service belum dihubungkan ke `AppContext` karena backend belum tersedia. Mock/LocalStorage tetap menjadi sumber data runtime prototype.

## Pekerjaan Tersisa

- QA manual seluruh role pada desktop dan ponsel nyata, termasuk lebar 320/375/430 px.
- Verifikasi print receipt/PDF A4 dan laporan pada browser nyata.
- Profiling performa dan audit loading/error/empty state saat integrasi async.
- Menetapkan kebijakan no-show/cancel/refund dan dampaknya terhadap jatah sesi paket.
- Menetapkan mode Sanctum, kebijakan login produksi, provider WhatsApp, serta format invoice final.
- Membangun Laravel 12+, migration MySQL 8+, policy role, storage privat, transaction/row lock booking, audit log, queue notifikasi, dan automated test.
- Mengalihkan context/controller dari mock ke service API secara bertahap setelah kontrak response backend tersedia.

## Verifikasi Sesi Ini

- Seluruh dokumen live docs (`TODO.md`, `DECISIONS.md`, `CHANGELOG.md`, `SESSION_HANDOFF.md`) telah disinkronkan 100% dengan status implementasi revisi terkini di source code.
- Bug desinkronisasi/ke-undo pada `TODO.md` telah diperbaiki tuntas dengan pengkategorian tugas yang jelas dan tanda `[DONE]`.
- Pengetikan TypeScript (`npx tsc --noEmit`) lolos dengan **0 error (exit code 0)** setelah penambahan definisi `vite-env.d.ts` dan perbaikan narrowing `paymentStatus` di `AppContext.tsx`.
- Hardening frontend terbaru telah diperiksa ulang dengan `npx tsc --noEmit` dan lolos 0 error.
- Audit runtime visual tetap perlu dilakukan developer karena dev server/build tidak dijalankan pada sesi ini.
- `npm run dev` dan `npm run build` tetap tidak dijalankan sesuai batasan `AGENTS.md`.

## Referensi Utama

- [[TODO]]
- [[API]]
- [[ARCHITECTURE]]
- [[DATABASE]]
- [[BUSINESS_RULES]]
- [[ROLES_PERMISSIONS]]
- [[LARAVEL_API_SPEC]]
- [[BACKEND_PACKAGE_AND_TREATMENT_PLAN_SPEC]]

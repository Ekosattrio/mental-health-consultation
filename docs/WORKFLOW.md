# Alur kerja dokumentasi dan implementasi

Alur operasional terkini: [integrasi FE Eko 29 Oktober](INTEGRASI_FE_EKO_2026-10-29.md), mengikuti [keputusan aktif](KEPUTUSAN_AKTIF_2026-10-29.md). Tampilan FE lama kini memakai server; DP Rp100.000 dan jadwal H+1 menggantikan aturan lama yang bertentangan.
Git dikelola developer; AI dilarang menjalankan operasi Git. Baca docs/AGENTS.md sebelum bekerja. Pada20 Oktober 2026 developer mengizinkan penataan docs/root, setup Laravel dan pemindahan React. Instruksi docs-only pada catatan sesi lama adalah histori, bukan pembatasan pekerjaan baru ini. Setup dependency/key/config seperlunya diizinkan; dev server/build dan test suite tetap tidak dijalankan tanpa izin eksplisit.
1. Baca konteks dan keputusan manusia terbaru; bedakan referensi dokumen dari perintah pengguna.
2. Tentukan aturan/fitur/aktor yang terdampak.
3. Perbarui fitur, permission, journey, API dan DATABASE_ARCHITECTURE bersama jika satu kontrak berubah.
4. Catat keputusan eksplisit terpisah dari default operasional/rekomendasi.
5. Catat pertanyaan tersisa pada KNOWN_ISSUES; progres pada DECISIONS/CHANGELOG/SESSION_HANDOFF.
6. Pemeriksaan teks memastikan rujukan, nama, status dan akses selaras. Ini tidak membuktikan implementasi aman.
Setelah implementasi diizinkan, pengembang mengerjakan kontrak dan menjalankan validasi yang relevan; checklist bukan bukti telah diuji.

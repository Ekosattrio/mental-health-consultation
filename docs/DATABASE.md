# Pintu masuk database

29 Oktober 2026: migrasi restore_eko_fixed_initial_payment menetapkan default/kebijakan booking baru FIXED Rp100.000 dan menambah package_versions.presentation (JSON nullable) untuk notes/badge/metadata diskon FE. Tidak menulis ulang invoice, ledger, akun, atau snapshot booking lama. [Rincian integrasi](INTEGRASI_FE_EKO_2026-10-29.md).
Satu kamus data aktif ada di [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md).
Gunakan UUID CHAR36 untuk seluruh PK/FK domain, Rupiah integer, waktu UTC dan aturan kalender WIB. Lihat kamus untuk nama setiap tabel/kolom, null/default, FK, index, enum, insert order dan locking.
Ringkasan prototype/migration lama telah digantikan agar tidak ada dua kontrak. Jangan mengambil foreignId integer atau satu record pre-test per pasien dari dokumentasi historis.

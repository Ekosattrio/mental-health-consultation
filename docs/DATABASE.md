# Pintu masuk database
Satu kamus data aktif ada di [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md).
Gunakan UUID CHAR36 untuk seluruh PK/FK domain, Rupiah integer, waktu UTC dan aturan kalender WIB. Lihat kamus untuk nama setiap tabel/kolom, null/default, FK, index, enum, insert order dan locking.
Ringkasan prototype/migration lama telah digantikan agar tidak ada dua kontrak. Jangan mengambil foreignId integer atau satu record pre-test per pasien dari dokumentasi historis.

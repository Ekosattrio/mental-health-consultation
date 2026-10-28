# Peta dan otoritas dokumentasi
## Urutan pemahaman
Aturan terbaru: [keputusan24 Oktober](KEPUTUSAN_AKTIF_2026-10-24.md). Status migration/model: [handoff](FONDASI_DATABASE_DAN_MODEL_2026-10-24.md). Controller baru dimulai setelah konfirmasi pengguna.
Mulai dari [EKO_PROJECT_GUIDE](EKO_PROJECT_GUIDE.md): peta pelaku/fitur/data, contoh end-to-end, arti snapshot versus duplikasi, dan pembagian React/backend. [SETUP](SETUP.md) menjelaskan Laravel root/React resources/js. Hasil audit aturan ada di [AUDIT_INTEGRASI_DOKUMEN_2026-10-19](audits/AUDIT_INTEGRASI_DOKUMEN_2026-10-19.md). docs/README.md adalah indeks dokumen; README root menjelaskan struktur proyek terbaru.
1. PROJECT_CONTEXT.md dan BUSINESS_RULES.md: kebutuhan dan batas produk.
2. ROLES_PERMISSIONS.md dan actors/: tujuan, kemampuan, alasan dan batas tiap pelaku.
3. journeys/: urutan pengalaman Guest, Pasien, Admin dan Superadmin.
4. FEATURES.md mengindeks F01–F20; detail setiap fitur satu file. Telelayanan Google Meet dan WhatsApp pasien berada di F20.
5. WEB_CONTRACT.md dan DATABASE_ARCHITECTURE.md: kontrak pertukaran data dan kamus penyimpanan.
6. OPERATING_WINDOW_AND_BOOKING_CUTOFF.md dan INVOICE_RECEIPT_FORMAT.md: contoh lintas fitur.
7. DECISIONS.md, KNOWN_ISSUES.md, SESSION_HANDOFF.md: keputusan, sisa pertanyaan dan kelanjutan.
## Otoritas dan perubahan
Instruksi manusia terbaru > keputusan yang eksplisit disetujui > kontrak aktif yang sudah diselaraskan > referensi ide/PDF > rekomendasi/audit historis. Rekomendasi tidak boleh ditulis seolah disetujui manusia. Default operasional dari perancang diberi label dan dapat dikonfigurasi.
Fitur, permission, kontrak web dan database bukan aturan saingan. Perbedaan di antara mereka adalah defect dokumen yang harus diselaraskan.
LARAVEL_API_SPEC.md, BACKEND_PACKAGE_AND_TREATMENT_PLAN_SPEC.md dan DATABASE.md adalah pintu masuk ke kontrak tunggal; tidak menyimpan contoh migration/API lama yang bertentangan.
API.md hanya pointer kompatibilitas menuju WEB_CONTRACT.md. Kontrak REST terdahulu berada di archive/, bukan sumber transport aktif. [Catatan migrasi untuk Eko](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md) mencatat perubahan nyata. Audit/perbandingan lama dan bagian bawah log adalah arsip, bukan scope aktif. Lampiran PDF tidak diedit.
Sejak20 Oktober 2026 tidak ada lapisan folder Psikolog/Live Docs. Dokumen utama langsung docs/, fitur di features/, pelaku di actors/, perjalanan di journeys/, audit di audits/, PDF di references/. README/index/konfigurasi Obsidian terdahulu disimpan di archive/ sebagai histori. docs/AGENTS.md menggantikan duplikasi panduan root/lokasi lama; Markdown dependency vendor/node_modules tetap bagian paket, bukan dokumen proyek yang dipindahkan.
## Template fitur
Setiap fitur memuat latar belakang/tujuan; aktor/authorization; isian wajib/opsional/validasi; alur normal; tabel pemicu-kondisi-hasil; alur gagal/pemulihan; function/route web; data/audit/notifikasi; acceptance criteria; relasi fitur.
## Deployment
Satu HTTPS domain menyajikan Laravel13 + Inertia3 + React melalui routes/web.php, MySQL, private storage, queue/scheduler dan worker Baileys di satu VPS. Eko menangani React; Laravel menjadi otoritas bisnis. Satu deployment tidak mewajibkan seluruh source menjadi satu bahasa/framework.

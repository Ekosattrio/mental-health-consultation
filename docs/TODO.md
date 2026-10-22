# Pekerjaan berikutnya

## Prioritas Integrasi - 22 Oktober 2026
Panduan developer: [merge integrasi lalu main tanpa force](PANDUAN_MERGE_INTEGRASI.md). Pemeriksaan sumber tersedia melalui npm run lint dan npm test.
- [x] Putuskan DP flat Rp100.000 sekali di awal, bukan50%; seluruh booking/reschedule H+1; tanpa extend; cancel wajib lunas.
- [x] Selaraskan BUSINESS_RULES, kontrak web, schema dan fitur aktif; simpan [keputusan final](KEPUTUSAN_FINAL_2026_10_22.md).
- [x] Satukan konflik isi file dan pertahankan perbaikan FE terbaru; arsipkan dokumen legacy, perbaiki import tes.
- [x] Pasang dependency locked tanpa script, periksa TypeScript, jalankan npm test58/58 (55FE +3integrasi sumber).
- [ ] Developer menyelesaikan index merge/staging/commit melalui Git sendiri; agent tidak menjalankan Git.
- [x] Psikoterapi baru di preview memakai invoice per sesi tanpa DP lanjutan; record legacy tidak diubah diam-diam.
- [x] Lengkapi menu/hak operasional Admin preview, request reschedule3kali/H-2/+4hari dan koreksi bukti berversi; tambah tes policy.
- [ ] Lengkapi fase pemilihan ulang slot/request target dan clock kalender/SLA6/12/24jam pada implementasi backend.
- [ ] Implementasikan domain Laravel/DB, authorization field/objek, lock/idempotency dan seluruh route target.
- [ ] Verifikasi browser/mobile serta integrasi DB/notification setelah diizinkan.

Checklist lama di bawah mencatat fondasi/target, bukan bukti semua fitur Desman sudah berjalan.

## Fondasi20Oktober2026
- [x] Flatten dokumen dan perbarui link, README serta lokasi AGENTS.
- [x] Inisialisasi Laravel13 dan pindahkan React ke resources dengan Laravel-Vite.
- [x] Dependency/lockfile, env/key lokal, UUID akun dan bootstrap/route awal disiapkan.
- [x] Periksa struktur/link/import/hash, syntax PHP dan bootstrap tanpa server/build/migrasi/test.
- [ ] Implementasikan backend bisnis, policy/ownership/expected_version, provisioning owner dan46tabel sesuai kontrak.
- [x] Sesuaikan fondasi menjadi Inertia3: page resolver, controller/props, login/logout sesi, middleware role, preview mock lokal.
- [x] Selaraskan WEB_CONTRACT/panduan dan tulis catatan perubahan untuk Eko.
- [ ] Migrasikan seluruh fitur domain dari mock ke controller/props/form web; jangan campur mutasi dua sumber.
- [ ] Konfigurasikan database/provider nyata dan jalankan migration/build/test setelah diizinkan.

## Dokumentasi
- [x] Koreksi terbaru dimasukkan ke fitur, actor/journey, akses, API dan database.
- [x] F01–F20 mempunyai template teknis lengkap, termasuk alur gagal dan transisi.
- [x] Schema domain memiliki tipe/key/null/default/index dan insert/lock policy tunggal.
- [x] Pisahkan akses PDF7hari dari retensi file1tahun; laporan asesmen boleh offline.
- [x] Expense/surplus owner dan export jadwal Admin masuk scope.
- [x] Basis25% menjadi pengaturan versi paket oleh Admin/Superadmin; pilihan normal/setelah promo, snapshot booking lama tetap.
- [x] Penyelesaian lebih bayar di luar sistem; hapus kebutuhan status/tiket resolusi, pertahankan ledger aktual.
- [x] Telelayanan Google Meet ditetapkan: Admin mengisi link, otomatis kirim WA pasien via Baileys; API/schema/akses/alur gagal diperbarui.
- [x] Psikoterapi pilihan B: booking pertama langsung membuat plan administratif4unit dan tagihan sesi1 saja, lanjutan Admin; unique/idempotency terdokumentasi.
- [x] Profiling offline kertas langsung ke Superadmin; Admin administrasi/pembayaran, booking PAPER tanpa submission digital. Selaraskan API, role, journey dan schema.
- [ ] Isi data praktik dan durasi paket yang belum tersedia sebelum bookable.
## Implementasi kelak oleh pengembang
- [ ] Terapkan kontrak Laravel/React, schema, DTO dan state transitions.
- [ ] Bangun ledger/fileprivate/lock/idempotency/outbox dan policy per role.
- [ ] Verifikasi concurrency, kalkulasi, authorization dan batas waktu setelah developer mengizinkan pengujian.
Tidak ada kotak di atas yang mengklaim source aplikasi telah selesai atau diuji.

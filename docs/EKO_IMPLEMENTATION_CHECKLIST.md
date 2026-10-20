# Checklist implementasi untuk Eko
Checklist domain tetap target. Fondasi web Laravel/Inertia telah dibuat20Oktober2026; bukan berarti fitur domain atau integrasi sudah diuji.
## Baca
Mulai dari [panduan proyek Eko](EKO_PROJECT_GUIDE.md), lalu urutan detail di bawah. Temuan koreksi terbaru ada pada [audit integrasi](audits/AUDIT_INTEGRASI_DOKUMEN_2026-10-19.md).
PROJECT_CONTEXT -> BUSINESS_RULES -> ROLES_PERMISSIONS -> aktor/journey -> F01–F20 -> WEB_CONTRACT -> DATABASE_ARCHITECTURE.
DTO adalah struktur pertukaran request/response. Buat tipe/proyeksi per role; jangan mengirim model penuh lalu menyembunyikannya dengan CSS.
## Fondasi yang sudah tersedia
- [x] Laravel13/Inertia3/React19 satu proyek, route web dan resolver pages.
- [x] Home publik whitelist; login/logout session; workspace dengan middleware auth/active/role.
- [x] Pisahkan preview mock Eko lokal dan client lama di legacy/api.
- [x] Kontrak web dan [catatan perubahan Eko](PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md).
- [ ] Siapkan database/provisioning aman, implementasikan domain dan integrasi, lalu verifikasi runtime setelah diizinkan.

## Integrasi
- Session Laravel web+CSRF dan form Inertia. Login/logout dasar tersedia; register/Google/reset/revoke-all serta UX session expired dan blocked lengkap masih dilanjutkan.
- Guest tidak menerima harga; pasien login menerima harga normal dicoret/promo dan snapshot.
- Admin melihat harga/diskon/total, tidak saldo/aggregate paid/receipt penuh; proof/input aktif tersedia untuk verifikasi.
- Booking deadline aktual min24jam/awal sesi, H+1+enam jam kerja, server availability/versi, idempotent retry.
- Upload private nyata, versi koreksi, alasan reject/deadline; auto-confirm tidak sama dengan uang VERIFIED.
- Kedatangan wajib cek/approve/penagihan offline/input aktual; check-in setelah minimum.
- Reschedule request terpisah, eligibility requested_at, kuota saat APPLIED, release lama atomik; post-no-show kembali aktif dengan histori.
- Perubahan jam klinik memicu daftar terdampak dan pemilihan ulang bebas kuota, bukan warning saja.
- Additional time total menit per usaha Konseling; preview server, selisih tagihan, addendum sesudah paid.
- Editor paket Admin/Superadmin menyediakan additional_time_price_basis wajib untuk Konseling bookable: harga normal atau setelah promo; preview dan snapshot versi memastikan booking lama tidak berubah. Input menit bukan tempat mengganti basis.
- Diskon global dan individual beralasan, tidak custom charge negatif, tidak menimpa receipt/kas.
- Asesmen satu case/billing banyak jadwal dan laporan included/offline; Psikoterapi pilihan B: pasien booking pertama langsung, atomik membuat plan4unit + appointment/invoice sesi1 saja; lanjutan Admin, extend sesi5 oleh owner. Retry/submit bersamaan tidak membuat dua plan ACTIVE atau menagih sesi belum dipesan; gunakan active_plan_guard dan idempotency F11.
- Export jadwal Admin terpisah dari finance/expense owner; as_of dan link sumber.
- PDF pasien7hari setelah layanan terminal; file1tahun; ringkasan tetap ada.
- Profiling versi per appointment, draft nullable FK, null bukan false; klinis tidak masuk DTO Admin/WA.
- Telelayanan F20: paket Google Meet, konfirmasi nomor WA saat booking, form link Admin/Superadmin, save otomatis enqueue Baileys, status kirim dan resend. Terapkan revisi per attempt, pembatalan antrean lama, penerima tanpa akun dan pemeriksaan kehadiran online manual.
## Kondisi UI
- row_version/expected_version berbeda dari version konten, attempt dan revision menit. Jangan pakai nama amount_claimed/claim_amount atau arah DECREASE; canonical claimed_amount dan PLUS/MINUS.
- Pembatalan sebelum layanan/expiry/hak berakhir: CLOSED_UNSERVED, pelepasan sisa tertaut, uang aktual tetap; jangan menampilkan PAID atau utang tersisa. Review ditolak bila tidak ada layanan nyata.
- Follow-up asesmen mewarisi pembayaran/clock case; counter reschedule/progres dihitung, bukan field writable kedua. Request expired teknis dengan requires_resolution tetap memerlukan keputusan.
- Profiling offline memakai PAPER, tanpa submission/upload kertas; kertas langsung dari pasien ke Superadmin. Admin hanya identitas/jadwal/administrasi/pembayaran. Online wajib DIGITAL; endpoint tulis answers tidak terbuka untuk Admin. Revisi digital memakai rantai supersedes_id linear, bukan overwrite/fork.
- Export worker memakai dataset_snapshot/as_of sesuai role; tidak mengambil data hidup ulang setelah antrean. UI memuat result dari server dan menangani409 untuk mutasi stale.
Loading/empty/error/stale/slot-conflict, unggah gagal, reupload, proof ditolak, rekonsiliasi, request menunggu melewati sesi, layanan harus dipilih ulang karena klinik, overdue dan copy non-refund.
Jangan membuat frontend menghitung kebenaran saldo/tarif/status. Loading sukses hanya sesudah response commit.
## Terbuka
Basis tarif tambahan sudah menjadi pengaturan per versi paket (F04). Penyelesaian lebih bayar ditetapkan di luar sistem, bukan lagi pertanyaan keputusan atau fitur resolusi; ledger aktual tetap benar tanpa refund/credit/hangus otomatis. Telelayanan tidak lagi ditunda; implementasikan F20. Placeholder data praktik bukan data produksi.

# Konteks produk JiwaSehat
## Tujuan
Membantu calon pasien memahami praktik; pasien terdaftar memesan Konseling, Asesmen/tes dan Psikoterapi; Admin mengurus administrasi/pembayaran; satu Superadmin adalah owner sekaligus praktisi.
Web menyediakan administrasi dan persiapan, bukan ruang chat/diagnosis otomatis. Telelayanan berlangsung di Google Meet: Admin memasukkan link pada booking, lalu sistem mengirim otomatis ke WA pasien/penanggung jawab melalui Baileys. Scope pelaksanaan sudah ditetapkan; detail fitur F20.
## Aktor dan pengalaman
Guest: company profile, kategori tanpa harga, kredensial/kontak dan review approved; CTA menuju login.
Pasien: email/password atau Google, profil diri/pasien aktual, penanggung jawab sederhana, harga setelah login, profiling per booking, jadwal/deadline, pembayaran, riwayat, reschedule dan receipt.
Admin: daftar pasien/walk-in, kalender/jam buka, booking/lanjutan, cek bukti/input aktual, harga/diskon/total tanpa saldo, tagih offline saat kedatangan, lifecycle administratif, biaya/diskon kustom, export jadwal dan moderasi.
Superadmin: semua administrasi, pre-test/keputusan klinis, rencana terapi/cakupan asesmen, laporan pendapatan-pengeluaran-surplus, akses audit dan konfigurasi akun internal.
## Batas penting
Aturan terbaru ada di [keputusan final integrasi](KEPUTUSAN_FINAL_2026_10_22.md) dan BUSINESS_RULES. DP flat Rp100.000 sekali pada awal booking/rangkaian, mengurangi biaya; bukan 50%. Semua booking dan reschedule H+1. Psikoterapi ditagih per sesi yang dipesan; setelah empat sesi harus booking rangkaian baru, bukan extend. Pembatalan seluruh sisa layanan wajib lunas atas tagihan terbentuk, tanpa write-off/refund. Asesmen satu tagihan dasar per case. Hak Admin dan scope tambahan mengikuti Desman sebagai target, bukan klaim implementasi.
Kalender Admin sama dengan klinik. Online H+1 dan enam jam kerja; hold min24jam atau awal sesi. SLA12jam kerja melindungi reservasi tanpa mengakui uang. Kedatangan selalu diperiksa Admin.
Hasil pemeriksaan boleh diberikan offline; tidak wajib unggah hasil klinis. Profiling tidak memuat DASS. Pengeluaran owner dan export jadwal Admin masuk scope ide.
Penyelesaian kelebihan bayar di luar sistem; penerimaan aktual tetap dicatat tanpa fitur/tiket resolusi, refund atau credit. Telelayanan memakai kalender/guard pembayaran yang sama dengan sesi tatap muka; link/pesan terkirim tidak otomatis menandai hadir.
## UX yang dipertahankan
Tampilan responsif mobile/desktop, sidebar dapat diciutkan, FAQ/panduan jelas. Section pengalaman konseling dapat berupa carousel manual/otomatis; hanya review approved. Footer company profile tampil di landing, tidak perlu memenuhi dashboard.
Status loading, gagal upload, sesi login habis, slot konflik dan antrean verifikasi harus jelas. Copy tidak menjanjikan lunas dari upload atau hold selalu24jam.
Nomor, alamat, rekening, logo, SIP/STR dan tanda tangan memakai placeholder sampai diisi owner.
## Teknis dan status kerja
Target Laravel13 + Inertia3 + React19 TypeScript Vite + MySQL8, satu VPS/domain, session Laravel web dan route web.php; worker Baileys.
Audit aturan19Oktober tidak menilai source. Pada20Oktober developer meminta setup Laravel/root dan pemindahan React; fondasi tersebut telah disiapkan. Developer kemudian menyetujui Inertia: Home/login/logout/workspace dasar memakai backend, preview desain Eko lokal masih mock. Backend domain belum diimplementasikan/diuji lengkap. Per22Oktober, preview FE telah menambahkan billing per sesi untuk data baru (legacy tetap), menu operasional Admin, request pasien/review Admin dan koreksi proof berversi; TypeScript dan58tes lolos. Ini bukan bukti backend atau browser/mobile selesai. Lihat SETUP.md untuk status dan batas validasi.

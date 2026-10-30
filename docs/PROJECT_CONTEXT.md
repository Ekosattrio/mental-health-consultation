# Konteks project - 29 Oktober 2026

JiwaSehat adalah website profil praktik dan booking layanan Konseling, Asesmen, serta Psikoterapi. Tampilan utama menggunakan FE Eko pada resources/js/components; backend Laravel/Inertia dari fondasi Desman digunakan untuk data dan transaksi. Workspace alternatif tidak menjadi dashboard utama.

Stack tersedia: Laravel13, MySQL8, Inertia3, React19, TypeScript, Vite/Tailwind. Browser memakai session/CSRF Laravel pada origin yang sama. Tidak memindahkan data mock/LocalStorage ke database praktik.

Keputusan Eko terbaru: DP Rp100.000 sekali di awal dan mengurangi biaya; H+1 booking/reschedule/lanjutan seluruh role; pembayaran dicatat/diverifikasi Admin; lifecycle/no-show/pembatalan dan sesi berikutnya oleh Psikolog. Pembatalan wajib lunas. Psikoterapi empat sesi, kemudian booking baru tanpa extend plan lama. Pembayaran bertahap/prabayar memakai ledger dan alokasi server.

Mulai dari [keputusan aktif](KEPUTUSAN_AKTIF_2026-10-29.md), [pemetaan integrasi/alur](INTEGRASI_FE_EKO_2026-10-29.md), [handoff dan hasil tes](SESSION_HANDOFF.md), serta [TODO/UAT](TODO.md). Dokumen Desman24/26Oktober yang berbeda merupakan histori pada bagian tersebut.

AI tidak menjalankan Git, dev server, atau build. Checker/tes terfokus telah diizinkan. Sebelum dipakai publik masih perlu UAT browser/mobile dan konfigurasi identitas, rekening, integrasi Google/WhatsApp, SMTP, deployment serta backup nyata.

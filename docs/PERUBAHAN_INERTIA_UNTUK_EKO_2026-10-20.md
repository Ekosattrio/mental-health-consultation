> Histori migrasi arsitektur20Oktober. Status schema/model terbaru pada [handoff24 Oktober](FONDASI_DATABASE_DAN_MODEL_2026-10-24.md); aturan aktif pada [keputusan24 Oktober](KEPUTUSAN_AKTIF_2026-10-24.md).

# Perubahan fondasi web untuk Eko — 20 Oktober 2026

## Keputusan dan alasannya

Developer menyetujui Laravel13 + React19 melalui Inertia3 dalam satu proyek dan domain. Laravel mengelola URL, session, controller, validasi dan transaksi; React mempertahankan tampilan/interaksi Eko. Navigasi web tidak memerlukan aplikasi REST terpisah. Browser tetap bertukar data melalui HTTP; Inertia menghubungkan controller Laravel dengan komponen halaman React.

Keputusan ini melanjutkan penataan Laravel root dan React ke resources pada hari yang sama. Tidak memasang starter kit yang menimpa desain. [Analisis sebelum persetujuan](audits/ANALISIS_ARSITEKTUR_WEB_2026-10-20.md) disimpan sebagai histori; dokumen ini mencatat hasil implementasi setelah persetujuan.

Aturan bisnis yang sudah diputuskan tetap mengikuti [BUSINESS_RULES](BUSINESS_RULES.md), fitur F01–F20 dan kamus database. Pergantian transport tidak mengubah DP, slot, ledger, reschedule, profiling kertas atau kebijakan akses.

## Sebelum dan sesudah

| Bagian | Fondasi sebelumnya | Fondasi aktif |
|---|---|---|
| Entry React | App.tsx memilih tampilan memakai currentRole Context | main.tsx menjalankan createInertiaApp dan resolver pages |
| Route | Shell React fallback dan placeholder api.php | Route eksplisit di routes/web.php dengan controller/middleware |
| Identitas sesi | Login/role simulasi di frontend | Session Laravel dan role/status dari users; bukan pilihan role browser |
| Data halaman | AppContext/mock/LocalStorage | Props server yang di-allowlist per halaman/role |
| Submit form | Controller TypeScript/mock atau client HTTP lama | useForm/router -> action Laravel -> redirect/errors setelah commit |
| API client lama | services/api, disiapkan untuk REST | legacy/api sebagai referensi; tidak dipakai halaman web baru |
| Desain lama | Aplikasi prototype utama | Preview lokal /preview/eko, bertanda data demo |
| Kontrak | API.md dengan prefix REST | WEB_CONTRACT.md; API.md hanya pengarah kompatibilitas |

## Lokasi yang Eko kerjakan

```text
resources/js/
  main.tsx                     Entry Inertia dan lazy page resolver
  pages/
    Home.tsx                   Adapter props publik dari Laravel
    Auth/Login.tsx             Form sesi email/password
    Dashboard.tsx              Workspace awal dengan identitas sesi
    LegacyPreview.tsx          Pembungkus App.tsx lama, lokal saja
  layouts/WebLayout.tsx        Navigasi Link, logout POST, flash
  components/landing/
    LandingPageView.tsx        Tampilan landing dari props, tanpa Context mock
    LandingPage.tsx            Adapter Context untuk preview lama
  types/web.ts                 Kontrak props fondasi
  legacy/api/                  Client HTTP terdahulu, referensi historis
  App.tsx, context/, api/,
  controllers/, models/, data/  Bagian prototype; bukan otoritas data web baru

app/Http/
  Controllers/                 Home, sesi login/logout, dashboard
  Requests/Auth/LoginRequest.php
  Middleware/                  Inertia, akun aktif, role, preview lokal
routes/web.php                 Pendaftaran URL/nama route
config/inertia.php             Resolver server, history; SSR/devtools disabled
config/jiwasehat.php            Placeholder profil dan katalog publik non-bookable
resources/views/app.blade.php  Shell head/app Inertia3 dan Vite
```

Komponen tampilan lain Eko tetap ada di resources/js/components. Jangan memindahkannya keluar proyek atau membangun frontend deployment kedua. Komponen yang masih bergantung useApp perlu diadaptasi saat fiturnya dimigrasi; menyalinnya ke pages saja belum mengganti sumber datanya.

## Yang sudah dibuat

- Dependency adapter PHP/React Inertia3, middleware web, Blade shell dan page resolver. Versi terkunci: Laravel13.37.0, inertia-laravel3.5.1, @inertiajs/react3.9.1, React19.3.0, Vite8.3.4.
- Beranda GET / dari HomeController. Props publik hanya profil placeholder, metadata layanan dan review publik kosong; belum CMS/katalog DB. Paket belum bookable dan harga tidak dimasukkan ke props Guest. Landing visual Eko dipakai melalui view presentasional; FAQ pembayaran/jadwal diselaraskan dengan aturan aktif tanpa nominal publik.
- GET/POST /login dan POST /logout memakai sesi Laravel. Email dinormalisasi, field asing ditolak, login ACTIVE diberi rate limit; sesi diregenerasi saat berhasil dan diinvalidasi saat logout. Logout juga menghapus history Inertia.
- /dashboard mengarahkan sesuai role dari backend; workspace pasien/Admin/Superadmin memakai auth, active dan role. Dashboard baru berupa kerangka, tidak mengarang booking atau angka keuangan.
- Shared props minimal: auth.user milik sesi sendiri, nama aplikasi, URL navigasi, flash/errors; tidak ada seluruh daftar pasien/pembayaran/klinis.
- Preview Eko hanya APP_ENV=local + ENABLE_LEGACY_PREVIEW=true. Flag saja di production tetap404. Role/login simulasi dalam preview tidak membuat sesi Laravel. LocalStorage preview tidak menulis transaksi database.
- Sanctum dan placeholder routes/api.php dilepas dari fondasi web. Tidak ada kewajiban /api/v1, /sanctum/csrf-cookie atau bearer token untuk browser ini. Client lama tetap sebagai referensi di legacy/api; variabel transport REST tidak lagi menjadi konfigurasi web aktif.

Kode login nyata sudah dibuat, tetapi belum dicoba dengan database/akun. Tidak ada migration, seeding, provisioning owner atau akun demo dalam sesi ini. Jangan menyatakan alur login operasional hanya dari adanya form dan route.

## Pola kerja fitur berikutnya

1. Baca file fitur, role/journey, [WEB_CONTRACT](WEB_CONTRACT.md) dan [DATABASE_ARCHITECTURE](DATABASE_ARCHITECTURE.md). Bedakan route target dari daftar runtime yang benar-benar dibuat.
2. Definisikan props halaman dan input action. Backend mengirim data minimum sesuai role; buat tipe React khusus, bukan serialize model lengkap. Snake_case dipetakan eksplisit bila view Eko memakai camelCase.
3. Buat route/controller dan FormRequest/policy. Controller menyusun props halaman; domain action/service memegang kalkulasi, locking, state transition, histori dan outbox.
4. Adaptasi komponen Eko agar menerima props/callback. Halaman Inertia mengirim form melalui useForm/router dan menampilkan errors/processing/empty. Navigasi memakai Link. Aksi belum dibuat tidak ditampilkan sebagai sukses.
5. Mutasi sukses sesudah commit lalu redirect ke hasil. expected_version dan idempotency tetap server. Untuk form Inertia, konflik bisnis dikemas sebagai error action/flash aman dan muat ulang props; jangan mencampurnya dengan HTTP409 khusus protokol Inertia.
6. Jika availability/autosave/status pengiriman perlu JSON kecil, gunakan route web terotorisasi dan client HTTP eksplisit; jangan melakukan kunjungan Inertia ke respons JSON biasa.
7. Hapus ketergantungan mock untuk fitur yang sudah dipindahkan. Satu aksi tidak boleh menyimpan ke LocalStorage dan database sekaligus. Preview boleh tetap menjadi contoh visual, tetapi tidak menjadi jalur fallback transaksi.

Nama render Laravel harus sama dengan path page tanpa ekstensi: Auth/Login -> resources/js/pages/Auth/Login.tsx. Semua halaman bisnis baru memerlukan ownership objek selain role; UUID dari URL bukan bukti izin.

## Batas akses yang wajib dipertahankan

Guest tidak menerima nominal harga/promo/DP. Harga untuk pasien login disediakan oleh halaman paket/booking yang kelak dibuat, bukan memasukkan katalog harga ke shared props atau Home publik.

Admin boleh harga/diskon/total dan nominal bukti/input aktif untuk verifikasi; saldo, agregat paid, receipt penuh, jawaban klinis dan finance seluruh praktik tidak dikirim. Superadmin bisnis tetap role teknis PSYCHOLOGIST. Menyembunyikan elemen React tidak menggantikan penyaringan props/backend.

Profiling offline tetap kertas langsung dari pasien ke Superadmin. Preview/form baru tidak boleh memberi Admin input/upload jawaban kertas. Bukti bayar bukan uang VERIFIED, auto-confirm SLA bukan pengakuan kas, dan link Meet bukan kehadiran. Seluruh guard transaksi tetap mengikuti dokumen domain.

## Belum dibuat dan batas pemeriksaan

Belum diimplementasikan seluruh46tabel domain, register/Google/reset/revoke-all, provisioning akun owner/internal, policy objek bisnis, booking, pembayaran/ledger, upload privat, kalender/reschedule, terapi/asesmen, CMS, export, Baileys dan pekerjaan terjadwal. Desain komponen untuk fitur itu ada dalam prototype; bukan implementasi server.

SSR/devtools dinonaktifkan. Konten React belum dirender penuh di server untuk SEO; kebutuhan Blade publik/SSR dinilai terpisah. History encryption membutuhkan secure context; domain Laragon HTTP khusus dapat memerlukan HTTPS atau flag lokal false. Konfigurasi dan panduan operator ada di [SETUP](SETUP.md).

Pemeriksaan yang dilakukan: dependency/lockfile/platform, syntax PHP, typecheck TypeScript, daftar route serta struktur/link/import dan integritas pemindahan source. Tidak menjalankan Git, browser, dev server, build, test suite, migration atau seeding. Belum ada bukti render visual, login DB nyata, transaksi bersamaan atau provider eksternal berhasil. Tanpa aset Vite/manifest halaman belum dapat ditampilkan; jangan menyebut pemasangan dependency sebagai build aplikasi.

Status akhir dan pekerjaan berikutnya dicatat di [SESSION_HANDOFF](SESSION_HANDOFF.md); kendala aktif di [KNOWN_ISSUES](KNOWN_ISSUES.md). Data praktik/nomor/rekening/durasi yang belum tersedia tetap placeholder hingga diisi pengelola.

## Rujukan resmi

- [Laravel frontend/Inertia](https://laravel.com/docs/13.x/frontend#inertia) dan [session authentication](https://laravel.com/docs/13.x/authentication).
- [Setup server Inertia3](https://inertiajs.com/docs/v3/installation/server-side-setup) serta [client manual](https://inertiajs.com/docs/v3/installation/client-side-setup).
- [Forms](https://inertiajs.com/docs/v3/the-basics/forms), [shared props](https://inertiajs.com/docs/v3/data-props/shared-data) dan [history encryption](https://inertiajs.com/docs/v3/security/history-encryption).

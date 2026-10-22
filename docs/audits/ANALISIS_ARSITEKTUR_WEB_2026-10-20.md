# Analisis pilihan arsitektur web JiwaSehat

**Pembaruan setelah analisis:** developer telah menyetujui rekomendasi Inertia. Fondasi dimigrasikan; lihat [catatan implementasi untuk Eko](../PERUBAHAN_INERTIA_UNTUK_EKO_2026-10-20.md) dan [kontrak web aktif](../WEB_CONTRACT.md). Isi analisis di bawah mempertahankan kondisi saat pemeriksaan, bukan status kode sekarang.

Tanggal pemeriksaan:20Oktober2026. Status: **rekomendasi untuk dipertimbangkan, belum keputusan migrasi**. Source dibaca secara statis dan dokumentasi resmi ditelaah. Tidak mengubah kode/config/dependency, menjalankan Git, server, build, migration atau test.

## Kesimpulan

Untuk kebutuhan yang diketahui—web pasien/petugas, satu praktik, React Eko sudah ada, satu deployment, tanpa kebutuhan mobile/API publik yang ditetapkan—rekomendasi analisis adalah Laravel13 + React19 + Inertia3 dengan route web, session cookie dan CSRF. API eksternal tidak perlu menjadi fondasi seluruh halaman web. Kesimpulan ini merupakan penilaian kecocokan proyek, bukan klaim bahwa semua aplikasi satuVPS harus memakai Inertia.

Proyek saat ini sudah satu folder dan satu deployment meskipun menyiapkan /api/v1. Pilihan API adalah cara pertukaran data; jumlah VPS/repository tidak otomatis menentukannya. Mengganti lokasi route JSON ke web.php saja belum mengubah pola frontend.

Laravel mendokumentasikan integrasi React melalui Inertia, dan React starter kit resminya saat pemeriksaan memakai Inertia3/React19/Tailwind4. Ini dukungan ekosistem, bukan perintah memasang starter kit di atas UI yang sudah ada. [Laravel frontend](https://laravel.com/docs/13.x/frontend#inertia), [starter kits](https://laravel.com/docs/13.x/starter-kits#react).

## Kondisi lokal yang ditemukan

| Berkas | Temuan | Implikasi |
|---|---|---|
| [web.php](../../routes/web.php) | Satu shell React fallback | Belum route/controller terpisah per halaman |
| [Kontrak REST terdahulu](../archive/API_REST_SEBELUM_INERTIA_2026-10-20.md) | Placeholder kontrak | Belum ada backend bisnis matang yang harus dipertahankan kompatibilitas publiknya |
| [App.tsx](../../resources/js/App.tsx) | Halaman dipilih dari currentRole pada Context | Perlu page entry dan navigasi URL Laravel ketika memakai Inertia |
| [AppContext](../../resources/js/context/AppContext.tsx) | State domain, data mock dan LocalStorage | Data otoritatif perlu dipindah ke backend; Context tetap dapat dipakai untuk state UI |
| [api/apiClient](../../resources/js/api/apiClient.ts) | Simulasi HTTP melalui resolver lokal | Nama endpoint tidak berarti sudah ada request server |
| [legacy/api/client](../../resources/js/legacy/api/client.ts) | Client fetch/cookie nyata terpisah | Ada dua jalur data; perlu diganti bertahap dengan satu jalur per fitur |
| [PatientController TS](../../resources/js/controllers/PatientController.ts) | Mengorkestrasi data/aksi mock frontend | Bukan controller Laravel dan bukan tempat menjamin transaksi database |

Inertia belum ada dalam composer.json/package.json. Memindahkan file ke resources/js pada setup sebelumnya belum mengubahnya menjadi aplikasi Inertia. Tidak ada pengukuran performa atau bukti migrasi otomatis dapat dilakukan tanpa penyesuaian.

## Perbandingan untuk scope sekarang

| Pilihan | Kelebihan | Biaya/risiko | Penilaian |
|---|---|---|---|
| React + API JSON satu proyek | Klien mandiri, berguna bila mobile/partner benar-benar ada | Routing/data/error frontend dan kontrak JSON terpisah perlu dirawat | Tetap valid; pemisahan repository tidak wajib |
| Laravel + Inertia + React | Routing/auth mengikuti Laravel, UI React tetap digunakan | Page props/form/navigasi perlu diadaptasi, frontend terikat pada kontrak halaman | Paling sesuai kebutuhan saat ini menurut analisis |
| Laravel + Blade/Livewire | Alur PHP kuat, HTML server cocok halaman sederhana | UI/interaksi React perlu dipindah ke pendekatan lain | Tidak dipilih untuk seluruh aplikasi karena investasi UI Eko |
| React fetch JSON melalui web.php tanpa Inertia | Session web tetap dapat dipakai | Sebagian besar pekerjaan routing/pengelolaan data React masih dibuat sendiri | Bisa, tetapi memindahkan file route bukan penyederhanaan menyeluruh |

Dokumentasi React menjelaskan bahwa membangun aplikasi dari dasar memerlukan pilihan routing dan data fetching sendiri. Dokumen itu tidak secara khusus mewajibkan Laravel memakai Inertia atau harus berpindah ke Next.js. [React creating an app](https://react.dev/learn/creating-a-react-app).

## Bentuk alur yang direkomendasikan

Gunakan routes/web.php untuk registrasi route; file bernama route.php bukan nama default Laravel modern. Group web menyediakan session/CSRF. Controller mengembalikan page Inertia; komponen React menerima props yang telah disaring. Navigasi Inertia memakai HTTP dan respons halaman berisi data, sehingga browser tetap berkomunikasi dengan server. [Laravel routing](https://laravel.com/docs/13.x/routing#the-default-route-files), [Inertia how it works](https://inertiajs.com/docs/v3/core-concepts/how-it-works).

Untuk booking: pasien membuka form, backend menyajikan paket/jadwal berizin, pasien submit POST, request/policy memvalidasi, action/service mengunci slot dan menyimpan booking/tagihan/histori/outbox dalam transaction, kemudian redirect menampilkan hasil commit. Tombol loading hanya UX; idempotency dan pemeriksaan ulang availability tetap server. [Laravel transactions](https://laravel.com/docs/13.x/database#database-transactions).

Route cukup menghubungkan URL dengan controller/middleware. FormRequest menangani input/otorisasi yang sesuai; policy memeriksa objek; service/action menangani unit bisnis kompleks; Eloquent memetakan database. Tidak wajib menambah repository interface atau abstraksi untuk setiap tabel tanpa kebutuhan nyata.

Untuk form Inertia, rancang ulang kontrak sukses/error menjadi alur redirect dan errors; jangan menempelkan handler JSON lama tanpa penyesuaian. Konflik bisnis409 dan expected_version perlu penanganan UX khusus, sementara validasi form mengikuti mekanisme Inertia. [Inertia forms](https://inertiajs.com/docs/v3/the-basics/forms), [Inertia protocol](https://inertiajs.com/docs/v3/core-concepts/the-protocol).

## Keamanan dan ketepatan data tetap wajib

Login web Inertia dapat memakai session Laravel; Sanctum tidak wajib khusus untuk browser monolith itu. Kebutuhan Sanctum/API token kelak dinilai terpisah; jangan menghapus dependency hanya dari dugaan. Google login tetap integrasi OAuth sesuai kebutuhan produk. [Inertia authentication](https://inertiajs.com/docs/v3/security/authentication).

Data yang dikirim melalui props dapat dibaca browser. Admin tidak menerima saldo/agregat paid/jawaban klinis; Guest tidak menerima harga. Jangan memasukkan seluruh appointments/users/intakeForms sebagai shared props lalu menyembunyikan kolom di React. Shared data dibuat minimal; halaman mengambil data yang dibutuhkan sesuai policy/ownership. [Inertia responses](https://inertiajs.com/docs/v3/the-basics/responses), [shared data](https://inertiajs.com/docs/v3/data-props/shared-data).

OWASP menganjurkan hak minimum, penolakan default dan pengecekan izin setiap request termasuk objek spesifik. Berpindah ke web route tidak menghapus kebutuhan ini. Reschedule, ledger, invoice immutable, DP, PAPER offline, cutoff/SLA, upload privat dan outbox tetap aturan yang sama. [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

Kalender/pencarian yang membutuhkan JSON kecil tetap dapat mempunyai endpoint internal terotorisasi pada session web; tidak harus dipaksa menjadi navigasi seluruh halaman. Inertia3 juga menyediakan useHttp untuk pola respons JSON. Baileys worker tetap integrasi internal, dan tidak harus memakai route publik pada api.php. [Inertia HTTP requests](https://inertiajs.com/docs/v3/the-basics/http-requests).

Inertia tanpa SSR tidak otomatis menyajikan seluruh konten React sebagai HTML hasil render server. Untuk SEO company profile, evaluasi Blade pada halaman publik atau SSR Inertia. Dashboard tidak otomatis memerlukan SSR; SSR menambah proses renderNode. SatuVPS tetap memungkinkan beberapa proses, tetapi kecukupan resource perlu data kapasitas, bukan asumsi. [Inertia SSR](https://inertiajs.com/docs/v3/advanced/server-side-rendering).

## Dampak migrasi jika developer menyetujuinya

1. Tetapkan Inertia sebagai adapter web; pertahankan komponen/desain Eko dan hindari pemasangan starter kit yang menimpa proyek.
2. Tambahkan adapter server/client, middleware, page resolver dan shell sesuai versi yang dipilih. Buat layout dan page entry, bukan memindahkan semua kode ulang.
3. Mulai satu alur utuh: session login, policy, page dan form yang benar-benar memakai database. Context global tidak lagi menjadi sumber role/harga/pembayaran.
4. Pindahkan satu fitur per tahap; jangan menjalankan mutasi mock dan backend untuk aksi sama. Jaga batas fitur lama yang belum dimigrasi agar tidak tampak sebagai data produksi.
5. Pertahankan DTO/allowlist sebagai bentuk props. docs/API.md dipetakan menjadi kontrak route/action/props/form/JSON pendukung; bagian aturan, nama field, idempotency dan status tidak dibuang.
6. Selaraskan ARCHITECTURE, API_BOUNDARY, SETUP, README, fitur serta checklist/auth/error dengan keputusan baru. Rancangan database tidak perlu diganti hanya karena adapter UI berubah.
7. Sesudah izin pengujian/build tersedia, verifikasi navigasi/history, form, authorization, konflik slot, retry pembayaran dan konsistensi data pada alur yang dimigrasi.

Kesimpulan rekomendasi belum mengubah arsitektur aktif. Kontrak setup /api/v1 yang ada tetap berlaku sampai developer memutuskan migrasi tersebut.

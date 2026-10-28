# Audit penambahan Eko — 24 Oktober 2026

## Kesimpulan dan ruang lingkup

Ada penambahan substansial pada dokumentasi serta FE preview. Belum tepat menyatakan seluruh aturan dan alurnya aman: pemeriksaan menemukan ketidaksesuaian kebutuhan, kasus gagal operasional, perubahan data master yang berisiko, dan beberapa kontrak yang belum tegas.

Audit dimulai dari dokumen integrasi/pembayaran/CMS/flow/handoff, dibandingkan dengan aturan, kontrak web, schema dan fitur terkait, lalu ditelusuri ke view, facade AppContext, mock endpoint dan helper. Tidak ada perubahan pada source aplikasi, aturan aktif atau data pengguna. File bantu audit berada di .codex-tmp; laporan ini satu-satunya dokumentasi baru dari audit ini.

Inventaris penambahan didasarkan pada changelog/handoff, file yang tersedia, dan snapshot pemindahan awal. Git/history penulis tidak diperiksa; laporan tidak mengklaim dapat mengatribusikan setiap perubahan baris kepada Eko atau menentukan commit pengenalannya.

Scaffold Laravel dan FE preview tetap dua jalur berbeda. Belum dibuatnya seluruh backend tidak dihitung sebagai bug baru pada audit ini. Temuan eksekusi di bawah berlaku pada helper/facade/komponen preview yang diperiksa, bukan bukti transaksi produksi atau database nyata telah mengalami kerusakan.

## Konfirmasi manusia dalam audit ini

Developer menegaskan pada24Oktober2026: **booking offline boleh dilakukan hari yang sama oleh Admin**, apabila slot kosong dan sudah berkomunikasi dengan praktisi di luar sistem. Tidak membutuhkan approval object baru di aplikasi. H+1/enam jam online tetap dibedakan dari pengecualian offline tersebut. Jawaban ini tidak mengesahkan otomatis perubahan DP, pembatalan, atau perpanjangan terapi pada dokumen22Oktober.

Developer juga meminta penjelasan keterkaitan pembayaran terlambat dengan H+1. Rujukan batas pembayaran yang sudah disepakati adalah min(reservasi+24jam, awal sesi), bukan24jam baru sejak transfer. Studi kasus lengkap ada di bagian akhir.

## Penambahan yang ditemukan

| Kelompok | Penambahan / perubahan yang tercatat | Lokasi utama |
|---|---|---|
| Dokumen integrasi | Keputusan22Oktober, panduan merge, catatan audit FE dan per-role | [keputusan](../KEPUTUSAN_FINAL_2026_10_22.md), [perbaikan FE](../PERBAIKAN_AUDIT_FE_2026_10_22.md), [panduan role](../PANDUAN_FITUR_PER_ROLE.md) |
| Dokumen proses | Flow23area, activity diagrams/SVG, audit/editor CMS | [flow](../FEATURE_FLOWS.md), [diagram](../ACTIVITY_DIAGRAMS.md), [CMS](../CMS_AUDIT.md) |
| Pembayaran | DP flat pada preview, aktual penerimaan, cicilan/penuh awal, invoice per sesi dan snapshot agreement/prabayar FIFO | [alur pembayaran](../ALUR_PEMBAYARAN_SESI.md), [payments](../../resources/js/utils/payments.ts), [paymentWorkflow](../../resources/js/utils/paymentWorkflow.ts), [PaymentProgress](../../resources/js/components/common/PaymentProgress.tsx) |
| Reschedule | Request terpisah, asal PATIENT/CLINIC/OWNER, requestedAt tetap, revision/versi jadwal, pemilihan ulang slot | [policy](../../resources/js/utils/reschedulePolicy.ts), [approval](../../resources/js/utils/rescheduleApproval.ts), [tab Admin](../../resources/js/components/admin/tabs/RescheduleRequestsTab.tsx) |
| Bukti | Reject beralasan, versi koreksi, validasi berkas dan histori bukti | [helper](../../resources/js/utils/paymentProof.ts), [form koreksi](../../resources/js/components/patient/PaymentProofCorrection.tsx) |
| Admin | Menu operasional, paket berjalan, kalender, layanan/harga, CMS administratif dan review | [navigasi](../../resources/js/components/admin/navigation.ts), [dashboard](../../resources/js/components/admin/AdminDashboard.tsx) |
| Tampilan | ServicePicker, profil akun, CMS/logo/gambar, audit reschedule, tooltip/error boundary, penguatan export | resources/js/components dan resources/js/utils terkait |
| Persistensi / pengujian | Snapshot workflow bersama, Web Lock, rekonsiliasi hold, tes regresi serta pemeriksaan integrasi sumber | [workflowStore](../../resources/js/utils/workflowStore.ts), [tes FE](../../tests/frontend-regressions.test.ts), [tes integrasi sumber](../../tests/merge-readiness.test.mjs) |

Perubahan tersebut sebagian memperbaiki masalah lama: nominal aktual tidak otomatis sama dengan DP, retry pembayaran tidak menambah penerimaan dua kali, reschedule tidak melepas slot lama sebelum apply, dan kas rangkaian tidak disalin sebagai penerimaan baru setiap sesi.

## A01 — P1: walk-in hari ini ditolak, bertentangan dengan konfirmasi terbaru

**Bukti:** [keputusan22Oktober](../KEPUTUSAN_FINAL_2026_10_22.md), [PatientEndpoints](../../resources/js/api/patientEndpoints.ts:120), [minimum tanggal form walk-in](../../resources/js/components/admin/tabs/ReservationsTab.tsx:1049). Guard payload.date<=today berlaku juga untuk ADMIN_WALK_IN. Dokumen F06/F17/permission/kalender mengulang larangan same-day.

**Kasus:** pasien datang Sabtu10.00; praktisi menyetujui slot kosong Sabtu14.00 secara langsung. Form/guard menolak karena hanya menerima besok. Ini kini ketidaksesuaian yang sudah dikonfirmasi manusia, bukan pertanyaan bisnis terbuka.

**Saran:** bedakan kebijakan PATIENT_ONLINE dan ADMIN_WALK_IN. Exception hanya petugas/sumber offline yang sah; durasi, jam buka, kapasitas, overlap dan pencatatan pembayaran tetap diperiksa. Jangan melonggarkan seluruh booking online atau otomatis semua perubahan jadwal petugas.

## A02 — P1: input nominal aktual walk-in tetap dibatasi pilihan DP atau FULL

**Bukti:** [guard penerimaan awal](../../resources/js/api/patientEndpoints.ts:200), [form/input walk-in](../../resources/js/components/admin/tabs/ReservationsTab.tsx:453). Nilai harus tepat DP atau tepat fullAmount, tergantung pilihan metode; jumlah positif lain ditolak422.

**Reproduksi:** paket900.000, CASH_DP, penerimaan100.000 diterima. Penerimaan aktual150.000 ditolak. Ini berbeda dengan helper verifikasi/pencatatan berikutnya yang menerima nominal aktual dan membandingkannya terhadap minimum.

**Dampak:** pasien offline yang membayar cicilan150.000 atau nominal lain tidak bisa dicatat utuh dalam satu pendaftaran. Memaksa input100.000 lalu transaksi kedua bukan pencatatan alami satu penerimaan dan dapat menyulitkan pencocokan. Mode FULL tersedia, tetapi tidak menyelesaikan kasus nominal antara DP dan total atau kelebihan pembayaran awal.

**Saran:** simpan jumlah aktual positif dengan utuh, kemudian derive minimum terpenuhi/lunas/selisih. Jika kurang DP, uang tetap tercatat dan booking belum confirmed. Pilihan rencana pembayaran tidak boleh mengganti fakta jumlah uang.

## A03 — P1: bukti tidak bisa ditolak sesudah sesi mulai

**Bukti:** [rejectInitialPaymentProof](../../resources/js/utils/paymentProof.ts:23). Batas koreksi dibatasi sessionStart, lalu jika deadline<=now fungsi melempar error sebelum menyimpan REJECTED.

**Reproduksi:** sesi14.00, Admin memeriksa saat pasien datang14.01 dan transfer tidak ditemukan. Reject gagal dengan pesan “Jendela koreksi berakhir. Selesaikan melalui rekonsiliasi petugas.” State bukti belum berubah menjadi REJECTED.

**Dampak:** penolakan bukti dicampur dengan hak upload koreksi. Pada saat pemeriksaan kedatangan justru tidak ada hasil keputusan tersimpan dari aksi ini. Flow rekonsiliasi setelah penolakan terlambat perlu jalur nyata, bukan pesan yang mengarahkan petugas kepada dirinya sendiri. Ini juga terkait risiko membatalkan bukti palsu harus melunasi dahulu pada A13.

**Saran:** pisahkan keputusan REJECTED dari ketersediaan jendela koreksi. Sesudah batas, simpan keputusan/alasan/history dan arahkan kasus ke penanganan Admin yang eksplisit; jangan memberi hold/SLA baru atau mengesahkan uang.

## A04 — P2: migrasi katalog dapat menimpa kustomisasi yang sudah disimpan

**Bukti:** [service_catalog_v7](../../resources/js/context/AppContext.tsx:356). Mapping memakai seed pkg sebagai dasar dan hanya mempertahankan isActive serta atribut diskon dari previous. Harga, durasi, nama/deskripsi/benefit kustom tidak dipertahankan.

**Reproduksi mapping asli:** harga850.000/durasi75/teks kustom pada paket ber-ID resmi berubah menjadi harga900.000/durasi60/teks seed. Kasus berlaku bila marker migrasi belum ada, misalnya browser yang diperbarui dari versi sebelum migrasi tersebut. Bukan klaim setiap membuka halaman mengulang reset.

**Dampak:** data master dapat berubah tanpa edit pengelola. Invoice/appointment lama memang tidak ditulis ulang oleh mapping ini, tetapi booking baru dapat memakai tarif/durasi lain dari pengaturan yang pernah disimpan.

**Saran:** migrasi menambah field/record yang belum ada, atau membutuhkan transformasi eksplisit beserta histori. Pisahkan upgrade seed demo dari data master yang sudah diedit. Jangan menganggap ID paket resmi berarti seluruh isinya masih default.

## A05 — P2: no-show diterima sebelum grace period habis

**Bukti:** [guard no-show](../../resources/js/context/AppContext.tsx:1236), dibandingkan [F10](../features/F10_CLINIC_OPERATIONS.md). Guard hanya memeriksa sesi sudah mulai dan alasan tidak kosong; grace15menit/default konfigurasi tidak diperiksa.

**Reproduksi facade asli yang diisolasi:** sesi mulai satu menit sebelumnya, statusCONFIRMED, tanpa request aktif; aksi NO_SHOW oleh Admin diterima.

**Saran:** guard waktu memakai start+grace yang berlaku, dan exception administratif harus eksplisit/auditable bila memang diizinkan. Manual bukan berarti batas grace boleh diabaikan diam-diam.

## A06 — P2: perubahan jam klinik mempunyai ketergantungan melingkar pada alur normal

**Bukti:** [simpan kalender](../../resources/js/components/psychologist/tabs/ScheduleTab.tsx:182), [conflict checker](../../resources/js/utils/scheduleConflicts.ts), [availability](../../resources/js/data/scheduleConfig.ts:207).

**Kasus:** jam lama09.00–12.00 dan ada booking10.00. Klinik akan berubah menjadi14.00–17.00. Simpan ditolak karena ada booking lama; Admin diminta memindahkan dahulu. Tetapi tujuan14.00 belum tersedia karena kalender lama masih berlaku. Probe menunjukkan simpan terblokir,14.00 tidak dapat dipilih sebelum perubahan, dan baru tersedia pada kalender baru.

Ini bukan bukti tidak ada workaround sama sekali: operator mungkin membuat override sementara pada tanggal lain yang kosong. Namun alur perubahan jam yang diminta developer tidak boleh bergantung pada trik beberapa langkah yang tidak dijelaskan.

**Saran:** preview dampak -> apply versi kalender -> request perubahan asal klinik untuk booking terdampak -> pemilihan ulang di kalender baru. Pertahankan histori dan perlindungan pasien; jangan menghapus/memindahkan appointment diam-diam. Target mekanisme itu sudah dijelaskan F05, belum menjadi perilaku simpan kalender ini.

## A07 — P2: status plan tersimpan COMPLETED walau administrasi belum lunas

**Bukti:** [otomatis complete plan](../../resources/js/context/AppContext.tsx:1263), dibandingkan [F11](../features/F11_TREATMENT_PLAN.md) dan [alur pembayaran](../ALUR_PEMBAYARAN_SESI.md). Ketika jumlah sesiCOMPLETED mencapai target, semua record plan diberi treatmentPlanStatus=COMPLETED tanpa memeriksa pelunasan.

**Reproduksi:** empat sesi500.000 dan baru menerima100.000. Menyelesaikan sesi4 menyimpan planCOMPLETED, padahal remaining1.900.000. View memang menampilkan “Menunggu pelunasan” dari perhitungan lain, dan guard booking ulang sudah memeriksa sisa. Jadi audit ini **tidak** menyimpulkan utang hilang atau booking ulang sudah dapat melewati sisa.

**Masalah:** arti COMPLETED berbeda antara data dan kontrak penutupan administratif. Integrasi/ekspor/job lain yang membaca status saja dapat menarik kesimpulan keliru.

**Saran:** pisahkan fakta seluruh pertemuan selesai dari penutupan administratif atau selaraskan definisi/status yang dipakai. Backend jangan memakai treatmentPlanStatus sebagai satu-satunya bukti lunas.

## A08 — P2: paket/diskon bisa menjadi gratis meski kontrak dasar net harus positif

**Bukti:** [validasi harga/diskon](../../resources/js/components/psychologist/tabs/PackagesTab.tsx:136) menerima harga0, persen100, atau potonganFIXED sama dengan harga; [discount helper](../../resources/js/utils/discounts.ts) menghasilkan0. Mock endpoint menerima free booking sebagai PAID.

**Reproduksi:** paket900.000 diskon100% menghasilkan total0, booking diterima dengan paymentStatus=PAID. Ini bukan penerimaan fiktif; masalahnya jalur harga gratis bertentangan dengan batas dasar net>0 pada BUSINESS_RULES.

**Saran:** putuskan apakah layanan gratis memang scope. Bila belum, validasi net>0 secara konsisten. Bila diizinkan, nyatakan sebagai aturan layanan gratis dengan audit, jangan tersirat dari batas diskon yang terlalu longgar.

## A09 — P2: progres setelah penghentian memakai pembagi yang berbeda dari nominal tampilan

**Bukti:** [PaymentProgress](../../resources/js/components/common/PaymentProgress.tsx:7). Teks memakai totalAmount saat stopped, tetapi persen tetap memakai agreedAmount.

**Reproduksi:** baru satu sesi500.000 dijadwalkan dan sudah dibayar500.000, kemudian layanan dihentikan. Teks menunjukkan diterima500.000 dari500.000 dan sisa0, tetapi progress25% karena dibagi kesepakatan empat sesi2.000.000.

**Saran:** gunakan dasar kewajiban yang sama untuk teks/persen atau beri label eksplisit bila yang diukur berbeda. Jangan menimbulkan kesan pasien masih kurang75% sesudah pembatalan yang memenuhi guard lunas.

## A10 — P2: email sintetis walk-in menabrakkan pasien berbeda yang bernama sama

**Bukti:** [email dari nama](../../resources/js/components/admin/tabs/ReservationsTab.tsx:404), [duplicate email check](../../resources/js/context/AppContext.tsx:868).

**Kasus:** Budi pertama tanpa email mendapat budi@walkin.jiwasehat.id. Budi kedua, orang berbeda dengan nomor telepon berbeda, mendapat email yang sama lalu ditolak sebagai email terdaftar. Nama tanpa spasi juga menggabungkan “Budi Santoso” dengan “BudiSantoso”. Tidak perlu UUID pasien benar-benar bertabrakan untuk membuat pendaftaran gagal.

**Saran:** pasien aktual offline mempunyai UUID dan email nullable; tidak perlu akun/email rekaan. Jika alias internal diperlukan untuk prototype, buat unik dan tandai internal, bukan identitas email pasien. Nama/telepon cocok tidak otomatis menjadi hak atas histori orang lain.

## A11 — P2: durasi Asesmen Lengkap berbeda antar jalur

**Bukti:** [seed preview](../../resources/js/data/mockData.ts:412)180menit; [F04](../features/F04_PACKAGE_CATALOG.md), [F18](../features/F18_ASSESSMENT_CASE.md) dan config publik240menit. Developer sebelumnya memilih default4jam dengan deskripsi2–4jam.

**Dampak:** preview mengunci tiga jam, sementara kontrak dan halaman publik menjelaskan default empat jam. Jadwal sesudahnya dapat terkesan tersedia satu jam lebih cepat. Ini ketidaksesuaian source/kontrak pada versi sekarang; tidak diasumsikan baru diperkenalkan pada commit tertentu.

**Saran:** satu baseline durasi240 dengan label2–4jam. Jangan otomatis mengubah histori appointment lama tanpa keputusan perubahan jadwal yang sah.

## A12 — P2: petunjuk yang tampak aktif masih memuat role/kontrak lama

**Bukti:** [CMS_AUDIT](../CMS_AUDIT.md) menyebut Admin tidak boleh mengedit CMS dan mutation CMS hanya psikolog, sementara [AdministrativeCmsTab](../../resources/js/components/admin/tabs/AdministrativeCmsTab.tsx) dan updateLandingCms kini mengizinkan subset Admin. [FEATURE_FLOWS](../FEATURE_FLOWS.md) masih memuat larangan harga/lifecycle Admin, tanpa reupload, pertanyaan yang sudah dijawab, serta Laravel12+/transport lama. Banner atas memang menyebut snapshot, sehingga ini bukan tuduhan seluruh dokumen sama-sama otoritatif.

**Dampak:** Eko/backend harus menebak bagian mana histori dan bagian mana target. Tanggal/handoff lebih baru tidak otomatis membuat seluruh isi file diperbarui.

**Saran:** snapshot murni dipindah arsip dengan tanggal jelas; panduan aktif menunjuk satu matriks role, satu kontrak, dan daftar runtime/target yang aktual. Hindari bagian berlabel “target” pada snapshot lama terlihat sebagai pekerjaan baru.

## A13 — P1 dokumen: expiry tanpa pembayaran belum mempunyai akibat tagihan yang tegas

**Bukti:** [F06](../features/F06_BOOKING.md) membuat invoice saat reservasi dan melepas slot saat EXPIRED. [aturan bisnis](../BUSINESS_RULES.md) melarang pemutihan sisa dan mewajibkan pelunasan sebelum cancel. Dokumen tidak cukup tegas membedakan hold kosong, proof tidak sah, penerimaan parsial nyata, pembatalan setelah layanan, dan perubahan yang disebabkan klinik.

**Kasus:** pasien hanya memilih sesi900.000, belum transfer dan belum menerima layanan.24jam lewat. Slot dilepas, tetapi apakah invoice tetap tertagih900.000? Jika diwajibkan lunas untuk menutupnya, pilihan slot saja dapat menghasilkan utang. Jika tidak, perlu ditulis bagaimana kewajiban invoice reservasi diakhiri tanpa menghapus histori/kas.

Ini **risiko interpretasi kontrak**, bukan klaim backend sudah menagih pasien. Kebijakan “sisa tidak ditagih sebelum layanan batal/hak habis” pernah disampaikan developer pada percakapan sebelumnya; dokumen22Oktober menyatakan sebaliknya dan belum dikonfirmasi ulang dalam audit ini.

**Saran untuk keputusan:** buat matriks akibat finansial untuk reservasi belum dibayar/expired, pembayaran parsial, proof invalid, batal asal pasien, batal asal klinik, dan layanan sudah diberikan. Status tidak boleh dipakai untuk mengarang penerimaan atau menghapus uang nyata.

## Gap yang sudah diakui, bukan bug baru yang disamarkan

1. **Clock preview belum kontrak24jam:** [reserveBookingSlot](../../resources/js/context/AppContext.tsx:803) memakai default15menit dan clamp1–60menit, bukan min24jam/awal sesi. Lead6jam/SLA12jam operasional penuh juga belum dibuat; handoff mengakuinya. UI/demo harus diberi konteks sehingga tidak dianggap simulasi kebijakan produksi yang lengkap.
2. **Profiling lanjutan:** scheduleNextContinuousSession menyebarkan latestSource sehingga preTestSnapshot/consent lama ikut; konfirmasi submission baru per sesi masih TODO yang sudah dicatat. Snapshot lama tidak boleh ditampilkan seolah pasien baru mengonfirmasi konteks sesi berikutnya.
3. **Receipt belum immutable:** preview memakai data terbaru dan nomor berbasis booking. Dokumen resmi per penerimaan/correction/addendum serta batas download7hari masih perlu implementasi domain; bukan hasil yang sudah diuji dari tombol print.
4. **Agreement/alokasi backend belum schema final:** DATABASE_ARCHITECTURE sudah mengakui belum ada kamus tabel alokasi lengkap. Jangan langsung serialize agreement FE menjadi model ledger backend atau menyalin penerimaan ke setiap invoice.
5. **Aplikasi utama masih workspace:** fitur lengkap tetap /preview/eko lokal; controller domain, DB, upload privat, policy objek dan provider belum operasional. Membuka preview ke produksi bukan penyelesaian gap tersebut.

## Aturan yang masih memerlukan penegasan manusia

Hanya exception walk-in sudah dijawab pada audit ini. Perubahan berikut tertulis sebagai keputusan22Oktober, tetapi berbeda dari ide/keputusan yang ada dalam percakapan ini; belum dinyatakan disetujui ulang oleh developer di audit ini:

- DP flat100.000 mengganti minimum50% pada [ide asli](../references/SYSTEM_DESIGN_PRAKTIK_PSIKOLOGI.md).
- Wajib lunas sebelum pembatalan mengganti sisa tidak ditagih untuk layanan belum diberikan.
- Wajib plan baru setelah empat sesi mengganti kemungkinan extend berjejak.
- Operasional penerimaan khusus Admin membatasi hak Superadmin menjadi baca ledger/laporan. Jangan melaporkan larangan tersebut sebagai bug permission sebelum pembagian tugas dikonfirmasi.

Audit tidak mengganti aturan ini sepihak atau menyatakan catatan Eko palsu; diperlukan kepastian keputusan mana yang benar-benar dimaksud developer.

## Penjelasan H+1 dan pembayaran terlambat

H+1 memakai tanggal pemesanan dalam WIB. Tidak berarti menunggu24jam penuh. Booking online juga memenuhi tambahan enam jam operasional Admin. Contoh Jumat23:44, Sabtu buka08:00–16:00 **tanpa istirahat pada contoh** -> earliest Sabtu14:00. Jika kalender mempunyai istirahat12:00–13:00, enam jam operasional baru tercapai15:00; jangan menampilkan14:00 dengan kalender yang memiliki jeda tersebut.

Deadline pembayaran awal/proof adalah min(reservasi+24jam, waktu mulai sesi), bukan24jam setelah membayar. Batas ini mengacu perlindungan reservasi awal; bukan deadline pelunasan seluruh rangkaian dan bukan SLA pemeriksaan Admin.

| Reservasi | Jadwal sesi | Deadline awal |
|---|---|---|
| Jumat23Oktober10:00 | Sabtu24Oktober14:00 | Sabtu10:00 |
| Jumat23Oktober23:44 | Sabtu24Oktober14:00, jika kalender memungkinkan | Sabtu14:00 |

- Pada contoh kedua, transfer/unggah bukti Sabtu10:00 masih tepat waktu. Pada contoh pertama, pukul10:00 adalah batas; bukti harus sudah diterima server paling lambat saat itu. Transfer sebelum batas tetapi bukti baru sesudah batas tidak memberi perlindungan otomatis; Admin tetap mencocokkan uang nyata.
- Bukti tepat waktu yang belum diperiksa melindungi slot sebagai WAITING_VERIFICATION. Tidak memperlakukan upload sebagai uang VERIFIED. SLA12jam kerja tidak menghalangi pemeriksaan manual saat pasien datang.
- Tanpa bukti tepat waktu, perlindungan habis dan slot dapat dilepas. Jangan me-reset24jam atau otomatis memindahkan sesi. Efek terhadap invoice/utang harus ditegaskan pada A13.
- Transfer setelah sesi lewat tetap diperiksa/dicatat sesuai received_at sebenarnya, bukan mengesahkan hadir atau merebut slot. Admin menangani rekonsiliasi dengan link ke reservasi asal; penyelesaian jadwal perlu interval bebas dan konteks yang sah. Pasien tidak diminta bayar dua kali karena state booking expired.
- Bila pasien sudah memiliki reservasi terkonfirmasi tetapi tidak hadir, penanganannya berbeda dari hold kosong: keputusan no-show manual setelah grace dan hak reschedule mengikuti aturan yang sah. Transfer terlambat saja tidak menentukan attendance.

## Pemeriksaan yang dilakukan dan batas buktinya

- npm run lint: lolos, tanpa diagnostik TypeScript.
- npm test standar: **belum dapat berjalan pada dependency lokal ini**, karena tsx tidak terpasang di node_modules meski sudah ada pada manifest/lockfile. Tidak melakukan instalasi atau perubahan lockfile untuk audit.
- File tes yang sama dijalankan memakai Node native test runner + loader sementara yang hanya mentranspilasi TS/TSX melalui TypeScript terpasang: **87/87 lolos**. Ini helper/SSR/sumber-integrasi, bukan E2E atau authorization database.
- Probe tambahan memakai fungsi asli dan fixture memori: walk-in nominal aktual, diskon100%, progress setelah stop, mapping migrasi katalog, status plan belum lunas, grace no-show, reject sesudah sesi mulai, dan dependency perubahan kalender. Facade/mapping yang tidak diekspor diisolasi dari AST source asli; tidak menjalankan seluruh UI atau effects React. Hasil JSON/log di .codex-tmp/audit-eko-*. Tidak mengubah atau memasukkan fixture ke storage pengguna.
- Pemeriksaan91Markdown sebelum laporan ini ditambahkan: lima tautan file tidak tersedia, seluruhnya dalam arsip; tidak ditemukan path tautan lokal putus pada dokumen aktif yang diperiksa. Ini tidak memeriksa anchor eksternal atau isi halaman website.
- Tidak menjalankan Git, build, dev server, browser, migration/seeding atau transaksi database. Tidak ada klaim QA visual/mobile/print, provider WA, transfer bank atau concurrency lintas perangkat telah lulus.

Tes hijau membuktikan kasus yang diuji sesuai assertion-nya. Tes yang mengunci semua walk-inH+1 tetap perlu diubah setelah konfirmasi A01; kelulusan tes tidak dapat mengesahkan kebutuhan yang sudah diganti manusia.

## Urutan tindak lanjut

1. Selaraskan exception walk-in yang sudah dikonfirmasi; tegaskan DP/cancel/expiry/extend dan role pembayaran sebelum mengubah kontrak finansial lebih jauh.
2. Perbaiki penerimaan aktual awal, keputusan reject saat kedatangan, preservasi data katalog dan guard no-show. Tambahkan kasus tepi audit sebagai regresi dengan kebutuhan yang benar.
3. Selaraskan status plan, perubahan kalender, progres pembayaran, identitas walk-in dan baseline durasi. Pisahkan snapshot docs dari panduan aktif.
4. Tutup gap yang memang masih TODO per fitur; selesaikan kontrak/schema alokasi sebelum backend mengambil data dari preview. QA visual dan integrasi nyata dilakukan sebagai tahap tersendiri.

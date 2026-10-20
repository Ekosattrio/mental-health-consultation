# Kontrak web Laravel — Inertia — React
Arsitektur aktif: Laravel13 + Inertia3 + React/TypeScript, satu proyek/domain. Tabel target menjelaskan pekerjaan domain yang belum seluruhnya dibuat; daftar runtime di bawah membedakannya dari fondasi yang sudah tersedia.


## Transport, status implementasi dan kontrak halaman

### Runtime yang sudah didaftarkan
| Route | Nama | Perilaku |
|---|---|---|
| GET / | home | HomeController -> Home, proyeksi publik tanpa harga; fallback config sampai CMS/katalog DB tersedia |
| GET /login | login | page Auth/Login untuk Guest |
| POST /login | login.store | LoginRequest, rate limit, session web ACTIVE, regenerate; redirect /dashboard |
| POST /logout | logout | auth, invalidate session/CSRF, clear Inertia history; redirect / |
| GET /dashboard | dashboard | auth + active; redirect sesuai role server |
| GET /pasien/dashboard | patient.dashboard | PATIENT; workspace dasar, belum booking backend |
| GET /admin/dashboard | admin.dashboard | ADMIN/PSYCHOLOGIST; workspace dasar |
| GET /superadmin/dashboard | superadmin.dashboard | PSYCHOLOGIST; workspace dasar |
| GET /preview/eko | legacy.preview | hanya APP_ENV=local dan ENABLE_LEGACY_PREVIEW=true; mock, bukan data praktik |
| GET /up | framework health | health bawaan Laravel |

Route bisnis lainnya pada tabel target BELUM otomatis terdaftar. Google SSO/register/reset password belum dibuat pada fondasi ini. Tidak ada akun demo/provisioning owner, migrasi DB atau pengujian login nyata dalam sesi migrasi arsitektur. Jangan menghubungkan aksi UI ke route fiktif atau menganggap komponen preview sebagai backend.

### Kontrak props
- Shared: app.name/preview_url, auth.user(id,name,email,role milik sesi sendiri), routes(home,login,logout,dashboard), flash.status dan errors bawaan Inertia. Tidak ada shared seluruh pasien/appointment/klinis/ledger.
- Home: public_landing.practice/packages/reviews. Package publik memakai service_code/name/category/duration_minutes/description/benefits/is_bookable tanpa nominal, promo, DP atau ID pasien. Fallback config saat ini non-bookable; angka0 tidak dipakai sebagai harga publik. Adapter Home.tsx memetakan DTO snake_case ke view model camelCase Eko.
- Dashboard: dashboard.title serta shared identitas sesi; belum mengambil angka keuangan/klinis/data pasien. Jangan mengganti DTO Admin dengan model/ledger mentah pada implementasi lanjut.
- Nama page/component adalah kontrak server-client, misalnya Home, Auth/Login, Dashboard. URL menjadi sumber navigasi halaman; Context hanya state UI untuk jalur web.

### Form dan JSON pendukung
- Form useForm/Form/router Inertia: validasi gagal redirect kembali dan errors sesuai field. Sukses redirect ke halaman hasil sesudah commit; gunakan flash untuk pesan, bukan receipt palsu dari submit.
- Konflik slot, row_version atau idempotency pada form dikonversi ke error action yang aman dan kode domain, misalnya errors.booking dan flash.domain_code yang di-allowlist saat fitur dibangun. Muat ulang props relevan/pilih slot ulang; jangan menyamakan HTTP409 bisnis dengan respons409 khusus protokol Inertia.
- Endpoint JSON yang benar-benar diperlukan (availability/autosave/status pengiriman) tetap route web dengan session/CSRF/policy, response JSON eksplisit dan client HTTP biasa/useHttp. Kunjungan Inertia tidak diarahkan ke endpoint JSON tersebut. Tidak ada prefix /api/v1 wajib.
- Mutasi transaksi penting tetap memakai Idempotency-Key (atau field request_id yang dipetakan ke guard sama) dan expected_version. Buat key sekali per intent; retry intent/payload sama memakai key sama, intent/payload baru memakai key baru. Tombol disabled atau session blocking bukan pengganti transaction/unique constraint.
- File upload tetap privat/multipart dengan limit/MIME sesuai F15. Standard FormRequest tidak otomatis menolak field asing: implementasi tiap action harus whitelist input dan menambahkan validasi penolakan field terlarang sesuai kontrak.
- Auth utama session Laravel web; tidak memakai bearer/Sanctum untuk browser ini. Policy/ownership tetap setiap objek. Register, Google linking, revoke sessions dan blocked perlu mengikuti F01 saat implementasi lanjut.

## Protokol dan keamanan
- Route relatif terhadap root domain, didaftarkan pada routes/web.php dengan session Laravel dan CSRF. Halaman menggunakan Inertia props; form memakai POST/PATCH/DELETE dan redirect. Nama request/domain tetap snake_case. Tidak ada kebutuhan base URL REST atau langkah /sanctum/csrf-cookie; Inertia menangani transport CSRF dari sesi web.
- Request terautentikasi memakai session, user ACTIVE, role policy dan ownership target. Role/actor/harga hasil kalkulasi tidak dipercaya dari payload.
- Timestamp RFC3339 dengan offset UTC/WIB; tanggal kalender YYYY-MM-DD WIB. Nominal integer Rupiah. UUID string CHAR36. Boolean bukan string.
- Mutasi booking, penerimaan uang, correction, reschedule apply, penerbitan invoice, expense, perubahan kalender memakai Idempotency-Key dan expected_version jika mengubah record mutable. Key sama+payload sama mengembalikan hasil sama; payload beda 409.
- Server commit dahulu baru mengembalikan sukses. Job pengiriman sesudah commit/outbox. Daftar paginated, filter di-whitelist; export tidak hanya halaman aktif.
- JSON pendukung memakai error {message,code,errors,request_id}:401/403/404/409/419/422/429/503 sesuai kondisi domain. Halaman web tanpa sesi diarahkan ke login. Form Inertia memakai redirect + errors untuk validasi dan konflik bisnis yang dapat diperbaiki; jangan mengirim JSON409/422 mentah kepada kunjungan Inertia. Kesalahan izin/target/CSRF tetap diproses sebagai respons halaman yang sesuai. Detail adapter ada di bagian Transport; SQL/path privat/stack tidak dikirim ke browser.
- Field tidak diizinkan ditolak422, bukan disimpan mass-assignment. Semua endpoint tulis membatasi file/body size. Payment proof maksimal10MiB PDF/JPEG/PNG, MIME isi diperiksa; nama file bukan storage path.
- GET yang membutuhkan kepemilikan tidak cukup hanya auth middleware. Export/file/notification juga memerlukan target policy.
- Public Guest endpoint tidak memuat harga/diskon numerik/DP. /packages memerlukan login.
- Props/detail objek mutable membawa row_version; expected_version pada request adalah nilai row_version yang terakhir dibaca. Pengecualian bernama jelas: calendar expected_version adalah calendar_versions.version; expected_revision adalah additional_time_entries.revision (0 bila belum ada); expected_link_version adalah tele_service_links.version (0 bila belum ada); expected_appointment_version mengacu appointments.row_version. package_version_id memilih versi katalog immutable. Jangan menyamakan keenamnya atau mengirim version generik sebagai pengganti.

## DTO dan proyeksi akses
DTO (Data Transfer Object) adalah bentuk data yang ditukar frontend/backend, bukan tabel database. Contoh: AdminBookingDTO hanya memuat field operasional yang boleh diterima Admin. Menghilangkan tampilan CSS tidak menggantikan penyaringan API.

| DTO | Field yang tersedia | Field yang dilarang |
|---|---|---|
| GuestPackageDTO | service_code,name,category,description,duration label,benefits,is_bookable | semua nominal/promo/DP, identitas pasien |
| PatientPackageDTO | Guest fields + normal_price,promo_price,final_price,version_id,additional_time_price_basis dan ketentuan tarif Konseling | konfigurasi internal lain |
| AdminBillingDTO | billing_account_id,normal_price,global_discount,personal_discount,total_due,invoice items,status administratif,initial_requirement_met | total_paid,remaining_amount,overpaid_amount,receipt snapshot lengkap, finance praktik |
| PatientBillingDTO | total_due,verified_received,remaining_amount,overpaid_amount,invoices,riwayat pembayaran milik sendiri | data pasien lain |
| AdminPaymentWorkDTO | payment_id,proof,method,reference,nominal usulan/aktual yang sedang diproses,status | agregat penerimaan/saldo semua pembayaran pasien, receipt lengkap |
| SuperadminFinanceDTO | penerimaan,pengeluaran,surplus,as_of,baris sumber | password/token/sesi Baileys |
| AdminPretestStatusDTO | submission_id,status,submitted_at,is_complete | answers,risk answer,clinical_objective |
| TeleServiceDTO | appointment_id,attempt_number,link_version,meeting_url aktif,jadwal,nomor tujuan sesuai akses; status kirim untuk petugas | link/nomor pasien lain, credential Google/Baileys, isi klinis/saldo |

Admin boleh memeriksa nominal bukti/input aktif karena tugas verifikasi, tetapi daftar booking/tagihan tidak membawa saldo atau cumulative paid. API check-in hanya memberi initial_requirement_met; sistem menghitung DP tanpa membocorkan selisih nominal. Pasien dapat memperlihatkan ringkasan/receipt miliknya saat penagihan offline.
Response diserialisasi allowlist per role, termasuk response error, preview, export, nested relationship dan print. Tidak mengirim PatientBillingDTO lalu menyembunyikan field di React.

## Target route dan action domain
A = Admin atau Superadmin. O = hanya Superadmin (role PSYCHOLOGIST). P = akun PATIENT dengan patient_accesses atau ownership sah. “Pemilik” tetap diperiksa melalui relasi, bukan UUID dari URL.

| Method dan path target | Akses | Request inti | Data halaman / hasil action / guard |
|---|---|---|---|
| GET / | Guest atau login | — | Inertia Home; public_landing tanpa harga/DP/klinis, auth sesi sendiri |
| POST /register | Guest | name,email,password | PATIENT saja; email unik |
| POST /login | Guest | email,password | cookie session; generic error |
| GET /dashboard | login ACTIVE | — | redirect dashboard sesuai role server; auth.user melalui shared props terbatas |
| POST /logout | login | — | cabut session |
| POST /auth/sessions/revoke | login ulang | reason | cabut sesi sendiri, tidak milik akun lain |
| POST /forgot-password | Guest | email | pesan generik |
| POST /reset-password | Guest | token,email,password | sekali pakai; cabut sesi lama |
| GET /auth/google/redirect | Guest | — | OAuth state |
| GET /auth/google/callback | Guest | code,state | validasi provider + session |
| POST /auth/google/link | login ulang | authorization context | link subject setelah bukti akun |
| POST /superadmin/users | O | name,email,role=ADMIN | akun internal, invite/reset; bukan password reusable dari Admin |
| PATCH /superadmin/users/{id}/status | O | ACTIVE/BLOCKED,reason | revoke sessions bila blocked |
| GET /patients | P atau A | pagination | P hanya profil yang diakses |
| GET /patients/{id} | pemilik atau A | — | profil role DTO + row_version; tanpa klinis Admin |
| POST /patients | P atau A | identitas aktual | profil/access; walk-in tak wajib akun |
| PATCH /patients/{id} | pemilik atau A | field administratif,expected_version | profil; snapshot lama tetap |
| POST /admin/patient-accesses | A | patient_id,account_id,verified context,reason | akses berjejak; tidak auto-claim |
| POST /superadmin/patient-accesses/{id}/revoke | O | expected_version,reason | ACTIVE -> REVOKED; akses objek diperiksa ulang setiap request/download, histori/snapshot tetap |
| GET /packages | login | category | DTO sesuai role |
| POST /admin/packages | A | service_code,category dan field versi katalog F04 | master + versi; kategori resmi |
| POST /admin/packages/{id}/versions | A | normal_price,promo_price,promo_starts_at,promo_ends_at,duration_minutes,additional_time_price_basis,reason | snapshot baru; basis wajib sebelum Konseling bookable; booked lama tetap |
| GET /availability | login | package_version_id,date | slot,start,end,calendar_version; no patient data |
| POST /admin/calendar/preview | A | expected_version,new intervals,reason | affected appointment IDs dan preview_id |
| POST /admin/calendar/apply | A | preview_id,expected_version | versi + impacts + CLINIC requests + outbox |
| POST /pretests | P berizin | patient_id,template_id | DRAFT; author_user_id server; Admin tidak menulis jawaban klinis |
| PATCH /pretests/{id} | pemilik draft | answers,expected_version | autosave; stale409 |
| POST /pretests/{id}/submit | pemilik | expected_version | SUBMITTED immutable |
| GET /pretests/{id} | pemilik/O; A status saja | — | role DTO; tidak answers Admin |
| POST /pretests/{id}/revisions | P pemilik berizin | expected_version | submission baru DRAFT dengan supersedes_id, patient/template/appointment asal ditetapkan server; rantai linear UNIQUE(supersedes_id), draft penerus yang ada dilanjutkan; tidak overwrite SUBMITTED; Admin tidak menerima answers |
| POST /consents | P atau assisted A | patient_id,document version,acceptance_source | accepted nyata, bukan centang otomatis |
| POST /consents/{id}/withdraw | penerima berizin atau assisted A/O | expected_version,reason | withdrawn_at server + audit; bantuan merekam permintaan nyata penerima, bukan keputusan petugas; tidak menghapus kas/booking atau otomatis mengganti persetujuan klinis |
| POST /appointments/preview | P atau A | patient_id,package_version_id,start_at,booking_source,profiling_mode | harga/DP/deadline sesuai role; tidak menahan slot; mode PAPER khusus pendaftaran offline oleh petugas |
| POST /appointments | P atau A | package_version_id,patient_id,start_at,calendar_version_id,profiling_mode,pretest_submission_id jika DIGITAL,consent_id,booking_source | transaction appointment+bill; Psikoterapi pertama sekaligus plan empat unit dan session_number=1; sourceonline dari P wajib DIGITAL; PAPER tidak membutuhkan/menerima ID submission |
| GET /appointments | login berizin | date/status,page | scope per role |
| GET /appointments/{id} | pemilik atau A | — | role DTO, history jadwal |
| POST /billing-accounts/{id}/payment-submissions | P | claimed_amount,method,reference | PENDING_VERIFICATION; bukan uang VERIFIED |
| POST /payments/{id}/proofs | pemilik atau A | file,expected_proof_version | proof version; deadline/race guard |
| GET /admin/payments/queue | A | status/prioritas | AdminPaymentWorkDTO untuk pengajuan pembayaran yang menunggu pemeriksaan; bukan aturan bisnis yang belum diputuskan |
| POST /admin/payments | A | billing_account,amount,method,received_at,purpose,reference | kas aktual; cash tanpa nama bank/proof |
| POST /admin/payments/{id}/verify | A | actual_amount,received_at,method,expected_version; duplicate_review_acknowledged/reason bila ada kandidat | VERIFIED + receipt; kandidat belum direview409 POSSIBLE_DUPLICATE_PAYMENT |
| POST /admin/payments/{id}/reject | A | reason | REJECTED + correction_deadline |
| POST /admin/payments/{id}/corrections | A | correct_amount>=0,received_at,reason | reversal+replacement positif; jika benar0 reversal saja, bukan refund |
| GET /billing-accounts/{id} | pemilik/A | — | DTO sesuai role, bukan raw model |
| POST /admin/billing-accounts/{id}/charges | A | kind,label,quantity,unit_amount,reason | ADDENDUM; FORMAL_REPORT konseling200000; custom positif |
| PUT /admin/appointments/{id}/additional-time | A | total_additional_minutes,expected_revision,reason | aggregate revision + delta invoice; hanya COUNSELING |
| POST /admin/appointments/{id}/additional-time/preview | A | total_additional_minutes,expected_revision | basis/rate dari versi booking, blok,total/selisih tambahan; tanpa saldo atau mutasi |
| POST /admin/billing-accounts/{id}/discounts | A | amount,target_line_id,reason,expected_version | PERSONAL_DISCOUNT + preview/issue, bukan custom negatif |
| GET /billing-accounts/{id}/documents/{document_id} | P pemilik/O | — | PDF immutable dalam cutoff7hari untuk P |
| GET /admin/invoices/{id}/print | A | — | proyeksi tagihan harga/diskon/total tanpa saldo/paid aggregate |
| POST /appointments/{id}/reschedule-requests | P/A | origin,reason,optional target | eligibility frozen; P tidak memilih origin CLINIC/OWNER |
| POST /reschedule-requests/{id}/cancel | pemohon/A | reason | belum APPLIED; CANCELLED, kuota tetap |
| POST /admin/reschedule-requests/{id}/approve | A | expected_version | APPROVED/selection window |
| POST /admin/reschedule-requests/{id}/reject | A | reason | REJECTED, quota tetap |
| POST /admin/reschedule-requests/{id}/resolve | A | decision,reason,expected_version | REOPEN_SELECTION/KEEP_OLD_SCHEDULE/CLOSE_UNSERVED dengan guard F09, clear requires_resolution hanya setelah keputusan sah |
| PATCH /reschedule-requests/{id}/selection | pemilik/A | start_at,calendar_version | usulan; belum memindah |
| POST /admin/reschedule-requests/{id}/apply | A | expected_version request,expected_appointment_version terkini | APPLIED + appointment active + history; quota jika PATIENT |
| POST /admin/appointments/{id}/check-in | A | identity_checked,expected_version | wajib initial requirement met |
| POST /admin/appointments/{id}/start | A | occurred_at | CHECKED_IN -> IN_CONSULTATION |
| POST /admin/appointments/{id}/complete | A | occurred_at | IN_CONSULTATION -> COMPLETED; klinis ditulis owner |
| POST /admin/appointments/{id}/no-show | A | reason,expected_version | grace lewat; tanpa request sah/clinic conflict |
| POST /admin/appointments/{id}/cancel | A | reason,origin | lepas slot; tidak refund |
| POST /superadmin/treatment-plans | O | patient_id,package_id,planned_sessions | ACTIVE awal>=4 |
| GET /treatment-plans | pemilik/A | patient_id,status,page | P milik sendiri; Admin tanpa clinical_objective |
| GET /treatment-plans/{id} | pemilik/A | — | progres,session/invoice role DTO; klinis hanya owner |
| POST /admin/treatment-plans/{id}/sessions | A | session_number,start_at,package_version_id | invoice per sesi, ACTIVE plan |
| POST /superadmin/treatment-plans/{id}/extend | O | target_sessions,reason | target meningkat, audit |
| POST /superadmin/treatment-plans/{id}/complete | O | reason,expected_version | semua unit resolved; penutupan administratif owner, completed_sessions tetap fakta |
| POST /superadmin/treatment-plans/{id}/discontinue | O | reason | keputusan booking aktif tetap diperlukan |
| POST /admin/assessment-cases/{id}/appointments | A | assessment_role,assessment_sequence,start_at,duration_minutes | case OPEN/IN_PROGRESS; included tak menagih BASE lagi |
| GET /assessment-cases | pemilik/A | patient_id,status,page | P akses sah, Admin proyeksi administratif |
| GET /assessment-cases/{id} | pemilik/A | — | appointment,scope administratif dan billing sesuai role |
| PATCH /superadmin/assessment-cases/{id}/scope | O | scope_snapshot,reason,expected_version | kebutuhan klinis owner; CLOSED harus reopen dahulu |
| PATCH /admin/assessment-cases/{id}/report-delivery | A | status,delivery_method,delivered_at | metadata administratif, bukan isi tes |
| POST /superadmin/assessment-cases/{id}/close | O | closure_reason | scope selesai/keputusan owner, CLOSED |
| POST /superadmin/assessment-cases/{id}/reopen | O | reason | koreksi scope, bukan tes baru gratis |
| POST /billing-accounts/{id}/review | P pemilik | rating,comment,is_anonymous | layanan nyata COMPLETED; asesmen case CLOSED + ada COMPLETED, bukan CLOSED_UNSERVED |
| PATCH /reviews/{id} | penulis | fields,expected_version | moderasi ulang |
| POST /admin/reviews/{id}/moderate | A | decision,reason | APPROVED/REJECTED |
| GET /notifications | login | page | hanya penerima sendiri |
| PATCH /notifications/{id}/read | penerima | — | read_at |
| GET /admin/notification-deliveries | A | status | monitoring admin terfilter |
| POST /admin/notification-deliveries/{id}/retry | A | reason | retry terbatas, dedupe |
| GET /appointments/{id}/tele-service | pemilik/A | — | link revisi aktif untuk TELE_SERVICE; policy appointment |
| POST /admin/appointments/{id}/tele-service-links | A | meeting_url,recipient_phone,recipient_confirmed bila nomor berubah,expected_appointment_version,expected_link_version,reason | revisi+outbox otomatis; 201 QUEUED, bukan SENT |
| POST /admin/appointments/{id}/tele-service-links/{link_id}/resend | A | reason,expected_link_version | hanya revisi/attempt aktif; idempotency wajib, riwayat pengiriman baru |
| GET /superadmin/finance | O | from,to,as_of | kas/expense/surplus |
| GET/POST /superadmin/expenses | O | date,category,description,amount,notes | append-only |
| POST /superadmin/expenses/{id}/corrections | O | corrected data,reason | reversal + replacement |
| POST /superadmin/expense-attachments | O | private file | PDF/JPEG/PNG<=10MiB; purpose EXPENSE, file_id berizin |
| GET /superadmin/users | O | role,status,page | daftar akun internal tanpa password/token |
| GET /superadmin/settings | O | — | konfigurasi non-secret + row_version |
| PATCH /superadmin/settings | O | grace_minutes,selection_window_hours,proof_correction_hours,practice_identity,wa_owner_phone,reason,expected_version | whitelist, nilai positif/valid; berlaku kejadian baru; bukan credential Baileys |
| GET /superadmin/audit-logs | O | target/action/date,page | audit terfilter; tanpa raw credential/answers/URL Meet |
| POST /superadmin/finance/exports | O | filters,format | export job |
| POST /admin/schedule-exports | A | date/status,format | jadwal tanpa saldo/klinis |
| GET /exports/{id}/download | requester berizin/O | — | private; role dicek lagi saat download |
| GET /files/{id}/download | owner file/A sesuai purpose | — | proof admin boleh; bukan file klinis/finance bebas |
| GET/POST /admin/cms | A | structured section | draft/version |
| POST /admin/cms/{id}/publish | A | expected_version | publish + invalidate cache; identitas klinis owner |
| POST /admin/assets | A | public image | sanitasi; bukan private proof |
| GET /tutorials | semua, sesuai role | key | materi aktif |
| PUT /tutorial-progress/{key} | login | content_version,last_step,status | milik session |

## Contoh Guest
~~~json
{"data":[{"service_code":"COUNSELING_OFFLINE","name":"Konsultasi Offline","category":"COUNSELING","duration_label":"60 menit","is_bookable":true}]}
~~~
Tidak ada price tersembunyi di nested object.

## Contoh Admin: tagihan dan pembayaran
~~~json
{"data":{"billing_account_id":"<uuid>","row_version":1,"normal_price":900000,"global_discount":100000,"personal_discount":0,"total_due":800000,"initial_requirement_met":false,"payment_status":"UNPAID"}}
~~~
Response di atas tidak memuat remaining_amount, verified_received, overpaid_amount. Input aktual pembayaran tetap:
~~~json
{"billing_account_id":"<uuid>","amount":400000,"method":"CASH","received_at":"2026-10-19T14:00:00+07:00","purpose":"DP"}
~~~
Cash tidak mewajibkan proof/sender_name/reference rekening. Response Admin berisi payment_id,status,initial_requirement_met dan request_id; receipt penuh ditujukan pasien/owner.

## Contoh pasien
~~~json
{"data":{"billing_account_id":"<uuid>","row_version":1,"total_due":900000,"verified_received":100001,"remaining_amount":799999,"overpaid_amount":0,"payment_status":"PARTIAL"}}
~~~
Dengan DP100000 lalu1, tetap PARTIAL. DP minimum450000 belum terpenuhi; backend tidak menandai CONFIRMED hanya dari satu transaksi positif.

## Contoh error konflik
~~~json
{"message":"Jadwal sudah digunakan. Pilih waktu lain.","code":"SLOT_CONFLICT","errors":{"start_at":["Tidak tersedia"]},"request_id":"<trace-id>"}
~~~

## Guard khusus dan side effects
- Submit proof <=deadline harus memenangkan lock sebelum expiry memutuskan. REJECTED menghentikan auto-confirm; perbaikan memakai proof version baru, SLA asal tidak diulang.
- Server actual_amount diverifikasi dari uang nyata, bukan claimed_amount pasien; perbedaan dicatat event dan response pasien menunjukkan hasil. Nama input dan kolom klaim sama claimed_amount; tidak ada alias amount_claimed/claim_amount.
- Referensi bank identik adalah sinyal pemeriksaan duplikasi, bukan unique global karena tiap bank/metode berbeda. Idempotency key hanya mencegah retry satu aksi, bukan dua transfer nyata.
- Discount preview menolak melebihi kewajiban; bila berbenturan dengan penerimaan terverifikasi tampil NEEDS_RECONCILIATION tanpa mengirim saldo ke Admin. Tidak otomatis memotong penerimaan.
- Tambahan setelah invoice terbit membuat ADDENDUM; correction/diskon membentuk ADJUSTMENT. Dokumen terbit tidak diubah.
- Calendar apply membuat version+impact+requestCLINIC+outbox atomik. Jika sudah ada request aktif, gabungkan asal klinik dan quota_effect=0 melalui event, bukan melanggar unique active_guard.
- Status money VERIFIED hanya dari petugas berwenang; job SLA tidak punya kemampuan tersebut.
- Tidak ada endpoint refund, wallet/credit, generic patch semua status, atau upload wajib isi laporan asesmen.

Diskon selalu menunjuk target_line_id dan akumulasi potongan terhadap line tersebut tidak melebihi nominalnya. required_initial_amount berasal dari50% net biaya dasar setelah diskon dasar, bukan biaya tambahan; Admin hanya mendapat boolean minimum terpenuhi, bukan angka saldo.

Additional time otomatis hanya untuk appointment IN_CONSULTATION atau COMPLETED dengan layanan tambahan yang sudah terjadi; tidak menerima menit prediksi sebelum layanan dimulai. Koreksi turun wajib reference/reason. claimed_amount pasien tidak mengalahkan actual_amount petugas; keduanya tersimpan untuk penelusuran.

## Pengaturan basis tarif tambahan Konseling
Editor paket Admin/Superadmin mengirim additional_time_price_basis berupa NORMAL_PRICE atau FINAL_PRICE. Null hanya untuk kategori yang tidak memakai formula; Konseling tanpa basis tidak boleh bookable (422 ADDITIONAL_TIME_BASIS_REQUIRED). Guest tidak menerima field atau nominal tarif.
FINAL_PRICE memakai harga setelah promo global pada waktu booking, bukan total tagihan terbaru atau diskon individual sesudah booking. Booking mengacu package_version_id immutable; server menyimpan final_price_at_booking pada metadata BASE. Promo berakhir/perubahan konfigurasi hanya memengaruhi booking baru.
Request additional-time preview/PUT tidak boleh memasok rate_basis atau base_rate_snapshot sebagai override; field demikian ditolak. Response Admin preview hanya memuat appointment_id,package_version_id,rate_basis,base_rate_snapshot,total_additional_minutes,billed_blocks,calculated_total,delta_amount dan expected_revision. Tidak ada saldo/agregat penerimaan. Preview tidak membuat invoice; PUT commit menagih selisih revisi dengan basis sama.
Contoh versi paket Konseling normal900000/promo800000 dengan additional_time_price_basis=FINAL_PRICE: total40menit menghasilkan3blok dan600000. NORMAL_PRICE pada versi berbeda menghasilkan675000. Form wajib menampilkan pilihan dengan label harga normal/harga setelah promo dan alasan perubahan; tidak memilih default tersembunyi.

## Telelayanan Google Meet dan WhatsApp
Pada preview/create booking dengan delivery_mode=TELE_SERVICE, tambahkan tele_service_recipient_phone serta wa_delivery_accepted=true berdasarkan pemberitahuan link/jadwal. Server memvalidasi nomor internasional, mencatat tele_service_wa_accepted_at dan membuat tugas Admin. Field tidak dipaksakan pada booking offline. Booking assistance tanpa akun tetap sah setelah petugas mengonfirmasi kontak nyata.
Admin/Superadmin memperoleh/membuat URL secara manual di luar aplikasi, lalu POST tele-service-links otomatis enqueue pesan Baileys sesudah commit. URL wajib HTTPS dengan host tepat meet.google.com, path ruang valid/nonkosong; tolak /new, userinfo dan domain lain. Server tidak melakukan fetch URL dari input atau meminta credential Google pasien.
Form nomor baru mewajibkan recipient_confirmed=true berdasar konfirmasi nyata; actor/recipient_user_id/recipient_confirmed_at/attempt/version ditetapkan server. Mutasi mengunci appointment dan memeriksa versi: offline/URL invalid 422, stale/terminal 409, tidak berizin 403/404. Menyimpan data identik dengan versi aktif tidak membuat pesan ganda; resend sengaja action terpisah. Jangan mengirim link baru untuk mengubah status bayar/attendance.
Deduplication key link mencakup appointment_id,attempt_number,link_version,nomor tujuan dan request pengiriman. Worker memeriksa ulang status, requires_reschedule, attempt serta revisi terbaru sebelum dispatch. Reschedule membatalkan antrean lama dan menuntut konfirmasi link untuk usaha baru. Sukses save berarti QUEUED; hanya acknowledgment provider menjadi SENT, bukan read/join/completed.
Penerima tanpa akun menggunakan recipient_user_id=null + recipient_phone_snapshot pada delivery WhatsApp. GET /notifications hanya penerima akun terkait; petugas monitoring dibatasi appointment dan tidak membuka URL lewat log. Owner/penanggung jawab berizin mengambil link melalui TeleServiceDTO; Guest dan pasien lain ditolak. URL penuh hanya pada detail berizin/pesan WA yang dituju, audit cukup versi/kontak dimasking.
Kelebihan bayar: perhitungan kas aktual tetap benar, penanganan eksternal. Tidak ada endpoint/status/tiket penyelesaian kelebihan bayar atau kebutuhan mengisi keputusan sebelum layanan berjalan.

## Ketentuan integrasi yang wajib sama di semua modul
- Profiling offline ditetapkan kertas langsung ke Superadmin. appointments.profiling_mode=PAPER hanya pendaftaran offline oleh petugas, tanpa pretest_submission_id/answers/upload kertas; bukan SUBMITTED digital dan bukan bukti kelengkapan klinis. PATIENT_ONLINE wajib DIGITAL dan submission sah. Admin hanya mengurus identitas, penjadwalan, administrasi dan pembayaran; GET pretests status saja, penulisan answers oleh Admin ditolak403 termasuk melalui request generic/assisted. Bantuan consent adalah pencatatan penerimaan naskah nyata, tidak memberi akses profiling.
- Psikoterapi memakai pilihan B: preview tanpa side effect; POST /appointments pada booking pertama membuat plan ACTIVE planned_sessions=4, clinical_objective=null, psychologist_id dari praktisi tunggal server, appointment session_number=1 dan billing/invoice sesi1 dalam satu transaction. Response menyertakan treatment_plan_id/session_number serta data tagihan sesuai role; tidak menagih sesi2–4. Pasien tidak mengirim target/diagnosis/plan_id untuk mengubahnya. Key/payload sama mengembalikan resource sama. Plan ACTIVE pasangan pasien/paket sudah ada ->409 TREATMENT_PLAN_EXISTS dengan plan_id berizin dan arahan Admin menjadwalkan lanjutan melalui /admin/treatment-plans/{id}/sessions; plan terdahulu terminal tanpa ACTIVE ->409 TREATMENT_PLAN_REVIEW_REQUIRED untuk tinjauan owner, bukan rangkaian baru otomatis. Unique active_plan_guard mencegah dua plan ACTIVE saat submit bersamaan; duplicate-key dipetakan409 setelah rollback, bukan500. Konflik slot/consent/paket menggagalkan seluruh transaction. POST /superadmin/treatment-plans tetap tersedia untuk kebutuhan manual; bukan prasyarat pasien pertama. Endpoint manual/extend juga memeriksa guard ACTIVE, termasuk saat mengaktifkan kembali plan COMPLETED.
- Closed-unserved: action cancel/expiry/berakhirnya hak sebelum layanan menutup billing collection_status=CLOSED_UNSERVED dan melepas sisa lewat adjustment UNSERVED_BALANCE_RELEASE. Response payment_status=CLOSED_UNSERVED, remaining_amount=0 untuk pasien/owner, bukan PAID. Receipt/kas lama tetap. Admin tidak menerima nilai sisa atau amount pelepasan yang dihitung server; line penutupan diproyeksikan sebagai label tanpa nominal rinci, bukan raw model. Total tagihan yang diizinkan tetap tersedia. Check-in/payment submission baru untuk akun tagihan tertutup ditolak; penerimaan nyata terlambat hanya dicatat lewat petugas sesuai F08.
- Jadwal dan start pertemuan asesmen memeriksa dependency scope. Evaluasi hasil tidak mendahului testing; reschedule yang membalik urutan mendapat409 DEPENDENT_APPOINTMENT_CONFLICT untuk ditangani Admin, bukan menggeser appointment lain diam-diam.
- Pembatalan satu follow-up asesmen tidak menutup seluruh tagihan case. GET/aksi lanjutan memakai billing account case yang sama; status awal lanjutan mengikuti DP/proof/SLA asal, tidak membuat invoice/hold baru.
- reason untuk reschedule wajib; reason_code klasifikasi opsional. Counter reschedule_count dari request APPLIED, bukan field writable. origin=OWNER perlu referensi/nota persetujuan owner yang benar (boleh di luar sistem); origin=CLINIC berasal perubahan operasional yang diaudit, bukan pilihan pasien untuk menghindari kuota.
- preview_id kalender adalah token server berumur pendek yang mengikat hash input, versi kalender dan daftar/versi appointment terdampak. Apply memvalidasi ulang di bawah lock; perubahan dampak sejak preview menghasilkan409 dan preview ulang. Tidak perlu tabel/FK preview yang tidak terdefinisi.
- Semua endpoint membaca/mutasi memakai policy per objek. IDFK/waktu/nominal hasil hitung bukan kewenangan client. Eko menampilkan error/action berdasarkan capabilities, tidak mengganti nama enum sendiri.
- Export memakai dataset_snapshot role yang dibekukan dan cutoff as_of sebagaimana F14; mengantrekan format file tidak mengizinkan worker mengambil ulang dataset hidup.

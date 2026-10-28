# Kontrak web operasional — 26 Oktober2026

Dokumen ini menggantikan kontrak target sebelum controller dibuat. Daftar di bawah diambil dari artisan route:list pada implementasi saat ini. Rincian alur: [implementasi Eko](IMPLEMENTASI_WEB_2026-10-26.md), [fitur](FEATURES.md), [hak akses](ROLES_PERMISSIONS.md).

## Transport dan session

Satu origin Laravel/Inertia/React. Form login/register/reset memakai Inertia; workspace memakai props awal dan JSON pendukung melalui practice/http.ts. Cookie session Laravel, CSRF dan auth_version berlaku; tidak memakai bearer token atau Sanctum. Seluruh mutation bisnis membutuhkan Idempotency-Key (16–150karakter), kecuali autentikasi dan unggah gambar publik yang memakai mekanisme masing-masing. ID UUID tidak menjadi bukti hak akses.

Respons action sukses berbentuk {data:{id:...}}. Validasi/versi guard422 dengan errors per field; objek di luar akses404/403; session berakhir401; CSRF419; optimistic model conflict dapat409. Form Inertia dapat menerima redirect/errors. Semua pemeriksaan role/patient scope juga berada pada controller/service; nama prefix route tidak memberikan hak akses.

GET /work/data menerima page, patient_id, appointment_id, status, date WIB dan search. Filter tidak boleh memperluas cakupan pasien. Appointment dipaginasi25; katalog/profil/rangkaian mempunyai batas baca. Whitelist DTO ada pada WorkspaceData, bukan hasil serialisasi model. Admin tidak memperoleh verified_received, remaining_amount, overpaid_amount, amount penerimaan terverifikasi, receipt_id atau answers/clinical_objective.

## Payload pokok

- Preview booking: patient_id, package_version_id, start_at. Hasil: quote_token, normal_price, final_price, minimum, start/end, versi kalender dan hold_expires_at.
- Create online: identitas preview + quote_token, pretest_submission_id baru SUBMITTED, consent_id layanan yang belum terikat; Telelayanan juga tele_service_recipient_phone dan wa_delivery_accepted. Harga, end_at, role, status dan nomor sesi tidak ditentukan browser.
- Booking offline: Admin/Superadmin, profiling_mode=PAPER dan persetujuan nyata penanggung jawab; tidak ada jawaban klinis dari Admin. Janji custom mempunyai label, durasi, payment_requirement serta konteks arahan owner di luar sistem.
- Pembayaran: unggah file privat dahulu, lalu claimed_amount dan file_id. Admin merekam actual_amount/amount serta received_at aktual. Unggahan tidak membentuk kas; verifikasi membentuk receipt dan alokasi. Koreksi memakai correct_amount termasuk0, alasan dan reversal.
- Aksi ber-versi: expected_version berasal dari row_version. Bukti memakai expected_proof_version; overtime memakai expected_revision; Meet memakai expected_link_version; publish CMS memakai expected_published_id; kalender memakai preview_token dan calendar_version_id.
- Laporan kas: from/to tanggal WIB, as_of opsional. Export: kind SCHEDULE/FINANCE, format CSV/XLSX dan rentang. Worker memformat dataset_snapshot yang sudah dibekukan. Download melalui file_id privat.

## Route aktual

| Method | Route | Handler |
|---|---|---|
| GET / HEAD | / | HomeController |
| POST | /account | ManagementController@account |
| POST | /admin/appointments/custom | BookingController@custom |
| POST | /admin/appointments/{appointment}/additional-time | BillingController@time |
| POST | /admin/appointments/{appointment}/next | BookingController@next |
| POST | /admin/appointments/{appointment}/payments | BillingController@record |
| POST | /admin/appointments/{appointment}/tele-service-links | NotificationController@meet |
| POST | /admin/appointments/{appointment}/{action} | BookingController@lifecycle |
| POST | /admin/assessment-cases/{case}/report | ClinicalAdministrationController@report |
| POST | /admin/assets | PublicAssetController@store |
| POST | /admin/billing-accounts/{billing}/{action} | BillingController@change |
| POST | /admin/calendar/apply | ManagementController@calendarApply |
| POST | /admin/calendar/preview | ManagementController@calendarPreview |
| POST | /admin/cms | ManagementController@cms |
| GET / HEAD | /admin/cms/{cms}/preview | ManagementController@preview |
| POST | /admin/cms/{cms}/publish | ManagementController@publish |
| GET / HEAD | /admin/dashboard | DashboardController@show |
| POST | /admin/notification-deliveries/{notification}/retry | NotificationController@retry |
| POST | /admin/packages | ManagementController@package |
| POST | /admin/packages/{package}/active | ManagementController@togglePackage |
| POST | /admin/patients/{patient}/link | ClinicalAdministrationController@link |
| POST | /admin/reviews/{review}/moderate | ClinicalAdministrationController@moderate |
| POST | /admin/tutorials | ClinicalAdministrationController@tutorialContent |
| POST | /appointments | BookingController@store |
| POST | /appointments/preview | BookingController@preview |
| POST | /appointments/{appointment}/payment-submissions | BillingController@submit |
| POST | /appointments/{appointment}/reminder-contact | NotificationController@contact |
| POST | /appointments/{appointment}/reschedule-requests | BookingController@reschedule |
| GET / HEAD | /auth/google/callback | Auth\GoogleController@callback |
| GET / HEAD | /auth/google/complete | Auth\GoogleController@form |
| POST | /auth/google/complete | Auth\GoogleController@complete |
| POST | /auth/google/credential | Auth\GoogleController@credential |
| GET / HEAD | /auth/google/redirect | Auth\GoogleController@redirect |
| GET / HEAD | /availability | BookingController@slots |
| POST | /billing-accounts/{billing}/review | ClinicalAdministrationController@review |
| POST | /consents | ClinicalAdministrationController@consent |
| POST | /consents/{consent}/withdraw | ClinicalAdministrationController@withdraw |
| GET / HEAD | /dashboard | DashboardController@redirect |
| POST | /exports | FinanceController@export |
| POST | /files | FileController@store |
| GET / HEAD | /files/{file}/download | FileController@download |
| GET / HEAD | /forgot-password | Auth\AccountController@forgotForm |
| POST | /forgot-password | Auth\AccountController@forgot |
| GET / HEAD | /informasi/{section} | Closure |
| GET / HEAD | /invoices/{invoice}/download | FileController@invoice |
| GET / HEAD | /login | Auth\AuthenticatedSessionController@create |
| POST | /login | Auth\AuthenticatedSessionController@store |
| POST | /logout | Auth\AuthenticatedSessionController@destroy |
| GET / HEAD | /media/{asset} | PublicAssetController@show |
| POST | /notifications/{notification}/read | NotificationController@read |
| GET / HEAD | /pasien/dashboard | DashboardController@show |
| POST | /patients | ClinicalAdministrationController@patient |
| POST / PATCH | /patients/{patient} | ClinicalAdministrationController@patient |
| POST | /payments/{payment}/{action} | BillingController@payment |
| POST | /pretests | ClinicalAdministrationController@pretest |
| GET / HEAD | /receipts/{receipt}/download | FileController@receipt |
| GET / HEAD | /register | Auth\AccountController@registerForm |
| POST | /register | Auth\AccountController@register |
| POST | /reschedule-requests/{reschedule}/{decision} | BookingController@review |
| POST | /reset-password | Auth\AccountController@reset |
| GET / HEAD | /reset-password/{token} | Auth\AccountController@resetForm |
| POST | /superadmin/assessment-cases/{case}/{action} | ClinicalAdministrationController@caseAction |
| GET / HEAD | /superadmin/dashboard | DashboardController@show |
| POST | /superadmin/expenses | FinanceController@expense |
| POST | /superadmin/expenses/{expense}/corrections | FinanceController@expense |
| GET / HEAD | /superadmin/finance | FinanceController@show |
| POST | /superadmin/settings | ManagementController@settings |
| POST | /superadmin/treatment-plans/{plan}/{action} | ClinicalAdministrationController@planAction |
| POST | /superadmin/users | ManagementController@user |
| POST | /superadmin/users/{user} | ManagementController@user |
| POST | /superadmin/whatsapp/pairing | NotificationController@pairing |
| GET / HEAD | /superadmin/whatsapp/status | NotificationController@status |
| POST | /tutorial-progress/{tutorial} | ClinicalAdministrationController@tutorial |
| GET / HEAD | /work/data | Closure |

Parameter action/decision dibatasi route: lifecycle check-in/start/complete/no-show/cancel; payment verify/reject/corrections/proof; billing charges/discounts; reschedule approve/reject/apply/reopen/selection/cancel; case scope/close/reopen; plan objective/complete/discontinue. Google credential/complete dan redirect/callback telah diimplementasikan; kesiapan bergantung Client ID/secret opsional. Status/pairing WhatsApp khusus Superadmin, perubahan kontak pengingat memakai scope pasien dan expected_version.

## Hubungan antarlapisan

Setiap mutation memulai transaksi dan memperoleh mutex owner_settings sebelum ordinary read pertama agar snapshot REPEATABLE READ tidak ketinggalan sesudah menunggu lock. Kemudian periksa idempotency, lock scope/tanggal, versi, relasi, ledger dan outbox. Notification/provider hanya sesudah commit. Scheduler mengikuti urutan yang sama.

Schema dan tipe: [kamus database](DATABASE_ARCHITECTURE.md). Form/props frontend: resources/js/types/practice.ts. Referensi REST/mock sebelumnya tersimpan di resources/js/legacy dan [arsip kontrak](archive/WEB_CONTRACT_SEBELUM_IMPLEMENTASI_2026-10-26.md); tidak menjadi endpoint produksi.

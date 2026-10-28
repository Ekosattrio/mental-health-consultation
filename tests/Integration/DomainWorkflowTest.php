<?php

namespace Tests\Integration;

use App\Domain\Administration;
use App\Domain\Billing;
use App\Domain\Bookings;
use App\Domain\Calendar;
use App\Domain\Clockwork;
use App\Domain\FinancialActions;
use App\Domain\GoogleIdentity;
use App\Domain\Notifications;
use App\Domain\Operations;
use App\Domain\PracticeInstaller;
use App\Domain\Reports;
use App\Domain\Transactions;
use App\Domain\WorkspaceData;
use App\Jobs\GenerateExport;
use App\Models\Appointment;
use App\Models\AppointmentEvent;
use App\Models\AssessmentCase;
use App\Models\AuthIdentity;
use App\Models\BillingAccount;
use App\Models\CmsContent;
use App\Models\Consent;
use App\Models\ConsultationPackage;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\NotificationOutbox;
use App\Models\PackageVersion;
use App\Models\PatientAccess;
use App\Models\PatientProfile;
use App\Models\PaymentAllocation;
use App\Models\PaymentTransaction;
use App\Models\PretestSubmission;
use App\Models\PretestTemplate;
use App\Models\PrivateFile;
use App\Models\Receipt;
use App\Models\RescheduleRequest;
use App\Models\TreatmentPlan;
use App\Models\TutorialContent;
use App\Models\TutorialProgress;
use App\Models\User;
use Carbon\CarbonImmutable;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

final class DomainWorkflowTest extends TestCase
{
    private static ?string $database = null;

    private static ?\PDO $server = null;

    private User $owner;

    private User $admin;

    private User $patient;

    private PatientProfile $profile;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $config = config('database.connections.mysql');
        if (! in_array($config['host'], ['127.0.0.1', 'localhost'], true)) {
            throw new \RuntimeException('Integrasi hanya pada MySQL lokal.');
        }
        $fresh = self::$database === null;
        if ($fresh) {
            self::$database = 'jiwasehat_schema_test_'.bin2hex(random_bytes(6));
            self::$server = new \PDO('mysql:host='.$config['host'].';port='.$config['port'].';charset=utf8mb4', $config['username'], $config['password'], [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
            self::$server->exec('CREATE DATABASE `'.self::$database.'` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        }
        config(['database.default' => 'mysql', 'database.connections.mysql.database' => self::$database, 'database.connections.mysql.url' => null]);
        DB::purge('mysql');
        if ($fresh) {
            $code = Artisan::call('migrate', ['--force' => true]);
            if ($code !== 0) {
                throw new \RuntimeException(Artisan::output());
            }
        }
        DB::beginTransaction();
        $this->clock('2026-10-26T05:00:00+07:00');
        $this->owner = app(PracticeInstaller::class)->install('Owner Uji', 'owner@example.test', 'OwnerTest2026');
        $this->admin = User::forceCreate(['name' => 'Admin Uji', 'email' => 'admin@example.test', 'role' => 'ADMIN', 'password_hash' => 'AdminTest2026'])->refresh();
        $this->patient = User::create(['name' => 'Pasien Uji', 'email' => 'patient@example.test', 'password_hash' => 'PatientTest2026'])->refresh();
        $this->profile = PatientProfile::create(['full_name' => 'Pasien Uji', 'birth_date' => '1990-01-01', 'gender' => 'Laki-laki', 'phone' => '+628111111111']);
        PatientAccess::create(['account_user_id' => $this->patient->id, 'patient_id' => $this->profile->id, 'relationship' => 'SELF']);
    }

    protected function tearDown(): void
    {
        if ($this->app) {
            while (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
        }
        Date::setTestNow();
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public static function tearDownAfterClass(): void
    {
        if (self::$database && preg_match('/^jiwasehat_schema_test_[a-f0-9]{12}$/D', self::$database)) {
            self::$server?->exec('DROP DATABASE `'.self::$database.'`');
        }
        self::$database = null;
        self::$server = null;
        parent::tearDownAfterClass();
    }

    private function clock(string $time): void
    {
        Date::setTestNow($time);
        CarbonImmutable::setTestNow($time);
    }

    private function login(User $user): void
    {
        $this->actingAs($user->refresh())->withSession(['auth_version' => $user->auth_version]);
    }

    private function postAction(string $url, array $input, ?string $key = null): TestResponse
    {
        return $this->withHeader('Idempotency-Key', $key ?? (string) Str::uuid())->postJson($url, $input);
    }

    private function booking(string $code = 'COUNSELING_OFFLINE', string $start = '2026-10-26T11:00:00+07:00'): Appointment
    {
        $version = PackageVersion::whereIn('package_id', ConsultationPackage::where('service_code', $code)->select('id'))->firstOrFail();
        $template = PretestTemplate::firstOrFail();
        $submission = PretestSubmission::create(['patient_id' => $this->profile->id, 'template_id' => $template->id, 'author_user_id' => $this->patient->id, 'answers' => ['complaint' => 'Konteks rahasia sesi pertama'], 'status' => 'SUBMITTED', 'submitted_at' => now()]);
        $document = CmsContent::where('section_key', 'consent')->firstOrFail();
        $consent = Consent::create(['patient_id' => $this->profile->id, 'actor_user_id' => $this->patient->id, 'accepted_by_name_snapshot' => 'Pasien Uji', 'recorded_by_user_id' => $this->patient->id, 'document_key' => 'consent', 'document_version' => 1, 'accepted_at' => now(), 'acceptance_source' => 'SELF', 'cms_content_id' => $document->id]);
        $input = ['patient_id' => $this->profile->id, 'package_version_id' => $version->id, 'start_at' => $start, 'pretest_submission_id' => $submission->id, 'consent_id' => $consent->id];
        if ($code === 'COUNSELING_TELE_SERVICE') {
            $input += ['tele_service_recipient_phone' => '+628111111111', 'wa_delivery_accepted' => true];
        }
        $quote = app(Bookings::class)->quote($this->patient, $input);
        $input['quote_token'] = $quote['quote_token'];
        $result = app(Transactions::class)->run($this->patient, 'booking.create', (string) Str::uuid(), $input, fn () => ['id' => app(Bookings::class)->create($this->patient, $input)->id]);

        return Appointment::findOrFail($result['id']);
    }

    private function cash(Appointment $appointment, int $amount): PaymentTransaction
    {
        return DB::transaction(fn () => app(FinancialActions::class)->record($this->admin, app(Operations::class)->lock($appointment->id), ['amount' => $amount, 'method' => 'CASH', 'purpose' => 'DP', 'received_at' => now()->toIso8601String(), 'reason' => 'Uang aktual telah diterima', 'duplicate_review_acknowledged' => true]));
    }

    public function test_calendar_consumes_working_intervals_and_online_is_same_day(): void
    {
        $calendar = app(Calendar::class);
        $this->assertSame('2026-10-26 11:00', $calendar->addWorkingMinutes($calendar->instant('2026-10-26 05:00'), 180)->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'));
        $data = app(WorkspaceData::class)->for($this->owner)['calendar'];
        foreach ($data['weekly'] as &$day) {
            if ($day['day_of_week'] === 1) {
                $day['intervals'] = [['08:00', '12:00'], ['13:00', '16:00']];
            }
        }
        $input = ['calendar_version_id' => $data['id'], 'weekly' => $data['weekly'], 'overrides' => [], 'reason' => 'Atur jeda kerja'];
        $preview = app(Administration::class)->calendar($this->admin, $input);
        app(Administration::class)->calendar($this->admin, [...$input, 'preview_token' => $preview['preview_token']], true);
        $this->assertSame('14:30', $calendar->addWorkingMinutes($calendar->instant('2026-10-26 10:30'), 180)->setTimezone('Asia/Jakarta')->format('H:i'));
    }

    public function test_booking_bills_only_once_and_conflicting_slot_is_rejected(): void
    {
        $appointment = $this->booking();
        $this->assertSame('WAITING_PAYMENT', $appointment->status->value);
        $this->assertSame('09:00', $appointment->hold_expires_at->setTimezone('Asia/Jakarta')->format('H:i'));
        $bill = app(Billing::class)->account($appointment);
        $this->assertSame(450000, $bill->initial_minimum_due);
        $this->assertSame(900000, app(Billing::class)->balance($bill)['remaining_amount']);
        $this->expectException(ValidationException::class);
        $this->booking();
    }

    public function test_actual_partial_payments_never_force_the_bill_paid_and_admin_has_no_balance_or_clinical_answers(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 150000);
        $this->cash($appointment, 1);
        $bill = app(Billing::class)->account($appointment);
        $this->assertSame(749999, app(Billing::class)->balance($bill)['remaining_amount']);
        $this->assertSame('WAITING_PAYMENT', $appointment->refresh()->status->value);
        $this->login($this->admin);
        $response = $this->getJson('/work/data')->assertOk();
        $body = $response->getContent();
        $this->assertStringNotContainsString('remaining_amount', $body);
        $this->assertStringNotContainsString('verified_received', $body);
        $this->assertStringNotContainsString('Konteks rahasia', $body);
        $this->assertStringNotContainsString('"answers"', $body);
        $this->login($this->owner);
        $this->postAction('/admin/appointments/'.$appointment->id.'/payments', ['amount' => 1, 'method' => 'CASH', 'purpose' => 'SETTLEMENT', 'received_at' => now()->toIso8601String()])->assertForbidden();
    }

    public function test_paid_reschedule_releases_old_slot_and_keeps_cash_period(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 450000);
        $appointment->refresh();
        $request = app(Operations::class)->request($this->patient, $appointment, 'Pindah jam karena pekerjaan', '2026-10-26T13:00:00+07:00');
        app(Operations::class)->review($this->admin, $appointment, $request, 'approve', 'Jadwal disepakati');
        $request->refresh();
        $locked = app(Operations::class)->lock($appointment->id, app(Calendar::class)->instant('2026-10-26T13:00:00+07:00'));
        app(Operations::class)->review($this->admin, $locked, $request, 'apply', 'Pindah ke slot kosong');
        $this->assertSame('CONFIRMED', $appointment->refresh()->status->value);
        $this->assertSame(2, $appointment->attempt_number);
        $this->assertSame('APPLIED', $request->refresh()->status->value);
        app(Calendar::class)->assertFree(app(Calendar::class)->instant('2026-10-26T11:00:00+07:00'), app(Calendar::class)->instant('2026-10-26T12:00:00+07:00'), $this->owner->id);
        $this->assertSame(1, PaymentTransaction::where('entry_type', 'RECEIPT')->count());
        $this->assertSame(450000, app(Reports::class)->finance($this->owner, '2026-10-26', '2026-10-26')['cash_received']);
    }

    public function test_cancellation_releases_unserved_balance_without_refund_or_false_receipt(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 450000);
        $locked = app(Operations::class)->lock($appointment->id);
        app(Operations::class)->lifecycle($this->admin, $locked, 'cancel', 'Pasien membatalkan sebelum layanan');
        $bill = app(Billing::class)->account($appointment);
        $this->assertSame('CLOSED_UNSERVED', $bill->refresh()->collection_status->value);
        $this->assertSame(0, app(Billing::class)->balance($bill)['remaining_amount']);
        $this->assertSame(450000, (int) PaymentTransaction::where('status', 'VERIFIED')->sum('amount'));
        $this->assertSame(1, Receipt::count());
    }

    public function test_custom_free_appointment_has_no_money_and_offline_can_book_today(): void
    {
        $this->clock('2026-10-26T08:00:00+07:00');
        $this->login($this->admin);
        $input = ['patient_id' => $this->profile->id, 'start_at' => '2026-10-26T08:05:00+07:00', 'duration_minutes' => 30, 'custom_label' => 'Janji tambahan owner', 'payment_requirement' => 'NOT_REQUIRED', 'profiling_mode' => 'NONE', 'owner_authorization_note' => 'Disepakati owner di luar sistem'];
        $key = (string) Str::uuid();
        $first = $this->postAction('/admin/appointments/custom', $input, $key)->assertOk()->json('data.id');
        $second = $this->postAction('/admin/appointments/custom', $input, $key)->assertOk()->json('data.id');
        $this->assertSame($first, $second);
        $this->assertSame(1, Appointment::count());
        $this->assertSame(0, BillingAccount::count());
        $this->assertSame(0, PaymentTransaction::count());
        $this->assertSame('CONFIRMED', Appointment::findOrFail($first)->status->value);
    }

    public function test_patient_cannot_access_another_patient_or_admin_commands(): void
    {
        $appointment = $this->booking();
        $other = User::create(['name' => 'Lain', 'email' => 'other@example.test', 'password_hash' => 'OtherTest2026'])->refresh();
        $this->login($other);
        $this->postAction('/appointments/'.$appointment->id.'/reschedule-requests', ['reason' => 'Pindah jadwal', 'expected_version' => $appointment->row_version, 'start_at' => '2026-10-26T13:00:00+07:00'])->assertNotFound();
        $this->getJson('/superadmin/finance?from=2026-10-26&to=2026-10-26')->assertForbidden();
        $this->postAction('/admin/cms', ['section_key' => 'landing', 'payload' => ['title' => 'X'], 'publish' => true, 'expected_published_id' => null])->assertForbidden();
        $this->assertSame(0, RescheduleRequest::count());
    }

    public function test_receipt_pdf_and_spreadsheet_exports_are_valid_and_role_limited(): void
    {
        $appointment = $this->booking();
        $payment = $this->cash($appointment, 450000);
        $receipt = Receipt::where('payment_transaction_id', $payment->id)->firstOrFail();
        $this->login($this->patient);
        $response = $this->get('/receipts/'.$receipt->id.'/download')->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $response->getContent());
        $this->login($this->admin);
        $this->get('/receipts/'.$receipt->id.'/download')->assertForbidden();
        $xlsx = Reports::xlsx([['name' => '=HYPERLINK("test")', 'amount' => 100]]);
        $this->assertStringStartsWith('PK', $xlsx);
        $csv = Reports::csv([['name' => '=HYPERLINK("test")']]);
        $this->assertStringContainsString("'=HYPERLINK", $csv);
    }

    private function finish(Appointment $appointment, string $start, string $end): void
    {
        $this->clock($start);
        $operations = app(Operations::class);
        $operations->lifecycle($this->admin, $operations->lock($appointment->id), 'check-in', 'Identitas diperiksa');
        $operations->lifecycle($this->admin, $operations->lock($appointment->id), 'start', 'Mulai sesi');
        $this->clock($end);
        $operations->lifecycle($this->admin, $operations->lock($appointment->id), 'complete', 'Sesi selesai');
    }

    public function test_therapy_prepayment_allocates_four_invoices_without_duplicate_cash(): void
    {
        $appointment = $this->booking('PSYCHOTHERAPY_SESSION');
        $this->cash($appointment, 2000000);
        $planId = $appointment->treatment_plan_id;
        for ($index = 0; $index < 4; $index++) {
            $day = 26 + $index;
            $this->finish($appointment, "2026-10-{$day}T11:00:00+07:00", "2026-10-{$day}T12:00:00+07:00");
            if ($index < 3) {
                $next = $day + 1;
                $appointment = app(Operations::class)->next($this->admin, $appointment->refresh(), ['start_at' => "2026-10-{$next}T11:00:00+07:00", 'duration_minutes' => 60]);
            }
        }
        $this->assertSame(4, Invoice::count());
        $this->assertSame(1, Receipt::count());
        $this->assertSame(2000000, (int) PaymentTransaction::where('entry_type', 'RECEIPT')->sum('amount'));
        $this->assertSame('COMPLETED', TreatmentPlan::findOrFail($planId)->status->value);
        $this->assertSame(2000000, (int) PaymentAllocation::where('entry_type', 'ALLOCATION')->sum('amount'));
        $this->assertSame(0, app(Billing::class)->balance(app(Billing::class)->account($appointment))['remaining_amount']);
    }

    public function test_assessment_has_one_bill_for_testing_and_evaluation_and_no_extra_report_fee(): void
    {
        $appointment = $this->booking('ASSESSMENT_FULL');
        $this->assertSame(240, (int) $appointment->start_at->diffInMinutes($appointment->end_at));
        $this->cash($appointment, 750000);
        $this->finish($appointment, '2026-10-26T11:00:00+07:00', '2026-10-26T15:00:00+07:00');
        $next = app(Operations::class)->next($this->admin, $appointment->refresh(), ['start_at' => '2026-10-27T11:00:00+07:00', 'duration_minutes' => 30, 'assessment_role' => 'EVALUATION']);
        $this->assertSame($appointment->assessment_case_id, $next->assessment_case_id);
        $this->assertSame(1, BillingAccount::count());
        $this->assertSame(1, Invoice::count());
        $this->assertSame(1500000, app(Billing::class)->balance(app(Billing::class)->account($next))['total_due']);
        $this->expectException(ValidationException::class);
        app(FinancialActions::class)->charge($this->admin, app(Billing::class)->account($next), ['amount' => 200000, 'kind' => 'FORMAL_REPORT', 'label' => 'Laporan', 'reason' => 'Laporan asesmen sudah termasuk']);
    }

    public function test_overtime_rounds_cumulative_minutes_not_each_edit(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 900000);
        $this->finish($appointment, '2026-10-26T11:00:00+07:00', '2026-10-26T12:40:00+07:00');
        foreach ([5, 10, 40] as $revision => $minutes) {
            app(FinancialActions::class)->additionalTime($this->admin, $appointment->refresh(), ['total_additional_minutes' => $minutes, 'expected_revision' => $revision, 'reason' => 'Menit tambahan aktual dikonfirmasi']);
        }
        $bill = app(Billing::class)->account($appointment);
        $this->assertSame(1575000, app(Billing::class)->balance($bill)['total_due']);
        $this->assertSame(3, Invoice::count());
        $this->assertSame(675000, app(Billing::class)->balance($bill)['remaining_amount']);
        app(FinancialActions::class)->additionalTime($this->admin, $appointment->refresh(), ['total_additional_minutes' => 0, 'expected_revision' => 3, 'reason' => 'Koreksi salah input waktu tambahan']);
        $this->assertSame(900000, app(Billing::class)->balance($bill)['total_due']);
        $this->assertSame(1, Receipt::count());
    }

    public function test_unverified_timely_proof_protects_slot_and_notifies_owner_without_verifying_money(): void
    {
        $appointment = $this->booking();
        $this->clock('2026-10-26T08:59:00+07:00');
        $file = PrivateFile::create(['storage_key' => 'tests/proof', 'mime_type' => 'application/pdf', 'size_bytes' => 10, 'uploaded_by' => $this->patient->id, 'uploaded_at' => now(), 'expires_at' => now()->addYear(), 'purpose' => 'PAYMENT_PROOF', 'checksum_sha256' => str_repeat('a', 64)]);
        $payment = app(Billing::class)->submit($this->patient, $appointment, 450000, $file->id, 'TRANSFER', 'Pengirim');
        $this->clock('2026-10-26T09:00:00+07:00');
        app(Clockwork::class)->tick();
        $this->assertSame('WAITING_VERIFICATION', $appointment->refresh()->status->value);
        $this->assertSame('PENDING_VERIFICATION', $payment->refresh()->status->value);
        $this->assertNull($payment->amount);
        $this->assertTrue(Notification::where('recipient_user_id', $this->owner->id)->where('template_key', 'REMINDER_OWNER')->exists());
        $this->clock('2026-10-26T11:01:00+07:00');
        app(Billing::class)->reject($this->admin, $payment, 'Mutasi tidak cocok');
        $this->assertSame('REJECTED', $payment->refresh()->status->value);
        $this->assertNull($appointment->refresh()->correction_deadline_at);
    }

    public function test_clock_expires_unpaid_first_therapy_and_allows_a_new_plan_without_fake_money(): void
    {
        $appointment = $this->booking('PSYCHOTHERAPY_SESSION');
        $this->clock('2026-10-26T09:01:00+07:00');
        app(Clockwork::class)->tick();
        $this->assertSame('EXPIRED', $appointment->refresh()->status->value);
        $this->assertSame('DISCONTINUED', TreatmentPlan::findOrFail($appointment->treatment_plan_id)->status->value);
        $this->assertSame(0, PaymentTransaction::count());
        $this->assertSame(0, app(Billing::class)->balance(app(Billing::class)->account($appointment))['remaining_amount']);
        $next = $this->booking('PSYCHOTHERAPY_SESSION', '2026-10-27T11:00:00+07:00');
        $this->assertNotSame($appointment->treatment_plan_id, $next->treatment_plan_id);
    }

    public function test_no_show_requires_grace_and_recovery_keeps_history_and_initial_payment(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 450000);
        $operations = app(Operations::class);
        $this->clock('2026-10-26T11:14:00+07:00');
        try {
            $operations->lifecycle($this->admin, $operations->lock($appointment->id), 'no-show', 'Belum hadir');
            $this->fail('Grace belum berakhir');
        } catch (ValidationException) {
            $this->assertSame('CONFIRMED', $appointment->refresh()->status->value);
        }
        $this->clock('2026-10-26T11:16:00+07:00');
        $operations->lifecycle($this->admin, $operations->lock($appointment->id), 'no-show', 'Tidak hadir setelah pemeriksaan');
        $request = $operations->request($this->patient, $appointment->refresh(), 'Ajukan pengganti setelah tidak hadir', '2026-10-27T11:00:00+07:00');
        $operations->review($this->admin, $appointment, $request, 'approve', 'Disepakati');
        $operations->review($this->admin, $operations->lock($appointment->id, app(Calendar::class)->instant('2026-10-27T11:00:00+07:00')), $request->refresh(), 'apply', 'Jadwal baru');
        $this->assertSame('CONFIRMED', $appointment->refresh()->status->value);
        $this->assertSame(1, AppointmentEvent::where('event_type', 'NO_SHOW')->count());
        $this->assertSame(450000, (int) PaymentTransaction::where('status', 'VERIFIED')->sum('amount'));
        $this->assertSame(1, Invoice::count());
    }

    public function test_html_datetime_local_is_interpreted_as_jakarta_before_financial_validation(): void
    {
        $appointment = $this->booking();
        $this->login($this->admin);
        $response = $this->postAction('/admin/appointments/'.$appointment->id.'/payments', ['amount' => 450000, 'method' => 'CASH', 'purpose' => 'DP', 'received_at' => '2026-10-26T04:59', 'reason' => 'Penerimaan aktual WIB'])->assertOk();
        $payment = PaymentTransaction::findOrFail($response->json('data.id'));
        $this->assertSame('2026-10-25 21:59', $payment->received_at->utc()->format('Y-m-d H:i'));
        $this->assertSame('CONFIRMED', $appointment->refresh()->status->value);
    }

    public function test_as_of_report_and_late_correction_keep_old_cash_period_traceable(): void
    {
        $appointment = $this->booking();
        $payment = $this->cash($appointment, 450000);
        $cutoff = now()->toIso8601String();
        $this->clock('2026-10-27T09:00:00+07:00');
        app(FinancialActions::class)->correct($this->admin, $payment->refresh(), ['correct_amount' => 400000, 'received_at' => '2026-10-26T05:00:00+07:00', 'reason' => 'Nominal penerimaan sebenarnya400000']);
        $reports = app(Reports::class);
        $this->assertSame(450000, $reports->finance($this->owner, '2026-10-26', '2026-10-26', $cutoff)['cash_received']);
        $revised = $reports->finance($this->owner, '2026-10-26', '2026-10-26');
        $this->assertSame(400000, $revised['cash_received']);
        $this->assertTrue(collect($revised['rows'])->contains(fn ($row) => $row['late_verified']));
        $this->assertSame(2, Receipt::count());
    }

    public function test_calendar_change_creates_clinic_request_and_releases_no_patient_quota(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 450000);
        $data = app(WorkspaceData::class)->for($this->admin)['calendar'];
        foreach ($data['weekly'] as &$day) {
            if ($day['day_of_week'] === 1) {
                $day['intervals'] = [['08:00', '10:00']];
            }
        }
        $input = ['calendar_version_id' => $data['id'], 'weekly' => $data['weekly'], 'overrides' => [], 'reason' => 'Perubahan jam operasional'];
        $preview = app(Administration::class)->calendar($this->admin, $input);
        $this->assertCount(1, $preview['affected']);
        app(Administration::class)->calendar($this->admin, [...$input, 'preview_token' => $preview['preview_token']], true);
        $request = RescheduleRequest::where('appointment_id', $appointment->id)->firstOrFail();
        $this->assertSame('CLINIC', $request->origin->value);
        $this->assertTrue($appointment->refresh()->requires_reschedule);
        $operations = app(Operations::class);
        $operations->select($this->admin, $request, '2026-10-27T11:00:00+07:00');
        $operations->review($this->admin, $appointment, $request->refresh(), 'approve', 'Slot pengganti');
        $operations->review($this->admin, $operations->lock($appointment->id, app(Calendar::class)->instant('2026-10-27T11:00:00+07:00')), $request->refresh(), 'apply', 'Dipindah karena klinik');
        $this->assertSame(0, $request->refresh()->quota_effect);
        $this->assertFalse($appointment->refresh()->requires_reschedule);
    }

    public function test_public_page_hides_prices_and_drafts_and_publish_uses_existing_design(): void
    {
        $this->login($this->admin);
        $this->postAction('/admin/cms', ['section_key' => 'landing', 'payload' => ['heroTitle' => 'RAHASIA_DRAFT', 'heroSubtitle' => 'Teks draft'], 'publish' => false, 'expected_published_id' => null])->assertOk();
        Auth::logout();
        $this->get('/')->assertOk()->assertDontSee('RAHASIA_DRAFT')->assertDontSee('normal_price')->assertDontSee('900000');
        $this->login($this->owner);
        $this->postAction('/admin/cms', ['section_key' => 'landing', 'payload' => ['heroTitle' => 'JUDUL_PUBLIK', 'heroSubtitle' => 'Teks publik'], 'publish' => true, 'expected_published_id' => null])->assertOk();
        Auth::logout();
        $this->get('/')->assertOk()->assertSee('JUDUL_PUBLIK');
    }

    public function test_registration_records_privacy_version_and_rejects_role_injection(): void
    {
        $input = ['name' => 'Pasien Baru', 'email' => 'newpatient@example.test', 'phone' => '+628222222222', 'password' => 'PatientBaru2026', 'password_confirmation' => 'PatientBaru2026', 'privacy_accepted' => true];
        $this->postJson('/register', [...$input, 'role' => 'ADMIN'])->assertUnprocessable();
        $this->post('/register', $input)->assertRedirect('/dashboard');
        $user = User::where('email', $input['email'])->firstOrFail();
        $this->assertSame('PATIENT', $user->role->value);
        $this->assertTrue(Hash::check($input['password'], $user->password_hash));
        $this->assertTrue(Consent::where('actor_user_id', $user->id)->where('document_key', 'privacy')->exists());
        $this->getJson('/work/data')->assertOk()->assertJsonPath('data.role', 'PATIENT');
    }

    public function test_login_alias_and_session_revocation_and_password_reset(): void
    {
        $this->admin->update(['email' => 'admin@jiwasehat.test']);
        $this->post('/login', ['email' => 'admin', 'password' => 'AdminTest2026'])->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($this->admin);
        $this->getJson('/work/data')->assertOk();
        $this->admin->refresh()->increment('auth_version');
        Auth::setUser($this->admin->refresh());
        $this->getJson('/work/data')->assertUnauthorized();
        Auth::logout();
        $token = Password::createToken($this->admin);
        $this->post('/reset-password', ['email' => $this->admin->email, 'token' => $token, 'password' => 'AdminReset2026', 'password_confirmation' => 'AdminReset2026'])->assertRedirect('/login');
        $this->assertTrue(Hash::check('AdminReset2026', $this->admin->refresh()->password_hash));
    }

    public function test_cms_stale_publication_and_preview_permissions_and_image_upload(): void
    {
        Storage::fake('local');
        $this->login($this->admin);
        $first = $this->postAction('/admin/cms', ['section_key' => 'landing', 'payload' => ['heroTitle' => 'Versi satu'], 'publish' => true, 'expected_published_id' => null])->assertOk()->json('data.id');
        $this->postAction('/admin/cms', ['section_key' => 'landing', 'payload' => ['heroTitle' => 'Versi stale'], 'publish' => true, 'expected_published_id' => null])->assertUnprocessable();
        $this->assertSame($first, CmsContent::where('section_key', 'landing')->where('status', 'PUBLISHED')->value('id'));
        $this->get('/admin/cms/'.$first.'/preview')->assertOk()->assertSee('Versi satu');
        $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==');
        $image = UploadedFile::fake()->createWithContent('hero.png', $bytes);
        $url = $this->post('/admin/assets', ['file' => $image], ['Accept' => 'application/json'])->assertCreated()->json('data.url');
        $this->get($url)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->login($this->patient);
        $this->get('/admin/cms/'.$first.'/preview')->assertForbidden();
    }

    public function test_late_cash_correction_keeps_historical_closed_plan_and_new_active_plan(): void
    {
        $appointment = $this->booking('PSYCHOTHERAPY_SESSION');
        $payment = $this->cash($appointment, 2000000);
        $oldPlan = $appointment->treatment_plan_id;
        for ($i = 0; $i < 4; $i++) {
            $day = 26 + $i;
            $this->finish($appointment, "2026-10-{$day}T11:00:00+07:00", "2026-10-{$day}T12:00:00+07:00");
            if ($i < 3) {
                $next = $day + 1;
                $appointment = app(Operations::class)->next($this->admin, $appointment->refresh(), ['start_at' => "2026-10-{$next}T11:00:00+07:00", 'duration_minutes' => 60]);
            }
        }
        $new = $this->booking('PSYCHOTHERAPY_SESSION', '2026-10-31T11:00:00+07:00');
        app(FinancialActions::class)->correct($this->admin, $payment, ['correct_amount' => 0, 'received_at' => '2026-10-26T05:00:00+07:00', 'reason' => 'Penerimaan lama ternyata salah input']);
        $historical = TreatmentPlan::findOrFail($oldPlan);
        $this->assertSame('AWAITING_SETTLEMENT', $historical->status->value);
        $this->assertNotNull($historical->administrative_closed_at);
        $this->assertSame('ACTIVE', TreatmentPlan::findOrFail($new->treatment_plan_id)->status->value);
        $this->assertSame(1, Receipt::count());
    }

    public function test_no_show_rights_expire_without_collecting_unserved_remainder(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 450000);
        $this->clock('2026-10-26T11:16:00+07:00');
        app(Operations::class)->lifecycle($this->admin, app(Operations::class)->lock($appointment->id), 'no-show', 'Tidak hadir');
        $this->clock('2026-10-31T00:01:00+07:00');
        app(Clockwork::class)->tick();
        $balance = app(Billing::class)->balance(app(Billing::class)->account($appointment));
        $this->assertSame(0, $balance['remaining_amount']);
        $this->assertSame(450000, $balance['verified_received']);
        $this->assertNotNull($appointment->refresh()->terminal_at);
    }

    public function test_export_uses_frozen_schedule_snapshot_and_private_download_policy(): void
    {
        Storage::fake('local');
        $appointment = $this->booking();
        $job = app(Reports::class)->export($this->admin, ['kind' => 'SCHEDULE', 'from' => '2026-10-26', 'to' => '2026-10-26', 'format' => 'CSV']);
        $this->profile->update(['full_name' => 'Nama diubah setelah ekspor']);
        (new GenerateExport($job->id))->handle();
        $job->refresh();
        $file = PrivateFile::findOrFail($job->file_id);
        $bytes = Storage::disk('local')->get($file->storage_key);
        $this->assertStringContainsString('Pasien Uji', $bytes);
        $this->assertStringNotContainsString('Nama diubah', $bytes);
        $this->assertStringNotContainsString('remaining_amount', $bytes);
        $this->login($this->patient);
        $this->get('/files/'.$file->id.'/download')->assertNotFound();
        $this->login($this->admin);
        $this->get('/files/'.$file->id.'/download')->assertOk();
    }

    public function test_each_receipt_has_a_distinct_outbox_event_and_context(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 450000);
        $this->cash($appointment, 450000);
        $this->assertSame(2, NotificationOutbox::where('event_type', 'PAYMENT_VERIFIED')->count());
        app(Notifications::class)->fanOut();
        $data = app(WorkspaceData::class)->for($this->patient);
        $notifications = collect($data['notifications'])->where('label', 'PAYMENT_VERIFIED');
        $this->assertCount(2, $notifications);
        $this->assertStringContainsString($appointment->booking_code, $notifications->first()['detail']);
    }

    public function test_privacy_acceptance_cannot_replace_service_consent(): void
    {
        $version = PackageVersion::whereIn('package_id', ConsultationPackage::where('service_code', 'COUNSELING_OFFLINE')->select('id'))->firstOrFail();
        $document = CmsContent::where('section_key', 'privacy')->firstOrFail();
        $privacy = Consent::create(['patient_id' => $this->profile->id, 'actor_user_id' => $this->patient->id, 'accepted_by_name_snapshot' => 'Pasien Uji', 'recorded_by_user_id' => $this->patient->id, 'document_key' => 'privacy', 'document_version' => $document->version, 'accepted_at' => now(), 'acceptance_source' => 'SELF', 'cms_content_id' => $document->id]);
        $submission = PretestSubmission::create(['patient_id' => $this->profile->id, 'template_id' => PretestTemplate::firstOrFail()->id, 'author_user_id' => $this->patient->id, 'answers' => ['complaint' => 'Konteks sesi'], 'status' => 'SUBMITTED', 'submitted_at' => now()]);
        $input = ['patient_id' => $this->profile->id, 'package_version_id' => $version->id, 'start_at' => '2026-10-26T11:00:00+07:00', 'pretest_submission_id' => $submission->id, 'consent_id' => $privacy->id];
        $input['quote_token'] = app(Bookings::class)->quote($this->patient, $input)['quote_token'];
        $this->login($this->patient);
        $this->postAction('/appointments', $input)->assertUnprocessable();
        $this->assertSame(0, Appointment::count());
    }

    public function test_expense_correction_to_zero_is_a_reversal_without_a_fake_new_expense(): void
    {
        $this->login($this->owner);
        $input = ['expense_date' => '2026-10-26', 'category' => 'OTHER', 'description' => 'Salah catat biaya', 'amount' => 100000, 'reason' => 'Pengeluaran awal dicatat'];
        $id = $this->postAction('/superadmin/expenses', $input)->assertOk()->json('data.id');
        $this->postAction('/superadmin/expenses/'.$id.'/corrections', [...$input, 'amount' => 0, 'reason' => 'Sebenarnya belum ada pengeluaran'])->assertOk();
        $this->assertSame(2, Expense::count());
        $this->assertSame(0, app(Reports::class)->finance($this->owner, '2026-10-26', '2026-10-26')['expenses']);
    }

    public function test_twelve_working_hour_sla_confirms_schedule_without_fabricating_cash(): void
    {
        $appointment = $this->booking('COUNSELING_OFFLINE', '2026-10-28T11:00:00+07:00');
        $this->clock('2026-10-26T08:00:00+07:00');
        $file = PrivateFile::create(['storage_key' => 'tests/sla-proof', 'mime_type' => 'application/pdf', 'size_bytes' => 10, 'uploaded_by' => $this->patient->id, 'uploaded_at' => now(), 'expires_at' => now()->addYear(), 'purpose' => 'PAYMENT_PROOF', 'checksum_sha256' => str_repeat('c', 64)]);
        $payment = app(Billing::class)->submit($this->patient, $appointment, 450000, $file->id, 'TRANSFER', 'Pasien');
        $this->clock('2026-10-27T12:01:00+07:00');
        app(Clockwork::class)->tick();
        $this->assertSame('CONFIRMED_AUTO_SLA', $appointment->refresh()->status->value);
        $this->assertSame('PENDING_RECONCILIATION', $payment->refresh()->status->value);
        $this->assertNull($payment->amount);
        $this->assertSame(0, Receipt::count());
    }

    public function test_case_closure_cannot_bypass_no_show_rights_or_revive_released_billing(): void
    {
        $appointment = $this->booking('ASSESSMENT_FULL');
        $this->cash($appointment, 750000);
        $operations = app(Operations::class);
        $this->clock('2026-10-26T11:16:00+07:00');
        $operations->lifecycle($this->admin, $operations->lock($appointment->id), 'no-show', 'Tidak hadir setelah pemeriksaan');
        $case = AssessmentCase::findOrFail($appointment->assessment_case_id);
        $this->login($this->owner);
        $this->postAction('/superadmin/assessment-cases/'.$case->id.'/close', ['expected_version' => $case->row_version, 'reason' => 'Mencoba penutupan terlalu awal'])->assertUnprocessable();
        $this->assertNotSame('CLOSED', $case->refresh()->status->value);
        $operations->lifecycle($this->owner, $operations->lock($appointment->id), 'cancel', 'Layanan dibatalkan sebelum diberikan');
        $this->postAction('/superadmin/assessment-cases/'.$case->id.'/reopen', ['expected_version' => $case->refresh()->row_version, 'reason' => 'Mencoba menghidupkan case dilepas'])->assertUnprocessable();
        $this->assertSame('CLOSED', $case->refresh()->status->value);
    }

    public function test_full_cms_fields_publish_to_guest_and_workspace_without_price_leak(): void
    {
        $this->login($this->admin);
        $payload = ['heroTitle' => 'Layanan kami', 'ctaTitle' => 'CTA_KUSTOM', 'ctaSubtitle' => 'Pilih waktu tersedia', 'footerText' => 'FOOTER_KUSTOM', 'faqs' => [['q' => 'FAQ_KUSTOM', 'a' => 'Jawaban administrasi']]];
        $id = $this->postAction('/admin/cms', ['section_key' => 'landing', 'payload' => $payload, 'publish' => true, 'expected_published_id' => null])->assertOk()->json('data.id');
        $this->get('/admin/cms/'.$id.'/preview')->assertOk()->assertDontSee('normal_price');
        $this->postAction('/admin/cms', ['section_key' => 'landing', 'payload' => ['heroTitle' => 'Tarif Rp900000'], 'publish' => true, 'expected_published_id' => $id])->assertUnprocessable();
        $this->postAction('/admin/cms', ['section_key' => 'patient', 'payload' => ['title' => 'INFO_PASIEN', 'body' => 'Informasi administrasi terbaru'], 'publish' => true, 'expected_published_id' => null])->assertOk();
        $this->login($this->patient);
        $this->getJson('/work/data')->assertOk()->assertJsonPath('data.workspace_information.payload.title', 'INFO_PASIEN');
        Auth::logout();
        $this->get('/')->assertOk()->assertSee('CTA_KUSTOM')->assertSee('FAQ_KUSTOM')->assertDontSee('normal_price');
    }

    public function test_tutorial_versions_progress_and_permissions_are_enforced(): void
    {
        $this->login($this->admin);
        $input = ['content_key' => 'panduan-baru', 'role' => 'PATIENT', 'title' => 'Panduan baru', 'steps' => ['Langkah satu', 'Langkah dua'], 'video_url' => null, 'is_active' => true, 'expected_latest_id' => null, 'reason' => 'Materi awal'];
        $id = $this->postAction('/admin/tutorials', $input)->assertOk()->json('data.id');
        $this->postAction('/admin/tutorials', [...$input, 'role' => 'PSYCHOLOGIST'])->assertForbidden();
        $this->login($this->patient);
        $this->postAction('/tutorial-progress/'.$id, ['last_step' => 1, 'expected_version' => 0])->assertOk();
        $progress = TutorialProgress::where('tutorial_content_id', $id)->firstOrFail();
        $this->postAction('/tutorial-progress/'.$id, ['last_step' => 2, 'completed' => true, 'expected_version' => 0])->assertUnprocessable();
        $this->postAction('/tutorial-progress/'.$id, ['last_step' => 2, 'completed' => true, 'expected_version' => $progress->row_version])->assertOk();
        $this->assertNotNull($progress->refresh()->completed_at);
        $this->login($this->admin);
        $new = $this->postAction('/admin/tutorials', [...$input, 'expected_latest_id' => $id, 'steps' => ['Materi diperbarui']])->assertOk()->json('data.id');
        $this->assertFalse(TutorialContent::findOrFail($id)->is_active);
        $this->login($this->patient);
        $data = $this->getJson('/work/data')->assertOk()->json('data.tutorials');
        $this->assertTrue(collect($data)->contains(fn ($t) => $t['id'] === $new && $t['progress'] === null));
    }

    public function test_google_jwt_verification_checks_signature_audience_expiry_and_nonce(): void
    {
        $client = 'test.apps.googleusercontent.com';
        config(['integrations.google.enabled' => true, 'integrations.google.client_id' => $client]);
        $opensslConfig = dirname(PHP_BINARY).'/extras/ssl/openssl.cnf';
        $options = is_file($opensslConfig) ? ['config' => $opensslConfig] : [];
        $key = openssl_pkey_new([...$options, 'private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        $this->assertNotFalse($key);
        openssl_pkey_export($key, $private, null, $options);
        $rsa = openssl_pkey_get_details($key)['rsa'];
        $b64 = fn ($v) => rtrim(strtr(base64_encode($v), '+/', '-_'), '=');
        Http::fake(['https://www.googleapis.com/oauth2/v3/certs' => Http::response(['keys' => [['kty' => 'RSA', 'alg' => 'RS256', 'use' => 'sig', 'kid' => 'test-key', 'n' => $b64($rsa['n']), 'e' => $b64($rsa['e'])]]])]);
        $claims = ['iss' => 'https://accounts.google.com', 'aud' => $client, 'sub' => 'stable-google-id', 'email' => 'new@example.test', 'email_verified' => true, 'name' => 'Nama Google', 'iat' => time() - 5, 'exp' => time() + 300, 'nonce' => 'server-nonce'];
        $sign = fn ($v) => JWT::encode($v, $private, 'RS256', 'test-key');
        $service = app(GoogleIdentity::class);
        $this->assertSame('stable-google-id', $service->verify($sign($claims), 'server-nonce')['sub']);
        foreach ([['aud' => 'other.apps.googleusercontent.com'], ['iss' => 'https://evil.example'], ['exp' => time() - 1], ['email_verified' => false], ['nonce' => 'wrong']] as $bad) {
            try {
                $service->verify($sign([...$claims, ...$bad]), 'server-nonce');
                $this->fail('Token tidak sah diterima');
            } catch (ValidationException) {
                $this->assertTrue(true);
            }
        }
        $forged = explode('.', $sign($claims));
        $forged[1] = $b64(json_encode([...$claims, 'sub' => 'attacker']));
        try {
            $service->verify(implode('.', $forged), 'server-nonce');
            $this->fail('Tanda tangan palsu diterima');
        } catch (ValidationException) {
            $this->assertTrue(true);
        }
    }

    public function test_google_registration_links_stable_subject_and_remembers_session_without_duplicates(): void
    {
        Auth::logout();
        $pending = ['sub' => 'google-new', 'email' => 'google-new@example.test', 'name' => 'Nama Google', 'profile' => [], 'existing_user_id' => null, 'expires_at' => time() + 600];
        $this->withSession(['google_pending' => $pending])->post('/auth/google/complete', ['name' => 'Nama Google', 'phone' => '08558589536', 'address' => 'Alamat pasien', 'privacy_accepted' => true, 'role' => 'PSYCHOLOGIST'])->assertSessionHasErrors('role');
        $this->withSession(['google_pending' => $pending])->post('/auth/google/complete', ['name' => 'Nama Google', 'phone' => '08558589536', 'address' => 'Alamat pasien', 'privacy_accepted' => true])->assertRedirect('/dashboard');
        $user = User::where('email', $pending['email'])->firstOrFail();
        $this->assertSame('PATIENT', $user->role->value);
        $this->assertNull($user->password_hash);
        $this->assertSame('+628558589536', $user->phone);
        $this->assertNotEmpty($user->remember_token);
        $this->assertSame(1, AuthIdentity::where('subject', 'google-new')->count());
        $this->assertTrue(PatientAccess::where('account_user_id', $user->id)->exists());
        $this->assertTrue(Consent::where('actor_user_id', $user->id)->where('document_key', 'privacy')->exists());
        Auth::logout();
        $request = Request::create('/');
        $request->setLaravelSession(app('session.store'));
        $result = app(GoogleIdentity::class)->prepare($request, ['sub' => 'google-new', 'email' => 'renamed@example.test', 'name' => 'Nama baru Google']);
        $this->assertSame($user->id, Auth::id());
        $this->assertSame(route('dashboard'), $result['redirect']);
        $this->assertSame(4, User::count());
    }

    public function test_google_matching_email_requires_existing_password_and_keeps_role(): void
    {
        Auth::logout();
        $pending = ['sub' => 'google-owner', 'email' => $this->owner->email, 'name' => 'Owner Google', 'profile' => [], 'existing_user_id' => $this->owner->id, 'expires_at' => time() + 600];
        $this->withSession(['google_pending' => $pending])->post('/auth/google/complete', ['current_password' => 'wrong'])->assertSessionHasErrors();
        $this->assertSame(0, AuthIdentity::count());
        $this->withSession(['google_pending' => $pending])->post('/auth/google/complete', ['current_password' => 'OwnerTest2026'])->assertRedirect('/dashboard');
        $this->assertSame($this->owner->id, Auth::id());
        $this->assertSame('PSYCHOLOGIST', $this->owner->refresh()->role->value);
        $this->assertSame(3, User::count());
        $this->post('/logout')->assertCookie('google_signed_out');
        $this->withSession(['google_oauth' => ['state' => 'real', 'expires_at' => time() + 600]])->get('/auth/google/callback?state=forged&code=x')->assertSessionHasErrors();
    }

    public function test_whatsapp_owner_profile_is_private_and_used_at_first_delivery(): void
    {
        Http::fake(['http://127.0.0.1:3210/messages' => Http::response(['id' => 'ack-owner'])]);
        config(['integrations.whatsapp.driver' => 'baileys', 'integrations.whatsapp.bridge_secret' => str_repeat('s', 64)]);
        $this->owner->update(['phone' => '+628111111111']);
        $appointment = $this->booking();
        app(Notifications::class)->fanOut();
        $notification = Notification::where('channel', 'WHATSAPP')->where('template_key', 'CREATED')->firstOrFail();
        $this->login($this->owner);
        $this->postAction('/account', ['name' => $this->owner->name, 'email' => $this->owner->email, 'phone' => '08558589536', 'expected_version' => $this->owner->refresh()->row_version])->assertSuccessful();
        app(Notifications::class)->send($notification->id);
        $notification->refresh();
        $this->assertSame('SENT', $notification->status->value);
        $this->assertSame('+628558589536', $notification->recipient_phone_snapshot);
        $this->assertSame('ack-owner', $notification->provider_reference);
        $this->assertStringContainsString($appointment->booking_code, $notification->delivery_payload['text']);
        $this->assertStringNotContainsString('Konteks rahasia', $notification->delivery_payload['text']);
        $this->assertStringNotContainsString('delivery_payload', $notification->toJson());
        $this->get('/')->assertDontSee('+628558589536');
        $this->login($this->admin);
        $this->getJson('/superadmin/whatsapp/status')->assertForbidden();
    }

    public function test_whatsapp_patient_reminder_deduplicates_and_withdrawal_cancels_queued_delivery(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 450000);
        $this->login($this->patient);
        $this->postAction('/appointments/'.$appointment->id.'/reminder-contact', ['recipient_phone' => '08558589536', 'accepted' => true, 'expected_version' => $appointment->refresh()->row_version])->assertSuccessful();
        $this->clock('2026-10-26T09:00:00+07:00');
        app(Clockwork::class)->tick();
        app(Clockwork::class)->tick();
        $rows = Notification::where('template_key', 'REMINDER_PATIENT')->where('channel', 'WHATSAPP')->get();
        $this->assertCount(1, $rows);
        $this->postAction('/appointments/'.$appointment->id.'/reminder-contact', ['accepted' => false, 'expected_version' => $appointment->refresh()->row_version])->assertSuccessful();
        Http::fake();
        app(Notifications::class)->send($rows[0]->id);
        $this->assertSame('CANCELLED', $rows[0]->refresh()->status->value);
        Http::assertNothingSent();
    }

    public function test_whatsapp_retry_preserves_payload_and_requires_acknowledgement(): void
    {
        config(['integrations.whatsapp.driver' => 'baileys', 'integrations.whatsapp.bridge_secret' => str_repeat('s', 64)]);
        $this->owner->update(['phone' => '+628111111111']);
        $appointment = $this->booking();
        app(Notifications::class)->fanOut();
        $notification = Notification::where('channel', 'WHATSAPP')->where('template_key', 'CREATED')->firstOrFail();
        Http::fake(['http://127.0.0.1:3210/messages' => Http::sequence()->push([], 200)->push(['id' => 'ack-retry'], 200)]);
        try {
            app(Notifications::class)->send($notification->id);
            $this->fail('Missing acknowledgement accepted');
        } catch (\RuntimeException) {
            $this->assertSame('RETRY', $notification->refresh()->status->value);
        }
        $body = $notification->delivery_payload;
        $appointment->update(['identity_snapshot' => ['full_name' => 'Nama dikoreksi']]);
        app(Notifications::class)->send($notification->id);
        $this->assertSame('SENT', $notification->refresh()->status->value);
        $this->assertSame($body, $notification->delivery_payload);
        $requests = Http::recorded();
        $this->assertSame($requests[0][0]->body(), $requests[1][0]->body());
    }

    public function test_whatsapp_reminder_does_not_send_after_start_and_contact_is_scoped(): void
    {
        $appointment = $this->booking();
        $this->cash($appointment, 450000);
        $this->clock('2026-10-26T09:00:00+07:00');
        app(Clockwork::class)->tick();
        $notification = Notification::where('channel', 'WHATSAPP')->where('template_key', 'REMINDER_OWNER')->firstOrFail();
        $this->clock('2026-10-26T11:01:00+07:00');
        Http::fake();
        app(Notifications::class)->send($notification->id);
        $this->assertSame('CANCELLED', $notification->refresh()->status->value);
        Http::assertNothingSent();
        $other = User::create(['name' => 'Lain', 'email' => 'other@example.test']);
        $this->login($other);
        $this->postAction('/appointments/'.$appointment->id.'/reminder-contact', ['recipient_phone' => '+628111111111', 'accepted' => true, 'expected_version' => $appointment->refresh()->row_version])->assertNotFound();
    }

    public function test_google_only_remember_cookie_restores_session_but_revocation_blocks_it(): void
    {
        $user=User::create(['name'=>'Google Only','email'=>'remember@example.test']);$user->remember_token=Str::random(60);$user->save();
        $guard=Auth::guard('web');$name=$guard->getRecallerName();$cookie=$user->id.'|'.$user->remember_token.'|'.$guard->hashPasswordForCookie($user->getAuthPassword());
        $this->assertFalse(Hash::check('anything',$user->getAuthPassword()));$this->flushSession();Auth::forgetGuards();
        $this->withCredentials()->withCookie($name,$cookie)->getJson('/work/data')->assertSuccessful()->assertSessionHas('auth_version',$user->auth_version);$this->assertSame($user->id,Auth::id());
        $user->forceFill(['status'=>'BLOCKED','auth_version'=>$user->auth_version+1,'remember_token'=>Str::random(60)])->save();$this->flushSession();Auth::forgetGuards();
        $this->withCookie($name,$cookie)->getJson('/work/data')->assertUnauthorized();
    }

    public function test_parallel_processes_cannot_book_the_same_interval(): void
    {
        // Commit only this isolated test DB so two independent PHP processes can see fixtures.
        // This method stays last; the class finally drops its own randomly named DB.
        DB::commit();
        $workers = [];
        for ($i = 0; $i < 2; $i++) {
            $pipes = [];
            $process = proc_open([PHP_BINARY, base_path('tests/Support/concurrent-booking-worker.php'), self::$database, $this->admin->id, $this->profile->id], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, base_path());
            $this->assertIsResource($process);
            fclose($pipes[0]);
            $workers[] = [$process, $pipes];
        }
        $results = [];
        foreach ($workers as [$process,$pipes]) {
            $output = stream_get_contents($pipes[1]);
            $error = stream_get_contents($pipes[2]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            $code = proc_close($process);
            $this->assertSame(0, $code, $error);
            $this->assertJson($output, 'Worker output: '.$output.'; stderr: '.$error);
            $results[] = json_decode($output, true, 512, JSON_THROW_ON_ERROR)['result'];
        }
        sort($results);
        $this->assertSame(['CONFLICT', 'CREATED'],$results);
        $this->assertSame(1,Appointment::where('custom_label','Uji benturan slot')->count());
        $this->assertSame(0,PaymentTransaction::count());
    }
}

<?php

namespace App\Domain;

use App\Models\Appointment;
use App\Models\AppointmentBillingLink;
use App\Models\AppointmentEvent;
use App\Models\AssessmentCase;
use App\Models\BillingAccount;
use App\Models\Consent;
use App\Models\ConsultationPackage;
use App\Models\PackageVersion;
use App\Models\PatientProfile;
use App\Models\PaymentAgreement;
use App\Models\PretestSubmission;
use App\Models\TreatmentPlan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

final class Bookings
{
    public function __construct(private Calendar $calendar, private Billing $billing) {}

    private function package(string $id): PackageVersion
    {
        $version = PackageVersion::findOrFail($id);
        $master = ConsultationPackage::findOrFail($version->package_id);
        $latest = PackageVersion::where('package_id', $master->id)->where('effective_at', '<=', now())->orderByDesc('version')->firstOrFail();
        Access::check($master->is_active && $version->is_bookable && $latest->id === $version->id && $version->duration_minutes > 0, 'Paket berubah atau belum dapat dipesan. Muat ulang katalog.');

        return $version;
    }

    public function quote(User $actor, array $input): array
    {
        Access::patient($actor, $input['patient_id']);
        $version = $this->package($input['package_version_id']);
        $start = $this->calendar->instant($input['start_at']);
        $settings = $this->calendar->settings();
        $online = ! Access::staff($actor);
        $this->calendar->assertNextDay($start);
        $end = $start->addMinutes($version->duration_minutes);
        $this->calendar->assertFree($start, $end, $settings->owner_user_id);
        $promo = $version->promo_price && (! $version->promo_starts_at || $version->promo_starts_at->lessThanOrEqualTo(now())) && (! $version->promo_ends_at || $version->promo_ends_at->greaterThan(now()));
        $net = $promo ? $version->promo_price : $version->normal_price;
        $minimum = min($net, 100000);
        $values = ['patient_id' => $input['patient_id'], 'package_version_id' => $version->id, 'start_at' => $start->toIso8601String(), 'end_at' => $end->toIso8601String(), 'calendar_version_id' => $this->calendar->version()->id,
            'normal_price' => $version->normal_price, 'final_price' => $net, 'minimum' => $minimum, 'hold_expires_at' => $online ? min(CarbonImmutable::now()->addHours($settings->payment_hold_hours), $start->subMinutes($settings->reminder_lead_minutes_snapshot ?? $settings->reminder_lead_minutes))->toIso8601String() : null];
        // Anchor deadline is recomputed on create; quote signature covers the stable financial/calendar fields.
        $stable = $values;
        unset($stable['hold_expires_at']);
        $values['quote_token'] = hash_hmac('sha256', json_encode($stable, JSON_THROW_ON_ERROR), config('app.key'));

        return $values;
    }

    public function create(User $actor, array $input): Appointment
    {
        $profile = PatientProfile::findOrFail($input['patient_id']);
        Access::patient($actor, $profile->id);
        $settings = $this->calendar->settings();
        $start = $this->calendar->instant($input['start_at']);
        $this->calendar->lock($settings->owner_user_id, [$start->setTimezone('Asia/Jakarta')->toDateString()]);
        $settings->refresh();
        $profile = PatientProfile::whereKey($profile->id)->lockForUpdate()->firstOrFail();
        if (! Access::staff($actor)) {
            Access::check($profile->birth_date !== null && filled($profile->phone) && filled($profile->gender), 'Lengkapi tanggal lahir, jenis kelamin dan kontak pada Profil sebelum booking.');
        }
        if (($input['appointment_kind'] ?? 'STANDARD_SERVICE') === 'CUSTOM') {
            return $this->custom($actor, $input, $profile, $start);
        }
        $quote = $this->quote($actor, $input);
        Access::check(isset($input['quote_token']) && hash_equals($quote['quote_token'], $input['quote_token']), 'Harga/kalender berubah. Tampilkan preview baru sebelum memesan.');
        $version = $this->package($quote['package_version_id']);
        $package = ConsultationPackage::findOrFail($version->package_id);
        $mode = Access::staff($actor) ? ($input['profiling_mode'] ?? 'PAPER') : 'DIGITAL';
        Access::check(in_array($mode, ['DIGITAL', 'PAPER'], true), 'Mode profiling tidak sah.');
        $submission = null;
        if ($mode === 'DIGITAL') {
            $submission = PretestSubmission::whereKey($input['pretest_submission_id'] ?? '')->lockForUpdate()->firstOrFail();
            Access::check($submission->patient_id === $profile->id && $submission->status->value === 'SUBMITTED' && ! $submission->appointment_id, 'Profiling terkirim baru milik pasien wajib.');
        } else {
            Access::check(empty($input['pretest_submission_id']), 'Profiling kertas tidak menerima jawaban digital.');
        }
        $consent = Consent::whereKey($input['consent_id'] ?? '')->lockForUpdate()->firstOrFail();
        Access::check($consent->patient_id === $profile->id && $consent->document_key === 'consent' && ! $consent->appointment_id && ! $consent->withdrawn_at, 'Persetujuan layanan pasien belum sah atau telah dipakai.');
        $case = null;
        $plan = null;
        if ($package->category->value === 'ASSESSMENT') {
            $case = AssessmentCase::create(['patient_id' => $profile->id, 'package_version_id' => $version->id, 'scope_snapshot' => ['testing' => true, 'evaluation' => $version->requires_evaluation, 'report_included' => true], 'created_by' => $actor->id]);
        }
        if ($package->category->value === 'PSYCHOTHERAPY') {
            Access::check(! TreatmentPlan::where('patient_id', $profile->id)->where('package_id', $package->id)->whereIn('status', ['ACTIVE', 'AWAITING_SETTLEMENT'])->exists(), 'Rangkaian terapi masih aktif/menunggu penyelesaian. Hubungi Admin untuk sesi lanjutan.');
            $plan = TreatmentPlan::create(['patient_id' => $profile->id, 'package_id' => $package->id, 'psychologist_id' => $settings->owner_user_id]);
        }
        $tele = $version->delivery_mode->value === 'TELE_SERVICE';
        $telePhone=$tele?Phone::normalize($input['tele_service_recipient_phone']??null):null;
        Access::check(!($input['reminder_wa_accepted']??false)||filled(Phone::normalize($input['reminder_recipient_phone']??null)),'Nomor penerima pengingat wajib jika WhatsApp disetujui.');
        Access::check(! $tele || (filled($telePhone) && ($input['wa_delivery_accepted'] ?? false)), 'Nomor WA dan penerimaan pengiriman link wajib pada Telelayanan.');
        $appointment = Appointment::create(['booking_code' => 'JS-'.strtoupper(Str::random(12)), 'patient_id' => $profile->id, 'booked_by_user_id' => $actor->id, 'psychologist_id' => $settings->owner_user_id,
            'package_version_id' => $version->id, 'assessment_case_id' => $case?->id, 'assessment_role' => $case ? 'TESTING' : null, 'assessment_sequence' => $case ? 1 : null, 'treatment_plan_id' => $plan?->id, 'session_number' => $plan ? 1 : null,
            'profiling_mode' => $mode, 'start_at' => $start, 'end_at' => $quote['end_at'], 'status' => 'WAITING_PAYMENT', 'booking_source' => Access::staff($actor) ? 'ADMIN_WALK_IN' : 'PATIENT_ONLINE', 'responsible_user_id' => Access::staff($actor) ? null : $actor->id,
            'identity_snapshot' => ['full_name' => $profile->full_name, 'phone' => $profile->phone, 'birth_date' => $profile->birth_date?->toDateString(), 'gender' => $profile->gender, 'occupation' => $profile->occupation], 'tele_service_recipient_phone' => $tele ? $telePhone : null, 'tele_service_wa_accepted_at' => $tele ? now() : null,
            'reminder_recipient_phone'=>($input['reminder_wa_accepted']??false)?Phone::normalize($input['reminder_recipient_phone']??null):$telePhone,
            'reminder_wa_accepted_at'=>(($input['reminder_wa_accepted']??false)||$tele)?now():null,
            'calendar_version_id' => $quote['calendar_version_id'], 'hold_expires_at' => $quote['hold_expires_at'], 'lead_working_minutes_snapshot' => $settings->online_lead_working_minutes, 'reminder_lead_minutes_snapshot' => $settings->reminder_lead_minutes]);
        $account = BillingAccount::create(['patient_id' => $profile->id, 'appointment_id' => $case ? null : $appointment->id, 'assessment_case_id' => $case?->id, 'initial_minimum_due' => $quote['minimum'],
            'initial_payment_policy_snapshot' => ['mode' => 'FIXED', 'fixed_amount' => 100000, 'base_net' => $quote['final_price']]]);
        $this->billing->base($actor, $account, $appointment, $quote['normal_price'], $quote['final_price'], $version->name);
        if ($plan) {
            PaymentAgreement::create(['treatment_plan_id' => $plan->id, 'first_billing_account_id' => $account->id, 'package_version_id' => $version->id, 'session_subtotal' => $quote['normal_price'],
                'session_discount' => $quote['normal_price'] - $quote['final_price'], 'session_amount' => $quote['final_price'], 'duration_minutes' => $version->duration_minutes, 'agreed_at' => now(), 'created_by' => $actor->id]);
        }
        $submission?->update(['appointment_id' => $appointment->id]);
        $consent->update(['appointment_id' => $appointment->id]);
        $this->event($actor, $appointment, 'CREATED');
        if ($tele) {
            Transactions::outbox('TELE_NEEDS_LINK', 'appointments', $appointment->id, ['patient_id' => $profile->id], 1);
        }

        return $appointment;
    }

    private function custom(User $actor, array $input, PatientProfile $profile, CarbonImmutable $start): Appointment
    {
        Access::requireOwner($actor);
        $this->calendar->assertNextDay($start);
        $settings = $this->calendar->settings();
        $end = $start->addMinutes($input['duration_minutes']);
        $this->calendar->assertFree($start, $end, $settings->owner_user_id);
        $requirement = $input['payment_requirement'];
        Access::check(filled($input['owner_authorization_note'] ?? null), 'Konteks arahan owner wajib.');
        $appointment = Appointment::create(['booking_code' => 'JS-'.strtoupper(Str::random(12)), 'patient_id' => $profile->id, 'booked_by_user_id' => $actor->id, 'psychologist_id' => $settings->owner_user_id, 'appointment_kind' => 'CUSTOM',
            'payment_requirement' => $requirement, 'custom_label' => $input['custom_label'], 'custom_notes' => $input['custom_notes'] ?? null, 'custom_fee_amount' => $requirement === 'REQUIRED' ? $input['custom_fee_amount'] : null,
            'owner_authorization_note' => $input['owner_authorization_note'], 'profiling_mode' => $input['profiling_mode'] ?? 'PAPER', 'booking_source' => 'OWNER_EXTERNAL', 'start_at' => $start, 'end_at' => $end,
            'external_agreed_at' => $input['external_agreed_at'] ?? null, 'calendar_version_id' => $this->calendar->version()->id, 'identity_snapshot' => ['full_name' => $profile->full_name, 'phone' => $profile->phone],
            'status' => $requirement === 'REQUIRED' ? 'WAITING_PAYMENT' : 'CONFIRMED']);
        if ($requirement === 'INCLUDED') {
            $account = BillingAccount::findOrFail($input['billing_account_id']);
            Access::check($account->patient_id === $profile->id, 'Billing asal bukan pasien yang sama.');
            AppointmentBillingLink::create(['appointment_id' => $appointment->id, 'billing_account_id' => $account->id, 'created_by' => $actor->id, 'reason' => $input['owner_authorization_note']]);
        } elseif ($requirement === 'REQUIRED') {
            $fee = (int) $input['custom_fee_amount'];
            Access::check($fee > 0, 'Biaya custom wajib positif.');
            $account = BillingAccount::create(['patient_id' => $profile->id, 'appointment_id' => $appointment->id, 'initial_minimum_due' => $fee, 'initial_payment_policy_snapshot' => ['mode' => 'FIXED', 'fixed_amount' => $fee, 'base_net' => $fee]]);
            $this->billing->base($actor, $account, $appointment, $fee, $fee, $input['custom_label']);
        }
        $this->event($actor, $appointment, 'CUSTOM_CREATED', $input['owner_authorization_note']);

        return $appointment;
    }

    public function event(?User $actor, Appointment $appointment, string $type, ?string $reason = null, array $before = []): void
    {
        AppointmentEvent::create(['appointment_id' => $appointment->id, 'actor_id' => $actor?->id, 'event_type' => $type, 'attempt_number' => $appointment->attempt_number ?? 1, 'old_value' => $before ?: null,
            'new_value' => ['status' => $appointment->status->value, 'start_at' => $appointment->start_at->toIso8601String(), 'end_at' => $appointment->end_at->toIso8601String()], 'reason' => $reason, 'request_id' => (string) Str::uuid()]);
        Transactions::audit($actor, 'appointment.'.$type, 'appointments', $appointment->id, [], $reason);
        Transactions::outbox($type, 'appointments', $appointment->id, ['patient_id' => $appointment->patient_id, 'attempt_number' => $appointment->attempt_number], $appointment->row_version ?? 1);
    }
}

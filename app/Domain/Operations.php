<?php

namespace App\Domain;

use App\Models\Appointment;
use App\Models\AssessmentCase;
use App\Models\BillingAccount;
use App\Models\Consent;
use App\Models\OperationalChangeImpact;
use App\Models\OwnerSetting;
use App\Models\PaymentAgreement;
use App\Models\PretestSubmission;
use App\Models\RescheduleEvent;
use App\Models\RescheduleRequest;
use App\Models\TreatmentPlan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class Operations
{
    public function __construct(private Calendar $calendar, private Billing $billing, private Bookings $bookings) {}

    public function lock(string $id, ?CarbonImmutable $target = null): Appointment
    {
        // Scheduler/CLI callers also need the mutex before the first consistent read.
        OwnerSetting::query()->lockForUpdate()->firstOrFail();
        $read = Appointment::findOrFail($id);
        $dates = [$read->start_at->setTimezone('Asia/Jakarta')->toDateString()];
        if ($target) {
            $dates[] = $target->setTimezone('Asia/Jakarta')->toDateString();
        }
        $this->calendar->lock($read->psychologist_id, $dates);
        if ($read->treatment_plan_id) {
            TreatmentPlan::whereKey($read->treatment_plan_id)->lockForUpdate()->firstOrFail();
        }
        if ($read->assessment_case_id) {
            AssessmentCase::whereKey($read->assessment_case_id)->lockForUpdate()->firstOrFail();
        }
        $appointment = Appointment::whereKey($id)->lockForUpdate()->firstOrFail();
        Access::check($appointment->start_at->equalTo($read->start_at), 'Jadwal berubah saat diproses; muat ulang.');
        $account = $this->billing->account($appointment);
        if ($account) {
            [$source] = $this->billing->source($account);
            BillingAccount::whereIn('id', [$source->id, $account->id])->orderBy('id')->lockForUpdate()->get();
        }

        return $appointment;
    }

    public function lifecycle(User $actor, Appointment $appointment, string $action, string $reason, ?int $release = null): void
    {
        Access::requireStaff($actor);
        $state = $appointment->status->value;
        switch ($action) {
            case 'check-in':
                Access::check(in_array($state, ['CONFIRMED', 'CONFIRMED_AUTO_SLA', 'WAITING_VERIFICATION', 'WAITING_PAYMENT'], true) && ! $appointment->requires_reschedule, 'Jadwal belum dapat check-in.');
                Access::check($appointment->start_at->setTimezone('Asia/Jakarta')->toDateString() === CarbonImmutable::now('Asia/Jakarta')->toDateString(), 'Check-in hanya pada hari sesi.');
                Access::check($this->billing->initialMet($appointment), 'Periksa pembayaran dan catat penerimaan minimum dahulu.');
                if ($appointment->profiling_mode->value === 'DIGITAL') {
                    Access::check(PretestSubmission::where('appointment_id', $appointment->id)->where('status', 'SUBMITTED')->exists(), 'Profiling digital sesi ini belum dikirim pasien.');
                }
                if ($appointment->appointment_kind->value === 'STANDARD_SERVICE') {
                    $scope = Appointment::query();
                    if ($appointment->treatment_plan_id) {
                        $scope->where('treatment_plan_id', $appointment->treatment_plan_id);
                    } elseif ($appointment->assessment_case_id) {
                        $scope->where('assessment_case_id', $appointment->assessment_case_id);
                    } else {
                        $scope->whereKey($appointment->id);
                    }
                    Access::check(Consent::whereIn('appointment_id', $scope->select('id'))->where('document_key', 'consent')->whereNull('withdrawn_at')->exists(), 'Persetujuan layanan perlu diberikan kembali sebelum check-in.');
                }
                $appointment->update(['status' => 'CHECKED_IN', 'checked_in_at' => now(), 'checked_in_by' => $actor->id]);
                break;
            case 'start':
                Access::check($state === 'CHECKED_IN', 'Check-in dahulu.');
                Access::check(now()->greaterThanOrEqualTo($appointment->start_at->subMinutes(15)), 'Layanan belum waktunya dimulai.');
                Access::check(! Appointment::where('psychologist_id', $appointment->psychologist_id)->where('status', 'IN_CONSULTATION')->where('id', '<>', $appointment->id)->exists(), 'Praktisi masih melayani pasien lain.');
                if ($appointment->assessment_role?->value === 'EVALUATION') {
                    Access::check(! Appointment::where('assessment_case_id', $appointment->assessment_case_id)->where('assessment_role', 'TESTING')->where('status', '<>', 'COMPLETED')->exists(), 'Testing harus selesai sebelum evaluasi.');
                }
                $appointment->update(['status' => 'IN_CONSULTATION', 'actual_started_at' => now()]);
                if ($appointment->assessment_case_id) {
                    AssessmentCase::findOrFail($appointment->assessment_case_id)->update(['status' => 'IN_PROGRESS']);
                }break;
            case 'complete':
                Access::check($state === 'IN_CONSULTATION', 'Layanan belum dimulai.');
                $appointment->update(['status' => 'COMPLETED', 'actual_ended_at' => now(), 'terminal_at' => now()]);
                if ($appointment->assessment_case_id && ! Appointment::where('assessment_case_id', $appointment->assessment_case_id)->whereIn('status', Calendar::OCCUPYING)->exists()) {
                    AssessmentCase::findOrFail($appointment->assessment_case_id)->update(['status' => 'READY_FOR_REPORT']);
                }
                if (! $appointment->assessment_case_id && ($bill = $this->billing->account($appointment))) {
                    $bill->update(['service_terminal_at' => now(), 'download_until' => now()->addDays(7)]);
                }
                break;
            case 'no-show':
                Access::check(in_array($state, ['CONFIRMED', 'CONFIRMED_AUTO_SLA', 'WAITING_VERIFICATION'], true) && ! $appointment->requires_reschedule, 'Appointment tidak dapat dinyatakan no-show.');
                Access::check(now()->greaterThanOrEqualTo($appointment->start_at->addMinutes($this->calendar->settings()->grace_minutes)), 'Grace period belum berakhir.');
                Access::check(! RescheduleRequest::where('appointment_id', $appointment->id)->whereNotNull('active_guard')->exists(), 'Ada pengajuan sah yang belum selesai.');
                Access::check(filled($reason), 'Alasan no-show wajib.');
                $appointment->update(['status' => 'NO_SHOW']);
                break;
            case 'cancel':
                Access::check(! in_array($state, ['IN_CONSULTATION', 'COMPLETED', 'CANCELLED'], true), 'Layanan sudah berlangsung/terminal.');
                Access::check(filled($reason), 'Alasan pembatalan wajib.');
                if ($account = $this->billing->account($appointment)) {
                    $this->billing->closeUnserved($actor, $account, $reason, $release);
                }
                $scope = $appointment->assessment_case_id ? Appointment::where('assessment_case_id', $appointment->assessment_case_id) : ($appointment->treatment_plan_id ? Appointment::where('treatment_plan_id', $appointment->treatment_plan_id) : Appointment::whereKey($appointment->id));
                foreach ($scope->whereNotIn('status', ['COMPLETED', 'IN_CONSULTATION', 'CANCELLED'])->orderBy('id')->lockForUpdate()->get() as $other) {
                    if ($other->id !== $appointment->id && ($bill = $this->billing->account($other)) && $bill->id !== ($account?->id)) {
                        $this->billing->closeUnserved($actor, $bill, $reason);
                    }
                    $other->update(['status' => 'CANCELLED', 'terminal_at' => now(), 'requires_reschedule' => false, 'plan_unit_released_at' => $other->treatment_plan_id ? now() : null]);
                    foreach (RescheduleRequest::where('appointment_id', $other->id)->whereNotNull('active_guard')->get() as $request) {
                        $request->update(['status' => 'CANCELLED', 'requires_resolution' => false]);
                    }
                    foreach (OperationalChangeImpact::where('appointment_id', $other->id)->where('resolution', 'PENDING')->get() as $impact) {
                        $impact->update(['resolution' => 'CANCELLED', 'resolved_at' => now()]);
                    }
                    $this->bookings->event($actor, $other, 'CANCELLED', $reason);
                }
                if ($appointment->assessment_case_id) {
                    AssessmentCase::findOrFail($appointment->assessment_case_id)->update(['status' => 'CLOSED', 'closed_at' => now(), 'closure_reason' => $reason]);
                }
                if ($appointment->treatment_plan_id) {
                    TreatmentPlan::findOrFail($appointment->treatment_plan_id)->update(['status' => 'DISCONTINUED', 'discontinued_at' => now(), 'reason' => $reason]);
                    $this->settlePlan($appointment->treatment_plan_id);
                }

                return;
            default: abort(404);
        }
        $appointment->refresh();
        $this->bookings->event($actor, $appointment, strtoupper(str_replace('-', '_', $action)), $reason ?: null);
        if ($appointment->treatment_plan_id) {
            $this->settlePlan($appointment->treatment_plan_id);
        }
    }

    public function settlePlan(string $id): void
    {
        $plan = TreatmentPlan::whereKey($id)->lockForUpdate()->firstOrFail();
        $appointments = Appointment::where('treatment_plan_id', $id)->get();
        $allCompleted = $appointments->filter(fn ($a) => $a->status->value === 'COMPLETED')->count() >= 4;
        if (! $allCompleted && ! $plan->discontinued_at) {
            return;
        }
        $due = $appointments->sum(fn ($appointment) => ($bill = $this->billing->account($appointment)) ? $this->billing->balance($bill)['remaining_amount'] : 0);
        $plan->update(['status' => $due > 0 ? 'AWAITING_SETTLEMENT' : ($plan->discontinued_at ? 'DISCONTINUED' : 'COMPLETED'),
            'completed_at' => $plan->completed_at ?? ($allCompleted ? now() : null), 'administrative_closed_at' => $plan->administrative_closed_at ?? ($due === 0 ? now() : null)]);
    }

    public function request(User $actor, Appointment $appointment, string $reason, ?string $target, string $origin = 'PATIENT'): RescheduleRequest
    {
        Access::patient($actor, $appointment->patient_id);
        Access::check(! RescheduleRequest::where('appointment_id', $appointment->id)->whereNotNull('active_guard')->exists(), 'Sudah ada pengajuan yang belum selesai.');
        if (! Access::staff($actor)) {
            $origin = 'PATIENT';
        }
        if ($origin === 'PATIENT') {
            Access::check(RescheduleRequest::where('appointment_id', $appointment->id)->where('status', 'APPLIED')->where('quota_effect', 1)->count() < 3, 'Kuota tiga reschedule sudah terpakai.');
            $eligible = $appointment->status->value === 'NO_SHOW' ? CarbonImmutable::now()->lessThanOrEqualTo(CarbonImmutable::instance($appointment->start_at)->setTimezone('Asia/Jakarta')->addDays(4)->endOfDay()) : now()->lessThan($appointment->start_at->subHours(2));
            Access::check($eligible, 'Batas pengajuan telah berakhir.');
        }
        Access::check(! in_array($appointment->status->value, ['CANCELLED', 'EXPIRED', 'COMPLETED', 'IN_CONSULTATION'], true), 'Appointment tidak dapat dipindahkan.');
        $start = $target ? $this->calendar->instant($target) : null;
        if ($start && ! Access::staff($actor)) {
            Access::check($start->greaterThanOrEqualTo($this->calendar->addWorkingMinutes(CarbonImmutable::now(), $this->calendar->settings()->online_lead_working_minutes)), 'Target belum memenuhi tiga jam kerja.');
        }
        $duration = (int) $appointment->start_at->diffInMinutes($appointment->end_at);
        $request = RescheduleRequest::create(['appointment_id' => $appointment->id, 'requested_by' => $actor->id, 'origin' => $origin, 'requested_at' => now(), 'eligibility_checked_at' => now(), 'appointment_version' => $appointment->row_version,
            'appointment_attempt_number' => $appointment->attempt_number, 'old_interval' => ['start_at' => $appointment->start_at->toIso8601String(), 'end_at' => $appointment->end_at->toIso8601String()],
            'requested_start_at' => $start, 'requested_end_at' => $start?->addMinutes($duration), 'reason' => $reason, 'owner_authorization_note' => $origin === 'OWNER' ? $reason : null]);
        RescheduleEvent::create(['request_id' => $request->id, 'actor_id' => $actor->id, 'to_status' => 'REQUESTED', 'reason' => $reason]);
        Transactions::outbox('RESCHEDULE_REQUESTED', 'appointments', $appointment->id, ['patient_id' => $appointment->patient_id, 'attempt_number' => $appointment->attempt_number, 'delivery_request' => $request->id], $appointment->row_version);

        return $request;
    }

    public function select(User $actor, RescheduleRequest $request, string $target): void
    {
        $appointment = Appointment::findOrFail($request->appointment_id);
        Access::patient($actor, $appointment->patient_id);
        Access::check(in_array($request->status->value, ['REQUESTED', 'APPROVED', 'SLOT_SELECTION_REQUIRED'], true), 'Pengajuan tidak dapat dipilih ulang.');
        Access::check(! $request->selection_expires_at || $request->selection_expires_at->isFuture(), 'Jendela pemilihan berakhir; hubungi Admin.');
        $start = $this->calendar->instant($target);
        if (! Access::staff($actor)) {
            Access::check($start->greaterThanOrEqualTo($this->calendar->addWorkingMinutes(CarbonImmutable::now(), $this->calendar->settings()->online_lead_working_minutes)), 'Target belum memenuhi tiga jam kerja.');
        }
        $end = $start->addMinutes((int) $appointment->start_at->diffInMinutes($appointment->end_at));
        $this->calendar->assertFree($start, $end, $appointment->psychologist_id, $appointment->id);
        $request->update(['requested_start_at' => $start, 'requested_end_at' => $end, 'status' => 'REQUESTED']);
    }

    public function review(User $actor, Appointment $appointment, RescheduleRequest $request, string $decision, string $reason): void
    {
        Access::requireStaff($actor);
        Access::check($request->appointment_id === $appointment->id, 'Pengajuan tidak sesuai appointment.');
        Access::check(in_array($request->status->value, ['REQUESTED', 'APPROVED', 'SLOT_SELECTION_REQUIRED', 'EXPIRED'], true), 'Pengajuan telah selesai.');
        $from = $request->status->value;
        if ($decision === 'reject') {
            $request->update(['status' => 'REJECTED', 'requires_resolution' => false]);
        } elseif ($decision === 'reopen') {
            $request->update(['status' => 'SLOT_SELECTION_REQUIRED', 'requires_resolution' => false, 'selection_expires_at' => now()->addHours($this->calendar->settings()->selection_window_hours)]);
        } elseif ($decision === 'approve') {
            $request->update(['status' => $request->requested_start_at ? 'APPROVED' : 'SLOT_SELECTION_REQUIRED', 'approved_by' => $actor->id, 'approved_at' => now(), 'selection_expires_at' => now()->addHours($this->calendar->settings()->selection_window_hours)]);
        } elseif ($decision === 'apply') {
            Access::check($request->status->value === 'APPROVED' && $request->requested_start_at && $request->approved_at, 'Pengajuan harus disetujui dahulu.');
            Access::check($appointment->attempt_number === $request->appointment_attempt_number, 'Usaha/jadwal telah berubah.');
            $start = CarbonImmutable::instance($request->requested_start_at);
            $end = CarbonImmutable::instance($request->requested_end_at);
            try {
                $this->calendar->assertFree($start, $end, $appointment->psychologist_id, $appointment->id);
            } catch (ValidationException) {
                $request->update(['status' => 'SLOT_SELECTION_REQUIRED', 'requires_resolution' => false, 'requested_start_at' => null, 'requested_end_at' => null]);
                RescheduleEvent::create(['request_id' => $request->id, 'actor_id' => $actor->id, 'from_status' => $from, 'to_status' => 'SLOT_SELECTION_REQUIRED', 'reason' => 'Target tidak tersedia; pilih ulang tanpa kehilangan kelayakan asal']);

                return;
            }
            if ($appointment->assessment_case_id) {
                $testing = Appointment::where('assessment_case_id', $appointment->assessment_case_id)->where('assessment_role', 'TESTING')->where('id', '<>', $appointment->id)->whereNotIn('status', ['CANCELLED', 'EXPIRED'])->max('end_at');
                $evaluation = Appointment::where('assessment_case_id', $appointment->assessment_case_id)->where('assessment_role', 'EVALUATION')->where('id', '<>', $appointment->id)->whereNotIn('status', ['CANCELLED', 'EXPIRED'])->min('start_at');
                Access::check(! ($appointment->assessment_role->value === 'EVALUATION' && $testing && $start->lessThan(CarbonImmutable::parse($testing))) && ! ($appointment->assessment_role->value === 'TESTING' && $evaluation && $end->greaterThan(CarbonImmutable::parse($evaluation))), 'Pemindahan membalik urutan testing/evaluasi.');
            }
            $status = $this->billing->initialMet($appointment) ? 'CONFIRMED' : ($appointment->verification_started_at ? 'WAITING_VERIFICATION' : 'WAITING_PAYMENT');
            $old = ['start_at' => $appointment->start_at->toIso8601String(), 'status' => $appointment->status->value];
            $appointment->update(['start_at' => $start, 'end_at' => $end, 'status' => $status, 'attempt_number' => $appointment->attempt_number + 1, 'requires_reschedule' => false, 'terminal_at' => null, 'checked_in_at' => null, 'checked_in_by' => null]);
            $request->update(['status' => 'APPLIED', 'requires_resolution' => false, 'quota_effect' => $request->origin->value === 'PATIENT' ? 1 : 0, 'applied_at' => now()]);
            foreach (OperationalChangeImpact::where('appointment_id', $appointment->id)->where('resolution', 'PENDING')->get() as $impact) {
                $impact->update(['resolution' => 'RESCHEDULED', 'resolved_at' => now()]);
            }
            $this->bookings->event($actor, $appointment, 'RESCHEDULED', $reason, $old);
        } else {
            abort(404);
        }
        RescheduleEvent::create(['request_id' => $request->id, 'actor_id' => $actor->id, 'from_status' => $from, 'to_status' => $request->status->value, 'reason' => $reason]);
    }

    public function next(User $actor, Appointment $previous, array $input): Appointment
    {
        Access::requireStaff($actor);
        $start = $this->calendar->instant($input['start_at']);
        $version = $previous->package_version_id;
        Access::check($previous->status->value === 'COMPLETED' && $this->billing->initialMet($previous), 'Sesi sebelumnya harus selesai dan minimum awal verified.');
        $plan = $previous->treatment_plan_id ? TreatmentPlan::findOrFail($previous->treatment_plan_id) : null;
        $case = $previous->assessment_case_id ? AssessmentCase::findOrFail($previous->assessment_case_id) : null;
        Access::check(($plan && $plan->status->value === 'ACTIVE') || ($case && $case->status->value !== 'CLOSED'), 'Tidak ada rangkaian aktif untuk lanjutan.');
        $number = $plan ? $previous->session_number + 1 : null;
        Access::check(! $plan || ($number <= 4 && ! Appointment::where('treatment_plan_id', $plan->id)->where('session_number', $number)->whereNull('plan_unit_released_at')->exists()), 'Sesi berikutnya sudah ada atau batas empat sesi tercapai.');
        $agreement = $plan ? PaymentAgreement::where('treatment_plan_id', $plan->id)->firstOrFail() : null;
        $duration = $plan ? $agreement->duration_minutes : $input['duration_minutes'];
        $end = $start->addMinutes($duration);
        Access::check($start->greaterThanOrEqualTo($previous->end_at), 'Lanjutan tidak boleh mendahului sesi sebelumnya.');
        $this->calendar->assertFree($start, $end, $previous->psychologist_id);
        $appointment = Appointment::create(['booking_code' => 'JS-'.strtoupper(Str::random(12)), 'patient_id' => $previous->patient_id, 'booked_by_user_id' => $actor->id, 'psychologist_id' => $previous->psychologist_id, 'package_version_id' => $agreement?->package_version_id ?? $version,
            'assessment_case_id' => $case?->id, 'assessment_role' => $case ? ($input['assessment_role'] ?? 'EVALUATION') : null, 'assessment_sequence' => $case ? (int) Appointment::where('assessment_case_id', $case->id)->max('assessment_sequence') + 1 : null, 'treatment_plan_id' => $plan?->id, 'session_number' => $number,
            'payment_requirement' => $case ? 'INCLUDED' : 'REQUIRED', 'profiling_mode' => $previous->packageVersion->delivery_mode->value === 'TELE_SERVICE' ? 'DIGITAL' : ($input['profiling_mode'] ?? 'PAPER'), 'start_at' => $start, 'end_at' => $end, 'status' => 'CONFIRMED', 'booking_source' => 'ADMIN_ASSISTED', 'identity_snapshot' => $previous->identity_snapshot, 'calendar_version_id' => $this->calendar->version()->id,
            'tele_service_recipient_phone' => $previous->tele_service_recipient_phone, 'tele_service_wa_accepted_at' => $previous->tele_service_wa_accepted_at,'reminder_recipient_phone'=>$previous->reminder_recipient_phone,'reminder_wa_accepted_at'=>$previous->reminder_wa_accepted_at]);
        if ($plan) {
            $account = BillingAccount::create(['patient_id' => $previous->patient_id, 'appointment_id' => $appointment->id, 'initial_minimum_due' => 0, 'initial_payment_policy_snapshot' => ['mode' => 'NONE', 'source_agreement_id' => $agreement->id]]);
            $this->billing->base($actor, $account, $appointment, $agreement->session_subtotal, $agreement->session_amount, 'Psikoterapi sesi '.$number);
            $this->billing->allocate($account, $actor);
        }
        if ($case) {
            $case->update(['status' => 'IN_PROGRESS']);
        }$this->bookings->event($actor, $appointment, 'CONTINUATION');

        return $appointment;
    }
}

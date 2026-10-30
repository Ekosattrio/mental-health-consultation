<?php

namespace App\Http\Controllers;

use App\Domain\Access;
use App\Domain\Bookings;
use App\Domain\Calendar;
use App\Domain\Operations;
use App\Models\Appointment;
use App\Models\RescheduleRequest;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

final class BookingController extends DomainController
{
    private function rules(): array
    {
        return ['patient_id' => 'required|uuid', 'package_version_id' => 'required|uuid', 'start_at' => 'required|date', 'quote_token' => 'sometimes|string|max:128', 'profiling_mode' => 'sometimes|in:DIGITAL,PAPER',
            'pretest_submission_id' => 'nullable|uuid', 'consent_id' => 'sometimes|uuid', 'tele_service_recipient_phone' => 'nullable|string|max:25', 'wa_delivery_accepted' => 'sometimes|boolean', 'reminder_recipient_phone' => 'nullable|string|max:25', 'reminder_wa_accepted' => 'sometimes|boolean'];
    }

    public function preview(Request $request, Bookings $bookings): mixed
    {
        return response()->json(['data' => $bookings->quote($request->user(), $request->validate($this->rules()))]);
    }

    public function slots(Request $request, Calendar $calendar): mixed
    {
        $input = $request->validate(['date' => 'required|date_format:Y-m-d|after_or_equal:'.CarbonImmutable::now('Asia/Jakarta')->toDateString().'|before:+366 days', 'duration_minutes' => 'required|integer|min:1|max:480', 'exclude_id' => 'nullable|uuid']);
        if (! empty($input['exclude_id'])) {
            $appointment = Appointment::findOrFail($input['exclude_id']);
            Access::patient($request->user(), $appointment->patient_id);
        }

        $slots = $calendar->slots($input['date'], $input['duration_minutes'], ! Access::staff($request->user()), $input['exclude_id'] ?? null);
        if ($request->boolean('summary')) {
            $day = $calendar->intervals($input['date']);
            $booked = Appointment::where('psychologist_id', $calendar->settings()->owner_user_id)->whereIn('status', Calendar::OCCUPYING)
                ->where('start_at', '>=', $calendar->instant($input['date'].' 00:00'))->where('start_at', '<', $calendar->instant($input['date'].' 00:00')->addDay())
                ->when(!empty($input['exclude_id']), fn ($q) => $q->where('id', '<>', $input['exclude_id']))->count();
            return response()->json(['data' => ['slots' => $slots, 'limit' => $day['limit'], 'booked' => $booked, 'closed' => !$day['intervals']]]);
        }
        return response()->json(['data' => $slots]);
    }

    public function store(Request $request, Bookings $bookings): mixed
    {
        $input = $request->validate([...$this->rules(), 'quote_token' => 'required|string', 'consent_id' => 'required|uuid']);

        return $this->execute($request, 'booking.create', $input, fn () => ['id' => $bookings->create($request->user(), $input)->id]);
    }

    public function custom(Request $request, Bookings $bookings): mixed
    {
        Access::requireOwner($request->user());
        $input = $request->validate(['patient_id' => 'required|uuid', 'start_at' => 'required|date', 'duration_minutes' => 'required|integer|min:1|max:480', 'custom_label' => 'required|string|max:180', 'custom_notes' => 'nullable|string|max:1000',
            'payment_requirement' => 'required|in:REQUIRED,INCLUDED,NOT_REQUIRED', 'custom_fee_amount' => 'required_if:payment_requirement,REQUIRED|nullable|integer|min:1|max:1000000000', 'billing_account_id' => 'required_if:payment_requirement,INCLUDED|nullable|uuid',
            'owner_authorization_note' => 'required|string|max:500', 'profiling_mode' => 'required|in:PAPER,NONE', 'external_agreed_at' => 'nullable|date|before_or_equal:now']);

        return $this->execute($request, 'booking.custom', $input, fn () => ['id' => $bookings->create($request->user(), [...$input, 'appointment_kind' => 'CUSTOM'])->id]);
    }

    public function lifecycle(Request $request, string $appointment, string $action, Operations $operations): mixed
    {
        Access::requireOwner($request->user());
        $input = $request->validate(['expected_version' => 'required|integer|min:1', 'reason' => 'nullable|string|max:500', 'partial_release' => 'nullable|integer|min:0|max:1000000000', 'identity_checked' => 'required_if:action,check-in|boolean']);
        if ($action === 'check-in') {
            Access::check($request->boolean('identity_checked'), 'Pemeriksaan identitas wajib.');
        }

        return $this->execute($request, 'appointment.'.$action.'.'.$appointment, $input, function () use ($request, $operations, $appointment, $action, $input) {
            $record = $operations->lock($appointment);
            $this->version($record, $input['expected_version']);
            $operations->lifecycle($request->user(), $record, $action, $input['reason'] ?? '', $input['partial_release'] ?? null);

            return ['id' => $record->id];
        });
    }

    public function next(Request $request, string $appointment, Operations $operations): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['start_at' => 'required|date', 'duration_minutes' => 'required|integer|min:1|max:480', 'assessment_role' => 'nullable|in:TESTING,EVALUATION,FOLLOW_UP', 'expected_version' => 'required|integer|min:1']);

        return $this->execute($request, 'appointment.next.'.$appointment, $input, function () use ($request, $appointment, $operations, $input) {
            $previous = $operations->lock($appointment, app(Calendar::class)->instant($input['start_at']));
            $this->version($previous, $input['expected_version']);

            return ['id' => $operations->next($request->user(), $previous, $input)->id];
        });
    }

    public function reschedule(Request $request, string $appointment, Operations $operations): mixed
    {
        $input = $request->validate(['reason' => 'required|string|min:3|max:500', 'start_at' => 'nullable|date', 'origin' => 'sometimes|in:PATIENT,CLINIC,OWNER', 'expected_version' => 'required|integer|min:1']);

        return $this->execute($request, 'reschedule.request.'.$appointment, $input, function () use ($request, $appointment, $operations, $input) {
            $record = $operations->lock($appointment);
            Access::patient($request->user(), $record->patient_id);
            $this->version($record, $input['expected_version']);

            return ['id' => $operations->request($request->user(), $record, $input['reason'], $input['start_at'] ?? null, $input['origin'] ?? 'PATIENT')->id];
        });
    }

    public function review(Request $request, string $reschedule, string $decision, Operations $operations): mixed
    {
        $input = $request->validate(['expected_version' => 'required|integer|min:1', 'reason' => 'required|string|min:3|max:500', 'start_at' => 'nullable|date']);

        return $this->execute($request, 'reschedule.'.$decision.'.'.$reschedule, $input, function () use ($request, $reschedule, $decision, $operations, $input) {
            $read = RescheduleRequest::findOrFail($reschedule);
            $target = $input['start_at'] ?? $read->requested_start_at?->toIso8601String();
            $appointment = $operations->lock($read->appointment_id, $target ? app(Calendar::class)->instant($target) : null);
            $record = RescheduleRequest::whereKey($reschedule)->lockForUpdate()->firstOrFail();
            $this->version($record, $input['expected_version']);
            if ($decision === 'selection') {
                Access::check(filled($input['start_at'] ?? null), 'Pilih jadwal.');
                $operations->select($request->user(), $record, $input['start_at']);
            } elseif ($decision === 'cancel') {
                Access::patient($request->user(), $appointment->patient_id);
                Access::check(in_array($record->status->value, ['REQUESTED', 'APPROVED', 'SLOT_SELECTION_REQUIRED'], true), 'Pengajuan sudah final.');
                $record->update(['status' => 'CANCELLED', 'requires_resolution' => false]);
            } else {
                $operations->review($request->user(), $appointment, $record, $decision, $input['reason']);
            }

            return ['id' => $record->id];
        });
    }
}

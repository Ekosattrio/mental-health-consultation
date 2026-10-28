<?php

namespace App\Domain;

use App\Models\Appointment;
use App\Models\ExportJob;
use App\Models\OwnerSetting;
use App\Models\PaymentProof;
use App\Models\PaymentTransaction;
use App\Models\PrivateFile;
use App\Models\RescheduleRequest;
use App\Models\TreatmentPlan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

final class Clockwork
{
    public function tick(): array
    {
        if (! OwnerSetting::exists()) {
            return ['appointments' => 0, 'outbox' => 0];
        }
        $count = 0;
        foreach (Appointment::whereIn('status', Calendar::OCCUPYING)->select('id')->lazyById(100) as $candidate) {
            $id = $candidate->id;
            DB::transaction(function () use ($id, &$count) {
                $appointment = app(Operations::class)->lock($id);
                $billing = app(Billing::class);
                $activeProof = false;
                foreach (PaymentTransaction::where('appointment_id', $id)->whereIn('status', ['PENDING_VERIFICATION', 'PENDING_RECONCILIATION'])->get() as $payment) {
                    $first = PaymentProof::where('payment_transaction_id', $payment->id)->orderBy('version')->first();
                    $last = PaymentProof::where('payment_transaction_id', $payment->id)->orderByDesc('version')->first();
                    if ($first && $last?->decision->value === 'PENDING' && $appointment->hold_expires_at && $first->received_at->lessThanOrEqualTo($appointment->hold_expires_at)) {
                        $activeProof = true;
                    }
                }
                $initialExpired = $appointment->status->value === 'WAITING_PAYMENT' && $appointment->hold_expires_at?->isPast();
                $correctionExpired = $appointment->status->value === 'WAITING_VERIFICATION' && $appointment->correction_deadline_at?->isPast() && $appointment->correction_deadline_at->lessThan($appointment->start_at) && PaymentTransaction::where('appointment_id', $id)->where('status', 'REJECTED')->exists();
                if (($initialExpired || $correctionExpired) && ! $activeProof && ! $billing->initialMet($appointment)) {
                    $appointment->update(['status' => 'EXPIRED', 'terminal_at' => now(), 'plan_unit_released_at' => $appointment->treatment_plan_id ? now() : null]);
                    $bill = $billing->account($appointment);
                    if ($bill) {
                        $billing->closeUnserved(User::findOrFail(app(Calendar::class)->settings()->owner_user_id), $bill, 'SISTEM: hold berakhir tanpa pembayaran awal tepat waktu');
                    }
                    if ($appointment->treatment_plan_id && $appointment->session_number === 1 && ! Appointment::where('treatment_plan_id', $appointment->treatment_plan_id)->whereIn('status', ['COMPLETED', 'IN_CONSULTATION'])->exists()) {
                        TreatmentPlan::findOrFail($appointment->treatment_plan_id)->update(['status' => 'DISCONTINUED', 'discontinued_at' => now(), 'reason' => 'SISTEM: reservasi pertama berakhir sebelum layanan']);
                    }
                    app(Bookings::class)->event(null, $appointment, 'EXPIRED');
                    $count++;

                    return;
                }
                if ($appointment->status->value === 'WAITING_VERIFICATION' && $appointment->verification_due_at?->isPast() && $activeProof) {
                    $appointment->update(['status' => 'CONFIRMED_AUTO_SLA']);
                    foreach (PaymentTransaction::where('appointment_id', $id)->where('status', 'PENDING_VERIFICATION')->get() as $payment) {
                        $payment->update(['status' => 'PENDING_RECONCILIATION']);
                    }
                    app(Bookings::class)->event(null, $appointment, 'AUTO_SLA');
                    $count++;
                }
                if (! $appointment->requires_reschedule && $appointment->start_at->isFuture() && now()->greaterThanOrEqualTo($appointment->start_at->subMinutes($appointment->reminder_lead_minutes_snapshot)) && ($activeProof || $billing->initialMet($appointment))) {
                    Transactions::outbox('REMINDER_OWNER', 'appointments', $id, ['attempt_number' => $appointment->attempt_number], $appointment->attempt_number);
                    Transactions::outbox('REMINDER_PATIENT', 'appointments', $id, ['attempt_number' => $appointment->attempt_number, 'patient_id' => $appointment->patient_id], $appointment->attempt_number);
                }
            }, 5);
        }
        foreach (RescheduleRequest::whereIn('status', ['APPROVED', 'SLOT_SELECTION_REQUIRED'])->where('selection_expires_at', '<', now())->get() as $request) {
            DB::transaction(function () use ($request) {
                $fresh = RescheduleRequest::whereKey($request->id)->lockForUpdate()->firstOrFail();
                if (in_array($fresh->status->value, ['APPROVED', 'SLOT_SELECTION_REQUIRED'], true) && $fresh->selection_expires_at?->isPast()) {
                    $fresh->update(['status' => 'EXPIRED', 'requires_resolution' => true]);
                }
            }, 5);
        }
        foreach (Appointment::where('status', 'NO_SHOW')->whereNull('terminal_at')->select('id')->lazyById(100) as $candidate) {
            $id = $candidate->id;
            DB::transaction(function () use ($id) {
                $appointment = app(Operations::class)->lock($id);
                $end = CarbonImmutable::instance($appointment->start_at)->setTimezone('Asia/Jakarta')->addDays(4)->endOfDay();
                if ($appointment->status->value !== 'NO_SHOW' || CarbonImmutable::now()->lessThanOrEqualTo($end) || RescheduleRequest::where('appointment_id', $id)->whereNotNull('active_guard')->exists()) {
                    return;
                }
                $partial = $appointment->assessment_case_id && Appointment::where('assessment_case_id', $appointment->assessment_case_id)->where('status', 'COMPLETED')->exists();
                if ($partial) {
                    $appointment->update(['terminal_at' => now()]);
                    Transactions::outbox('NO_SHOW_REVIEW_REQUIRED', 'appointments', $id, ['patient_id' => $appointment->patient_id, 'recipient_user_id' => app(Calendar::class)->settings()->owner_user_id], $appointment->row_version);
                } else {
                    app(Operations::class)->lifecycle(User::findOrFail(app(Calendar::class)->settings()->owner_user_id), $appointment, 'cancel', 'SISTEM: hak reschedule empat hari berakhir; sisa belum diberikan dilepas');
                }
            }, 5);
        }
        $owner = OwnerSetting::firstOrFail();
        if (CarbonImmutable::now('Asia/Jakarta')->hour >= 8) {
            Transactions::outbox('DAILY_OWNER', 'owner_settings', $owner->id, ['local_date' => CarbonImmutable::now('Asia/Jakarta')->toDateString()], (int) CarbonImmutable::now('Asia/Jakarta')->format('Ymd'));
        }

        return ['appointments' => $count, 'outbox' => app(Notifications::class)->fanOut()];
    }

    public function purgeFiles(): int
    {
        $count = 0;
        foreach (PrivateFile::whereNull('purged_at')->where('expires_at', '<', now())->get() as $file) {
            DB::transaction(function () use ($file, &$count) {
                $record = PrivateFile::whereKey($file->id)->lockForUpdate()->firstOrFail();
                if (! $record->purged_at && Storage::disk('local')->delete($record->storage_key)) {
                    $record->update(['purged_at' => now()]);
                    foreach (ExportJob::where('file_id', $record->id)->where('status', 'READY')->get() as $export) {
                        $export->update(['status' => 'EXPIRED']);
                    }
                    Transactions::audit(null, 'file.purged', 'private_files', $record->id);
                    $count++;
                }
            }, 5);
        }
        // Failed transactions can leave an unreferenced private blob; remove only old files in our upload/export namespaces.
        foreach (['uploads', 'exports'] as $directory) {
            foreach (Storage::disk('local')->files($directory) as $key) {
                if (Storage::disk('local')->lastModified($key) < now()->subDay()->timestamp && ! PrivateFile::where('storage_key', $key)->exists()) {
                    Storage::disk('local')->delete($key);
                }
            }
        }

        return $count;
    }
}

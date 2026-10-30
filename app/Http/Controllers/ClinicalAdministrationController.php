<?php

namespace App\Http\Controllers;

use App\Domain\Access;
use App\Domain\Administration;
use App\Domain\Calendar;
use App\Domain\Operations;
use App\Domain\Transactions;
use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\AssessmentCase;
use App\Models\BillingAccount;
use App\Models\CmsContent;
use App\Models\Consent;
use App\Models\OwnerSetting;
use App\Models\PatientAccess;
use App\Models\PatientProfile;
use App\Models\PretestSubmission;
use App\Models\PretestTemplate;
use App\Models\ReportDelivery;
use App\Models\RescheduleRequest;
use App\Models\Review;
use App\Models\TreatmentPlan;
use App\Models\TutorialContent;
use App\Models\TutorialProgress;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

final class ClinicalAdministrationController extends DomainController
{
    public function patient(Request $request, ?string $patient = null): mixed
    {
        $input = $request->validate(['full_name' => 'required|string|max:150', 'phone' => 'nullable|string|max:25', 'birth_date' => 'nullable|date|before_or_equal:'.CarbonImmutable::now('Asia/Jakarta')->toDateString().'', 'birth_place' => 'nullable|string|max:100', 'gender' => 'nullable|string|max:30', 'address' => 'nullable|string|max:1000', 'city' => 'nullable|string|max:100', 'occupation' => 'nullable|string|max:100', 'expected_version' => 'required_with:patient|integer|min:1']);

        $input = [...$input, ...$request->validate(['emergency_contact' => 'sometimes|nullable|array:name,phone,relationship', 'emergency_contact.name' => 'nullable|string|max:150', 'emergency_contact.phone' => 'nullable|string|max:25', 'emergency_contact.relationship' => 'nullable|string|max:100'])];
        return $this->execute($request, 'patient.save.'.($patient ?? 'new'), $input, function () use ($request, $patient, $input) {
            $profile = $patient ? PatientProfile::whereKey($patient)->lockForUpdate()->firstOrFail() : null;
            if ($profile) {
                Access::patient($request->user(), $profile->id);
                $this->version($profile, $input['expected_version'] ?? 0);
            }unset($input['expected_version']);

            return ['id' => app(Administration::class)->profile($request->user(), $input, $profile)->id];
        });
    }

    public function link(Request $request, string $patient): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['account_email' => 'required|email', 'relationship' => 'required|in:SELF,PARENT,RESPONSIBLE,OTHER', 'reason' => 'required|string|min:3|max:500']);

        return $this->execute($request, 'patient.link.'.$patient, $input, function () use ($patient, $request, $input) {
            PatientProfile::findOrFail($patient);
            $user = User::where('email', $input['account_email'])->where('role', 'PATIENT')->firstOrFail();
            $access = PatientAccess::updateOrCreate(['account_user_id' => $user->id, 'patient_id' => $patient], ['relationship' => $input['relationship'], 'status' => 'ACTIVE', 'verified_by' => $request->user()->id, 'verified_at' => now(), 'reason' => $input['reason']]);
            Transactions::audit($request->user(), 'patient.access', 'patient_accesses', $access->id, [], $input['reason']);

            return ['id' => $access->id];
        });
    }

    public function pretest(Request $request): mixed
    {
        abort_if($request->user()->role === UserRole::Admin, 403);
        $input = $request->validate(['patient_id' => 'required|uuid', 'template_id' => 'required|uuid', 'answers' => 'required|array|max:30', 'submission_id' => 'nullable|uuid', 'expected_version' => 'required_with:submission_id|integer|min:1', 'appointment_id' => 'nullable|uuid', 'submit' => 'required|boolean']);
        Access::patient($request->user(), $input['patient_id']);
        $template = PretestTemplate::findOrFail($input['template_id']);
        $rules = [];
        foreach ($template->questions as $question) {
            $rules['answers.'.$question['key']] = [($question['required'] ?? false) ? 'required' : 'nullable', ($question['type'] ?? 'text') === 'boolean' ? 'boolean' : 'string', ...(($question['type'] ?? 'text') === 'boolean' ? [] : ['max:5000'])];
        }
        $request->validate($rules);
        $request->validate(['answers.eko_profile' => 'sometimes|string|json|max:10000']);
        if (isset($input['answers']['eko_profile'])) {
            $details = json_decode($input['answers']['eko_profile'], true);
            Access::check(is_array($details), 'Rincian pre-test tidak valid.');
            validator($details, [
                'patientId' => 'sometimes|in:'.$input['patient_id'], 'birthDate' => 'sometimes|nullable|date', 'gender' => 'sometimes|string|max:30', 'occupation' => 'sometimes|string|max:100',
                'emergencyContact' => 'sometimes|array:name,relationship,phone', 'emergencyContact.name' => 'sometimes|string|max:150', 'emergencyContact.relationship' => 'sometimes|string|max:100', 'emergencyContact.phone' => 'sometimes|string|max:25',
                'primaryConcerns' => 'sometimes|array|max:25', 'primaryConcerns.*' => 'string|max:200', 'concernDescription' => 'sometimes|string|max:5000',
                'currentStressLevel' => 'sometimes|integer|min:0|max:10', 'sleepQuality' => 'sometimes|in:Baik,Cukup,Buruk,Insomnia Akut', 'goals' => 'sometimes|nullable|string|max:5000',
                'previousTherapy' => 'sometimes|boolean', 'previousDiagnosis' => 'sometimes|nullable|string|max:1000', 'currentMedications' => 'sometimes|nullable|string|max:1000',
            ])->validate();
        }
        $allowed = array_column($template->questions, 'key');
        $allowed[] = 'eko_profile';
        Access::check(! array_diff(array_keys($input['answers']), $allowed), 'Jawaban mempunyai field di luar template.');

        return $this->execute($request, 'pretest.save', $input, function () use ($request, $input) {
            if (! empty($input['appointment_id'])) {
                $appointment = Appointment::findOrFail($input['appointment_id']);
                Access::check($appointment->patient_id === $input['patient_id'] && $appointment->profiling_mode->value === 'DIGITAL' && ! in_array($appointment->status->value, ['CANCELLED', 'EXPIRED', 'COMPLETED'], true), 'Appointment untuk profiling tidak sah.');
            }
            $record = ! empty($input['submission_id']) ? PretestSubmission::whereKey($input['submission_id'])->lockForUpdate()->firstOrFail() : null;
            if ($record) {
                Access::check($record->patient_id === $input['patient_id'] && $record->template_id === $input['template_id'] && $record->author_user_id === $request->user()->id && $record->status->value === 'DRAFT', 'Draft tidak dapat diubah.');
                $this->version($record, $input['expected_version']);
                $record->update(['answers' => $input['answers'], 'status' => $input['submit'] ? 'SUBMITTED' : 'DRAFT', 'submitted_at' => $input['submit'] ? now() : null]);
            } else {
                $record = PretestSubmission::create(['patient_id' => $input['patient_id'], 'appointment_id' => $input['appointment_id'] ?? null, 'template_id' => $input['template_id'], 'author_user_id' => $request->user()->id, 'answers' => $input['answers'], 'status' => $input['submit'] ? 'SUBMITTED' : 'DRAFT', 'submitted_at' => $input['submit'] ? now() : null]);
            }

            return ['id' => $record->id];
        });
    }

    public function consent(Request $request): mixed
    {
        $input = $request->validate(['patient_id' => 'required|uuid', 'cms_content_id' => 'required|uuid', 'appointment_id' => 'nullable|uuid', 'accepted' => 'accepted', 'accepted_by_name' => 'required|string|max:150']);
        Access::patient($request->user(), $input['patient_id']);

        return $this->execute($request, 'consent.record', $input, function () use ($request, $input) {
            $document = CmsContent::whereKey($input['cms_content_id'])->where('section_key', 'consent')->where('status', 'PUBLISHED')->firstOrFail();
            if (! empty($input['appointment_id'])) {
                $appointment = Appointment::findOrFail($input['appointment_id']);
                Access::check($appointment->patient_id === $input['patient_id'], 'Persetujuan tidak sesuai pasien.');
            }
            $record = Consent::create(['patient_id' => $input['patient_id'], 'appointment_id' => $input['appointment_id'] ?? null, 'actor_user_id' => Access::staff($request->user()) ? null : $request->user()->id, 'accepted_by_name_snapshot' => $input['accepted_by_name'], 'recorded_by_user_id' => $request->user()->id,
                'document_key' => $document->section_key, 'document_version' => $document->version, 'accepted_at' => now(), 'acceptance_source' => Access::staff($request->user()) ? 'ASSISTED_OFFLINE' : 'SELF', 'ip_address' => $request->ip(), 'cms_content_id' => $document->id]);

            return ['id' => $record->id];
        });
    }

    public function review(Request $request, string $billing): mixed
    {
        $input = $request->validate(['rating' => 'required|integer|min:1|max:5', 'comment' => 'nullable|string|max:2000', 'is_anonymous' => 'required|boolean']);

        return $this->execute($request, 'review.save.'.$billing, $input, fn () => ['id' => app(Administration::class)->review($request->user(), BillingAccount::whereKey($billing)->lockForUpdate()->firstOrFail(), $input)->id]);
    }

    public function moderate(Request $request, string $review): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['decision' => 'required|in:APPROVED,REJECTED', 'reason' => 'required|string|min:3|max:500', 'expected_version' => 'required|integer|min:1']);

        return $this->execute($request, 'review.moderate.'.$review, $input, function () use ($request, $review, $input) {
            $record = Review::whereKey($review)->lockForUpdate()->firstOrFail();
            $this->version($record, $input['expected_version']);
            $record->update(['status' => $input['decision'], 'moderated_by' => $request->user()->id, 'moderated_at' => now(), 'moderation_reason' => $input['reason']]);

            return ['id' => $record->id];
        });
    }

    public function caseAction(Request $request, string $case, string $action): mixed
    {
        Access::requireOwner($request->user());
        $input = $request->validate(['reason' => 'required|string|min:3|max:500', 'expected_version' => 'required|integer|min:1', 'scope_snapshot' => 'nullable|array']);

        return $this->execute($request, 'assessment.'.$action.'.'.$case, $input, function () use ($case, $action, $request, $input) {
            $record = AssessmentCase::whereKey($case)->lockForUpdate()->firstOrFail();
            $this->version($record, $input['expected_version']);
            if ($action === 'scope') {
                $record->update(['scope_snapshot' => $input['scope_snapshot'] ?? []]);
            } elseif ($action === 'close') {
                Access::check($record->status->value !== 'CLOSED', 'Case sudah ditutup.');
                Access::check(! Appointment::where('assessment_case_id', $case)->whereNotIn('status', ['COMPLETED', 'CANCELLED', 'EXPIRED'])->exists(), 'Selesaikan atau batalkan pertemuan, termasuk hak no-show, dahulu.');
                Access::check(! RescheduleRequest::whereIn('appointment_id', Appointment::where('assessment_case_id', $case)->select('id'))->whereNotNull('active_guard')->exists(), 'Selesaikan pengajuan reschedule dahulu.');
                $record->update(['status' => 'CLOSED', 'closed_at' => now(), 'closure_reason' => $input['reason']]);
                $bill = BillingAccount::where('assessment_case_id', $case)->lockForUpdate()->firstOrFail();
                $bill->update(['service_terminal_at' => now(), 'download_until' => now()->addDays(7)]);
            } elseif ($action === 'reopen') {
                Access::check($record->status->value === 'CLOSED', 'Case belum ditutup.');
                Access::check(!Appointment::where('assessment_case_id', $case)->where('status', 'CANCELLED')->exists(), 'Layanan yang dibatalkan tidak dapat dihidupkan kembali; buat booking baru.');
                $bill = BillingAccount::where('assessment_case_id', $case)->lockForUpdate()->firstOrFail();
                Access::check($bill->collection_status->value === 'OPEN', 'Case yang dibatalkan/dilepas tidak dapat dihidupkan; buat layanan baru.');
                $record->update(['status' => 'IN_PROGRESS', 'closed_at' => null, 'closure_reason' => null]);
                $bill->update(['service_terminal_at' => null, 'download_until' => null]);
            } else {
                abort(404);
            }
            Transactions::audit($request->user(), 'assessment.'.$action, 'assessment_cases', $case, [], $input['reason']);

            return ['id' => $case];
        });
    }

    public function report(Request $request, string $case): mixed
    {
        Access::requireOwner($request->user());
        $input = $request->validate(['status' => 'required|in:REQUESTED,READY,DELIVERED', 'delivered_at' => 'nullable|date|before_or_equal:now', 'administrative_note' => 'nullable|string|max:500']);

        return $this->execute($request, 'assessment.report.'.$case, $input, function () use ($request, $case, $input) {
            $bill = BillingAccount::where('assessment_case_id', $case)->lockForUpdate()->firstOrFail();
            Access::check($input['status'] !== 'DELIVERED' || filled($input['delivered_at'] ?? null), 'Waktu penyerahan wajib.');
            $record = ReportDelivery::updateOrCreate(['billing_account_id' => $bill->id], ['assessment_case_id' => $case, 'included' => true, 'status' => $input['status'], 'delivery_method' => 'OFFLINE', 'issued_by' => $request->user()->id, 'delivered_at' => ! empty($input['delivered_at']) ? app(Calendar::class)->instant($input['delivered_at']) : null, 'administrative_note' => $input['administrative_note'] ?? null]);

            return ['id' => $record->id];
        });
    }

    public function tutorial(Request $request, string $tutorial): mixed
    {
        $input = $request->validate(['last_step' => 'required|integer|min:0|max:100', 'completed' => 'sometimes|boolean', 'skipped' => 'sometimes|boolean', 'restart' => 'sometimes|boolean', 'expected_version' => 'required|integer|min:0']);
        $content = TutorialContent::whereKey($tutorial)->where('is_active', true)->where('role', $request->user()->role->value)->firstOrFail();

        return $this->execute($request, 'tutorial.progress.'.$tutorial, $input, function () use ($request, $content, $input) {
            Access::check($input['last_step'] <= count($content->steps), 'Langkah di luar materi.');
            $record = TutorialProgress::where('user_id', $request->user()->id)->where('tutorial_content_id', $content->id)->lockForUpdate()->first();
            Access::check(($record?->row_version ?? 0) === $input['expected_version'], 'Progres panduan telah berubah. Muat ulang.');
            $values = ['last_step' => $input['last_step'], 'completed_at' => ($input['completed'] ?? false) ? now() : null, 'skipped_at' => ($input['skipped'] ?? false) ? now() : null];
            if (! ($input['restart'] ?? false) && $record) {
                $values['last_step'] = max($record->last_step, $input['last_step']);
                $values['completed_at'] = $record->completed_at ?? $values['completed_at'];
            }
            if ($record) {
                $record->update($values);
            } else {
                $record = TutorialProgress::create([...$values, 'user_id' => $request->user()->id, 'tutorial_content_id' => $content->id]);
            }

return ['id' => $record->id];
        });
    }

    public function tutorialContent(Request $request): mixed
    {
        Access::requireOwner($request->user());
        $input = $request->validate(['content_key' => 'required|regex:/^[A-Za-z0-9_-]{1,80}$/', 'role' => 'required|in:GUEST,PATIENT,ADMIN,PSYCHOLOGIST', 'title' => 'required|string|max:180', 'steps' => 'required|array|min:1|max:100', 'steps.*' => 'required|string|max:3000', 'video_url' => 'nullable|url:https|max:500', 'expected_latest_id' => 'present|nullable|uuid', 'is_active' => 'required|boolean', 'reason' => 'required|string|min:3|max:500']);
        if ($input['role'] === 'PSYCHOLOGIST' || str_starts_with(strtolower($input['content_key']), 'clinical')) {
            Access::requireOwner($request->user());
        }

        return $this->execute($request, 'tutorial.content', $input, function () use ($request, $input) {
            $latest = TutorialContent::where('content_key', $input['content_key'])->where('role', $input['role'])->orderByDesc('version')->first();
            Access::check($latest?->id === $input['expected_latest_id'], 'Materi telah berubah; muat ulang.');
            $record = TutorialContent::create(['content_key' => $input['content_key'], 'role' => $input['role'], 'version' => ($latest?->version ?? 0) + 1, 'title' => $input['title'], 'steps' => $input['steps'], 'video_url' => $input['video_url'] ?? null, 'is_active' => $input['is_active']]);
            foreach (TutorialContent::where('content_key', $input['content_key'])->where('role', $input['role'])->where('id', '<>', $record->id)->where('is_active', true)->get() as $old) {
                $old->update(['is_active' => false]);
            }Transactions::audit($request->user(), 'tutorial.version', 'tutorial_contents', $record->id, [], $input['reason']);

            return ['id' => $record->id];
        });
    }

    public function withdraw(Request $request, string $consent): mixed
    {
        $input = $request->validate(['reason' => 'required|string|min:3|max:500']);

        return $this->execute($request, 'consent.withdraw.'.$consent, $input, function () use ($request, $consent, $input) {
            $record = Consent::whereKey($consent)->lockForUpdate()->firstOrFail();
            Access::patient($request->user(), $record->patient_id);
            if (! $record->withdrawn_at) {
                $record->update(['withdrawn_at' => now()]);
                Transactions::audit($request->user(), 'consent.withdraw', 'consents', $consent, [], $input['reason']);
            }

return ['id' => $consent];
        });
    }

    public function planAction(Request $request, string $plan, string $action): mixed
    {
        Access::requireOwner($request->user());
        $input = $request->validate(['expected_version' => 'required|integer|min:1', 'clinical_objective' => 'nullable|string|max:5000', 'reason' => 'required|string|min:3|max:500']);

        return $this->execute($request, 'plan.'.$action.'.'.$plan, $input, function () use ($request, $plan, $action, $input) {
            $anchor = Appointment::where('treatment_plan_id', $plan)->orderBy('session_number')->first();
            if ($anchor) {
                app(Operations::class)->lock($anchor->id);
            } else {
                OwnerSetting::query()->lockForUpdate()->firstOrFail();
            }
            $record = TreatmentPlan::whereKey($plan)->lockForUpdate()->firstOrFail();
            $this->version($record, $input['expected_version']);
            if ($action === 'objective') {
                $record->update(['clinical_objective' => $input['clinical_objective'] ?? null]);
            } elseif ($action === 'complete') {
                app(Operations::class)->settlePlan($plan);
                Access::check($record->refresh()->status->value === 'COMPLETED', 'Empat sesi dan kewajiban administratif harus selesai dahulu.');
            } elseif ($action === 'discontinue') {
                foreach (Appointment::where('treatment_plan_id', $plan)->get() as $session) {
                    $bill = app(\App\Domain\Billing::class)->account($session);
                    Access::check(!$bill || app(\App\Domain\Billing::class)->balance($bill)['remaining_amount'] === 0, 'Lunasi seluruh tagihan melalui Admin sebelum menghentikan layanan.');
                }
                Access::check(! Appointment::where('treatment_plan_id', $plan)->where('status', 'IN_CONSULTATION')->exists(), 'Selesaikan layanan yang sedang berlangsung dahulu.');
                $pending = Appointment::where('treatment_plan_id', $plan)->whereNotIn('status', ['COMPLETED', 'CANCELLED'])->orderBy('session_number')->first();
                if ($pending) {
                    app(Operations::class)->lifecycle($request->user(),app(Operations::class)->lock($pending->id),'cancel',$input['reason']);
                } else {
                    $record->update(['status' => 'DISCONTINUED', 'discontinued_at' => now(), 'reason' => $input['reason']]);
                    app(Operations::class)->settlePlan($plan);
                }
            } else {
                abort(404);
            }
            Transactions::audit($request->user(),'plan.'.$action,'treatment_plans',$plan,[],$input['reason']);

            return ['id' => $plan];
        });
    }
}

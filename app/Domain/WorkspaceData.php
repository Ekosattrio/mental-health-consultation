<?php

namespace App\Domain;

use App\Enums\UserRole;
use App\Models\AdditionalTimeEntry;
use App\Models\Appointment;
use App\Models\AppointmentEvent;
use App\Models\AssessmentCase;
use App\Models\AuditLog;
use App\Models\BillingAccount;
use App\Models\BillingLineItem;
use App\Models\CalendarVersion;
use App\Models\CmsContent;
use App\Models\Consent;
use App\Models\ConsultationPackage;
use App\Models\Expense;
use App\Models\ExportJob;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\OwnerSetting;
use App\Models\PackageVersion;
use App\Models\PatientAccess;
use App\Models\PatientProfile;
use App\Models\PaymentProof;
use App\Models\PaymentTransaction;
use App\Models\PretestSubmission;
use App\Models\PretestTemplate;
use App\Models\Receipt;
use App\Models\ReportDelivery;
use App\Models\RescheduleRequest;
use App\Models\Review;
use App\Models\TeleServiceLink;
use App\Models\TreatmentPlan;
use App\Models\TutorialContent;
use App\Models\TutorialProgress;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

final class WorkspaceData
{
    public function __construct(private Billing $billing) {}

    public function for(User $actor, array $filters = []): array
    {
        $staff = Access::staff($actor);
        $owner = $actor->role === UserRole::Superadmin;
        $admin = $actor->role === UserRole::Admin;
        $ids = $staff ? PatientProfile::pluck('id') : PatientAccess::where('account_user_id', $actor->id)->where('status', 'ACTIVE')->pluck('patient_id');
        $query = Appointment::whereIn('patient_id', $ids)->when(! empty($filters['appointment_id']), fn ($q) => $q->whereKey($filters['appointment_id']))->when(! empty($filters['status']), fn ($q) => $q->where('status', $filters['status']))->when(! empty($filters['patient_id']), fn ($q) => $q->where('patient_id', $filters['patient_id']))
            ->when(! empty($filters['date']), fn ($q) => $q->whereBetween('start_at', [app(Calendar::class)->instant($filters['date'].' 00:00'), app(Calendar::class)->instant($filters['date'].' 23:59:59')]))->orderByDesc('start_at');
        $page = $query->paginate(25, ['*'], 'page', (int) ($filters['page'] ?? 1));
        $appointments = $page->getCollection();
        $bills = [];
        $rows = [];
        foreach ($appointments as $appointment) {
            $version = $appointment->package_version_id ? PackageVersion::find($appointment->package_version_id) : null;
            $account = $this->billing->account($appointment);
            if ($account && ! isset($bills[$account->id])) {
                $bills[$account->id] = $this->bill($actor, $account);
            }
            $overtime = AdditionalTimeEntry::where('appointment_id', $appointment->id)->where('attempt_number', $appointment->attempt_number)->orderByDesc('revision')->first();
            $link = TeleServiceLink::where('appointment_id', $appointment->id)->where('attempt_number', $appointment->attempt_number)->orderByDesc('version')->first();
            $rows[] = ['id' => $appointment->id, 'row_version' => $appointment->row_version, 'booking_code' => $appointment->booking_code, 'patient_id' => $appointment->patient_id, 'patient_name' => $appointment->identity_snapshot['full_name'] ?? '',
                'package_version_id' => $appointment->package_version_id, 'package_name' => $version?->name ?? $appointment->custom_label, 'category' => $version?->package->category->value ?? 'CUSTOM', 'delivery_mode' => $version?->delivery_mode->value ?? 'OFFLINE',
                'appointment_kind' => $appointment->appointment_kind->value, 'payment_requirement' => $appointment->payment_requirement->value, 'profiling_mode' => $appointment->profiling_mode->value, 'start_at' => $appointment->start_at->toIso8601String(), 'end_at' => $appointment->end_at->toIso8601String(),
                'status' => $appointment->status->value, 'attempt_number' => $appointment->attempt_number, 'requires_reschedule' => $appointment->requires_reschedule, 'billing_account_id' => $account?->id, 'initial_requirement_met' => $this->billing->initialMet($appointment),
                'treatment_plan_id' => $appointment->treatment_plan_id, 'assessment_case_id' => $appointment->assessment_case_id, 'session_number' => $appointment->session_number, 'assessment_role' => $appointment->assessment_role?->value,
                'hold_expires_at' => $appointment->hold_expires_at?->toIso8601String(), 'correction_deadline_at' => $appointment->correction_deadline_at?->toIso8601String(),'reminder_contact'=>['phone'=>$appointment->reminder_recipient_phone,'accepted'=>(bool)$appointment->reminder_wa_accepted_at],
                'history' => AppointmentEvent::where('appointment_id', $appointment->id)->orderBy('created_at')->get()->map(fn ($e) => ['id' => $e->id, 'event_type' => $e->event_type, 'attempt_number' => $e->attempt_number, 'created_at' => $e->created_at->toIso8601String(), 'start_at' => $e->new_value['start_at'] ?? null, 'status' => $e->new_value['status'] ?? null])->all(),
                'additional_time' => ['revision' => $overtime?->revision ?? 0, 'total_minutes' => $overtime?->total_additional_minutes ?? 0], 'meeting' => $link ? ['id' => $link->id, 'version' => $link->version, 'url' => $link->meeting_url, 'recipient_phone' => $link->recipient_phone] : null];
        }
        $catalog = [];
        foreach (ConsultationPackage::when(! $staff, fn ($q) => $q->where('is_active', true))->orderBy('service_code')->get() as $package) {
            $version = PackageVersion::where('package_id', $package->id)->where('effective_at', '<=', now())->orderByDesc('version')->first();
            if (! $version) {
                continue;
            }
            $catalog[] = ['id' => $package->id, 'row_version' => $package->row_version, 'version_id' => $version->id, 'service_code' => $package->service_code, 'category' => $package->category->value, 'is_active' => $package->is_active,
                'name' => $version->name, 'description' => $version->description, 'duration_minutes' => $version->duration_minutes, 'normal_price' => $version->normal_price, 'promo_price' => $version->promo_price, 'promo_starts_at' => $version->promo_starts_at?->toIso8601String(), 'promo_ends_at' => $version->promo_ends_at?->toIso8601String(),
                'delivery_mode' => $version->delivery_mode->value, 'additional_time_price_basis' => $version->additional_time_price_basis?->value, 'benefits' => $version->benefits, 'is_bookable' => $version->is_bookable];
        }
        $profiles = PatientProfile::whereIn('id', $ids)->when(! empty($filters['search']), fn ($q) => $q->where(fn ($s) => $s->where('full_name', 'like', '%'.$filters['search'].'%')->orWhere('phone', 'like', '%'.$filters['search'].'%')))->orderBy('full_name')->limit(200)->get();
        $data = ['role' => $actor->role->value, 'account' => ['id' => $actor->id, 'name' => $actor->name, 'email' => $actor->email, 'phone' => $actor->phone, 'row_version' => $actor->row_version],
            'patients' => $profiles->map(fn ($p) => ['id' => $p->id, 'row_version' => $p->row_version, 'full_name' => $p->full_name, 'phone' => $p->phone, 'birth_date' => $p->birth_date?->toDateString(), 'birth_place' => $p->birth_place, 'gender' => $p->gender, 'address' => $p->address, 'city' => $p->city, 'occupation' => $p->occupation])->all(),
            'appointments' => $rows, 'pagination' => ['page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()], 'bills' => array_values($bills), 'packages' => $catalog,
            'reschedules' => RescheduleRequest::whereIn('appointment_id', Appointment::whereIn('patient_id', $ids)->select('id'))->orderByDesc('created_at')->limit(100)->get()->map(fn ($r) => ['id' => $r->id, 'row_version' => $r->row_version, 'appointment_id' => $r->appointment_id, 'origin' => $r->origin->value, 'status' => $r->status->value, 'requested_at' => $r->requested_at->toIso8601String(), 'start_at' => $r->requested_start_at?->toIso8601String(), 'reason' => $r->reason, 'requires_resolution' => $r->requires_resolution])->all(),
            'plans' => TreatmentPlan::whereIn('patient_id', $ids)->latest('created_at')->limit(100)->get()->map(fn ($p) => ['id' => $p->id, 'patient_id' => $p->patient_id, 'row_version' => $p->row_version, 'status' => $p->status->value, 'planned_sessions' => $p->planned_sessions, ...($owner ? ['clinical_objective' => $p->clinical_objective] : [])])->all(),
            'cases' => AssessmentCase::whereIn('patient_id', $ids)->latest('created_at')->limit(100)->get()->map(fn ($c) => ['id' => $c->id, 'patient_id' => $c->patient_id, 'row_version' => $c->row_version, 'status' => $c->status->value, 'scope' => $owner ? $c->scope_snapshot : null])->all(),
            'consent' => CmsContent::where('section_key', 'consent')->where('status', 'PUBLISHED')->first()?->only(['id', 'version', 'payload']),
            'template' => PretestTemplate::orderByDesc('effective_at')->first()?->only(['id', 'template_key', 'version', 'questions']),
            'pretests' => PretestSubmission::whereIn('patient_id', $ids)->when($owner, fn ($q) => $q->where('patient_id', $filters['patient_id'] ?? ''))->latest('created_at')->limit(50)->get()->map(fn ($p) => ['id' => $p->id, 'patient_id' => $p->patient_id, 'appointment_id' => $p->appointment_id, 'status' => $p->status->value, 'submitted_at' => $p->submitted_at?->toIso8601String(), ...(! $admin ? ['answers' => $p->answers] : [])])->all(),
            'notifications' => Notification::where('recipient_user_id', $actor->id)->where('channel', 'IN_APP')->latest('created_at')->limit(50)->get()->map(fn ($n) => $this->notification($n, $actor, $ids->all()))->all(),
            'tutorials' => TutorialContent::where('role', $actor->role->value)->where('is_active', true)->get()->map(fn ($t) => ['id' => $t->id, 'title' => $t->title, 'steps' => $t->steps, 'video_url' => $t->video_url, 'progress' => TutorialProgress::where('user_id', $actor->id)->where('tutorial_content_id', $t->id)->first()?->only(['row_version', 'last_step', 'completed_at', 'skipped_at'])])->all(),
            'reviews' => Review::whereIn('billing_account_id', BillingAccount::whereIn('patient_id', $ids)->select('id'))->latest('created_at')->limit(100)->get()->map(fn ($r) => $r->only(['id', 'billing_account_id', 'rating', 'comment', 'is_anonymous', 'status', 'row_version']))->all(),
            'setup_ready' => OwnerSetting::exists(), 'integrations' => ['google_sso' => app(GoogleIdentity::class)->ready()?'CONFIGURED':'NEEDS_CLIENT_ID', 'whatsapp' => config('integrations.whatsapp.driver', 'placeholder')]];
        $data['filters'] = $filters;
        $data['workspace_information'] = $owner || ! $staff ? CmsContent::where('section_key', $owner ? 'psychologist' : 'patient')->where('status', 'PUBLISHED')->first()?->only(['id', 'payload']) : null;
        if ($staff) {
            $data['tutorial_catalog'] = TutorialContent::when(! $owner, fn ($q) => $q->where('role', '<>', 'PSYCHOLOGIST')->where('content_key', 'not like', 'clinical%'))->orderBy('content_key')->orderByDesc('version')->get()->map(fn ($t) => $t->only(['id', 'content_key', 'role', 'version', 'title', 'steps', 'video_url', 'is_active']))->all();
        }
        $data['payment_instructions'] = OwnerSetting::first()?->practice_identity['bank_account'] ?? 'Hubungi Admin untuk instruksi transfer atau pembayaran di klinik.';
        $data['exports'] = ExportJob::where('requested_by', $actor->id)->latest('created_at')->limit(50)->get()->map(fn ($e) => $e->only(['id', 'kind', 'status', 'file_id', 'expires_at']))->all();
        $data['report_deliveries'] = ReportDelivery::whereIn('billing_account_id', BillingAccount::whereIn('patient_id', $ids)->select('id'))->get()->map(fn ($r) => $r->only(['id', 'assessment_case_id', 'status', 'delivered_at']))->all();
        $data['consent_records'] = Consent::whereIn('patient_id', $ids)->latest('accepted_at')->limit(100)->get()->map(fn ($c) => $c->only(['id', 'patient_id', 'appointment_id', 'accepted_at', 'withdrawn_at', 'accepted_by_name_snapshot']))->all();
        if ($staff) {
            $version = CalendarVersion::where('effective_at', '<=', now())->orderByDesc('version')->first();
            $data['calendar'] = $version ? ['id' => $version->id, 'version' => $version->version, 'weekly' => collect(range(1, 7))->map(fn ($day) => ['day_of_week' => $day, 'daily_limit' => (int) DB::table('weekly_schedule_limits')->where('calendar_version_id', $version->id)->where('day_of_week', $day)->value('daily_limit'),
                'intervals' => DB::table('weekly_schedules')->where('calendar_version_id', $version->id)->where('day_of_week', $day)->orderBy('start_time')->get()->map(fn ($i) => [substr($i->start_time, 0, 5), substr($i->end_time, 0, 5)])->all()])->all(), 'overrides' => DB::table('schedule_overrides')->where('calendar_version_id', $version->id)->where('local_date', '>=', CarbonImmutable::now('Asia/Jakarta')->toDateString())->get()->map(fn ($o) => ['local_date' => $o->local_date, 'mode' => $o->mode, 'daily_limit' => $o->daily_limit, 'reason' => $o->reason, 'intervals' => DB::table('schedule_override_intervals')->where('override_id', $o->id)->get()->map(fn ($i) => [substr($i->start_time, 0, 5), substr($i->end_time, 0, 5)])->all()])->all()] : null;
            $data['cms'] = CmsContent::orderByDesc('created_at')->limit(50)->get()->merge(CmsContent::where('status', 'PUBLISHED')->get())->unique('id')->sortByDesc('created_at')->values()->map(fn ($c) => $c->only(['id', 'section_key', 'version', 'payload', 'status']))->all();
            $data['deliveries'] = Notification::where('channel', '<>', 'IN_APP')->latest('created_at')->limit(50)->get()->map(fn ($n) => $n->only(['id', 'template_key', 'status', 'attempt_count', 'last_error', 'created_at']))->all();
        }
        if ($owner) {
            $data['settings'] = OwnerSetting::first()?->only(['id', 'row_version', 'practice_identity', 'initial_payment_mode', 'initial_payment_basis_points', 'initial_payment_fixed_amount', 'grace_minutes', 'selection_window_hours', 'proof_correction_hours']);
            $data['users'] = User::select('id', 'name', 'email', 'role', 'status', 'row_version')->orderBy('name')->limit(200)->get()->map(fn ($u) => $u->only(['id', 'name', 'email', 'role', 'status', 'row_version']))->all();
            $data['expenses'] = Expense::orderByDesc('expense_date')->limit(200)->get()->map(fn ($e) => $e->only(['id', 'expense_date', 'category', 'description', 'amount', 'entry_type', 'reversal_of_id', 'attachment_file_id', 'notes']))->all();
            $data['audit'] = AuditLog::latest('created_at')->limit(100)->get()->map(fn ($a) => $a->only(['id', 'actor_id', 'action', 'resource_type', 'resource_id', 'reason', 'created_at']))->all();
        }

        return $data;
    }

    private function bill(User $actor, BillingAccount $bill): array
    {
        $balance = $this->billing->balance($bill);
        [$source] = $this->billing->source($bill);
        $admin = $actor->role === UserRole::Admin;
        $invoices = Invoice::where('billing_account_id', $bill->id)->orderBy('created_at')->get();

        return ['id' => $bill->id, 'row_version' => $bill->row_version, 'patient_id' => $bill->patient_id, 'collection_status' => $bill->collection_status->value, 'total_due' => $balance['total_due'], 'initial_requirement_met' => $balance['initial_requirement_met'],
            ...(! $admin ? ['verified_received' => $balance['verified_received'], 'remaining_amount' => $balance['remaining_amount'], 'overpaid_amount' => $balance['overpaid_amount']] : []),
            'invoices' => $invoices->map(fn ($i) => ['id' => $i->id, 'number' => $i->invoice_number, 'kind' => $i->kind->value, 'net_amount' => $i->net_amount])->all(),
            'lines' => BillingLineItem::whereIn('invoice_id', $invoices->pluck('id'))->get()->map(fn ($l) => ['id' => $l->id, 'label' => $l->label, 'kind' => $l->kind->value, 'direction' => $l->direction->value, 'amount' => $l->amount])->all(),
            'payments' => PaymentTransaction::where('billing_account_id', $source->id)->orderByDesc('created_at')->get()->map(function ($p) use ($admin) {
                $proof = PaymentProof::where('payment_transaction_id', $p->id)->orderByDesc('version')->first();

                return ['id' => $p->id, 'row_version' => $p->row_version, 'status' => $p->status->value, 'entry_type' => $p->entry_type->value, 'method' => $p->method->value, 'reason' => $p->reason,
                    ...(! $admin ? ['amount' => $p->amount, 'received_at' => $p->received_at?->toIso8601String(), 'receipt_id' => Receipt::where('payment_transaction_id', $p->id)->value('id')] : []),
                    ...($p->status->value !== 'VERIFIED' ? ['claimed_amount' => $p->claimed_amount, 'sender_name' => $p->sender_name] : []), 'proof' => $proof ? ['file_id' => $proof->file_id, 'version' => $proof->version, 'decision' => $proof->decision->value] : null];
            })->all()];
    }

    private function notification(Notification $notification, User $actor, array $patientIds): array
    {
        $event = $notification->outbox;
        $appointment = null;
        if ($event?->resource_type === 'appointments') {
            $appointment = Appointment::find($event->resource_id);
        } elseif ($event?->resource_type === 'billing_accounts') {
            $bill = BillingAccount::find($event->resource_id);
            $appointment = $bill?->appointment_id ? Appointment::find($bill->appointment_id) : ($bill?->assessment_case_id ? Appointment::where('assessment_case_id', $bill->assessment_case_id)->orderBy('assessment_sequence')->first() : null);
        }
        $allowed = $appointment && in_array($appointment->patient_id, $patientIds, true);

        return ['id' => $notification->id, 'label' => $notification->template_key, 'status' => $notification->status->value, 'read_at' => $notification->read_at?->toIso8601String(), 'created_at' => $notification->created_at->toIso8601String(),
            'appointment_id' => $allowed ? $appointment->id : null, 'detail' => $allowed ? $appointment->booking_code.' · '.($appointment->identity_snapshot['full_name'] ?? 'Pasien').' · '.$appointment->start_at->setTimezone('Asia/Jakarta')->format('d/m/Y H:i').' WIB' : ($event?->event_type === 'DAILY_OWNER' ? 'Lihat jadwal hari ini melalui menu Jadwal & pembayaran.' : ''), 'reason' => $allowed ? ($event->payload['reason'] ?? null) : null];
    }
}

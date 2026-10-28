<?php

namespace App\Models;

use App\Enums\AppointmentKind;
use App\Enums\AppointmentStatus;
use App\Enums\AssessmentRole;
use App\Enums\BookingSource;
use App\Enums\PaymentRequirement;
use App\Enums\ProfilingMode;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** appointments: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class Appointment extends DomainModel
{
    protected $attributes = ['profiling_mode' => 'DIGITAL', 'attempt_number' => 1, 'status' => 'WAITING_PAYMENT', 'requires_reschedule' => false, 'appointment_kind' => 'STANDARD_SERVICE', 'payment_requirement' => 'REQUIRED', 'lead_working_minutes_snapshot' => 180, 'reminder_lead_minutes_snapshot' => 120, 'row_version' => 1];

    protected $table = 'appointments';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version', 'plan_session_guard'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'assessment_role' => AssessmentRole::class,
            'assessment_sequence' => 'integer',
            'profiling_mode' => ProfilingMode::class,
            'session_number' => 'integer',
            'plan_unit_released_at' => 'immutable_datetime',
            'attempt_number' => 'integer',
            'start_at' => 'immutable_datetime',
            'end_at' => 'immutable_datetime',
            'status' => AppointmentStatus::class,
            'booking_source' => BookingSource::class,
            'identity_snapshot' => 'array',
            'tele_service_wa_accepted_at' => 'immutable_datetime',
            'reminder_wa_accepted_at' => 'immutable_datetime',
            'hold_expires_at' => 'immutable_datetime',
            'verification_started_at' => 'immutable_datetime',
            'verification_due_at' => 'immutable_datetime',
            'correction_deadline_at' => 'immutable_datetime',
            'requires_reschedule' => 'boolean',
            'checked_in_at' => 'immutable_datetime',
            'actual_started_at' => 'immutable_datetime',
            'actual_ended_at' => 'immutable_datetime',
            'terminal_at' => 'immutable_datetime',
            'appointment_kind' => AppointmentKind::class,
            'payment_requirement' => PaymentRequirement::class,
            'custom_fee_amount' => 'integer',
            'external_agreed_at' => 'immutable_datetime',
            'lead_working_minutes_snapshot' => 'integer',
            'reminder_lead_minutes_snapshot' => 'integer',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(PatientProfile::class, 'patient_id');
    }

    public function bookedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'booked_by_user_id');
    }

    public function psychologist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }

    public function packageVersion(): BelongsTo
    {
        return $this->belongsTo(PackageVersion::class, 'package_version_id');
    }

    public function assessmentCase(): BelongsTo
    {
        return $this->belongsTo(AssessmentCase::class, 'assessment_case_id');
    }

    public function treatmentPlan(): BelongsTo
    {
        return $this->belongsTo(TreatmentPlan::class, 'treatment_plan_id');
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function calendarVersion(): BelongsTo
    {
        return $this->belongsTo(CalendarVersion::class, 'calendar_version_id');
    }

    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    public function appointmentEvents(): HasMany
    {
        return $this->hasMany(AppointmentEvent::class, 'appointment_id');
    }

    public function operationalChangeImpacts(): HasMany
    {
        return $this->hasMany(OperationalChangeImpact::class, 'appointment_id');
    }

    public function rescheduleRequests(): HasMany
    {
        return $this->hasMany(RescheduleRequest::class, 'appointment_id');
    }

    public function pretestSubmissions(): HasMany
    {
        return $this->hasMany(PretestSubmission::class, 'appointment_id');
    }

    public function consents(): HasMany
    {
        return $this->hasMany(Consent::class, 'appointment_id');
    }

    public function billingAccounts(): HasMany
    {
        return $this->hasMany(BillingAccount::class, 'appointment_id');
    }

    public function billingLineItems(): HasMany
    {
        return $this->hasMany(BillingLineItem::class, 'appointment_id');
    }

    public function additionalTimeEntries(): HasMany
    {
        return $this->hasMany(AdditionalTimeEntry::class, 'appointment_id');
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class, 'appointment_id');
    }

    public function reportDeliveries(): HasMany
    {
        return $this->hasMany(ReportDelivery::class, 'appointment_id');
    }

    public function teleServiceLinks(): HasMany
    {
        return $this->hasMany(TeleServiceLink::class, 'appointment_id');
    }

    public function appointmentBillingLinks(): HasMany
    {
        return $this->hasMany(AppointmentBillingLink::class, 'appointment_id');
    }
}

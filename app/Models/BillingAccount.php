<?php

namespace App\Models;

use App\Enums\CollectionStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** billing_accounts: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class BillingAccount extends DomainModel
{
    protected $attributes = ['collection_status' => 'OPEN', 'row_version' => 1];

    protected $table = 'billing_accounts';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'initial_minimum_due' => 'integer',
            'collection_status' => CollectionStatus::class,
            'collection_closed_at' => 'immutable_datetime',
            'service_terminal_at' => 'immutable_datetime',
            'download_until' => 'immutable_datetime',
            'initial_payment_policy_snapshot' => 'array',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(PatientProfile::class, 'patient_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function assessmentCase(): BelongsTo
    {
        return $this->belongsTo(AssessmentCase::class, 'assessment_case_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'billing_account_id');
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class, 'billing_account_id');
    }

    public function reportDeliveries(): HasMany
    {
        return $this->hasMany(ReportDelivery::class, 'billing_account_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'billing_account_id');
    }

    public function paymentAgreements(): HasMany
    {
        return $this->hasMany(PaymentAgreement::class, 'first_billing_account_id');
    }

    public function paymentAllocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class, 'billing_account_id');
    }

    public function appointmentBillingLinks(): HasMany
    {
        return $this->hasMany(AppointmentBillingLink::class, 'billing_account_id');
    }
}

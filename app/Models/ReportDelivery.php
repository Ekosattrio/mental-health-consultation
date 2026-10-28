<?php

namespace App\Models;

use App\Enums\ReportDeliveryMethod;
use App\Enums\ReportDeliveryStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** report_deliveries: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class ReportDelivery extends DomainModel
{
    protected $attributes = ['status' => 'REQUESTED', 'delivery_method' => 'OFFLINE', 'row_version' => 1];

    protected $table = 'report_deliveries';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'included' => 'boolean',
            'status' => ReportDeliveryStatus::class,
            'delivery_method' => ReportDeliveryMethod::class,
            'delivered_at' => 'immutable_datetime',
        ];
    }

    public function billingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'billing_account_id');
    }

    public function assessmentCase(): BelongsTo
    {
        return $this->belongsTo(AssessmentCase::class, 'assessment_case_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}

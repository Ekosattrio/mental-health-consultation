<?php

namespace App\Models;

use App\Enums\AssessmentCaseStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** assessment_cases: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class AssessmentCase extends DomainModel
{
    protected $attributes = ['status' => 'OPEN', 'row_version' => 1];

    protected $table = 'assessment_cases';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'status' => AssessmentCaseStatus::class,
            'scope_snapshot' => 'array',
            'closed_at' => 'immutable_datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(PatientProfile::class, 'patient_id');
    }

    public function packageVersion(): BelongsTo
    {
        return $this->belongsTo(PackageVersion::class, 'package_version_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'assessment_case_id');
    }

    public function billingAccounts(): HasMany
    {
        return $this->hasMany(BillingAccount::class, 'assessment_case_id');
    }

    public function reportDeliveries(): HasMany
    {
        return $this->hasMany(ReportDelivery::class, 'assessment_case_id');
    }
}

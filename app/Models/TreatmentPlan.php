<?php

namespace App\Models;

use App\Enums\TreatmentPlanStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** treatment_plans: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class TreatmentPlan extends DomainModel
{
    protected $attributes = ['planned_sessions' => 4, 'status' => 'ACTIVE', 'row_version' => 1];

    protected $table = 'treatment_plans';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version', 'active_plan_guard'];

    protected $hidden = ['clinical_objective'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'planned_sessions' => 'integer',
            'status' => TreatmentPlanStatus::class,
            'clinical_objective' => 'encrypted',
            'completed_at' => 'immutable_datetime',
            'administrative_closed_at' => 'immutable_datetime',
            'discontinued_at' => 'immutable_datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(PatientProfile::class, 'patient_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(ConsultationPackage::class, 'package_id');
    }

    public function psychologist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'treatment_plan_id');
    }

    public function paymentAgreements(): HasMany
    {
        return $this->hasMany(PaymentAgreement::class, 'treatment_plan_id');
    }
}

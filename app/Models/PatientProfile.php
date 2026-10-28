<?php

namespace App\Models;

use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** patient_profiles: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PatientProfile extends DomainModel
{
    protected $attributes = ['is_active' => true, 'row_version' => 1];

    protected $table = 'patient_profiles';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['emergency_contact'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'birth_date' => 'immutable_date',
            'emergency_contact' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function patientAccesses(): HasMany
    {
        return $this->hasMany(PatientAccess::class, 'patient_id');
    }

    public function assessmentCases(): HasMany
    {
        return $this->hasMany(AssessmentCase::class, 'patient_id');
    }

    public function treatmentPlans(): HasMany
    {
        return $this->hasMany(TreatmentPlan::class, 'patient_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }

    public function pretestSubmissions(): HasMany
    {
        return $this->hasMany(PretestSubmission::class, 'patient_id');
    }

    public function consents(): HasMany
    {
        return $this->hasMany(Consent::class, 'patient_id');
    }

    public function billingAccounts(): HasMany
    {
        return $this->hasMany(BillingAccount::class, 'patient_id');
    }
}

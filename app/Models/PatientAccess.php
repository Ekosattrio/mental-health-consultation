<?php

namespace App\Models;

use App\Enums\PatientAccessStatus;
use App\Enums\PatientRelationship;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** patient_accesses: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PatientAccess extends DomainModel
{
    protected $attributes = ['status' => 'ACTIVE', 'row_version' => 1];

    protected $table = 'patient_accesses';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'relationship' => PatientRelationship::class,
            'status' => PatientAccessStatus::class,
            'verified_at' => 'immutable_datetime',
        ];
    }

    public function accountUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'account_user_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(PatientProfile::class, 'patient_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}

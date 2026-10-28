<?php

namespace App\Models;

use App\Enums\ConsentSource;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** consents: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class Consent extends DomainModel
{
    protected $attributes = ['row_version' => 1];

    protected $table = 'consents';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['ip_address'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'document_version' => 'integer',
            'accepted_at' => 'immutable_datetime',
            'withdrawn_at' => 'immutable_datetime',
            'acceptance_source' => ConsentSource::class,
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

    public function actorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    public function recordedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    public function cmsContent(): BelongsTo
    {
        return $this->belongsTo(CmsContent::class, 'cms_content_id');
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(CmsContent::class, 'cms_content_id');
    }
}

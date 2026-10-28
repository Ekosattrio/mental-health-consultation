<?php

namespace App\Models;

use App\Enums\OperationalImpactResolution;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** operational_change_impacts: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class OperationalChangeImpact extends DomainModel
{
    protected $attributes = ['resolution' => 'PENDING', 'row_version' => 1];

    protected $table = 'operational_change_impacts';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'resolution' => OperationalImpactResolution::class,
            'resolved_at' => 'immutable_datetime',
        ];
    }

    public function operationalChange(): BelongsTo
    {
        return $this->belongsTo(OperationalChange::class, 'operational_change_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }
}

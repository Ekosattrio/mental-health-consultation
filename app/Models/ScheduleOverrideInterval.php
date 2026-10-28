<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** schedule_override_intervals: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class ScheduleOverrideInterval extends ImmutableDomainModel
{
    protected $table = 'schedule_override_intervals';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [

        ];
    }

    public function override(): BelongsTo
    {
        return $this->belongsTo(ScheduleOverride::class, 'override_id');
    }
}

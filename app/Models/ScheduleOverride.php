<?php

namespace App\Models;

use App\Enums\ScheduleOverrideMode;
use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** schedule_overrides: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class ScheduleOverride extends ImmutableDomainModel
{
    protected $table = 'schedule_overrides';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'local_date' => 'immutable_date',
            'mode' => ScheduleOverrideMode::class,
            'daily_limit' => 'integer',
        ];
    }

    public function calendarVersion(): BelongsTo
    {
        return $this->belongsTo(CalendarVersion::class, 'calendar_version_id');
    }

    public function scheduleOverrideIntervals(): HasMany
    {
        return $this->hasMany(ScheduleOverrideInterval::class, 'override_id');
    }
}

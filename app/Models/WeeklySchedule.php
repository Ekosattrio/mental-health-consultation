<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** weekly_schedules: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class WeeklySchedule extends ImmutableDomainModel
{
    protected $table = 'weekly_schedules';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
        ];
    }

    public function calendarVersion(): BelongsTo
    {
        return $this->belongsTo(CalendarVersion::class, 'calendar_version_id');
    }
}

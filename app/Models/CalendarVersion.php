<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** calendar_versions: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class CalendarVersion extends ImmutableDomainModel
{
    protected $table = 'calendar_versions';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'effective_at' => 'immutable_datetime',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function weeklyScheduleLimits(): HasMany
    {
        return $this->hasMany(WeeklyScheduleLimit::class, 'calendar_version_id');
    }

    public function weeklySchedules(): HasMany
    {
        return $this->hasMany(WeeklySchedule::class, 'calendar_version_id');
    }

    public function scheduleOverrides(): HasMany
    {
        return $this->hasMany(ScheduleOverride::class, 'calendar_version_id');
    }

    public function operationalChanges(): HasMany
    {
        return $this->hasMany(OperationalChange::class, 'calendar_version_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'calendar_version_id');
    }
}

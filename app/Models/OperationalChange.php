<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** operational_changes: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class OperationalChange extends ImmutableDomainModel
{
    protected $table = 'operational_changes';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'effective_at' => 'immutable_datetime',
            'before_snapshot' => 'array',
            'after_snapshot' => 'array',
        ];
    }

    public function calendarVersion(): BelongsTo
    {
        return $this->belongsTo(CalendarVersion::class, 'calendar_version_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function operationalChangeImpacts(): HasMany
    {
        return $this->hasMany(OperationalChangeImpact::class, 'operational_change_id');
    }
}

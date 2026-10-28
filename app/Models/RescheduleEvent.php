<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** reschedule_events: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class RescheduleEvent extends ImmutableDomainModel
{
    protected $table = 'reschedule_events';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [

        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(RescheduleRequest::class, 'request_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}

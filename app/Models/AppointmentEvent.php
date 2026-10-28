<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** appointment_events: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class AppointmentEvent extends ImmutableDomainModel
{
    protected $table = 'appointment_events';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'old_value' => 'array',
            'new_value' => 'array',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}

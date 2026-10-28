<?php

namespace App\Models;

use App\Enums\RescheduleOrigin;
use App\Enums\RescheduleStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** reschedule_requests: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class RescheduleRequest extends DomainModel
{
    protected $attributes = ['status' => 'REQUESTED', 'requires_resolution' => false, 'quota_effect' => 0, 'row_version' => 1];

    protected $table = 'reschedule_requests';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version', 'active_guard'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'origin' => RescheduleOrigin::class,
            'status' => RescheduleStatus::class,
            'requested_at' => 'immutable_datetime',
            'eligibility_checked_at' => 'immutable_datetime',
            'appointment_version' => 'integer',
            'appointment_attempt_number' => 'integer',
            'old_interval' => 'array',
            'requested_start_at' => 'immutable_datetime',
            'requested_end_at' => 'immutable_datetime',
            'approved_at' => 'immutable_datetime',
            'selection_expires_at' => 'immutable_datetime',
            'requires_resolution' => 'boolean',
            'applied_at' => 'immutable_datetime',
            'quota_effect' => 'integer',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rescheduleEvents(): HasMany
    {
        return $this->hasMany(RescheduleEvent::class, 'request_id');
    }
}

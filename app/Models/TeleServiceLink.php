<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** tele_service_links: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class TeleServiceLink extends ImmutableDomainModel
{
    protected $table = 'tele_service_links';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['meeting_url', 'recipient_phone'];

    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'version' => 'integer',
            'meeting_url' => 'encrypted',
            'recipient_confirmed_at' => 'immutable_datetime',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function recipientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'tele_service_link_id');
    }
}

<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** notifications: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class Notification extends DomainModel
{
    protected $attributes = ['status' => 'QUEUED', 'attempt_count' => 0, 'row_version' => 1];

    protected $table = 'notifications';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['recipient_phone_snapshot', 'provider_reference', 'delivery_payload'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'delivery_payload' => 'encrypted:array',
            'channel' => NotificationChannel::class,
            'status' => NotificationStatus::class,
            'attempt_count' => 'integer',
            'next_retry_at' => 'immutable_datetime',
            'sent_at' => 'immutable_datetime',
            'read_at' => 'immutable_datetime',
        ];
    }

    public function outbox(): BelongsTo
    {
        return $this->belongsTo(NotificationOutbox::class, 'outbox_id');
    }

    public function recipientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function teleServiceLink(): BelongsTo
    {
        return $this->belongsTo(TeleServiceLink::class, 'tele_service_link_id');
    }
}

<?php

namespace App\Models;

use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** notification_outbox: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class NotificationOutbox extends DomainModel
{
    protected $attributes = ['row_version' => 1];

    protected $table = 'notification_outbox';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['payload'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'resource_version' => 'integer',
            'payload' => 'array',
            'dispatched_at' => 'immutable_datetime',
            'available_at' => 'immutable_datetime',
        ];
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'outbox_id');
    }
}

<?php

namespace App\Models;

use App\Enums\IdempotencyStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** idempotency_requests: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class IdempotencyRequest extends DomainModel
{
    protected $attributes = ['status' => 'PROCESSING', 'row_version' => 1];

    protected $table = 'idempotency_requests';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'status' => IdempotencyStatus::class,
            'response_status' => 'integer',
            'response_snapshot' => 'array',
            'expires_at' => 'immutable_datetime',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}

<?php

namespace App\Models;

use App\Enums\ReviewStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** reviews: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class Review extends DomainModel
{
    protected $attributes = ['is_anonymous' => false, 'status' => 'PENDING_MODERATION', 'version' => 1, 'row_version' => 1];

    protected $table = 'reviews';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'rating' => 'integer',
            'is_anonymous' => 'boolean',
            'status' => ReviewStatus::class,
            'version' => 'integer',
            'moderated_at' => 'immutable_datetime',
        ];
    }

    public function billingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'billing_account_id');
    }

    public function authorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_user_id');
    }

    public function moderatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}

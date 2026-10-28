<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** receipts: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class Receipt extends ImmutableDomainModel
{
    protected $table = 'receipts';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['snapshot'];

    protected function casts(): array
    {
        return [
            'issued_at' => 'immutable_datetime',
            'snapshot' => 'array',
        ];
    }

    public function paymentTransaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class, 'payment_transaction_id');
    }

    public function correctionOfReceipt(): BelongsTo
    {
        return $this->belongsTo(Receipt::class, 'correction_of_receipt_id');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class, 'correction_of_receipt_id');
    }
}

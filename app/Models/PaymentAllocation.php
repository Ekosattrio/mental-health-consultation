<?php

namespace App\Models;

use App\Enums\AllocationEntryType;
use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** payment_allocations: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PaymentAllocation extends ImmutableDomainModel
{
    protected $attributes = ['entry_type' => 'ALLOCATION'];

    protected $table = 'payment_allocations';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'entry_type' => AllocationEntryType::class,
            'amount' => 'integer',
        ];
    }

    public function paymentTransaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class, 'payment_transaction_id');
    }

    public function billingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'billing_account_id');
    }

    public function reversalOf(): BelongsTo
    {
        return $this->belongsTo(PaymentAllocation::class, 'reversal_of_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function paymentAllocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class, 'reversal_of_id');
    }
}

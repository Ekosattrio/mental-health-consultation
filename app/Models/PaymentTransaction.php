<?php

namespace App\Models;

use App\Enums\PaymentEntryType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentPurpose;
use App\Enums\PaymentStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** payment_transactions: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PaymentTransaction extends DomainModel
{
    protected $attributes = ['entry_type' => 'RECEIPT', 'row_version' => 1];

    protected $table = 'payment_transactions';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['amount', 'claimed_amount', 'received_at', 'reference', 'sender_name'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'entry_type' => PaymentEntryType::class,
            'purpose' => PaymentPurpose::class,
            'claimed_amount' => 'integer',
            'amount' => 'integer',
            'method' => PaymentMethod::class,
            'status' => PaymentStatus::class,
            'received_at' => 'immutable_datetime',
            'verified_at' => 'immutable_datetime',
        ];
    }

    public function billingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'billing_account_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reversalOf(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class, 'reversal_of_id');
    }

    public function paymentAgreement(): BelongsTo
    {
        return $this->belongsTo(PaymentAgreement::class, 'payment_agreement_id');
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class, 'reversal_of_id');
    }

    public function paymentEvents(): HasMany
    {
        return $this->hasMany(PaymentEvent::class, 'payment_transaction_id');
    }

    public function paymentProofs(): HasMany
    {
        return $this->hasMany(PaymentProof::class, 'payment_transaction_id');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class, 'payment_transaction_id');
    }

    public function paymentAllocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class, 'payment_transaction_id');
    }
}

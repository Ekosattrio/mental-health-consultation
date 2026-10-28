<?php

namespace App\Models;

use App\Enums\ProofDecision;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** payment_proofs: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PaymentProof extends DomainModel
{
    protected $attributes = ['decision' => 'PENDING', 'row_version' => 1];

    protected $table = 'payment_proofs';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'version' => 'integer',
            'received_at' => 'immutable_datetime',
            'decision' => ProofDecision::class,
        ];
    }

    public function paymentTransaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class, 'payment_transaction_id');
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(PrivateFile::class, 'file_id');
    }
}

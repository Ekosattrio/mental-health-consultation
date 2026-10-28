<?php

namespace App\Models;

use App\Enums\AmountDirection;
use App\Enums\BillingLineKind;
use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** billing_line_items: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class BillingLineItem extends ImmutableDomainModel
{
    protected $attributes = ['direction' => 'PLUS', 'quantity' => 1];

    protected $table = 'billing_line_items';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version', 'base_service_guard'];

    protected function casts(): array
    {
        return [
            'kind' => BillingLineKind::class,
            'direction' => AmountDirection::class,
            'quantity' => 'integer',
            'unit_amount' => 'integer',
            'amount' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function referenceLine(): BelongsTo
    {
        return $this->belongsTo(BillingLineItem::class, 'reference_line_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function billingLineItems(): HasMany
    {
        return $this->hasMany(BillingLineItem::class, 'reference_line_id');
    }
}

<?php

namespace App\Models;

use App\Enums\InvoiceKind;
use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** invoices: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class Invoice extends ImmutableDomainModel
{
    protected $table = 'invoices';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version', 'base_guard'];

    protected function casts(): array
    {
        return [
            'kind' => InvoiceKind::class,
            'net_amount' => 'integer',
            'issued_at' => 'immutable_datetime',
            'identity_snapshot' => 'array',
        ];
    }

    public function billingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'billing_account_id');
    }

    public function parentInvoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'parent_invoice_id');
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issuer_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'parent_invoice_id');
    }

    public function billingLineItems(): HasMany
    {
        return $this->hasMany(BillingLineItem::class, 'invoice_id');
    }

    public function additionalTimeEntries(): HasMany
    {
        return $this->hasMany(AdditionalTimeEntry::class, 'invoice_id');
    }
}

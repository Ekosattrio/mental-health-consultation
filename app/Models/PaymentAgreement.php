<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** payment_agreements: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PaymentAgreement extends ImmutableDomainModel
{
    protected $attributes = ['session_count' => 4, 'session_discount' => 0];

    protected $table = 'payment_agreements';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'session_count' => 'integer',
            'session_subtotal' => 'integer',
            'session_discount' => 'integer',
            'session_amount' => 'integer',
            'duration_minutes' => 'integer',
            'agreed_at' => 'immutable_datetime',
            'terms_snapshot' => 'array',
        ];
    }

    public function treatmentPlan(): BelongsTo
    {
        return $this->belongsTo(TreatmentPlan::class, 'treatment_plan_id');
    }

    public function firstBillingAccount(): BelongsTo
    {
        return $this->belongsTo(BillingAccount::class, 'first_billing_account_id');
    }

    public function packageVersion(): BelongsTo
    {
        return $this->belongsTo(PackageVersion::class, 'package_version_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class, 'payment_agreement_id');
    }
}

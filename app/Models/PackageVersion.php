<?php

namespace App\Models;

use App\Enums\AdditionalTimePriceBasis;
use App\Enums\BillingMode;
use App\Enums\DeliveryMode;
use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** package_versions: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PackageVersion extends ImmutableDomainModel
{
    protected $attributes = ['delivery_mode' => 'OFFLINE', 'minimum_sessions' => 1, 'includes_result_report' => false, 'requires_evaluation' => false, 'is_bookable' => false];

    protected $table = 'package_versions';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'delivery_mode' => DeliveryMode::class,
            'duration_minutes' => 'integer',
            'duration_min_minutes' => 'integer',
            'duration_max_minutes' => 'integer',
            'normal_price' => 'integer',
            'promo_price' => 'integer',
            'promo_starts_at' => 'immutable_datetime',
            'promo_ends_at' => 'immutable_datetime',
            'additional_time_price_basis' => AdditionalTimePriceBasis::class,
            'billing_mode' => BillingMode::class,
            'minimum_sessions' => 'integer',
            'includes_result_report' => 'boolean',
            'requires_evaluation' => 'boolean',
            'benefits' => 'array',
            'is_bookable' => 'boolean',
            'effective_at' => 'immutable_datetime',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(ConsultationPackage::class, 'package_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assessmentCases(): HasMany
    {
        return $this->hasMany(AssessmentCase::class, 'package_version_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'package_version_id');
    }

    public function paymentAgreements(): HasMany
    {
        return $this->hasMany(PaymentAgreement::class, 'package_version_id');
    }
}

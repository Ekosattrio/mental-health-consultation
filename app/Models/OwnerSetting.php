<?php

namespace App\Models;

use App\Enums\InitialPaymentMode;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** owner_settings: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class OwnerSetting extends DomainModel
{
    protected $attributes = ['singleton_key' => 1, 'timezone' => 'Asia/Jakarta', 'grace_minutes' => 15, 'selection_window_hours' => 24, 'proof_correction_hours' => 24, 'online_lead_working_minutes' => 180, 'reminder_lead_minutes' => 120, 'payment_hold_hours' => 24, 'initial_payment_mode' => 'FIXED', 'initial_payment_fixed_amount' => 100000, 'initial_payment_basis_points' => 5000, 'row_version' => 1];

    protected $table = 'owner_settings';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'singleton_key' => 'integer',
            'practice_identity' => 'array',
            'grace_minutes' => 'integer',
            'selection_window_hours' => 'integer',
            'proof_correction_hours' => 'integer',
            'online_lead_working_minutes' => 'integer',
            'reminder_lead_minutes' => 'integer',
            'payment_hold_hours' => 'integer',
            'initial_payment_mode' => InitialPaymentMode::class,
            'initial_payment_fixed_amount' => 'integer',
            'initial_payment_basis_points' => 'integer',
        ];
    }

    public function ownerUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }
}

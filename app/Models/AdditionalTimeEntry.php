<?php

namespace App\Models;

use App\Enums\AdditionalTimePriceBasis;
use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** additional_time_entries: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class AdditionalTimeEntry extends ImmutableDomainModel
{
    protected $attributes = ['rate_basis_points' => 2500];

    protected $table = 'additional_time_entries';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'revision' => 'integer',
            'total_additional_minutes' => 'integer',
            'billed_blocks' => 'integer',
            'base_rate_snapshot' => 'integer',
            'rate_basis' => AdditionalTimePriceBasis::class,
            'rate_basis_points' => 'integer',
            'calculated_total' => 'integer',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

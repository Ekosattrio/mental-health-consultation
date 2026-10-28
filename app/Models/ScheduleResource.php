<?php

namespace App\Models;

use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** schedule_resources: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class ScheduleResource extends DomainModel
{
    protected $attributes = ['row_version' => 1];

    protected $table = 'schedule_resources';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'local_date' => 'immutable_date',
        ];
    }

    public function psychologist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }
}

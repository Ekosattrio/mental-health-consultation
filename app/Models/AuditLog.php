<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** audit_logs: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class AuditLog extends ImmutableDomainModel
{
    protected $table = 'audit_logs';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['old_value', 'new_value', 'ip_address'];

    protected function casts(): array
    {
        return [
            'old_value' => 'array',
            'new_value' => 'array',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}

<?php

namespace App\Models;

use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** auth_identities: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class AuthIdentity extends DomainModel
{
    protected $attributes = ['row_version' => 1];

    protected $table = 'auth_identities';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'linked_at' => 'immutable_datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

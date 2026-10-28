<?php

namespace App\Models;

use App\Enums\CmsStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** cms_contents: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class CmsContent extends DomainModel
{
    protected $attributes = ['status' => 'DRAFT', 'row_version' => 1];

    protected $table = 'cms_contents';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version', 'published_guard'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'version' => 'integer',
            'payload' => 'array',
            'status' => CmsStatus::class,
            'published_at' => 'immutable_datetime',
        ];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function consents(): HasMany
    {
        return $this->hasMany(Consent::class, 'cms_content_id');
    }
}

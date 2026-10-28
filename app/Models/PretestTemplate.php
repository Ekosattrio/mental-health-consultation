<?php

namespace App\Models;

use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** pretest_templates: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PretestTemplate extends ImmutableDomainModel
{
    protected $table = 'pretest_templates';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'questions' => 'array',
            'effective_at' => 'immutable_datetime',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function pretestSubmissions(): HasMany
    {
        return $this->hasMany(PretestSubmission::class, 'template_id');
    }
}

<?php

namespace App\Models;

use App\Enums\TutorialAudience;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** tutorial_contents: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class TutorialContent extends DomainModel
{
    protected $attributes = ['is_active' => true, 'row_version' => 1];

    protected $table = 'tutorial_contents';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'role' => TutorialAudience::class,
            'version' => 'integer',
            'steps' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function tutorialProgress(): HasMany
    {
        return $this->hasMany(TutorialProgress::class, 'tutorial_content_id');
    }
}
